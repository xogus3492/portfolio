"use client";

import { useEffect } from "react";
import ActivityBar from "@/components/vscode/ActivityBar";
import Sidebar from "@/components/vscode/Sidebar";
import TabBar from "@/components/vscode/TabBar";
import Breadcrumbs from "@/components/vscode/Breadcrumbs";
import Editor from "@/components/vscode/Editor";
import StatusBar from "@/components/vscode/StatusBar";
import MobileHeader from "@/components/vscode/MobileHeader";
import { useUIStore } from "@/store/uiStore";

export default function Home() {
  const { toggleSidebar, setSidebarOpen } = useUIStore();

  useEffect(() => {
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  }, [setSidebarOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMod = e.metaKey || e.ctrlKey;
      if (!isMod) return;

      if (e.key === "b") {
        e.preventDefault();
        toggleSidebar();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleSidebar]);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-vs-bg">
      {/* 모바일 전용 헤더 (lg 이상에서는 숨김) */}
      <MobileHeader />

      <div className="flex flex-1 min-h-0">
        {/* 데스크톱 전용 Activity Bar (모바일에서는 숨김) */}
        <div className="hidden lg:flex">
          <ActivityBar />
        </div>

        {/* 사이드바: 데스크톱 인라인 / 모바일 오버레이 */}
        <Sidebar />

        {/* 메인 에디터 영역 */}
        <div className="flex flex-col flex-1 min-w-0">
          <TabBar />
          <Breadcrumbs />

          <div className="flex flex-1 min-h-0 overflow-hidden">
            <Editor />
          </div>
        </div>
      </div>

      <StatusBar />
    </div>
  );
}
