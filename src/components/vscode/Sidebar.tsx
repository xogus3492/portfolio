"use client";

import { useUIStore } from "@/store/uiStore";
import { FILE_TREE } from "@/data/fileTree";
import FileTree from "./FileTree";

const PANEL_TITLES: Record<string, string> = {
  explorer: "EXPLORER",
  search: "SEARCH",
  git: "SOURCE CONTROL",
  extensions: "EXTENSIONS",
};

const PANEL_PLACEHOLDERS: Record<string, string> = {
  search: "검색 기능은 준비 중입니다.",
  git: "소스 컨트롤 기능은 준비 중입니다.",
  extensions: "확장 기능은 준비 중입니다.",
};

export default function Sidebar() {
  const { activePanel, isSidebarOpen, sidebarWidth, toggleSidebar } = useUIStore();

  if (!isSidebarOpen) return null;

  const title = PANEL_TITLES[activePanel] ?? "EXPLORER";

  return (
    <>
      {/* 모바일: 오버레이 배경 (클릭 시 닫힘) */}
      <div
        className="fixed inset-0 bg-black/50 z-20 lg:hidden"
        onClick={toggleSidebar}
        aria-hidden="true"
      />

      <aside
        className="flex flex-col shrink-0 bg-vs-sidebar border-r border-vs-border-subtle overflow-hidden select-none
                        fixed top-11 left-0 bottom-6 z-30
                        lg:relative lg:top-auto lg:left-auto lg:bottom-auto lg:z-auto
                        animate-[slideIn_0.18s_ease-out]"
        style={{ width: sidebarWidth }}
      >
        <div className="flex items-center h-9 px-5 shrink-0">
          <span className="text-xs text-vs-text-muted font-semibold tracking-widest uppercase">
            {title}
          </span>
        </div>

        <div className="flex-1 overflow-y-auto">
          {activePanel === "explorer" ? (
            <>
              <div className="flex items-center justify-between px-2 py-1">
                <span className="text-xs text-vs-text-muted font-semibold uppercase tracking-wide">
                  Portfolio
                </span>
              </div>
              <FileTree nodes={FILE_TREE} />
            </>
          ) : (
            <div className="flex items-center justify-center h-24 px-4">
              <p className="text-xs text-vs-text-muted text-center">
                {PANEL_PLACEHOLDERS[activePanel] ?? ""}
              </p>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
