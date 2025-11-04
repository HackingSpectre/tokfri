'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@/lib/context/WalletContext';
import { Loader2, MessageCircle } from 'lucide-react';
import { CommentInput, CommentItem, type Comment, type CommentsProps } from '@/components/comments';

export default function Comments({ postId, initialComments = [], onCommentAdd }: CommentsProps) {
  const { user } = useWallet();
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [isLoading, setIsLoading] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());

  // Fetch comments on mount
  useEffect(() => {
    if (initialComments.length === 0) {
      fetchComments();
    }
  }, [postId]);

  const fetchComments = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/posts/${postId}/comments?userId=${user?.id || ''}&limit=20`);
      if (response.ok) {
        const data = await response.json();
        setComments(data.comments || []);
      }
    } catch (error) {
      console.error('Failed to fetch comments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const submitComment = async (content: string, parentCommentId?: string) => {
    if (!content.trim() || !user?.id) return;

    const tempComment: Comment = {
      id: 'temp-' + Date.now(),
      content: content.trim(),
      likeCount: 0,
      replyCount: 0,
      depth: parentCommentId ? 1 : 0,
      createdAt: new Date().toISOString(),
      isLiked: false,
      user: {
        id: user.id,
        username: user.username,
        displayName: user.displayName || user.username,
        avatarUrl: user.avatarUrl || '',
        verified: false,
      },
      replies: [],
    };

    // Optimistic update
    if (parentCommentId) {
      setComments(prev => prev.map(comment => 
        comment.id === parentCommentId 
          ? { ...comment, replies: [...comment.replies, tempComment] }
          : comment
      ));
      setReplyText('');
      setReplyingTo(null);
    } else {
      setComments(prev => [tempComment, ...prev]);
      setNewComment('');
    }

    try {
      const response = await fetch(`/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          content: content.trim(),
          parentCommentId,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const realComment = data.comment;

        // Replace temp comment with real comment
        if (parentCommentId) {
          setComments(prev => prev.map(comment =>
            comment.id === parentCommentId
              ? {
                  ...comment,
                  replies: comment.replies.map(reply =>
                    reply.id === tempComment.id ? realComment : reply
                  )
                }
              : comment
          ));
        } else {
          setComments(prev => prev.map(comment =>
            comment.id === tempComment.id ? realComment : comment
          ));
        }

        onCommentAdd?.(realComment);
      }
    } catch (error) {
      console.error('Failed to submit comment:', error);
      // Remove failed comment
      if (parentCommentId) {
        setComments(prev => prev.map(comment =>
          comment.id === parentCommentId
            ? { ...comment, replies: comment.replies.filter(reply => reply.id !== tempComment.id) }
            : comment
        ));
      } else {
        setComments(prev => prev.filter(comment => comment.id !== tempComment.id));
      }
    }
  };

  const likeComment = async (commentId: string, isReply = false, parentId?: string) => {
    if (!user?.id) return;

    const updateLike = (comment: Comment) => {
      if (comment.id === commentId) {
        return {
          ...comment,
          isLiked: !comment.isLiked,
          likeCount: comment.isLiked ? comment.likeCount - 1 : comment.likeCount + 1,
        };
      }
      return {
        ...comment,
        replies: comment.replies.map(updateLike),
      };
    };

    // Optimistic update
    setComments(prev => prev.map(updateLike));

    try {
      const response = await fetch(`/api/comments/${commentId}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      });

      if (!response.ok) {
        // Revert on error
        setComments(prev => prev.map(updateLike));
      }
    } catch (error) {
      console.error('Failed to like comment:', error);
      // Revert on error
      setComments(prev => prev.map(updateLike));
    }
  };

  const toggleExpanded = (commentId: string) => {
    setExpandedComments(prev => {
      const newSet = new Set(prev);
      if (newSet.has(commentId)) {
        newSet.delete(commentId);
      } else {
        newSet.add(commentId);
      }
      return newSet;
    });
  };

  const handleReply = (commentId: string) => {
    setReplyingTo(replyingTo === commentId ? null : commentId);
    if (replyingTo !== commentId) {
      setReplyText('');
    }
  };

  const handleCancelReply = () => {
    setReplyingTo(null);
    setReplyText('');
  };

  return (
    <div className="space-y-4">
      {/* Comment Input */}
      <CommentInput
        value={newComment}
        onChange={setNewComment}
        onSubmit={(content) => submitComment(content)}
      />

      {/* Comments List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 size={24} className="animate-spin text-primary" />
          </div>
        ) : comments.length > 0 ? (
          comments.map(comment => (
            <CommentItem
              key={comment.id}
              comment={comment}
              onLike={likeComment}
              onReply={handleReply}
              onToggleExpanded={toggleExpanded}
              expandedComments={expandedComments}
              replyingTo={replyingTo}
              replyText={replyText}
              onReplyTextChange={setReplyText}
              onSubmitReply={submitComment}
              onCancelReply={handleCancelReply}
            />
          ))
        ) : (
          <div className="text-center py-8">
            <MessageCircle size={48} className="text-gray-600 mx-auto mb-2" />
            <p className="text-gray-400">No comments yet</p>
            <p className="text-gray-500 text-sm">Be the first to share your thoughts!</p>
          </div>
        )}
      </div>
    </div>
  );
}