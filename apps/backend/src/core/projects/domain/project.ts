export type ProjectStatus = 'active' | 'archived' | 'completed';

export interface Project {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  color: string;
  status: ProjectStatus;
  filePath: string | null;
  createdAt: Date;
  updatedAt: Date;
}
