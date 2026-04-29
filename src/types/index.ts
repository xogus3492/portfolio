export type FileNodeType = "file" | "folder";

export interface FileNode {
  id: string;
  name: string;
  type: FileNodeType;
  language?: string;
  content?: string;
  children?: FileNode[];
}

export interface EditorTab {
  id: string;
  name: string;
  language: string;
  content: string;
  isPreview: boolean;
}

export type ActivityPanel = "explorer" | "search" | "git" | "extensions";
