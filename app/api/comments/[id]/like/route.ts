import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/index';
import { commentLikes, comments, notifications, users } from '@/lib/db/schema';
import { eq, and, sql } from 'drizzle-orm';

/**
 * POST /api/comments/[id]/like - Like/unlike a comment
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: commentId } = await params;
    const { userId } = await request.json();

    if (!userId || !commentId) {
      return NextResponse.json(
        { error: 'User ID and comment ID are required' },
        { status: 400 }
      );
    }

    // Verify comment exists
    const [comment] = await db
      .select({
        id: comments.id,
        userId: comments.userId,
        postId: comments.postId,
        likeCount: comments.likeCount,
      })
      .from(comments)
      .where(eq(comments.id, commentId));

    if (!comment) {
      return NextResponse.json(
        { error: 'Comment not found' },
        { status: 404 }
      );
    }

    // Check if already liked
    const [existingLike] = await db
      .select()
      .from(commentLikes)
      .where(
        and(
          eq(commentLikes.commentId, commentId),
          eq(commentLikes.userId, userId)
        )
      );

    if (existingLike) {
      // Unlike - remove like
      await db
        .delete(commentLikes)
        .where(
          and(
            eq(commentLikes.commentId, commentId),
            eq(commentLikes.userId, userId)
          )
        );

      // Decrease like count
      await db
        .update(comments)
        .set({
          likeCount: sql`GREATEST(0, ${comments.likeCount} - 1)`,
        })
        .where(eq(comments.id, commentId));

      return NextResponse.json({
        success: true,
        action: 'unliked',
        isLiked: false,
        likeCount: Math.max(0, comment.likeCount - 1),
      });
    } else {
      // Like - add like
      await db.insert(commentLikes).values({
        commentId,
        userId,
      });

      // Increase like count
      await db
        .update(comments)
        .set({
          likeCount: sql`${comments.likeCount} + 1`,
        })
        .where(eq(comments.id, commentId));

      // Create notification for comment owner (if not liking own comment)
      if (comment.userId !== userId) {
        await db.insert(notifications).values({
          userId: comment.userId,
          actorId: userId,
          type: 'comment_like',
          postId: comment.postId,
          message: 'liked your comment',
        });
      }

      return NextResponse.json({
        success: true,
        action: 'liked',
        isLiked: true,
        likeCount: comment.likeCount + 1,
      });
    }
  } catch (error) {
    console.error('Comment like error:', error);
    return NextResponse.json(
      { error: 'Failed to like/unlike comment' },
      { status: 500 }
    );
  }
}