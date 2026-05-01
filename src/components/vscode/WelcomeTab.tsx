"use client";

import { useEffect, useState } from "react";
import { Languages } from "lucide-react";
import { useEditorStore } from "@/store/editorStore";
import { useUIStore } from "@/store/uiStore";
import { FLAT_FILES } from "@/data/fileTree";
import { FileNode } from "@/types";
import FileIcon from "./FileIcon";

const TYPING_TEXTS = {
  ko: "한 번 빠지면 시간 가는 줄 모르는, 개발이란 저에게 그런 존재입니다.",
  en: "Once I get into it, I lose track of time — that's what development means to me.",
};

function TypingAnimation({ language }: { language: "ko" | "en" }) {
  const text = TYPING_TEXTS[language];
  const [displayed, setDisplayed] = useState("");
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    setDisplayed("");
    let i = 0;
    const typingInterval = setInterval(() => {
      if (i < text.length) {
        setDisplayed(text.slice(0, i + 1));
        i++;
      } else {
        clearInterval(typingInterval);
      }
    }, 45);

    const cursorInterval = setInterval(() => {
      setShowCursor((v) => !v);
    }, 500);

    return () => {
      clearInterval(typingInterval);
      clearInterval(cursorInterval);
    };
  }, [text]);

  return (
    <p className="text-vs-text-muted text-base font-mono">
      {displayed}
      <span className={showCursor ? "opacity-100" : "opacity-0"}>|</span>
    </p>
  );
}

interface QuickLinkProps {
  node: FileNode;
}

function QuickLink({ node }: QuickLinkProps) {
  const { openFile } = useEditorStore();

  const parts = node.id.split("/");
  const folderName = parts.length > 1 ? parts[0] : null;

  return (
    <button
      onClick={() => openFile(node)}
      className="flex items-center gap-2 px-3 py-1.5 rounded text-sm hover:bg-vs-hover transition-colors cursor-pointer w-full text-left"
    >
      <FileIcon id={node.id} language={node.language} iconUrl={node.iconUrl} size={14} />
      <span className="flex items-center gap-1 min-w-0">
        {folderName && (
          <>
            <span className="text-vs-text-muted truncate">{folderName}</span>
            <span className="text-vs-text-dim">/</span>
          </>
        )}
        <span className="text-vs-link truncate">{node.name}</span>
      </span>
    </button>
  );
}

const ABOUT_TEXT = {
  ko: {
    career: "현대백화점 플랫폼 개발 (재직중)",
    sidebarToggle: "사이드바 토글",
    closeTab: "탭 닫기",
    doubleClick: "파일을 더블클릭하면 탭이 고정됩니다.",
  },
  en: {
    career: "Hyundai Dept. Store Platform Dev (Employed)",
    sidebarToggle: "Toggle Sidebar",
    closeTab: "Close Tab",
    doubleClick: "Double-click a file to pin the tab.",
  },
};

export default function WelcomeTab() {
  const allFiles = FLAT_FILES;
  const { language, toggleLanguage } = useUIStore();
  const t = ABOUT_TEXT[language];

  return (
    <div className="relative flex items-start justify-center w-full h-full overflow-y-auto bg-vs-bg p-8 md:p-16 editor-fade-in">
      <button
        onClick={toggleLanguage}
        title="Toggle language"
        className="absolute top-4 right-4 flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold text-vs-text-muted hover:text-vs-text hover:bg-vs-hover transition-colors cursor-pointer"
      >
        <Languages size={13} />
        <span>{language === "ko" ? "KO" : "EN"}</span>
      </button>

      <div className="w-full max-w-2xl">
        <div className="mb-12">
          <pre className="text-vs-accent text-xs leading-tight font-mono mb-6 hidden sm:block">
{`████████╗ █████╗ ███████╗██╗  ██╗██╗   ██╗███████╗ ██████╗ ███╗   ██╗
╚══██╔══╝██╔══██╗██╔════╝██║  ██║╚██╗ ██╔╝██╔════╝██╔═══██╗████╗  ██║
   ██║   ███████║█████╗  ███████║ ╚████╔╝ █████╗  ██║   ██║██╔██╗ ██║
   ██║   ██╔══██║██╔══╝  ██╔══██║  ╚██╔╝  ██╔══╝  ██║   ██║██║╚██╗██║
   ██║   ██║  ██║███████╗██║  ██║   ██║   ███████╗╚██████╔╝██║ ╚████║
   ╚═╝   ╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝   ╚═╝   ╚══════╝ ╚═════╝ ╚═╝  ╚═══╝`}
          </pre>

          <h1 className="text-3xl font-bold text-vs-text-active mb-2">
            장태현{" "}
            <span className="text-vs-text-muted font-normal text-2xl">
              (Jang Taehyeon)
            </span>
          </h1>

          <TypingAnimation language={language} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          <div>
            <h2 className="text-xs text-vs-text-muted uppercase tracking-widest mb-3 font-semibold">
              Start
            </h2>
            <div className="flex flex-col gap-0.5">
              {allFiles.map((file) => (
                <QuickLink key={file.id} node={file} />
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-xs text-vs-text-muted uppercase tracking-widest mb-3 font-semibold">
              About
            </h2>
            <div className="space-y-2 text-sm text-vs-text">
              <p>
                <span className="text-vs-accent">{">"}</span>{" "}
                Software Engineer
              </p>
              <p>
                <span className="text-vs-accent">{">"}</span>{" "}
                Spring Boot · JPA · MySQL · Redis
              </p>
              <p>
                <span className="text-vs-accent">{">"}</span>{" "}
                Seoul, South Korea
              </p>
              <p>
                <span className="text-vs-accent">{">"}</span>{" "}
                {t.career}
              </p>
            </div>

            <div className="mt-6">
              <h2 className="text-xs text-vs-text-muted uppercase tracking-widest mb-3 font-semibold">
                Tips
              </h2>
              <div className="space-y-1 text-xs text-vs-text-muted">
                <p>
                  <kbd className="bg-vs-active px-1 rounded text-vs-text">Ctrl+B</kbd>
                  {" / "}
                  <kbd className="bg-vs-active px-1 rounded text-vs-text">⌘B</kbd>
                  {" "}{t.sidebarToggle}
                </p>
                <p>
                  <kbd className="bg-vs-active px-1 rounded text-vs-text">Alt+W</kbd>
                  {" / "}
                  <kbd className="bg-vs-active px-1 rounded text-vs-text">⌥W</kbd>
                  {" "}{t.closeTab}
                </p>
                <p>{t.doubleClick}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

