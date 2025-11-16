/**
 * Firestore Initialization Logger
 *
 * Add this to your app.config.ts to log Firestore initialization timing
 */

import { Firestore } from '@angular/fire/firestore';

export function logFirestoreInit(firestore: Firestore): Firestore {
  const startTime = performance.now();
  console.log('[Firestore] Initialization started');

  // Log when Firestore is ready
  setTimeout(() => {
    console.log(`[Firestore] Ready after: ${(performance.now() - startTime).toFixed(2)}ms`);
  }, 0);

  return firestore;
}
