import { Wallet as WalletIcon } from 'lucide-react';
import type { WalletAssetsProps } from './types';

export default function WalletAssets({ balance }: WalletAssetsProps) {
  return (
    <div className="space-y-4">
      {/* SUI Token */}
      <div className="glass rounded-xl p-4 flex items-center justify-between hover:bg-white/5 transition-all">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
            <span className="text-lg">◎</span>
          </div>
          <div>
            <p className="font-medium">Sui</p>
            <p className="text-xs text-gray-400">SUI</p>
          </div>
        </div>
        <div className="text-right">
          <p className="font-semibold">{balance || '0.00'}</p>
          <p className="text-xs text-gray-400">
            ${balance ? (parseFloat(balance) * 1.5).toFixed(2) : '0.00'}
          </p>
        </div>
      </div>

      {/* Placeholder for other assets */}
      <div className="text-center py-8 text-gray-400">
        <WalletIcon size={32} className="mx-auto mb-2 opacity-50" />
        <p className="text-sm">No other assets found</p>
        <p className="text-xs mt-1">Your tokens and NFTs will appear here</p>
      </div>
    </div>
  );
}