export type CollaboratorPermission = 'read' | 'write';

export interface Collaborator {
  userId: string;
  email?: string;
  displayName?: string;
  permission: CollaboratorPermission;
  addedAt: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  objectCount?: string;
  collections?: string[];
  createdAt?: string;
  owner: string; // User ID of the project owner
  collaborators?: Collaborator[]; // Array of collaborators with permissions
}
