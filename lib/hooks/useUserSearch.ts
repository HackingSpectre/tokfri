'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useWallet } from '@/lib/context/WalletContext';

interface SearchUser {
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
  relevance?: number;
}

interface SearchResult {
  users: SearchUser[];
  query: string;
  pagination: {
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

interface UseUserSearchOptions {
  limit?: number;
  debounceMs?: number;
  cacheResults?: boolean;
  autoSearch?: boolean;
}

interface UseUserSearchReturn {
  users: SearchUser[];
  query: string;
  isLoading: boolean;
  error: string | null;
  hasMore: boolean;
  totalResults: number;
  search: (searchQuery: string) => Promise<void>;
  loadMore: () => Promise<void>;
  clearResults: () => void;
  clearError: () => void;
}

export function useUserSearch(options: UseUserSearchOptions = {}): UseUserSearchReturn {
  const {
    limit = 20,
    debounceMs = 300,
    cacheResults = true,
    autoSearch = true
  } = options;

  const { user } = useWallet();
  const [users, setUsers] = useState<SearchUser[]>([]);
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [offset, setOffset] = useState(0);
  const [totalResults, setTotalResults] = useState(0);

  // Cache for search results
  const cacheRef = useRef<Map<string, SearchResult>>(new Map());
  const abortControllerRef = useRef<AbortController | null>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Search function
  const performSearch = useCallback(async (searchQuery: string, loadMore = false) => {
    const trimmedQuery = searchQuery.trim();
    const currentOffset = loadMore ? offset : 0;
    
    // Check cache first
    const cacheKey = `${trimmedQuery}-${currentOffset}`;
    if (cacheResults && cacheRef.current.has(cacheKey) && !loadMore) {
      const cachedResult = cacheRef.current.get(cacheKey)!;
      setUsers(cachedResult.users);
      setHasMore(cachedResult.pagination.hasMore);
      setTotalResults(cachedResult.users.length);
      return;
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        q: trimmedQuery,
        limit: limit.toString(),
        offset: currentOffset.toString(),
      });

      if (user?.id) {
        params.append('userId', user.id);
      }

      const response = await fetch(`/api/search/users?${params}`, {
        signal: abortControllerRef.current.signal
      });

      if (!response.ok) {
        throw new Error('Failed to search users');
      }

      const result: SearchResult = await response.json();

      if (loadMore) {
        setUsers(prev => [...prev, ...result.users]);
      } else {
        setUsers(result.users);
      }

      setHasMore(result.pagination.hasMore);
      setTotalResults(loadMore ? users.length + result.users.length : result.users.length);
      setOffset(loadMore ? currentOffset + limit : limit);

      // Cache the result
      if (cacheResults) {
        cacheRef.current.set(cacheKey, result);
        
        // Limit cache size to prevent memory issues
        if (cacheRef.current.size > 50) {
          const firstKey = cacheRef.current.keys().next().value;
          cacheRef.current.delete(firstKey);
        }
      }

    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error('Search error:', err);
        setError(err.message || 'Failed to search users');
      }
    } finally {
      setIsLoading(false);
    }
  }, [limit, offset, users.length, user?.id, cacheResults]);

  // Debounced search
  const search = useCallback(async (searchQuery: string) => {
    setQuery(searchQuery);
    
    if (!autoSearch) return;

    // Clear previous debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Reset pagination
    setOffset(0);

    if (!searchQuery.trim()) {
      setUsers([]);
      setHasMore(false);
      setTotalResults(0);
      return;
    }

    // Debounce the search
    debounceRef.current = setTimeout(() => {
      performSearch(searchQuery, false);
    }, debounceMs);
  }, [performSearch, autoSearch, debounceMs]);

  // Load more results
  const loadMore = useCallback(async () => {
    if (!hasMore || isLoading || !query.trim()) return;
    await performSearch(query, true);
  }, [hasMore, isLoading, query, performSearch]);

  // Clear results
  const clearResults = useCallback(() => {
    setUsers([]);
    setQuery('');
    setHasMore(false);
    setOffset(0);
    setTotalResults(0);
    setError(null);
    
    // Cancel any pending requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Clear debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  return {
    users,
    query,
    isLoading,
    error,
    hasMore,
    totalResults,
    search,
    loadMore,
    clearResults,
    clearError
  };
}

// Hook for search history
export function useSearchHistory() {
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  // Load search history from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('tokfri_search_history');
      if (saved) {
        setSearchHistory(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Error loading search history:', error);
    }
  }, []);

  const addToHistory = useCallback((query: string) => {
    if (!query.trim()) return;

    setSearchHistory(prev => {
      const trimmed = query.trim();
      const filtered = prev.filter(item => item !== trimmed);
      const newHistory = [trimmed, ...filtered].slice(0, 10); // Keep last 10 searches
      
      try {
        localStorage.setItem('tokfri_search_history', JSON.stringify(newHistory));
      } catch (error) {
        console.error('Error saving search history:', error);
      }
      
      return newHistory;
    });
  }, []);

  const removeFromHistory = useCallback((query: string) => {
    setSearchHistory(prev => {
      const newHistory = prev.filter(item => item !== query);
      
      try {
        localStorage.setItem('tokfri_search_history', JSON.stringify(newHistory));
      } catch (error) {
        console.error('Error updating search history:', error);
      }
      
      return newHistory;
    });
  }, []);

  const clearHistory = useCallback(() => {
    setSearchHistory([]);
    
    try {
      localStorage.removeItem('tokfri_search_history');
    } catch (error) {
      console.error('Error clearing search history:', error);
    }
  }, []);

  return {
    searchHistory,
    addToHistory,
    removeFromHistory,
    clearHistory
  };
}