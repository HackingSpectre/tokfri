'use client';

import { ProfileTabsProps } from './types';

export default function ProfileTabs({ 
  activeTab, 
  onTabChange, 
  counts 
}: ProfileTabsProps) {
  const tabs = [
    { id: 'posts' as const, label: 'Posts', count: counts?.posts ?? 0 },
    { id: 'media' as const, label: 'Media', count: counts?.media ?? 0 },
    { id: 'likes' as const, label: 'Likes', count: counts?.likes ?? 0 },
  ];

  return (
    <div className="glass rounded-xl overflow-hidden">
      <div className="grid grid-cols-3">
        {tabs.map((tab, index) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`p-4 text-center transition-all duration-200 relative ${
              activeTab === tab.id
                ? 'bg-primary/10 text-primary'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            } ${
              index < tabs.length - 1 ? 'border-r border-white/10' : ''
            }`}
          >
            <div className="font-medium mb-1">
              {tab.label}
            </div>
            <div className="text-sm opacity-75">
              {(tab.count ?? 0).toLocaleString()}
            </div>
            
            {/* Active indicator */}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}