'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useWallet } from '@/lib/context/WalletContext';

export default function LandingContent() {
  const router = useRouter();
  const { login, isConnected, isLoading } = useWallet();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Redirect if already connected
  useEffect(() => {
    if (isConnected && isClient) {
      console.log('User is connected, redirecting to /feed');
      router.push('/feed');
    } else {
      console.log('Landing page state:', { isConnected, isClient, isLoading });
    }
  }, [isConnected, isClient, router, isLoading]);

  const handleLogin = async () => {
    try {
      await login();
    } catch (error) {
      console.error('Login error:', error);
      alert('Failed to login. Please try again.');
    }
  };

  if (!isClient) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden bg-white">
      <div className="absolute inset-0 bg-gradient-radial from-pink-100 via-white to-white"></div>
      
      <div className="relative z-10 text-center space-y-8 max-w-md">
        <div className="space-y-4">
          <h1 className="text-6xl font-bold text-pink-600">Tokfri</h1>
          <p className="text-xl text-gray-700">Own Your Voice, Earn Your Influence</p>
          <p className="text-sm text-gray-500">Powered by Sui Blockchain</p>
        </div>

        <div className="space-y-3">
          <button
            onClick={handleLogin}
            disabled={isLoading}
            className="w-full py-4 px-6 bg-pink-600 hover:bg-pink-700 rounded-xl font-semibold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                Connecting...
              </>
            ) : (
              <>
                <svg className="w-6 h-6" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
