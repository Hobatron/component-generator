import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  doc,
  collection,
  collectionData,
  setDoc,
  updateDoc,
  deleteDoc,
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { CategorySchema } from '../models/category-schema.model';

@Injectable({
  providedIn: 'root',
})
export class CategorySchemaService {
  private readonly firestore = inject(Firestore);

  /**
   * Get all schemas for a project as an observable
   */
  getSchemas(projectId: string): Observable<CategorySchema[]> {
    const projectRef = doc(this.firestore, 'projects', projectId);
    const schemasRef = collection(projectRef, 'schemas');
    return collectionData(schemasRef, { idField: 'id' }) as Observable<CategorySchema[]>;
  }

  /**
   * Add a new schema to a project
   */
  async addSchema(projectId: string, schema: CategorySchema): Promise<void> {
    const projectRef = doc(this.firestore, 'projects', projectId);
    const schemasRef = collection(projectRef, 'schemas');
    const schemaRef = doc(schemasRef, schema.id);
    const { id, ...data } = schema;
    await setDoc(schemaRef, data);
  }

  /**
   * Update an existing schema
   */
  async updateSchema(projectId: string, schemaId: string, schema: CategorySchema): Promise<void> {
    const projectRef = doc(this.firestore, 'projects', projectId);
    const schemasRef = collection(projectRef, 'schemas');
    const schemaRef = doc(schemasRef, schemaId);
    const { id, ...data } = schema;
    await updateDoc(schemaRef, data);
  }

  /**
   * Delete a category schema
   */
  async deleteSchema(projectId: string, schemaId: string): Promise<void> {
    const projectRef = doc(this.firestore, 'projects', projectId);
    const schemasRef = collection(projectRef, 'schemas');
    const schemaRef = doc(schemasRef, schemaId);
    await deleteDoc(schemaRef);
  }
}
