'use client';

import Image from 'next/image';
import { ArrowRight } from 'lucide-react';

interface Onboarding11Props {
  onNext: () => void;
  onSkip: () => void;
}

export default function Onboarding11({ onNext, onSkip }: Onboarding11Props) {
  return (
    <div className="min-h-screen w-full bg-white flex flex-col">
      {/* Skip Button */}
      <div className="absolute top-6 right-6 z-10">
        <button
          onClick={onSkip}
          className="text-gray-600 hover:text-gray-900 transition-colors text-sm md:text-base font-medium"
        >
          Skip
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        {/* Text Content */}
        <div className="text-center max-w-lg animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Discover Content
          </h2>
          <p className="text-gray-600 text-base md:text-lg leading-relaxed">
            Explore trending topics, follow your interests, and discover amazing content from creators worldwide.
          </p>
        </div>
        {/* Image */}
        <div className="relative w-full max-w-md h-64 md:h-80 mb-8 animate-slide-up">
          <Image
            src="/images/onboarding/Frame 2-2.png"
            alt="Discover Content"
            fill
            className="object-contain"
            priority
          />
        </div>

        
        {/* Progress Dots */}
        <div className="flex items-center gap-2 mt-12">
          <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
          <div className="w-8 h-2 bg-purple-600 rounded-full"></div>
          <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
          <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
          <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
        </div>
      </div>

      {/* Next Button */}
      <div className="p-6">
        <button
          onClick={onNext}
          className="w-full max-w-md mx-auto flex items-center justify-center gap-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-full font-semibold text-lg hover:shadow-lg hover:shadow-purple-500/50 transition-all"
        >
          Next
          <ArrowRight size={20} />
        </button>
      </div>
    </div>
  );
}
