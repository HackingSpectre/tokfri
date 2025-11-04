import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users, userStats } from '@/lib/db/schema';
import { eq, sql } from 'drizzle-orm';

/**
 * Register a new user with username
 * POST /api/users/register
 */
export async function POST(request: NextRequest) {
  try {
    const { username, suiAddress, oauthProvider, oauthSub, displayName, avatarUrl } = await request.json();

    // Validate required fields
    if (!username || !suiAddress || !oauthProvider || !oauthSub) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate username format
    const usernameRegex = /^[a-zA-Z0-9_]{3,30}$/;
    if (!usernameRegex.test(username)) {
      return NextResponse.json(
        { error: 'Invalid username format' },
        { status: 400 }
      );
    }

    // Check if username already exists (case-insensitive)
    const existingUsername = await db
      .select({ id: users.id })
      .from(users)
      .where(sql`LOWER(${users.username}) = LOWER(${username})`)
      .limit(1);

    if (existingUsername.length > 0) {
      return NextResponse.json(
        { error: 'Username already taken' },
        { status: 409 }
      );
    }

    // Check if Sui address already exists
    const existingAddress = await db
      .select({ id: users.id, username: users.username })
      .from(users)
      .where(eq(users.suiAddress, suiAddress))
      .limit(1);

    if (existingAddress.length > 0) {
      return NextResponse.json(
        { error: 'Sui address already registered' },
        { status: 409 }
      );
    }

    // Insert new user
    const [newUser] = await db
      .insert(users)
      .values({
        username,
        suiAddress,
        oauthProvider,
        oauthSub,
        displayName: displayName || username,
        avatarUrl,
        lastLoginAt: new Date(),
      })
      .returning();

    // Initialize user stats
    await db.insert(userStats).values({ userId: newUser.id });

    return NextResponse.json({ 
      success: true, 
      user: {
        id: newUser.id,
        username: newUser.username,
        suiAddress: newUser.suiAddress,
        oauthProvider: newUser.oauthProvider,
        displayName: newUser.displayName,
        avatar: newUser.avatarUrl,
        createdAt: newUser.createdAt,
      }
    }, { status: 201 });

  } catch (error: any) {
    console.error('Register user error:', error);

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
