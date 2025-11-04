export interface Comment {
  id: string;
  content: string;
  likeCount: number;
  replyCount: number;
  depth: number;
  createdAt: string;
  isLiked: boolean;
  user: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl: string;
    verified: boolean;
  };
  replies: Comment[];
}

export interface CommentsProps {
  postId: string;
  initialComments?: Comment[];
  onCommentAdd?: (comment: Comment) => void;
}

export interface CommentItemProps {
  comment: Comment;
  isReply?: boolean;
  onLike: (commentId: string, isReply?: boolean, parentId?: string) => void;
  onReply: (commentId: string) => void;
  onToggleExpanded: (commentId: string) => void;
  expandedComments: Set<string>;
  replyingTo: string | null;
  replyText: string;
  onReplyTextChange: (text: string) => void;
  onSubmitReply: (content: string, parentCommentId: string) => void;
  onCancelReply: () => void;
}

export interface CommentInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (content: string) => void;
  placeholder?: string;
  submitLabel?: string;
  disabled?: boolean;
}

export interface CommentActionsProps {
  comment: Comment;
  isReply?: boolean;
  onLike: () => void;
  onReply?: () => void;
}