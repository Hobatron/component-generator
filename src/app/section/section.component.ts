import { Component, inject, signal } from '@angular/core';
import { AsyncPipe, TitleCasePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import {
  collection,
  collectionData,
  doc,
  Firestore,
  addDoc,
  updateDoc,
} from '@angular/fire/firestore';
import { Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { CardEditModalComponent } from '../card-edit-modal/card-edit-modal.component';
import { Action } from '../models/action.model';
import { Equipment } from '../models/equipment.model';
import { Usable } from '../models/usable.model';

type CardItem = Action | Equipment | Usable;

@Component({
  selector: 'app-section',
  templateUrl: './section.component.html',
  styleUrls: ['./section.component.scss'],
  imports: [AsyncPipe, TitleCasePipe, RouterLink, CardEditModalComponent],
})
export class SectionComponent {
  private readonly firestore = inject(Firestore);
  private readonly route = inject(ActivatedRoute);

  protected readonly projectName$ = this.route.params.pipe(map((params) => params['projectName']));

  protected readonly sectionName$ = this.route.params.pipe(map((params) => params['section']));

  sectionItems$: Observable<any[]>;
  private sectionItemsSubject = new BehaviorSubject<any[]>([]);

  // Modal state
  protected readonly isModalOpen = signal(false);
  protected readonly editingItem = signal<CardItem | null>(null);

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

  protected openAddModal(): void {
    this.editingItem.set(null);
    this.isModalOpen.set(true);
  }

  protected openEditModal(item: CardItem): void {
    this.editingItem.set(item);
    this.isModalOpen.set(true);
  }

  protected closeModal(): void {
    this.isModalOpen.set(false);
    this.editingItem.set(null);
  }

  protected async saveItem(item: CardItem): Promise<void> {
    const projectName = this.route.snapshot.params['projectName'];
    const sectionName = this.route.snapshot.params['section'];

    if (!projectName || !sectionName) return;

    const projectDocRef = doc(this.firestore, 'projects', projectName);
    const sectionCollectionRef = collection(projectDocRef, sectionName);

    try {
      if (this.editingItem()) {
        // Update existing item
        const itemDocRef = doc(sectionCollectionRef, String(item.id));
        await updateDoc(itemDocRef, { ...item });
      } else {
        // Add new item
        await addDoc(sectionCollectionRef, item);
      }
    } catch (error) {
      console.error('Error saving item:', error);
    }
  }
}
