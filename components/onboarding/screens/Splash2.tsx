'use client';

import Image from 'next/image';
import { useEffect } from 'react'
import { ArrowRight } from 'lucide-react';

interface Splash2Props {
  onNext: () => void;
}

export default function Splash2({ onNext }: Splash2Props) {
  useEffect(() => {
      
      // Auto-advance to next screen after 2 seconds
      const timer = setTimeout(() => {
        onNext();
      }, 2000);
  
      return () => clearTimeout(timer);
    }, [onNext]);
  return (
    <div className="min-h-screen w-full bg-white flex flex-col items-center justify-center p-4">
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="mb-8 relative w-32 h-32 mx-auto md:w-60 md:h-60">
            <Image
              src="/images/onboarding/logo.png"
              alt="Tokfri Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>
      </div>

    </div>
  );
}
