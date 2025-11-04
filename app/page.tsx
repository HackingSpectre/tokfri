'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import OnboardingFlow from '@/components/onboarding/OnboardingFlow';

export default function LandingPage() {
  const router = useRouter();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if this is a first-time user
    const hasCompletedOnboarding = localStorage.getItem('tokfri_onboarding_complete');
    const hasExistingUser = localStorage.getItem('tokfri_user');
    const hasSession = localStorage.getItem('zklogin_session');
    
    // If user has logged in before (NOT just completed onboarding), go to login
    if ((hasExistingUser || hasSession) && hasCompletedOnboarding) {
      router.push('/auth/login');
    } else {
      // First-time user OR in onboarding process - show onboarding
      setShowOnboarding(true);
    }
    
    setIsLoading(false);
  }, [router]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen w-full bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  // Show onboarding only for first-time users
  return showOnboarding ? <OnboardingFlow /> : null;
}
