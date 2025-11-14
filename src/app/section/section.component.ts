import { Component, inject } from '@angular/core';
import { AsyncPipe, TitleCasePipe, DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { collection, collectionData, doc, Firestore } from '@angular/fire/firestore';
import { Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-section',
  templateUrl: './section.component.html',
  styleUrls: ['./section.component.scss'],
  imports: [AsyncPipe, TitleCasePipe, DatePipe, RouterLink]
})
export class SectionComponent {
  private readonly firestore = inject(Firestore);
  private readonly route = inject(ActivatedRoute);

  protected readonly projectName$ = this.route.params.pipe(
    map(params => params['projectName'])
  );

  protected readonly sectionName$ = this.route.params.pipe(
    map(params => params['section'])
  );

  sectionItems$: Observable<any[]>;
  private sectionItemsSubject = new BehaviorSubject<any[]>([]);

  constructor() {
    // Load data in constructor based on route parameters
    const projectName = this.route.snapshot.params['projectName'];
    const sectionName = this.route.snapshot.params['section'];
    
    if (projectName && sectionName) {
      const projectDocRef = doc(this.firestore, 'projects', projectName);
      const sectionCollectionRef = collection(projectDocRef, sectionName);
      this.sectionItems$ = collectionData(sectionCollectionRef, { idField: 'id' });
    } else {
      this.sectionItems$ = this.sectionItemsSubject.asObservable();
    }
  }
}
