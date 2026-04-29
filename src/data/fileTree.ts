import { FileNode } from "@/types";
import INTRODUCE_CONTENT from "./content/introduce";
import {
  E_COMMERCE_CONTENT,
  CHAT_APP_CONTENT,
  TASK_MANAGER_CONTENT,
  PORTFOLIO_CONTENT,
} from "./content/projects";
import SKILLS_CONTENT from "./content/skills";
import EXPERIENCE_CONTENT from "./content/experience";
import CONTACT_CONTENT from "./content/contact";

export const FILE_TREE: FileNode[] = [
  {
    id: "introduce",
    name: "Introduce",
    type: "folder",
    children: [
      {
        id: "introduce/소개.md",
        name: "소개.md",
        type: "file",
        language: "markdown",
        content: INTRODUCE_CONTENT,
      },
    ],
  },
  {
    id: "projects",
    name: "Projects",
    type: "folder",
    children: [
      {
        id: "projects/E-Commerce.md",
        name: "E-Commerce.md",
        type: "file",
        language: "markdown",
        content: E_COMMERCE_CONTENT,
      },
      {
        id: "projects/Chat-App.md",
        name: "Chat-App.md",
        type: "file",
        language: "markdown",
        content: CHAT_APP_CONTENT,
      },
      {
        id: "projects/Task-Manager.md",
        name: "Task-Manager.md",
        type: "file",
        language: "markdown",
        content: TASK_MANAGER_CONTENT,
      },
      {
        id: "projects/Portfolio-v2.md",
        name: "Portfolio-v2.md",
        type: "file",
        language: "markdown",
        content: PORTFOLIO_CONTENT,
      },
    ],
  },
  {
    id: "skills",
    name: "Skills",
    type: "folder",
    children: [
      {
        id: "skills/기술스택.md",
        name: "기술스택.md",
        type: "file",
        language: "markdown",
        content: SKILLS_CONTENT,
      },
    ],
  },
  {
    id: "experience",
    name: "Experience",
    type: "folder",
    children: [
      {
        id: "experience/경력.md",
        name: "경력.md",
        type: "file",
        language: "markdown",
        content: EXPERIENCE_CONTENT,
      },
    ],
  },
  {
    id: "contact",
    name: "Contact",
    type: "folder",
    children: [
      {
        id: "contact/연락처.md",
        name: "연락처.md",
        type: "file",
        language: "markdown",
        content: CONTACT_CONTENT,
      },
    ],
  },
];

export const FLAT_FILES: FileNode[] = FILE_TREE.flatMap(
  (folder) => folder.children ?? []
);
