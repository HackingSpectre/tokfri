import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/index';
import { posts, hashtags, postHashtags, userStats, users } from '@/lib/db/schema';
import { eq, desc, and, sql } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const { content, userId, mediaUrls = [] } = await request.json();

    if (!content || !userId) {
      return NextResponse.json(
        { error: 'Content and userId are required' },
        { status: 400 }
      );
    }

    if (content.length > 2000) {
      return NextResponse.json(
        { error: 'Content must be less than 2000 characters' },
        { status: 400 }
      );
    }

    // Extract hashtags from content
    const hashtagMatches = content.match(/#[\w\u00c0-\u024f\u1e00-\u1eff]+/gi) || [];
    const extractedHashtags = [...new Set(hashtagMatches.map((tag: string) => tag.toLowerCase()))];

    // Create the post
    const newPostResult = await db.insert(posts).values({
      userId,
      content,
      mediaUrls: mediaUrls.length > 0 ? mediaUrls : null,
    }).returning();
    
    const newPost = newPostResult[0];

    // Process hashtags
    if (extractedHashtags.length > 0) {
      for (const tag of extractedHashtags) {
        // Get or create hashtag
        const hashtagResult = await db.select().from(hashtags).where(eq(hashtags.tag, tag as string));
        let hashtag = hashtagResult[0];
        
        if (!hashtag) {
          const newHashtagResult = await db.insert(hashtags).values({
            tag: tag as string,
            usageCount: 1,
            trendingScore: 1,
            lastUsedAt: new Date(),
          }).returning();
          hashtag = newHashtagResult[0];
        } else {
          // Update existing hashtag
          await db.update(hashtags)
            .set({
              usageCount: sql`${hashtags.usageCount} + 1`,
              trendingScore: sql`${hashtags.trendingScore} + 1`,
              lastUsedAt: new Date(),
            })
            .where(eq(hashtags.id, hashtag.id));
        }

        // Link hashtag to post
        await db.insert(postHashtags).values({
          postId: newPost.id,
          hashtagId: hashtag.id,
        });
      }
    }

    // Update user stats
    await db.insert(userStats).values({
      userId,
      postCount: 1,
    }).onConflictDoUpdate({
      target: userStats.userId,
      set: {
        postCount: sql`${userStats.postCount} + 1`,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({ 
      success: true, 
      post: newPost,
      hashtags: extractedHashtags 
    });
  } catch (error) {
    console.error('Create post error:', error);
    return NextResponse.json(
      { error: 'Failed to create post' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    const userId = searchParams.get('userId');

    // Build base query
    let query = db
      .select({
        id: posts.id,
        content: posts.content,
        mediaUrls: posts.mediaUrls,
        likeCount: posts.likeCount,
        repostCount: posts.repostCount,
        replyCount: posts.replyCount,
        viewCount: posts.viewCount,
        tipAmount: posts.tipAmount,
        createdAt: posts.createdAt,
        updatedAt: posts.updatedAt,
        userId: posts.userId,
        user: {
          id: users.id,
          username: users.username,
          displayName: users.displayName,
          avatarUrl: users.avatarUrl,
          verified: users.verified,
        }
      })
      .from(posts)
      .leftJoin(users, eq(posts.userId, users.id))
      .orderBy(desc(posts.createdAt));

    // Apply filters if needed
    if (userId) {
      const result = await query.where(eq(posts.userId, userId)).limit(limit).offset(offset);
      return NextResponse.json({ 
        posts: result,
        hasMore: result.length === limit 
      });
    }

    const result = await query.limit(limit).offset(offset);

    return NextResponse.json({ 
      posts: result,
      hasMore: result.length === limit 
    });
  } catch (error) {
    console.error('Get posts error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    );
  }
}