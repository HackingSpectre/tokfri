export interface PostData {
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

export interface FeedTab {
  id: string;
  label: string;
  active?: boolean;
}

export interface TrendingTopic {
  id: string;
  category: string;
  hashtag: string;
  postCount: string;
}

export interface SuggestedUser {
  id: string;
  username: string;
  displayName?: string;
  bio?: string;
  avatarUrl?: string;
  verified?: boolean;
}

export interface FeedState {
  posts: PostData[];
  isLoading: boolean;
  isRefreshing: boolean;
  error: string;
  hasMore: boolean;
}

export interface FeedActions {
  fetchPosts: (refresh?: boolean) => Promise<void>;
  handleLike: (postId: string, isLiked: boolean) => void;
  handleRefresh: () => void;
  loadMore: () => Promise<void>;
}