import { Component, input, output, signal, computed, effect } from '@angular/core';
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
  protected readonly canvasSize = signal(CARD_PRESETS['mtg']);
  protected readonly components = signal<LayoutComponent[]>([]);
  protected readonly selectedComponentId = signal<string | null>(null);
  protected readonly showPropertiesPanel = signal(false); // Controls panel visibility
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

  // Available fonts
  protected readonly availableFonts = [
    'Arial',
    'Helvetica',
    'Times New Roman',
    'Georgia',
    'Courier New',
    'Verdana',
    'Trebuchet MS',
    'Comic Sans MS',
    'Impact',
    'Palatino',
    'Garamond',
    'Bookman',
    'Tahoma',
    'Lucida Console',
  ];

  // Font sizes
  protected readonly fontSizes = [8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48, 64, 72];

  // Font weights
  protected readonly fontWeights = [
    { value: 'normal', label: 'Normal' },
    { value: 'bold', label: 'Bold' },
    { value: '300', label: 'Light' },
    { value: '600', label: 'Semi-Bold' },
  ];

  // Get selected component
  protected readonly selectedComponent = computed(() => {
    const id = this.selectedComponentId();
    if (!id) return null;
    return this.components().find((c) => c.id === id) || null;
  });

  constructor() {
    // Load existing layout when provided
    effect(() => {
      const layout = this.existingLayout();

      if (layout) {
        // Load canvas size - try to match with existing preset or use custom
        if (layout.canvas) {
          const matchingPreset = Object.values(CARD_PRESETS).find(
            (preset) =>
              preset.width === layout.canvas.width && preset.height === layout.canvas.height
          );

          if (matchingPreset) {
            this.canvasSize.set(matchingPreset);
          } else {
            // Use custom preset with loaded dimensions
            this.canvasSize.set({
              ...CARD_PRESETS['custom'],
              width: layout.canvas.width,
              height: layout.canvas.height,
            });
          }
        }

        // Load components
        if (layout.components && layout.components.length > 0) {
          this.components.set([...layout.components]);
        }

        // Load grid size
        if (layout.gridSize) {
          this.gridSize.set(layout.gridSize);
        }
      }
    });
  }

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
   * Change card size preset
   */
  protected changeCardSize(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const presetKey = select.value as CardPresetType;
    const preset = CARD_PRESETS[presetKey];

    if (preset) {
      this.canvasSize.set(preset);
    }
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

    this.layoutSaved.emit(layout);
  }

  /**
   * Close the designer
   */
  protected closeDesigner(): void {
    this.designerClosed.emit();
  }

  /**
   * Select a component visually (highlight it) without opening properties
   */
  protected selectComponentVisually(event: MouseEvent, componentId: string): void {
    // Stop propagation so clicking on component doesn't trigger canvas click
    event.stopPropagation();
    // Highlight the component but don't open properties panel
    this.selectedComponentId.set(componentId);
    // Properties panel stays in its current state (open or closed)
  }

  /**
   * Open properties panel on right-click
   */
  protected openProperties(event: MouseEvent, componentId: string): void {
    event.preventDefault(); // Prevent default context menu
    event.stopPropagation(); // Prevent canvas click from closing panel
    this.selectedComponentId.set(componentId);
    this.showPropertiesPanel.set(true); // Open the properties panel
  }

  /**
   * Close properties panel when clicking on canvas background
   */
  protected closePropertiesPanel(): void {
    this.selectedComponentId.set(null);
    this.showPropertiesPanel.set(false);
  }

  /**
   * Delete the selected component
   */
  protected deleteSelectedComponent(): void {
    const selectedId = this.selectedComponentId();
    if (selectedId) {
      this.components.update((components) => components.filter((c) => c.id !== selectedId));
      this.selectedComponentId.set(null);
      this.showPropertiesPanel.set(false);
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
    let newX = this.resizeStartPosition.x;
    let newY = this.resizeStartPosition.y;

    // Calculate new size and position based on direction
    if (this.resizeDirection.includes('e')) {
      // Resize right - just increase width
      newWidth = Math.max(50, this.resizeStartSize.width + deltaX);
    }
    if (this.resizeDirection.includes('w')) {
      // Resize left - adjust position and width
      const widthChange = Math.max(50, this.resizeStartSize.width - deltaX);
      newX = this.resizeStartPosition.x + (this.resizeStartSize.width - widthChange);
      newWidth = widthChange;
    }
    if (this.resizeDirection.includes('s')) {
      // Resize down - just increase height
      newHeight = Math.max(30, this.resizeStartSize.height + deltaY);
    }
    if (this.resizeDirection.includes('n')) {
      // Resize up - adjust position and height
      const heightChange = Math.max(30, this.resizeStartSize.height - deltaY);
      newY = this.resizeStartPosition.y + (this.resizeStartSize.height - heightChange);
      newHeight = heightChange;
    }

    // Update component size and position
    this.components.update((components) =>
      components.map((c) =>
        c.id === this.resizeComponentId
          ? {
              ...c,
              size: { width: newWidth, height: newHeight },
              position: { x: newX, y: newY },
            }
          : c
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

  /**
   * Update component font family
   */
  protected updateFontFamily(fontFamily: string): void {
    const selectedId = this.selectedComponentId();
    if (!selectedId) return;

    this.components.update((components) =>
      components.map((c) => (c.id === selectedId ? { ...c, style: { ...c.style, fontFamily } } : c))
    );
  }

  /**
   * Update component font size
   */
  protected updateFontSize(fontSize: number): void {
    const selectedId = this.selectedComponentId();
    if (!selectedId) return;

    this.components.update((components) =>
      components.map((c) => (c.id === selectedId ? { ...c, style: { ...c.style, fontSize } } : c))
    );
  }

  /**
   * Update component font weight
   */
  protected updateFontWeight(fontWeight: string): void {
    const selectedId = this.selectedComponentId();
    if (!selectedId) return;

    this.components.update((components) =>
      components.map((c) =>
        c.id === selectedId ? { ...c, style: { ...c.style, fontWeight: fontWeight as any } } : c
      )
    );
  }

  /**
   * Update component text alignment
   */
  protected updateTextAlign(textAlign: 'left' | 'center' | 'right'): void {
    const selectedId = this.selectedComponentId();
    if (!selectedId) return;

    this.components.update((components) =>
      components.map((c) => (c.id === selectedId ? { ...c, style: { ...c.style, textAlign } } : c))
    );
  }

  /**
   * Update component text color
   */
  protected updateColor(color: string): void {
    const selectedId = this.selectedComponentId();
    if (!selectedId) return;

    this.components.update((components) =>
      components.map((c) => (c.id === selectedId ? { ...c, style: { ...c.style, color } } : c))
    );
  }

  /**
   * Update component background color
   */
  protected updateBackgroundColor(backgroundColor: string): void {
    const selectedId = this.selectedComponentId();
    if (!selectedId) return;

    this.components.update((components) =>
      components.map((c) =>
        c.id === selectedId ? { ...c, style: { ...c.style, backgroundColor } } : c
      )
    );
  }

  /**
   * Toggle transparent background
   */
  protected toggleTransparentBackground(isTransparent: boolean): void {
    const selectedId = this.selectedComponentId();
    if (!selectedId) return;

    this.components.update((components) =>
      components.map((c) => {
        if (c.id === selectedId) {
          const newStyle = { ...c.style };
          if (isTransparent) {
            // Remove backgroundColor to make it transparent
            delete newStyle.backgroundColor;
          } else {
            // Set to white when unchecking transparent
            newStyle.backgroundColor = '#ffffff';
          }
          return { ...c, style: newStyle };
        }
        return c;
      })
    );
  }
}
