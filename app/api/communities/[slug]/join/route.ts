import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/index';
import { communities, communityMembers, notifications } from '@/lib/db/schema';
import { eq, and, sql } from 'drizzle-orm';

/**
 * POST /api/communities/[slug]/join - Join/leave a community
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Get community
    const [community] = await db
      .select()
      .from(communities)
      .where(eq(communities.slug, slug));

    if (!community) {
      return NextResponse.json(
        { error: 'Community not found' },
        { status: 404 }
      );
    }

    // Check existing membership
    const [existingMembership] = await db
      .select()
      .from(communityMembers)
      .where(
        and(
          eq(communityMembers.communityId, community.id),
          eq(communityMembers.userId, userId)
        )
      );

    if (existingMembership) {
      if (existingMembership.isActive) {
        // Leave community (set inactive instead of deleting for history)
        await db
          .update(communityMembers)
          .set({
            isActive: false,
          })
          .where(
            and(
              eq(communityMembers.communityId, community.id),
              eq(communityMembers.userId, userId)
            )
          );

        // Decrease member count
        await db
          .update(communities)
          .set({
            memberCount: sql`GREATEST(0, ${communities.memberCount} - 1)`,
          })
          .where(eq(communities.id, community.id));

        return NextResponse.json({
          success: true,
          action: 'left',
          isMember: false,
          memberCount: Math.max(0, (community.memberCount || 0) - 1),
        });
      } else {
        // Rejoin community (reactivate membership)
        await db
          .update(communityMembers)
          .set({
            isActive: true,
            joinedAt: new Date(), // Update join date
          })
          .where(
            and(
              eq(communityMembers.communityId, community.id),
              eq(communityMembers.userId, userId)
            )
          );

        // Increase member count
        await db
          .update(communities)
          .set({
            memberCount: sql`${communities.memberCount} + 1`,
          })
          .where(eq(communities.id, community.id));

        // Notify community owner of new member
        if (community.createdBy !== userId) {
          await db.insert(notifications).values({
            userId: community.createdBy,
            actorId: userId,
            type: 'community_join',
            message: `joined your community "${community.name}"`,
          });
        }

        return NextResponse.json({
          success: true,
          action: 'joined',
          isMember: true,
          memberCount: (community.memberCount || 0) + 1,
          memberRole: 'member',
        });
      }
    } else {
      // Join community (new member)
      await db.insert(communityMembers).values({
        communityId: community.id,
        userId,
        role: 'member',
      });

      // Increase member count
      await db
        .update(communities)
        .set({
          memberCount: sql`${communities.memberCount} + 1`,
        })
        .where(eq(communities.id, community.id));

      // Notify community owner of new member
      if (community.createdBy !== userId) {
        await db.insert(notifications).values({
          userId: community.createdBy,
          actorId: userId,
          type: 'community_join',
          message: `joined your community "${community.name}"`,
        });
      }

      return NextResponse.json({
        success: true,
        action: 'joined',
        isMember: true,
        memberCount: (community.memberCount || 0) + 1,
        memberRole: 'member',
      });
    }
  } catch (error) {
    console.error('Community join/leave error:', error);
    return NextResponse.json(
      { error: 'Failed to join/leave community' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/communities/[slug]/join - Get membership status
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Get community
    const [community] = await db
      .select()
      .from(communities)
      .where(eq(communities.slug, slug));

    if (!community) {
      return NextResponse.json(
        { error: 'Community not found' },
        { status: 404 }
      );
    }

    // Check membership
    const [membership] = await db
      .select({
        role: communityMembers.role,
        joinedAt: communityMembers.joinedAt,
        isActive: communityMembers.isActive,
      })
      .from(communityMembers)
      .where(
        and(
          eq(communityMembers.communityId, community.id),
          eq(communityMembers.userId, userId)
        )
      );

    return NextResponse.json({
      isMember: membership?.isActive || false,
      memberRole: membership?.role || null,
      memberSince: membership?.joinedAt || null,
      memberCount: community.memberCount,
    });
  } catch (error) {
    console.error('Get membership status error:', error);
    return NextResponse.json(
      { error: 'Failed to get membership status' },
      { status: 500 }
    );
  }
}