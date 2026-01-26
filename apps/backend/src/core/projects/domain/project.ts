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

export interface ProjectBoardSummary {
  id: string;
  name: string;
  columnCount: number;
}

export interface ProjectNoteSummary {
  id: string;
  title: string;
  content: string;
  preview: string | null;
  updatedAt: Date;
}

export interface ProjectStats {
  boardCount: number;
  noteCount: number;
  timeThisWeek: number;
}

export interface ProjectWithDetails extends Project {
  boards: ProjectBoardSummary[];
  notes: ProjectNoteSummary[];
  stats: ProjectStats;
}
