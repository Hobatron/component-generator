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
import { Observable } from 'rxjs';
import { shareReplay } from 'rxjs/operators';
import { Project } from '../models/project.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class ProjectService {
  private readonly firestore = inject(Firestore);
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
      return new Observable((observer) => observer.next([]));
    }

    const projectCollection = collection(this.firestore, 'projects');
    // Query for projects where user is owner
    const q = query(projectCollection, where('owner', '==', userId));

    return (collectionData(q, { idField: 'id' }) as Observable<Project[]>).pipe(shareReplay(1));
  }

  /**
   * Create a new project
   */
  async createProject(projectId: string, projectData: Partial<Project>): Promise<void> {
    const projectRef = doc(this.firestore, 'projects', projectId);
    await setDoc(projectRef, projectData);
  }

  /**
   * Add a collaborator to a project
   */
  async addCollaborator(projectId: string, userEmail: string): Promise<void> {
    // In a real app, you'd look up the user ID by email
    // For now, we'll use email as the identifier
    const projectRef = doc(this.firestore, 'projects', projectId);
    const projectData = (await docData(projectRef).toPromise()) as Project;

    if (!projectData.collaborators) {
      projectData.collaborators = [];
    }

    if (!projectData.collaborators.includes(userEmail)) {
      projectData.collaborators.push(userEmail);
      await setDoc(projectRef, projectData);
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
}
