'use client';

import { useState } from 'react';
import { UserPlus, UserMinus, Loader2 } from 'lucide-react';
import { useWallet } from '@/lib/context/WalletContext';

interface FollowButtonProps {
  userId: string;
  username: string;
  isFollowing: boolean;
  isLoading?: boolean;
  followerCount?: number;
  onFollowChange?: (isFollowing: boolean, newFollowerCount: number) => void;
  variant?: 'default' | 'compact' | 'outline' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
}

export default function FollowButton({
  userId,
  username,
  isFollowing: initialIsFollowing,
  isLoading: externalLoading = false,
  followerCount = 0,
  onFollowChange,
  variant = 'default',
  size = 'md',
  disabled = false
}: FollowButtonProps) {
  const { user } = useWallet();
  const [isLoading, setIsLoading] = useState(false);

  const loading = isLoading || externalLoading;

  const handleFollowToggle = async () => {
    if (loading || disabled || !user?.id) return;

    setIsLoading(true);

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
      
      // Notify parent component
      onFollowChange?.(result.isFollowing, result.followerCount);
    } catch (error) {
      console.error('Error updating follow status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Size classes
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  // Icon sizes
  const iconSizes = {
    sm: 14,
    md: 16,
    lg: 18
  };

  // Base button classes
  const baseClasses = `
    inline-flex items-center gap-2 rounded-lg font-semibold transition-all duration-200 
    focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-black
    disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden
    ${sizeClasses[size]}
  `;

  // Variant-specific classes
  const variantClasses = {
    default: initialIsFollowing
      ? 'bg-gray-600 hover:bg-red-600 text-white border border-gray-500 hover:border-red-500'
      : 'bg-primary hover:bg-primary-dark text-white border border-primary hover:border-primary-dark',
    compact: initialIsFollowing
      ? 'bg-transparent hover:bg-red-500/10 text-gray-400 hover:text-red-400 border border-gray-600 hover:border-red-500'
      : 'bg-transparent hover:bg-primary/10 text-primary hover:text-primary-light border border-primary hover:border-primary-light',
    outline: initialIsFollowing
      ? 'bg-transparent hover:bg-red-500/10 text-white hover:text-red-400 border border-white/20 hover:border-red-500'
      : 'bg-transparent hover:bg-primary/10 text-white hover:text-primary border border-white/20 hover:border-primary',
    secondary: initialIsFollowing
      ? 'bg-gray-700 hover:bg-red-600 text-white border border-gray-600 hover:border-red-500'
      : 'bg-blue-600 hover:bg-blue-700 text-white border border-blue-600 hover:border-blue-700'
  };

  return (
    <button
      onClick={handleFollowToggle}
      disabled={loading || disabled}
      className={`${baseClasses} ${variantClasses[variant]} group`}
      aria-label={initialIsFollowing ? `Unfollow @${username}` : `Follow @${username}`}
    >
      {/* Loading state */}
      {loading ? (
        <>
          <Loader2 size={iconSizes[size]} className="animate-spin" />
          <span>{initialIsFollowing ? 'Unfollowing...' : 'Following...'}</span>
        </>
      ) : (
        <>
          {/* Follow state */}
          {initialIsFollowing ? (
            <>
              <UserMinus size={iconSizes[size]} className="transition-colors" />
              <span className="group-hover:hidden">Following</span>
              <span className="hidden group-hover:inline">Unfollow</span>
            </>
          ) : (
            <>
              <UserPlus size={iconSizes[size]} className="transition-colors" />
              <span>Follow</span>
            </>
          )}
        </>
      )}

      {/* Hover effect background */}
      <div className={`
        absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-200
        ${initialIsFollowing ? 'bg-red-500' : 'bg-primary'}
      `} />
    </button>
  );
}