import { Injectable, inject } from '@angular/core';
import { Firestore, doc, docData, DocumentData } from '@angular/fire/firestore';
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
}
