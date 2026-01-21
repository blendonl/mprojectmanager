export type ProjectId = string;
export type ProjectStatus = "active" | "archived" | "completed";

export interface ProjectProps {
  id?: ProjectId;
  name: string;
  slug?: string;
  description?: string;
  color?: string;
  status?: ProjectStatus;
  created_at?: Date;
  updated_at?: Date;
  file_path?: string | null;
}
