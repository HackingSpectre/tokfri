import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { generateNonce, generateRandomness, getZkLoginSignature, genAddressSeed } from '@mysten/sui/zklogin';
import { jwtToAddress } from '@mysten/sui/zklogin';
import { SuiClient } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import { decodeJwt as joseDecodeJwt } from 'jose';
import type { JwtPayload, ZkLoginSession } from '@/lib/types/auth';

/**
 * Get the Sui client instance based on network
 */
export function getSuiClient(network: 'mainnet' | 'devnet' | 'testnet' = 'devnet'): SuiClient {
  const rpcUrls = {
    mainnet: 'https://fullnode.mainnet.sui.io',
    devnet: 'https://fullnode.devnet.sui.io',
    testnet: 'https://fullnode.testnet.sui.io',
  };

  return new SuiClient({ url: rpcUrls[network] });
}

/**
 * Generate ephemeral key pair and nonce for zkLogin
 */
export async function prepareZkLogin() {
  const suiClient = getSuiClient(process.env.NEXT_PUBLIC_SUI_NETWORK as any || 'devnet');
  
  // Get current epoch info
  const { epoch, epochDurationMs, epochStartTimestampMs } = 
    await suiClient.getLatestSuiSystemState();

  // Generate ephemeral key pair
  const ephemeralKeyPair = new Ed25519Keypair();
  
  // Generate randomness for nonce
  const randomness = generateRandomness();
  
  // Set max epoch (ephemeral key valid for 10 epochs from now)
  // Each epoch on devnet is ~24 hours, so 10 epochs = ~10 days
  const maxEpoch = Number(epoch) + 10;
  
  // Generate nonce
  const nonce = generateNonce(
    ephemeralKeyPair.getPublicKey(),
    maxEpoch,
    randomness
  );
  
  console.log('zkLogin session will expire at epoch:', maxEpoch, 'Current:', Number(epoch));

  return {
    ephemeralKeyPair,
    randomness,
    maxEpoch,
    nonce,
    currentEpoch: Number(epoch),
  };
}

/**
 * Build Google OAuth URL for zkLogin
 */
