import { CategorySchema } from './models/category-schema.model';

/**
 * Default category schemas for existing categories
 * These should be added to Firestore under: projects/{projectId}/schemas/{schemaId}
 */
export const DEFAULT_SCHEMAS: CategorySchema[] = [
  {
    id: 'actions',
    name: 'Actions',
    icon: '⚔️',
    fields: [
      { name: 'id', label: 'ID', type: 'number', required: true },
      { name: 'name', label: 'Name', type: 'text', required: true },
      { name: 'type', label: 'Type', type: 'text', required: true },
      { name: 'rules', label: 'Rules', type: 'textarea', required: true },
    ],
  },
  {
    id: 'equipments',
    name: 'Equipments',
    icon: '🛡️',
    fields: [
      { name: 'id', label: 'ID', type: 'number', required: true },
      { name: 'name', label: 'Name', type: 'text', required: true },
      { name: 'type', label: 'Type', type: 'text', required: true },
      { name: 'rules', label: 'Rules', type: 'textarea', required: true },
      { name: 'cost', label: 'Cost', type: 'text', required: false },
    ],
  },
  {
    id: 'usables',
    name: 'Usables',
    icon: '🧪',
    fields: [
      { name: 'id', label: 'ID', type: 'number', required: true },
      { name: 'name', label: 'Name', type: 'text', required: true },
      { name: 'type', label: 'Type', type: 'text', required: true },
      { name: 'rules', label: 'Rules', type: 'textarea', required: true },
      { name: 'slot', label: 'Slot', type: 'text', required: false },
    ],
  },
];

/**
 * Example of a custom user-created schema
 */
export const EXAMPLE_CUSTOM_SCHEMA: CategorySchema = {
  id: 'spells',
  name: 'Spells',
  icon: '✨',
  fields: [
    { name: 'id', label: 'ID', type: 'number', required: true },
    { name: 'name', label: 'Spell Name', type: 'text', required: true },
    {
      name: 'level',
      label: 'Level',
      type: 'dropdown',
      required: true,
      options: ['1', '2', '3', '4', '5'],
    },
    {
      name: 'school',
      label: 'School',
      type: 'dropdown',
      required: true,
      options: [
        'Evocation',
        'Abjuration',
        'Conjuration',
        'Divination',
        'Enchantment',
        'Illusion',
        'Necromancy',
        'Transmutation',
      ],
    },
    { name: 'castingTime', label: 'Casting Time', type: 'text', required: true },
    { name: 'range', label: 'Range', type: 'text', required: true },
    { name: 'duration', label: 'Duration', type: 'text', required: true },
    { name: 'description', label: 'Description', type: 'textarea', required: true },
  ],
};
