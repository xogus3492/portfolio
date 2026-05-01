"use client";

import { useEffect, useState } from "react";
import {
  ChevronDown,
  Check,
  RefreshCw,
  MoreHorizontal,
  Sparkles,
  GitBranch,
  Target,
  ArrowDown,
  ArrowUp,
  Loader2,
  AlertCircle,
  FileText,
  Plus,
} from "lucide-react";

interface ChangedFile {
  name: string;
  path: string;
  status: "M" | "A" | "D" | "U";
}

const CHANGED_FILES: ChangedFile[] = [
  { name: "자기소개.md",   path: "src/data/content",      status: "M" },
  { name: "리틀뱅크.md",   path: "src/data/content/projects", status: "M" },
  { name: "DEVHUB.md",    path: "src/data/content/projects", status: "M" },
];

const STATUS_COLOR: Record<string, string> = {
  M: "#e2c08d",
  A: "#73c991",
  D: "#f44747",
  U: "#73c991",
};

interface Commit {
  sha: string;
  message: string;
  author: string;
  date: string;
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 60) return `${min}분 전`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}시간 전`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day}일 전`;
  const week = Math.floor(day / 7);
  if (week < 5) return `${week}주 전`;
  const d = new Date(iso);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}

const ROW_H = 26;
const LINE_COLOR = "#4fc1ff";

function GraphCell({
  type,
  isLast = false,
}: {
  type: "outgoing" | "head" | "commit";
  isLast?: boolean;
}) {
  const nodeSize = type === "commit" ? 8 : 12;
  const halfNode = nodeSize / 2;
  const cellW = 20;
  const cx = cellW / 2;

  return (
    <svg
      width={cellW}
      height={ROW_H}
      viewBox={`0 0 ${cellW} ${ROW_H}`}
      className="shrink-0"
    >
      {/* 위쪽 연결선 */}
      <line
        x1={cx}
        y1={0}
        x2={cx}
        y2={ROW_H / 2 - halfNode - 1}
        stroke={LINE_COLOR}
        strokeWidth={1.5}
        strokeOpacity={0.55}
      />
      {/* 아래쪽 연결선 */}
      {!isLast && (
        <line
          x1={cx}
          y1={ROW_H / 2 + halfNode + 1}
          x2={cx}
          y2={ROW_H}
          stroke={LINE_COLOR}
          strokeWidth={1.5}
          strokeOpacity={0.55}
        />
      )}
      {/* 노드 */}
      {type === "outgoing" && (
        <circle
          cx={cx}
          cy={ROW_H / 2}
          r={5}
          fill="none"
          stroke={LINE_COLOR}
          strokeWidth={1.5}
          strokeDasharray="2.5 1.8"
        />
      )}
      {type === "head" && (
        <>
          <circle
            cx={cx}
            cy={ROW_H / 2}
            r={5}
            fill="none"
            stroke={LINE_COLOR}
            strokeWidth={1.5}
          />
          <circle cx={cx} cy={ROW_H / 2} r={2.5} fill={LINE_COLOR} />
        </>
      )}
      {type === "commit" && (
        <circle cx={cx} cy={ROW_H / 2} r={4} fill={LINE_COLOR} />
      )}
    </svg>
  );
}

function SectionHeader({
  label,
  children,
}: {
  label: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex items-center h-7 px-2 shrink-0 group hover:bg-vs-hover transition-colors">
      <ChevronDown size={13} className="text-vs-text-muted mr-1 shrink-0" />
      <span className="text-[11px] text-vs-text-muted font-semibold tracking-widest uppercase flex-1">
        {label}
      </span>
      <div className="flex items-center gap-px opacity-0 group-hover:opacity-100 transition-opacity">
        {children}
      </div>
    </div>
  );
}

function IconBtn({ children, title }: { children: React.ReactNode; title?: string }) {
  return (
    <button
      title={title}
      className="p-1 rounded hover:bg-vs-active text-vs-text-muted hover:text-vs-text-active transition-colors"
    >
      {children}
    </button>
  );
}

