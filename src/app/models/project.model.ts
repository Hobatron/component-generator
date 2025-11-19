export interface Project {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  objectCount?: string;
  collections?: string[];
  createdAt?: string;
  owner: string; // User ID of the project owner
  collaborators?: string[]; // Array of user IDs who can access this project
}
