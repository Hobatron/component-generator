import { Injectable, inject, signal, computed } from '@angular/core';
import {
  Firestore,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
} from '@angular/fire/firestore';
import { CategorySchema } from '../models/category-schema.model';

@Injectable({
  providedIn: 'root',
})
export class CategorySchemaService {
  private readonly firestore = inject(Firestore);

  // Cache schemas per project
  private readonly schemasCache = signal<Map<string, CategorySchema[]>>(new Map());

  /**
   * Load all category schemas for a project
   */
  async loadSchemasForProject(projectId: string): Promise<CategorySchema[]> {
    const schemasRef = collection(this.firestore, 'projects', projectId, 'schemas');
    const snapshot = await getDocs(schemasRef);

    const schemas: CategorySchema[] = [];
    snapshot.forEach((doc) => {
      schemas.push({ id: doc.id, ...doc.data() } as CategorySchema);
    });

    // Update cache
    const cache = new Map(this.schemasCache());
    cache.set(projectId, schemas);
    this.schemasCache.set(cache);

    return schemas;
  }

  /**
   * Get a specific schema for a project
   */
  async getSchema(projectId: string, schemaId: string): Promise<CategorySchema | null> {
    // Check cache first
    const cached = this.schemasCache().get(projectId);
    if (cached) {
      const found = cached.find((s) => s.id === schemaId);
      if (found) return found;
    }

    // Load from Firestore
    const schemaRef = doc(this.firestore, 'projects', projectId, 'schemas', schemaId);
    const snapshot = await getDoc(schemaRef);

    if (snapshot.exists()) {
      return { id: snapshot.id, ...snapshot.data() } as CategorySchema;
    }

    return null;
  }

  /**
   * Save or update a category schema
   */
  async saveSchema(projectId: string, schema: CategorySchema): Promise<void> {
    const schemaRef = doc(this.firestore, 'projects', projectId, 'schemas', schema.id);
    const { id, ...data } = schema;
    await setDoc(schemaRef, data);

    // Update cache
    await this.loadSchemasForProject(projectId);
  }

  /**
   * Delete a category schema
   */
  async deleteSchema(projectId: string, schemaId: string): Promise<void> {
    const schemaRef = doc(this.firestore, 'projects', projectId, 'schemas', schemaId);
    await deleteDoc(schemaRef);

    // Update cache
    await this.loadSchemasForProject(projectId);
  }

  /**
   * Get cached schemas for a project
   */
  getCachedSchemas(projectId: string): CategorySchema[] {
    return this.schemasCache().get(projectId) || [];
  }
}
