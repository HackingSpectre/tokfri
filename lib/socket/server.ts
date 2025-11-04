import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { NextApiRequest } from 'next';
import { Socket as NetSocket } from 'net';

interface SocketServer extends HTTPServer {
  io?: SocketIOServer | undefined;
}

interface SocketWithIO extends NetSocket {
  server: SocketServer;
}

interface NextApiResponseWithSocket extends NextApiRequest {
  socket: SocketWithIO;
}

// Store active users and their socket connections
const activeUsers = new Map<string, string>(); // userId -> socketId
const userSockets = new Map<string, string>(); // socketId -> userId

export function initializeSocket(server: HTTPServer) {
  if ((server as SocketServer).io) {
    console.log('Socket.io server already initialized');
    return (server as SocketServer).io;
  }

  console.log('Initializing Socket.io server...');
  
  const io = new SocketIOServer(server, {
    path: '/api/socket/io',
    addTrailingSlash: false,
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  });

  // Authentication middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    const userId = socket.handshake.auth.userId;
    
    if (!token || !userId) {
      return next(new Error('Authentication error'));
    }
    
    // Store user info in socket
    socket.data.userId = userId;
    socket.data.token = token;
    
    next();
  });

  io.on('connection', (socket) => {
    const userId = socket.data.userId;
    console.log(`User ${userId} connected with socket ${socket.id}`);
    
    // Store user connection
    activeUsers.set(userId, socket.id);
    userSockets.set(socket.id, userId);
    
    // Join user to their personal room for notifications
    socket.join(`user:${userId}`);
    
    // Broadcast user online status
    socket.broadcast.emit('user:online', { userId });
    
    // Handle joining conversation rooms
    socket.on('join:conversation', ({ conversationId }) => {
      socket.join(`conversation:${conversationId}`);
      console.log(`User ${userId} joined conversation ${conversationId}`);
    });
    
    // Handle leaving conversation rooms
    socket.on('leave:conversation', ({ conversationId }) => {
      socket.leave(`conversation:${conversationId}`);
      console.log(`User ${userId} left conversation ${conversationId}`);
    });
    
    // Handle sending messages
    socket.on('message:send', (data) => {
      const { conversationId, content, messageId } = data;
      
      // Broadcast to all users in the conversation
      socket.to(`conversation:${conversationId}`).emit('message:receive', {
        messageId,
        conversationId,
        senderId: userId,
        content,
        timestamp: new Date().toISOString(),
      });
    });
    
    // Handle typing indicators
    socket.on('typing:start', ({ conversationId }) => {
      socket.to(`conversation:${conversationId}`).emit('user:typing', {
        userId,
        conversationId,
        isTyping: true,
      });
    });
    
    socket.on('typing:stop', ({ conversationId }) => {
      socket.to(`conversation:${conversationId}`).emit('user:typing', {
        userId,
        conversationId,
        isTyping: false,
      });
    });
    
    // Handle real-time notifications
    socket.on('notification:send', ({ targetUserId, type, data }) => {
      const targetSocketId = activeUsers.get(targetUserId);
      if (targetSocketId) {
        io.to(`user:${targetUserId}`).emit('notification:receive', {
          type,
          data,
          timestamp: new Date().toISOString(),
        });
      }
    });
    
    // Handle real-time post interactions
    socket.on('post:like', ({ postId, isLiked, likeCount }) => {
      socket.broadcast.emit('post:like:update', {
        postId,
        isLiked,
        likeCount,
        userId,
      });
    });
    
    socket.on('post:comment', ({ postId, comment }) => {
      socket.broadcast.emit('post:comment:new', {
        postId,
        comment,
      });
    });
    
    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`User ${userId} disconnected`);
      
      // Remove user from active users
      activeUsers.delete(userId);
      userSockets.delete(socket.id);
      
      // Broadcast user offline status
      socket.broadcast.emit('user:offline', { userId });
    });
  });

  (server as SocketServer).io = io;
  return io;
}

// Helper functions to send real-time events
export const socketHelpers = {
  // Send notification to specific user
  sendNotification: (userId: string, notification: any) => {
    const socketId = activeUsers.get(userId);
    if (socketId && global.io) {
      global.io.to(`user:${userId}`).emit('notification:receive', notification);
    }
  },
  
  // Send message to conversation
  sendMessage: (conversationId: string, message: any) => {
    if (global.io) {
      global.io.to(`conversation:${conversationId}`).emit('message:receive', message);
    }
  },
  
  // Update post interaction in real-time
  updatePostInteraction: (postId: string, type: string, data: any) => {
    if (global.io) {
      global.io.emit(`post:${type}:update`, { postId, ...data });
    }
  },
  
  // Check if user is online
  isUserOnline: (userId: string): boolean => {
    return activeUsers.has(userId);
  },
  
  // Get online users count
  getOnlineUsersCount: (): number => {
    return activeUsers.size;
  },
};

// Global socket instance
declare global {
  var io: SocketIOServer | undefined;
}

export default initializeSocket;