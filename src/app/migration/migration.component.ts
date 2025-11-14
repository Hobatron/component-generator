import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MigrationService } from './migration.service';

@Component({
  selector: 'app-migration',
  template: `
    <div style="padding: 20px; border: 2px solid #ff9800; border-radius: 8px; margin: 20px 0; background: #fff3e0;">
      <h2>🔄 Database Migration Tool</h2>
      <p><strong>Warning:</strong> This will copy your collections with new prefixed names.</p>
      
      <div style="margin: 20px 0;">
        <label style="display: block; margin-bottom: 10px; font-weight: bold;">
          Project Name:
          <input 
            [(ngModel)]="projectName"
            type="text" 
            placeholder="Enter project name (e.g., cardgame, rpggame)"
            style="margin-left: 10px; padding: 8px; border: 1px solid #ccc; border-radius: 4px; width: 300px;"
          />
        </label>
        <p style="font-size: 0.9em; color: #666; margin-top: 5px;">
          This will be used as the prefix for your collections (e.g., "cardgame_actions")
        </p>
      </div>

      <div style="margin: 20px 0;">
        <h3>Migration Plan:</h3>
        <ul>
          <li><code>actions</code> → <code>{{ projectName() }}_actions</code></li>
          <li><code>equipments</code> → <code>{{ projectName() }}_equipments</code></li>
          <li><code>usables</code> → <code>{{ projectName() }}_usables</code></li>
        </ul>
      </div>

      <div style="margin: 20px 0;">
        <button 
          (click)="runMigration()" 
          [disabled]="migrationRunning"
          style="padding: 10px 20px; background: #4caf50; color: white; border: none; border-radius: 4px; cursor: pointer; margin-right: 10px;"
        >
          {{ migrationRunning ? 'Migrating...' : 'Start Migration' }}
        </button>
        
        <button 
          (click)="verifyMigration()" 
          [disabled]="migrationRunning"
          style="padding: 10px 20px; background: #2196f3; color: white; border: none; border-radius: 4px; cursor: pointer;"
        >
          Verify Migration
        </button>
      </div>

      @if (migrationStatus) {
        <div style="margin-top: 20px; padding: 10px; background: #f5f5f5; border-radius: 4px;">
          <h4>Status:</h4>
          <pre>{{ migrationStatus }}</pre>
        </div>
      }
    </div>
  `,
  imports: [FormsModule]
})
export class MigrationComponent {
  private readonly migrationService = inject(MigrationService);
  
  // Project name signal
  protected readonly projectName = signal('cardgame');
  
  migrationRunning = false;
  migrationStatus = '';

  async runMigration(): Promise<void> {
    const projectPrefix = this.projectName().trim();
    
    if (!projectPrefix) {
      this.migrationStatus = '❌ Please enter a project name';
      return;
    }

    this.migrationRunning = true;
    this.migrationStatus = `Starting migration with prefix: ${projectPrefix}...`;
    
    try {
      await this.migrationService.migrateCollectionsWithPrefix(projectPrefix);
      this.migrationStatus = `✅ Migration completed successfully!\n\nNew collections created:\n- ${projectPrefix}_actions\n- ${projectPrefix}_equipments\n- ${projectPrefix}_usables\n\nNext steps:\n1. Check Firebase Console to verify new collections\n2. Update your service to use new collection names\n3. Delete old collections manually`;
    } catch (error) {
      this.migrationStatus = `❌ Migration failed: ${error}`;
    } finally {
      this.migrationRunning = false;
    }
  }

  async verifyMigration(): Promise<void> {
    const projectPrefix = this.projectName().trim();
    
    if (!projectPrefix) {
      this.migrationStatus = '❌ Please enter a project name';
      return;
    }

    this.migrationStatus = 'Verifying migration...';
    
    try {
      const verifications = await Promise.all([
        this.migrationService.verifyMigration('actions', `${projectPrefix}_actions`),
        this.migrationService.verifyMigration('equipments', `${projectPrefix}_equipments`),
        this.migrationService.verifyMigration('usables', `${projectPrefix}_usables`)
      ]);
      
      const allValid = verifications.every(v => v);
      this.migrationStatus = allValid ? 
        '✅ All migrations verified successfully!' : 
        '⚠️ Some migrations may have issues. Check console for details.';
    } catch (error) {
      this.migrationStatus = `❌ Verification failed: ${error}`;
    }
  }
}
