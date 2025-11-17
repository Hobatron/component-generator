import { Component, inject, signal } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { ProjectService } from './services/project.service';
import { Observable } from 'rxjs';
import { setLogLevel, LogLevel } from '@angular/fire';

@Component({
  selector: 'app-root',
  templateUrl: 'app.html',
  styleUrls: ['app.scss'],
  imports: [RouterOutlet, RouterLink, AsyncPipe],
})
export class App {
  private readonly router = inject(Router);
  private readonly projectService = inject(ProjectService);
  protected showDropdown = false;
  protected readonly isCreatingProject = signal(false);
  protected readonly newProjectName = signal('');
  protected readonly newProjectDescription = signal('');
  protected readonly newProjectIcon = signal('🎮');

  // Load all projects
  protected readonly projects$ = this.projectService.getAllProjects();

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
  }

  protected openNewProjectModal(): void {
    this.newProjectName.set('');
    this.newProjectDescription.set('');
    this.newProjectIcon.set('🎮');
    this.isCreatingProject.set(true);
    this.showDropdown = false;
  }

  protected closeNewProjectModal(): void {
    this.isCreatingProject.set(false);
  }

  protected async createProject(): Promise<void> {
    const name = this.newProjectName().trim();
    const description = this.newProjectDescription().trim();
    const icon = this.newProjectIcon();

    if (!name) {
      alert('Please enter a project name');
      return;
    }

    // Generate ID from name (lowercase, replace spaces with underscores)
    const projectId = name.toLowerCase().replace(/\s+/g, '_');

    try {
      // Create project in Firestore
      await this.projectService.createProject(projectId, {
        name,
        description,
        icon,
        collections: [],
        createdAt: new Date().toISOString(),
      });

      this.closeNewProjectModal();

      // Navigate to the new project
      this.router.navigate(['/projects', projectId]);
    } catch (error) {
      console.error('Error creating project:', error);
      alert('Failed to create project. Please try again.');
    }
  }
}
