// Core Profile Data Types
export interface User {
  id: string;
  username: string;
  displayName: string;
  email: string;
  avatarUrl: string;
  verified: boolean;
  bio: string;
  website?: string;
  location?: string;
  joinedAt: string;
  followersCount: number;
  followingCount: number;
  postsCount: number;
}

export interface UserListUser {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string;
  verified: boolean;
  bio: string;
  followedAt: string;
  followerCount?: number;
}

export interface Post {
  id: string;
  content: string;
  mediaUrls: string[] | null;
  likeCount: number;
  repostCount: number;
  replyCount: number;
  viewCount: number;
  tipAmount: number;
  createdAt: string;
  user: {
    id: string;
    username: string;
    displayName: string | null;
    avatarUrl: string | null;
    verified: boolean | null;
  };
}

// Component Props Interfaces
export interface ProfileHeaderProps {
  user: User;
  isOwnProfile: boolean;
  isFollowing?: boolean;
  onFollow?: () => void;
  onEdit?: () => void;
}

export interface ProfileStatsProps {
  stats: {
    posts: number;
    followers: number;
    following: number;
  };
  username: string;
  isClickable?: boolean;
}

export interface ProfileTabsProps {
  activeTab: 'posts' | 'media' | 'likes';
  onTabChange: (tab: 'posts' | 'media' | 'likes') => void;
  counts: {
    posts: number;
    media: number;
    likes: number;
  };
}

export interface PostsListProps {
  posts: Post[];
  isLoading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  emptyMessage?: string;
}

export interface UserListItemProps {
  user: UserListUser;
  isFollowing?: boolean;
  showFollowButton?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export interface UserListHeaderProps {
  title: string;
  subtitle: string;
  onBack: () => void;
}

// State Management Types
export interface ProfileState {
  user: User | null;
  posts: Post[];
  isLoading: boolean;
  isFollowing: boolean;
  activeTab: 'posts' | 'media' | 'likes';
  hasMore: boolean;
}

export interface UserListState {
  users: UserListUser[];
  isLoading: boolean;
  error: string | null;
  hasMore: boolean;
}