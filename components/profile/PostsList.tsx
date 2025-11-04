'use client';

import { PostsListProps } from './types';
import Post from '@/components/ui/Post';
import { LoadingState, EmptyState } from './LoadingStates';
import { FileText, Loader2 } from 'lucide-react';
import { useEffect, useRef } from 'react';

export default function PostsList({ 
  posts, 
  isLoading, 
  hasMore, 
  onLoadMore,
  emptyMessage = "No posts yet"
}: PostsListProps) {
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Infinite scroll implementation
  useEffect(() => {
    if (!hasMore || isLoading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          onLoadMore();
        }
      },
      { threshold: 0.1 }
    );

    const currentRef = loadMoreRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [hasMore, isLoading, onLoadMore]);

  // Initial loading state
  if (isLoading && posts.length === 0) {
    return <LoadingState message="Loading posts..." />;
  }

  // Empty state
  if (!isLoading && posts.length === 0) {
    return (
      <EmptyState
        icon={<FileText size={48} className="text-gray-600 mx-auto mb-4" />}
        title="No posts yet"
        message={emptyMessage}
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Posts Grid */}
      <div className="space-y-4">
        {posts.map((post) => (
          <Post 
            key={post.id} 
            post={post}
          />
        ))}
      </div>

      {/* Load More Trigger */}
      {hasMore && (
        <div 
          ref={loadMoreRef}
          className="flex justify-center py-8"
        >
          {isLoading ? (
            <div className="flex items-center gap-2 text-gray-400">
              <Loader2 size={20} className="animate-spin" />
              <span>Loading more posts...</span>
            </div>
          ) : (
            <button
              onClick={onLoadMore}
              className="px-6 py-3 glass rounded-lg hover:bg-white/10 transition-colors"
            >
              Load More Posts
            </button>
          )}
        </div>
      )}

      {/* End of posts indicator */}
      {!hasMore && posts.length > 0 && (
        <div className="text-center py-8 text-gray-400 text-sm">
          You&apos;ve reached the end of the posts
        </div>
      )}
    </div>
  );
}