'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useWallet } from '@/lib/context/WalletContext';
import { decodeJwt } from '@/lib/utils/zklogin';

export default function OnboardingForm() {
  const router = useRouter();
  const { address, setUser } = useWallet();
  
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [usernameError, setUsernameError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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

      // Register user
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
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      // Store user data
      setUser(data.user);
      localStorage.setItem('tokfri_user', JSON.stringify(data.user));

      // Redirect to feed
      router.push('/feed');
    } catch (error: any) {
      console.error('Registration error:', error);
      alert(error.message || 'Failed to register. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!address) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-gradient-to-br from-purple-900/20 via-black to-black">
      <div className="w-full max-w-md glass-dark rounded-3xl p-8 space-y-6 border border-white/10">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-2">Welcome to Tokfri!</h2>
          <p className="text-gray-400">Choose your username to complete setup</p>
        </div>

        <div className="space-y-4">
          {/* Username Input */}
          <div>
            <label className="block text-sm font-medium mb-2">Username *</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Choose your username"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase())}
                className={`w-full bg-white/5 border ${
                  usernameError 
                    ? 'border-red-500' 
                    : usernameAvailable 
                    ? 'border-green-500' 
                    : 'border-white/10'
                } rounded-xl p-3 focus:outline-none focus:border-primary transition-colors`}
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

          {/* Bio Input */}
          <div>
            <label className="block text-sm font-medium mb-2">Bio (Optional)</label>
            <textarea
              placeholder="Tell us about yourself"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full h-24 bg-white/5 border border-white/10 rounded-xl p-3 resize-none focus:outline-none focus:border-primary"
              maxLength={160}
            />
            <p className="text-xs text-gray-500 mt-1">{bio.length}/160 characters</p>
          </div>

          {/* Wallet Address Display */}
          <div className="bg-white/5 rounded-xl p-3 border border-white/10">
            <p className="text-xs text-gray-400 mb-1">Your Sui Wallet</p>
            <p className="text-sm font-mono break-all">{address}</p>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={!usernameAvailable || isSubmitting}
          className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
              Creating your profile...
            </>
          ) : (
            <>Complete Setup</>
          )}
        </button>

        <p className="text-xs text-gray-500 text-center">
          By creating an account, you agree to Tokfri&apos;s Terms of Service
        </p>
      </div>
    </div>
  );
}
