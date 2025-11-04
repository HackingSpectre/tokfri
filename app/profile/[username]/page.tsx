'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useWallet } from '@/lib/context/WalletContext';
import MainLayout from '@/components/layout/MainLayout';
import { ProfileHeader, ProfileStats, ProfileTabs, PostsList, LoadingState, ErrorState } from '@/components/profile';
import type { User, Post, ProfileState } from '@/components/profile';

export default function UserProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { user: currentUser } = useWallet();
  const username = params?.username as string;
  
  const [state, setState] = useState<ProfileState>({
    user: null,
    posts: [],
    isLoading: true,
    isFollowing: false,
    activeTab: 'posts',
    hasMore: true
  });

  const fetchProfile = useCallback(async () => {
    if (!username) return;

    try {
      setState(prev => ({ ...prev, isLoading: true }));

      // Fetch user by username
      const userResponse = await fetch(`/api/users/resolve?username=${username}`);
      if (!userResponse.ok) {
        setState(prev => ({ ...prev, isLoading: false }));
        return;
      }
      
      const userData = await userResponse.json();
      const user = userData.user;

      // Check if current user is following this user
      let isFollowing = false;
      if (currentUser?.id && user.id !== currentUser.id) {
        const followResponse = await fetch(`/api/users/${user.id}/followers`);
        if (followResponse.ok) {
          const followData = await followResponse.json();
          isFollowing = followData.followers?.some((f: any) => f.id === currentUser.id) || false;
        }
      }
      
      // Fetch user posts
      const postsResponse = await fetch(`/api/posts?userId=${user.id}&limit=20`);
      const postsData = postsResponse.ok ? await postsResponse.json() : { posts: [] };

      setState(prev => ({
        ...prev,
        user: user,
        posts: postsData.posts || [],
        isLoading: false,
        isFollowing,
        hasMore: postsData.hasMore || false
      }));
    } catch (error) {
      console.error('Error fetching profile:', error);
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [username, currentUser?.id]);

  const loadMorePosts = useCallback(async () => {
    if (!state.user || state.isLoading || !state.hasMore) return;

    try {
      const response = await fetch(
        `/api/posts?userId=${state.user.id}&limit=20&offset=${state.posts.length}`
      );
      
      if (response.ok) {
        const data = await response.json();
        setState(prev => ({
          ...prev,
          posts: [...prev.posts, ...(data.posts || [])],
          hasMore: data.hasMore || false
        }));
      }
    } catch (error) {
      console.error('Error loading more posts:', error);
    }
  }, [state.user, state.isLoading, state.hasMore, state.posts.length]);

  const handleTabChange = useCallback((tab: 'posts' | 'media' | 'likes') => {
    setState(prev => ({ ...prev, activeTab: tab }));
  }, []);

  const handleFollow = useCallback(async () => {
    if (!currentUser?.id || !state.user) return;

    try {
      const response = await fetch(`/api/users/${state.user.id}/follow`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id })
      });

      if (response.ok) {
        const result = await response.json();
        setState(prev => ({
          ...prev,
          isFollowing: result.isFollowing,
          user: prev.user ? {
            ...prev.user,
            followersCount: result.followerCount
          } : null
        }));
      }
    } catch (error) {
      console.error('Error following/unfollowing user:', error);
    }
  }, [currentUser?.id, state.user]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // Loading state
  if (state.isLoading && !state.user) {
    return (
      <MainLayout>
        <div className="max-w-2xl mx-auto p-4">
          <LoadingState message="Loading profile..." />
        </div>
      </MainLayout>
    );
  }

  // Error state (user not found)
  if (!state.user) {
    return (
      <MainLayout>
        <div className="max-w-2xl mx-auto p-4">
          <ErrorState
            title="User Not Found"
            message={`The profile @${username} doesn't exist or has been removed.`}                                                                                                                                                                                                                                                                                                                                             
            actionLabel="Go Back"
            onAction={() => router.back()}
          />
        </div>                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              
      </MainLayout>
        );
  }

  // Check if viewing own profile
  const isOwnProfile = currentUser?.id === state.user.id;

  // Calculate tab counts
  const tabCounts = {
    posts: state.user.postsCount,
    media: 0, // TODO: Calculate media posts count
    likes: 0  // TODO: Calculate liked posts count
  };

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto space-y-6 p-4">
        {/* Profile Header */}
        <ProfileHeader
          user={state.user}
          isOwnProfile={isOwnProfile}
          isFollowing={state.isFollowing}
          onFollow={handleFollow}
          onEdit={() => router.push('/profile')} // Redirect to own profile for editing
        />

        {/* Profile Stats */}
        <ProfileStats
          stats={{
            posts: state.user.postsCount,
            followers: state.user.followersCount,
            following: state.user.followingCount
          }}
          username={state.user.username}
          isClickable={true}
        />

        {/* Profile Tabs */}
        <ProfileTabs
          activeTab={state.activeTab}
          onTabChange={handleTabChange}
          counts={tabCounts}
        />

        {/* Posts List */}
        <PostsList
          posts={state.posts}
          isLoading={state.isLoading}
          hasMore={state.hasMore}
          onLoadMore={loadMorePosts}
          emptyMessage={
            isOwnProfile 
              ? "You haven't posted anything yet. Share your first post!"
              : `@${state.user.username} hasn't posted anything yet.`
          }
        />
      </div>
    </MainLayout>
  );
}