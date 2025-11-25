import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardLayout } from '../models/card-layout.model';
import { CategorySchema, DynamicItem } from '../models/category-schema.model';

@Component({
  selector: 'app-card-export-renderer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="card-export-container"
      [style.width.px]="cardWidth()"
      [style.height.px]="cardHeight()"
    >
      @if (layout(); as cardLayout) { @for (component of cardLayout.components; track component.id)
      {
      <div
        class="card-component"
        [style.position]="'absolute'"
        [style.left.px]="component.position.x"
        [style.top.px]="component.position.y"
        [style.width.px]="component.size.width"
        [style.height.px]="component.size.height"
        [style.font-family]="component.style?.fontFamily || 'Arial'"
        [style.font-size.px]="component.style?.fontSize || 25"
        [style.font-weight]="component.style?.fontWeight || 'normal'"
        [style.text-align]="component.style?.textAlign || 'left'"
        [style.color]="component.style?.color || '#000000'"
        [style.background-color]="component.style?.backgroundColor"
        [style.border]="getBorder(component)"
        [style.padding.px]="component.style?.padding || 8"
      >
        {{ getFieldValue(component.fieldId) }}
      </div>
      } }
    </div>
  `,
  styles: [
    `
      .card-export-container {
        position: relative;
        background: white;
        border: 1px solid #ddd;
        overflow: hidden;
      }

      .card-component {
        display: flex;
        align-items: center;
        word-wrap: break-word;
        overflow: hidden;
      }
    `,
  ],
})
export class CardExportRendererComponent {
  item = input.required<DynamicItem>();
  schema = input.required<CategorySchema>();
  layout = input<CardLayout | undefined>();
  cardWidth = input<number>(400);
  cardHeight = input<number>(600);

  protected getFieldValue(fieldName: string): string {
    const value = this.item()[fieldName];
    return value !== undefined && value !== null ? String(value) : '';
  }

  protected getBorder(component: any): string {
    if (!component.style) return 'none';
    const width = component.style.borderWidth || 0;
    const color = component.style.borderColor || '#000';
    return width > 0 ? `${width}px solid ${color}` : 'none';
  }
}
