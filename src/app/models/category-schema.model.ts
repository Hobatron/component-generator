export interface FieldDefinition {
  name: string;
  label: string;
  type: 'text' | 'number' | 'textarea' | 'dropdown';
  required: boolean;
  options?: string[]; // For dropdown fields
  placeholder?: string;
}

export interface CategorySchema {
  id: string; // Unique identifier (e.g., 'my-new-category')
  name: string; // Display name (e.g., 'My New Category')
  icon: string; // Emoji or icon
  fields: FieldDefinition[];
}

// Generic item that can have any fields based on schema
export type DynamicItem = Record<string, any>;
