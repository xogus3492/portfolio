"use client";

import { useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark-dimmed.css";
import { useEditorStore } from "@/store/editorStore";
import WelcomeTab from "./WelcomeTab";

interface LineNumbersProps {
  count: number;
}

function LineNumbers({ count }: LineNumbersProps) {
  return (
    <div
      className="select-none shrink-0 pt-4 pb-4 pr-4 text-right"
      style={{ minWidth: "3rem", width: "3rem" }}
      aria-hidden="true"
    >
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i + 1}
          className="text-vs-text-muted text-sm leading-relaxed font-mono"
          style={{ fontSize: "13px", lineHeight: "1.6rem" }}
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

  const lineCount = useMemo(() => {
    if (!activeTab?.content) return 0;
    return activeTab.content.split("\n").length;
  }, [activeTab?.content]);

  if (!activeTab) {
    return <WelcomeTab />;
  }

  return (
    <div className="relative flex-1 overflow-y-auto overflow-x-hidden bg-vs-bg">
      {/* absolute로 배치해 레이아웃 높이에 영향을 주지 않음 */}
      <div
        className="absolute top-0 left-0 pt-4 pr-4 text-right select-none pointer-events-none"
        style={{ width: "3rem" }}
        aria-hidden="true"
      >
        <LineNumbers count={lineCount} />
      </div>

      {/* 콘텐츠가 스크롤 높이를 결정 */}
      <div className="pt-4 pb-16 pr-8 overflow-x-hidden" style={{ paddingLeft: "3.5rem" }}>
        <div className="md-content max-w-none">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeHighlight]}
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
