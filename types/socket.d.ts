import { Server as SocketIOServer } from 'socket.io';

declare global {
  var io: SocketIOServer | undefined;
  var socketHelpers: {
    sendMessage: (conversationId: string, message: any) => void;
    sendNotification: (userId: string, notification: any) => void;
    updatePostInteraction: (postId: string, type: string, data: any) => void;
    isUserOnline: (userId: string) => boolean;
    getOnlineUsersCount: () => number;
  } | undefined;
}

export {};