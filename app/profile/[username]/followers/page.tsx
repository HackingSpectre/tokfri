'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import { 
  UserListHeader, 
  UserListItem, 
  LoadingState, 
  ErrorState, 
  EmptyState,
  type UserListUser,
  type UserListState
} from '@/components/profile';
import { User } from 'lucide-react';

export default function FollowersPage() {
  const params = useParams();
  const router = useRouter();
  const username = params?.username as string;
  
  const [state, setState] = useState<UserListState>({
    users: [],
    isLoading: true,
    error: null,
    hasMore: true
  });

  // Fetch followers
  useEffect(() => {
    const fetchFollowers = async () => {
      if (!username) return;

      try {
        setState(prev => ({ ...prev, isLoading: true, error: null }));

        // First resolve username to get user ID
        const userResponse = await fetch(`/api/users/resolve?username=${username}`);
        if (!userResponse.ok) {
          throw new Error('User not found');
        }

        const userData = await userResponse.json();
        const userId = userData.user.id;

        // Fetch followers
        const followersResponse = await fetch(`/api/users/${userId}/followers?limit=50`);
        if (!followersResponse.ok) {
          throw new Error('Failed to fetch followers');
        }

        const followersData = await followersResponse.json();
        const followers: UserListUser[] = followersData.followers || [];

        setState({
          users: followers,
          isLoading: false,
          error: null,
          hasMore: followers.length >= 50
        });

      } catch (err: any) {
        setState({
          users: [],
          isLoading: false,
          error: err.message,
          hasMore: false
        });
      }
    };

    fetchFollowers();
  }, [username]);

  // Handle back navigation
  const handleBack = () => {
    router.back();
  };

  // Loading state
  if (state.isLoading) {
    return (
      <MainLayout>
        <div className="max-w-2xl mx-auto">
          <UserListHeader
            title="Followers"
            subtitle={`@${username}`}
            onBack={handleBack}
          />
          <LoadingState message="Loading followers..." />
        </div>
      </MainLayout>
    );
  }

  // Error state
  if (state.error) {
    return (
      <MainLayout>
        <div className="max-w-2xl mx-auto">
          <UserListHeader
            title="Followers"
            subtitle={`@${username}`}
            onBack={handleBack}
          />
          <ErrorState
            title="Error Loading Followers"
            message={state.error}
            actionLabel="Try Again"
            onAction={() => window.location.reload()}
          />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto space-y-6 pb-6">
        {/* Header */}
        <UserListHeader
          title="Followers"
          subtitle={`@${username}`}
          onBack={handleBack}
        />

        {/* Followers List */}
        <div className="px-4">
          {state.users.length > 0 ? (
            <div className="space-y-4">
              {state.users.map((follower) => (
                <UserListItem
                  key={follower.id}
                  user={follower}
                  isFollowing={false} // TODO: Track actual follow status
                  showFollowButton={true}
                  size="md"
                />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<User size={48} className="text-gray-600 mx-auto mb-4" />}
              title="No followers yet"
              message={`@${username} doesn't have any followers yet.`}
            />
          )}
        </div>
      </div>
    </MainLayout>
  );
}