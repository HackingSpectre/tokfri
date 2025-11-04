'use client';

import { useEffect, useRef } from 'react';
import { useWallet } from '@/lib/context/WalletContext';

/**
 * Hook to monitor session validity and handle automatic logout
 * OPTIMIZED: Reduced frequency and non-blocking checks
 */
export function useSessionMonitor() {
  const { logout, isConnected } = useWallet();
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isConnected) return;

    // Check session validity every 10 minutes (reduced frequency)
    checkIntervalRef.current = setInterval(() => {
      checkSessionValidity();
    }, 10 * 60 * 1000); // 10 minutes instead of 5

    // Check immediately on mount but don't block
    setTimeout(checkSessionValidity, 1000); // Delayed by 1 second

    return () => {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
    };
  }, [isConnected]);

  function checkSessionValidity() {
    // Use setTimeout to make this non-blocking
    setTimeout(() => {
      try {
        const storedSession = localStorage.getItem('zklogin_session');
        
        if (!storedSession) {
          return;
        }

        const session = JSON.parse(storedSession);
        const now = Date.now();

        // Check if JWT has expired
        if (session.expiresAt && now > session.expiresAt) {
          console.log('Session expired, logging out...');
          logout();
          
          // Use a more user-friendly notification instead of alert
          if (typeof window !== 'undefined') {
            // Could replace with a toast notification in the future
            console.warn('Session expired. Please log in again.');
          }
        }
      } catch (error) {
        console.error('Error checking session validity:', error);
      }
    }, 0);
  }
}
