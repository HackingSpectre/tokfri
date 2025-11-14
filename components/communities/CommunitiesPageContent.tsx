'use client';

import MainLayout from '@/components/layout/MainLayout';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useWallet } from '@/lib/context/WalletContext';
import { ArrowLeft, Loader2, Users, Lock, Search, Plus } from 'lucide-react';

interface Community {
  id: string;
  name: string;
  slug: string;
  description: string;
  avatarUrl: string | null;
  isPrivate: boolean;
  memberCount: number;
  postCount: number;
  isMember?: boolean;
  memberRole?: string | null;
  creator: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl: string | null;
  };
}

export default function CommunitiesPageContent() {
  const router = useRouter();
  const { user } = useWallet();
  const [selectedCommunity, setSelectedCommunity] = useState<string | null>(null);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Redirect to login if no user
  useEffect(() => {
    if (!user) {
      router.push('/');
    }
  }, [user, router]);

  useEffect(() => {
    if (user) {
      fetchCommunities();
    }
  }, [searchQuery, user]);

  async function fetchCommunities() {
    try {
      setIsLoading(true);
      const url = `/api/communities?limit=20${searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : ''}`;
      const response = await fetch(url);
      
      if (response.ok) {
        const data = await response.json();
        setCommunities(data.communities || []);
      }
    } catch (error) {
      console.error('Failed to fetch communities:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function joinCommunity(communityId: string) {
    if (!user) return;
    
    try {
      const response = await fetch(`/api/communities/${communityId}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      });

      if (response.ok) {
        // Refresh communities to update membership status
        fetchCommunities();
      }
    } catch (error) {
      console.error('Failed to join community:', error);
    }
  }

  // Show nothing while redirecting
  if (!user) {
    return null;
  }

  if (selectedCommunity) {
    const community = communities.find(c => c.id === selectedCommunity);
    
    if (!community) {
      return (
        <MainLayout>
          <div className="text-center py-16">
            <Users size={48} className="text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Community not found</h3>
            <button 
              onClick={() => setSelectedCommunity(null)}
              className="text-primary hover:underline"
            >
              Back to communities
            </button>
          </div>
        </MainLayout>
      );
    }
    
    return (
      <MainLayout>
        <div className="flex flex-col h-[calc(100vh-8rem)]">
          <div className="glass-dark border-b border-white/10 p-4">
            <button 
              onClick={() => setSelectedCommunity(null)} 
              className="p-2 hover:bg-white/5 rounded-lg transition-colors mb-3"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-blue-600 rounded-full flex items-center justify-center overflow-hidden">
                {community.avatarUrl ? (
                  <img 
                    src={community.avatarUrl} 
                    alt={`${community.name} avatar`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Users size={20} className="text-white" />
                )}
              </div>
              <div className="flex-1">
                <h2 className="font-bold text-lg">{community.name}</h2>
                <p className="text-sm text-gray-400">{community.memberCount} members</p>
              </div>
              {community.isPrivate && (
                <span className="text-xs px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded-full flex items-center gap-1">
                  <Lock size={12} />
                  Private
                </span>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            <div className="text-center py-8">
              <Users size={48} className="text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No posts yet</h3>
              <p className="text-gray-400 text-sm">
                Be the first to share something in this community!
              </p>
            </div>
          </div>

          <div className="glass-dark border-t border-white/10 p-4">
            <input
              type="text"
              placeholder="Share something with the community..."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 focus:outline-none focus:border-primary"
            />
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="p-4 space-y-4">
        {/* Search Bar */}
        <div className="glass rounded-xl p-4">
          <div className="relative">
            <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search communities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-primary"
            />
          </div>
        </div>

        {/* Create Community Button */}
        <button className="w-full glass rounded-xl p-4 hover:bg-white/5 transition-colors flex items-center gap-3">
          <Plus size={20} className="text-primary" />
          <span className="font-semibold">Create Community</span>
        </button>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={24} className="animate-spin text-primary" />
          </div>
        ) : communities.length > 0 ? (
          <div className="space-y-3">
            {communities.map((community) => (
              <div key={community.id} className="glass rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary to-blue-600 rounded-full flex items-center justify-center overflow-hidden">
                    {community.avatarUrl ? (
                      <img 
                        src={community.avatarUrl} 
                        alt={`${community.name} avatar`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Users size={20} className="text-white" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold">{community.name}</h3>
                      {community.isPrivate && (
                        <Lock size={14} className="text-yellow-400" />
                      )}
                    </div>
                    <p className="text-sm text-gray-400">{community.description}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-4">
                    <span className="text-gray-400">{community.memberCount} members</span>
                    <span className="text-gray-400">{community.postCount} posts</span>
                  </div>
                  <span className="text-xs text-gray-400">
                    by @{community.creator.username}
                  </span>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedCommunity(community.id)}
                    className="flex-1 py-2 glass rounded-xl font-semibold hover:bg-white/10 transition-colors"
                  >
                    View
                  </button>
                  {!community.isMember ? (
                    <button
                      onClick={() => joinCommunity(community.id)}
                      className="flex-1 py-2 bg-primary rounded-xl font-semibold hover:bg-primary-dark transition-colors"
                    >
                      {community.isPrivate ? 'Request Access' : 'Join'}
                    </button>
                  ) : (
                    <span className="flex-1 py-2 bg-green-500/20 text-green-400 rounded-xl font-semibold text-center">
                      Joined
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Users size={48} className="text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No communities found</h3>
            <p className="text-gray-400">
              {searchQuery ? 'Try a different search term' : 'Be the first to create a community!'}
            </p>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
