// Post component types
export interface PostUser {
  id: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  verified: boolean | null;
}

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
  user: PostUser;
}

export interface PostProps {
  post: PostData;
  onLike?: (postId: string, isLiked: boolean) => void;
  showComments?: boolean;
}

export interface PostHeaderProps {
  user: PostUser;
  createdAt: string;
}

export interface PostContentProps {
  content: string;
  mediaUrls: string[] | null;
}

export interface PostActionsProps {
  postId: string;
  likeCount: number;
  replyCount: number;
  repostCount: number;
  viewCount: number;
  tipAmount: number;
  isLiked: boolean;
  onLike: () => void;
  onComment: () => void;
  onRepost: () => void;
  onShare: () => void;
  onTip: () => void;
}

export interface PostStatsProps {
  likeCount: number;
  replyCount: number;
  repostCount: number;
  viewCount: number;
  tipAmount: number;
}