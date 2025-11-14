import { Injectable, inject } from '@angular/core';
import { Firestore, collection, collectionData, getDocs, doc, docData, query, where } from '@angular/fire/firestore';
import { Observable, combineLatest, BehaviorSubject } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { NavigationStart, Router } from '@angular/router';
import { Project } from '../models/project.model';

@Injectable({
  providedIn: 'root'
})
export class FirestoreService {
  private readonly firestore = inject(Firestore);
  private readonly router = inject(Router);
  
  // Observable for all projects
  readonly projects$: Observable<Project[]> | undefined;
  readonly currentProject$: BehaviorSubject<Project | null> = new BehaviorSubject<Project | null>(null);

  constructor() {
    // const projectCollection = collection(this.firestore, 'projects');
    // this.projects$ = collectionData(projectCollection, { idField: 'id' }) as Observable<Project[]>;
    // this.projects$.subscribe((projects) => {
    //   console.log(projects);
    // });
    // this.router.events.subscribe((event) => {
    //   if (event instanceof NavigationStart) {
    //     console.log(event.url);
    //   }
    // });

    // this.router.events.subscribe((event) => {
    //   if (event instanceof NavigationStart) {
    //     const projectName = event.url.split('/')[2];
    //     const queryRef = query(projectCollection, where('id', '==', 'mortis_invictus'));
    //     collectionData(queryRef).subscribe((project) => {
          
    //     })
    //   }
    // });
  }

}
