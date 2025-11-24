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
  fontFamily?: string;
  fontSize?: number;
  fontWeight?:
    | 'normal'
    | 'bold'
    | 'lighter'
    | '100'
    | '200'
    | '300'
    | '400'
    | '500'
    | '600'
    | '700'
    | '800'
    | '900';
  textAlign?: 'left' | 'center' | 'right';
  color?: string;
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
 * Canvas size definition with physical dimensions
 */
export interface CanvasSize {
  width: number; // Width in pixels at 300 DPI
  height: number; // Height in pixels at 300 DPI
  name: string;
  physicalSize: {
    inches: { width: number; height: number; depth: number };
    mm: { width: number; height: number; depth: number };
  };
}

/**
 * Default canvas sizes for common card types
 * All dimensions calculated at 300 DPI for print quality
 */
export const CARD_PRESETS: Record<string, CanvasSize> = {
  // tarot: {
  //   width: 825,
  //   height: 1425,
  //   name: 'Tarot',
  //   physicalSize: {
  //     inches: { width: 2.75, height: 4.75, depth: 0.01 },
  //     mm: { width: 70, height: 121, depth: 0.3 },
  //   },
  // },
  // trading: {
  //   width: 750,
  //   height: 1050,
  //   name: 'Trading',
  //   physicalSize: {
  //     inches: { width: 2.5, height: 3.5, depth: 0.01 },
  //     mm: { width: 64, height: 89, depth: 0.3 },
  //   },
  // },
  // usGame: {
  //   width: 660,
  //   height: 1029,
  //   name: 'US Game',
  //   physicalSize: {
  //     inches: { width: 2.2, height: 3.43, depth: 0.01 },
  //     mm: { width: 56, height: 87, depth: 0.3 },
  //   },
  // },
  // bridge: {
  //   width: 675,
  //   height: 1050,
  //   name: 'Bridge',
  //   physicalSize: {
  //     inches: { width: 2.25, height: 3.5, depth: 0.01 },
  //     mm: { width: 57, height: 89, depth: 0.3 },
  //   },
  // },
  // mini: {
  //   width: 525,
  //   height: 750,
  //   name: 'Mini',
  //   physicalSize: {
  //     inches: { width: 1.75, height: 2.5, depth: 0.01 },
  //     mm: { width: 44, height: 64, depth: 0.3 },
  //   },
  // },
  mtg: {
    width: 744,
    height: 1038,
    name: 'Magic: The Gathering',
    physicalSize: {
      inches: { width: 2.48, height: 3.46, depth: 0.01 },
      mm: { width: 63, height: 88, depth: 0.3 },
    },
  },
  // custom: {
  //   width: 750,
  //   height: 1050,
  //   name: 'Custom Size',
  //   physicalSize: {
  //     inches: { width: 2.5, height: 3.5, depth: 0.01 },
  //     mm: { width: 64, height: 89, depth: 0.3 },
  //   },
  // },
};

export type CardPresetType = keyof typeof CARD_PRESETS;
