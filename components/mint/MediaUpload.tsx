import { X } from 'lucide-react';

interface MediaUploadProps {
  mediaUrls: string[];
  onImageUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage: (index: number) => void;
  isDisabled?: boolean;
  maxImages?: number;
}

export default function MediaUpload({ 
  mediaUrls, 
  onImageUpload, 
  onRemoveImage, 
  isDisabled = false,
  maxImages = 4 
}: MediaUploadProps) {
  if (mediaUrls.length === 0) return null;

  return (
    <div className="grid grid-cols-2 gap-2">
      {mediaUrls.map((url, index) => (
        <div key={index} className="relative group">
          <img 
            src={url} 
            alt={`Upload ${index + 1}`}
            className="w-full h-32 object-cover rounded-lg"
          />
          <button
            onClick={() => onRemoveImage(index)}
            disabled={isDisabled}
            className="absolute top-2 right-2 w-8 h-8 bg-black/70 hover:bg-black/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all disabled:opacity-50"
          >
            <X size={16} className="text-white" />
          </button>
        </div>
      ))}
    </div>
  );
}