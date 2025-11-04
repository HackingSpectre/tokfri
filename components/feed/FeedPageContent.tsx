'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import FeedHeader from '@/components/feed/FeedHeader';
import PostComposer from '@/components/feed/PostComposer';
import FeedContent from '@/components/feed/FeedContent';
import FeedSidebar from '@/components/feed/FeedSidebar';
import FloatingActionButton from '@/components/feed/FloatingActionButton';
import { useWallet } from '@/lib/context/WalletContext';
import { useFeed } from '@/lib/hooks/useFeed';
import { User } from 'lucide-react';
import { FeedTab } from '@/types/feed';

export default function FeedPageContent() {
  const { user } = useWallet();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('for-you');
  
  // Use the custom feed hook for all feed logic
  const {
    posts,
    isLoading,
    isRefreshing,
    error,
    handleLike,
    handleRefresh,
    fetchPosts
  } = useFeed();

  // Feed tabs configuration
  const feedTabs: FeedTab[] = [
    { id: 'for-you', label: 'For you' },
    { id: 'following', label: 'Following' },
    { id: 'latest', label: 'Latest' }
  ];

  // Navigate to mint page when user wants to mint a post
  const handleMintPost = () => {
    router.push('/mint');
  };

  // Handle tab changes (for future implementation)
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    // TODO: Implement different feed types based on tab
  };

  // Handle follow user action
  const handleFollowUser = async (userId: string) => {
    // TODO: Implement follow user functionality
    console.log('Following user:', userId);
  };

  if (!user) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-4">
            <User size={48} className="text-gray-600 mx-auto" />
            <h2 className="text-xl font-bold">Please log in</h2>
            <p className="text-gray-400">You need to be logged in to view the feed</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      {/* Simple Feed Layout */}
      <div className="max-w-2xl mx-auto py-4">
        {/* Feed Header */}
        <FeedHeader
          tabs={feedTabs}
          activeTab={activeTab}
          onTabChange={handleTabChange}
          onRefresh={handleRefresh}
          isRefreshing={isRefreshing}
        />

        {/* Post Composer */}
        <div className="mb-6">
          <PostComposer
            user={user}
            onMintPost={handleMintPost}
          />
        </div>

        {/* Feed Content */}
        <FeedContent
          posts={posts}
          isLoading={isLoading}
          error={error}
          user={user}
          onLike={handleLike}
          onMintPost={handleMintPost}
          onRetry={() => fetchPosts()}
        />

        {/* Floating Action Button for Mobile */}
        <FloatingActionButton onMintPost={handleMintPost} />
      </div>
    </MainLayout>
  );
}
