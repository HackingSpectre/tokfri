'use client';

import { useRouter } from 'next/navigation';
import { CheckCircle, ArrowRight } from 'lucide-react';
import Image from 'next/image';

export default function Complete() {
  const router = useRouter();

  const handleGoToLogin = () => {
    router.push('/auth/login');
  };

  return (
    <div className="min-h-screen w-full bg-white flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-8">
        {/* Success Icon */}
        <div className="flex justify-center">
          <div className="relative">
            <CheckCircle className="w-24 h-24 text-purple-600 animate-bounce" />
            <div className="absolute inset-0 w-24 h-24 bg-purple-600/20 rounded-full blur-xl animate-pulse" />
          </div>
        </div>

        {/* Logo */}
        <div className="flex justify-center">
          <Image
            src="/images/onboarding/logo.png"
            alt="Tokfri Logo"
            width={120}
            height={120}
            className="object-contain"
          />
        </div>

        {/* Success Message */}
        <div className="space-y-4">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
            You're All Set!
          </h1>
          <p className="text-lg text-gray-600">
            Your profile is ready. Let's get you signed in to start exploring Tokfri.
          </p>
        </div>

        {/* Action Button */}
        <button
          onClick={handleGoToLogin}
          className="w-full px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 flex items-center justify-center gap-2"
        >
          Continue to Login
          <ArrowRight className="w-5 h-5" />
        </button>

        {/* Additional Info */}
        <p className="text-sm text-gray-500">
          You can update your interests anytime from your profile settings
        </p>
      </div>
    </div>
  );
}
