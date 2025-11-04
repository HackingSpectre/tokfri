import { Settings } from 'lucide-react';
import { FeedTab } from '@/types/feed';

interface FeedHeaderProps {
  tabs: FeedTab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export default function FeedHeader({ 
  tabs, 
  activeTab, 
  onTabChange, 
  onRefresh, 
  isRefreshing 
}: FeedHeaderProps) {
  return (
    <div className="bg-black border-b border-gray-800 mb-4">
      <div className="flex items-center justify-between px-4 py-3 w-full">
        <div className="flex items-center space-x-1 flex-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors flex-1 ${
                activeTab === tab.id
                  ? 'bg-gray-800 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="p-2 text-gray-400 hover:text-white hover:bg-gray-900 rounded-md transition-colors disabled:opacity-50 ml-4"
          aria-label="Refresh feed"
        >
          <Settings 
            size={18} 
            className={isRefreshing ? 'animate-spin' : ''} 
          />
        </button>
      </div>
    </div>
  );
}