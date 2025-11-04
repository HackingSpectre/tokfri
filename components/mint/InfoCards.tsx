import { Hash, Image as ImageIcon } from 'lucide-react';

export default function InfoCards() {
  return (
    <div className="grid gap-4">
      <div className="glass rounded-xl p-4">
        <h3 className="font-semibold mb-2 flex items-center gap-2">
          <Hash size={16} className="text-primary" />
          Use Hashtags
        </h3>
        <p className="text-sm text-gray-400">
          Add hashtags to help others discover your posts. Popular hashtags trend and can increase your visibility.
        </p>
      </div>

      <div className="glass rounded-xl p-4">
        <h3 className="font-semibold mb-2 flex items-center gap-2">
          <ImageIcon size={16} className="text-primary" />
          Add Media
        </h3>
        <p className="text-sm text-gray-400">
          Upload up to 4 images to make your posts more engaging. Images help tell your story better.
        </p>
      </div>
    </div>
  );
}