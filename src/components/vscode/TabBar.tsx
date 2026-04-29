"use client";

import { useRef } from "react";
import { X } from "lucide-react";
import { useEditorStore } from "@/store/editorStore";
import { EditorTab } from "@/types";
import { cn } from "@/lib/utils";
import FileIcon from "./FileIcon";

interface TabItemProps {
  tab: EditorTab;
  isActive: boolean;
}

function TabItem({ tab, isActive }: TabItemProps) {
  const { setActiveTab, closeTab, pinTab } = useEditorStore();

  return (
    <div
      className={cn(
        "group flex items-center gap-1.5 h-9 pl-3 pr-1.5 shrink-0 cursor-pointer border-r border-vs-border-subtle",
        "transition-colors select-none min-w-0",
        isActive
          ? "bg-vs-tab-active border-t-2 border-t-vs-border-active"
          : "bg-vs-tab-inactive hover:bg-vs-active border-t-2 border-t-transparent"
      )}
      onClick={() => setActiveTab(tab.id)}
      onDoubleClick={() => pinTab(tab.id)}
    >
      <FileIcon id={tab.id} language={tab.language} iconUrl={tab.iconUrl} size={14} />
      <span
        className={cn(
          "text-sm truncate max-w-32",
          isActive ? "text-vs-text-active" : "text-vs-text-muted",
          tab.isPreview && "italic"
        )}
      >
        {tab.name}
      </span>
      <button
        onClick={(e) => {
          e.stopPropagation();
          closeTab(tab.id);
        }}
        aria-label={`${tab.name} 탭 닫기`}
        className={cn(
          "shrink-0 flex items-center justify-center w-5 h-5 rounded-sm ml-0.5",
          "opacity-0 group-hover:opacity-100 transition-opacity",
          isActive && "opacity-100",
          "hover:bg-vs-hover text-vs-text-muted hover:text-vs-text-active"
        )}
      >
        <X size={14} />
      </button>
    </div>
  );
}

export default function TabBar() {
  const { tabs, activeTabId } = useEditorStore();
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleWheel = (e: React.WheelEvent) => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft += e.deltaY;
    }
  };

  if (tabs.length === 0) return null;

  return (
    <div
      ref={scrollRef}
      onWheel={handleWheel}
      className="flex items-end bg-vs-tab-bar border-b border-vs-border-subtle overflow-x-auto scrollbar-none shrink-0"
    >
      {tabs.map((tab) => (
        <TabItem key={tab.id} tab={tab} isActive={tab.id === activeTabId} />
      ))}
    </div>
  );
}
