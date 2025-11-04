import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/index';
import { users, userStats } from '@/lib/db/schema';
import { eq, ilike, or, sql, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q')?.trim();
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50);
    const offset = parseInt(searchParams.get('offset') || '0');
    const currentUserId = searchParams.get('userId'); // For determining follow status

    if (!query) {
      // Return trending/popular users when no query
      const popularUsers = await db
        .select({
          id: users.id,
          username: users.username,
          displayName: users.displayName,
          avatarUrl: users.avatarUrl,
          bio: users.bio,
          verified: users.verified,
          createdAt: users.createdAt,
          followerCount: sql<number>`COALESCE(${userStats.followerCount}, 0)`,
          followingCount: sql<number>`COALESCE(${userStats.followingCount}, 0)`,
          postCount: sql<number>`COALESCE(${userStats.postCount}, 0)`,
        })
        .from(users)
        .leftJoin(userStats, eq(users.id, userStats.userId))
        .orderBy(desc(sql`COALESCE(${userStats.followerCount}, 0)`), desc(users.createdAt))
        .limit(limit)
        .offset(offset);

      return NextResponse.json({
        users: popularUsers,
        query: '',
        pagination: {
          limit,
          offset,
          hasMore: popularUsers.length === limit
        }
      });
    }

    if (query.length < 2) {
      return NextResponse.json({
        users: [],
        query,
        pagination: { limit, offset, hasMore: false }
      });
    }

    // Search users by username and display name
    const searchResults = await db
      .select({
        id: users.id,
        username: users.username,
        displayName: users.displayName,
        avatarUrl: users.avatarUrl,
        bio: users.bio,
        verified: users.verified,
        createdAt: users.createdAt,
        followerCount: sql<number>`COALESCE(${userStats.followerCount}, 0)`,
        followingCount: sql<number>`COALESCE(${userStats.followingCount}, 0)`,
        postCount: sql<number>`COALESCE(${userStats.postCount}, 0)`,
        // Relevance scoring for better search results
        relevance: sql<number>`
          CASE 
            WHEN LOWER(${users.username}) = LOWER(${query}) THEN 100
            WHEN LOWER(${users.username}) LIKE LOWER(${query} || '%') THEN 90
            WHEN LOWER(${users.displayName}) = LOWER(${query}) THEN 85
            WHEN LOWER(${users.displayName}) LIKE LOWER(${query} || '%') THEN 80
            WHEN LOWER(${users.username}) LIKE LOWER('%' || ${query} || '%') THEN 70
            WHEN LOWER(${users.displayName}) LIKE LOWER('%' || ${query} || '%') THEN 65
            WHEN LOWER(${users.bio}) LIKE LOWER('%' || ${query} || '%') THEN 50
            ELSE 0
          END
        `,
      })
      .from(users)
      .leftJoin(userStats, eq(users.id, userStats.userId))
      .where(
        or(
          ilike(users.username, `%${query}%`),
          ilike(users.displayName, `%${query}%`),
          ilike(users.bio, `%${query}%`)
        )
      )
      .orderBy(
        desc(sql`
          CASE 
            WHEN LOWER(${users.username}) = LOWER(${query}) THEN 100
            WHEN LOWER(${users.username}) LIKE LOWER(${query} || '%') THEN 90
            WHEN LOWER(${users.displayName}) = LOWER(${query}) THEN 85
            WHEN LOWER(${users.displayName}) LIKE LOWER(${query} || '%') THEN 80
            WHEN LOWER(${users.username}) LIKE LOWER('%' || ${query} || '%') THEN 70
            WHEN LOWER(${users.displayName}) LIKE LOWER('%' || ${query} || '%') THEN 65
            WHEN LOWER(${users.bio}) LIKE LOWER('%' || ${query} || '%') THEN 50
            ELSE 0
          END
        `),
        desc(sql`COALESCE(${userStats.followerCount}, 0)`),
        desc(users.createdAt)
      )
      .limit(limit)
      .offset(offset);

    // If current user is provided, we can add follow status to each result
    // For now, we'll let the client handle follow status via the useFollow hook

    return NextResponse.json({
      users: searchResults.map(user => ({
        id: user.id,
        username: user.username,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl,
        bio: user.bio,
        verified: user.verified,
        createdAt: user.createdAt,
        stats: {
          followerCount: user.followerCount,
          followingCount: user.followingCount,
          postCount: user.postCount,
        },
        relevance: user.relevance
      })),
      query,
      pagination: {
        limit,
        offset,
        hasMore: searchResults.length === limit
      }
    });
  } catch (error) {
    console.error('User search error:', error);
    return NextResponse.json(
      { error: 'Failed to search users' },
      { status: 500 }
    );
  }
}