import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  doc,
  docData,
  DocumentData,
  setDoc,
  collection,
  collectionData,
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Project } from '../models/project.model';

@Injectable({
  providedIn: 'root',
})
export class ProjectService {
  private readonly firestore = inject(Firestore);

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
   * Get all projects as an observable
   */
  getAllProjects(): Observable<Project[]> {
    const projectCollection = collection(this.firestore, 'projects');
    return collectionData(projectCollection, { idField: 'id' }) as Observable<Project[]>;
  }

  /**
   * Create a new project
   */
  async createProject(projectId: string, projectData: Partial<Project>): Promise<void> {
    const projectRef = doc(this.firestore, 'projects', projectId);
    await setDoc(projectRef, projectData);
  }
}
