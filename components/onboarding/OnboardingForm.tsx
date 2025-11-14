'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useWallet } from '@/lib/context/WalletContext';
import { decodeJwt } from '@/lib/utils/zklogin';
import Onboarding1 from './screens/Onboarding1';
import Onboarding11 from './screens/Onboarding11';
import Onboarding12 from './screens/Onboarding12';
import Onboarding13 from './screens/Onboarding13';
import Onboarding14 from './screens/Onboarding14';

type OnboardingStep = 'username' | 'interests' | 'onboarding1' | 'onboarding11' | 'onboarding12' | 'onboarding13' | 'onboarding14' | 'swipe-final';

export default function OnboardingForm() {
  const router = useRouter();
  const { address, setUser } = useWallet();
  
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('username');
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [usernameError, setUsernameError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Available interests
  const availableInterests = [
    'Automobile',
    'Comics',
    'Culture',
    'Nature',
    'Wild Life',
    'Food & Drink',
    'Music',
    'Entertainment',
    'Fitness & Health',
    'Motivation & Advice',
    'Sports',
    'Cryptocurrency',
    'Science & Technology',
    'Art & Design',
    'Technology',
    'Gaming',
    'Books',
    'Movies & TV',
    'Travel',
    'Wellness',
    'Photography',
    'Business',
  ];

  // Redirect if not logged in
  useEffect(() => {
    if (!address) {
      router.push('/');
    }
  }, [address, router]);

  // Check username availability with debounce
  useEffect(() => {
    if (!username || username.length < 3) {
      setUsernameAvailable(null);
      setUsernameError('');
      return;
    }

    // Validate username format
    const usernameRegex = /^[a-zA-Z0-9_]{3,30}$/;
    if (!usernameRegex.test(username)) {
      setUsernameAvailable(false);
      setUsernameError('Username must be 3-30 characters (letters, numbers, underscores only)');
      return;
    }

    const timeoutId = setTimeout(async () => {
      setIsCheckingUsername(true);
      try {
        const response = await fetch(`/api/users/check-username?username=${encodeURIComponent(username)}`);
        const data = await response.json();
        
        if (response.ok) {
          setUsernameAvailable(data.available);
          setUsernameError(data.available ? '' : 'Username already taken');
        } else {
          setUsernameError(data.error || 'Error checking username');
        }
      } catch (error) {
        console.error('Error checking username:', error);
        setUsernameError('Error checking username');
      } finally {
        setIsCheckingUsername(false);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [username]);

  const handleSubmit = async () => {
    if (!username || !usernameAvailable) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Get session data from localStorage
      const sessionStr = localStorage.getItem('zklogin_session');
      if (!sessionStr) {
        throw new Error('No session found');
      }

      const session = JSON.parse(sessionStr);
      const decodedJwt = decodeJwt(session.jwt);

      // Get Google profile picture from JWT (if available)
      const avatarUrl = (decodedJwt as any).picture || null;

      // Register user with interests
      const response = await fetch('/api/users/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          suiAddress: address,
          oauthProvider: 'google',
          oauthSub: decodedJwt.sub,
          displayName: displayName || username,
          avatarUrl,
          bio: bio || null,
          interests: selectedInterests.length > 0 ? selectedInterests : null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      // Store user data
      setUser(data.user);
      localStorage.setItem('tokfri_user', JSON.stringify(data.user));

      // Move to education screens
      setCurrentStep('onboarding1');
    } catch (error: any) {
      console.error('Registration error:', error);
      alert(error.message || 'Failed to register. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInterestToggle = (interest: string) => {
    setSelectedInterests(prev => {
      if (prev.includes(interest)) {
        return prev.filter(i => i !== interest);
      }
      return [...prev, interest];
    });
  };

  const handleUsernameNext = () => {
    if (usernameAvailable && username) {
      setCurrentStep('interests');
    }
  };

  const handleInterestsNext = () => {
    handleSubmit();
  };

  const handleEducationNext = () => {
    const steps: OnboardingStep[] = ['onboarding1', 'onboarding11', 'onboarding12', 'onboarding13', 'onboarding14', 'swipe-final'];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex >= 0 && currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1]);
    }
  };

  const handleSkipEducation = () => {
    // Skip directly to final swipe screen
    setCurrentStep('swipe-final');
  };

  const handleSwipeUp = () => {
    // Go to feed when user swipes up
    router.push('/feed');
  };

  if (!address) {
    return null; // Will redirect
  }

  // Step 1: Username Selection
  if (currentStep === 'username') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-white">
        <div className="w-full max-w-md bg-white border border-gray-200 rounded-3xl p-8 space-y-6 shadow-xl">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome to Tokfri!</h2>
            <p className="text-gray-600">Choose your username to get started</p>
          </div>

          <div className="space-y-4">
            {/* Username Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Username *</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Choose your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase())}
                  className={`w-full bg-white border ${
                    usernameError 
                      ? 'border-red-500' 
                      : usernameAvailable 
                      ? 'border-green-500' 
                      : 'border-gray-300'
                  } rounded-xl p-3 text-gray-900 focus:outline-none focus:border-pink-500 transition-colors`}
                  maxLength={30}
                />
                {isCheckingUsername && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-primary"></div>
                  </div>
                )}
                {!isCheckingUsername && usernameAvailable && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500">✓</div>
                )}
              </div>
              {usernameError && (
                <p className="text-red-500 text-sm mt-1">{usernameError}</p>
              )}
              {usernameAvailable && !usernameError && (
                <p className="text-green-500 text-sm mt-1">Username available!</p>
              )}
            </div>

            {/* Display Name Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Display Name (Optional)</label>
              <input
                type="text"
                placeholder="Your display name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded-xl p-3 text-gray-900 focus:outline-none focus:border-pink-500"
                maxLength={50}
              />
            </div>

            {/* Bio Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Bio (Optional)</label>
              <textarea
                placeholder="Tell us about yourself"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full h-24 bg-white border border-gray-300 rounded-xl p-3 resize-none text-gray-900 focus:outline-none focus:border-pink-500"
                maxLength={160}
              />
              <p className="text-xs text-gray-500 mt-1">{bio.length}/160 characters</p>
            </div>
          </div>

          <button
            onClick={handleUsernameNext}
            disabled={!usernameAvailable}
            className="w-full py-3 bg-pink-600 text-white rounded-xl font-semibold hover:bg-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next: Choose Interests
          </button>

          <p className="text-xs text-gray-500 text-center">
            Step 1 of 2
          </p>
        </div>
      </div>
    );
  }

  // Step 2: Interests Selection
  if (currentStep === 'interests') {
    return (
      <div className="min-h-screen flex flex-col px-6 py-8 bg-white">
        <div className="w-full max-w-md mx-auto flex-1">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Choose what will interest you</h2>
            <p className="text-gray-600 text-sm">Your feeds will be personalized based on what interest you.</p>
          </div>

          <div className="flex flex-wrap gap-3 mb-6">
            {availableInterests.map((interest) => (
              <button
                key={interest}
                onClick={() => handleInterestToggle(interest)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedInterests.includes(interest)
                    ? 'bg-pink-600 text-white'
                    : 'bg-white text-gray-900 border border-gray-300 hover:border-pink-500'
                }`}
              >
                {interest}
                {selectedInterests.includes(interest) ? ' ×' : ' +'}
              </button>
            ))}
          </div>
        </div>

        <div className="w-full max-w-md mx-auto flex gap-3 pb-4">
          <button
            onClick={() => setCurrentStep('username')}
            className="flex-1 py-3 bg-gray-200 text-gray-900 rounded-lg font-semibold hover:bg-gray-300 transition-all"
          >
            Skip
          </button>
          <button
            onClick={handleInterestsNext}
            disabled={isSubmitting || selectedInterests.length === 0}
            className="flex-1 py-3 bg-pink-600 text-white rounded-lg font-semibold hover:bg-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                Creating...
              </>
            ) : (
              `Next${selectedInterests.length > 0 ? ` (${selectedInterests.length})` : ''}`
            )}
          </button>
        </div>
      </div>
    );
  }

  // Step 3: Education Screens (Onboarding1)
  if (currentStep === 'onboarding1') {
    return <Onboarding1 onNext={handleEducationNext} onSkip={handleSkipEducation} />;
  }

  if (currentStep === 'onboarding11') {
    return <Onboarding11 onNext={handleEducationNext} onSkip={handleSkipEducation} />;
  }

  if (currentStep === 'onboarding12') {
    return <Onboarding12 onNext={handleEducationNext} onSkip={handleSkipEducation} />;
  }

  if (currentStep === 'onboarding13') {
    return <Onboarding13 onNext={handleEducationNext} onSkip={handleSkipEducation} />;
  }

  if (currentStep === 'onboarding14') {
    return <Onboarding14 onNext={handleEducationNext} onSkip={handleSkipEducation} />;
  }

  // Final Step: Swipe Up to Start
  if (currentStep === 'swipe-final') {
    // Add touch support for swipe up gesture
    const [touchStart, setTouchStart] = useState(0);
    
    const handleTouchStart = (e: React.TouchEvent) => {
      setTouchStart(e.touches[0].clientY);
    };
    
    const handleTouchEnd = (e: React.TouchEvent) => {
      const touchEnd = e.changedTouches[0].clientY;
      const diff = touchStart - touchEnd;
      
      // If swiped up more than 50px, navigate to feed
      if (diff > 50) {
        handleSwipeUp();
      }
    };

    return (
      <div 
        className="min-h-screen w-full bg-white flex flex-col items-center justify-center px-6 cursor-pointer"
        onClick={handleSwipeUp}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="text-center space-y-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
            Swipe up to start exploring
          </h1>
          
          {/* Animated arrows */}
          <div className="flex flex-col items-center gap-2 animate-bounce">
            <svg className="w-8 h-8 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
            <svg className="w-8 h-8 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
            <svg className="w-8 h-8 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
