'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import FeedContent from '@/components/feed/FeedContent';
import FloatingActionButton from '@/components/feed/FloatingActionButton';
import { useWallet } from '@/lib/context/WalletContext';
import { useFeed } from '@/lib/hooks/useFeed';
import { FeedTab } from '@/types/feed';
import Image from 'next/image';

export default function FeedPageContent() {
  const { user } = useWallet();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('for-you');
  const [users, setUsers] = useState<any[]>([]);
  

  const {
    posts,
    isLoading,
    isRefreshing,
    error,
    handleLike,
    handleRefresh,
    fetchPosts
  } = useFeed();


  const feedTabs: FeedTab[] = [
    { id: 'for-you', label: 'For you' },
    { id: 'following', label: 'Following' },
    { id: 'communities', label: 'Communities' }
  ];

  // Fetch users for stories row
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/search/users?limit=10');
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

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

  // Redirect to login if no user
  useEffect(() => {
    if (!user) {
      router.push('/');
    }
  }, [user, router]);

  // Show nothing while redirecting
  if (!user) {
    return null;
  }

  return (
    <MainLayout>
      {/* Feed Container - Mobile First Design */}
      <div className="min-h-screen bg-white">
        {/* Top Bar - Profile + Menu */}
        <div className="bg-white border-b border-gray-200">


          {/* Horizontal Stories/Users Row */}
          <div className="px-4 py-3 overflow-x-auto scrollbar-hide">
            <div className="flex gap-4">
              {/* Your Story */}
              <div className="flex flex-col items-center flex-shrink-0">
                <div className="relative w-16 h-20 rounded-xl border-2 border-pink-500 p-0.5">
                  <div className="w-full h-full rounded-xl overflow-hidden bg-gray-200">
                    {user?.avatarUrl ? (
                      <Image 
                        src={user.avatarUrl} 
                        alt="You" 
                        width={64} 
                        height={80} 
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-pink-400 to-pink-600 flex items-center justify-center text-white font-bold text-lg rounded-xl">
                        {user?.username?.charAt(0).toUpperCase() || 'Y'}
                      </div>
                    )}
                  </div>
                </div>
                <span className="text-xs text-gray-600 mt-1">You</span>
              </div>

              {/* Other Users */}
              {users.map((u) => (
                <div key={u.id} className="flex flex-col items-center flex-shrink-0">
                  <div className="relative w-16 h-20 rounded-xl border-2 border-gray-300 p-0.5 cursor-pointer hover:border-pink-500 transition-colors">
                    <div className="w-full h-full rounded-xl overflow-hidden bg-gray-200">
                      {u.avatarUrl ? (
                        <Image 
                          src={u.avatarUrl} 
                          alt={u.username} 
                          width={64} 
                          height={80} 
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-pink-400 to-pink-600 flex items-center justify-center text-white font-bold text-lg rounded-xl">
                          {u.username?.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                  </div>
                  <span className="text-xs text-gray-600 mt-1 max-w-[64px] truncate">{u.username}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center border-b border-gray-200">
            {feedTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors relative ${
                  activeTab === tab.id
                    ? 'text-pink-600'
                    : 'text-gray-500 hover:text-pink-600'
                }`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-pink-600" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Feed Content */}
        <div className="max-w-2xl mx-auto">
          <FeedContent
            posts={posts}
            isLoading={isLoading}
            error={error}
            user={user}
            onLike={handleLike}
            onMintPost={handleMintPost}
            onRetry={() => fetchPosts()}
          />
        </div>

        {/* Floating Action Button for Mobile */}
        <FloatingActionButton onMintPost={handleMintPost} />
      </div>
    </MainLayout>
  );
}
