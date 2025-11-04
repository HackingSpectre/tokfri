import { Hash } from 'lucide-react';

interface HashtagPreviewProps {
  hashtags: string[];
}

export default function HashtagPreview({ hashtags }: HashtagPreviewProps) {
  if (hashtags.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {hashtags.map((tag, index) => (
        <span 
          key={index}
          className="inline-flex items-center gap-1 px-3 py-1 bg-primary/20 border border-primary/30 rounded-full text-sm text-primary"
        >
          <Hash size={14} />
          {tag.slice(1)}
        </span>
      ))}
    </div>
  );
}