import { useState, useCallback, useEffect } from 'react';
import { Conversation } from '../types';

export function useConversationManager(socket: any, isConnected: boolean) {
  const [selectedChat, setSelectedChat] = useState<string | null>(null);

  const selectConversation = useCallback((conversation: Conversation) => {
    // Leave previous conversation room
    if (selectedChat && socket && isConnected) {
      socket.emit('leave:conversation', { conversationId: selectedChat });
    }
    
    // Set new conversation
    setSelectedChat(conversation.id);
  }, [selectedChat, socket, isConnected]);

  const clearSelection = useCallback(() => {
    // Leave conversation room
    if (selectedChat && socket && isConnected) {
      socket.emit('leave:conversation', { conversationId: selectedChat });
    }
    
    setSelectedChat(null);
  }, [selectedChat, socket, isConnected]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (selectedChat && socket && isConnected) {
        socket.emit('leave:conversation', { conversationId: selectedChat });
      }
    };
  }, [selectedChat, socket, isConnected]);

  return {
    selectedChat,
    selectConversation,
    clearSelection,
  };
}
