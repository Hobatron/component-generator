import { Component, inject, signal, effect } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map, switchMap } from 'rxjs/operators';
import { CardLayoutDesignerComponent } from '../card-layout-designer/card-layout-designer.component';
import { CategorySchemaService } from '../services/category-schema.service';
import { CategorySchema } from '../models/category-schema.model';
import { CardLayout } from '../models/card-layout.model';

@Component({
  selector: 'app-card-layout-page',
  templateUrl: './card-layout-page.component.html',
  styleUrls: ['./card-layout-page.component.scss'],
  imports: [CardLayoutDesignerComponent],
})
export class CardLayoutPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly schemaService = inject(CategorySchemaService);

  // Get project and schema from route params
  protected readonly projectName = toSignal(
    this.route.params.pipe(map((params) => params['projectName']))
  );

  protected readonly schemaId = toSignal(
    this.route.params.pipe(map((params) => params['schemaId']))
  );

  // Load the schema
  protected readonly schema = toSignal(
    this.route.params.pipe(
      switchMap((params) => this.schemaService.getSchema(params['projectName'], params['schemaId']))
    )
  );

  protected async onLayoutSaved(layout: CardLayout): Promise<void> {
    const schema = this.schema();
    const projectName = this.projectName();
    const schemaId = this.schemaId();

    if (!schema || !projectName || !schemaId) {
      alert('Missing required data');
      return;
    }

    const updatedSchema: CategorySchema = {
      ...schema,
      cardLayout: layout,
    };

    try {
      await this.schemaService.updateSchema(projectName, schemaId, updatedSchema);
      alert('Card layout saved successfully!');
    } catch (error) {
      console.error('Error saving card layout:', error);
      alert('Failed to save card layout. Please try again.');
    }
  }

  protected onDesignerClosed(): void {
    // Close the tab/window
    window.close();
  }
}
