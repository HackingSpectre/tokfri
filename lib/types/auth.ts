// zkLogin and Authentication Types

export interface ZkLoginSession {
  ephemeralKeyPair: string; // Serialized ephemeral key pair
  userSalt: string;
  zkProof: PartialZkLoginSignature | null;
  maxEpoch: number;
  randomness: string;
  jwt: string;
  expiresAt: number;
}

export interface PartialZkLoginSignature {
  proofPoints: {
    a: string[];
    b: string[][];
    c: string[];
  };
  issBase64Details: {
    value: string;
    indexMod4: number;
  };
  headerBase64: string;
}

export interface JwtPayload {
  iss?: string;
  sub?: string;
  aud?: string[] | string;
  exp?: number;
  nbf?: number;
  iat?: number;
  jti?: string;
  nonce?: string;
}

export interface WalletState {
  address: string | null;
  isConnected: boolean;
  isLoading: boolean;
  balance: string | null;
  network: 'mainnet' | 'devnet' | 'testnet';
}

export interface User {
  id: string;
  username: string;
  suiAddress: string;
  oauthProvider: 'google';
  oauthSub: string;
  displayName?: string | null;
  avatarUrl?: string | null;
  bio?: string | null;
  websiteUrl?: string | null;
  verified?: boolean | null;
  createdAt: string;
  // Legacy fields for backward compatibility
  avatar?: string;
  profileImage?: string;
}
