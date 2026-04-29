"use client";

import { ChevronRight, FileText } from "lucide-react";
import { useEditorStore } from "@/store/editorStore";
import { getFileIconColor } from "@/lib/utils";

const FOLDER_LABELS: Record<string, string> = {
  introduce: "Introduce",
  projects: "Projects",
  skills: "Skills",
  experience: "Experience",
  contact: "Contact",
};

export default function Breadcrumbs() {
  const { tabs, activeTabId } = useEditorStore();
  const activeTab = tabs.find((t) => t.id === activeTabId);

  if (!activeTab) return null;

  const parts = activeTab.id.split("/");
  const folderKey = parts[0];
  const folderLabel = FOLDER_LABELS[folderKey] ?? folderKey;
  const fileName = parts[parts.length - 1];
  const iconColor = getFileIconColor(activeTab.language);

  return (
    <div className="flex items-center gap-1 h-7 px-3 bg-vs-bg border-b border-vs-border-subtle shrink-0 overflow-hidden">
      <span className="text-xs text-vs-text-muted shrink-0">Portfolio</span>
      <ChevronRight size={12} className="text-vs-text-dim shrink-0" />
      <span className="text-xs text-vs-text-muted shrink-0">{folderLabel}</span>
      <ChevronRight size={12} className="text-vs-text-dim shrink-0" />
      <span className="flex items-center gap-1 text-xs text-vs-text truncate">
        <FileText size={12} style={{ color: iconColor }} className="shrink-0" />
        <span className="truncate">{fileName}</span>
      </span>
    </div>
  );
}
