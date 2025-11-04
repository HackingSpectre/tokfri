import { useRef, useEffect, memo, useMemo } from 'react';
import MessageBubble from './MessageBubble';
import { Message, User } from './types';

interface MessagesListProps {
  messages: Message[];
  currentUser?: User | null;
  otherUser?: User;
  typingUsers: string[];
  onFormatTime: (dateString: string) => string;
}

function MessagesList({
  messages,
  currentUser,
  otherUser,
  typingUsers,
  onFormatTime
}: MessagesListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastMessageCountRef = useRef(0);

  // Only scroll to bottom when new messages are added (not on every render)
  useEffect(() => {
    if (messages.length > lastMessageCountRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      lastMessageCountRef.current = messages.length;
    }
  }, [messages.length]);

  // Deduplicate messages by ID (safety check)
  const uniqueMessages = useMemo(() => {
    const seen = new Set<string>();
    return messages.filter(msg => {
      if (seen.has(msg.id)) return false;
      seen.add(msg.id);
      return true;
    });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex-1 overflow-y-auto px-4 py-2">
        <div className="flex flex-col items-center justify-center h-full text-center">
          <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mb-4">
            {otherUser?.avatarUrl ? (
              <img 
                src={otherUser.avatarUrl} 
                alt="" 
                className="w-full h-full rounded-full object-cover" 
              />
            ) : (
              <span className="text-white text-xl font-bold">
                {otherUser?.displayName?.[0] || otherUser?.username?.[0] || '?'}
              </span>
            )}
          </div>
          <h2 className="text-white text-xl font-bold mb-2">
            {otherUser?.displayName || otherUser?.username}
          </h2>
          <p className="text-gray-400 mb-4">@{otherUser?.username}</p>
          <p className="text-gray-500 text-sm max-w-sm">
            This is the beginning of your conversation with @{otherUser?.username}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 py-2">
      <div className="space-y-4 py-4">
        {uniqueMessages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            currentUser={currentUser}
            onFormatTime={onFormatTime}
          />
        ))}
        
        {/* Typing Indicator */}
        {typingUsers.length > 0 && (
          <div className="flex gap-3">
            <div className="w-8 h-8 flex-shrink-0">
              <div className="w-full h-full bg-gray-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {otherUser?.displayName?.[0] || otherUser?.username?.[0]}
                </span>
              </div>
            </div>
            <div className="bg-gray-800 rounded-2xl px-4 py-3 border border-gray-700">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div ref={messagesEndRef} />
    </div>
  );
}

// Memoize component to prevent unnecessary re-renders
export default memo(MessagesList);