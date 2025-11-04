import type { WalletFooterProps } from './types';

export default function WalletFooter({ network }: WalletFooterProps) {
  return (
    <div className="px-6 py-4 border-t border-white/10 bg-white/5">
      <div className="flex items-center justify-between text-xs text-gray-400">
        <span>zkLogin Wallet</span>
        <span className="flex items-center gap-1">
          <div className={`w-2 h-2 rounded-full ${
            network === 'mainnet' ? 'bg-green-400' : 'bg-orange-400'
          }`} />
          {network.charAt(0).toUpperCase() + network.slice(1)}
        </span>
      </div>
    </div>
  );
}