import { Injectable, inject } from '@angular/core';
import { Firestore, doc, docData, updateDoc, arrayUnion } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
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
    const schemasDocRef = doc(this.firestore, 'projects', projectId, 'metadata', 'schemas');
    return docData(schemasDocRef).pipe(
      map((data) => {
        if (data && data['items']) {
          return data['items'] as CategorySchema[];
        }
        return [];
      })
    );
  }

  /**
   * Add a new schema to a project
   */
  async addSchema(projectId: string, schema: CategorySchema): Promise<void> {
    const schemasDocRef = doc(this.firestore, 'projects', projectId, 'metadata', 'schemas');
    await updateDoc(schemasDocRef, {
      items: arrayUnion(schema),
    });
  }

  /**
   * Update an existing schema
   */
  async updateSchema(projectId: string, schemas: CategorySchema[]): Promise<void> {
    const schemasDocRef = doc(this.firestore, 'projects', projectId, 'metadata', 'schemas');
    await updateDoc(schemasDocRef, { items: schemas });
  }

  /**
   * Delete a category schema
   */
  async deleteSchema(projectId: string, schemas: CategorySchema[]): Promise<void> {
    const schemasDocRef = doc(this.firestore, 'projects', projectId, 'metadata', 'schemas');
    await updateDoc(schemasDocRef, { items: schemas });
  }
}
