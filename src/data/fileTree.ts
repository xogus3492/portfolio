import { FileNode } from "@/types";
import SELF_INTRO_CONTENT, { SELF_INTRO_CONTENT_EN } from "./content/self_intro";
import {
  RUNDOMMATE_CONTENT,
  RUNDOMMATE_CONTENT_EN,
  REHAB_CENTER_CONTENT,
  REHAB_CENTER_CONTENT_EN,
  LITTLE_BANK_CONTENT,
  LITTLE_BANK_CONTENT_EN,
  DEVHUB_CONTENT,
  DEVHUB_CONTENT_EN,
  BOARD_CONTENT,
  BOARD_CONTENT_EN,
  FYB_CONTENT,
  FYB_CONTENT_EN,
} from "./content/projects";
import SKILLS_CONTENT, { SKILLS_CONTENT_EN } from "./content/skills";
import CAREER_CONTENT, { CAREER_CONTENT_EN } from "./content/career";
import CERTIFICATE_CONTENT, { CERTIFICATE_CONTENT_EN } from "./content/certificate";

export const FILE_TREE: FileNode[] = [
  {
    id: "자기소개.md",
    name: "자기소개.md",
    nameEn: "self-intro.md",
    type: "file",
    language: "markdown",
    content: SELF_INTRO_CONTENT,
    contentEn: SELF_INTRO_CONTENT_EN,
  },
  {
    id: "career",
    name: "Career",
    type: "folder",
    children: [
      {
        id: "career/플레이투게더(25.04~재직중).md",
        name: "플레이투게더(25.04~재직중).md",
        nameEn: "플레이투게더(25.04~present).md",
        type: "file",
        language: "markdown",
        content: CAREER_CONTENT,
        contentEn: CAREER_CONTENT_EN,
      },
    ],
  },
  {
    id: "projects",
    name: "Projects",
    type: "folder",
    children: [
      {
        id: "projects/런덤메이트.md",
        name: "런덤메이트.md",
        type: "file",
        language: "markdown",
        content: RUNDOMMATE_CONTENT,
        contentEn: RUNDOMMATE_CONTENT_EN,
        iconUrl: "/icons/rdm-icon.png",
      },
      {
        id: "projects/리틀뱅크.md",
        name: "리틀뱅크.md",
        type: "file",
        language: "markdown",
        content: LITTLE_BANK_CONTENT,
        contentEn: LITTLE_BANK_CONTENT_EN,
        iconUrl: "/icons/littlebank-icon.png",
      },
      {
        id: "projects/DEVHUB.md",
        name: "DEVHUB.md",
        type: "file",
        language: "markdown",
        content: DEVHUB_CONTENT,
        contentEn: DEVHUB_CONTENT_EN,
        iconUrl: "/icons/devhub-icon.png",
      },
      {
        id: "projects/재활센터-홈페이지.md",
        name: "재활센터-홈페이지.md",
        type: "file",
        language: "markdown",
        content: REHAB_CENTER_CONTENT,
        contentEn: REHAB_CENTER_CONTENT_EN,
        iconUrl: "/icons/house-icon.png",
      },
      {
        id: "projects/게시판.md",
        name: "게시판.md",
        type: "file",
        language: "markdown",
        content: BOARD_CONTENT,
        contentEn: BOARD_CONTENT_EN,
        iconUrl: "/icons/board-icon.png",
      },
      {
        id: "projects/FYB.md",
        name: "FYB.md",
        type: "file",
        language: "markdown",
        content: FYB_CONTENT,
        contentEn: FYB_CONTENT_EN,
        iconUrl: "/icons/fyb-icon.png",
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
        nameEn: "skills.md",
        type: "file",
        language: "markdown",
        content: SKILLS_CONTENT,
        contentEn: SKILLS_CONTENT_EN,
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
        nameEn: "certificate.md",
        type: "file",
        language: "markdown",
        content: CERTIFICATE_CONTENT,
        contentEn: CERTIFICATE_CONTENT_EN,
      },
    ],
  },
];

export const FLAT_FILES: FileNode[] = FILE_TREE.flatMap((node) =>
  node.type === "folder" ? (node.children ?? []) : [node]
);
