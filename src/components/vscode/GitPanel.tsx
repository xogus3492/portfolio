"use client";

import { useEffect, useState } from "react";
import { GitCommit, GitBranch, Loader2, AlertCircle } from "lucide-react";

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
    <div className="flex flex-col h-full">
      {/* 브랜치 정보 */}
      <div className="flex items-center gap-1.5 px-3 py-2 border-b border-vs-border-subtle shrink-0">
        <GitBranch size={13} className="text-vs-text-muted shrink-0" />
        <span className="text-xs text-vs-text-muted font-mono">main</span>
        <span className="ml-auto text-xs text-vs-text-dim">
          {commits.length > 0 && `${commits.length} commits`}
        </span>
      </div>

      {/* 커밋 목록 */}
      <div className="flex-1 overflow-y-auto">
        {loading && (
          <div className="flex items-center gap-2 px-4 py-6 text-vs-text-muted text-xs">
            <Loader2 size={13} className="animate-spin" />
            <span>커밋 히스토리 불러오는 중...</span>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 px-4 py-6 text-vs-text-muted text-xs">
            <AlertCircle size={13} />
            <span>불러오기 실패. GitHub API 한도를 확인하세요.</span>
          </div>
        )}

        {!loading && !error && commits.map((commit) => (
          <div
            key={commit.sha}
            className="flex items-start gap-2 px-3 py-2 hover:bg-vs-hover transition-colors border-b border-vs-border-subtle group"
          >
            <GitCommit size={13} className="text-vs-text-dim shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-vs-text truncate leading-snug">
                {commit.message}
              </p>
              <p className="text-xs text-vs-text-muted mt-0.5">
                {commit.author}
                <span className="text-vs-text-dim mx-1">·</span>
                {relativeTime(commit.date)}
              </p>
            </div>
            <span className="text-xs font-mono text-vs-text-dim shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
              {commit.sha}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
