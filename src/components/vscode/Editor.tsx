"use client";

import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";
import "highlight.js/styles/github-dark-dimmed.css";
import { useEditorStore } from "@/store/editorStore";
import WelcomeTab from "./WelcomeTab";

// LineNumbers의 lineHeight와 반드시 일치해야 함
const LINE_HEIGHT_PX = 25.6; // 1.6rem at 16px base

interface LineNumbersProps {
  count: number;
}

function LineNumbers({ count }: LineNumbersProps) {
  return (
    <div
      className="select-none pt-4 pr-4 text-right pointer-events-none"
      aria-hidden="true"
    >
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i + 1}
          className="text-vs-text-muted font-mono"
          style={{ fontSize: "13px", lineHeight: `${LINE_HEIGHT_PX}px` }}
        >
          {i + 1}
        </div>
      ))}
    </div>
  );
}

export default function Editor() {
  const { tabs, activeTabId } = useEditorStore();
  const activeTab = tabs.find((t) => t.id === activeTabId);

  const contentRef = useRef<HTMLDivElement>(null);
  const [lineCount, setLineCount] = useState(0);

  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;

    const update = () => {
      setLineCount(Math.ceil(el.offsetHeight / LINE_HEIGHT_PX) + 1);
    };

    const ro = new ResizeObserver(update);
    ro.observe(el);
    update();

    return () => ro.disconnect();
  }, [activeTab?.id, activeTab?.content]);

  if (!activeTab) {
    return <WelcomeTab />;
  }

  return (
    <div className="relative flex-1 overflow-y-auto overflow-x-hidden bg-vs-bg">
      {/* absolute 배치로 스크롤 높이에 영향 없음 */}
      <div
        className="absolute top-0 left-0"
        style={{ width: "3rem" }}
      >
        <LineNumbers count={lineCount} />
      </div>

      {/* 콘텐츠가 스크롤 높이를 결정 — 실제 높이 측정 기준점 */}
      <div key={activeTab.id} ref={contentRef} className="pt-4 pb-16 pr-8 overflow-x-hidden editor-fade-in" style={{ paddingLeft: "3.5rem" }}>
        <div className="md-content max-w-none">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw, rehypeHighlight]}
            components={{
              h1: ({ children }) => <h1>{children}</h1>,
              h2: ({ children }) => <h2>{children}</h2>,
              h3: ({ children }) => <h3>{children}</h3>,
              a: ({ href, children }) => (
                <a href={href} target="_blank" rel="noopener noreferrer">
                  {children}
                </a>
              ),
              table: ({ children }) => (
                <div className="overflow-x-auto mb-4">
                  <table>{children}</table>
                </div>
              ),
            }}
          >
            {activeTab.content}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
