import { Loader2, User } from 'lucide-react';
import Post from '@/components/ui/Post';
import { PostData } from '@/types/feed';

interface FeedContentProps {
  posts: PostData[];
  isLoading: boolean;
  error: string;
  user?: any;
  onLike: (postId: string, isLiked: boolean) => void;
  onMintPost: () => void;
  onRetry: () => void;
}

export default function FeedContent({ 
  posts, 
  isLoading, 
  error, 
  user,
  onLike, 
  onMintPost, 
  onRetry 
}: FeedContentProps) {
  // Loading State
  if (isLoading && posts.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center space-x-2 text-gray-400">
          <Loader2 size={20} className="animate-spin" />
          <span>Loading posts...</span>
        </div>
      </div>
    );
  }

  // Error State
  if (error && !isLoading && posts.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-red-400 mb-4">
          <span className="text-2xl">⚠️</span>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Something went wrong</h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-md transition-colors"
        >
          Try again
        </button>
      </div>
    );
  }

  // Empty State
  if (!isLoading && !error && posts.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-600 mb-4">
          <span className="text-4xl">📝</span>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Welcome to your feed!</h3>
        <p className="text-gray-600 mb-4">
          Start following people or create your first post to see content here.
        </p>
        {user && (
          <button
            onClick={onMintPost}
            className="px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-md transition-colors"
          >
            Create your first post
          </button>
        )}
      </div>
    );
  }

  // Posts List - Clean and Compact
  return (
    <div className="divide-y divide-gray-200">
      {posts.map((post) => (
        <div key={post.id} className="bg-white px-4 py-4">
          <Post 
            post={post}
            onLike={onLike}
          />
        </div>
      ))}

      {/* Load More Indicator */}
      {posts.length > 0 && !isLoading && (
        <div className="text-center py-8">
          <span className="text-gray-400 text-sm">You&apos;re all caught up! ✨</span>
        </div>
      )}

      {/* Loading More Indicator */}
      {isLoading && posts.length > 0 && (
        <div className="flex items-center justify-center py-4">
          <div className="flex items-center space-x-2 text-gray-400">
            <Loader2 size={16} className="animate-spin" />
            <span className="text-sm">Loading more...</span>
          </div>
        </div>
      )}
    </div>
  );
}