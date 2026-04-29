"use client";

import { create } from "zustand";
import { EditorTab, FileNode } from "@/types";
import SELF_INTRO_CONTENT from "@/data/content/self_intro";

interface EditorState {
  tabs: EditorTab[];
  activeTabId: string | null;
  expandedFolders: Set<string>;

  openFile: (node: FileNode) => void;
  pinTab: (tabId: string) => void;
  closeTab: (tabId: string) => void;
  setActiveTab: (tabId: string) => void;
  toggleFolder: (folderId: string) => void;
  closeAllTabs: () => void;
}

const DEFAULT_TAB: EditorTab = {
  id: "자기소개.md",
  name: "자기소개.md",
  language: "markdown",
  content: SELF_INTRO_CONTENT,
  isPreview: false,
};

export const useEditorStore = create<EditorState>()((set) => ({
  tabs: [DEFAULT_TAB],
  activeTabId: DEFAULT_TAB.id,
  expandedFolders: new Set<string>(),

  openFile: (node: FileNode) => {
    if (!node.content) return;

    set((state) => {
      const existing = state.tabs.find((t) => t.id === node.id);
      if (existing) {
        return { activeTabId: node.id };
      }

      const previewIdx = state.tabs.findIndex((t) => t.isPreview);
      const newTab: EditorTab = {
        id: node.id,
        name: node.name,
        language: node.language ?? "plaintext",
        content: node.content!,
        isPreview: true,
      };

      if (previewIdx >= 0) {
        const updatedTabs = [...state.tabs];
        updatedTabs[previewIdx] = newTab;
        return { tabs: updatedTabs, activeTabId: node.id };
      }

      return {
        tabs: [...state.tabs, newTab],
        activeTabId: node.id,
      };
    });
  },

  pinTab: (tabId: string) => {
    set((state) => ({
      tabs: state.tabs.map((t) =>
        t.id === tabId ? { ...t, isPreview: false } : t
      ),
    }));
  },

  closeTab: (tabId: string) => {
    set((state) => {
      const idx = state.tabs.findIndex((t) => t.id === tabId);
      if (idx === -1) return state;

      const updatedTabs = state.tabs.filter((t) => t.id !== tabId);
      let nextActiveId = state.activeTabId;

      if (state.activeTabId === tabId) {
        if (updatedTabs.length === 0) {
          nextActiveId = null;
        } else {
          const nextIdx = Math.min(idx, updatedTabs.length - 1);
          nextActiveId = updatedTabs[nextIdx].id;
        }
      }

      return { tabs: updatedTabs, activeTabId: nextActiveId };
    });
  },

  setActiveTab: (tabId: string) => {
    set({ activeTabId: tabId });
  },

  toggleFolder: (folderId: string) => {
    set((state) => {
      const next = new Set(state.expandedFolders);
      if (next.has(folderId)) {
        next.delete(folderId);
      } else {
        next.add(folderId);
      }
      return { expandedFolders: next };
    });
  },

  closeAllTabs: () => {
    set({ tabs: [], activeTabId: null });
  },
}));
