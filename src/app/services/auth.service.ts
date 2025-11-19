import { Injectable, inject, signal } from '@angular/core';
import {
  Auth,
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  user,
} from '@angular/fire/auth';
import { toSignal } from '@angular/core/rxjs-interop';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly auth = inject(Auth);

  // Use AngularFire's user observable converted to signal
  private readonly user$ = user(this.auth);
  readonly currentUser = toSignal(this.user$, { initialValue: null });
  readonly isAuthenticated = signal(false);

  constructor() {
    // Update isAuthenticated when user changes
    this.user$.subscribe((user) => {
      this.isAuthenticated.set(!!user);
    });
  }

  /**
   * Sign in with email and password
   */
  async signIn(email: string, password: string): Promise<void> {
    try {
      await signInWithEmailAndPassword(this.auth, email, password);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to sign in');
    }
  }

  /**
   * Sign up with email and password
   */
  async signUp(email: string, password: string): Promise<void> {
    try {
      await createUserWithEmailAndPassword(this.auth, email, password);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to sign up');
    }
  }

  /**
   * Sign in with Google
   */
  async signInWithGoogle(): Promise<void> {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(this.auth, provider);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to sign in with Google');
    }
  }

  /**
   * Sign out
   */
  async signOut(): Promise<void> {
    try {
      await signOut(this.auth);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to sign out');
    }
  }

  /**
   * Get current user ID
   */
  getCurrentUserId(): string | null {
    return this.currentUser()?.uid || null;
  }

  /**
   * Get current user email
   */
  getCurrentUserEmail(): string | null {
    return this.currentUser()?.email || null;
  }
}
