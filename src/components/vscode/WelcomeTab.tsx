"use client";

import { useEffect, useState } from "react";
import { FileText } from "lucide-react";
import { useEditorStore } from "@/store/editorStore";
import { FLAT_FILES } from "@/data/fileTree";
import { FileNode } from "@/types";
import { getFileIconColor } from "@/lib/utils";

const TYPING_TEXT =
  "한 번 빠지면 시간 가는 줄 모르는, 개발이란 저에게 그런 존재입니다.";

function TypingAnimation() {
  const [displayed, setDisplayed] = useState("");
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    let i = 0;
    const typingInterval = setInterval(() => {
      if (i < TYPING_TEXT.length) {
        setDisplayed(TYPING_TEXT.slice(0, i + 1));
        i++;
      } else {
        clearInterval(typingInterval);
      }
    }, 55);

    const cursorInterval = setInterval(() => {
      setShowCursor((v) => !v);
    }, 500);

    return () => {
      clearInterval(typingInterval);
      clearInterval(cursorInterval);
    };
  }, []);

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
  const iconColor = getFileIconColor(node.language ?? "plaintext");

  return (
    <button
      onClick={() => openFile(node)}
      className="flex items-center gap-2 px-3 py-1.5 rounded text-sm text-vs-link hover:text-vs-text-active hover:bg-vs-hover transition-colors cursor-pointer"
    >
      <FileText size={14} style={{ color: iconColor }} />
      <span>{node.name}</span>
    </button>
  );
}

export default function WelcomeTab() {
  const allFiles = FLAT_FILES;

  return (
    <div className="flex items-start justify-center w-full h-full overflow-y-auto bg-vs-bg p-8 md:p-16">
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

          <TypingAnimation />
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
                Back-end Engineer
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
                현대백화점 플랫폼 개발 (재직중)
              </p>
            </div>

            <div className="mt-6">
              <h2 className="text-xs text-vs-text-muted uppercase tracking-widest mb-3 font-semibold">
                Tips
              </h2>
              <div className="space-y-1 text-xs text-vs-text-muted">
                <p>
                  <kbd className="bg-vs-active px-1 rounded text-vs-text">
                    Ctrl+B
                  </kbd>{" "}
                  사이드바 토글
                </p>
                <p>
                  <kbd className="bg-vs-active px-1 rounded text-vs-text">
                    Ctrl+W
                  </kbd>{" "}
                  탭 닫기
                </p>
                <p>파일을 더블클릭하면 탭이 고정됩니다.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
