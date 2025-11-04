import { NextRequest, NextResponse } from 'next/server';
import { decodeJwt } from 'jose';
import * as crypto from 'crypto';

/**
 * Generate deterministic user salt using HKDF
 * This creates a unique salt per user based on their OAuth identity
 * 
 * Uses HKDF (HMAC-based Key Derivation Function) as recommended in zkLogin docs:
 * HKDF(ikm = master_seed, salt = iss || aud, info = sub)
 * 
 * Security:
 * - Master seed stored securely in environment variable
 * - Same user always gets same salt (deterministic)
 * - Different apps get different salts (aud varies)
 * - Cannot reverse engineer OAuth identity from salt
 * 
 * Uses Node.js built-in crypto.hkdf instead of @noble/hashes for better compatibility
 */
export async function POST(request: NextRequest) {
  try {
    const { jwt } = await request.json();

    if (!jwt) {
      return NextResponse.json(
        { error: 'JWT token is required' },
        { status: 400 }
      );
    }

    // Decode JWT to extract iss, aud, sub
    let decodedJwt: any;
    try {
      decodedJwt = decodeJwt(jwt);
    } catch (error) {
      console.error('Invalid JWT:', error);
      return NextResponse.json(
        { error: 'Invalid JWT token' },
        { status: 400 }
      );
    }

    const { iss, aud, sub } = decodedJwt;

    if (!iss || !aud || !sub) {
      return NextResponse.json(
        { error: 'JWT missing required claims (iss, aud, sub)' },
        { status: 400 }
      );
    }

    // Get master seed from environment (generate one if not set)
    let masterSeed = process.env.ZKLOGIN_SALT_MASTER_SEED;
    
    if (!masterSeed) {
      console.warn('⚠️  ZKLOGIN_SALT_MASTER_SEED not set! Using fallback (NOT SECURE FOR PRODUCTION)');
      // Fallback for development - DO NOT use in production
      masterSeed = 'dev-fallback-seed-change-this-in-production-' + process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    }

    // Derive salt using Node.js crypto.hkdf (promisified)
    // ikm (Input Key Material) = master seed
    // salt = iss || aud (OAuth provider + client ID)
    // info = sub (user identifier)
    const ikmBytes = Buffer.from(masterSeed,        'utf-8');
    const saltBytes = Buffer.from(`${iss}${aud}`, 'utf-8');
    const infoBytes = Buffer.from(sub, 'utf-8');

    // Generate 16 bytes (128 bits) of salt using HKDF
    const derivedSalt = crypto.hkdfSync('sha256', ikmBytes, saltBytes, infoBytes, 16);
    
    // Convert Buffer to hex string, then to BigInt
    const hexString = Buffer.from(derivedSalt).toString('hex');
    const saltBigInt = BigInt('0x' + hexString);
    const userSalt = saltBigInt.toString();

    return NextResponse.json({ salt: userSalt });

  } catch (error) {
    console.error('Salt generation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
