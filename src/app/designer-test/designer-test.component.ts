import { Component, signal } from '@angular/core';
import { CardLayoutDesignerComponent } from '../card-layout-designer/card-layout-designer.component';
import { FieldDefinition } from '../models/category-schema.model';
import { CardLayout } from '../models/card-layout.model';

@Component({
  selector: 'app-designer-test',
  template: `
    <div class="test-container">
      @if (!showDesigner()) {
      <div class="test-intro">
        <h1>Card Layout Designer Test</h1>
        <p>This is a test page for the card layout designer.</p>
        <button class="btn btn-primary" (click)="openDesigner()">Open Designer</button>
      </div>
      } @else {
      <app-card-layout-designer
        [schemaFields]="testFields()"
        [existingLayout]="currentLayout()"
        (layoutSaved)="onLayoutSaved($event)"
        (designerClosed)="closeDesigner()"
      />
      }
    </div>
  `,
  styles: [
    `
      .test-container {
        width: 100%;
        height: 100vh;
      }

      .test-intro {
        max-width: 600px;
        margin: 4rem auto;
        padding: 2rem;
        text-align: center;

        h1 {
          font-size: 2rem;
          font-weight: 700;
          color: var(--color-text-primary);
          margin: 0 0 1rem 0;
        }

        p {
          font-size: 1rem;
          color: var(--color-text-secondary);
          margin: 0 0 2rem 0;
        }
      }

      .btn {
        padding: 0.75rem 1.5rem;
        border-radius: 8px;
        font-weight: 500;
        font-size: 1rem;
        border: none;
        cursor: pointer;
        transition: all 0.2s ease;

        &.btn-primary {
          background: var(--color-btn-primary);
          color: var(--color-text-inverse);

          &:hover {
            background: var(--color-btn-primary-hover);
            transform: translateY(-1px);
          }
        }
      }
    `,
  ],
  imports: [CardLayoutDesignerComponent],
})
export class DesignerTestComponent {
  protected readonly showDesigner = signal(false);
  protected readonly currentLayout = signal<CardLayout | undefined>(undefined);

  // Test schema fields
  protected readonly testFields = signal<FieldDefinition[]>([
    {
      name: 'name',
      label: 'Card Name',
      type: 'text',
      required: true,
      placeholder: 'Enter card name',
    },
    {
      name: 'description',
      label: 'Description',
      type: 'textarea',
      required: true,
      placeholder: 'Enter description',
    },
    {
      name: 'cost',
      label: 'Cost',
      type: 'number',
      required: true,
    },
    {
      name: 'type',
      label: 'Card Type',
      type: 'dropdown',
      required: true,
      options: ['Attack', 'Defense', 'Spell', 'Item'],
    },
    {
      name: 'image',
      label: 'Card Image',
      type: 'image',
      required: false,
    },
  ]);

  protected openDesigner(): void {
    this.showDesigner.set(true);
  }

  protected closeDesigner(): void {
    this.showDesigner.set(false);
  }

  protected onLayoutSaved(layout: CardLayout): void {
    console.log('Layout saved:', layout);
    this.currentLayout.set(layout);
    alert('Layout saved successfully! Check console for details.');
    this.closeDesigner();
  }
}
