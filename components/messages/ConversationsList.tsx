import { MoreVertical } from 'lucide-react';
import ConversationItem from './ConversationItem';
import { EmptyConversations } from './EmptyStates';
import { Conversation, User } from './types';

interface ConversationsListProps {
  conversations: Conversation[];
  currentUser?: User | null;
  onSelectConversation: (conversation: Conversation) => void;
  onFormatTime: (dateString: string) => string;
  onWriteMessage?: () => void;
}

export default function ConversationsList({
  conversations,
  currentUser,
  onSelectConversation,
  onFormatTime,
  onWriteMessage
}: ConversationsListProps) {
  return (
    <div className="max-w-2xl mx-auto h-[calc(100vh-4rem)] flex flex-col">
      {/* Header */}
      <div className="bg-black/40 backdrop-blur-xl border-b border-gray-800 p-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-white">Messages</h1>
          <button className="p-2 hover:bg-gray-800 rounded-full transition-colors">
            <MoreVertical size={20} className="text-gray-400" />
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="p-4 border-b border-gray-800">
        <div className="bg-gray-900 border border-gray-700 rounded-full overflow-hidden">
          <input
            type="text"
            placeholder="Search for people and groups"
            className="w-full bg-transparent px-4 py-3 text-white placeholder-gray-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Conversations */}
      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <EmptyConversations onWriteMessage={onWriteMessage} />
        ) : (
          <div className="divide-y divide-gray-800">
            {conversations.map((conversation) => (
              <ConversationItem
                key={conversation.id}
                conversation={conversation}
                currentUser={currentUser}
                onSelect={onSelectConversation}
                onFormatTime={onFormatTime}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}