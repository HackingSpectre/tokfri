import { useState, useEffect, useCallback } from 'react';
import { PostData, FeedState, FeedActions } from '@/types/feed';
import { useCache } from '@/lib/hooks/useCache';

interface UseFeedOptions {
  limit?: number;
  cacheKey?: string;
  cacheTtl?: number;
}

export function useFeed(options: UseFeedOptions = {}): FeedState & FeedActions {
  const { 
    limit = 20, 
    cacheKey = 'feed-posts', 
    cacheTtl = 30000 
  } = options;

  const [posts, setPosts] = useState<PostData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);

  // Cache for posts data
  const postsCache = useCache<PostData[]>({ ttl: cacheTtl, maxSize: 10 });

  // Fetch posts with caching
  const fetchPosts = useCallback(async (refresh = false) => {
    try {
      if (refresh) {
        setIsRefreshing(true);
        setOffset(0);
      } else {
        setIsLoading(true);
      }
      
      setError('');

      // Check cache first if not refreshing
      if (!refresh) {
        const cached = postsCache.get(cacheKey);
        if (cached) {
          setPosts(cached);
          setIsLoading(false);
          return;
        }
      }

      const currentOffset = refresh ? 0 : offset;
      const response = await fetch(`/api/posts?limit=${limit}&offset=${currentOffset}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch posts');
      }

      const newPosts = data.posts || [];
      
      if (refresh) {
        setPosts(newPosts);
        setOffset(newPosts.length);
      } else {
        setPosts(prev => currentOffset === 0 ? newPosts : [...prev, ...newPosts]);
        setOffset(prev => prev + newPosts.length);
      }

      setHasMore(newPosts.length === limit);
      postsCache.set(cacheKey, newPosts);
      
    } catch (err: any) {
      setError(err.message || 'Failed to load posts');
      console.error('Error fetching posts:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [limit, offset, postsCache, cacheKey]);

  // Load more posts (pagination)
  const loadMore = useCallback(async () => {
    if (!hasMore || isLoading) return;
    await fetchPosts(false);
  }, [hasMore, isLoading, fetchPosts]);

  // Handle like with optimistic updates
  const handleLike = useCallback((postId: string, isLiked: boolean) => {
    // Optimistic update - update local state immediately
    setPosts(prev => prev.map(post => 
      post.id === postId 
        ? { 
            ...post, 
            likeCount: isLiked ? post.likeCount + 1 : post.likeCount - 1 
          }
        : post
    ));
    
    // Update cache with new state
    const updatedPosts = posts.map(post => 
      post.id === postId 
        ? { 
            ...post, 
            likeCount: isLiked ? post.likeCount + 1 : post.likeCount - 1 
          }
        : post
    );
    postsCache.set(cacheKey, updatedPosts);
  }, [posts, postsCache, cacheKey]);

  // Handle refresh
  const handleRefresh = useCallback(() => {
    postsCache.remove(cacheKey);
    fetchPosts(true);
  }, [fetchPosts, postsCache, cacheKey]);

  // Initial load
  useEffect(() => {
    fetchPosts();
  }, []);

  return {
    // State
    posts,
    isLoading,
    isRefreshing,
    error,
    hasMore,
    
    // Actions
    fetchPosts,
    handleLike,
    handleRefresh,
    loadMore
  };
}