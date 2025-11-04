import { Check, AlertCircle } from 'lucide-react';

interface NotificationBannerProps {
  type: 'success' | 'error';
  message: string;
  onClose?: () => void;
}

export default function NotificationBanner({ type, message, onClose }: NotificationBannerProps) {
  const isSuccess = type === 'success';
  const Icon = isSuccess ? Check : AlertCircle;
  
  return (
    <div className={`flex items-center gap-3 p-4 rounded-xl ${
      isSuccess 
        ? 'bg-green-500/10 border border-green-500/20 text-green-400'
        : 'bg-red-500/10 border border-red-500/20 text-red-400'
    }`}>
      <Icon size={20} />
      <span className="flex-1">{message}</span>
      {onClose && (
        <button 
          onClick={onClose}
          className="hover:opacity-70 transition-opacity"
        >
          ×
        </button>
      )}
    </div>
  );
}