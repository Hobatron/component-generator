import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly email = signal('');
  protected readonly password = signal('');
  protected readonly isSignUp = signal(false);
  protected readonly error = signal('');
  protected readonly loading = signal(false);

  protected async handleSubmit(): Promise<void> {
    const emailValue = this.email().trim();
    const passwordValue = this.password().trim();

    if (!emailValue || !passwordValue) {
      this.error.set('Please enter email and password');
      return;
    }

    this.loading.set(true);
    this.error.set('');

    try {
      if (this.isSignUp()) {
        await this.authService.signUp(emailValue, passwordValue);
      } else {
        await this.authService.signIn(emailValue, passwordValue);
      }
      this.router.navigate(['/']);
    } catch (err: any) {
      this.error.set(err.message || 'Authentication failed');
    } finally {
      this.loading.set(false);
    }
  }

  protected async handleGoogleSignIn(): Promise<void> {
    this.loading.set(true);
    this.error.set('');

    try {
      await this.authService.signInWithGoogle();
      this.router.navigate(['/']);
    } catch (err: any) {
      this.error.set(err.message || 'Google sign-in failed');
    } finally {
      this.loading.set(false);
    }
  }

  protected toggleMode(): void {
    this.isSignUp.update((v) => !v);
    this.error.set('');
  }
}
