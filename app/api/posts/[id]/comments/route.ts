import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/index';
import { comments, users, posts, commentLikes, notifications } from '@/lib/db/schema';
import { eq, and, desc, sql, isNull } from 'drizzle-orm';

/**
 * GET /api/posts/[id]/comments - Get comments for a post
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: postId } = await params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId'); // For like status
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');

    // Get top-level comments (depth 0) with user info
    const topLevelComments = await db
      .select({
        id: comments.id,
        content: comments.content,
        likeCount: comments.likeCount,
        replyCount: comments.replyCount,
        depth: comments.depth,
        createdAt: comments.createdAt,
        updatedAt: comments.updatedAt,
        user: {
          id: users.id,
          username: users.username,
          displayName: users.displayName,
          avatarUrl: users.avatarUrl,
          verified: users.verified,
        },
      })
      .from(comments)
      .innerJoin(users, eq(comments.userId, users.id))
      .where(
        and(
          eq(comments.postId, postId),
          eq(comments.depth, 0),
          isNull(comments.parentCommentId)
        )
      )
      .orderBy(desc(comments.createdAt))
      .limit(limit)
      .offset(offset);

    // Get replies for each top-level comment (up to depth 2)
    const commentsWithReplies = await Promise.all(
      topLevelComments.map(async (comment) => {
        // Get first-level replies (depth 1)
        const firstLevelReplies = await db
          .select({
            id: comments.id,
            content: comments.content,
            likeCount: comments.likeCount,
            replyCount: comments.replyCount,
            depth: comments.depth,
            parentCommentId: comments.parentCommentId,
            createdAt: comments.createdAt,
            updatedAt: comments.updatedAt,
            user: {
              id: users.id,
              username: users.username,
              displayName: users.displayName,
              avatarUrl: users.avatarUrl,
              verified: users.verified,
            },
          })
          .from(comments)
          .innerJoin(users, eq(comments.userId, users.id))
          .where(
            and(
              eq(comments.postId, postId),
              eq(comments.parentCommentId, comment.id),
              eq(comments.depth, 1)
            )
          )
          .orderBy(comments.createdAt)
          .limit(10); // Limit replies shown initially

        // Get second-level replies (depth 2) for first-level replies
        const repliesWithNestedReplies = await Promise.all(
          firstLevelReplies.map(async (reply) => {
            const secondLevelReplies = await db
              .select({
                id: comments.id,
                content: comments.content,
                likeCount: comments.likeCount,
                replyCount: comments.replyCount,
                depth: comments.depth,
                parentCommentId: comments.parentCommentId,
                createdAt: comments.createdAt,
                updatedAt: comments.updatedAt,
                user: {
                  id: users.id,
                  username: users.username,
                  displayName: users.displayName,
                  avatarUrl: users.avatarUrl,
                  verified: users.verified,
                },
              })
              .from(comments)
              .innerJoin(users, eq(comments.userId, users.id))
              .where(
                and(
                  eq(comments.postId, postId),
                  eq(comments.parentCommentId, reply.id),
                  eq(comments.depth, 2)
                )
              )
              .orderBy(comments.createdAt)
              .limit(5); // Limit nested replies

            // Check if user liked this reply
            let isLiked = false;
            if (userId) {
              const [likeRecord] = await db
                .select()
                .from(commentLikes)
                .where(
                  and(
                    eq(commentLikes.commentId, reply.id),
                    eq(commentLikes.userId, userId)
                  )
                );
              isLiked = !!likeRecord;
            }

            return {
              ...reply,
              isLiked,
              replies: secondLevelReplies.map(nestedReply => ({
                ...nestedReply,
                isLiked: false, // TODO: Check nested reply likes if needed
                replies: [], // Max depth reached
              })),
            };
          })
        );

        // Check if user liked this top-level comment
        let isLiked = false;
        if (userId) {
          const [likeRecord] = await db
            .select()
            .from(commentLikes)
            .where(
              and(
                eq(commentLikes.commentId, comment.id),
                eq(commentLikes.userId, userId)
              )
            );
          isLiked = !!likeRecord;
        }

        return {
          ...comment,
          isLiked,
          replies: repliesWithNestedReplies,
        };
      })
    );

    return NextResponse.json({
      comments: commentsWithReplies,
      pagination: {
        limit,
        offset,
        hasMore: topLevelComments.length === limit,
      },
    });
  } catch (error) {
    console.error('Get comments error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/posts/[id]/comments - Create a new comment
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: postId } = await params;
    const body = await request.json();
    const { userId, content, parentCommentId } = body;

    if (!userId || !content?.trim()) {
      return NextResponse.json(
        { error: 'User ID and content are required' },
        { status: 400 }
      );
    }

    // Verify post exists
    const [post] = await db
      .select({ userId: posts.userId })
      .from(posts)
      .where(eq(posts.id, postId));

    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    let depth = 0;
    let parentComment: any = null;

    // If replying to a comment, verify it exists and check depth
    if (parentCommentId) {
      const parentCommentResult = await db
        .select()
        .from(comments)
        .where(
          and(
            eq(comments.id, parentCommentId),
            eq(comments.postId, postId)
          )
        );
      
      parentComment = parentCommentResult[0] || null;

      if (!parentComment) {
        return NextResponse.json(
          { error: 'Parent comment not found' },
          { status: 400 }
        );
      }

      depth = parentComment.depth + 1;

      // Enforce max depth of 2 (0: top-level, 1: first reply, 2: second reply)
      if (depth > 2) {
        return NextResponse.json(
          { error: 'Maximum comment depth reached' },
          { status: 400 }
        );
      }
    }

    // Create comment
    const commentResult = await db
      .insert(comments)
      .values({
        postId,
        userId,
        parentCommentId,
        content: content.trim(),
        depth,
      })
      .returning();
    
    const comment = commentResult[0];

    // Update reply count for parent comment
    if (parentCommentId) {
      await db
        .update(comments)
        .set({
          replyCount: sql`${comments.replyCount} + 1`,
        })
        .where(eq(comments.id, parentCommentId));
    }

    // Update post reply count
    await db
      .update(posts)
      .set({
        replyCount: sql`${posts.replyCount} + 1`,
      })
      .where(eq(posts.id, postId));

    // Get user info for response
    const [user] = await db
      .select({
        id: users.id,
        username: users.username,
        displayName: users.displayName,
        avatarUrl: users.avatarUrl,
        verified: users.verified,
      })
      .from(users)
      .where(eq(users.id, userId));

    // Create notification for post owner (if not commenting on own post)
    if (post.userId !== userId) {
      await db.insert(notifications).values({
        userId: post.userId,
        actorId: userId,
        type: 'comment',
        postId: postId,
        message: `commented on your post`,
      });
    }

    // Create notification for parent comment owner (if replying and not own comment)
    if (parentComment && parentComment.userId !== userId && parentComment.userId !== post.userId) {
      await db.insert(notifications).values({
        userId: parentComment.userId,
        actorId: userId,
        type: 'reply',
        postId: postId,
        message: `replied to your comment`,
      });
    }

    const responseComment = {
      ...comment,
      user,
      isLiked: false,
      replies: [],
    };

    return NextResponse.json({
      comment: responseComment,
      success: true,
    });
  } catch (error) {
    console.error('Create comment error:', error);
    return NextResponse.json(
      { error: 'Failed to create comment' },
      { status: 500 }
    );
  }
}