import { Injectable, inject } from '@angular/core';
import { Firestore, collection, collectionData, doc, setDoc, deleteDoc, getDocs, writeBatch } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class MigrationService {
  private readonly firestore = inject(Firestore);

  async migrateToHierarchicalStructure(
    oldCollectionName: string, 
    projectName: string,
    collectionType: string
  ): Promise<void> {
    console.log(`Starting migration: ${oldCollectionName} -> projects/${projectName}/${collectionType}`);
    
    try {
      // Get all documents from old flat collection
      const oldCollectionRef = collection(this.firestore, oldCollectionName);
      const snapshot = await getDocs(oldCollectionRef);
      
      console.log(`Found ${snapshot.size} documents to migrate`);
      
      // Copy each document to new hierarchical structure
      const promises = snapshot.docs.map(async (docSnapshot) => {
        const data = docSnapshot.data();
        const docId = docSnapshot.id;
        
        // Create document in new hierarchical structure: projects/projectName/collectionType
        const projectDocRef = doc(this.firestore, 'projects', projectName);
        const subcollectionRef = collection(projectDocRef, collectionType);
        const newDocRef = doc(subcollectionRef, docId);
        await setDoc(newDocRef, data);
        
        console.log(`Migrated document: ${docId}`);
      });
      
      // Wait for all documents to be copied
      await Promise.all(promises);
      
      console.log(`✅ Migration completed: ${oldCollectionName} -> projects/${projectName}/${collectionType}`);
      console.log(`⚠️  Remember to manually delete the old collection: ${oldCollectionName}`);
      
    } catch (error) {
      console.error(`❌ Migration failed for ${oldCollectionName}:`, error);
      throw error;
    }
  }

  async migrateAllCardGameCollections(): Promise<void> {
    return this.migrateCollectionsWithPrefix('cardgame');
  }

  async migrateCollectionsWithPrefix(projectPrefix: string): Promise<void> {
    const migrations = [
      { old: `${projectPrefix}_actions`, type: 'actions' },
      { old: `${projectPrefix}_equipments`, type: 'equipments' },
      { old: `${projectPrefix}_usables`, type: 'usables' }
    ];

    console.log(`🚀 Starting migration to hierarchical structure for project: ${projectPrefix}...`);
    
    for (const migration of migrations) {
      // Migrate the collection
      await this.migrateToHierarchicalStructure(migration.old, projectPrefix, migration.type);
      
      // Verify the migration
      const isValid = await this.verifyHierarchicalMigration(migration.old, projectPrefix, migration.type);
      
      if (isValid) {
        // Delete old collection if validation succeeds
        await this.deleteOldCollection(migration.old);
        console.log(`✅ Successfully migrated and cleaned up: ${migration.old}`);
      } else {
        console.log(`❌ Migration validation failed for: ${migration.old}. Old collection preserved.`);
      }
    }
    
    console.log('🎉 Migration process completed!');
    console.log('📝 Next step: Update your app to use new hierarchical structure');
  }

  // Helper method to verify hierarchical migration
  async verifyHierarchicalMigration(
    oldCollectionName: string, 
    projectName: string, 
    collectionType: string
  ): Promise<boolean> {
    try {
      const oldRef = collection(this.firestore, oldCollectionName);
      
      // New hierarchical structure reference
      const projectDocRef = doc(this.firestore, 'projects', projectName);
      const newRef = collection(projectDocRef, collectionType);
      
      const [oldSnapshot, newSnapshot] = await Promise.all([
        getDocs(oldRef),
        getDocs(newRef)
      ]);
      
      const isValid = oldSnapshot.size === newSnapshot.size;
      
      console.log(`Verification for ${oldCollectionName} -> projects/${projectName}/${collectionType}:`);
      console.log(`Old collection: ${oldSnapshot.size} documents`);
      console.log(`New subcollection: ${newSnapshot.size} documents`);
      console.log(`Migration valid: ${isValid ? '✅' : '❌'}`);
      
      return isValid;
    } catch (error) {
      console.error('Verification failed:', error);
      return false;
    }
  }

  // Delete all documents in an old collection
  async deleteOldCollection(collectionName: string): Promise<void> {
    try {
      console.log(`🗑️ Deleting old collection: ${collectionName}...`);
      
      const collectionRef = collection(this.firestore, collectionName);
      const snapshot = await getDocs(collectionRef);
      
      if (snapshot.empty) {
        console.log(`Collection ${collectionName} is already empty.`);
        return;
      }

      // Use batch to delete all documents efficiently
      const batch = writeBatch(this.firestore);
      
      snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });
      
      await batch.commit();
      
      console.log(`✅ Successfully deleted ${snapshot.size} documents from ${collectionName}`);
    } catch (error) {
      console.error(`❌ Failed to delete collection ${collectionName}:`, error);
      throw error;
    }
  }
}
