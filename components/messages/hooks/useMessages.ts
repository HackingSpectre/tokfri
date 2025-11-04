import { useState, useCallback } from 'react';
import { Message } from '../types';

export function useMessages() {
  const [messages, setMessages] = useState<Message[]>([]);

  const fetchMessages = useCallback(async (conversationId: string, userId: string, socket: any, isConnected: boolean) => {
    if (!userId || !conversationId) return;
    
    try {
      const response = await fetch(
        `/api/conversations/${conversationId}/messages?userId=${userId}&limit=50`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }
      
      const data = await response.json();
      setMessages(data.messages || []);
      
      // Join the conversation room for real-time updates
      if (socket && isConnected) {
        socket.emit('join:conversation', { conversationId });
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error);
      setMessages([]);
    }
  }, []);

  const addMessage = useCallback((message: Message) => {
    setMessages(prev => {
      // Prevent duplicate messages
      const exists = prev.find(m => m.id === message.id);
      if (exists) return prev;
      return [...prev, message];
    });
  }, []);

  const replaceMessage = useCallback((tempId: string, newMessage: Message) => {
    setMessages(prev => 
      prev.map(msg => msg.id === tempId ? newMessage : msg)
    );
  }, []);

  const removeMessage = useCallback((messageId: string) => {
    setMessages(prev => prev.filter(msg => msg.id !== messageId));
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    messages,
    setMessages,
    fetchMessages,
    addMessage,
    replaceMessage,
    removeMessage,
    clearMessages,
  };
}
