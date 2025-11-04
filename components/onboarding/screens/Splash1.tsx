'use client';

import { useEffect, useState } from 'react';

interface Splash1Props {
  onNext: () => void;
}

export default function Splash1({ onNext }: Splash1Props) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Fade in animation
    setIsVisible(true);
    
    // Auto-advance after 2 seconds
    const timer = setTimeout(() => {
      onNext();
    }, 2000);

    return () => clearTimeout(timer);
  }, [onNext]);

  return (
    <div 
      className="min-h-screen w-full bg-white flex items-center justify-center relative overflow-hidden"
      onClick={onNext}
    >
      

      {/* Center logo - two dots */}
      <div 
        className={`flex items-center gap-4 transition-all duration-1000 ${
          isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
        }`}
      >
        {/* Blue dot */}
        <div className="w-6 h-6 rounded-full bg-[#1D4ED8] animate-pulse shadow-lg" />
        
        {/* Pink dot */}
        <div 
          className="w-6 h-6 rounded-full bg-[#EC4899] animate-pulse shadow-lg" 
          style={{ animationDelay: '0.5s' }} 
        />
      </div>
    </div>
  );
}
