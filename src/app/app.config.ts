import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore, persistentLocalCache } from '@angular/fire/firestore';
import { getFunctions, provideFunctions } from '@angular/fire/functions';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideFirebaseApp(() =>
      initializeApp({
        apiKey: 'AIzaSyAgR1yqTBoLhuf1YJoINXvtfwReFGIvRQE',
        authDomain: 'component-generator-1a1e8.web.app',
        projectId: 'component-generator-1a1e8',
        storageBucket: 'component-generator-1a1e8.firebasestorage.app',
        messagingSenderId: '382834907040',
        appId: '1:382834907040:web:34ba95656bc8d0fcfe36c5',
        measurementId: 'G-3QSFRFL2YS',
      })
    ),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
    provideFunctions(() => {
      const functions = getFunctions();
      // Uncomment if you need to connect to emulator
      // connectFunctionsEmulator(functions, 'localhost', 5001);
      return functions;
    }),
  ],
};
