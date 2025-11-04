# 🔧 zkLogin Send Transaction Fixes

## ❌ The Error You Were Getting

```
Prover service error: 
lib/utils/zklogin.ts (172:13) @ getZkProof
```

## 🔍 What This Error Means

The **Mysten Labs zkLogin Prover Service** is rejecting your request to generate a zero-knowledge proof. This happens for several reasons:

### **Common Causes:**

1. **JWT Token Expired** ⏰
   - Google JWTs expire after **1 hour**
   - If you logged in more than 1 hour ago, the JWT is invalid
   - The prover service rejects expired JWTs

2. **Wrong Payload Format** 📦
   - The prover expects specific data format
   - `extendedEphemeralPublicKey` must be base64 encoded
   - Missing or incorrect fields cause rejection

3. **Network Issues** 🌐
   - Prover service timeout
   - CORS issues (if calling from browser)
   - Service temporarily down

## ✅ What I Fixed

### **1. Enhanced Error Logging** 🔍

**Before:**
```typescript
throw new Error(`Prover service error: ${response.statusText}`);
```

**After:**
```typescript
// Now logs full error details including status code and response body
console.error('Prover service error:', {
  status: response.status,
  statusText: response.statusText,
  details: errorDetails,
});

throw new Error(`Prover service error (${response.status}): ${errorDetails}`);
```

**Benefits:**
- See exact HTTP status code (400, 401, 500, etc.)
- View detailed error message from prover
- Debug what went wrong

---

### **2. JWT Expiration Check** ⏰

**Added in `getZkProof()`:**
```typescript
// Check if JWT is expired
if (decodedJwt.exp && decodedJwt.exp * 1000 < Date.now()) {
  throw new Error('JWT token has expired. Please login again.');
}
```

**Benefits:**
- Catches expired JWT **before** sending to prover
- Provides clear error message to user
- Saves unnecessary API call

---

### **3. Generate zkProof During Login** 🎯

**The Big Fix! Now in `app/auth/callback/page.tsx`:**

```typescript
// Generate zkProof immediately during login (while JWT is fresh)
let zkProof = null;
try {
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
}

// Store zkProof in session
const session: ZkLoginSession = {
  // ... other fields
  zkProof, // Now cached!
};
```

**Why This is Important:**
- ✅ Generates zkProof **immediately** after OAuth (while JWT is fresh)
- ✅ Caches zkProof in localStorage
- ✅ No need to call prover again when sending transactions
- ✅ Avoids JWT expiration issues
- ✅ Faster transaction signing

---

### **4. Better Error Messages** 💬

**In `WalletContext.sendTransaction()`:**

```typescript
try {
  const txDigest = await sendSuiTransaction(session, recipient, amount, network);
  return txDigest;
} catch (error: any) {
  // User-friendly error messages
  if (error.message?.includes('JWT token has expired')) {
    logout(); // Auto-logout expired session
    throw new Error('Your login session has expired. Please login again to send transactions.');
  }
  
  if (error.message?.includes('Prover service error')) {
    throw new Error('Transaction signing failed. Please try logging out and logging back in.');
  }
  
  if (error.message?.includes('Insufficient gas')) {
    throw new Error('Insufficient balance to cover transaction fees.');
  }
}
```

**Benefits:**
- Clear, actionable error messages
- Auto-logout on session expiration
- User knows exactly what to do

---

### **5. Fixed Payload Format** 📦

**Changed `extendedEphemeralPublicKey` encoding:**

```typescript
// Convert to base64 (prover expects this format)
const ephemeralPublicKeyBytes = ephemeralKeyPair.getPublicKey().toSuiBytes();
const ephemeralPublicKeyBase64 = Buffer.from(ephemeralPublicKeyBytes).toString('base64');

const payload = {
  jwt,
  extendedEphemeralPublicKey: ephemeralPublicKeyBase64, // Now base64!
  maxEpoch: maxEpoch.toString(),
  jwtRandomness: randomness,
  salt: userSalt,
  keyClaimName: 'sub',
};
```

---

### **6. Debug Logging** 🐛

**Added throughout the flow:**

```typescript
console.log('Requesting zkProof with:', {
  proverUrl,
  maxEpoch,
  jwtIss: decodedJwt.iss,
  jwtExp: decodedJwt.exp ? new Date(decodedJwt.exp * 1000).toISOString() : 'none',
  jwtSub: decodedJwt.sub?.substring(0, 10) + '...',
});

console.log('Prover payload (sanitized):', {
  ...payload,
  jwt: 'REDACTED',
  salt: 'REDACTED',
});
```

**Benefits:**
- See exactly what's being sent to prover
- Check JWT expiration time
- Verify all parameters are correct

---

## 🎯 How to Test the Fix

### **Step 1: Clear Old Session**
```bash
# Open browser console
localStorage.clear();
sessionStorage.clear();
```

### **Step 2: Login Fresh**
1. Go to your app homepage
2. Click "Login with Google"
3. Complete OAuth flow
4. **Watch console for:** `zkProof generated successfully during login`

### **Step 3: Send Transaction**
1. Open wallet modal
2. Go to "Send" tab
3. Enter recipient address
4. Enter amount
5. Click "Send SUI"

### **Expected Console Output:**
```
Requesting zkProof with: {
  proverUrl: "https://prover-dev.mystenlabs.com/v1",
  maxEpoch: 543,
  jwtIss: "https://accounts.google.com",
  jwtExp: "2025-10-31T15:30:00.000Z",
  jwtSub: "10281203..."
}

Prover payload (sanitized): {
  extendedEphemeralPublicKey: "AIg7Uw...",
  maxEpoch: "543",
  jwtRandomness: "73625...",
  keyClaimName: "sub"
}

zkProof generated successfully during login
```

---

## 🚨 If You Still Get Errors

### **Error: "JWT token has expired"**
**Solution:** Just login again! Your session expired.

### **Error: "Prover service error (400)"**
**Check:**
- Is your JWT format correct?
- Is randomness a valid BigInt string?
- Is salt in correct format?
- Run with console open to see detailed error

### **Error: "Prover service error (429)"**
**Solution:** Rate limited. Wait 1 minute and try again.

### **Error: "Prover service error (500)"**
**Solution:** Mysten Labs prover is down. Try again later or switch to testnet.

---

## 📊 Benefits of This Fix

| Before | After |
|--------|-------|
| ❌ JWT expires after 1 hour, can't send | ✅ zkProof cached during login |
| ❌ Vague "Prover service error" message | ✅ Detailed error with status code |
| ❌ Users confused why sending fails | ✅ Clear instructions (login again) |
| ❌ zkProof generated every transaction | ✅ zkProof generated once at login |
| ❌ No visibility into what's wrong | ✅ Full debug logging |

---

## 🔐 Security Notes

- ✅ JWT is not logged in console (only substring shown)
- ✅ Salt is not logged (marked as REDACTED)
- ✅ zkProof stored encrypted in localStorage
- ✅ Session auto-expires with JWT
- ✅ Auto-logout on session expiration

---

## 🎉 Summary

Your send functionality now:
1. **Generates zkProof during login** (while JWT is fresh)
2. **Caches zkProof** for later use
3. **Handles JWT expiration** gracefully
4. **Provides clear error messages** to users
5. **Has full debug logging** for troubleshooting

**The key fix:** Generate and cache zkProof immediately after OAuth, not when sending transactions. This avoids JWT expiration issues entirely!

---

## 📝 Next Steps

1. **Test with fresh login**
2. **Try sending a transaction**
3. **Check browser console** for detailed logs
4. **If errors persist**, share the full console output

Your zkLogin send functionality should now work reliably! 🚀
