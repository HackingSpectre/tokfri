'use client';

import { UserListHeaderProps } from './types';
import { ArrowLeft } from 'lucide-react';

export default function UserListHeader({ 
  title, 
  subtitle, 
  onBack 
}: UserListHeaderProps) {
  return (
    <div className="sticky top-16 z-20 glass-dark border-b border-white/10 backdrop-blur-sm">
      <div className="flex items-center gap-3 p-4">
        <button 
          onClick={onBack}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors group"
          aria-label="Go back"
        >
          <ArrowLeft size={20} className="group-hover:text-primary transition-colors" />
        </button>
        
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold truncate">{title}</h1>
          <p className="text-sm text-gray-400 truncate">{subtitle}</p>
        </div>
      </div>
    </div>
  );
}