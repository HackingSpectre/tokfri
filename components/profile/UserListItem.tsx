'use client';

import { useState } from 'react';
import { UserListItemProps } from './types';
import { User, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import FollowButton from '@/components/ui/FollowButton';

export default function UserListItem({ 
  user, 
  isFollowing: initialIsFollowing = false, 
  showFollowButton = true,
  size = 'md'
}: UserListItemProps) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [followerCount, setFollowerCount] = useState(user.followerCount || 0);

  const handleFollowChange = (newIsFollowing: boolean, newFollowerCount: number) => {
    setIsFollowing(newIsFollowing);
    setFollowerCount(newFollowerCount);
  };
  const sizeConfig = {
    sm: {
      avatar: 'w-10 h-10',
      iconSize: 16,
      nameText: 'text-sm',
      usernameText: 'text-xs',
      bioText: 'text-xs',
      padding: 'p-3',
      gap: 'gap-2',
      badgeSize: 'w-4 h-4',
      buttonSize: 'sm' as const
    },
    md: {
      avatar: 'w-12 h-12',
      iconSize: 20,
      nameText: 'text-base',
      usernameText: 'text-sm',
      bioText: 'text-sm',
      padding: 'p-4',
      gap: 'gap-3',
      badgeSize: 'w-5 h-5',
      buttonSize: 'sm' as const
    },
    lg: {
      avatar: 'w-16 h-16',
      iconSize: 24,
      nameText: 'text-lg',
      usernameText: 'text-base',
      bioText: 'text-base',
      padding: 'p-5',
      gap: 'gap-4',
      badgeSize: 'w-6 h-6',
      buttonSize: 'md' as const
    }
  };

  const config = sizeConfig[size];

  return (
    <div className={`glass rounded-xl ${config.padding} flex items-start ${config.gap} hover:bg-white/5 transition-colors`}>
      {/* Avatar */}
      <Link 
        href={`/profile/${user.username}`}
        className="flex-shrink-0 group"
      >
        <div className={`${config.avatar} bg-gradient-to-br from-primary to-blue-600 rounded-full flex items-center justify-center overflow-hidden group-hover:scale-105 transition-transform`}>
          {user.avatarUrl ? (
            <img 
              src={user.avatarUrl} 
              alt={`${user.username}'s avatar`}
              className="w-full h-full object-cover"
            />
          ) : (
            <User size={config.iconSize} className="text-white" />
          )}
        </div>
      </Link>

      {/* User Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <Link 
              href={`/profile/${user.username}`}
              className="block group"
            >
              <div className="flex items-center gap-2 mb-1">
                <h3 className={`font-semibold group-hover:text-primary transition-colors truncate ${config.nameText}`}>
                  {user.displayName || `@${user.username}`}
                </h3>
                {user.verified && (
                  <CheckCircle 
                    size={config.badgeSize.includes('4') ? 16 : config.badgeSize.includes('5') ? 20 : 24}
                    className="text-primary flex-shrink-0" 
                  />
                )}
              </div>
              <p className={`text-gray-400 mb-2 ${config.usernameText}`}>
                @{user.username}
              </p>
              {user.bio && (
                <p className={`text-gray-300 leading-relaxed line-clamp-2 ${config.bioText}`}>
                  {user.bio}
                </p>
              )}
            </Link>
          </div>

          {/* Follow Button */}
          {showFollowButton && (
            <div className="flex-shrink-0 ml-3">
              <FollowButton
                userId={user.id}
                username={user.username}
                isFollowing={isFollowing}
                followerCount={followerCount}
                onFollowChange={handleFollowChange}
                variant="secondary"
                size={config.buttonSize}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}