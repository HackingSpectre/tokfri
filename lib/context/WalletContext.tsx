'use client';

import React, { createContext, useContext, useEffect, useState, useRef, ReactNode } from 'react';
import { getSuiClient, computeSuiAddress, isSessionExpired, serializeKeyPair, deserializeKeyPair, prepareZkLogin, getGoogleOAuthUrl, decodeJwt, sendSuiTransaction, formatSuiBalance } from '@/lib/utils/zklogin';
import type { WalletState, ZkLoginSession, User } from '@/lib/types/auth';

interface WalletContextType extends WalletState {
  login: () => Promise<void>;
  logout: () => void;
  switchNetwork: (network: 'mainnet' | 'devnet' | 'testnet') => void;
  user: User | null;
  setUser: (user: User | null) => void;
  refreshBalance: () => Promise<void>;
  sendTransaction: (recipient: string, amount: number) => Promise<string>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

const STORAGE_KEYS = {
  SESSION: 'zklogin_session',
  USER: 'tokfri_user',
  NETWORK: 'sui_network',
  SESSION_TIMESTAMP: 'zklogin_session_timestamp',
  REMEMBER_ME: 'tokfri_remember_me',
};

export function WalletProvider({ children }: { children: ReactNode }) {
  const [walletState, setWalletState] = useState<WalletState>({
    address: null,
    isConnected: false,
    isLoading: false, // Non-blocking initialization
    balance: null,
    network: 'devnet',
  });

  const [user, setUser] = useState<User | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isNavigationReady, setIsNavigationReady] = useState(true); // New: immediate navigation

