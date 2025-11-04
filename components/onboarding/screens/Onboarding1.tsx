'use client';

import Image from 'next/image';
import { ArrowRight } from 'lucide-react';

interface Onboarding1Props {
  onNext: () => void;
  onSkip: () => void;
}

export default function Onboarding1({ onNext, onSkip }: Onboarding1Props) {
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
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Welcome to Tokfri</h1>
        <p className="mb[2rem] text-gray-600 text-base md:text-lg leading-relaxed mb-4">Make your presence heard</p>
        {/* Image */}
        <div className="relative w-full max-w-md h-64 md:h-80 mb-8 animate-slide-up">
          <Image
            src="/images/onboarding/Group.png"
            alt="Connect and Share"
            fill
            className="object-contain"
            priority
          />
        </div>

        {/* Text Content */}
        <div className="text-center max-w-lg animate-slide-up" style={{ animationDelay: '0.1s' }}>
          
          <p className="text-gray-600 text-base md:text-lg leading-relaxed">
            By tapping "Agree and continue" you agree to Tokfri <a>Term of Service</a> and acknowledge that you have read Tokfri's <a>Privacy Policy</a> to learn how the platfporm use and manage your data.
          </p>
        </div>

        
      </div>

      {/* Next Button */}
      <div className="p-6">
        <button
          onClick={onNext}
          className="w-full max-w-md mx-auto flex items-center justify-center gap-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-full font-semibold text-lg hover:shadow-lg hover:shadow-purple-500/50 transition-all"
        >
          Agree and continue
          <ArrowRight size={20} />
        </button>
      </div>
    </div>
  );
}
