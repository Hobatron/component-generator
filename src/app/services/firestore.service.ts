import { Injectable, inject } from '@angular/core';
import { Firestore, collection, collectionData } from '@angular/fire/firestore';
import { Observable, combineLatest, BehaviorSubject } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class FirestoreService {
  private readonly firestore = inject(Firestore);
  private readonly router = inject(Router);
  
  // Current project prefix from URL
  private readonly projectPrefix$ = new BehaviorSubject<string>('mortis_invictus');
  
  // Known collection types for each project
  private readonly collectionTypes = ['actions', 'equipments', 'usables'];

  constructor() {
    // Extract project prefix from URL
    this.updateProjectFromUrl();
    
    // Listen for route changes
    this.router.events.subscribe(() => {
      this.updateProjectFromUrl();
    });
  }

  private updateProjectFromUrl(): void {
    const url = this.router.url;
    // Extract project from URL pattern like /projects/mortis_invictus
    const projectMatch = url.match(/\/projects\/([a-zA-Z0-9_]+)/);
    if (projectMatch) {
      const project = projectMatch[1];
      this.projectPrefix$.next(project);
    }
  }

  // Get current project prefix
  get currentProject$(): Observable<string> {
    return this.projectPrefix$.asObservable();
  }

  // Get a specific collection for current project
  getCollection<T = any>(collectionType: string): Observable<T[]> {
    return this.projectPrefix$.pipe(
      switchMap(prefix => {
        const collectionName = `${prefix}_${collectionType}`;
        const collectionRef = collection(this.firestore, collectionName);
        return collectionData(collectionRef) as Observable<T[]>;
      })
    );
  }

  // Get all collections for current project
  getAllCollections(): Observable<Record<string, any[]>> {
    return this.projectPrefix$.pipe(
      switchMap(prefix => {
        const collectionObservables = this.collectionTypes.map(type => 
          this.getCollection(type)
        );
        
        return combineLatest(collectionObservables).pipe(
          map(results => {
            const collections: Record<string, any[]> = {};
            this.collectionTypes.forEach((type, index) => {
              collections[type] = results[index];
            });
            return collections;
          })
        );
      })
    );
  }

  // Manually set project prefix (useful for testing or direct access)
  setProject(projectPrefix: string): void {
    this.projectPrefix$.next(projectPrefix);
  }

  // Get current project prefix value
  getCurrentProject(): string {
    return this.projectPrefix$.value;
  }
}
