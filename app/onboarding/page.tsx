'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import OnboardingForm from '@/components/onboarding/OnboardingForm';

export default function OnboardingPage() {
  const router = useRouter();

  useEffect(() => {
    // Only allow access if user has a session (just logged in via OAuth)
    const hasSession = localStorage.getItem('zklogin_session');
    
    if (!hasSession) {
      // No session - redirect to landing page for login
      router.push('/');
    }
  }, [router]);

  return <OnboardingForm />;
}
