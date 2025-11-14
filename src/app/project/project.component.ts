import { Component, inject } from '@angular/core';
import { AsyncPipe, TitleCasePipe, DatePipe } from '@angular/common';
import { ActivatedRoute, NavigationStart, Router, RouterLink } from '@angular/router';
import { FirestoreService } from '../services/firestore.service';
import { map, switchMap } from 'rxjs/operators';
import { collection, collectionData, doc, docData, DocumentData, Firestore } from '@angular/fire/firestore';
import { BehaviorSubject, Observable } from 'rxjs';
import { Project } from '../models/project.model';

@Component({
  selector: 'app-project',
  templateUrl: './project.component.html',
  styleUrls: ['./project.component.scss'],
  imports: [AsyncPipe, TitleCasePipe, RouterLink]
})
export class ProjectComponent {
  private readonly firestore = inject(Firestore);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  
  protected readonly projectName$ = this.route.params.pipe(
    map(params => params['projectName'])
  );

  project$: Observable<DocumentData | Project | undefined>;
  sections$: BehaviorSubject<string[]> = new BehaviorSubject<string[]>([]);

  constructor() {
    const projectName = this.route.snapshot.params['projectName'];
    const project = doc(this.firestore, 'projects', projectName);
    this.project$ = docData(project);
    
    this.project$.subscribe((projectData) => {
      this.sections$.next(projectData?.collections || []);
    });

    this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        console.log(event.url);
      }
    });
  }
}
