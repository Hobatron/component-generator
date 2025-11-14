import { Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { Firestore, collection, collectionData } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: 'app.html',
  styleUrls: ['app.scss'],
  imports: [AsyncPipe],
})
export class App {
  firestore: Firestore = inject(Firestore);
  items$: Observable<any[]>;

  constructor() {
    const aCollection = collection(this.firestore, 'items')
    this.items$ = collectionData(aCollection);
  }
}