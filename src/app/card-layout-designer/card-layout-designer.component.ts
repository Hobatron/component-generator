import { Component, input, output, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdkDrag, CdkDragEnd } from '@angular/cdk/drag-drop';
import { FieldDefinition } from '../models/category-schema.model';
import {
  CardLayout,
  LayoutComponent,
  CARD_PRESETS,
  CardPresetType,
} from '../models/card-layout.model';

@Component({
  selector: 'app-card-layout-designer',
  templateUrl: './card-layout-designer.component.html',
  styleUrls: ['./card-layout-designer.component.scss'],
  imports: [CommonModule, CdkDrag],
  host: {
    '(window:keydown)': 'handleKeyDown($event)',
  },
})
export class CardLayoutDesignerComponent {
  // Inputs
  schemaFields = input.required<FieldDefinition[]>();
  existingLayout = input<CardLayout | undefined>();

  // Outputs
  layoutSaved = output<CardLayout>();
  designerClosed = output<void>();

  // State
  protected readonly canvasSize = signal(CARD_PRESETS['poker']);
  protected readonly components = signal<LayoutComponent[]>([]);
  protected readonly selectedComponentId = signal<string | null>(null);
  protected readonly gridSize = signal(10);
  protected readonly showGrid = signal(true);

  // Resize state
  private isResizing = false;
  private resizeComponentId: string | null = null;
  private resizeDirection: string | null = null;
  private resizeStartPos = { x: 0, y: 0 };
  private resizeStartSize = { width: 0, height: 0 };
  private resizeStartPosition = { x: 0, y: 0 };

  // Available field types for the toolbar
  protected readonly availableFields = computed(() => {
    const usedFieldIds = new Set(this.components().map((c) => c.fieldId));

    return this.schemaFields().map((field) => ({
      id: field.name,
      label: field.label,
      type: field.type,
      isUsed: usedFieldIds.has(field.name),
    }));
  });

  // Card presets for size selection
  protected readonly cardPresets = Object.entries(CARD_PRESETS).map(([key, value]) => ({
    key: key as CardPresetType,
    ...value,
  }));

  /**
   * Add a component to the canvas
   */
  protected addComponent(fieldId: string, type: FieldDefinition['type']): void {
    const newComponent: LayoutComponent = {
      id: `component-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      fieldId,
      type: type as any,
      position: { x: 20, y: 20 },
      size: this.getDefaultSize(type),
    };

    this.components.update((components) => [...components, newComponent]);
    this.selectedComponentId.set(newComponent.id);
  }

  /**
   * Get default size for a field type
   */
  private getDefaultSize(type: FieldDefinition['type']): { width: number; height: number } {
    switch (type) {
      case 'text':
        return { width: 200, height: 40 };
      case 'number':
        return { width: 100, height: 40 };
      case 'textarea':
        return { width: 250, height: 100 };
      case 'dropdown':
        return { width: 150, height: 40 };
      case 'image':
        return { width: 150, height: 150 };
      default:
        return { width: 150, height: 40 };
    }
  }

  /**
   * Handle drag end event
   */
  protected onDragEnded(event: CdkDragEnd, component: LayoutComponent): void {
    // Get the new position from the drag event
    const transform = event.source.getFreeDragPosition();

    // Update component position
    this.components.update((components) =>
      components.map((c) =>
        c.id === component.id ? { ...c, position: { x: transform.x, y: transform.y } } : c
      )
    );
  }

  /**
   * Toggle grid visibility
   */
  protected toggleGrid(): void {
    this.showGrid.update((show) => !show);
  }

  /**
   * Save the layout
   */
  protected saveLayout(): void {
    const layout: CardLayout = {
      id: this.existingLayout()?.id || `layout-${Date.now()}`,
      name: this.existingLayout()?.name || 'Card Layout',
      canvas: {
        width: this.canvasSize().width,
        height: this.canvasSize().height,
      },
      components: this.components(),
      gridSize: this.gridSize(),
      createdAt: this.existingLayout()?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    console.log('Layout JSON:', JSON.stringify(layout, null, 2));
    this.layoutSaved.emit(layout);
  }

  /**
   * Close the designer
   */
  protected closeDesigner(): void {
    this.designerClosed.emit();
  }

  /**
   * Select a component
   */
  protected selectComponent(componentId: string): void {
    this.selectedComponentId.set(componentId);
  }

  /**
   * Delete the selected component
   */
  protected deleteSelectedComponent(): void {
    const selectedId = this.selectedComponentId();
    if (selectedId) {
      this.components.update((components) => components.filter((c) => c.id !== selectedId));
      this.selectedComponentId.set(null);
    }
  }

  /**
   * Handle keyboard events
   */
  protected handleKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Delete' || event.key === 'Backspace') {
      this.deleteSelectedComponent();
    }
  }

  /**
   * Start resizing a component
   */
  protected startResize(event: MouseEvent, componentId: string, direction: string): void {
    event.preventDefault();
    event.stopPropagation();

    const component = this.components().find((c) => c.id === componentId);
    if (!component) return;

    this.isResizing = true;
    this.resizeComponentId = componentId;
    this.resizeDirection = direction;
    this.resizeStartPos = { x: event.clientX, y: event.clientY };
    this.resizeStartSize = { ...component.size };
    this.resizeStartPosition = { ...component.position };

    document.addEventListener('mousemove', this.onResizeMove);
    document.addEventListener('mouseup', this.onResizeEnd);
  }

  /**
   * Handle resize move
   */
  private onResizeMove = (event: MouseEvent): void => {
    if (!this.isResizing || !this.resizeComponentId || !this.resizeDirection) return;

    const deltaX = event.clientX - this.resizeStartPos.x;
    const deltaY = event.clientY - this.resizeStartPos.y;

    let newWidth = this.resizeStartSize.width;
    let newHeight = this.resizeStartSize.height;

    // Calculate new size based on direction
    if (this.resizeDirection.includes('e')) {
      newWidth = Math.max(50, this.resizeStartSize.width + deltaX);
    }
    if (this.resizeDirection.includes('w')) {
      newWidth = Math.max(50, this.resizeStartSize.width - deltaX);
    }
    if (this.resizeDirection.includes('s')) {
      newHeight = Math.max(30, this.resizeStartSize.height + deltaY);
    }
    if (this.resizeDirection.includes('n')) {
      newHeight = Math.max(30, this.resizeStartSize.height - deltaY);
    }

    // Update component size
    this.components.update((components) =>
      components.map((c) =>
        c.id === this.resizeComponentId ? { ...c, size: { width: newWidth, height: newHeight } } : c
      )
    );
  };

  /**
   * Handle resize end
   */
  private onResizeEnd = (): void => {
    this.isResizing = false;
    this.resizeComponentId = null;
    this.resizeDirection = null;

    document.removeEventListener('mousemove', this.onResizeMove);
    document.removeEventListener('mouseup', this.onResizeEnd);
  };
}
