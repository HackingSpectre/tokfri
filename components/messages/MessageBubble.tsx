import { X } from 'lucide-react';
import { Message, User } from './types';

interface MessageBubbleProps {
  message: Message;
  currentUser?: User | null;
  onFormatTime: (dateString: string) => string;
}

export default function MessageBubble({
  message,
  currentUser,
  onFormatTime
}: MessageBubbleProps) {
  const isOwn = message.senderId === currentUser?.id;

  return (
    <div className={`flex gap-3 ${isOwn ? 'flex-row-reverse' : ''}`}>
      {!isOwn && (
        <div className="w-8 h-8 flex-shrink-0">
          {message.sender.avatarUrl ? (
            <img 
              src={message.sender.avatarUrl} 
              alt="" 
              className="w-full h-full rounded-full object-cover" 
            />
          ) : (
            <div className="w-full h-full bg-gray-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">
                {message.sender.displayName?.[0] || message.sender.username?.[0]}
              </span>
            </div>
          )}
        </div>
      )}
      
      <div className={`max-w-[80%] md:max-w-md ${isOwn ? 'ml-auto' : ''}`}>
        {message.replyTo && (
          <div className="mb-2 p-3 bg-gray-800/50 rounded-lg border-l-2 border-blue-500 text-sm">
            <p className="text-gray-400 text-xs mb-1">
              Replying to @{message.replyTo.sender.username}
            </p>
            <p className="text-gray-300">{message.replyTo.content}</p>
          </div>
        )}
        
        <div className={`rounded-2xl px-4 py-3 ${
          isOwn 
            ? 'bg-blue-600 text-white' 
            : 'bg-gray-800 text-white border border-gray-700'
        }`}>
          <p className="text-[15px] leading-5">{message.content}</p>
          
          {/* Message Media */}
          {message.mediaUrls && message.mediaUrls.length > 0 && (
            <div className={`mt-2 ${
              message.mediaUrls.length === 1 ? 'max-w-xs' :
              message.mediaUrls.length === 2 ? 'grid grid-cols-2 gap-1 max-w-sm' :
              'grid grid-cols-2 gap-1 max-w-sm'
            }`}>
              {message.mediaUrls.map((url, index) => (
                <div key={index} className="relative">
                  <img
                    src={url}
                    alt={`Message media ${index + 1}`}
                    className="w-full h-auto max-h-48 object-cover rounded-lg cursor-pointer hover:opacity-95 transition-opacity"
                    onClick={() => window.open(url, '_blank')}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
        
        <p className="text-xs text-gray-500 mt-1 px-2">
          {onFormatTime(message.createdAt)}
        </p>
      </div>
    </div>
  );
}