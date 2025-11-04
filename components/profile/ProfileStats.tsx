import { ProfileStatsProps } from './types';
import Link from 'next/link';

export default function ProfileStats({ 
  stats, 
  username, 
  isClickable = true 
}: ProfileStatsProps) {
  const formatCount = (count: number | undefined | null): string => {
    // Handle undefined, null, or non-numeric values
    if (count === undefined || count === null || isNaN(count)) {
      return '0';
    }
    
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toLocaleString();
  };

  const StatItem = ({ 
    label, 
    count, 
    href 
  }: { 
    label: string; 
    count: number | undefined | null; 
    href?: string; 
  }) => {
    const content = (
      <div className={`text-center p-4 transition-all duration-200 ${
        isClickable && href 
          ? 'hover:bg-white/5 rounded-lg cursor-pointer group' 
          : ''
      }`}>
        <div className={`text-xl font-bold mb-1 transition-colors ${
          isClickable && href ? 'group-hover:text-primary' : ''
        }`}>
          {formatCount(count)}
        </div>
        <div className="text-sm text-gray-400">
          {label}
        </div>
      </div>
    );

    if (isClickable && href) {
      return (
        <Link href={href} className="block">
          {content}
        </Link>
      );
    }

    return content;
  };

  return (
    <div className="glass rounded-xl overflow-hidden">
      <div className="grid grid-cols-3 divide-x divide-white/10">
        <StatItem
          label="Posts"
          count={stats?.posts}
        />
        <StatItem
          label="Followers"
          count={stats?.followers}
          href={isClickable ? `/profile/${username}/followers` : undefined}
        />
        <StatItem
          label="Following"
          count={stats?.following}
          href={isClickable ? `/profile/${username}/following` : undefined}
        />
      </div>
    </div>
  );
}