export function getGoogleOAuthUrl(nonce: string, redirectUrl: string): string {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  
  if (!clientId) {
    throw new Error('Google Client ID not configured');
  }

  const params = new URLSearchParams({
    client_id: clientId,
    response_type: 'id_token',
    redirect_uri: redirectUrl,
    scope: 'openid',
    nonce: nonce,
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

/**
 * Decode JWT token
 */
export function decodeJwt(jwt: string): JwtPayload {
  try {
    return joseDecodeJwt(jwt) as JwtPayload;
  } catch (error) {
    console.error('Failed to decode JWT:', error);
    throw new Error('Invalid JWT token');
  }
}

/**
 * Compute Sui address from JWT and salt
 */
export function computeSuiAddress(jwt: string, userSalt: string): string {
  try {
    return jwtToAddress(jwt, userSalt);
  } catch (error) {
    console.error('Failed to compute Sui address:', error);
    throw new Error('Failed to compute address');
  }
}

/**
 * Serialize ephemeral key pair for storage
 */
export function serializeKeyPair(keyPair: Ed25519Keypair): string {
  return keyPair.getSecretKey();
}

/**
 * Deserialize ephemeral key pair from storage
 */
export function deserializeKeyPair(serialized: string): Ed25519Keypair {
  return Ed25519Keypair.fromSecretKey(serialized);
}

/**
 * Check if zkLogin session is expired (JWT-based expiration)
 */
export function isSessionExpired(expiresAt: number): boolean {
  return Date.now() > expiresAt;
}

/**
 * Check if zkLogin session epoch has expired
 */
export async function isEpochExpired(maxEpoch: number, network: 'mainnet' | 'devnet' | 'testnet' = 'devnet'): Promise<boolean> {
  try {
    const suiClient = getSuiClient(network);
    const { epoch } = await suiClient.getLatestSuiSystemState();
    const currentEpoch = Number(epoch);
    
    console.log('Epoch check:', {
      currentEpoch,
      maxEpoch,
      expired: currentEpoch >= maxEpoch,
    });
    
    return currentEpoch >= maxEpoch;
  } catch (error) {
    console.error('Failed to check epoch expiration:', error);
    // On error, assume not expired to avoid unnecessary logouts
    return false;
  }
}

/**
 * Format Sui address for display (short version)
 */
export function formatAddress(address: string): string {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

/**
 * Format SUI balance from MIST to SUI
 */
export function formatSuiBalance(mist: string | number): string {
  const sui = Number(mist) / 1_000_000_000;
  return sui.toFixed(2);
}

/**
 * Get zkLogin proof from Mysten Labs prover service
 */
export async function getZkProof(
  jwt: string,
  ephemeralKeyPair: Ed25519Keypair,
  userSalt: string,
  maxEpoch: number,
  randomness: string
): Promise<any> {
  const proverUrl = process.env.NEXT_PUBLIC_ZKLOGIN_PROVER_URL || 'https://prover-dev.mystenlabs.com/v1';
  
  // Decode and validate JWT
  const decodedJwt = decodeJwt(jwt);
  
  // Check if JWT is expired
  if (decodedJwt.exp && decodedJwt.exp * 1000 < Date.now()) {
    throw new Error('JWT token has expired. Please login again.');
  }
  
  console.log('Requesting zkProof with:', {
    proverUrl,
    maxEpoch,
    jwtIss: decodedJwt.iss,
    jwtExp: decodedJwt.exp ? new Date(decodedJwt.exp * 1000).toISOString() : 'none',
    jwtSub: decodedJwt.sub?.substring(0, 10) + '...',
  });
  
  // Convert ephemeral public key to base64
  const ephemeralPublicKeyBytes = ephemeralKeyPair.getPublicKey().toSuiBytes();
  const ephemeralPublicKeyBase64 = Buffer.from(ephemeralPublicKeyBytes).toString('base64');
  
  const payload = {
    jwt,
    extendedEphemeralPublicKey: ephemeralPublicKeyBase64,
    maxEpoch: maxEpoch.toString(),
    jwtRandomness: randomness,
    salt: userSalt,
    keyClaimName: 'sub',
  };
  
  console.log('Prover payload (sanitized):', {
    ...payload,
    jwt: 'REDACTED',
    salt: 'REDACTED',
  });

  try {
    const response = await fetch(proverUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      // Get detailed error response
      let errorDetails = response.statusText;
      try {
        const errorBody = await response.json();
        errorDetails = JSON.stringify(errorBody);
      } catch {
        try {
          errorDetails = await response.text();
        } catch {
          // Use statusText if body parsing fails
        }
      }
      
      console.error('Prover service error:', {
        status: response.status,
        statusText: response.statusText,
        details: errorDetails,
        payload: {
          ...payload,
          jwt: jwt.substring(0, 20) + '...', // Don't log full JWT
        }
      });
      
      throw new Error(`Prover service error (${response.status}): ${errorDetails}`);
    }

    const zkProof = await response.json();
    return zkProof;
  } catch (error) {
    console.error('Failed to get zkProof:', error);
    throw error; // Re-throw the original error with details
  }
}

/**
 * Send SUI tokens using zkLogin
 */
export async function sendSuiTransaction(
  session: ZkLoginSession,
  recipient: string,
  amount: number,
  network: 'mainnet' | 'devnet' | 'testnet' = 'devnet'
): Promise<string> {
  try {
    const suiClient = getSuiClient(network);
    
    // Check current epoch vs session maxEpoch
    const { epoch: currentEpoch } = await suiClient.getLatestSuiSystemState();
    const currentEpochNum = Number(currentEpoch);
    
    console.log('Epoch check:', {
      currentEpoch: currentEpochNum,
      maxEpoch: session.maxEpoch,
      isExpired: currentEpochNum >= session.maxEpoch,
    });
    
    if (currentEpochNum >= session.maxEpoch) {
      throw new Error(`zkLogin session expired. Session was valid until epoch ${session.maxEpoch}, but current epoch is ${currentEpochNum}. Please login again.`);
    }
    
    const ephemeralKeyPair = deserializeKeyPair(session.ephemeralKeyPair);
    const senderAddress = computeSuiAddress(session.jwt, session.userSalt);

    // Create transaction
    const tx = new Transaction();
    const [coin] = tx.splitCoins(tx.gas, [amount * 1_000_000_000]); // Convert SUI to MIST
    tx.transferObjects([coin], recipient);
    tx.setSender(senderAddress);

    // Build transaction bytes
    const transactionBytes = await tx.build({ client: suiClient });

    // Sign with ephemeral key
    const { signature } = await ephemeralKeyPair.signTransaction(transactionBytes);

    // Get zkProof if not already cached
    let zkProof = session.zkProof;
    if (!zkProof) {
      zkProof = await getZkProof(
        session.jwt,
        ephemeralKeyPair,
        session.userSalt,
        session.maxEpoch,
        session.randomness
      );
    }

    // Generate addressSeed from salt (required for zkLogin signature)
    const addressSeed = genAddressSeed(
      BigInt(session.userSalt),
      'sub', // keyClaimName
      decodeJwt(session.jwt).sub as string,
      decodeJwt(session.jwt).aud as string
    ).toString();

    console.log('Generating zkLogin signature with:', {
      addressSeed,
      maxEpoch: session.maxEpoch,
      hasZkProof: !!zkProof,
      senderAddress,
    });

    // Generate zkLogin signature
    const zkLoginSignature = getZkLoginSignature({
      inputs: {
        proofPoints: zkProof?.proofPoints || { a: [], b: [], c: [] },
        issBase64Details: zkProof?.issBase64Details || { value: '', indexMod4: 0 },
        headerBase64: zkProof?.headerBase64 || '',
        addressSeed: addressSeed, // Now using proper BigInt address seed
      },
      maxEpoch: session.maxEpoch,
      userSignature: signature,
    });

    // Execute transaction
    const result = await suiClient.executeTransactionBlock({
      transactionBlock: transactionBytes,
      signature: zkLoginSignature,
      options: {
        showEffects: true,
      },
    });

    if (result.effects?.status?.status !== 'success') {
      throw new Error('Transaction failed');
    }

    return result.digest;
  } catch (error) {
    console.error('Transaction error:', error);
    throw error;
  }
}
