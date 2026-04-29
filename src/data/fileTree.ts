import { FileNode } from "@/types";
import SELF_INTRO_CONTENT from "./content/self_intro";
import {
  REHAB_CENTER_CONTENT,
  LITTLE_BANK_CONTENT,
  DEVHUB_CONTENT,
  BOARD_CONTENT,
  FYB_CONTENT,
} from "./content/projects";
import SKILLS_CONTENT from "./content/skills";
import CAREER_CONTENT from "./content/career";
import CERTIFICATE_CONTENT from "./content/certificate";

export const FILE_TREE: FileNode[] = [
  {
    id: "자기소개.md",
    name: "자기소개.md",
    type: "file",
    language: "markdown",
    content: SELF_INTRO_CONTENT,
  },
  {
    id: "career",
    name: "Career",
    type: "folder",
    children: [
      {
        id: "career/경력.md",
        name: "경력.md",
        type: "file",
        language: "markdown",
        content: CAREER_CONTENT,
      },
    ],
  },
  {
    id: "projects",
    name: "Projects",
    type: "folder",
    children: [
      {
        id: "projects/재활센터-홈페이지.md",
        name: "재활센터-홈페이지.md",
        type: "file",
        language: "markdown",
        content: REHAB_CENTER_CONTENT,
      },
      {
        id: "projects/리틀뱅크.md",
        name: "리틀뱅크.md",
        type: "file",
        language: "markdown",
        content: LITTLE_BANK_CONTENT,
      },
      {
        id: "projects/DEVHUB.md",
        name: "DEVHUB.md",
        type: "file",
        language: "markdown",
        content: DEVHUB_CONTENT,
      },
      {
        id: "projects/게시판.md",
        name: "게시판.md",
        type: "file",
        language: "markdown",
        content: BOARD_CONTENT,
      },
      {
        id: "projects/FYB.md",
        name: "FYB.md",
        type: "file",
        language: "markdown",
        content: FYB_CONTENT,
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
    id: "certificate",
    name: "Certificate",
    type: "folder",
    children: [
      {
        id: "certificate/자격증.md",
        name: "자격증.md",
        type: "file",
        language: "markdown",
        content: CERTIFICATE_CONTENT,
      },
    ],
  },
];

export const FLAT_FILES: FileNode[] = FILE_TREE.flatMap((node) =>
  node.type === "folder" ? (node.children ?? []) : [node]
);
