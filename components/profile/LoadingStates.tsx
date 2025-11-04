'use client';

import { Loader2, User, AlertCircle } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

interface ErrorStateProps {
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function LoadingState({ 
  message = "Loading...", 
  size = 'md' 
}: LoadingStateProps) {
  const sizeClasses = {
    sm: 'min-h-[20vh]',
    md: 'min-h-[40vh]',
    lg: 'min-h-[60vh]'
  };

  const iconSizes = {
    sm: 20,
    md: 24,
    lg: 32
  };

  return (
    <div className={`flex items-center justify-center ${sizeClasses[size]}`}>
      <div className="text-center space-y-3">
        <Loader2 
          size={iconSizes[size]} 
          className="animate-spin text-primary mx-auto" 
        />
        <p className="text-gray-400 text-sm">{message}</p>
      </div>
    </div>
  );
}

export function ErrorState({ 
  title, 
  message, 
  actionLabel, 
  onAction, 
  icon 
}: ErrorStateProps) {
  return (
    <div className="flex items-center justify-center min-h-[40vh]">
      <div className="text-center max-w-md mx-auto p-6">
        {icon || <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />}
        <h2 className="text-xl font-bold mb-2 text-white">{title}</h2>
        <p className="text-gray-400 mb-6 leading-relaxed">{message}</p>
        {actionLabel && onAction && (
          <button 
            onClick={onAction}
            className="px-6 py-3 bg-primary hover:bg-primary/80 text-white rounded-lg transition-colors font-medium"
          >
            {actionLabel}
          </button>
        )}
      </div>
    </div>
  );
}

export function EmptyState({ 
  icon, 
  title, 
  message, 
  actionLabel, 
  onAction 
}: EmptyStateProps) {
  return (
    <div className="flex items-center justify-center min-h-[40vh]">
      <div className="text-center max-w-md mx-auto p-6">
        {icon || <User size={48} className="text-gray-600 mx-auto mb-4" />}
        <h3 className="text-lg font-semibold mb-2 text-white">{title}</h3>
        <p className="text-gray-400 mb-6 leading-relaxed">{message}</p>
        {actionLabel && onAction && (
          <button 
            onClick={onAction}
            className="px-6 py-3 bg-primary hover:bg-primary/80 text-white rounded-lg transition-colors font-medium"
          >
            {actionLabel}
          </button>
        )}
      </div>
    </div>
  );
}