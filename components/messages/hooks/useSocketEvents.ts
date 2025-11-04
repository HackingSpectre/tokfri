import { useEffect } from 'react';
import { Message } from '../types';

interface SocketEventsParams {
  socket: any;
  user: any;
  selectedChat: string | null;
  onNewMessage: (message: Message) => void;
  onTypingChange: (userId: string, isTyping: boolean) => void;
}

export function useSocketEvents({
  socket,
  user,
  selectedChat,
  onNewMessage,
  onTypingChange,
}: SocketEventsParams) {
  useEffect(() => {
    if (!socket || !user) return;

    // Join user room for notifications
    socket.emit('join-user-room', user.id);

    const handleNewMessage = (message: Message) => {
      // Don't add our own messages from socket (they're already optimistically added)
      if (message.senderId === user.id) return;
      
      // Only add if it's for the current conversation
      if (selectedChat === message.conversationId) {
        onNewMessage(message);
      }
    };

    const handleUserTyping = ({ userId, conversationId, isTyping }: any) => {
      if (conversationId === selectedChat && userId !== user.id) {
        onTypingChange(userId, isTyping);
      }
    };

    socket.on('message:receive', handleNewMessage);
    socket.on('user:typing', handleUserTyping);

    return () => {
      socket.off('message:receive', handleNewMessage);
      socket.off('user:typing', handleUserTyping);
    };
  }, [socket, user, selectedChat, onNewMessage, onTypingChange]);
}
