export interface ProjectResponse {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  color: string;
  status: 'active' | 'archived' | 'completed';
  filePath: string | null;
  createdAt: string;
  updatedAt: string;
}
