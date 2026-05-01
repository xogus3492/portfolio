export type FileNodeType = "file" | "folder";

export interface FileNode {
  id: string;
  name: string;
  nameEn?: string;
  type: FileNodeType;
  language?: string;
  content?: string;
  contentEn?: string;
  iconUrl?: string;
  children?: FileNode[];
}

export interface EditorTab {
  id: string;
  name: string;
  nameEn?: string;
  language: string;
  content: string;
  contentEn?: string;
  isPreview: boolean;
  iconUrl?: string;
}

export type ActivityPanel = "explorer" | "search" | "git" | "extensions";
