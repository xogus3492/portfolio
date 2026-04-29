"use client";

import { create } from "zustand";
import { ActivityPanel } from "@/types";

interface UIState {
  activePanel: ActivityPanel;
  isSidebarOpen: boolean;

  setActivePanel: (panel: ActivityPanel) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
}

export const useUIStore = create<UIState>()((set) => ({
  activePanel: "explorer",
  isSidebarOpen: true,

  setActivePanel: (panel: ActivityPanel) => {
    set({ activePanel: panel });
  },

  toggleSidebar: () => {
    set((state) => ({ isSidebarOpen: !state.isSidebarOpen }));
  },

  setSidebarOpen: (open: boolean) => {
    set({ isSidebarOpen: open });
  },
}));
