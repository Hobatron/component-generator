import { Injectable, inject } from '@angular/core';
import { Firestore, collection, collectionData, doc, setDoc, deleteDoc, getDocs } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class MigrationService {
  private readonly firestore = inject(Firestore);

  async migrateCollectionWithPrefix(
    oldCollectionName: string, 
    newCollectionName: string
  ): Promise<void> {
    console.log(`Starting migration: ${oldCollectionName} -> ${newCollectionName}`);
    
    try {
      // Get all documents from old collection
      const oldCollectionRef = collection(this.firestore, oldCollectionName);
      const snapshot = await getDocs(oldCollectionRef);
      
      console.log(`Found ${snapshot.size} documents to migrate`);
      
      // Copy each document to new collection
      const promises = snapshot.docs.map(async (docSnapshot) => {
        const data = docSnapshot.data();
        const docId = docSnapshot.id;
        
        // Create document in new collection
        const newDocRef = doc(this.firestore, newCollectionName, docId);
        await setDoc(newDocRef, data);
        
        console.log(`Migrated document: ${docId}`);
      });
      
      // Wait for all documents to be copied
      await Promise.all(promises);
      
      console.log(`✅ Migration completed: ${oldCollectionName} -> ${newCollectionName}`);
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
      { old: 'actions', new: `${projectPrefix}_actions` },
      { old: 'equipments', new: `${projectPrefix}_equipments` },
      { old: 'usables', new: `${projectPrefix}_usables` }
    ];

    console.log(`🚀 Starting migration with prefix: ${projectPrefix}...`);
    
    for (const migration of migrations) {
      await this.migrateCollectionWithPrefix(migration.old, migration.new);
    }
    
    console.log('🎉 All collections migrated successfully!');
    console.log('📝 Next steps:');
    console.log('1. Verify data in new collections');
    console.log('2. Update your app to use new collection names');
    console.log('3. Manually delete old collections from Firebase Console');
  }

  // Helper method to verify migration
  async verifyMigration(oldCollection: string, newCollection: string): Promise<boolean> {
    try {
      const oldRef = collection(this.firestore, oldCollection);
      const newRef = collection(this.firestore, newCollection);
      
      const [oldSnapshot, newSnapshot] = await Promise.all([
        getDocs(oldRef),
        getDocs(newRef)
      ]);
      
      const isValid = oldSnapshot.size === newSnapshot.size;
      
      console.log(`Verification for ${oldCollection} -> ${newCollection}:`);
      console.log(`Old collection: ${oldSnapshot.size} documents`);
      console.log(`New collection: ${newSnapshot.size} documents`);
      console.log(`Migration valid: ${isValid ? '✅' : '❌'}`);
      
      return isValid;
    } catch (error) {
      console.error('Verification failed:', error);
      return false;
    }
  }
}
