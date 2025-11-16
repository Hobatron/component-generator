import { Component, inject, signal } from '@angular/core';
import { CategorySchemaService } from '../services/category-schema.service';
import { DEFAULT_SCHEMAS } from '../seed-schemas';

@Component({
  selector: 'app-schema-seeder',
  template: `
    <div class="seeder-container">
      <h2>Schema Seeder</h2>
      <p>This tool will populate default schemas for your projects.</p>

      <div class="form-group">
        <label for="projectId">Project ID:</label>
        <input
          type="text"
          id="projectId"
          [value]="projectId()"
          (input)="projectId.set($any($event.target).value)"
          placeholder="e.g., mortis_invictus"
          class="form-input"
        />
      </div>

      <button
        (click)="seedSchemas()"
        [disabled]="!projectId() || isSeeding"
        class="btn btn-primary"
      >
        {{ isSeeding ? 'Seeding...' : 'Seed Default Schemas' }}
      </button>

      @if (message) {
      <div class="message" [class.error]="isError">
        {{ message }}
      </div>
      }

      <div class="schemas-preview">
        <h3>Schemas to be created:</h3>
        <ul>
          @for (schema of defaultSchemas; track schema.id) {
          <li>
            <strong>{{ schema.icon }} {{ schema.name }}</strong> ({{ schema.id }})
            <ul>
              @for (field of schema.fields; track field.name) {
              <li>{{ field.label }} ({{ field.type }}{{ field.required ? ', required' : '' }})</li>
              }
            </ul>
          </li>
          }
        </ul>
      </div>
    </div>
  `,
  styles: [
    `
      .seeder-container {
        max-width: 800px;
        margin: 2rem auto;
        padding: 2rem;
        background: white;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }

      .form-group {
        margin-bottom: 1rem;
      }

      .form-group label {
        display: block;
        margin-bottom: 0.5rem;
        font-weight: 500;
      }

      .form-input {
        width: 100%;
        padding: 0.5rem;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 1rem;
      }

      .btn {
        padding: 0.75rem 1.5rem;
        border: none;
        border-radius: 4px;
        font-size: 1rem;
        cursor: pointer;
        margin-top: 1rem;
      }

      .btn-primary {
        background: #3b82f6;
        color: white;
      }

      .btn-primary:hover:not(:disabled) {
        background: #2563eb;
      }

      .btn:disabled {
        background: #9ca3af;
        cursor: not-allowed;
      }

      .message {
        margin-top: 1rem;
        padding: 1rem;
        border-radius: 4px;
        background: #d1fae5;
        color: #065f46;
      }

      .message.error {
        background: #fee2e2;
        color: #991b1b;
      }

      .schemas-preview {
        margin-top: 2rem;
        padding-top: 2rem;
        border-top: 1px solid #e5e7eb;
      }

      .schemas-preview ul {
        list-style: none;
        padding-left: 0;
      }

      .schemas-preview li {
        margin-bottom: 0.5rem;
      }

      .schemas-preview ul ul {
        padding-left: 1.5rem;
        margin-top: 0.5rem;
      }

      .schemas-preview ul ul li {
        font-size: 0.875rem;
        color: #6b7280;
      }
    `,
  ],
  imports: [],
})
export class SchemaSeederComponent {
  private readonly schemaService = inject(CategorySchemaService);

  protected projectId = signal('mortis_invictus');
  protected isSeeding = false;
  protected message = '';
  protected isError = false;
  protected readonly defaultSchemas = DEFAULT_SCHEMAS;

  protected async seedSchemas(): Promise<void> {
    if (!this.projectId()) {
      this.showMessage('Please enter a project ID', true);
      return;
    }

    this.isSeeding = true;
    this.message = '';

    try {
      for (const schema of DEFAULT_SCHEMAS) {
        await this.schemaService.saveSchema(this.projectId(), schema);
      }
      this.showMessage(
        `Successfully seeded ${DEFAULT_SCHEMAS.length} schemas for project: ${this.projectId()}`,
        false
      );
    } catch (error) {
      console.error('Error seeding schemas:', error);
      this.showMessage(`Error seeding schemas: ${error}`, true);
    } finally {
      this.isSeeding = false;
    }
  }

  private showMessage(msg: string, error: boolean): void {
    this.message = msg;
    this.isError = error;
  }
}
