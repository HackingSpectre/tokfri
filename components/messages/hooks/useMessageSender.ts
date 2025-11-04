import { useState, useCallback } from 'react';
import { Message, User } from '../types';

interface SendMessageParams {
  conversationId: string;
  user: User;
  content: string;
  mediaUrls: string[];
  onSuccess: (tempId: string, message: Message) => void;
  onError: (tempId: string) => void;
  onUpdateConversation: (message: Message) => void;
}

export function useMessageSender() {
  const [newMessage, setNewMessage] = useState('');

  const sendMessage = useCallback(async ({
    conversationId,
    user,
    content,
    mediaUrls,
    onSuccess,
    onError,
    onUpdateConversation,
  }: SendMessageParams) => {
    // For media-only messages, use a placeholder content
    const finalContent = content || (mediaUrls.length > 0 ? '[Image]' : '');
    
    if (!finalContent && mediaUrls.length === 0) return null;
    
    // Generate unique temp ID
    const tempId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Create optimistic message
    const tempMessage: Message = {
      id: tempId,
      conversationId,
      content: finalContent,
      messageType: mediaUrls.length > 0 ? 'media' : 'text',
      senderId: user.id,
      createdAt: new Date().toISOString(),
      mediaUrls: mediaUrls.length > 0 ? mediaUrls : undefined,
      sender: {
        id: user.id,
        username: user.username,
        displayName: user.displayName || user.username,
        avatarUrl: user.avatarUrl || '',
      },
    } as Message;

    try {
      const response = await fetch(`/api/conversations/${conversationId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          content: finalContent,
          messageType: mediaUrls.length > 0 ? 'media' : 'text',
          mediaUrls,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        onSuccess(tempId, data.message);
        onUpdateConversation(data.message);
      } else {
        onError(tempId);
        console.error('Failed to send message:', data.error);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      onError(tempId);
    }

    return tempMessage;
  }, []);

  return {
    newMessage,
    setNewMessage,
    sendMessage,
  };
}
