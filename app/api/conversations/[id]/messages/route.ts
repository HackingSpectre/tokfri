import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/index';
import { messages, conversations, conversationParticipants, users, messageReads } from '@/lib/db/schema';
import { eq, and, desc, sql } from 'drizzle-orm';

// Global Socket.io types
declare global {
  var socketHelpers: {
    sendMessage: (conversationId: string, message: any) => void;
    sendNotification: (userId: string, notification: any) => void;
    updatePostInteraction: (postId: string, type: string, data: any) => void;
    isUserOnline: (userId: string) => boolean;
    getOnlineUsersCount: () => number;
  } | undefined;
}

/**
 * GET /api/conversations/[id]/messages - Get messages from a conversation
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: conversationId } = await params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Verify user is participant in this conversation
    const [participant] = await db
      .select()
      .from(conversationParticipants)
      .where(
        and(
          eq(conversationParticipants.conversationId, conversationId),
          eq(conversationParticipants.userId, userId),
          eq(conversationParticipants.isActive, true)
        )
      );

    if (!participant) {
      return NextResponse.json(
        { error: 'Not authorized to view this conversation' },
        { status: 403 }
      );
    }

    // Get messages with sender information
    const conversationMessages = await db
      .select({
        id: messages.id,
        content: messages.content,
        messageType: messages.messageType,
        mediaUrls: messages.mediaUrls,
        senderId: messages.senderId,
        replyToId: messages.replyToId,
        isEdited: messages.isEdited,
        isDeleted: messages.isDeleted,
        createdAt: messages.createdAt,
        updatedAt: messages.updatedAt,
        sender: {
          id: users.id,
          username: users.username,
          displayName: users.displayName,
          avatarUrl: users.avatarUrl,
        },
      })
      .from(messages)
      .innerJoin(users, eq(messages.senderId, users.id))
      .where(
        and(
          eq(messages.conversationId, conversationId),
          eq(messages.isDeleted, false)
        )
      )
      .orderBy(desc(messages.createdAt))
      .limit(limit)
      .offset(offset);

    // Get reply-to messages for context
    const replyToIds = conversationMessages
      .map(m => m.replyToId)
      .filter(Boolean) as string[];

    let replyToMessages: any[] = [];
    if (replyToIds.length > 0) {
      replyToMessages = await db
        .select({
          id: messages.id,
          content: messages.content,
          senderId: messages.senderId,
          createdAt: messages.createdAt,
          sender: {
            id: users.id,
            username: users.username,
            displayName: users.displayName,
          },
        })
        .from(messages)
        .innerJoin(users, eq(messages.senderId, users.id))
        .where(sql`${messages.id} = ANY(${replyToIds})`);
    }

    // Map reply-to messages
    const replyToMap = new Map(replyToMessages.map(m => [m.id, m]));

    // Add reply-to context to messages
    const messagesWithReplies = conversationMessages.map(message => ({
      ...message,
      replyTo: message.replyToId ? replyToMap.get(message.replyToId) : null,
    }));

    // Update last read timestamp for the user
    await db
      .insert(conversationParticipants)
      .values({
        conversationId,
        userId,
        lastReadAt: new Date(),
        role: 'member',
      })
      .onConflictDoUpdate({
        target: [conversationParticipants.conversationId, conversationParticipants.userId],
        set: {
          lastReadAt: new Date(),
        },
      });

    return NextResponse.json({
      messages: messagesWithReplies.reverse(), // Reverse to show oldest first
      pagination: {
        limit,
        offset,
        hasMore: conversationMessages.length === limit,
      },
    });
  } catch (error) {
    console.error('Get messages error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/conversations/[id]/messages - Send a new message
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: conversationId } = await params;
    const body = await request.json();
    const { userId, content, messageType = 'text', mediaUrls = [], replyToId } = body;

    // Validate: User ID is required
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Validate: Must have either content or media
    const hasContent = content && content.trim().length > 0;
    const hasMedia = Array.isArray(mediaUrls) && mediaUrls.length > 0;
    
    if (!hasContent && !hasMedia) {
      return NextResponse.json(
        { error: 'Message must have either text content or media' },
        { status: 400 }
      );
    }

    // Verify user is participant in this conversation
    const [participant] = await db
      .select()
      .from(conversationParticipants)
      .where(
        and(
          eq(conversationParticipants.conversationId, conversationId),
          eq(conversationParticipants.userId, userId),
          eq(conversationParticipants.isActive, true)
        )
      );

    if (!participant) {
      return NextResponse.json(
        { error: 'Not authorized to send messages to this conversation' },
        { status: 403 }
      );
    }

    // If replying to a message, verify it exists in this conversation
    if (replyToId) {
      const [replyToMessage] = await db
        .select()
        .from(messages)
        .where(
          and(
            eq(messages.id, replyToId),
            eq(messages.conversationId, conversationId),
            eq(messages.isDeleted, false)
          )
        );

      if (!replyToMessage) {
        return NextResponse.json(
          { error: 'Reply message not found' },
          { status: 400 }
        );
      }
    }

    // Get other participants to determine recipient_id (for backward compatibility)
    const otherParticipants = await db
      .select({
        userId: conversationParticipants.userId,
      })
      .from(conversationParticipants)
      .where(
        and(
          eq(conversationParticipants.conversationId, conversationId),
          eq(conversationParticipants.isActive, true),
          sql`${conversationParticipants.userId} != ${userId}`
        )
      );

    // For direct messages, use the other participant as recipient
    // For group messages, we'll use the first other participant (legacy support)
    const recipientId = otherParticipants.length > 0 ? otherParticipants[0].userId : userId;

    // Create message
    const messageResult = await db
      .insert(messages)
      .values({
        conversationId,
        senderId: userId,
        recipientId, // Add the recipient ID for backward compatibility
        content: content ? content.trim() : '[Image]', // Use placeholder for media-only messages
        messageType,
        mediaUrls: mediaUrls.length > 0 ? mediaUrls : null,
        replyToId,
      })
      .returning();
    
    const message = messageResult[0];

    // Update conversation's lastMessageAt
    await db
      .update(conversations)
      .set({
        lastMessageAt: message.createdAt,
        updatedAt: new Date(),
      })
      .where(eq(conversations.id, conversationId));

    // Get sender information for response
    const [sender] = await db
      .select({
        id: users.id,
        username: users.username,
        displayName: users.displayName,
        avatarUrl: users.avatarUrl,
      })
      .from(users)
      .where(eq(users.id, userId));

    // Get reply-to message if exists
    let replyTo: any = null;
    if (replyToId) {
      const replyToMessageResult = await db
        .select({
          id: messages.id,
          content: messages.content,
          senderId: messages.senderId,
          createdAt: messages.createdAt,
          sender: {
            id: users.id,
            username: users.username,
            displayName: users.displayName,
          },
        })
        .from(messages)
        .innerJoin(users, eq(messages.senderId, users.id))
        .where(eq(messages.id, replyToId));

      const replyToMessage = replyToMessageResult[0];
      if (replyToMessage) {
        replyTo = replyToMessage;
      }
    }

    const responseMessage = {
      ...message,
      sender,
      replyTo,
    };

    // Emit real-time event via Socket.io
    if (global.socketHelpers) {
      global.socketHelpers.sendMessage(conversationId, responseMessage);
    }
    
    return NextResponse.json({
      message: responseMessage,
      success: true,
    });
  } catch (error) {
    console.error('Send message error:', error);
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
}