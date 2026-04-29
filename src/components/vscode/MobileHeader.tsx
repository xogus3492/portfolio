"use client";

import { Menu, X } from "lucide-react";
import FileIcon from "./FileIcon";
import { useUIStore } from "@/store/uiStore";
import { useEditorStore } from "@/store/editorStore";

export default function MobileHeader() {
  const { isSidebarOpen, toggleSidebar } = useUIStore();
  const { tabs, activeTabId } = useEditorStore();
  const activeTab = tabs.find((t) => t.id === activeTabId);

  return (
    <header className="flex items-center gap-3 h-11 px-3 bg-vs-activity-bar border-b border-vs-border-subtle shrink-0 lg:hidden">
      <button
        onClick={toggleSidebar}
        aria-label="파일 탐색기 토글"
        className="flex items-center justify-center w-8 h-8 text-vs-text-muted hover:text-vs-text-active hover:bg-vs-hover rounded transition-colors cursor-pointer"
      >
        {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {activeTab && (
        <div className="flex items-center gap-2 min-w-0">
          <FileIcon id={activeTab.id} language={activeTab.language} iconUrl={activeTab.iconUrl} size={14} />
          <span className="text-sm text-vs-text truncate">{activeTab.name}</span>
        </div>
      )}
    </header>
  );
}
