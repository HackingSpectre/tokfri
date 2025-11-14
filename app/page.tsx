'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import LandingContent from '@/components/landing/LandingContent';

export default function LandingPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user has an active session
    const hasSession = localStorage.getItem('zklogin_session');
    const hasUser = localStorage.getItem('tokfri_user');
    
    // If user has active session and user profile, redirect to feed
    if (hasSession && hasUser) {
      router.push('/feed');
    } else {
      // Show landing page for login
      setIsLoading(false);
    }
  }, [router]);

  // Show loading while checking session
  if (isLoading) {
    return null; // Splash screen from layout.tsx will show
  }

  // Show landing/login page
  return <LandingContent />;
}
