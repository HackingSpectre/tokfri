'use client';

import { useWallet } from '@/lib/context/WalletContext';
import { Send, User } from 'lucide-react';

interface ReplyInputProps {
  replyText: string;
  onReplyTextChange: (text: string) => void;
  onSubmitReply: () => void;
  onCancelReply: () => void;
  targetUsername: string;
  disabled?: boolean;
}

export default function ReplyInput({ 
  replyText, 
  onReplyTextChange, 
  onSubmitReply, 
  onCancelReply, 
  targetUsername,
  disabled = false 
}: ReplyInputProps) {
  const { user } = useWallet();

  if (!user) return null;

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      if (replyText.trim()) {
        onSubmitReply();
      }
    }
  };

  return (
    <div className="mt-3 p-3 bg-white/5 rounded-lg border border-white/10">
      <div className="flex gap-2">
        <div className="w-6 h-6 bg-gradient-to-br from-primary to-blue-600 rounded-full flex items-center justify-center overflow-hidden">
          {user.avatarUrl ? (
            <img 
              src={user.avatarUrl} 
              alt="Your avatar"
              className="w-full h-full object-cover"
            />
          ) : (
            <User size={12} className="text-white" />
          )}
        </div>
        <div className="flex-1">
          <textarea
            value={replyText}
            onChange={(e) => onReplyTextChange(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder={`Reply to @${targetUsername}...`}
            className="w-full bg-transparent border-0 outline-none resize-none text-sm placeholder-gray-500"
            rows={2}
            disabled={disabled}
          />
          <div className="flex justify-end gap-2 mt-2">
            <button
              onClick={onCancelReply}
              className="px-3 py-1 text-xs text-gray-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onSubmitReply}
              disabled={!replyText.trim() || disabled}
              className="flex items-center gap-1 px-3 py-1 bg-primary rounded-full text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/80 transition-colors"
            >
              <Send size={12} />
              Reply
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}