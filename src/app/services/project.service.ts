import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  doc,
  docData,
  DocumentData,
  setDoc,
  collection,
  collectionData,
  query,
  where,
  or,
} from '@angular/fire/firestore';
import { Functions, httpsCallable } from '@angular/fire/functions';
import { Observable, combineLatest, of } from 'rxjs';
import { shareReplay, map } from 'rxjs/operators';
import { Project, Collaborator, CollaboratorPermission } from '../models/project.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class ProjectService {
  private readonly firestore = inject(Firestore);
  private readonly functions = inject(Functions, { optional: false });
  private readonly authService = inject(AuthService);

  /**
   * Get a project by ID as an observable
   */
  getProject(projectId: string): Observable<DocumentData | Project | undefined> {
    const projectRef = doc(this.firestore, 'projects', projectId);
    return docData(projectRef);
  }

  /**
   * Get project collections/sections
   */
  getProjectCollections(projectData: DocumentData | Project | undefined): string[] {
    return projectData?.collections || [];
  }

  /**
   * Get all projects for the current user (owned or collaborated)
   */
  getAllProjects(): Observable<Project[]> {
    const userId = this.authService.getCurrentUserId();

    if (!userId) {
      return of([]);
    }

    const projectCollection = collection(this.firestore, 'projects');

    // Query projects where user is owner
    const ownedQuery = query(projectCollection, where('owner', '==', userId));
    const owned$ = collectionData(ownedQuery, { idField: 'id' }) as Observable<Project[]>;

    // For now, only return owned projects
    // TODO: Add support for collaborated projects when Firestore supports
    // array-contains queries on nested object fields
    return owned$.pipe(shareReplay(1));
  }

  /**
   * Create a new project
   */
  async createProject(projectId: string, projectData: Partial<Project>): Promise<void> {
    const projectRef = doc(this.firestore, 'projects', projectId);
    await setDoc(projectRef, projectData);
  }

  /**
   * Add a collaborator to a project by user ID
   */
  async addCollaboratorById(
    projectId: string,
    userId: string,
    email?: string,
    displayName?: string,
    permission: CollaboratorPermission = 'read'
  ): Promise<void> {
    const projectRef = doc(this.firestore, 'projects', projectId);
    const projectData = (await docData(projectRef).toPromise()) as Project;

    if (!projectData) {
      throw new Error('Project not found');
    }

    if (!projectData.collaborators) {
      projectData.collaborators = [];
    }

    // Check if collaborator already exists
    const existingIndex = projectData.collaborators.findIndex((c) => c.userId === userId);

    if (existingIndex === -1) {
      const newCollaborator: Collaborator = {
        userId,
        email,
        displayName,
        permission,
        addedAt: new Date().toISOString(),
      };
      projectData.collaborators.push(newCollaborator);
      await setDoc(projectRef, projectData);
    }
  }

  /**
   * Add a collaborator to a project by email
   */
  async addCollaborator(
    projectId: string,
    userEmail: string,
    permission: CollaboratorPermission = 'read'
  ): Promise<void> {
    // Call Cloud Function to look up user by email
    const getUserByEmail = httpsCallable<
      { email: string },
      { uid: string; email: string; displayName: string | null }
    >(this.functions, 'getUserByEmail');

    try {
      // Look up the user's UID
      const result = await getUserByEmail({ email: userEmail });
      const userId = result.data.uid;
      const displayName = result.data.displayName || undefined;

      // Use the new method to add by ID
      await this.addCollaboratorById(projectId, userId, userEmail, displayName, permission);
    } catch (error: any) {
      if (error.code === 'functions/not-found') {
        throw new Error('No user found with that email address');
      }
      throw new Error('Failed to add collaborator: ' + error.message);
    }
  }

  /**
   * Remove a collaborator from a project
   */
  async removeCollaborator(projectId: string, userId: string): Promise<void> {
    const projectRef = doc(this.firestore, 'projects', projectId);
    const projectData = (await docData(projectRef).toPromise()) as Project;

    if (projectData.collaborators) {
      projectData.collaborators = projectData.collaborators.filter((c) => c.userId !== userId);
      await setDoc(projectRef, projectData);
    }
  }

  /**
   * Update a collaborator's permission
   */
  async updateCollaboratorPermission(
    projectId: string,
    userId: string,
    permission: CollaboratorPermission
  ): Promise<void> {
    const projectRef = doc(this.firestore, 'projects', projectId);
    const projectData = (await docData(projectRef).toPromise()) as Project;

    if (!projectData) {
      throw new Error('Project not found');
    }

    if (projectData.collaborators) {
      const collaboratorIndex = projectData.collaborators.findIndex((c) => c.userId === userId);

      if (collaboratorIndex !== -1) {
        projectData.collaborators[collaboratorIndex].permission = permission;
        await setDoc(projectRef, projectData);
      } else {
        throw new Error('Collaborator not found');
      }
    }
  }

  /**
   * Check if current user is the owner of a project
   */
  isOwner(project: Project | DocumentData | undefined): boolean {
    const userId = this.authService.getCurrentUserId();
    return !!userId && project?.owner === userId;
  }

  /**
   * Get current user's permission for a project
   */
  getUserPermission(
    project: Project | DocumentData | undefined
  ): CollaboratorPermission | 'owner' | null {
    const userId = this.authService.getCurrentUserId();

    if (!userId || !project) {
      return null;
    }

    // Check if user is owner
    if (project.owner === userId) {
      return 'owner';
    }

    // Check collaborator permission
    const collaborator = project.collaborators?.find((c: Collaborator) => c.userId === userId);
    return collaborator?.permission || null;
  }

  /**
   * Check if current user has write access to a project
   */
  hasWriteAccess(project: Project | DocumentData | undefined): boolean {
    const permission = this.getUserPermission(project);
    return permission === 'owner' || permission === 'write';
  }

  /**
   * Check if current user has read access to a project
   */
  hasReadAccess(project: Project | DocumentData | undefined): boolean {
    const permission = this.getUserPermission(project);
    return permission !== null;
  }

  /**
   * Send an email invitation to collaborate on a project
   */
  async sendInvitation(
    projectId: string,
    email: string,
    projectName: string
  ): Promise<{ success: boolean; message: string }> {
    const sendProjectInvite = httpsCallable<
      { email: string; projectId: string; projectName: string },
      { success: boolean; message: string }
    >(this.functions, 'sendProjectInvite');

    try {
      const result = await sendProjectInvite({ email, projectId, projectName });

      // After sending email, add the user as collaborator if they exist
      try {
        await this.addCollaborator(projectId, email, 'read');
      } catch (error) {
        // User doesn't exist yet, they'll be added when they sign up
        console.log('User not found, will be added when they sign up');
      }

      return result.data;
    } catch (error: any) {
      throw new Error('Failed to send invitation: ' + error.message);
    }
  }
}
