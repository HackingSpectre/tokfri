'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { computeSuiAddress, decodeJwt, deserializeKeyPair } from '@/lib/utils/zklogin';
import type { ZkLoginSession } from '@/lib/types/auth';

export default function AuthCallback() {
  const router = useRouter();
  const [status, setStatus] = useState<'processing' | 'error'>('processing');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    handleCallback();
  }, []);

  async function handleCallback() {
    try {
      // Get JWT from URL hash fragment (Google returns id_token in hash)
      const hash = window.location.hash.substring(1);
      const params = new URLSearchParams(hash);
      const jwt = params.get('id_token');

      if (!jwt) {
        throw new Error('No JWT token found in callback');
      }

      // Get ephemeral data from session storage
      const ephemeralDataStr = sessionStorage.getItem('zklogin_ephemeral');
      if (!ephemeralDataStr) {
        throw new Error('Ephemeral data not found. Please try logging in again.');
      }

      const ephemeralData = JSON.parse(ephemeralDataStr);

      // Decode JWT to get user info
      const decodedJwt = decodeJwt(jwt);
      
      // Get user salt from backend (backend calls Mysten Labs salt service with full JWT)
      const userSalt = await getUserSalt(jwt);

      // Compute Sui address
      const address = computeSuiAddress(jwt, userSalt);

      // Calculate JWT expiration
      const expiresAt = (decodedJwt.exp || 0) * 1000; // Convert to milliseconds

      // Generate zkProof immediately during login (while JWT is fresh)
      // This avoids issues with JWT expiration when sending transactions later
      let zkProof = null;
      try {
        setStatus('processing');
        console.log('Generating zkProof during login...');
        
        const ephemeralKeyPair = deserializeKeyPair(ephemeralData.ephemeralKeyPair);
        
        // Import getZkProof function
        const { getZkProof } = await import('@/lib/utils/zklogin');
        
        zkProof = await getZkProof(
          jwt,
          ephemeralKeyPair,
          userSalt,
          ephemeralData.maxEpoch,
          ephemeralData.randomness
        );
        
        console.log('zkProof generated successfully during login');
      } catch (error) {
        console.warn('Failed to generate zkProof during login (will retry during transaction):', error);
        // Continue without zkProof - it will be generated during transaction
      }

      // Create session object
      const session: ZkLoginSession = {
        ephemeralKeyPair: ephemeralData.ephemeralKeyPair,
        userSalt,
        zkProof, // Store zkProof if generated successfully
        maxEpoch: ephemeralData.maxEpoch,
        randomness: ephemeralData.randomness,
        jwt,
        expiresAt,
      };

      // Store session in local storage with timestamp for persistence tracking
      localStorage.setItem('zklogin_session', JSON.stringify(session));
      localStorage.setItem('zklogin_session_timestamp', Date.now().toString());
      localStorage.setItem('tokfri_remember_me', 'true'); // Enable persistent session

      // Clear ephemeral data
      sessionStorage.removeItem('zklogin_ephemeral');

      // Check if user has a username registered
      const hasUsername = await checkUsername(address);

      // Dispatch custom event to notify WalletContext
      window.dispatchEvent(new Event('auth-complete'));

      if (hasUsername) {
        // Redirect to feed
        router.push('/feed');
      } else {
        // Redirect to onboarding to create username
        router.push('/onboarding');
      }
    } catch (error) {
      console.error('Auth callback error:', error);
      setStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Authentication failed');
      
      // Redirect to home after 3 seconds
      setTimeout(() => {
        router.push('/');
      }, 3000);
    }
  }

  /**
   * Get user salt from backend API (which calls Mysten Labs salt service)
   * The backend handles the JWT to avoid CORS issues
   */
  async function getUserSalt(jwt: string): Promise<string> {
    try {
      const response = await fetch('/api/auth/salt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ jwt }),
      });

      if (!response.ok) {
        throw new Error('Failed to get user salt');
      }

      const data = await response.json();
      return data.salt;
    } catch (error) {
      console.error('Failed to get user salt:', error);
      throw new Error('Failed to retrieve user salt from service');
    }
  }

  /**
   * Check if user has registered a username
   */
  async function checkUsername(address: string): Promise<boolean> {
    try {
      const response = await fetch(`/api/users/resolve?address=${address}`);
      
      if (response.ok) {
        const data = await response.json();
        
        // If user exists, store in local storage
        if (data.user) {
          localStorage.setItem('tokfri_user', JSON.stringify(data.user));
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.error('Failed to check username:', error);
      return false;
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 via-pink-500 to-red-500">
      <div className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl shadow-2xl border border-white/20 max-w-md w-full mx-4">
        {status === 'processing' && (
          <div className="text-center">
            <div className="mb-6">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-white mx-auto"></div>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Authenticating...</h2>
            <p className="text-white/80">
              Please wait while we complete your login
            </p>
          </div>
        )}

        {status === 'error' && (
          <div className="text-center">
            <div className="mb-6">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-8 h-8 text-red-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Authentication Failed</h2>
            <p className="text-white/80 mb-4">{errorMessage}</p>
            <p className="text-white/60 text-sm">Redirecting to home page...</p>
          </div>
        )}
      </div>
    </div>
  );
}
