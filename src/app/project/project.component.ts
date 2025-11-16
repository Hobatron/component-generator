import { Component, inject, signal } from '@angular/core';
import { AsyncPipe, TitleCasePipe, DatePipe } from '@angular/common';
import { ActivatedRoute, NavigationStart, Router, RouterLink } from '@angular/router';
import { map } from 'rxjs/operators';
import { DocumentData } from '@angular/fire/firestore';
import { BehaviorSubject, Observable } from 'rxjs';
import { Project } from '../models/project.model';
import { CategorySchema } from '../models/category-schema.model';
import { CategorySchemaService } from '../services/category-schema.service';
import { ProjectService } from '../services/project.service';

@Component({
  selector: 'app-project',
  templateUrl: './project.component.html',
  styleUrls: ['./project.component.scss'],
  imports: [AsyncPipe, TitleCasePipe, RouterLink],
})
export class ProjectComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly schemaService = inject(CategorySchemaService);
  private readonly projectService = inject(ProjectService);

  protected readonly projectName$ = this.route.params.pipe(map((params) => params['projectName']));

  project$: Observable<DocumentData | Project | undefined>;
  sections$: BehaviorSubject<string[]> = new BehaviorSubject<string[]>([]);

  // Store route params for async operations
  private readonly projectName: string;

  // Category management
  protected readonly schemas = signal<CategorySchema[]>([]);
  protected readonly isAddingCategory = signal(false);
  protected readonly newCategoryName = signal('');
  protected readonly newCategoryIcon = signal('📁');

  // Edit category
  protected readonly isEditingCategory = signal(false);
  protected readonly editingSchema = signal<CategorySchema | null>(null);
  protected readonly editCategoryName = signal('');
  protected readonly editCategoryIcon = signal('📁');

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
    this.projectName = this.route.snapshot.params['projectName'];
    this.project$ = this.projectService.getProject(this.projectName);

    // Load schemas for this project (this will populate sections)
    this.loadSchemas(this.projectName);

    // this.router.events.subscribe((event) => {
    //   if (event instanceof NavigationStart) {
    //     console.log(event.url);
    //   }
    // });
  }

  private async loadSchemas(projectName: string): Promise<void> {
    try {
      const schemas = await this.schemaService.loadSchemasForProject(projectName);
      this.schemas.set(schemas);

      // Update sections list from schemas
      const sectionIds = schemas.map((schema) => schema.id);
      this.sections$.next(sectionIds);
    } catch (error) {
      console.error('Error loading schemas:', error);
    }
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
    this.isEditingCategory.set(true);
  }

  protected closeEditCategoryModal(): void {
    this.isEditingCategory.set(false);
    this.editingSchema.set(null);
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

    // Create basic schema with just an ID field
    const newSchema: CategorySchema = {
      id,
      name,
      icon,
      fields: [{ name: 'id', label: 'ID', type: 'number', required: true }],
    };

    try {
      await this.schemaService.saveSchema(this.projectName, newSchema);
      await this.loadSchemas(this.projectName);
      this.closeAddCategoryModal();

      // Navigate to the new category
      this.router.navigate(['/projects', this.projectName, id]);
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

    // Update schema with new name and icon
    const updatedSchema: CategorySchema = {
      ...schema,
      name,
      icon,
    };

    try {
      await this.schemaService.saveSchema(this.projectName, updatedSchema);
      await this.loadSchemas(this.projectName);
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
      await this.schemaService.deleteSchema(this.projectName, schema.id);
      await this.loadSchemas(this.projectName);
      this.closeEditCategoryModal();
    } catch (error) {
      console.error('Error deleting category:', error);
      alert('Failed to delete category. Please try again.');
    }
  }
}
