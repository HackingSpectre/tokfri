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
     

      {/* Search Bar */}
      <div className=" p-4 border-b border-gray-800">
        <div className="bg-gray-100 border border-pink-400 rounded-full overflow-hidden">
          <input
            type="text"
            placeholder="Search for people and groups"
            className="w-full bg-transparent px-4 py-3 text-black placeholder-gray-500 focus:outline-none"
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