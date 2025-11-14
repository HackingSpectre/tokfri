import { Send } from 'lucide-react';

interface EmptyConversationsProps {
  onWriteMessage?: () => void;
}

export function EmptyConversations({ onWriteMessage }: EmptyConversationsProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-8">
      <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mb-6">
        <Send size={32} className="text-gray-400" />
      </div>
      <h2 className="text-white text-2xl font-bold mb-2">Welcome to your inbox!</h2>
      <p className="text-gray-400 text-sm max-w-sm mb-6">
        Drop a line, share posts and more with private conversations between you and others on Tokfri.
      </p>
      {onWriteMessage && (
        <button 
          onClick={onWriteMessage}
          className="px-6 py-3 bg-pink-600 hover:bg-pink-700 rounded-full font-semibold text-white transition-colors"
        >
          Write a message
        </button>
      )}
    </div>
  );
}

export function LoadingState({ message = "Loading messages..." }: { message?: string }) {
  return (
    <div className="flex items-center justify-center h-96">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-gray-400">{message}</p>
      </div>
    </div>
  );
}