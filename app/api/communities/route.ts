import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/index';
import { communities, communityMembers, users, communityPosts, posts } from '@/lib/db/schema';
import { eq, and, desc, sql, ilike, or } from 'drizzle-orm';

/**
 * GET /api/communities - Get communities with optional search
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const userId = searchParams.get('userId');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50);
    const offset = parseInt(searchParams.get('offset') || '0');
    const filter = searchParams.get('filter'); // 'all', 'joined', 'created'

    // Build the base query
    let communityList;
    
    if (filter === 'joined' && userId) {
      // Special query for joined communities
      let joinedQuery: any = db
        .select({
          id: communities.id,
          name: communities.name,
          slug: communities.slug,
          description: communities.description,
          avatarUrl: communities.avatarUrl,
          bannerUrl: communities.bannerUrl,
          isPrivate: communities.isPrivate,
          memberCount: communities.memberCount,
          postCount: communities.postCount,
          createdAt: communities.createdAt,
          createdBy: communities.createdBy,
          creator: {
            id: users.id,
            username: users.username,
            displayName: users.displayName,
            avatarUrl: users.avatarUrl,
          },
        })
        .from(communities)
        .innerJoin(users, eq(communities.createdBy, users.id))
        .innerJoin(communityMembers, eq(communityMembers.communityId, communities.id));

      // Build where conditions for joined communities
      let joinedWhereConditions: any[] = [
        eq(communityMembers.userId, userId),
        eq(communityMembers.isActive, true)
      ];

      if (search) {
        joinedWhereConditions.push(
          or(
            ilike(communities.name, `%${search}%`),
            ilike(communities.description, `%${search}%`)
          )
        );
      }

      joinedQuery = joinedQuery.where(and(...joinedWhereConditions));
      
      communityList = await joinedQuery
        .orderBy(desc(communities.memberCount), desc(communities.createdAt))
        .limit(limit)
        .offset(offset);
    } else {
      // Standard query for all communities or created communities
      let standardQuery: any = db
        .select({
          id: communities.id,
          name: communities.name,
          slug: communities.slug,
          description: communities.description,
          avatarUrl: communities.avatarUrl,
          bannerUrl: communities.bannerUrl,
          isPrivate: communities.isPrivate,
          memberCount: communities.memberCount,
          postCount: communities.postCount,
          createdAt: communities.createdAt,
          createdBy: communities.createdBy,
          creator: {
            id: users.id,
            username: users.username,
            displayName: users.displayName,
            avatarUrl: users.avatarUrl,
          },
        })
        .from(communities)
        .innerJoin(users, eq(communities.createdBy, users.id));

      // Build where conditions for standard query
      let standardWhereConditions: any[] = [];

      if (search) {
        standardWhereConditions.push(
          or(
            ilike(communities.name, `%${search}%`),
            ilike(communities.description, `%${search}%`)
          )
        );
      }

      if (filter === 'created' && userId) {
        standardWhereConditions.push(eq(communities.createdBy, userId));
      }

      if (standardWhereConditions.length > 0) {
        standardQuery = standardQuery.where(and(...standardWhereConditions));
      }
      
      communityList = await standardQuery
        .orderBy(desc(communities.memberCount), desc(communities.createdAt))
        .limit(limit)
        .offset(offset);
    }

    // If user is provided, check membership status for each community
    let communitiesWithMembership = communityList;
    if (userId) {
      communitiesWithMembership = await Promise.all(
        communityList.map(async (community) => {
          const [membership] = await db
            .select({
              role: communityMembers.role,
              joinedAt: communityMembers.joinedAt,
            })
            .from(communityMembers)
            .where(
              and(
                eq(communityMembers.communityId, community.id),
                eq(communityMembers.userId, userId),
                eq(communityMembers.isActive, true)
              )
            );

          return {
            ...community,
            isMember: !!membership,
            memberRole: membership?.role || null,
            memberSince: membership?.joinedAt || null,
          };
        })
      );
    }

    return NextResponse.json({
      communities: communitiesWithMembership,
      pagination: {
        limit,
        offset,
        hasMore: communityList.length === limit,
      },
    });
  } catch (error) {
    console.error('Get communities error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch communities' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/communities - Create a new community
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, name, slug, description, isPrivate = false, rules = [], tags = [] } = body;

    if (!userId || !name?.trim() || !slug?.trim()) {
      return NextResponse.json(
        { error: 'User ID, name, and slug are required' },
        { status: 400 }
      );
    }

    // Validate slug format (lowercase, alphanumeric, hyphens only)
    const slugRegex = /^[a-z0-9-]+$/;
    if (!slugRegex.test(slug)) {
      return NextResponse.json(
        { error: 'Slug must contain only lowercase letters, numbers, and hyphens' },
        { status: 400 }
      );
    }

    // Check if slug already exists
    const [existingCommunity] = await db
      .select({ id: communities.id })
      .from(communities)
      .where(eq(communities.slug, slug));

    if (existingCommunity) {
      return NextResponse.json(
        { error: 'A community with this slug already exists' },
        { status: 409 }
      );
    }

    // Create community
    const [community] = await db
      .insert(communities)
      .values({
        name: name.trim(),
        slug: slug.trim(),
        description: description?.trim() || null,
        isPrivate,
        createdBy: userId,
        rules: rules.length > 0 ? rules : null,
        tags: tags.length > 0 ? tags : null,
        memberCount: 1, // Creator is first member
      })
      .returning();

    // Add creator as owner
    await db.insert(communityMembers).values({
      communityId: community.id,
      userId,
      role: 'owner',
    });

    // Get creator info for response
    const [creator] = await db
      .select({
        id: users.id,
        username: users.username,
        displayName: users.displayName,
        avatarUrl: users.avatarUrl,
      })
      .from(users)
      .where(eq(users.id, userId));

    return NextResponse.json({
      community: {
        ...community,
        creator,
        isMember: true,
        memberRole: 'owner',
        memberSince: new Date(),
      },
      success: true,
    });
  } catch (error) {
    console.error('Create community error:', error);
    return NextResponse.json(
      { error: 'Failed to create community' },
      { status: 500 }
    );
  }
}