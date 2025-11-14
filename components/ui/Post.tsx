'use client';

import { useState } from 'react';
import { useWallet } from '@/lib/context/WalletContext';
import { PostHeader, PostContent, PostActions, type PostProps } from '@/components/post';
import Comments from './Comments';

export default function Post({ post, onLike, showComments = false }: PostProps) {
  const { user } = useWallet();
  const [isLiked, setIsLiked] = useState(false);
  const [localLikeCount, setLocalLikeCount] = useState(post.likeCount);
  const [localReplyCount, setLocalReplyCount] = useState(post.replyCount);
  const [showCommentsSection, setShowCommentsSection] = useState(showComments);

  const handleLike = async () => {
    if (!user?.id) return;

    const newIsLiked = !isLiked;
    const newLikeCount = newIsLiked ? localLikeCount + 1 : localLikeCount - 1;

    // Optimistic update
    setIsLiked(newIsLiked);
    setLocalLikeCount(newLikeCount);

    try {
      const response = await fetch(`/api/posts/${post.id}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id })
      });

      if (!response.ok) {
        // Revert on error
        setIsLiked(!newIsLiked);
        setLocalLikeCount(localLikeCount);
      } else {
        onLike?.(post.id, newIsLiked);
      }
    } catch (error) {
      console.error('Failed to like post:', error);
      // Revert on error
      setIsLiked(!newIsLiked);
      setLocalLikeCount(localLikeCount);
    }
  };

  const handleComment = () => {
    setShowCommentsSection(!showCommentsSection);
  };

  const handleRepost = async () => {
    // TODO: Implement repost functionality
    console.log('Repost:', post.id);
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: `Post by @${post.user.username}`,
        text: post.content,
        url: `${window.location.origin}/post/${post.id}`
      });
    } catch (error) {
      // Fallback to clipboard
      navigator.clipboard.writeText(`${window.location.origin}/post/${post.id}`);
    }
  };

  const handleTip = () => {
    // TODO: Implement tip functionality
    console.log('Tip:', post.id);
  };

  const handleCommentAdd = (comment: any) => {
    setLocalReplyCount(prev => prev + 1);
  };

  return (
    <article className="space-y-3">
      {/* Post Header */}
      <PostHeader 
        user={post.user} 
        createdAt={post.createdAt} 
      />

      {/* Post Content */}
      <PostContent 
        content={post.content} 
        mediaUrls={post.mediaUrls} 
      />

      {/* Post Actions */}
      <PostActions
        postId={post.id}
        likeCount={localLikeCount}
        replyCount={localReplyCount}
        repostCount={post.repostCount}
        viewCount={post.viewCount}
        tipAmount={post.tipAmount}
        isLiked={isLiked}
        onLike={handleLike}
        onComment={handleComment}
        onRepost={handleRepost}
        onShare={handleShare}
        onTip={handleTip}
      />

      {/* Comments Section */}
      {showCommentsSection && (
        <div className="pt-3 border-t border-gray-200 dark:border-gray-800">
          <Comments
            postId={post.id}
            onCommentAdd={handleCommentAdd}
          />
        </div>
      )}
    </article>
  );
}