'use client';

import React, { createContext, useContext, useEffect, useState, useRef, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { useWallet } from './WalletContext';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  onlineUsers: Set<string>;
  
  // Message methods
  sendMessage: (conversationId: string, content: string) => void;
  joinConversation: (conversationId: string) => void;
  leaveConversation: (conversationId: string) => void;
  
  // Typing indicators
  startTyping: (conversationId: string) => void;
  stopTyping: (conversationId: string) => void;
  
  // Real-time events
  onMessageReceive: (callback: (message: any) => void) => void;
  onNotificationReceive: (callback: (notification: any) => void) => void;
  onPostUpdate: (callback: (update: any) => void) => void;
  onUserStatusChange: (callback: (data: any) => void) => void;
  onTypingChange: (callback: (data: any) => void) => void;
  
  // Remove listeners
  offMessageReceive: (callback: (message: any) => void) => void;
  offNotificationReceive: (callback: (notification: any) => void) => void;
  offPostUpdate: (callback: (update: any) => void) => void;
  offUserStatusChange: (callback: (data: any) => void) => void;
  offTypingChange: (callback: (data: any) => void) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export function SocketProvider({ children }: { children: ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const { user, isConnected: walletConnected } = useWallet();
  const connectionAttemptRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!user || !walletConnected) {
      // Disconnect socket if user is not authenticated
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    // Delay socket connection to not block initial navigation
    connectionAttemptRef.current = setTimeout(() => {
      initializeSocket();
    }, 2000); // 2 second delay for better navigation performance

    return () => {
      if (connectionAttemptRef.current) {
        clearTimeout(connectionAttemptRef.current);
      }
      if (socket) {
        socket.disconnect();
      }
    };
  }, [user?.id, walletConnected]); // Only reconnect when user ID changes

  function initializeSocket() {
    if (!user) return;

    // Initialize socket connection to the same server with optimized settings
    const newSocket = io(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:5000', {
      auth: {
        token: 'user-session-token', // Replace with actual token when you implement proper auth
        userId: user.id,
      },
      transports: ['websocket', 'polling'],
      timeout: 5000, // Reduced from 20000 to 5000
      forceNew: true,
      autoConnect: false, // Don't auto-connect, we'll connect manually
    });

    // Connection event handlers with better error handling
    newSocket.on('connect', () => {
      console.log('Connected to Socket.io server');
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from Socket.io server');
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setIsConnected(false);
      // Don't retry aggressively to avoid blocking navigation
    });

    // User status handlers
    newSocket.on('user:online', ({ userId }) => {
      setOnlineUsers(prev => new Set(prev).add(userId));
    });

    newSocket.on('user:offline', ({ userId }) => {
      setOnlineUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    });

    setSocket(newSocket);
    
    // Connect after setup
    newSocket.connect();
  }

  // Message methods
  const sendMessage = (conversationId: string, content: string) => {
    if (socket && isConnected) {
      const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      socket.emit('message:send', {
        conversationId,
        content,
        messageId,
      });
    }
  };

  const joinConversation = (conversationId: string) => {
    if (socket && isConnected) {
      socket.emit('join:conversation', { conversationId });
    }
  };

  const leaveConversation = (conversationId: string) => {
    if (socket && isConnected) {
      socket.emit('leave:conversation', { conversationId });
    }
  };

  // Typing indicators
  const startTyping = (conversationId: string) => {
    if (socket && isConnected) {
      socket.emit('typing:start', { conversationId });
    }
  };

  const stopTyping = (conversationId: string) => {
    if (socket && isConnected) {
      socket.emit('typing:stop', { conversationId });
    }
  };

  // Event listeners
  const onMessageReceive = (callback: (message: any) => void) => {
    if (socket) {
      socket.on('message:receive', callback);
    }
  };

  const onNotificationReceive = (callback: (notification: any) => void) => {
    if (socket) {
      socket.on('notification:receive', callback);
    }
  };

  const onPostUpdate = (callback: (update: any) => void) => {
    if (socket) {
      socket.on('post:like:update', callback);
      socket.on('post:comment:new', callback);
    }
  };

  const onUserStatusChange = (callback: (data: any) => void) => {
    if (socket) {
      socket.on('user:online', callback);
      socket.on('user:offline', callback);
    }
  };

  const onTypingChange = (callback: (data: any) => void) => {
    if (socket) {
      socket.on('user:typing', callback);
    }
  };

  // Remove event listeners
  const offMessageReceive = (callback: (message: any) => void) => {
    if (socket) {
      socket.off('message:receive', callback);
    }
  };

  const offNotificationReceive = (callback: (notification: any) => void) => {
    if (socket) {
      socket.off('notification:receive', callback);
    }
  };

  const offPostUpdate = (callback: (update: any) => void) => {
    if (socket) {
      socket.off('post:like:update', callback);
      socket.off('post:comment:new', callback);
    }
  };

  const offUserStatusChange = (callback: (data: any) => void) => {
    if (socket) {
      socket.off('user:online', callback);
      socket.off('user:offline', callback);
    }
  };

  const offTypingChange = (callback: (data: any) => void) => {
    if (socket) {
      socket.off('user:typing', callback);
    }
  };

  const value: SocketContextType = {
    socket,
    isConnected,
    onlineUsers,
    sendMessage,
    joinConversation,
    leaveConversation,
    startTyping,
    stopTyping,
    onMessageReceive,
    onNotificationReceive,
    onPostUpdate,
    onUserStatusChange,
    onTypingChange,
    offMessageReceive,
    offNotificationReceive,
    offPostUpdate,
    offUserStatusChange,
    offTypingChange,
  };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
}