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

export default function FollowingPage() {
  const params = useParams();
  const router = useRouter();
  const username = params?.username as string;
  
  const [state, setState] = useState<UserListState>({
    users: [],
    isLoading: true,
    error: null,
    hasMore: true
  });

  // Fetch following
  useEffect(() => {
    const fetchFollowing = async () => {
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

        // Fetch following
        const followingResponse = await fetch(`/api/users/${userId}/following?limit=50`);
        if (!followingResponse.ok) {
          throw new Error('Failed to fetch following');
        }

        const followingData = await followingResponse.json();
        const following: UserListUser[] = followingData.following || [];

        setState({
          users: following,
          isLoading: false,
          error: null,
          hasMore: following.length >= 50
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

    fetchFollowing();
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
            title="Following"
            subtitle={`@${username}`}
            onBack={handleBack}
          />
          <LoadingState message="Loading following..." />
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
            title="Following"
            subtitle={`@${username}`}
            onBack={handleBack}
          />
          <ErrorState
            title="Error Loading Following"
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
          title="Following"
          subtitle={`@${username}`}
          onBack={handleBack}
        />

        {/* Following List */}
        <div className="px-4">
          {state.users.length > 0 ? (
            <div className="space-y-4">
              {state.users.map((user) => (
                <UserListItem
                  key={user.id}
                  user={user}
                  isFollowing={true} // Following page shows people we follow
                  showFollowButton={true}
                  size="md"
                />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<User size={48} className="text-gray-600 mx-auto mb-4" />}
              title="Not following anyone"
              message={`@${username} isn't following anyone yet.`}
            />
          )}
        </div>
      </div>
    </MainLayout>
  );
}