import { Conversation, User } from './types';

interface ConversationItemProps {
  conversation: Conversation;
  currentUser?: User | null;
  onSelect: (conversation: Conversation) => void;
  onFormatTime: (dateString: string) => string;
}

export default function ConversationItem({
  conversation,
  currentUser,
  onSelect,
  onFormatTime
}: ConversationItemProps) {
  const otherUser = conversation.otherUser || 
    conversation.participants.find(p => p.id !== currentUser?.id);

  return (
    <button
      onClick={() => onSelect(conversation)}
      className="w-full p-4 hover:bg-gray-900/50 transition-all text-left flex items-center gap-3"
    >
      <div className="relative flex-shrink-0">
        <div className="w-12 h-12 relative">
          {otherUser?.avatarUrl ? (
            <img 
              src={otherUser.avatarUrl} 
              alt="" 
              className="w-full h-full rounded-full object-cover" 
            />
          ) : (
            <div className="w-full h-full bg-gray-600 rounded-full flex items-center justify-center">
              <span className="text-white font-medium">
                {otherUser?.displayName?.[0] || otherUser?.username?.[0] || '?'}
              </span>
            </div>
          )}
        </div>
        {conversation.unreadCount > 0 && (
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-xs text-white font-bold">
              {conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}
            </span>
          </div>
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-white truncate">
              {otherUser?.displayName || otherUser?.username || 'Unknown User'}
            </h3>
            <span className="text-gray-500 text-sm">
              @{otherUser?.username}
            </span>
          </div>
          <span className="text-xs text-gray-500 flex-shrink-0">
            {conversation.lastMessage ? onFormatTime(conversation.lastMessage.createdAt) : ''}
          </span>
        </div>
        <p className="text-sm text-gray-400 truncate">
          {conversation.lastMessage?.content || 'Start a conversation'}
        </p>
      </div>
    </button>
  );
}