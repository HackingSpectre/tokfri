'use client';

import { useState } from 'react';
import { Copy, Check, ExternalLink } from 'lucide-react';
import { formatAddress } from '@/lib/utils/zklogin';
import NetworkSelector from '@/components/ui/NetworkSelector';
import type { WalletOverviewProps } from './types';

export default function WalletOverview({ 
  balance, 
  address, 
  network, 
  onNetworkChange 
}: WalletOverviewProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyAddress = async () => {
    if (!address) return;
    await navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getExplorerUrl = () => {
    const baseUrls = {
      mainnet: 'https://suiscan.xyz/mainnet',
      devnet: 'https://suiscan.xyz/devnet',
      testnet: 'https://suiscan.xyz/testnet'
    };
    return `${baseUrls[network]}/account/${address}`;
  };

  return (
    <div className="space-y-4">
      {/* Balance Display */}
      <div className="text-center py-6 space-y-2">
        <p className="text-sm text-gray-400">Total Balance</p>
        <p className="text-4xl font-bold text-primary">
          {balance || '0.00'} <span className="text-2xl">SUI</span>
        </p>
        <p className="text-xs text-gray-500">
          ≈ ${balance ? (parseFloat(balance) * 1.5).toFixed(2) : '0.00'} USD
        </p>
      </div>

      {/* Address Section */}
      <div className="glass rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-400">Address</span>
          <a
            href={getExplorerUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs text-primary hover:underline"
          >
            View on Explorer
            <ExternalLink size={12} />
          </a>
        </div>
        <div className="flex items-center justify-between bg-black/20 rounded-lg p-3">
          <code className="text-sm font-mono">
            {address ? formatAddress(address) : '0x...'}
          </code>
          <button
            onClick={handleCopyAddress}
            className="p-2 hover:bg-white/5 rounded-lg transition-all"
          >
            {copied ? (
              <Check size={16} className="text-green-400" />
            ) : (
              <Copy size={16} />
            )}
          </button>
        </div>
      </div>

      {/* Network Section */}
      <div className="glass rounded-xl p-4 space-y-3">
        <div className="text-sm text-gray-400 mb-3">
          Network Selection
        </div>
        <NetworkSelector
          currentNetwork={network}
          onNetworkChange={onNetworkChange}
        />
      </div>
    </div>
  );
}