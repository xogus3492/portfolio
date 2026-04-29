"use client";

import { ChevronRight } from "lucide-react";
import { useEditorStore } from "@/store/editorStore";
import FileIcon from "./FileIcon";

const FOLDER_LABELS: Record<string, string> = {
  career: "Career",
  projects: "Projects",
  skills: "Skills",
  certificate: "Certificate",
};

export default function Breadcrumbs() {
  const { tabs, activeTabId } = useEditorStore();
  const activeTab = tabs.find((t) => t.id === activeTabId);

  if (!activeTab) return null;

  const parts = activeTab.id.split("/");
  const isRootFile = parts.length === 1;

  return (
    <div className="flex items-center gap-1 h-7 px-3 bg-vs-bg border-b border-vs-border-subtle shrink-0 overflow-hidden">
      <span className="text-xs text-vs-text-muted shrink-0">Portfolio</span>
      <ChevronRight size={12} className="text-vs-text-dim shrink-0" />

      {!isRootFile && (
        <>
          <span className="text-xs text-vs-text-muted shrink-0">
            {FOLDER_LABELS[parts[0]] ?? parts[0]}
          </span>
          <ChevronRight size={12} className="text-vs-text-dim shrink-0" />
        </>
      )}

      <span className="flex items-center gap-1 text-xs text-vs-text truncate">
        <FileIcon id={activeTab.id} language={activeTab.language} iconUrl={activeTab.iconUrl} size={12} />
        <span className="truncate">{parts[parts.length - 1]}</span>
      </span>
    </div>
  );
}
