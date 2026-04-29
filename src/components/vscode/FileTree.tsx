"use client";

import {
  ChevronRight,
  ChevronDown,
  Folder,
  FolderOpen,
} from "lucide-react";
import { FileNode } from "@/types";
import { useEditorStore } from "@/store/editorStore";
import { cn } from "@/lib/utils";
import FileIcon from "./FileIcon";

interface FileTreeNodeProps {
  node: FileNode;
  depth: number;
}

function FileTreeNode({ node, depth }: FileTreeNodeProps) {
  const { expandedFolders, activeTabId, toggleFolder, openFile, pinTab } =
    useEditorStore();

  const isExpanded = expandedFolders.has(node.id);
  const isActive = activeTabId === node.id;

  const paddingLeft = 8 + depth * 12;

  if (node.type === "folder") {
    return (
      <div>
        <button
          onClick={() => toggleFolder(node.id)}
          className={cn(
            "flex items-center w-full gap-1 py-0.5 text-vs-text text-sm cursor-pointer",
            "hover:bg-vs-hover transition-colors"
          )}
          style={{ paddingLeft }}
        >
          <span className="shrink-0 text-vs-text-muted">
            {isExpanded ? (
              <ChevronDown size={16} />
            ) : (
              <ChevronRight size={16} />
            )}
          </span>
          <span className="shrink-0">
            {isExpanded ? (
              <FolderOpen size={16} className="text-vs-text-muted" />
            ) : (
              <Folder size={16} className="text-vs-text-muted" />
            )}
          </span>
          <span className="truncate">{node.name}</span>
        </button>

        {isExpanded && node.children && (
          <div>
            {node.children.map((child) => (
              <FileTreeNode key={child.id} node={child} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <button
      onClick={() => openFile(node)}
      onDoubleClick={() => pinTab(node.id)}
      className={cn(
        "flex items-center w-full gap-1.5 py-0.5 text-sm cursor-pointer transition-colors",
        isActive ? "bg-vs-selection text-vs-text-active" : "text-vs-text hover:bg-vs-hover"
      )}
      style={{ paddingLeft: paddingLeft + 20 }}
    >
      <FileIcon id={node.id} language={node.language} iconUrl={node.iconUrl} size={15} />
      <span className="truncate">{node.name}</span>
    </button>
  );
}

interface FileTreeProps {
  nodes: FileNode[];
}

export default function FileTree({ nodes }: FileTreeProps) {
  return (
    <div className="py-1">
      {nodes.map((node) => (
        <FileTreeNode key={node.id} node={node} depth={0} />
      ))}
    </div>
  );
}
