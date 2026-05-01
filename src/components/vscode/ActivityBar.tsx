"use client";

import { useEffect, useRef, useState } from "react";
import { Files, Search, GitBranch, Puzzle, Settings, Languages } from "lucide-react";
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

function SettingsMenu() {
  const { language, setLanguage } = useUIStore();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      {open && (
        <div className="absolute bottom-0 left-full ml-1 w-44 bg-vs-sidebar border border-vs-border-subtle rounded z-50 py-1 text-sm text-vs-text shadow-[0_4px_24px_rgba(0,0,0,0.6)]">
          <div className="px-3 py-1.5 text-xs text-vs-text-muted uppercase tracking-widest font-semibold">
            Language
          </div>
          {(["ko", "en"] as const).map((lang) => (
            <button
              key={lang}
              onClick={() => { setLanguage(lang); setOpen(false); }}
              className={cn(
                "flex items-center gap-2 w-full px-3 py-1.5 hover:bg-vs-hover transition-colors cursor-pointer",
                language === lang && "text-vs-accent"
              )}
            >
              <Languages size={13} />
              <span>{lang === "ko" ? "한국어 (KO)" : "English (EN)"}</span>
              {language === lang && <span className="ml-auto text-vs-accent">✓</span>}
            </button>
          ))}
        </div>
      )}
      <button
        onClick={() => setOpen((v) => !v)}
        title="Settings"
        aria-label="Settings"
        aria-expanded={open}
        className={cn(
          "flex items-center justify-center w-12 h-12 transition-opacity cursor-pointer",
          open ? "opacity-100" : "opacity-50 hover:opacity-100"
        )}
      >
        <Settings size={24} strokeWidth={1.5} />
      </button>
    </div>
  );
}

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
        <SettingsMenu />
      </div>
    </aside>
  );
}
