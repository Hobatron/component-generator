import { Component, inject, signal, computed } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { ProjectService } from './services/project.service';
import { ThemeService } from './services/theme.service';
import { AuthService } from './services/auth.service';
import { Observable, of, switchMap } from 'rxjs';
import { setLogLevel, LogLevel } from '@angular/fire';
import { toObservable } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-root',
  templateUrl: 'app.html',
  styleUrls: ['app.scss'],
  imports: [RouterOutlet, RouterLink, AsyncPipe],
})
export class App {
  private readonly router = inject(Router);
  private readonly projectService = inject(ProjectService);
  protected readonly themeService = inject(ThemeService);
  protected readonly authService = inject(AuthService);
  protected showDropdown = false;
  protected readonly isMobileMenuOpen = signal(false);
  protected readonly isCreatingProject = signal(false);
  protected readonly newProjectName = signal('');
  protected readonly newProjectDescription = signal('');
  protected readonly newProjectIcon = signal('🎮');

  // Load all projects - reactive to auth state
  protected readonly projects$ = toObservable(this.authService.currentUser).pipe(
    switchMap((user) => {
      if (user) {
        return this.projectService.getAllProjects();
      }
      return of([]);
    })
  );

  // Emoji options for project icon picker
  protected readonly projectEmojiOptions = [
    { emoji: '⚔️', label: 'Sword' },
    { emoji: '🛡️', label: 'Shield' },
    { emoji: '🃏', label: 'Cards' },
    { emoji: '🎲', label: 'Dice' },
    { emoji: '🎮', label: 'Game Controller' },
    { emoji: '🕹️', label: 'Joystick' },
    { emoji: '🏰', label: 'Castle' },
    { emoji: '🐉', label: 'Dragon' },
    { emoji: '🧙', label: 'Wizard' },
    { emoji: '👑', label: 'Crown' },
    { emoji: '🗡️', label: 'Dagger' },
    { emoji: '🏹', label: 'Bow' },
    { emoji: '🪄', label: 'Wand' },
    { emoji: '🔮', label: 'Crystal Ball' },
    { emoji: '📜', label: 'Scroll' },
    { emoji: '🗺️', label: 'Map' },
    { emoji: '💎', label: 'Gem' },
    { emoji: '🎯', label: 'Target' },
    { emoji: '🏆', label: 'Trophy' },
    { emoji: '⭐', label: 'Star' },
  ];

  constructor() {
    setLogLevel(LogLevel.VERBOSE);

    // Log current user ID for debugging
    toObservable(this.authService.currentUser).subscribe((user) => {
      if (user) {
        console.log('🔑 Current User ID:', user.uid);
        console.log('📧 Current User Email:', user.email);
      } else {
        console.log('❌ No user logged in');
      }
    });
  }

  protected toggleMobileMenu(): void {
    this.isMobileMenuOpen.update((value) => !value);
  }

  protected closeMobileMenu(): void {
    this.isMobileMenuOpen.set(false);
  }

  protected openNewProjectModal(): void {
    this.newProjectName.set('');
    this.newProjectDescription.set('');
    this.newProjectIcon.set('🎮');
    this.isCreatingProject.set(true);
    this.showDropdown = false;
    this.closeMobileMenu();
  }

  protected closeNewProjectModal(): void {
    this.isCreatingProject.set(false);
  }

  protected async createProject(): Promise<void> {
    const name = this.newProjectName().trim();
    const description = this.newProjectDescription().trim();
    const icon = this.newProjectIcon();
    const userId = this.authService.getCurrentUserId();

    if (!name) {
      alert('Please enter a project name');
      return;
    }

    if (!userId) {
      alert('You must be signed in to create a project');
      return;
    }

    // Generate ID from name (lowercase, replace spaces with underscores)
    const projectId = name.toLowerCase().replace(/\s+/g, '_');

    try {
      // Create project in Firestore with current user as owner
      await this.projectService.createProject(projectId, {
        name,
        description,
        icon,
        collections: [],
        createdAt: new Date().toISOString(),
        owner: userId,
        collaborators: [],
      });

      this.closeNewProjectModal();

      // Navigate to the new project
      this.router.navigate(['/projects', projectId]);
    } catch (error) {
      console.error('Error creating project:', error);
      alert('Failed to create project. Please try again.');
    }
  }

  protected async handleSignOut(): Promise<void> {
    try {
      await this.authService.signOut();
      this.router.navigate(['/login']);
    } catch (error) {
      console.error('Error signing out:', error);
      alert('Failed to sign out. Please try again.');
    }
  }
}
