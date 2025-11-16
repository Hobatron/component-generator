# Troubleshooting 11+ Second Load Times

## Your Issue: 11,158ms Schema Fetch

This is **NOT normal**. Here's what to check:

## 1. ⚠️ Firestore Rules Issue (Most Likely)

**Symptom:** Long delays before data loads
**Cause:** Firestore security rules are denying access, causing retries

### Check Firebase Console:

1. Go to Firebase Console → Firestore Database → Rules
2. Look for your current rules

### Temporary Fix (DEVELOPMENT ONLY):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;  // ⚠️ INSECURE - DEV ONLY
    }
  }
}
```

### Proper Production Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /projects/{projectId} {
      allow read: if true;  // Public read
      allow write: if request.auth != null;  // Authenticated write

      match /schemas/{schemaId} {
        allow read: if true;
        allow write: if request.auth != null;
      }

      match /{collection}/{itemId} {
        allow read: if true;
        allow write: if request.auth != null;
      }
    }
  }
}
```

## 2. 🌐 Network Issues

### Check Network Tab:

1. Open DevTools → Network tab
2. Filter by "firestore"
3. Look at the request timing breakdown:
   - **Queueing:** Should be < 1ms
   - **DNS Lookup:** Should be < 50ms
   - **Initial Connection:** Should be < 100ms
   - **Waiting (TTFB):** Should be < 500ms
   - **Content Download:** Should be < 50ms

### If Network is Slow:

- Check your internet connection
- Try different network (mobile hotspot)
- Check if VPN is interfering

## 3. 🔥 Firebase Project Issues

### Check Firebase Console:

1. Go to Firebase Console → Project Settings
2. Verify Firestore location (should be close to you)
3. Check if project is on Spark (free) plan - might be throttled

### Check Firestore Status:

- Visit: https://status.firebase.google.com/
- Look for any ongoing incidents

## 4. 🔒 Authentication Issues

### If Using Firebase Auth:

```typescript
// Check if auth is blocking
import { Auth } from '@angular/fire/auth';

constructor() {
  const auth = inject(Auth);
  auth.onAuthStateChanged(user => {
    console.log('[Auth] State:', user ? 'Logged in' : 'Anonymous');
  });
}
```

### If Auth is Slow:

- Auth initialization might be blocking Firestore
- Consider using anonymous auth for public data

## 5. 📦 Large Document Size

### Check Document Size:

```typescript
// Add to CategorySchemaService after getDocs
snapshot.forEach((doc) => {
  const data = doc.data();
  const size = JSON.stringify(data).length;
  console.log(`[Schema] ${doc.id} size: ${size} bytes`);
  schemas.push({ id: doc.id, ...data } as CategorySchema);
});
```

### If Documents are Large (>100KB):

- Reduce field count
- Remove unnecessary data
- Split into subcollections

## 6. 🔍 Browser/Extension Issues

### Try:

1. Open in Incognito/Private mode
2. Disable all browser extensions
3. Clear browser cache
4. Try different browser

## Immediate Action Steps

### Step 1: Check Firestore Rules

```bash
# Most likely culprit - check Firebase Console
```

### Step 2: Check Network Tab

```bash
# Look for failed requests or retries
# Look for 403 Forbidden errors
```

### Step 3: Add More Detailed Logging

```typescript
// Add to category-schema.service.ts before getDocs
console.log('[CategorySchemaService] About to call getDocs...');
console.log('[CategorySchemaService] Collection path:', `projects/${projectId}/schemas`);

// After getDocs
console.log('[CategorySchemaService] getDocs completed');
console.log('[CategorySchemaService] Snapshot size:', snapshot.size);
console.log('[CategorySchemaService] Snapshot empty:', snapshot.empty);
```

### Step 4: Check for Errors

```typescript
// Wrap in try-catch with detailed error
try {
  const snapshot = await getDocs(schemasRef);
} catch (error) {
  console.error('[CategorySchemaService] ERROR:', error);
  console.error('[CategorySchemaService] Error code:', error.code);
  console.error('[CategorySchemaService] Error message:', error.message);
  throw error;
}
```

## Expected vs Actual

| Metric           | Expected  | Your Actual | Status      |
| ---------------- | --------- | ----------- | ----------- |
| Schema Fetch     | 100-500ms | 11,158ms    | 🔴 CRITICAL |
| Observable Setup | < 5ms     | 0ms         | ✅ OK       |

## Most Likely Diagnosis

Based on 11+ second delay:

1. **Firestore Rules blocking access** (90% likely)
2. Network timeout/retry (8% likely)
3. Other issues (2% likely)

## Next Steps

1. ✅ Check Firestore Rules in Firebase Console
2. ✅ Check Network tab for 403 errors
3. ✅ Try temporary open rules (dev only)
4. ✅ Check Firebase project region
5. ✅ Add error logging to service
