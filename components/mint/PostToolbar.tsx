import { Send, Image as ImageIcon, Camera, Link as LinkIcon, Loader2 } from 'lucide-react';
import CharacterCounter from './CharacterCounter';

interface PostToolbarProps {
  charCount: number;
  maxChars: number;
  mediaUrls: string[];
  canPost: boolean;
  isPosting: boolean;
  onImageUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onMintPost: () => void;
}

export default function PostToolbar({
  charCount,
  maxChars,
  mediaUrls,
  canPost,
  isPosting,
  onImageUpload,
  onMintPost
}: PostToolbarProps) {
  return (
    <div className="flex items-center justify-between pt-4 border-t border-white/10">
      <div className="flex items-center gap-2">
        {/* Image Upload */}
        <label className="p-2 hover:bg-white/5 rounded-lg transition-all cursor-pointer">
          <ImageIcon size={20} className="text-primary" />
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={onImageUpload}
            className="hidden"
            disabled={isPosting || mediaUrls.length >= 4}
          />
        </label>

        {/* Camera (placeholder) */}
        <button className="p-2 hover:bg-white/5 rounded-lg transition-all text-gray-400">
          <Camera size={20} />
        </button>

        {/* Link (placeholder) */}
        <button className="p-2 hover:bg-white/5 rounded-lg transition-all text-gray-400">
          <LinkIcon size={20} />
        </button>
      </div>

      <div className="flex items-center gap-4">
        {/* Character Counter */}
        <CharacterCounter charCount={charCount} maxChars={maxChars} />

        {/* Mint Button */}
        <button
          onClick={onMintPost}
          disabled={!canPost || isPosting}
          className="flex items-center gap-2 px-6 py-2 bg-primary rounded-xl hover:bg-primary-dark transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPosting ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Minting...
            </>
          ) : (
            <>
              <Send size={18} />
              Mint Post
            </>
          )}
        </button>
      </div>
    </div>
  );
}