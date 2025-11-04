import { useRef, useState } from 'react';
import { Send, Image, Gift, Smile, Loader2 } from 'lucide-react';
import MediaPreview from './MediaPreview';

interface MessageInputProps {
  newMessage: string;
  setNewMessage: (message: string) => void;
  mediaUrls: string[];
  onRemoveImage: (index: number) => void;
  onImageUpload: (files: FileList | null) => void;
  onSendMessage: () => void;
  onTyping: () => void;
  isUploading: boolean;
  disabled?: boolean;
}

export default function MessageInput({
  newMessage,
  setNewMessage,
  mediaUrls,
  onRemoveImage,
  onImageUpload,
  onSendMessage,
  onTyping,
  isUploading,
  disabled = false
}: MessageInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-resize textarea
  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 128) + 'px';
    }
  };

  const handleSendMessage = () => {
    onSendMessage();
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  return (
    <div className="bg-black/40 backdrop-blur-xl border-t border-gray-800 p-4">
      <MediaPreview 
        mediaUrls={mediaUrls}
        onRemoveImage={onRemoveImage}
      />

      <div className="flex items-end gap-3 max-w-4xl">
        <div className="flex items-center gap-2">
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="p-2 hover:bg-gray-800 rounded-full transition-colors disabled:opacity-50"
            disabled={isUploading || mediaUrls.length >= 4 || disabled}
            title={mediaUrls.length >= 4 ? "Maximum 4 images" : "Add images"}
          >
            {isUploading ? (
              <Loader2 size={20} className="animate-spin text-blue-400" />
            ) : (
              <Image size={20} className="text-blue-400" />
            )}
          </button>
          <button 
            className="p-2 hover:bg-gray-800 rounded-full transition-colors"
            disabled={disabled}
          >
            <Gift size={20} className="text-blue-400" />
          </button>
          <button 
            className="p-2 hover:bg-gray-800 rounded-full transition-colors"
            disabled={disabled}
          >
            <Smile size={20} className="text-blue-400" />
          </button>
        </div>
        
        <div className="flex-1 relative">
          <div className="bg-gray-900 border border-gray-700 rounded-3xl overflow-hidden">
            <textarea
              ref={textareaRef}
              value={newMessage}
              onChange={(e) => {
                setNewMessage(e.target.value);
                adjustTextareaHeight();
                onTyping();
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="Start a new message"
              className="w-full bg-transparent px-4 py-3 pr-12 text-white placeholder-gray-500 resize-none max-h-32 focus:outline-none"
              rows={1}
              style={{
                minHeight: '44px',
                height: 'auto',
              }}
              disabled={disabled}
            />
          </div>
        </div>

        <button
          onClick={handleSendMessage}
          disabled={(!newMessage.trim() && mediaUrls.length === 0) || isUploading || disabled}
          className={`p-2 rounded-full transition-all ${
            (newMessage.trim() || mediaUrls.length > 0) && !isUploading && !disabled
              ? 'bg-blue-600 hover:bg-blue-700 text-white' 
              : 'bg-gray-800 text-gray-500 cursor-not-allowed'
          }`}
        >
          <Send size={20} />
        </button>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={(e) => onImageUpload(e.target.files)}
        className="hidden"
      />
    </div>
  );
}