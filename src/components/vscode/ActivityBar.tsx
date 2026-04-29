"use client";

import { Files, Search, GitBranch, Puzzle, Settings } from "lucide-react";
import { useUIStore } from "@/store/uiStore";
import { ActivityPanel } from "@/types";
import { cn } from "@/lib/utils";

const PANELS: { id: ActivityPanel; icon: React.ElementType; label: string }[] =
  [
    { id: "explorer", icon: Files, label: "Explorer" },
    { id: "search", icon: Search, label: "Search" },
    { id: "git", icon: GitBranch, label: "Source Control" },
    { id: "extensions", icon: Puzzle, label: "Extensions" },
  ];

export default function ActivityBar() {
  const { activePanel, isSidebarOpen, setActivePanel, toggleSidebar } =
    useUIStore();

  const handleClick = (panelId: ActivityPanel) => {
    if (activePanel === panelId) {
      toggleSidebar();
    } else {
      setActivePanel(panelId);
      if (!isSidebarOpen) {
        toggleSidebar();
      }
    }
  };

  return (
    <aside className="flex flex-col w-12 shrink-0 bg-vs-activity-bar border-r border-vs-border-subtle select-none">
      <div className="flex flex-col flex-1">
        {PANELS.map(({ id, icon: Icon, label }) => {
          const isActive = activePanel === id && isSidebarOpen;
          return (
            <button
              key={id}
              onClick={() => handleClick(id)}
              title={label}
              aria-label={label}
              aria-pressed={isActive}
              className={cn(
                "relative flex items-center justify-center w-12 h-12 transition-opacity cursor-pointer",
                "hover:opacity-100",
                isActive
                  ? "opacity-100 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-0.5 before:bg-white"
                  : "opacity-50"
              )}
            >
              <Icon size={24} strokeWidth={1.5} />
            </button>
          );
        })}
      </div>

      <div className="flex flex-col">
        <button
          title="Settings"
          aria-label="Settings"
          className="flex items-center justify-center w-12 h-12 opacity-50 hover:opacity-100 transition-opacity cursor-pointer"
        >
          <Settings size={24} strokeWidth={1.5} />
        </button>
      </div>
    </aside>
  );
}
