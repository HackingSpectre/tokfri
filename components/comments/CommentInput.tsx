'use client';

import { useWallet } from '@/lib/context/WalletContext';
import { MessageCircle, User } from 'lucide-react';
import type { CommentInputProps } from './types';

export default function CommentInput({ 
  value, 
  onChange, 
  onSubmit, 
  placeholder = "Add a comment...",
  submitLabel = "Comment",
  disabled = false 
}: CommentInputProps) {
  const { user } = useWallet();

  if (!user) return null;

  const handleSubmit = () => {
    if (!value.trim() || disabled) return;
    onSubmit(value);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="flex gap-3 p-4 bg-white/5 rounded-xl border border-white/10">
      <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-primary to-blue-600 rounded-full flex items-center justify-center overflow-hidden">
        {user.avatarUrl ? (
          <img 
            src={user.avatarUrl} 
            alt="Your avatar"
            className="w-full h-full object-cover"
          />
        ) : (
          <User size={16} className="text-white" />
        )}
      </div>
      
      <div className="flex-1">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder={placeholder}
          className="w-full bg-transparent border-0 outline-none resize-none placeholder-gray-500 text-sm md:text-base"
          rows={3}
          disabled={disabled}
        />
        <div className="flex justify-end mt-2">
          <button
            onClick={handleSubmit}
            disabled={!value.trim() || disabled}
            className="flex items-center gap-2 px-4 py-2 bg-primary rounded-full font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/80 transition-colors text-sm md:text-base"
          >
            <MessageCircle size={16} />
            {submitLabel}
          </button>
        </div>
      </div>
    </div>
  );
}