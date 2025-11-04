'use client';

import { X, Wallet as WalletIcon } from 'lucide-react';
import type { WalletHeaderProps } from './types';

export default function WalletHeader({ username, onClose }: WalletHeaderProps) {
  return (
    <div className="flex items-center justify-between p-6 border-b border-white/10">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-primary to-blue-600 rounded-full flex items-center justify-center">
          <WalletIcon size={20} className="text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold">My Wallet</h2>
          <p className="text-xs text-gray-400">@{username || 'user'}</p>
        </div>
      </div>
      <button
        onClick={onClose}
        className="p-2 hover:bg-white/5 rounded-lg transition-all"
      >
        <X size={20} />
      </button>
    </div>
  );
}