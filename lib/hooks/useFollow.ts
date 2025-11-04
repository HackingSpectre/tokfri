'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@/lib/context/WalletContext';

interface UseFollowOptions {
  userId: string;
  initialIsFollowing?: boolean;
  initialFollowerCount?: number;
}

interface UseFollowReturn {
  isFollowing: boolean;
  followerCount: number;
  isLoading: boolean;
  error: string | null;
  toggleFollow: () => Promise<void>;
  refreshFollowStatus: () => Promise<void>;
}

export function useFollow({ 
  userId, 
  initialIsFollowing = false, 
  initialFollowerCount = 0 
}: UseFollowOptions): UseFollowReturn {
  const { user } = useWallet();
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [followerCount, setFollowerCount] = useState(initialFollowerCount);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch initial follow status
  const refreshFollowStatus = async () => {
    if (!user?.id || !userId || user.id === userId) return;

    try {
      setError(null);
      const response = await fetch(`/api/users/${userId}/follow?userId=${user.id}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch follow status');
      }

      const data = await response.json();
      setIsFollowing(data.isFollowing);
      setFollowerCount(data.followerCount);
    } catch (err: any) {
      console.error('Error fetching follow status:', err);
      setError(err.message);
    }
  };

  // Toggle follow status
  const toggleFollow = async () => {
    if (!user?.id || !userId || user.id === userId || isLoading) return;

    setIsLoading(true);
    setError(null);

    const wasFollowing = isFollowing;
    const previousCount = followerCount;

    // Optimistic update
    setIsFollowing(!wasFollowing);
    setFollowerCount(prev => wasFollowing ? prev - 1 : prev + 1);

    try {
      const response = await fetch(`/api/users/${userId}/follow`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user.id }),
      });

      if (!response.ok) {
        throw new Error('Failed to update follow status');
      }

      const result = await response.json();
      
      // Update with server response
      setIsFollowing(result.isFollowing);
      setFollowerCount(result.followerCount);
    } catch (err: any) {
      console.error('Error updating follow status:', err);
      setError(err.message);
      
      // Revert optimistic update on error
      setIsFollowing(wasFollowing);
      setFollowerCount(previousCount);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch follow status on mount and when dependencies change
  useEffect(() => {
    refreshFollowStatus();
  }, [user?.id, userId]);

  return {
    isFollowing,
    followerCount,
    isLoading,
    error,
    toggleFollow,
    refreshFollowStatus
  };
}

// Hook for fetching followers list
export function useFollowers(userId: string, limit = 20) {
  const [followers, setFollowers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [offset, setOffset] = useState(0);

  const fetchFollowers = async (reset = false) => {
    if (!userId) return;

    setIsLoading(true);
    setError(null);

    try {
      const currentOffset = reset ? 0 : offset;
      const response = await fetch(`/api/users/${userId}/followers?limit=${limit}&offset=${currentOffset}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch followers');
      }

      const data = await response.json();
      
      if (reset) {
        setFollowers(data.followers);
        setOffset(limit);
      } else {
        setFollowers(prev => [...prev, ...data.followers]);
        setOffset(prev => prev + limit);
      }
      
      setHasMore(data.pagination.hasMore);
    } catch (err: any) {
      console.error('Error fetching followers:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const refresh = () => fetchFollowers(true);
  const loadMore = () => fetchFollowers(false);

  useEffect(() => {
    if (userId) {
      refresh();
    }
  }, [userId]);

  return {
    followers,
    isLoading,
    error,
    hasMore,
    refresh,
    loadMore
  };
}

// Hook for fetching following list
export function useFollowing(userId: string, limit = 20) {
  const [following, setFollowing] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [offset, setOffset] = useState(0);

  const fetchFollowing = async (reset = false) => {
    if (!userId) return;

    setIsLoading(true);
    setError(null);

    try {
      const currentOffset = reset ? 0 : offset;
      const response = await fetch(`/api/users/${userId}/following?limit=${limit}&offset=${currentOffset}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch following');
      }

      const data = await response.json();
      
      if (reset) {
        setFollowing(data.following);
        setOffset(limit);
      } else {
        setFollowing(prev => [...prev, ...data.following]);
        setOffset(prev => prev + limit);
      }
      
      setHasMore(data.pagination.hasMore);
    } catch (err: any) {
      console.error('Error fetching following:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const refresh = () => fetchFollowing(true);
  const loadMore = () => fetchFollowing(false);

  useEffect(() => {
    if (userId) {
      refresh();
    }
  }, [userId]);

  return {
    following,
    isLoading,
    error,
    hasMore,
    refresh,
    loadMore
  };
}