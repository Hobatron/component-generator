import { Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { Firestore, collection, collectionData } from '@angular/fire/firestore';
import { Observable, combineLatest } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: 'app.html',
  styleUrls: ['app.scss'],
  imports: [AsyncPipe],
})
export class App {
  firestore: Firestore = inject(Firestore);
  itemsa$: Observable<any[]>;
  itemsb$: Observable<any[]>;
  itemsc$: Observable<any[]>;

  constructor() {
    const aCollection = collection(this.firestore, 'actions')
    const bCollection = collection(this.firestore, 'equipments')
    const cCollection = collection(this.firestore, 'usables')
    this.itemsa$ = collectionData(aCollection);
    this.itemsb$ = collectionData(bCollection);
    this.itemsc$ = collectionData(cCollection);
  }
}