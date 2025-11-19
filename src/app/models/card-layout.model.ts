/**
 * Represents a single component in the card layout
 */
export interface LayoutComponent {
  id: string; // Unique identifier for this component instance
  fieldId: string; // Maps to the field ID in the schema
  type: FieldType; // Type of field (matches schema field types)
  position: {
    x: number; // X coordinate in pixels
    y: number; // Y coordinate in pixels
  };
  size: {
    width: number; // Width in pixels
    height: number; // Height in pixels
  };
  style?: ComponentStyle; // Optional styling overrides
}

/**
 * Field types that can be used in the layout
 */
export type FieldType = 'text' | 'textarea' | 'number' | 'image' | 'checkbox' | 'select';

/**
 * Optional styling for layout components
 */
export interface ComponentStyle {
  fontSize?: number;
  fontWeight?: 'normal' | 'bold';
  textAlign?: 'left' | 'center' | 'right';
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
  padding?: number;
}

/**
 * Complete card layout definition
 */
export interface CardLayout {
  id: string; // Unique identifier for this layout
  name: string; // Human-readable name
  canvas: {
    width: number; // Canvas width in pixels (e.g., 300 for poker card)
    height: number; // Canvas height in pixels (e.g., 420 for poker card)
  };
  components: LayoutComponent[]; // Array of components on the canvas
  gridSize?: number; // Snap grid size in pixels (default: 10)
  createdAt: string;
  updatedAt: string;
}

/**
 * Canvas size definition
 */
export interface CanvasSize {
  width: number;
  height: number;
  name: string;
}

/**
 * Default canvas sizes for common card types
 */
export const CARD_PRESETS: Record<string, CanvasSize> = {
  poker: { width: 400, height: 560, name: 'Poker Card (2.5" × 3.5")' },
  tarot: { width: 448, height: 784, name: 'Tarot Card (2.8" × 4.9")' },
  bridge: { width: 352, height: 496, name: 'Bridge Card (2.2" × 3.1")' },
  square: { width: 480, height: 480, name: 'Square Card (3" × 3")' },
  custom: { width: 500, height: 700, name: 'Custom Size' },
};

export type CardPresetType = keyof typeof CARD_PRESETS;
