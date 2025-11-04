import { Plus, User } from 'lucide-react';

interface PostComposerProps {
  user?: {
    profileImage?: string;
    username?: string;
  } | null;
  onMintPost: () => void;
}

export default function PostComposer({ user, onMintPost }: PostComposerProps) {
  if (!user) return null;

  return (
    <div className="bg-black border border-gray-800 rounded-lg p-4">
      <div className="flex space-x-3">
        <div className="flex-shrink-0">
          {user.profileImage ? (
            <img 
              src={user.profileImage} 
              alt="Your avatar" 
              className="w-10 h-10 rounded-full"
            />
          ) : (
            <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center">
              <User size={16} className="text-gray-400" />
            </div>
          )}
        </div>
        <div className="flex-1">
          <button
            onClick={onMintPost}
            className="w-full text-left py-3 px-4 text-gray-400 bg-gray-900 hover:bg-gray-800 rounded-lg border border-gray-800 transition-colors"
          >
            What&apos;s on your mind? Share your thoughts...
          </button>
          <div className="flex items-center justify-between mt-3">
            <button 
              onClick={onMintPost}
              className="flex items-center space-x-2 px-3 py-1.5 text-sm text-white hover:bg-gray-800 rounded-md transition-colors"
            >
              <Plus size={16} />
              <span>Mint Post</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}