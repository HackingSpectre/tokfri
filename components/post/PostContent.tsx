'use client';

import { PostContentProps } from './types';

export default function PostContent({ content, mediaUrls }: PostContentProps) {
  return (
    <div className="space-y-3">
      {/* Text Content */}
      <div className="text-gray-300 leading-relaxed whitespace-pre-wrap">
        {content}
      </div>

      {/* Media Content */}
      {mediaUrls && mediaUrls.length > 0 && (
        <div className="rounded-xl overflow-hidden">
          {mediaUrls.length === 1 ? (
            // Single media
            <div className="relative aspect-video bg-gray-800">
              <img 
                src={mediaUrls[0]} 
                alt="Post media"
                className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                onClick={() => {
                  // TODO: Open media modal
                  console.log('Open media:', mediaUrls[0]);
                }}
              />
            </div>
          ) : (
            // Multiple media grid
            <div className={`grid gap-2 ${
              mediaUrls.length === 2 ? 'grid-cols-2' : 
              mediaUrls.length === 3 ? 'grid-cols-2' :
              'grid-cols-2'
            }`}>
              {mediaUrls.slice(0, 4).map((url, index) => (
                <div 
                  key={index}
                  className={`relative aspect-square bg-gray-800 overflow-hidden ${
                    mediaUrls.length === 3 && index === 0 ? 'row-span-2' : ''
                  }`}
                >
                  <img 
                    src={url} 
                    alt={`Post media ${index + 1}`}
                    className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                    onClick={() => {
                      // TODO: Open media modal
                      console.log('Open media:', url);
                    }}
                  />
                  
                  {/* More indicator for 4+ images */}
                  {index === 3 && mediaUrls.length > 4 && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <span className="text-white text-xl font-bold">
                        +{mediaUrls.length - 4}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}