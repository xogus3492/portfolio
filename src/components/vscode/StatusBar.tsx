"use client";

import { GitBranch, AlertCircle, XCircle } from "lucide-react";
import { useEditorStore } from "@/store/editorStore";

const LANGUAGE_LABELS: Record<string, string> = {
  markdown: "Markdown",
  typescript: "TypeScript",
  typescriptreact: "TypeScript React",
  javascript: "JavaScript",
  json: "JSON",
  css: "CSS",
  html: "HTML",
  plaintext: "Plain Text",
};

export default function StatusBar() {
  const { tabs, activeTabId } = useEditorStore();
  const activeTab = tabs.find((t) => t.id === activeTabId);
  const languageLabel = activeTab
    ? (LANGUAGE_LABELS[activeTab.language] ?? activeTab.language)
    : "Plain Text";

  return (
    <footer className="flex items-center justify-between h-6 px-3 bg-vs-status-bar text-white text-xs shrink-0 select-none">
      <div className="flex items-center gap-3">
        <span className="flex items-center gap-1 hover:bg-vs-accent-hover px-1 rounded cursor-default transition-colors">
          <GitBranch size={13} />
          <span>main</span>
        </span>

        <span className="flex items-center gap-1 hover:bg-vs-accent-hover px-1 rounded cursor-default transition-colors">
          <XCircle size={13} />
          <span>0</span>
          <AlertCircle size={13} />
          <span>0</span>
        </span>
      </div>

      <div className="flex items-center gap-4">
        {activeTab && (
          <span className="text-white/80">Ln 1, Col 1</span>
        )}
        <span className="hover:bg-vs-accent-hover px-1 rounded cursor-default transition-colors">
          UTF-8
        </span>
        <span className="hover:bg-vs-accent-hover px-1 rounded cursor-default transition-colors">
          LF
        </span>
        <span className="hover:bg-vs-accent-hover px-1 rounded cursor-default transition-colors font-medium">
          {languageLabel}
        </span>
      </div>
    </footer>
  );
}
