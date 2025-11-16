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
import { DEFAULT_SCHEMAS } from '../seed-schemas';

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
    // Store all schemas in a single document: projects/{projectId}/metadata/schemas
    // This is much faster than reading a subcollection
    const schemasDocRef = doc(this.firestore, 'projects', projectId, 'metadata', 'schemas');
    const schemasDoc = await getDoc(schemasDocRef);

    let schemas: CategorySchema[] = [];
    if (schemasDoc.exists()) {
      const data = schemasDoc.data();
      schemas = (data['items'] || []) as CategorySchema[];
    } else {
      // If document doesn't exist, use default schemas
      schemas = DEFAULT_SCHEMAS;
    }

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
    // Load current schemas
    const schemas = await this.loadSchemasForProject(projectId);

    // Find and update or add new schema
    const index = schemas.findIndex((s) => s.id === schema.id);
    if (index >= 0) {
      schemas[index] = schema;
    } else {
      schemas.push(schema);
    }

    // Save all schemas back to single document
    const schemasDocRef = doc(this.firestore, 'projects', projectId, 'metadata', 'schemas');
    await setDoc(schemasDocRef, { items: schemas });

    // Update cache
    const cache = new Map(this.schemasCache());
    cache.set(projectId, schemas);
    this.schemasCache.set(cache);
  }

  /**
   * Delete a category schema
   */
  async deleteSchema(projectId: string, schemaId: string): Promise<void> {
    // Load current schemas
    const schemas = await this.loadSchemasForProject(projectId);

    // Filter out the deleted schema
    const updatedSchemas = schemas.filter((s) => s.id !== schemaId);

    // Save updated schemas back to single document
    const schemasDocRef = doc(this.firestore, 'projects', projectId, 'metadata', 'schemas');
    await setDoc(schemasDocRef, { items: updatedSchemas });

    // Update cache
    const cache = new Map(this.schemasCache());
    cache.set(projectId, updatedSchemas);
    this.schemasCache.set(cache);
  }

  /**
   * Get cached schemas for a project
   */
  getCachedSchemas(projectId: string): CategorySchema[] {
    return this.schemasCache().get(projectId) || [];
  }
}
