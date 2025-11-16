import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { DynamicItem } from '../models/category-schema.model';

@Injectable({
  providedIn: 'root',
})
export class ItemService {
  private readonly firestore = inject(Firestore);

  /**
   * Get all items for a category as an observable
   */
  getItems(projectId: string, categoryId: string): Observable<DynamicItem[]> {
    const projectRef = doc(this.firestore, 'projects', projectId);
    const itemsRef = collection(projectRef, categoryId);
    return collectionData(itemsRef, { idField: 'id' }) as Observable<DynamicItem[]>;
  }

  /**
   * Add a new item to a category
   */
  async addItem(projectId: string, categoryId: string, item: DynamicItem): Promise<void> {
    const projectRef = doc(this.firestore, 'projects', projectId);
    const itemsRef = collection(projectRef, categoryId);
    await addDoc(itemsRef, item);
  }

  /**
   * Update an existing item
   */
  async updateItem(
    projectId: string,
    categoryId: string,
    itemId: string,
    item: DynamicItem
  ): Promise<void> {
    const projectRef = doc(this.firestore, 'projects', projectId);
    const itemsRef = collection(projectRef, categoryId);
    const itemRef = doc(itemsRef, itemId);
    await updateDoc(itemRef, { ...item });
  }

  /**
   * Delete an item
   */
  async deleteItem(projectId: string, categoryId: string, itemId: string): Promise<void> {
    const projectRef = doc(this.firestore, 'projects', projectId);
    const itemsRef = collection(projectRef, categoryId);
    const itemRef = doc(itemsRef, itemId);
    await deleteDoc(itemRef);
  }
}
