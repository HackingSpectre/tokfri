import { Loader2 } from 'lucide-react';
import { UserListItem } from '@/components/profile';

interface User {
  id: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  bio: string | null;
  verified: boolean | null;
  createdAt: string;
  stats: {
    followerCount: number;
    followingCount: number;
    postCount: number;
  };
}

interface UserSearchResultsProps {
  users: User[];
  query: string;
  isLoading: boolean;
  hasMore: boolean;
  error?: string | null;
  onLoadMore: () => void;
}

export default function UserSearchResults({
  users,
  query,
  isLoading,
  hasMore,
  error,
  onLoadMore
}: UserSearchResultsProps) {
  if (isLoading && users.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-3 text-gray-400">
          <Loader2 size={20} className="animate-spin" />
          <span>Searching...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-400 mb-2">Search failed</div>
        <p className="text-gray-400 text-sm">{error}</p>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-gray-600 mb-4">🔍</div>
        <h3 className="text-lg font-semibold mb-2">No users found</h3>
        <p className="text-gray-400">
          Try searching with different keywords
        </p>
      </div>
    );
  }

  return (
    <div>
      {query && (
        <div className="mb-4">
          <h2 className="text-lg font-semibold mb-3">
            Search results for &quot;{query}&quot;
          </h2>
        </div>
      )}

      <div className="space-y-4">
        {users.map((user) => (
          <UserListItem
            key={user.id}
            user={{
              id: user.id,
              username: user.username,
              displayName: user.displayName || '',
              avatarUrl: user.avatarUrl || '',
              verified: user.verified || false,
              bio: user.bio || '',
              followedAt: user.createdAt
            }}
            showFollowButton={true}
            size="md"
          />
        ))}

        {/* Load More Button */}
        {hasMore && (
          <div className="flex justify-center pt-4">
            <button
              onClick={onLoadMore}
              disabled={isLoading}
              className="px-6 py-3 glass hover:bg-white/10 rounded-xl font-medium transition-all disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin mr-2" />
                  Loading...
                </>
              ) : (
                'Load more'
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}