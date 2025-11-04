import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/index';
import { follows, users, userStats } from '@/lib/db/schema';
import { eq, and, sql } from 'drizzle-orm';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: targetUserId } = await params;
    
    // Get current user from request (you might need to implement auth middleware)
    // For now, we'll get it from request body or headers
    const body = await request.json();
    const currentUserId = body.userId || body.currentUserId;

    if (!currentUserId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    if (!targetUserId) {
      return NextResponse.json(
        { error: 'Target user ID is required' },
        { status: 400 }
      );
    }

    if (currentUserId === targetUserId) {
      return NextResponse.json(
        { error: 'Cannot follow yourself' },
        { status: 400 }
      );
    }

    // Check if target user exists
    const [targetUser] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.id, targetUserId))
      .limit(1);

    if (!targetUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if already following
    const [existingFollow] = await db
      .select()
      .from(follows)
      .where(and(
        eq(follows.followerId, currentUserId),
        eq(follows.followingId, targetUserId)
      ))
      .limit(1);

    if (existingFollow) {
      // Unfollow
      await db
        .delete(follows)
        .where(and(
          eq(follows.followerId, currentUserId),
          eq(follows.followingId, targetUserId)
        ));

      // Update user stats for both users
      await Promise.all([
        // Decrease follower count for target user
        db.insert(userStats).values({
          userId: targetUserId,
          followerCount: 0,
        }).onConflictDoUpdate({
          target: userStats.userId,
          set: {
            followerCount: sql`GREATEST(0, ${userStats.followerCount} - 1)`,
            updatedAt: new Date(),
          },
        }),
        
        // Decrease following count for current user
        db.insert(userStats).values({
          userId: currentUserId,
          followingCount: 0,
        }).onConflictDoUpdate({
          target: userStats.userId,
          set: {
            followingCount: sql`GREATEST(0, ${userStats.followingCount} - 1)`,
            updatedAt: new Date(),
          },
        })
      ]);

      // Get updated follower count
      const [updatedStats] = await db
        .select({ followerCount: userStats.followerCount })
        .from(userStats)
        .where(eq(userStats.userId, targetUserId))
        .limit(1);

      return NextResponse.json({
        success: true,
        isFollowing: false,
        action: 'unfollowed',
        followerCount: updatedStats?.followerCount || 0
      });
    } else {
      // Follow
      await db.insert(follows).values({
        followerId: currentUserId,
        followingId: targetUserId,
      });

      // Update user stats for both users
      await Promise.all([
        // Increase follower count for target user
        db.insert(userStats).values({
          userId: targetUserId,
          followerCount: 1,
        }).onConflictDoUpdate({
          target: userStats.userId,
          set: {
            followerCount: sql`${userStats.followerCount} + 1`,
            updatedAt: new Date(),
          },
        }),
        
        // Increase following count for current user
        db.insert(userStats).values({
          userId: currentUserId,
          followingCount: 1,
        }).onConflictDoUpdate({
          target: userStats.userId,
          set: {
            followingCount: sql`${userStats.followingCount} + 1`,
            updatedAt: new Date(),
          },
        })
      ]);

      // Get updated follower count
      const [updatedStats] = await db
        .select({ followerCount: userStats.followerCount })
        .from(userStats)
        .where(eq(userStats.userId, targetUserId))
        .limit(1);

      return NextResponse.json({
        success: true,
        isFollowing: true,
        action: 'followed',
        followerCount: updatedStats?.followerCount || 1
      });
    }
  } catch (error) {
    console.error('Follow/unfollow error:', error);
    return NextResponse.json(
      { error: 'Failed to update follow status' },
      { status: 500 }
    );
  }
}

// Get follow status between two users
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: targetUserId } = await params;
    const { searchParams } = new URL(request.url);
    const currentUserId = searchParams.get('userId');

    if (!currentUserId) {
      return NextResponse.json(
        { error: 'Current user ID is required' },
        { status: 400 }
      );
    }

    // Check if following
    const [followRelation] = await db
      .select()
      .from(follows)
      .where(and(
        eq(follows.followerId, currentUserId),
        eq(follows.followingId, targetUserId)
      ))
      .limit(1);

    // Get follower count
    const [userStatRecord] = await db
      .select({ followerCount: userStats.followerCount })
      .from(userStats)
      .where(eq(userStats.userId, targetUserId))
      .limit(1);

    return NextResponse.json({
      isFollowing: !!followRelation,
      followerCount: userStatRecord?.followerCount || 0
    });
  } catch (error) {
    console.error('Get follow status error:', error);
    return NextResponse.json(
      { error: 'Failed to get follow status' },
      { status: 500 }
    );
  }
}