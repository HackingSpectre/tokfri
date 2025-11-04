export interface Message {
  id: string;
  conversationId: string;
  content: string;
  messageType: string;
  senderId: string;
  createdAt: string;
  mediaUrls?: string[];
  sender: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl: string;
  };
  replyTo?: {
    id: string;
    content: string;
    sender: {
      username: string;
      displayName: string;
    };
  };
}

export interface Conversation {
  id: string;
  type: string;
  name: string;
  imageUrl: string;
  participants: Array<{
    id: string;
    username: string;
    displayName: string;
    avatarUrl: string;
  }>;
  lastMessage: Message | null;
  unreadCount: number;
  lastMessageAt: string;
  otherUser?: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl: string;
  };
}

export interface User {
  id: string;
  username: string;
  displayName?: string | null;
  avatarUrl?: string | null;
}

export interface AuthUser {
  id: string;
  username: string;
  displayName?: string | null;
  avatarUrl?: string | null;
  suiAddress: string;
  oauthProvider: 'google';
  oauthSub: string;
  bio?: string | null;
  websiteUrl?: string | null;
  verified?: boolean | null;
  createdAt: string;
  // Legacy fields for backward compatibility
  avatar?: string;
  profileImage?: string;
}