'use client';

import Link from 'next/link';
import { User } from 'lucide-react';
import CommentActions from './CommentActions';
import ReplyInput from './ReplyInput';
import type { CommentItemProps } from './types';

export default function CommentItem({ 
  comment, 
  isReply = false, 
  onLike, 
  onReply, 
  onToggleExpanded, 
  expandedComments, 
  replyingTo, 
  replyText, 
  onReplyTextChange, 
  onSubmitReply, 
  onCancelReply 
}: CommentItemProps) {
  
  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds}s`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
    return `${Math.floor(diffInSeconds / 86400)}d`;
  };

  const handleReplyClick = () => {
    onReply(replyingTo === comment.id ? '' : comment.id);
  };

  const handleSubmitReply = () => {
    onSubmitReply(replyText, comment.id);
  };

  return (
    <div className={`${isReply ? 'ml-8 md:ml-12' : ''} space-y-3`}>
      <div className="flex gap-3">
        {/* Avatar */}
        <Link 
          href={`/profile/${comment.user.username}`}
          className="flex-shrink-0"
        >
          <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-primary to-blue-600 rounded-full flex items-center justify-center overflow-hidden hover:scale-105 transition-transform">
            {comment.user.avatarUrl ? (
              <img 
                src={comment.user.avatarUrl} 
                alt={`${comment.user.username}'s avatar`}
                className="w-full h-full object-cover"
              />
            ) : (
              <User size={isReply ? 12 : 16} className="text-white" />
            )}
          </div>
        </Link>

        {/* Comment Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <Link 
              href={`/profile/${comment.user.username}`}
              className="font-medium hover:text-primary transition-colors text-sm md:text-base"
            >
              {comment.user.displayName}
            </Link>
            
            {comment.user.verified && (
              <div className="w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                <span className="text-white text-xs">✓</span>
              </div>
            )}
            
            <span className="text-gray-400 text-xs md:text-sm">
              @{comment.user.username}
            </span>
            
            <span className="text-gray-500 text-xs">•</span>
            
            <span className="text-gray-400 text-xs">
              {formatTimeAgo(comment.createdAt)}
            </span>
          </div>

          {/* Content */}
          <p className="text-gray-300 text-sm md:text-base leading-relaxed mb-2">
            {comment.content}
          </p>

          {/* Actions */}
          <CommentActions
            comment={comment}
            isReply={isReply}
            onLike={() => onLike(comment.id, isReply)}
            onReply={!isReply && comment.depth < 2 ? handleReplyClick : undefined}
          />

          {/* Reply Input */}
          {replyingTo === comment.id && (
            <ReplyInput
              replyText={replyText}
              onReplyTextChange={onReplyTextChange}
              onSubmitReply={handleSubmitReply}
              onCancelReply={onCancelReply}
              targetUsername={comment.user.username}
            />
          )}

          {/* Nested Replies */}
          {comment.replies.length > 0 && (
            <div className="mt-3 space-y-3">
              {comment.replies.slice(0, expandedComments.has(comment.id) ? undefined : 2).map(reply => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  isReply={true}
                  onLike={onLike}
                  onReply={onReply}
                  onToggleExpanded={onToggleExpanded}
                  expandedComments={expandedComments}
                  replyingTo={replyingTo}
                  replyText={replyText}
                  onReplyTextChange={onReplyTextChange}
                  onSubmitReply={onSubmitReply}
                  onCancelReply={onCancelReply}
                />
              ))}
              
              {comment.replies.length > 2 && !expandedComments.has(comment.id) && (
                <button
                  onClick={() => onToggleExpanded(comment.id)}
                  className="text-primary text-sm hover:underline"
                >
                  Show {comment.replies.length - 2} more replies
                </button>
              )}
              
              {expandedComments.has(comment.id) && comment.replies.length > 2 && (
                <button
                  onClick={() => onToggleExpanded(comment.id)}
                  className="text-gray-400 text-sm hover:text-white"
                >
                  Show less
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}