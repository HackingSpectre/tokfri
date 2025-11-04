import { TrendingUp, Loader2 } from 'lucide-react';
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

interface TrendingUsersProps {
  users: User[];
  isLoading: boolean;
  title?: string;
}

export default function TrendingUsers({ 
  users, 
  isLoading, 
  title = "Who to follow" 
}: TrendingUsersProps) {
  return (
    <div>
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <TrendingUp size={20} className="text-primary" />
        {title}
      </h2>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-3 text-gray-400">
            <Loader2 size={20} className="animate-spin" />
            <span>Loading suggestions...</span>
          </div>
        </div>
      ) : users.length > 0 ? (
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
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-gray-600 mb-4">👥</div>
          <h3 className="text-lg font-semibold mb-2">No suggestions available</h3>
          <p className="text-gray-400">
            Check back later for new people to follow
          </p>
        </div>
      )}
    </div>
  );
}