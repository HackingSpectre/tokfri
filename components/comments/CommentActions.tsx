'use client';

import { Heart, MoreHorizontal, Reply } from 'lucide-react';
import type { CommentActionsProps } from './types';

export default function CommentActions({ 
  comment, 
  isReply = false, 
  onLike, 
  onReply 
}: CommentActionsProps) {
  return (
    <div className="flex items-center gap-4 text-xs md:text-sm">
      {/* Reply */}
      {!isReply && comment.depth < 2 && onReply && (
        <button
          onClick={onReply}
          className="flex items-center gap-1 text-gray-400 hover:text-blue-400 transition-colors"
        >
          <Reply size={14} />
          <span>Reply</span>
        </button>
      )}

      {/* Like */}
      <button
        onClick={onLike}
        className={`flex items-center gap-1 transition-colors ${
          comment.isLiked ? 'text-red-500' : 'text-gray-400 hover:text-red-400'
        }`}
      >
        <Heart size={14} className={comment.isLiked ? 'fill-current' : ''} />
        <span>{comment.likeCount}</span>
      </button>

      {/* More */}
      <button className="p-1 text-gray-400 hover:text-white transition-colors">
        <MoreHorizontal size={14} />
      </button>
    </div>
  );
}