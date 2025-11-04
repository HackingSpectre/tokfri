import { PostHeaderProps } from './types';
import { User, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function PostHeader({ user, createdAt }: PostHeaderProps) {
  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const postDate = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - postDate.getTime()) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds}s`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d`;
    
    return postDate.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: postDate.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  return (
    <div className="flex items-center gap-3 mb-3">
      {/* Avatar */}
      <Link 
        href={`/profile/${user.username}`}
        className="flex-shrink-0 group"
      >
        <div className="w-12 h-12 bg-gradient-to-br from-primary to-blue-600 rounded-full flex items-center justify-center overflow-hidden group-hover:scale-105 transition-transform">
          {user.avatarUrl ? (
            <img 
              src={user.avatarUrl} 
              alt={`${user.username}'s avatar`}
              className="w-full h-full object-cover"
            />
          ) : (
            <User size={20} className="text-white" />
          )}
        </div>
      </Link>

      {/* User Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <Link 
            href={`/profile/${user.username}`}
            className="font-semibold hover:text-primary transition-colors truncate"
          >
            {user.displayName || `@${user.username}`}
          </Link>
          
          {user.verified && (
            <CheckCircle size={16} className="text-primary flex-shrink-0" />
          )}
          
          <span className="text-gray-400 text-sm">@{user.username}</span>
          <span className="text-gray-500 text-sm">•</span>
          <span className="text-gray-400 text-sm">
            {formatTimeAgo(createdAt)}
          </span>
        </div>
      </div>
    </div>
  );
}