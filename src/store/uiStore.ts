"use client";

import { create } from "zustand";
import { ActivityPanel } from "@/types";

interface UIState {
  activePanel: ActivityPanel;
  isSidebarOpen: boolean;
  sidebarWidth: number;

  setActivePanel: (panel: ActivityPanel) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setSidebarWidth: (width: number) => void;
}

export const useUIStore = create<UIState>()((set) => ({
  activePanel: "explorer",
  isSidebarOpen: true,
  sidebarWidth: 240,

  setActivePanel: (panel: ActivityPanel) => {
    set({ activePanel: panel });
  },

  toggleSidebar: () => {
    set((state) => ({ isSidebarOpen: !state.isSidebarOpen }));
  },

  setSidebarOpen: (open: boolean) => {
    set({ isSidebarOpen: open });
  },

  setSidebarWidth: (width: number) => {
    set({ sidebarWidth: width });
  },
}));
