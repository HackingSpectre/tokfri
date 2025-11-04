import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/index';
import { follows, users } from '@/lib/db/schema';
import { eq, desc, sql } from 'drizzle-orm';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: userId } = await params;
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Get following - users that this user follows
    const following = await db
      .select({
        id: users.id,
        username: users.username,
        displayName: users.displayName,
        avatarUrl: users.avatarUrl,
        verified: users.verified,
        bio: users.bio,
        followedAt: follows.createdAt,
      })
      .from(follows)
      .innerJoin(users, eq(follows.followingId, users.id))
      .where(eq(follows.followerId, userId))
      .orderBy(desc(follows.createdAt))
      .limit(limit)
      .offset(offset);

    // Get total count
    const [totalCount] = await db
      .select({ count: sql<number>`COUNT(*)::integer` })
      .from(follows)
      .where(eq(follows.followerId, userId));

    return NextResponse.json({
      following,
      pagination: {
        total: totalCount?.count || 0,
        limit,
        offset,
        hasMore: (totalCount?.count || 0) > offset + limit
      }
    });
  } catch (error) {
    console.error('Get following error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch following' },
      { status: 500 }
    );
  }
}