'use client';

import { ProfileHeaderProps } from './types';
import { User, MapPin, Calendar, Link as LinkIcon, Edit3 } from 'lucide-react';
import Link from 'next/link';

export default function ProfileHeader({ 
  user, 
  isOwnProfile, 
  isFollowing = false, 
  onFollow, 
  onEdit 
}: ProfileHeaderProps) {
  const formatJoinDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      year: 'numeric' 
    });
  };

  const formatWebsite = (website: string) => {
    return website.replace(/^https?:\/\//, '').replace(/\/$/, '');
  };

  return (
    <div className="glass rounded-xl p-6 space-y-6">
      {/* Header Section */}
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="relative">
          <div className="w-20 h-20 bg-gradient-to-br from-primary to-blue-600 rounded-full flex items-center justify-center overflow-hidden">
            {user.avatarUrl ? (
              <img 
                src={user.avatarUrl} 
                alt={`${user.username}'s avatar`}
                className="w-full h-full object-cover"
              />
            ) : (
              <User size={32} className="text-white" />
            )}
          </div>
        </div>

        {/* Name and Action */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-xl font-bold truncate">
                  {user.displayName || `@${user.username}`}
                </h1>
                {user.verified && (
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-sm">✓</span>
                  </div>
                )}
              </div>
              <p className="text-gray-400 text-sm">@{user.username}</p>
            </div>

            {/* Action Button */}
            <div className="flex-shrink-0 ml-4">
              {isOwnProfile ? (
                <button
                  onClick={onEdit}
                  className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg transition-colors"
                >
                  <Edit3 size={16} />
                  <span className="hidden sm:inline">Edit Profile</span>
                </button>
              ) : (
                <button
                  onClick={onFollow}
                  className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${
                    isFollowing
                      ? 'bg-white/10 hover:bg-red-500/20 border border-white/20 hover:border-red-500/50 text-white hover:text-red-400'
                      : 'bg-primary hover:bg-primary/80 text-white shadow-lg shadow-primary/25'
                  }`}
                >
                  {isFollowing ? 'Following' : 'Follow'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bio Section */}
      {user.bio && (
        <div className="space-y-2">
          <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
            {user.bio}
          </p>
        </div>
      )}

      {/* Metadata Section */}
      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
        {user.location && (
          <div className="flex items-center gap-1.5">
            <MapPin size={16} className="flex-shrink-0" />
            <span className="truncate">{user.location}</span>
          </div>
        )}
        
        {user.website && (
          <div className="flex items-center gap-1.5">
            <LinkIcon size={16} className="flex-shrink-0" />
            <a 
              href={user.website.startsWith('http') ? user.website : `https://${user.website}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:text-primary/80 transition-colors truncate"
            >
              {formatWebsite(user.website)}
            </a>
          </div>
        )}
        
        <div className="flex items-center gap-1.5">
          <Calendar size={16} className="flex-shrink-0" />
          <span>Joined {formatJoinDate(user.joinedAt)}</span>
        </div>
      </div>
    </div>
  );
}