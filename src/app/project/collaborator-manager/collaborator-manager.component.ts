import { Component, input, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Project, Collaborator, CollaboratorPermission } from '../../models/project.model';
import { ProjectService } from '../../services/project.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-collaborator-manager',
  templateUrl: './collaborator-manager.component.html',
  styleUrls: ['./collaborator-manager.component.scss'],
  imports: [CommonModule, FormsModule],
})
export class CollaboratorManagerComponent {
  private readonly projectService = inject(ProjectService);
  private readonly authService = inject(AuthService);

  // Inputs
  project = input.required<Project>();

  // State
  protected readonly isAddingCollaborator = signal(false);
  protected readonly newCollaboratorEmail = signal('');
  protected readonly newCollaboratorPermission = signal<CollaboratorPermission>('read');
  protected readonly isLoading = signal(false);
  protected readonly errorMessage = signal('');

  // Computed
  protected readonly isOwner = computed(() => {
    return this.projectService.isOwner(this.project());
  });

  protected readonly currentUserId = computed(() => {
    return this.authService.getCurrentUserId();
  });

  protected readonly collaborators = computed(() => {
    return this.project().collaborators || [];
  });

  /**
   * Open add collaborator form
   */
  protected openAddCollaboratorForm(): void {
    this.isAddingCollaborator.set(true);
    this.newCollaboratorEmail.set('');
    this.newCollaboratorPermission.set('read');
    this.errorMessage.set('');
  }

  /**
   * Close add collaborator form
   */
  protected closeAddCollaboratorForm(): void {
    this.isAddingCollaborator.set(false);
    this.errorMessage.set('');
  }

  /**
   * Add a new collaborator
   */
  protected async addCollaborator(): Promise<void> {
    const email = this.newCollaboratorEmail().trim();
    const permission = this.newCollaboratorPermission();

    if (!email) {
      this.errorMessage.set('Please enter an email address');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      this.errorMessage.set('Please enter a valid email address');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    try {
      await this.projectService.addCollaborator(this.project().id, email, permission);
      this.closeAddCollaboratorForm();
    } catch (error: any) {
      this.errorMessage.set(error.message || 'Failed to add collaborator');
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Toggle collaborator permission between read and write
   */
  protected async togglePermission(collaborator: Collaborator): Promise<void> {
    if (!this.isOwner()) {
      return;
    }

    const newPermission: CollaboratorPermission =
      collaborator.permission === 'read' ? 'write' : 'read';

    this.isLoading.set(true);

    try {
      await this.projectService.updateCollaboratorPermission(
        this.project().id,
        collaborator.userId,
        newPermission
      );
    } catch (error: any) {
      alert('Failed to update permission: ' + error.message);
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Remove a collaborator
   */
  protected async removeCollaborator(collaborator: Collaborator): Promise<void> {
    if (!this.isOwner()) {
      return;
    }

    const confirmed = confirm(
      `Remove ${
        collaborator.email || collaborator.displayName || 'this collaborator'
      } from the project?`
    );

    if (!confirmed) {
      return;
    }

    this.isLoading.set(true);

    try {
      await this.projectService.removeCollaborator(this.project().id, collaborator.userId);
    } catch (error: any) {
      alert('Failed to remove collaborator: ' + error.message);
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Get display name for a collaborator
   */
  protected getCollaboratorDisplay(collaborator: Collaborator): string {
    return collaborator.displayName || collaborator.email || 'Unknown User';
  }

  /**
   * Check if collaborator is the current user
   */
  protected isCurrentUser(collaborator: Collaborator): boolean {
    return collaborator.userId === this.currentUserId();
  }
}
