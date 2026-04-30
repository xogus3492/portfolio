"use client";

import { useCallback, useState } from "react";
import { useUIStore } from "@/store/uiStore";

const MIN_WIDTH = 160;
const MAX_WIDTH = 520;

export default function ResizeHandle() {
  const { isSidebarOpen, setSidebarWidth } = useUIStore();
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();

      const startX = e.clientX;
      const startWidth = useUIStore.getState().sidebarWidth;

      setIsDragging(true);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";

      const onMouseMove = (e: MouseEvent) => {
        const delta = e.clientX - startX;
        const newWidth = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, startWidth + delta));
        setSidebarWidth(newWidth);
      };

      const onMouseUp = () => {
        setIsDragging(false);
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
      };

      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    },
    [setSidebarWidth]
  );

  if (!isSidebarOpen) return null;

  const isActive = isDragging || isHovered;

  return (
    <div
      onMouseDown={onMouseDown}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="hidden lg:block shrink-0 relative cursor-col-resize"
      style={{ width: 4 }}
    >
      <div
        className="absolute inset-y-0 left-0 w-full transition-colors duration-150"
        style={{ backgroundColor: isActive ? "#007acc" : "transparent" }}
      />
      {/* 클릭 hitbox 확장 */}
      <div className="absolute inset-y-0 -left-1 -right-1" />
    </div>
  );
}
