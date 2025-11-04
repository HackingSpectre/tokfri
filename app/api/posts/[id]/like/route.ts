import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/index';
import { likes, posts, notifications, userStats } from '@/lib/db/schema';
import { eq, and, sql } from 'drizzle-orm';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await request.json();
    const { id: postId } = await params;

    if (!userId || !postId) {
      return NextResponse.json(
        { error: 'UserId and postId are required' },
        { status: 400 }
      );
    }

    // Check if already liked
    const existingLike = await db
      .select()
      .from(likes)
      .where(and(eq(likes.userId, userId), eq(likes.postId, postId)))
      .limit(1);

    if (existingLike.length > 0) {
      // Unlike
      await db.delete(likes).where(
        and(eq(likes.userId, userId), eq(likes.postId, postId))
      );

      // Decrease post like count
      await db
        .update(posts)
        .set({
          likeCount: sql`${posts.likeCount} - 1`,
        })
        .where(eq(posts.id, postId));

      return NextResponse.json({ 
        success: true, 
        action: 'unliked' 
      });
    } else {
      // Like
      await db.insert(likes).values({
        userId,
        postId,
      });

      // Increase post like count
      await db
        .update(posts)
        .set({
          likeCount: sql`${posts.likeCount} + 1`,
        })
        .where(eq(posts.id, postId));

      // Get post details for notification
      const [post] = await db
        .select({ userId: posts.userId })
        .from(posts)
        .where(eq(posts.id, postId));

      // Create notification if liking someone else's post
      if (post && post.userId !== userId) {
        await db.insert(notifications).values({
          userId: post.userId,
          actorId: userId,
          type: 'like',
          postId: postId,
          message: 'liked your post',
        });

        // Update user stats for post owner
        await db.insert(userStats).values({
          userId: post.userId,
          totalLikesReceived: 1,
        }).onConflictDoUpdate({
          target: userStats.userId,
          set: {
            totalLikesReceived: sql`${userStats.totalLikesReceived} + 1`,
            updatedAt: new Date(),
          },
        });
      }

      return NextResponse.json({ 
        success: true, 
        action: 'liked' 
      });
    }
  } catch (error) {
    console.error('Like post error:', error);
    return NextResponse.json(
      { error: 'Failed to like/unlike post' },
      { status: 500 }
    );
  }
}