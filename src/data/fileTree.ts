import { FileNode } from "@/types";
import INTRODUCE_CONTENT from "./content/introduce";
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
