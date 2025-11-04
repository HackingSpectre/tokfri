import { ArrowLeft, Phone, Video, MoreVertical } from 'lucide-react';
import { User } from './types';

interface MessageHeaderProps {
  otherUser?: User;
  isConnected: boolean;
  typingUsers: string[];
  onBack: () => void;
}

export default function MessageHeader({
  otherUser,
  isConnected,
  typingUsers,
  onBack
}: MessageHeaderProps) {
  return (
    <div className="bg-black/40 backdrop-blur-xl border-b border-gray-800 p-4 flex items-center gap-4 sticky top-0 z-10">
      <button 
        onClick={onBack} 
        className="p-2 hover:bg-gray-800 rounded-full transition-colors flex items-center justify-center"
      >
        <ArrowLeft size={20} className="text-white" />
      </button>
      
      <div className="w-8 h-8 relative">
        {otherUser?.avatarUrl ? (
          <img 
            src={otherUser.avatarUrl} 
            alt={otherUser.displayName || otherUser.username} 
            className="w-full h-full rounded-full object-cover" 
          />
        ) : (
          <div className="w-full h-full bg-gray-600 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-medium">
              {otherUser?.displayName?.[0] || otherUser?.username?.[0] || '?'}
            </span>
          </div>
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <h1 className="font-bold text-white text-xl truncate">
          {otherUser?.displayName || otherUser?.username}
        </h1>
        <p className="text-gray-400 text-sm">
          @{otherUser?.username} • {isConnected ? (
            typingUsers.length > 0 ? 'typing...' : 'Active now'
          ) : 'Connecting...'}
        </p>
      </div>

      <div className="flex items-center gap-1">
        <button className="p-2 hover:bg-gray-800 rounded-full transition-colors">
          <Phone size={20} className="text-gray-400" />
        </button>
        <button className="p-2 hover:bg-gray-800 rounded-full transition-colors">
          <Video size={20} className="text-gray-400" />
        </button>
        <button className="p-2 hover:bg-gray-800 rounded-full transition-colors">
          <MoreVertical size={20} className="text-gray-400" />
        </button>
      </div>
    </div>
  );
}