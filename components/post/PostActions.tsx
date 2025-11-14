'use client';

import { PostActionsProps } from './types';
import { Heart, MessageCircle, Repeat2, Share, Coins, MoreHorizontal } from 'lucide-react';
import { useState } from 'react';

export default function PostActions({
  postId,
  likeCount,
  replyCount,
  repostCount,
  viewCount,
  tipAmount,
  isLiked,
  onLike,
  onComment,
  onRepost,
  onShare,
  onTip
}: PostActionsProps) {
  const [isLiking, setIsLiking] = useState(false);

  const formatCount = (count: number) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  const handleLike = async () => {
    if (isLiking) return;
    setIsLiking(true);
    await onLike();
    setIsLiking(false);
  };

  return (
    <div className="flex items-center justify-between pt-3 border-t border-gray-200">
      {/* Like */}
      <button
        onClick={handleLike}
        disabled={isLiking}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all group ${
          isLiked 
            ? 'text-pink-600 hover:bg-pink-50' 
            : 'text-gray-500 hover:text-pink-600 hover:bg-pink-50'
        }`}
      >
        <Heart 
          size={18} 
          className={`transition-all ${
            isLiked ? 'fill-current scale-110' : 'group-hover:scale-110'
          }`}
        />
        <span className="text-sm font-medium">
          {formatCount(likeCount)}
        </span>
      </button>

      {/* Comment */}
      <button
        onClick={onComment}
        className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-500 hover:text-pink-600 hover:bg-pink-50 transition-all group"
      >
        <MessageCircle size={18} className="group-hover:scale-110 transition-transform" />
        <span className="text-sm font-medium">
          {formatCount(replyCount)}
        </span>
      </button>

      {/* Repost */}
      <button
        onClick={onRepost}
        className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-500 hover:text-pink-600 hover:bg-pink-50 transition-all group"
      >
        <Repeat2 size={18} className="group-hover:scale-110 transition-transform" />
        <span className="text-sm font-medium">
          {formatCount(repostCount)}
        </span>
      </button>

      {/* Tip */}
      {/* <button
        onClick={onTip}
        className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-500 hover:text-pink-600 hover:bg-pink-50 transition-all group"
      >
        <Coins size={18} className="group-hover:scale-110 transition-transform" />
        <span className="text-sm font-medium">
          {tipAmount > 0 ? `${tipAmount} SUI` : 'Tip'}
        </span>
      </button> */}

      {/* Share */}
      <button
        onClick={onShare}
        className="flex items-center gap-1 px-3 py-2 rounded-lg text-gray-500 hover:text-pink-600 hover:bg-pink-50 transition-all group"
      >
        <Share size={18} className="group-hover:scale-110 transition-transform" />
      </button>

      {/* More */}
      <button className="p-2 rounded-lg text-gray-500 hover:text-pink-600 hover:bg-pink-50 transition-all group">
        <MoreHorizontal size={18} className="group-hover:scale-110 transition-transform" />
      </button>
    </div>
  );
}