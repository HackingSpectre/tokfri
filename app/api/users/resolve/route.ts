import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users, userStats } from '@/lib/db/schema';
import { eq, sql } from 'drizzle-orm';

/**
 * Resolve username or address to user profile
 * GET /api/users/resolve?username=example
 * GET /api/users/resolve?address=0x123...
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');
    const address = searchParams.get('address');

    if (!username && !address) {
      return NextResponse.json(
        { error: 'Username or address is required' },
        { status: 400 }
      );
    }

    let result;

    if (username) {
      // Query by username (case-insensitive)
      result = await db
        .select({
          id: users.id,
          username: users.username,
          suiAddress: users.suiAddress,
          oauthProvider: users.oauthProvider,
          displayName: users.displayName,
          avatar: users.avatarUrl,
          bio: users.bio,
          websiteUrl: users.websiteUrl,
          verified: users.verified,
          createdAt: users.createdAt,
          lastLoginAt: users.lastLoginAt,
          followerCount: userStats.followerCount,
          followingCount: userStats.followingCount,
          postCount: userStats.postCount,
          totalTipsReceived: userStats.totalTipsReceived,
        })
        .from(users)
        .leftJoin(userStats, eq(users.id, userStats.userId))
        .where(sql`LOWER(${users.username}) = LOWER(${username})`)
        .limit(1);
    } else {
      // Query by Sui address
      result = await db
        .select({
          id: users.id,
          username: users.username,
          suiAddress: users.suiAddress,
          oauthProvider: users.oauthProvider,
          displayName: users.displayName,
          avatar: users.avatarUrl,
          bio: users.bio,
          websiteUrl: users.websiteUrl,
          verified: users.verified,
          createdAt: users.createdAt,
          lastLoginAt: users.lastLoginAt,
          followerCount: userStats.followerCount,
          followingCount: userStats.followingCount,
          postCount: userStats.postCount,
          totalTipsReceived: userStats.totalTipsReceived,
        })
        .from(users)
        .leftJoin(userStats, eq(users.id, userStats.userId))
        .where(eq(users.suiAddress, address!))
        .limit(1);

      // Update last login timestamp
      if (result.length > 0) {
        await db
          .update(users)
          .set({ lastLoginAt: new Date() })
          .where(eq(users.suiAddress, address!));
      }
    }

    if (result.length === 0) {
      return NextResponse.json(
        { user: null },
        { status: 404 }
      );
    }

    return NextResponse.json({ user: result[0] });
  } catch (error) {
    console.error('Resolve user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
