'use client';

import { useState, useEffect, useCallback } from 'react';
import { useWallet } from '@/lib/context/WalletContext';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import { ProfileHeader, ProfileStats, ProfileTabs, PostsList, LoadingState, ErrorState } from '@/components/profile';
import type { User, Post, ProfileState } from '@/components/profile';

export default function ProfilePageContent() {
  const { user: walletUser } = useWallet();
  const router = useRouter();
  
  const [state, setState] = useState<ProfileState>({
    user: null,
    posts: [],
    isLoading: true,
    isFollowing: false,
    activeTab: 'posts',
    hasMore: true
  });

  const fetchProfile = useCallback(async () => {
    if (!walletUser?.id) return;

    try {
      setState(prev => ({ ...prev, isLoading: true }));

      const profileUser: User = {
        id: walletUser.id,
        username: walletUser.username || '',
        displayName: walletUser.displayName || '',
        email: '', // Not available in wallet user
        avatarUrl: walletUser.avatarUrl || '',
        verified: walletUser.verified || false,
        bio: walletUser.bio || '',
        website: walletUser.websiteUrl || undefined,
        location: '', // Not available in wallet user
        joinedAt: walletUser.createdAt || new Date().toISOString(),
        followersCount: 0, // Will be fetched from API
        followingCount: 0, // Will be fetched from API
        postsCount: 0 // Will be fetched from API
      };
      
      const postsResponse = await fetch(`/api/posts?userId=${walletUser.id}&limit=20`);
      const postsData = postsResponse.ok ? await postsResponse.json() : { posts: [] };

      setState(prev => ({
        ...prev,
        user: profileUser,
        posts: postsData.posts || [],
        isLoading: false,
        hasMore: postsData.hasMore || false
      }));
    } catch (error) {
      console.error('Error fetching profile:', error);
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [walletUser]);

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

  const handleEditProfile = useCallback(() => {
    console.log('Edit profile clicked');
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  if (!walletUser) {
    router.push('/');
    return null;
  }

  if (state.isLoading && !state.user) {
    return (
      <MainLayout>
        <div className="max-w-2xl mx-auto p-4">
          <LoadingState message="Loading your profile..." />
        </div>
      </MainLayout>
    );
  }

  if (!state.user) {
    return (
      <MainLayout>
        <div className="max-w-2xl mx-auto p-4">
          <ErrorState
            title="Profile Not Found"
            message="We couldn't load your profile. Please try again."
            actionLabel="Retry"
            onAction={fetchProfile}
          />
        </div>
      </MainLayout>
    );
  }

  const tabCounts = {
    posts: state.user.postsCount,
    media: 0,
    likes: 0
  };

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto space-y-6 p-4">
        <ProfileHeader
          user={state.user}
          isOwnProfile={true}
          onEdit={handleEditProfile}
        />

        <ProfileStats
          stats={{
            posts: state.user.postsCount,
            followers: state.user.followersCount,
            following: state.user.followingCount
          }}
          username={state.user.username}
          isClickable={true}
        />

        <ProfileTabs
          activeTab={state.activeTab}
          onTabChange={handleTabChange}
          counts={tabCounts}
        />

        <PostsList
          posts={state.posts}
          isLoading={state.isLoading}
          hasMore={state.hasMore}
          onLoadMore={loadMorePosts}
          emptyMessage="You haven't posted anything yet. Share your first post!"
        />
      </div>
    </MainLayout>
  );
}
