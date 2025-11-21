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
import { Project } from '../models/project.model';
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

    // Query 1: Projects where user is owner
    const ownedQuery = query(projectCollection, where('owner', '==', userId));
    const owned$ = collectionData(ownedQuery, { idField: 'id' }) as Observable<Project[]>;

    // Query 2: Projects where user is in collaborators array
    const collaboratedQuery = query(
      projectCollection,
      where('collaborators', 'array-contains', userId)
    );
    const collaborated$ = collectionData(collaboratedQuery, { idField: 'id' }) as Observable<
      Project[]
    >;

    // Combine both queries and remove duplicates
    return combineLatest([owned$, collaborated$]).pipe(
      map(([owned, collaborated]) => {
        const projectMap = new Map<string, Project>();
        [...owned, ...collaborated].forEach((project) => {
          projectMap.set(project.id, project);
        });
        return Array.from(projectMap.values());
      }),
      shareReplay(1)
    );
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
  async addCollaboratorById(projectId: string, userId: string): Promise<void> {
    const projectRef = doc(this.firestore, 'projects', projectId);
    const projectData = (await docData(projectRef).toPromise()) as Project;

    if (!projectData) {
      throw new Error('Project not found');
    }

    if (!projectData.collaborators) {
      projectData.collaborators = [];
    }

    if (!projectData.collaborators.includes(userId)) {
      projectData.collaborators.push(userId);
      await setDoc(projectRef, projectData);
    }
  }

  /**
   * Add a collaborator to a project by email
   */
  async addCollaborator(projectId: string, userEmail: string): Promise<void> {
    // Call Cloud Function to look up user by email
    const getUserByEmail = httpsCallable<
      { email: string },
      { uid: string; email: string; displayName: string | null }
    >(this.functions, 'getUserByEmail');

    try {
      // Look up the user's UID
      const result = await getUserByEmail({ email: userEmail });
      const userId = result.data.uid;

      // Use the new method to add by ID
      await this.addCollaboratorById(projectId, userId);
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
      projectData.collaborators = projectData.collaborators.filter((id) => id !== userId);
      await setDoc(projectRef, projectData);
    }
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
        await this.addCollaborator(projectId, email);
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
