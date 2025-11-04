import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/index';
import { conversations, conversationParticipants, users, messages } from '@/lib/db/schema';
import { eq, and, or, desc, sql } from 'drizzle-orm';

/**
 * GET /api/conversations - Get user's conversations with last message and unread count
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50);
    const offset = parseInt(searchParams.get('offset') || '0');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Get conversations where user is a participant
    const userConversations = await db
      .select({
        conversation: conversations,
        lastReadAt: conversationParticipants.lastReadAt,
        joinedAt: conversationParticipants.joinedAt,
      })
      .from(conversationParticipants)
      .innerJoin(conversations, eq(conversationParticipants.conversationId, conversations.id))
      .where(
        and(
          eq(conversationParticipants.userId, userId),
          eq(conversationParticipants.isActive, true)
        )
      )
      .orderBy(desc(conversations.lastMessageAt))
      .limit(limit)
      .offset(offset);

    // Get conversation details with participants and last message
    const conversationDetails = await Promise.all(
      userConversations.map(async ({ conversation, lastReadAt, joinedAt }) => {
        // Get other participants (for direct messages, get the other user)
        const participants = await db
          .select({
            user: users,
            role: conversationParticipants.role,
            joinedAt: conversationParticipants.joinedAt,
          })
          .from(conversationParticipants)
          .innerJoin(users, eq(conversationParticipants.userId, users.id))
          .where(
            and(
              eq(conversationParticipants.conversationId, conversation.id),
              eq(conversationParticipants.isActive, true)
            )
          );

        // Get last message
        const [lastMessage] = await db
          .select({
            id: messages.id,
            content: messages.content,
            messageType: messages.messageType,
            senderId: messages.senderId,
            createdAt: messages.createdAt,
            senderUsername: users.username,
            senderDisplayName: users.displayName,
            senderAvatarUrl: users.avatarUrl,
          })
          .from(messages)
          .innerJoin(users, eq(messages.senderId, users.id))
          .where(
            and(
              eq(messages.conversationId, conversation.id),
              eq(messages.isDeleted, false)
            )
          )
          .orderBy(desc(messages.createdAt))
          .limit(1);

        // Count unread messages
        const [unreadCount] = await db
          .select({
            count: sql<number>`COUNT(*)::integer`,
          })
          .from(messages)
          .where(
            and(
              eq(messages.conversationId, conversation.id),
              eq(messages.isDeleted, false),
              lastReadAt ? sql`${messages.createdAt} > ${lastReadAt}` : sql`true`
            )
          );

        // For direct messages, get the other user as the conversation display info
        let displayName = conversation.name;
        let displayImage = conversation.imageUrl;
        let otherUser: typeof participants[0]['user'] | undefined = undefined;

        if (conversation.type === 'direct' && participants.length === 2) {
          otherUser = participants.find(p => p.user.id !== userId)?.user;
          if (otherUser) {
            displayName = otherUser.displayName || otherUser.username;
            displayImage = otherUser.avatarUrl;
          }
        }

        return {
          id: conversation.id,
          type: conversation.type,
          name: displayName,
          description: conversation.description,
          imageUrl: displayImage,
          participants: participants.map(p => ({
            id: p.user.id,
            username: p.user.username,
            displayName: p.user.displayName,
            avatarUrl: p.user.avatarUrl,
            role: p.role,
            joinedAt: p.joinedAt,
          })),
          lastMessage,
          unreadCount: unreadCount?.count || 0,
          lastMessageAt: conversation.lastMessageAt,
          createdAt: conversation.createdAt,
          otherUser, // For direct messages
        };
      })
    );

    return NextResponse.json({
      conversations: conversationDetails,
      pagination: {
        limit,
        offset,
        hasMore: conversationDetails.length === limit,
      },
    });
  } catch (error) {
    console.error('Get conversations error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch conversations' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/conversations - Create a new conversation
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, type = 'direct', participantIds, name, description } = body;

    if (!userId || !participantIds || !Array.isArray(participantIds)) {
      return NextResponse.json(
        { error: 'User ID and participant IDs are required' },
        { status: 400 }
      );
    }

    // For direct messages, check if conversation already exists
    if (type === 'direct' && participantIds.length === 1) {
      const otherUserId = participantIds[0];
      
      // Find existing direct conversation between these two users
      const existingConversation = await db
        .select({ conversationId: conversationParticipants.conversationId })
        .from(conversationParticipants)
        .innerJoin(conversations, eq(conversationParticipants.conversationId, conversations.id))
        .where(
          and(
            eq(conversations.type, 'direct'),
            eq(conversationParticipants.userId, userId)
          )
        )
        .then(async (userConvs) => {
          // For each conversation, check if the other user is also a participant
          for (const conv of userConvs) {
            const [otherParticipant] = await db
              .select()
              .from(conversationParticipants)
              .where(
                and(
                  eq(conversationParticipants.conversationId, conv.conversationId),
                  eq(conversationParticipants.userId, otherUserId)
                )
              );
            
            if (otherParticipant) {
              return conv.conversationId;
            }
          }
          return null;
        });

      if (existingConversation) {
        return NextResponse.json({
          conversationId: existingConversation,
          created: false,
          message: 'Conversation already exists',
        });
      }
    }

    // Create new conversation
    const [conversation] = await db
      .insert(conversations)
      .values({
        type,
        name: type === 'group' ? name : null,
        description: type === 'group' ? description : null,
        createdBy: userId,
      })
      .returning();

    // Add creator as admin/owner
    await db.insert(conversationParticipants).values({
      conversationId: conversation.id,
      userId: userId,
      role: 'admin',
    });

    // Add other participants
    if (participantIds.length > 0) {
      await db.insert(conversationParticipants).values(
        participantIds.map((participantId: string) => ({
          conversationId: conversation.id,
          userId: participantId,
          role: 'member',
        }))
      );
    }

    return NextResponse.json({
      conversationId: conversation.id,
      conversation,
      created: true,
    });
  } catch (error) {
    console.error('Create conversation error:', error);
    return NextResponse.json(
      { error: 'Failed to create conversation' },
      { status: 500 }
    );
  }
}