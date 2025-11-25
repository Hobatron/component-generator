import { Component, inject, signal, computed } from '@angular/core';
import { AsyncPipe, TitleCasePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { CardEditModalComponent } from '../card-edit-modal/card-edit-modal.component';
import { CategorySchema, DynamicItem } from '../models/category-schema.model';
import { CategorySchemaService } from '../services/category-schema.service';
import { ItemService } from '../services/item.service';
import { ExportService } from '../services/export.service';
import { ProjectService } from '../services/project.service';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-section',
  templateUrl: './section.component.html',
  styleUrls: ['./section.component.scss'],
  imports: [AsyncPipe, TitleCasePipe, RouterLink, CardEditModalComponent],
})
export class SectionComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly schemaService = inject(CategorySchemaService);
  private readonly itemService = inject(ItemService);
  private readonly exportService = inject(ExportService);
  private readonly projectService = inject(ProjectService);

  protected readonly projectName$ = this.route.params.pipe(map((params) => params['projectName']));

  protected readonly sectionName$ = this.route.params.pipe(map((params) => params['section']));

  sectionItems$!: Observable<DynamicItem[]>;

  // Store route params for async operations
  private readonly projectName: string;
  private readonly sectionName: string;

  // Modal state
  protected readonly isModalOpen = signal(false);
  protected readonly editingItem = signal<DynamicItem | null>(null);
  protected readonly currentSchema = signal<CategorySchema | null>(null);

  // Export dropdown state
  protected readonly isExportMenuOpen = signal(false);

  // Convert items observable to signal for computed maxId
  protected readonly items = signal<DynamicItem[]>([]);

  // Calculate max ID from items
  protected readonly maxId = computed(() => {
    const itemsList = this.items();
    if (itemsList.length === 0) return 0;
    return Math.max(...itemsList.map((item) => Number(item['id']) || 0));
  });

  // Get project data for permission checks
  protected readonly project = toSignal(
    this.route.params.pipe(
      map((params) => params['projectName']),
      switchMap((projectName) => this.projectService.getProject(projectName))
    )
  );

  // Permission checks
  protected readonly hasWriteAccess = computed(() => {
    return this.projectService.hasWriteAccess(this.project());
  });

  constructor() {
    // Load data in constructor based on route parameters
    this.projectName = this.route.snapshot.params['projectName'];
    this.sectionName = this.route.snapshot.params['section'];

    if (this.projectName && this.sectionName) {
      // Subscribe to schemas and find the one for this section
      this.schemaService.getSchemas(this.projectName).subscribe((schemas) => {
        const schema = schemas.find((s) => s.id === this.sectionName);
        if (schema) {
          this.currentSchema.set(schema);
        } else {
          console.warn(
            `Schema not found for ${this.projectName}/${this.sectionName}. Please create a schema.`
          );
        }
      });

      // Load items using service
      this.sectionItems$ = this.itemService.getItems(this.projectName, this.sectionName);

      // Subscribe to items to update signal for maxId calculation
      this.sectionItems$.subscribe((items) => {
        this.items.set(items);
      });
    } else {
      // Fallback to empty observable
      this.sectionItems$ = new Observable<DynamicItem[]>();
    }
  }

  protected openAddModal(): void {
    if (!this.hasWriteAccess()) {
      alert('You do not have permission to add items');
      return;
    }
    if (!this.currentSchema()) {
      console.error('Cannot open modal: Schema not loaded');
      alert('Schema not loaded. Please ensure category schemas are configured in Firestore.');
      return;
    }
    this.editingItem.set(null);
    this.isModalOpen.set(true);
  }

  protected openEditModal(item: DynamicItem): void {
    if (!this.hasWriteAccess()) {
      alert('You do not have permission to edit items');
      return;
    }
    if (!this.currentSchema()) {
      console.error('Cannot open modal: Schema not loaded');
      alert('Schema not loaded. Please ensure category schemas are configured in Firestore.');
      return;
    }
    this.editingItem.set(item);
    this.isModalOpen.set(true);
  }

  protected closeModal(): void {
    this.isModalOpen.set(false);
    this.editingItem.set(null);
  }

  protected async saveItem(item: DynamicItem): Promise<void> {
    if (!this.projectName || !this.sectionName) return;

    try {
      if (this.editingItem()) {
        // Update existing item
        const itemId = String(item['id']);
        await this.itemService.updateItem(this.projectName, this.sectionName, itemId, item);
      } else {
        // Add new item
        await this.itemService.addItem(this.projectName, this.sectionName, item);
      }
      this.closeModal();
    } catch (error) {
      console.error('Error saving item:', error);
      alert('Failed to save item. Please try again.');
    }
  }

  // Export dropdown methods
  protected toggleExportMenu(): void {
    this.isExportMenuOpen.set(!this.isExportMenuOpen());
  }

  protected closeExportMenu(): void {
    this.isExportMenuOpen.set(false);
  }

  // Export methods
  protected exportJSON(): void {
    const items = this.items();
    const filename = `${this.projectName}-${this.sectionName}`;
    const schema = this.currentSchema();
    this.exportService.exportToJSON(items, filename, schema || undefined);
    this.closeExportMenu();
  }

  protected exportCSV(): void {
    const items = this.items();
    const filename = `${this.projectName}-${this.sectionName}`;
    this.exportService.exportToCSV(items, filename);
    this.closeExportMenu();
  }

  protected exportMarkdown(): void {
    const items = this.items();
    const filename = `${this.projectName}-${this.sectionName}`;
    const categoryName = this.currentSchema()?.name || this.sectionName;
    this.exportService.exportToMarkdown(items, filename, categoryName);
    this.closeExportMenu();
  }

  protected async exportImages(): Promise<void> {
    const items = this.items();
    const schema = this.currentSchema();
    const categoryName = schema?.name || this.sectionName;

    if (!schema) {
      alert('Schema not found');
      return;
    }

    await this.exportService.exportAsImages(items, schema, categoryName);
    this.closeExportMenu();
  }
}
