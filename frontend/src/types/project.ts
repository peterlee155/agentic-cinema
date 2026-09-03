export interface ProjectMetadata {
  id: string;
  title: string;
  logline: string;
  genre: string;
  format: string;
  runtime?: string;
  status: "DRAFT" | "IN_PROGRESS" | "COMPLETED" | "ARCHIVED";
  ownerId: string;
  ownerName: string;
  updatedAt: string;
  createdAt: string;
  thumbnailUrl?: string;
  activeJobId?: string;
  sceneCount?: number;
  characterCount?: number;
}

export interface WorkspaceSection {
  id: string;
  label: string;
  icon: string;
  category: "core" | "creative" | "production" | "system";
  component: string;
  requiredData?: string[];
}
