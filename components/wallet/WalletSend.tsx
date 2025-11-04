'use client';

import { useState } from 'react';
import { Send, Loader2, AlertCircle, Check } from 'lucide-react';
import type { WalletSendProps } from './types';

export default function WalletSend({ 
  balance, 
  onSend, 
  isLoading = false,
  error,
  success 
}: WalletSendProps) {
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [localError, setLocalError] = useState('');

  const handleSend = async () => {
    setLocalError('');

    // Validation
    if (!recipient || !amount) {
      setLocalError('Please fill in all fields');
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setLocalError('Invalid amount');
      return;
    }

    const balanceNum = balance ? parseFloat(balance) : 0;
    if (amountNum > balanceNum) {
      setLocalError('Insufficient balance');
      return;
    }

    if (!recipient.startsWith('0x') || recipient.length !== 66) {
      setLocalError('Invalid Sui address');
      return;
    }

    try {
      await onSend(recipient, amount);
      // Clear form on success
      setRecipient('');
      setAmount('');
    } catch (err) {
      // Error handling is done by parent component
    }
  };

  const displayError = error || localError;

  return (
    <div className="space-y-4">
      {displayError && (
        <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
          <AlertCircle size={16} />
          <span>{displayError}</span>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400 text-sm">
          <Check size={16} />
          <span>{success}</span>
        </div>
      )}

      <div className="space-y-3">
        <div>
          <label className="block text-sm text-gray-400 mb-2">
            Recipient Address
          </label>
          <input
            type="text"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            placeholder="0x..."
            className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 focus:border-primary focus:outline-none transition-all"
            disabled={isLoading}
          />
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-2">
            Amount (SUI)
          </label>
          <div className="relative">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              step="0.01"
              className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 focus:border-primary focus:outline-none transition-all"
              disabled={isLoading}
            />
            <button
              onClick={() => setAmount(balance || '0')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-primary hover:underline"
              disabled={isLoading}
            >
              Max
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Available: {balance || '0.00'} SUI
          </p>
        </div>
      </div>

      <button
        onClick={handleSend}
        disabled={isLoading || !recipient || !amount}
        className="w-full flex items-center justify-center gap-2 py-3 bg-primary rounded-xl font-semibold hover:bg-primary-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            Sending...
          </>
        ) : (
          <>
            <Send size={18} />
            Send SUI
          </>
        )}
      </button>
    </div>
  );
}