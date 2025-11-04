import { X } from 'lucide-react';

interface MediaPreviewProps {
  mediaUrls: string[];
  onRemoveImage: (index: number) => void;
}

export default function MediaPreview({ mediaUrls, onRemoveImage }: MediaPreviewProps) {
  if (mediaUrls.length === 0) return null;

  return (
    <div className="mb-3 p-3 bg-gray-900 rounded-xl">
      <div className={`grid gap-2 ${
        mediaUrls.length === 1 ? 'grid-cols-1' :
        mediaUrls.length === 2 ? 'grid-cols-2' :
        'grid-cols-2'
      }`}>
        {mediaUrls.map((url, index) => (
          <div key={index} className="relative group">
            <img
              src={url}
              alt={`Upload ${index + 1}`}
              className="w-full h-20 object-cover rounded-lg"
            />
            <button
              onClick={() => onRemoveImage(index)}
              className="absolute top-1 right-1 p-1 bg-black/60 hover:bg-black/80 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X size={12} className="text-white" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}