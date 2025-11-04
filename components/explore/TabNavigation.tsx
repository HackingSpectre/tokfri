import { Users, TrendingUp, Hash } from 'lucide-react';

export type ExploreTab = 'users' | 'trending' | 'hashtags';

interface Tab {
  id: ExploreTab;
  label: string;
  icon: React.ComponentType<{ size?: number }>;
}

interface TabNavigationProps {
  activeTab: ExploreTab;
  onTabChange: (tab: ExploreTab) => void;
}

const tabs: Tab[] = [
  { id: 'users', label: 'People', icon: Users },
  { id: 'trending', label: 'Trending', icon: TrendingUp },
  { id: 'hashtags', label: 'Hashtags', icon: Hash },
];

export default function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
  return (
    <div className="flex bg-white/5 rounded-xl p-1">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-primary text-white'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Icon size={18} />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}