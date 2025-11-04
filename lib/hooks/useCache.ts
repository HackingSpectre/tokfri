'use client';

import { useRef, useCallback } from 'react';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

interface UseCacheOptions {
  ttl?: number; // Time to live in milliseconds
  maxSize?: number; // Maximum cache size
}

/**
 * Custom hook for client-side data caching with TTL and LRU eviction
 */
export function useCache<T>(options: UseCacheOptions = {}) {
  const { ttl = 60000, maxSize = 50 } = options; // Default: 60 seconds TTL, 50 items max
  
  const cacheRef = useRef<Map<string, CacheEntry<T>>>(new Map());
  const accessOrderRef = useRef<string[]>([]);

  /**
   * Get data from cache
   */
  const get = useCallback((key: string): T | null => {
    const entry = cacheRef.current.get(key);
    
    if (!entry) return null;
    
    // Check if expired
    const now = Date.now();
    if (now - entry.timestamp > ttl) {
      cacheRef.current.delete(key);
      return null;
    }
    
    // Update access order for LRU
    const index = accessOrderRef.current.indexOf(key);
    if (index > -1) {
      accessOrderRef.current.splice(index, 1);
    }
    accessOrderRef.current.push(key);
    
    return entry.data;
  }, [ttl]);

  /**
   * Set data in cache
   */
  const set = useCallback((key: string, data: T) => {
    // Evict oldest item if cache is full
    if (cacheRef.current.size >= maxSize && !cacheRef.current.has(key)) {
      const oldestKey = accessOrderRef.current.shift();
      if (oldestKey) {
        cacheRef.current.delete(oldestKey);
      }
    }
    
    cacheRef.current.set(key, {
      data,
      timestamp: Date.now(),
    });
    
    // Update access order
    const index = accessOrderRef.current.indexOf(key);
    if (index > -1) {
      accessOrderRef.current.splice(index, 1);
    }
    accessOrderRef.current.push(key);
  }, [maxSize]);

  /**
   * Clear entire cache
   */
  const clear = useCallback(() => {
    cacheRef.current.clear();
    accessOrderRef.current = [];
  }, []);

  /**
   * Remove specific key from cache
   */
  const remove = useCallback((key: string) => {
    cacheRef.current.delete(key);
    const index = accessOrderRef.current.indexOf(key);
    if (index > -1) {
      accessOrderRef.current.splice(index, 1);
    }
  }, []);

  /**
   * Check if key exists and is not expired
   */
  const has = useCallback((key: string): boolean => {
    const entry = cacheRef.current.get(key);
    if (!entry) return false;
    
    const now = Date.now();
    if (now - entry.timestamp > ttl) {
      cacheRef.current.delete(key);
      return false;
    }
    
    return true;
  }, [ttl]);

  return {
    get,
    set,
    clear,
    remove,
    has,
  };
}

/**
 * Hook for caching API responses with automatic fetching
 */
export function useCachedFetch<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: UseCacheOptions & { enabled?: boolean } = {}
) {
  const { enabled = true, ...cacheOptions } = options;
  const cache = useCache<T>(cacheOptions);

  const fetchData = useCallback(async (force = false): Promise<T> => {
    // Return cached data if available and not forcing refresh
    if (!force) {
      const cached = cache.get(key);
      if (cached !== null) {
        return cached;
      }
    }

    // Fetch fresh data
    const data = await fetcher();
    cache.set(key, data);
    return data;
  }, [key, fetcher, cache]);

  const invalidate = useCallback(() => {
    cache.remove(key);
  }, [key, cache]);

  return {
    fetchData,
    invalidate,
    getCached: () => cache.get(key),
  };
}
