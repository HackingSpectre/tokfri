import { NextRequest, NextResponse } from 'next/server';

/**
 * Test endpoint to verify salt service is working
 * GET /api/auth/salt/test
 */
export async function GET(request: NextRequest) {
  try {
    // Check if master seed is configured
    const hasMasterSeed = !!process.env.ZKLOGIN_SALT_MASTER_SEED;
    
    // Test JWT (sample from Google)
    const testJwt = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IjEifQ.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJhdWQiOiJ0ZXN0LWNsaWVudC1pZCIsInN1YiI6IjEyMzQ1Njc4OTAiLCJleHAiOjk5OTk5OTk5OTl9.test';
    
    // Try to import crypto libraries
    let cryptoLibsWork = false;
    try {
      // @ts-ignore
      const { hkdf } = await import('@noble/hashes/hkdf');
      // @ts-ignore
      const { sha256 } = await import('@noble/hashes/sha2');
      cryptoLibsWork = !!(hkdf && sha256);
    } catch (error) {
      console.error('Crypto libs import failed:', error);
    }

    return NextResponse.json({
      status: 'ok',
      masterSeedConfigured: hasMasterSeed,
      cryptoLibrariesAvailable: cryptoLibsWork,
      message: cryptoLibsWork 
        ? '✅ Salt service is ready!' 
        : '❌ Crypto libraries not available',
      nodeVersion: process.version,
      env: process.env.NODE_ENV,
    });
  } catch (error) {
    console.error('Test endpoint error:', error);
    return NextResponse.json(
      { 
        status: 'error', 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
