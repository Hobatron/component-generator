import { CardLayout } from './card-layout.model';

export interface FieldDefinition {
  name: string;
  label: string;
  type: 'text' | 'number' | 'textarea' | 'dropdown' | 'image';
  required: boolean;
  options?: string[]; // For dropdown fields
  placeholder?: string;
}

export interface CategorySchema {
  id: string; // Unique identifier (e.g., 'my-new-category')
  name: string; // Display name (e.g., 'My New Category')
  icon: string; // Emoji or icon
  fields: FieldDefinition[];
  cardLayout?: CardLayout; // Optional card layout design
}

// Generic item that can have any fields based on schema
export type DynamicItem = Record<string, any>;
