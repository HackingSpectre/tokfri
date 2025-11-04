'use client';

import MainLayout from '@/components/layout/MainLayout';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { TrendingUp, Hash } from 'lucide-react';
import { useUserSearch, useSearchHistory } from '@/lib/hooks/useUserSearch';
import { useWallet } from '@/lib/context/WalletContext';

// Import modular components
import ExploreHeader from '@/components/explore/ExploreHeader';
import SearchSection from '@/components/explore/SearchSection';
import TabNavigation, { ExploreTab } from '@/components/explore/TabNavigation';
import UserSearchResults from '@/components/explore/UserSearchResults';
import TrendingUsers from '@/components/explore/TrendingUsers';
import EmptyState from '@/components/explore/EmptyState';

export default function ExplorePageContent() {
  const router = useRouter();
  const { user } = useWallet();
  const searchParams = useSearchParams();
  const initialQuery = searchParams?.get('q') || '';
  
  const [activeTab, setActiveTab] = useState<ExploreTab>('users');
  const [trendingUsers, setTrendingUsers] = useState<any[]>([]);
  const [isLoadingTrending, setIsLoadingTrending] = useState(false);
  const hasInitialized = useRef(false);

  // Search functionality
  const {
    users: searchResults,
    query: currentQuery,
    isLoading: isSearching,
    error: searchError,
    hasMore,
    search,
    loadMore,
    clearResults
  } = useUserSearch({
    limit: 20,
    debounceMs: 300,
    cacheResults: true,
    autoSearch: true
  });

  // Search history
  const {
    searchHistory,
    addToHistory,
    removeFromHistory,
    clearHistory
  } = useSearchHistory();

  // Load trending/popular users
  const loadTrendingUsers = async () => {
    setIsLoadingTrending(true);
    try {
      const response = await fetch('/api/search/users?limit=10');
      if (response.ok) {
        const data = await response.json();
        setTrendingUsers(data.users);
      }
    } catch (error) {
      console.error('Error loading trending users:', error);
    } finally {
      setIsLoadingTrending(false);
    }
  };

  // Initialize with URL query if present - run only once on mount
  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;
    
    if (initialQuery) {
      search(initialQuery);
    } else {
      loadTrendingUsers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = useCallback((query: string) => {
    search(query);
    
    if (query.trim()) {
      router.push(`/explore?q=${encodeURIComponent(query)}`);
      addToHistory(query);
    } else {
      router.push('/explore');
      loadTrendingUsers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  const handleHistorySelect = useCallback((query: string) => {
    search(query);
    router.push(`/explore?q=${encodeURIComponent(query)}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  const handleClearSearch = useCallback(() => {
    clearResults();
    router.push('/explore');
    loadTrendingUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'users':
        return currentQuery ? (
          <UserSearchResults
            users={searchResults}
            query={currentQuery}
            isLoading={isSearching}
            hasMore={hasMore}
            error={searchError}
            onLoadMore={loadMore}
          />
        ) : (
          <TrendingUsers
            users={trendingUsers}
            isLoading={isLoadingTrending}
          />
        );
      
      case 'trending':
        return (
          <EmptyState
            icon={<TrendingUp size={48} />}
            title="Trending Coming Soon"
            description="We're working on trending topics and posts"
          />
        );
      
      case 'hashtags':
        return (
          <EmptyState
            icon={<Hash size={48} />}
            title="Hashtags Coming Soon"
            description="Hashtag search and trending will be available soon"
          />
        );
      
      default:
        return null;
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6 pb-6">
        <ExploreHeader />

        <div className="px-4 space-y-6">
          <SearchSection
            onSearch={handleSearch}
            onClear={handleClearSearch}
            isLoading={isSearching}
            autoFocus={!!initialQuery}
            searchHistory={searchHistory}
            onHistorySelect={handleHistorySelect}
            onRemoveFromHistory={removeFromHistory}
            onClearHistory={clearHistory}
            currentQuery={currentQuery}
          />

          <TabNavigation
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />

          {renderTabContent()}
        </div>
      </div>
    </MainLayout>
  );
}
