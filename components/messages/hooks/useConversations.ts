import { useState, useCallback } from 'react';
import { Conversation } from '../types';

export function useConversations(userId: string | undefined) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchConversations = useCallback(async () => {
    if (!userId) return;
    
    try {
      const response = await fetch(`/api/conversations?userId=${userId}&limit=20`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch conversations');
      }
      
      const data = await response.json();
      setConversations(data.conversations || []);
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
      setConversations([]);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  const updateConversationLastMessage = useCallback((message: any) => {
    setConversations(prev => 
      prev.map(conv => {
        if (conv.id === message.conversationId) {
          // Only update if this message is newer than current last message
          if (!conv.lastMessageAt || new Date(message.createdAt) >= new Date(conv.lastMessageAt)) {
            return { ...conv, lastMessage: message, lastMessageAt: message.createdAt };
          }
        }
        return conv;
      })
    );
  }, []);

  return {
    conversations,
    isLoading,
    fetchConversations,
    updateConversationLastMessage,
  };
}
