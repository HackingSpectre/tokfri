import { Plus } from 'lucide-react';

interface FloatingActionButtonProps {
  onMintPost: () => void;
}

export default function FloatingActionButton({ onMintPost }: FloatingActionButtonProps) {
  return (
    <button
      onClick={onMintPost}
      className="lg:hidden fixed bottom-6 right-6 w-14 h-14 bg-gray-800 hover:bg-gray-700 rounded-full shadow-lg flex items-center justify-center z-50 transition-colors"
      aria-label="Create new post"
    >
      <Plus size={24} className="text-white" />
    </button>
  );
}