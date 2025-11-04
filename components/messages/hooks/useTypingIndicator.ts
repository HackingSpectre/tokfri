import { useState, useRef, useCallback, useEffect } from 'react';

const TYPING_TIMEOUT = 1000;

export function useTypingIndicator(socket: any, conversationId: string | null, userId: string | undefined) {
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleTyping = useCallback(() => {
    if (!socket || !conversationId || !userId) return;

    // Clear existing timeout to prevent multiple simultaneous timeouts
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Only emit if not already typing
    if (!isTyping) {
      setIsTyping(true);
      socket.emit('typing:start', { conversationId });
    }

    // Set new timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      socket.emit('typing:stop', { conversationId });
    }, TYPING_TIMEOUT);
  }, [socket, conversationId, userId, isTyping]);

  const clearTypingUsers = useCallback(() => {
    setTypingUsers([]);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  return {
    isTyping,
    typingUsers,
    setTypingUsers,
    handleTyping,
    clearTypingUsers,
  };
}