  // Initialize wallet on mount - NON-BLOCKING with immediate navigation
  useEffect(() => {
    // Set navigation ready immediately
    setIsNavigationReady(true);
    
    // Initialize wallet in background
    initializeWallet().catch((error) => {
      console.error('Wallet initialization failed:', error);
    });
    
    // Listen for storage changes (when OAuth callback completes)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEYS.SESSION || e.key === STORAGE_KEYS.USER) {
        initializeWallet();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for custom event from same tab (OAuth callback)
    const handleAuthComplete = () => {
      initializeWallet();
    };
    
    window.addEventListener('auth-complete', handleAuthComplete);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('auth-complete', handleAuthComplete);
    };
  }, []);

  // Refresh balance when address or network changes - with debounce and deduplication
  const balanceRequestRef = useRef<Promise<void> | null>(null);
  useEffect(() => {
    if (!isInitialized || !walletState.address || !walletState.isConnected) return;
    
    // Debounce balance refresh to avoid too many blockchain queries
    const timer = setTimeout(() => {
      // Prevent duplicate requests
      if (!balanceRequestRef.current) {
        balanceRequestRef.current = refreshBalance().finally(() => {
          balanceRequestRef.current = null;
        });
      }
    }, 1000); // Increased debounce to 1 second
    
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [walletState.address, walletState.network, isInitialized]);
  // Only refresh when address/network changes, not when balance updates

  /**
   * Initialize wallet from stored session - OPTIMIZED WITH PERSISTENT CACHING
   */
  async function initializeWallet() {
    try {
      const storedSession = localStorage.getItem(STORAGE_KEYS.SESSION);
      const storedUser = localStorage.getItem(STORAGE_KEYS.USER);
      const storedNetwork = localStorage.getItem(STORAGE_KEYS.NETWORK) as any;
      const sessionTimestamp = localStorage.getItem(STORAGE_KEYS.SESSION_TIMESTAMP);

      if (storedSession) {
        const session: ZkLoginSession = JSON.parse(storedSession);

        // DON'T check JWT/epoch expiration on initialization
        // Let user stay logged in for viewing/reading
        // Only validate when trying to send transactions
        // This provides better UX - user stays logged in until they try to send

        // Update session timestamp to track last activity
        localStorage.setItem(STORAGE_KEYS.SESSION_TIMESTAMP, Date.now().toString());

        // Compute address from stored session (synchronous, fast)
        const address = computeSuiAddress(session.jwt, session.userSalt);

        console.log('✅ Wallet initialized from stored session:', {
          address: address.substring(0, 10) + '...',
          network: storedNetwork || 'devnet',
          hasUser: !!storedUser,
          maxEpoch: session.maxEpoch,
        });

        setWalletState({
          address,
          isConnected: true,
          isLoading: false,
          balance: null,
          network: storedNetwork || 'devnet',
        });

        // Load user from cache first (fast)
        if (storedUser) {
          setUser(JSON.parse(storedUser));
          setIsInitialized(true);
        } else {
          // Fetch user in background - don't block
          setIsInitialized(true); // Mark as initialized immediately
          fetchUserInBackground(address);
        }
      } else {
        console.log('No stored session found - user needs to login');
        setIsInitialized(true);
      }
    } catch (error) {
      console.error('Failed to initialize wallet:', error);
      clearStoredData();
      setIsInitialized(true);
    }
  }

  /**
   * Fetch user data in background without blocking
   */
  async function fetchUserInBackground(address: string) {
    try {
      const response = await fetch(`/api/users/resolve?address=${address}`);
      if (response.ok) {
        const data = await response.json();
        if (data.user) {
          setUser(data.user);
          localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(data.user));
        }
      }
    } catch (err) {
      console.error('Failed to fetch user data:', err);
    }
  }

  /**
   * Refresh wallet balance - WITH ENHANCED CACHING AND ERROR HANDLING
   */
  const balanceCacheRef = React.useRef<{ timestamp: number; balance: string; address: string } | null>(null);
  const BALANCE_CACHE_TTL = 60000; // Increased to 60 seconds cache
  
  async function refreshBalance() {
    if (!walletState.address) return;

    // Use cached balance if fresh and for same address
    const now = Date.now();
    if (balanceCacheRef.current && 
        (now - balanceCacheRef.current.timestamp) < BALANCE_CACHE_TTL &&
        balanceCacheRef.current.address === walletState.address) {
      setWalletState(prev => ({
        ...prev,
        balance: balanceCacheRef.current!.balance,
      }));
      return;
    }

    try {
      const suiClient = getSuiClient(walletState.network);
      const balance = await suiClient.getBalance({
        owner: walletState.address,
      });

      const balanceValue = balance.totalBalance;
      const formattedBalance = formatSuiBalance(balanceValue);
      
      // Update cache with address
      balanceCacheRef.current = {
        timestamp: now,
        balance: formattedBalance,
        address: walletState.address,
      };

      setWalletState(prev => ({
        ...prev,
        balance: formattedBalance,
      }));
    } catch (error) {
      console.error('Failed to fetch balance:', error);
      // Don't throw error, just log it to prevent blocking navigation
    }
  }

  /**
   * Start login flow with Google
   */
  async function login() {
    try {
      setWalletState(prev => ({ ...prev, isLoading: true }));

      // Prepare zkLogin session
      const { ephemeralKeyPair, randomness, maxEpoch, nonce } = await prepareZkLogin();

      // Store ephemeral data in session storage (temporary)
      const ephemeralData = {
        ephemeralKeyPair: serializeKeyPair(ephemeralKeyPair),
        randomness,
        maxEpoch,
        nonce,
      };
      sessionStorage.setItem('zklogin_ephemeral', JSON.stringify(ephemeralData));

      // Build OAuth URL
      const redirectUrl = `${window.location.origin}/auth/callback`;
      const oauthUrl = getGoogleOAuthUrl(nonce, redirectUrl);

      // Redirect to Google OAuth
      window.location.href = oauthUrl;
    } catch (error) {
      console.error('Login failed:', error);
      setWalletState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  }

  /**
   * Logout and clear session - ENHANCED WITH CONFIRMATION
   */
  function logout() {
    // Clear all session data
    clearStoredData();
    
    // Clear balance cache
    balanceCacheRef.current = null;
    
    // Reset state
    setWalletState({
      address: null,
      isConnected: false,
      isLoading: false,
      balance: null,
      network: walletState.network,
    });
    setUser(null);
    
    // Optional: Dispatch logout event for other components to listen
    window.dispatchEvent(new Event('user-logout'));
  }

  /**
   * Switch blockchain network
   */
  function switchNetwork(network: 'mainnet' | 'devnet' | 'testnet') {
    localStorage.setItem(STORAGE_KEYS.NETWORK, network);
    setWalletState(prev => ({ ...prev, network }));
  }

  /**
   * Clear stored data - COMPREHENSIVE CLEANUP
   */
  function clearStoredData() {
    // Clear localStorage
    localStorage.removeItem(STORAGE_KEYS.SESSION);
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(STORAGE_KEYS.SESSION_TIMESTAMP);
    localStorage.removeItem(STORAGE_KEYS.REMEMBER_ME);
    
    // Clear sessionStorage
    sessionStorage.removeItem('zklogin_ephemeral');
    
    // Clear any other cached data
    // You can add more cleanup here if needed
  }

  /**
   * Send transaction
   */
  async function sendTransaction(recipient: string, amount: number): Promise<string> {
    const storedSession = localStorage.getItem(STORAGE_KEYS.SESSION);
    if (!storedSession) {
      throw new Error('No active session. Please login first.');
    }

    const session: ZkLoginSession = JSON.parse(storedSession);
    
    // Check if JWT is expired
    if (isSessionExpired(session.expiresAt)) {
      // Clear expired session
      logout();
      throw new Error('Session expired. Please login again to send transactions.');
    }
    
    // Check if zkLogin epoch is expired (check against Sui blockchain)
    try {
      const suiClient = getSuiClient(walletState.network);
      const { epoch: currentEpoch } = await suiClient.getLatestSuiSystemState();
      const currentEpochNum = Number(currentEpoch);
      
      if (currentEpochNum >= session.maxEpoch) {
        logout();
        throw new Error(`Your zkLogin session expired at epoch ${session.maxEpoch} (current: ${currentEpochNum}). Please login again.`);
      }
    } catch (error: any) {
      if (error.message?.includes('zkLogin session expired')) {
        throw error; // Re-throw our custom error
      }
      // If we can't check epoch, continue anyway (network issue)
      console.warn('Could not verify epoch, continuing...', error);
    }

    try {
      const txDigest = await sendSuiTransaction(session, recipient, amount, walletState.network);
      
      // Refresh balance after transaction
      await refreshBalance();
      
      return txDigest;
    } catch (error: any) {
      console.error('Send transaction error:', error);
      
      // Provide user-friendly error messages
      if (error.message?.includes('JWT token has expired')) {
        logout();
        throw new Error('Your login session has expired. Please login again to send transactions.');
      }
      
      if (error.message?.includes('Prover service error')) {
        throw new Error('Transaction signing failed. Please try logging out and logging back in.');
      }
      
      if (error.message?.includes('Insufficient gas')) {
        throw new Error('Insufficient balance to cover transaction fees.');
      }
      
      // Re-throw original error if no specific handling
      throw error;
    }
  }

  const value: WalletContextType = {
    ...walletState,
    login,
    logout,
    switchNetwork,
    user,
    setUser,
    refreshBalance,
    sendTransaction,
  };

  // Show children immediately for navigation, don't wait for wallet initialization
  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

/**
 * Hook to use wallet context
 */
export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}