export default function GitPanel() {
  const [commits, setCommits] = useState<Commit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch("https://api.github.com/repos/xogus3492/portfolio/commits?per_page=50")
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then((data) => {
        setCommits(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          data.map((c: any) => ({
            sha: c.sha.slice(0, 7),
            message: c.commit.message.split("\n")[0],
            author: c.commit.author.name,
            date: c.commit.author.date,
          }))
        );
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col h-full text-xs select-none">
      {/* ── 변경 내용 ── */}
      <div className="shrink-0">
        <SectionHeader label="변경 내용">
          <IconBtn title="커밋"><Check size={13} /></IconBtn>
          <IconBtn title="새로고침"><RefreshCw size={13} /></IconBtn>
          <IconBtn><MoreHorizontal size={13} /></IconBtn>
        </SectionHeader>

        <div className="px-2 pb-1.5">
          <div className="flex items-center gap-2 bg-vs-input border border-vs-border rounded px-2 py-1.5">
            <span className="text-vs-text-dim flex-1 truncate text-[11px]">
              메시지(⌘Enter(으)로 &quot;main&quot;에 커밋)
            </span>
            <Sparkles size={11} className="text-vs-text-dim shrink-0" />
          </div>
        </div>

        <div className="px-2 pb-1.5">
          <button className="w-full flex items-center justify-center gap-1.5 bg-vs-accent hover:bg-vs-accent-hover text-white rounded py-1 transition-colors text-[12px]">
            <Check size={12} />
            커밋
          </button>
        </div>

        {/* 변경 파일 영역 */}
        <div className="border-t border-vs-border-subtle">
          <div className="flex items-center h-6 px-2 group hover:bg-vs-hover transition-colors">
            <ChevronDown size={12} className="text-vs-text-muted mr-1 shrink-0" />
            <span className="text-[11px] text-vs-text-muted font-semibold tracking-widest uppercase flex-1">
              변경 사항
            </span>
            <div className="flex items-center gap-px opacity-0 group-hover:opacity-100 transition-opacity">
              <IconBtn title="모두 스테이지"><Plus size={12} /></IconBtn>
              <IconBtn title="모두 되돌리기"><RefreshCw size={11} /></IconBtn>
            </div>
          </div>
          {CHANGED_FILES.map((file) => (
            <div
              key={file.name}
              className="flex items-center gap-1.5 px-3 py-0.5 hover:bg-vs-hover transition-colors group h-[22px]"
            >
              <FileText size={12} className="text-vs-text-dim shrink-0" />
              <span className="text-[11px] text-vs-text truncate flex-1">{file.name}</span>
              <span className="text-[10px] text-vs-text-dim truncate opacity-0 group-hover:opacity-100 transition-opacity">
                {file.path}
              </span>
              <span
                className="text-[11px] font-semibold shrink-0 ml-1 w-3 text-center"
                style={{ color: STATUS_COLOR[file.status] }}
              >
                {file.status}
              </span>
            </div>
          ))}
          <div className="h-3" />
        </div>
      </div>

      {/* ── 그래프 ── */}
      <div className="flex flex-col flex-1 overflow-hidden border-t border-vs-border-subtle">
        <SectionHeader label="그래프">
          <IconBtn title="자동">
            <span className="flex items-center gap-px text-[10px]">
              <GitBranch size={11} />자동
            </span>
          </IconBtn>
          <IconBtn title="HEAD로 이동"><Target size={11} /></IconBtn>
          <IconBtn title="Pull"><ArrowDown size={11} /></IconBtn>
          <IconBtn title="Fetch"><ArrowUp size={11} /></IconBtn>
          <IconBtn title="새로고침"><RefreshCw size={11} /></IconBtn>
          <IconBtn><MoreHorizontal size={11} /></IconBtn>
        </SectionHeader>

        <div className="flex-1 overflow-y-auto">
          {loading && (
            <div className="flex items-center gap-2 px-4 py-6 text-vs-text-muted text-[11px]">
              <Loader2 size={13} className="animate-spin" />
              <span>커밋 히스토리 불러오는 중...</span>
            </div>
          )}
          {error && (
            <div className="flex items-center gap-2 px-4 py-6 text-vs-text-muted text-[11px]">
              <AlertCircle size={13} />
              <span>불러오기 실패. GitHub API 한도를 확인하세요.</span>
            </div>
          )}

          {!loading && !error && (
            <>
              {/* 발신 변경 내용 */}
              <div
                className="flex items-center gap-1.5 px-2 hover:bg-vs-hover transition-colors"
                style={{ height: ROW_H }}
              >
                <GraphCell type="outgoing" />
                <span className="flex-1 text-vs-text-muted text-[11px]">발신 변경 내용</span>
                <span className="text-vs-text-dim font-mono text-[10px]">main</span>
              </div>

              {/* 커밋 목록 */}
              {commits.map((commit, index) => {
                const isHead = index === 0;
                const isLast = index === commits.length - 1;
                return (
                  <div
                    key={commit.sha}
                    className="flex items-center gap-1.5 px-2 hover:bg-vs-hover transition-colors group"
                    style={{ height: ROW_H }}
                  >
                    <GraphCell
                      type={isHead ? "head" : "commit"}
                      isLast={isLast}
                    />

                    <p className="flex-1 min-w-0 text-vs-text truncate text-[11px] leading-none">
                      {commit.message}
                    </p>

                    {isHead ? (
                      <span
                        className="shrink-0 text-[10px] font-medium rounded px-1 py-0.5 border"
                        style={{
                          background: "rgba(79,193,255,0.15)",
                          borderColor: "rgba(79,193,255,0.4)",
                          color: "#4fc1ff",
                        }}
                      >
                        ⊕ main
                      </span>
                    ) : (
                      <span className="shrink-0 text-vs-text-dim text-[10px] opacity-0 group-hover:opacity-100 transition-opacity font-mono">
                        {commit.sha}
                      </span>
                    )}
                  </div>
                );
              })}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
