import { useState, useEffect, useCallback } from 'react';
import { Conversation } from '../types';

interface DirectMessageParams {
  userId: string | undefined;
  targetUsername: string | null;
  conversations: Conversation[];
  onSelectConversation: (conversation: Conversation) => void;
  onConversationsRefresh: () => void;
}

export function useDirectMessage({
  userId,
  targetUsername,
  conversations,
  onSelectConversation,
  onConversationsRefresh,
}: DirectMessageParams) {
  const [isCreatingConversation, setIsCreatingConversation] = useState(false);
  const [userCache, setUserCache] = useState<Map<string, any>>(new Map());
  const [hasHandledDirectMessage, setHasHandledDirectMessage] = useState(false);

  const createDirectConversation = useCallback(async (username: string) => {
    if (isCreatingConversation || !userId) return;
    
    try {
      setIsCreatingConversation(true);
      
      // First check existing conversations in local state
      const existingConversation = conversations.find(conv => 
        conv.type === 'direct' && 
        conv.participants.some(p => p.username === username)
      );

      if (existingConversation) {
        onSelectConversation(existingConversation);
        return;
      }

      // Fetch user data with caching
      let userData = userCache.get(username);
      
      if (!userData) {
        const userResponse = await fetch(`/api/users/resolve?username=${encodeURIComponent(username)}`);
        if (!userResponse.ok) {
          console.error('Failed to fetch user data');
          return;
        }
        userData = await userResponse.json();
        setUserCache(prev => new Map(prev.set(username, userData)));
      }
      
      if (!userData.user) {
        console.error('User not found:', username);
        return;
      }

      const targetUserId = userData.user.id;

      // Create or get existing conversation
      const response = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          type: 'direct',
          participantIds: [targetUserId],
        }),
      });

      const data = await response.json();
      
      if (response.ok && data.conversationId) {
        // If conversation was just created, refresh the list
        if (data.created) {
          await onConversationsRefresh();
        }
      } else {
        console.error('Failed to create conversation:', data.error);
      }
    } catch (error) {
      console.error('Failed to create conversation:', error);
    } finally {
      setIsCreatingConversation(false);
    }
  }, [userId, conversations, isCreatingConversation, userCache, onSelectConversation, onConversationsRefresh]);

  // Handle direct messaging when conversations are loaded
  useEffect(() => {
    if (userId && targetUsername && conversations.length > 0 && !isCreatingConversation && !hasHandledDirectMessage) {
      const existingConversation = conversations.find(conv => 
        conv.type === 'direct' && 
        conv.participants.some(p => p.username === targetUsername)
      );

      if (existingConversation) {
        onSelectConversation(existingConversation);
      } else {
        createDirectConversation(targetUsername);
      }
      
      setHasHandledDirectMessage(true);
    }
  }, [conversations, targetUsername, userId, isCreatingConversation, hasHandledDirectMessage, onSelectConversation, createDirectConversation]);

  return {
    isCreatingConversation,
    createDirectConversation,
  };
}
