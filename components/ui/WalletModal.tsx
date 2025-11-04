'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@/lib/context/WalletContext';
import { 
  WalletHeader, 
  WalletTabs, 
  WalletOverview, 
  WalletSend, 
  WalletAssets, 
  WalletFooter,
  type WalletModalProps,
  type TabType
} from '@/components/wallet';

export default function WalletModal({ isOpen, onClose }: WalletModalProps) {
  const { address, balance, network, switchNetwork, user, sendTransaction, refreshBalance } = useWallet();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Reset states when modal closes
  useEffect(() => {
    if (!isOpen) {
      setActiveTab('overview');
      setError('');
      setSuccess('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleNetworkChange = (newNetwork: 'mainnet' | 'devnet' | 'testnet') => {
    switchNetwork(newNetwork);
  };

  const handleSend = async (recipient: string, amount: string) => {
    setError('');
    setSuccess('');
    setIsSending(true);

    try {
      const amountNum = parseFloat(amount);
      const txDigest = await sendTransaction(recipient, amountNum);
      
      setSuccess(`Successfully sent ${amount} SUI!`);
      
      // Refresh balance
      await refreshBalance();
      
      setTimeout(() => {
        setSuccess('');
        setActiveTab('overview');
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'Transaction failed');
    } finally {
      setIsSending(false);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <WalletOverview
            balance={balance}
            address={address}
            network={network}
            onNetworkChange={handleNetworkChange}
          />
        );
      case 'send':
        return (
          <WalletSend
            balance={balance}
            onSend={handleSend}
            isLoading={isSending}
            error={error}
            success={success}
          />
        );
      case 'assets':
        return (
          <WalletAssets balance={balance} />
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg glass-dark rounded-2xl overflow-hidden animate-slide-up border border-white/10">
        {/* Header */}
        <WalletHeader 
          username={user?.username} 
          onClose={onClose} 
        />

        {/* Tabs */}
        <WalletTabs 
          activeTab={activeTab} 
          onTabChange={setActiveTab} 
        />

        {/* Content */}
        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          {renderContent()}
        </div>

        {/* Footer */}
        <WalletFooter network={network} />
      </div>
    </div>
  );
}
