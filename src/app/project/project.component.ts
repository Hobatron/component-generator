import { Component, inject, signal, computed, effect } from '@angular/core';
import { AsyncPipe, TitleCasePipe, DatePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { map, switchMap } from 'rxjs/operators';
import { toSignal } from '@angular/core/rxjs-interop';
import { DocumentData } from '@angular/fire/firestore';
import { BehaviorSubject, Observable } from 'rxjs';
import { MatTabsModule } from '@angular/material/tabs';
import { Project } from '../models/project.model';
import { CategorySchema, FieldDefinition } from '../models/category-schema.model';
import { CardLayout } from '../models/card-layout.model';
import { CategorySchemaService } from '../services/category-schema.service';
import { ProjectService } from '../services/project.service';
import { CardLayoutDesignerComponent } from '../card-layout-designer/card-layout-designer.component';

@Component({
  selector: 'app-project',
  templateUrl: './project.component.html',
  styleUrls: ['./project.component.scss'],
  imports: [AsyncPipe, TitleCasePipe, RouterLink, CardLayoutDesignerComponent, MatTabsModule],
})
export class ProjectComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly schemaService = inject(CategorySchemaService);
  private readonly projectService = inject(ProjectService);

  protected readonly projectName$ = this.route.params.pipe(map((params) => params['projectName']));

  project$: Observable<DocumentData | Project | undefined>;
  sections$: BehaviorSubject<string[]> = new BehaviorSubject<string[]>([]);

  // Category management - derived from route params
  protected readonly schemas = toSignal(
    this.route.params.pipe(
      map((params) => params['projectName']),
      switchMap((projectName) => this.schemaService.getSchemas(projectName))
    ),
    { initialValue: [] }
  );
  protected readonly isAddingCategory = signal(false);
  protected readonly newCategoryName = signal('');
  protected readonly newCategoryIcon = signal('📁');

  // Edit category
  protected readonly isEditingCategory = signal(false);
  protected readonly editingSchema = signal<CategorySchema | null>(null);
  protected readonly editCategoryName = signal('');
  protected readonly editCategoryIcon = signal('📁');
  protected readonly editingFields = signal<FieldDefinition[]>([]);
  protected readonly activeTab = signal<'fields' | 'layout'>('fields');
  protected activeTabIndex = 0;

  // New field state
  protected readonly isAddingField = signal(false);
  protected readonly newFieldName = signal('');
  protected readonly newFieldLabel = signal('');
  protected readonly newFieldType = signal<'text' | 'number' | 'textarea' | 'dropdown'>('text');
  protected readonly newFieldRequired = signal(false);
  protected readonly newFieldOptions = signal('');

  // Emoji options for icon picker
  protected readonly emojiOptions = [
    { emoji: '⚔️', label: 'Sword' },
    { emoji: '🛡️', label: 'Shield' },
    { emoji: '🧪', label: 'Potion' },
    { emoji: '✨', label: 'Sparkles' },
    { emoji: '🔮', label: 'Crystal Ball' },
    { emoji: '📜', label: 'Scroll' },
    { emoji: '🗡️', label: 'Dagger' },
    { emoji: '🏹', label: 'Bow' },
    { emoji: '🪄', label: 'Wand' },
    { emoji: '👤', label: 'Person' },
    { emoji: '👥', label: 'People' },
    { emoji: '👹', label: 'Monster' },
    { emoji: '🐉', label: 'Dragon' },
    { emoji: '🦇', label: 'Bat' },
    { emoji: '🕷️', label: 'Spider' },
    { emoji: '💀', label: 'Skull' },
    { emoji: '🎭', label: 'Masks' },
    { emoji: '🎪', label: 'Circus' },
    { emoji: '🎨', label: 'Art' },
    { emoji: '🎲', label: 'Dice' },
    { emoji: '🃏', label: 'Joker' },
    { emoji: '🏰', label: 'Castle' },
    { emoji: '🗺️', label: 'Map' },
    { emoji: '🧭', label: 'Compass' },
    { emoji: '⚡', label: 'Lightning' },
    { emoji: '🔥', label: 'Fire' },
    { emoji: '❄️', label: 'Snowflake' },
    { emoji: '💧', label: 'Water' },
    { emoji: '🌪️', label: 'Tornado' },
    { emoji: '⭐', label: 'Star' },
    { emoji: '💎', label: 'Gem' },
    { emoji: '👑', label: 'Crown' },
    { emoji: '🔑', label: 'Key' },
    { emoji: '📦', label: 'Box' },
    { emoji: '🎁', label: 'Gift' },
    { emoji: '💰', label: 'Money Bag' },
    { emoji: '🪙', label: 'Coin' },
    { emoji: '📚', label: 'Books' },
    { emoji: '📖', label: 'Book' },
    { emoji: '🗃️', label: 'Card File' },
    { emoji: '📁', label: 'Folder' },
    { emoji: '🎮', label: 'Game' },
    { emoji: '🕹️', label: 'Joystick' },
    { emoji: '🎯', label: 'Bullseye' },
    { emoji: '🏆', label: 'Trophy' },
    { emoji: '🥇', label: 'Medal' },
    { emoji: '🌟', label: 'Glowing Star' },
    { emoji: '💫', label: 'Dizzy' },
    { emoji: '🌙', label: 'Moon' },
    { emoji: '☀️', label: 'Sun' },
  ];

  constructor() {
    // Subscribe to route parameter changes to handle project switching
    this.project$ = this.route.params.pipe(
      map((params) => params['projectName']),
      switchMap((projectName) => this.projectService.getProject(projectName))
    );

    // Update sections list when schemas change
    effect(() => {
      const schemas = this.schemas();
      const sectionIds = schemas.map((schema) => schema.id);
      this.sections$.next(sectionIds);
    });
  }

  protected getSchemaForSection(sectionId: string): CategorySchema | undefined {
    return this.schemas().find((s) => s.id === sectionId);
  }

  protected formatProjectName(projectName: string | null | undefined): string {
    if (!projectName) return '';
    // Replace underscores with spaces and apply title case
    return projectName
      .replace(/_/g, ' ')
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  protected openAddCategoryModal(): void {
    this.isAddingCategory.set(true);
    this.newCategoryName.set('');
    this.newCategoryIcon.set('📁');
  }

  protected closeAddCategoryModal(): void {
    this.isAddingCategory.set(false);
  }

  protected openEditCategoryModal(schema: CategorySchema): void {
    this.editingSchema.set(schema);
    this.editCategoryName.set(schema.name);
    this.editCategoryIcon.set(schema.icon);
    this.editingFields.set([...schema.fields]); // Copy fields array
    this.isEditingCategory.set(true);
  }

  protected closeEditCategoryModal(): void {
    this.isEditingCategory.set(false);
    this.editingSchema.set(null);
    this.isAddingField.set(false);
  }

  protected openAddFieldForm(): void {
    this.newFieldName.set('');
    this.newFieldLabel.set('');
    this.newFieldType.set('text');
    this.newFieldRequired.set(false);
    this.newFieldOptions.set('');
    this.isAddingField.set(true);
  }

  protected cancelAddField(): void {
    this.isAddingField.set(false);
  }

  protected addField(): void {
    const name = this.newFieldName().trim();
    const label = this.newFieldLabel().trim();

    if (!name || !label) {
      alert('Field name and label are required');
      return;
    }

    // Check for duplicate field names
    if (this.editingFields().some((f) => f.name === name)) {
      alert('A field with this name already exists');
      return;
    }

    const newField: FieldDefinition = {
      name,
      label,
      type: this.newFieldType(),
      required: this.newFieldRequired(),
    };

    // Add options for dropdown fields
    if (this.newFieldType() === 'dropdown') {
      const options = this.newFieldOptions()
        .split(',')
        .map((o) => o.trim())
        .filter((o) => o.length > 0);

      if (options.length === 0) {
        alert('Dropdown fields must have at least one option');
        return;
      }

      newField.options = options;
    }

    // Add field to editing fields
    this.editingFields.set([...this.editingFields(), newField]);
    this.isAddingField.set(false);
  }

  protected removeField(fieldName: string): void {
    // Don't allow removing the ID field
    if (fieldName === 'id') {
      alert('Cannot remove the ID field');
      return;
    }

    const confirmed = confirm(`Remove field "${fieldName}"?`);
    if (confirmed) {
      this.editingFields.set(this.editingFields().filter((f) => f.name !== fieldName));
    }
  }

  protected async createCategory(): Promise<void> {
    const name = this.newCategoryName().trim();
    const icon = this.newCategoryIcon();

    if (!name) {
      alert('Please enter a category name');
      return;
    }

    // Generate ID from name (lowercase, replace spaces with underscores)
    const id = name.toLowerCase().replace(/\s+/g, '_');

    // Create basic schema with default fields
    const newSchema: CategorySchema = {
      id,
      name,
      icon,
      fields: [
        { name: 'id', label: 'ID', type: 'number', required: true },
        { name: 'name', label: 'Name', type: 'text', required: true },
      ],
    };

    try {
      const projectName = this.route.snapshot.params['projectName'];
      await this.schemaService.addSchema(projectName, newSchema);
      this.closeAddCategoryModal();
    } catch (error) {
      console.error('Error creating category:', error);
      alert('Failed to create category. Please try again.');
    }
  }

  protected async updateCategory(): Promise<void> {
    const schema = this.editingSchema();
    const name = this.editCategoryName().trim();
    const icon = this.editCategoryIcon();

    if (!schema || !name) {
      alert('Please enter a category name');
      return;
    }

    // Update schema with new name, icon, and fields (preserve existing cardLayout)
    const updatedSchema: CategorySchema = {
      ...schema,
      name,
      icon,
      fields: this.editingFields(),
      cardLayout: schema.cardLayout, // Preserve existing layout
    };

    try {
      const projectName = this.route.snapshot.params['projectName'];
      await this.schemaService.updateSchema(projectName, schema.id, updatedSchema);
      this.closeEditCategoryModal();
    } catch (error) {
      console.error('Error updating category:', error);
      alert('Failed to update category. Please try again.');
    }
  }

  protected async deleteCategory(schema: CategorySchema): Promise<void> {
    const confirmed = confirm(
      `Are you sure you want to delete "${schema.name}"? This will remove the category schema but not the items.`
    );

    if (!confirmed) return;

    try {
      const projectName = this.route.snapshot.params['projectName'];
      await this.schemaService.deleteSchema(projectName, schema.id);
      this.closeEditCategoryModal();
    } catch (error) {
      console.error('Error deleting category:', error);
      alert('Failed to delete category. Please try again.');
    }
  }

  protected switchTab(tab: 'fields' | 'layout'): void {
    this.activeTab.set(tab);
  }

  protected onTabChange(index: number): void {
    this.activeTab.set(index === 0 ? 'fields' : 'layout');
  }

  protected handleCancel(): void {
    // If on layout tab, switch back to fields tab
    if (this.activeTab() === 'layout') {
      this.activeTabIndex = 0;
      this.activeTab.set('fields');
    } else {
      // If on fields tab, close the modal
      this.closeEditCategoryModal();
    }
  }

  protected async onLayoutSaved(layout: CardLayout): Promise<void> {
    const schema = this.editingSchema();
    if (!schema) return;

    const updatedSchema: CategorySchema = {
      ...schema,
      name: this.editCategoryName(),
      icon: this.editCategoryIcon(),
      fields: this.editingFields(),
      cardLayout: layout,
    };

    try {
      const projectName = this.route.snapshot.params['projectName'];
      await this.schemaService.updateSchema(projectName, schema.id, updatedSchema);

      // Update the editing schema signal so "Save Changes" doesn't overwrite
      this.editingSchema.set(updatedSchema);

      alert('Card layout saved successfully!');
    } catch (error) {
      console.error('Error saving card layout:', error);
      alert('Failed to save card layout. Please try again.');
    }
  }
}
