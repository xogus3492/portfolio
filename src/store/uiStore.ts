"use client";

import { create } from "zustand";
import { ActivityPanel } from "@/types";

type Language = "ko" | "en";

interface UIState {
  activePanel: ActivityPanel;
  isSidebarOpen: boolean;
  sidebarWidth: number;
  language: Language;

  setActivePanel: (panel: ActivityPanel) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setSidebarWidth: (width: number) => void;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
}

export const useUIStore = create<UIState>()((set) => ({
  activePanel: "explorer",
  isSidebarOpen: true,
  sidebarWidth: 240,
  language: "ko",

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

  setLanguage: (lang: Language) => {
    set({ language: lang });
  },

  toggleLanguage: () => {
    set((state) => ({ language: state.language === "ko" ? "en" : "ko" }));
  },
}));
