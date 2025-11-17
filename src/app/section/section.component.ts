import { Component, inject, signal } from '@angular/core';
import { AsyncPipe, TitleCasePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CardEditModalComponent } from '../card-edit-modal/card-edit-modal.component';
import { CategorySchema, DynamicItem } from '../models/category-schema.model';
import { CategorySchemaService } from '../services/category-schema.service';
import { ItemService } from '../services/item.service';

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

  protected readonly projectName$ = this.route.params.pipe(map((params) => params['projectName']));

  protected readonly sectionName$ = this.route.params.pipe(map((params) => params['section']));

  sectionItems$: Observable<DynamicItem[]>;

  // Store route params for async operations
  private readonly projectName: string;
  private readonly sectionName: string;

  // Modal state
  protected readonly isModalOpen = signal(false);
  protected readonly editingItem = signal<DynamicItem | null>(null);
  protected readonly currentSchema = signal<CategorySchema | null>(null);

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
    } else {
      // Fallback to empty observable
      this.sectionItems$ = new Observable<DynamicItem[]>();
    }
  }

  protected openAddModal(): void {
    if (!this.currentSchema()) {
      console.error('Cannot open modal: Schema not loaded');
      alert('Schema not loaded. Please ensure category schemas are configured in Firestore.');
      return;
    }
    this.editingItem.set(null);
    this.isModalOpen.set(true);
  }

  protected openEditModal(item: DynamicItem): void {
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
}
