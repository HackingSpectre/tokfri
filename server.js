const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = process.env.PORT || 5000;

// When using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// Store active users and their socket connections
const activeUsers = new Map(); // userId -> socketId
const userSockets = new Map(); // socketId -> userId

app.prepare().then(() => {
  const httpServer = createServer(async (req, res) => {
    try {
      // Be sure to pass `true` as the second argument to `url.parse`.
      // This tells it to parse the query portion of the URL.
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  });

  // Initialize Socket.io
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL || `http://localhost:${port}`,
      methods: ['GET', 'POST'],
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  });

  // Authentication middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    const userId = socket.handshake.auth.userId;
    
    if (!userId) {
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
    
    // Handle joining user room for messages
    socket.on('join-user-room', (userId) => {
      socket.join(`user:${userId}`);
      console.log(`User ${userId} joined their user room`);
    });
    
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
    socket.on('send-message', (data) => {
      const { conversationId, message } = data;
      
      // Broadcast to all users in the conversation
      socket.to(`conversation:${conversationId}`).emit('new-message', message);
    });
    
    // Handle typing indicators
    socket.on('typing', ({ conversationId, userId: typingUserId, isTyping }) => {
      socket.to(`conversation:${conversationId}`).emit('user-typing', {
        userId: typingUserId,
        conversationId,
        isTyping,
      });
    });
    
    // Handle real-time notifications
    socket.on('notification:send', ({ targetUserId, type, data }) => {
      io.to(`user:${targetUserId}`).emit('notification:receive', {
        type,
        data,
        timestamp: new Date().toISOString(),
      });
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

  // Store globally for access in API routes
  global.io = io;
  
  // Helper functions to send real-time events
  global.socketHelpers = {
    // Send notification to specific user
    sendNotification: (userId, notification) => {
      io.to(`user:${userId}`).emit('notification:receive', notification);
    },
    
    // Send message to conversation
    sendMessage: (conversationId, message) => {
      io.to(`conversation:${conversationId}`).emit('new-message', message);
    },
    
    // Update post interaction in real-time
    updatePostInteraction: (postId, type, data) => {
      io.emit(`post:${type}:update`, { postId, ...data });
    },
    
    // Check if user is online
    isUserOnline: (userId) => {
      return activeUsers.has(userId);
    },
    
    // Get online users count
    getOnlineUsersCount: () => {
      return activeUsers.size;
    },
  };

  httpServer
    .once('error', (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
      console.log(`> Socket.io server running on the same port`);
    });
});