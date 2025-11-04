'use client';

import type { WalletTabsProps } from './types';

export default function WalletTabs({ activeTab, onTabChange }: WalletTabsProps) {
  const tabs = [
    { id: 'overview' as const, label: 'Overview' },
    { id: 'send' as const, label: 'Send' },
    { id: 'assets' as const, label: 'Assets' },
  ];

  return (
    <div className="flex border-b border-white/10 px-6">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`flex-1 py-3 text-sm font-medium transition-all border-b-2 ${
            activeTab === tab.id
              ? 'border-primary text-primary'
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}