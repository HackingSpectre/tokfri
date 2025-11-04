import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/index';
import { notifications, users, posts } from '@/lib/db/schema';
import { eq, and, desc, sql } from 'drizzle-orm';

/**
 * GET /api/notifications - Get user notifications
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50);
    const offset = parseInt(searchParams.get('offset') || '0');
    const unreadOnly = searchParams.get('unreadOnly') === 'true';

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    let whereConditions: any = eq(notifications.userId, userId);
    
    if (unreadOnly) {
      const unreadCondition = eq(notifications.read, false);
      whereConditions = and(whereConditions, unreadCondition) || whereConditions;
    }

    // Get notifications with actor and post information
    const userNotifications = await db
      .select({
        id: notifications.id,
        type: notifications.type,
        message: notifications.message,
        read: notifications.read,
        createdAt: notifications.createdAt,
        actor: {
          id: users.id,
          username: users.username,
          displayName: users.displayName,
          avatarUrl: users.avatarUrl,
          verified: users.verified,
        },
        post: {
          id: posts.id,
          content: posts.content,
          createdAt: posts.createdAt,
        },
      })
      .from(notifications)
      .leftJoin(users, eq(notifications.actorId, users.id))
      .leftJoin(posts, eq(notifications.postId, posts.id))
      .where(whereConditions)
      .orderBy(desc(notifications.createdAt))
      .limit(limit)
      .offset(offset);

    // Get unread count
    const [unreadCount] = await db
      .select({
        count: sql<number>`COUNT(*)::integer`,
      })
      .from(notifications)
      .where(
        and(
          eq(notifications.userId, userId),
          eq(notifications.read, false)
        )
      );

    return NextResponse.json({
      notifications: userNotifications,
      unreadCount: unreadCount?.count || 0,
      pagination: {
        limit,
        offset,
        hasMore: userNotifications.length === limit,
      },
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/notifications - Mark notifications as read
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, notificationIds, markAllAsRead = false } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    if (markAllAsRead) {
      // Mark all notifications as read for this user
      await db
        .update(notifications)
        .set({ read: true })
        .where(
          and(
            eq(notifications.userId, userId),
            eq(notifications.read, false)
          )
        );
    } else if (notificationIds && Array.isArray(notificationIds)) {
      // Mark specific notifications as read
      await db
        .update(notifications)
        .set({ read: true })
        .where(
          and(
            eq(notifications.userId, userId),
            sql`${notifications.id} = ANY(${notificationIds})`
          )
        );
    } else {
      return NextResponse.json(
        { error: 'Either notificationIds array or markAllAsRead=true is required' },
        { status: 400 }
      );
    }

    // Get updated unread count
    const [unreadCount] = await db
      .select({
        count: sql<number>`COUNT(*)::integer`,
      })
      .from(notifications)
      .where(
        and(
          eq(notifications.userId, userId),
          eq(notifications.read, false)
        )
      );

    return NextResponse.json({
      success: true,
      unreadCount: unreadCount?.count || 0,
    });
  } catch (error) {
    console.error('Mark notifications read error:', error);
    return NextResponse.json(
      { error: 'Failed to mark notifications as read' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/notifications - Delete notifications
 */
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, notificationIds } = body;

    if (!userId || !notificationIds || !Array.isArray(notificationIds)) {
      return NextResponse.json(
        { error: 'User ID and notification IDs are required' },
        { status: 400 }
      );
    }

    // Delete notifications (only user's own notifications)
    await db
      .delete(notifications)
      .where(
        and(
          eq(notifications.userId, userId),
          sql`${notifications.id} = ANY(${notificationIds})`
        )
      );

    return NextResponse.json({
      success: true,
      deletedCount: notificationIds.length,
    });
  } catch (error) {
    console.error('Delete notifications error:', error);
    return NextResponse.json(
      { error: 'Failed to delete notifications' },
      { status: 500 }
    );
  }
}