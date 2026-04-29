import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getFileExtension(filename: string): string {
  return filename.slice(filename.lastIndexOf(".") + 1).toLowerCase();
}

export function getLanguageFromFilename(filename: string): string {
  const ext = getFileExtension(filename);
  const map: Record<string, string> = {
    md: "markdown",
    ts: "typescript",
    tsx: "typescriptreact",
    js: "javascript",
    jsx: "javascriptreact",
    json: "json",
    css: "css",
    html: "html",
    py: "python",
    sh: "bash",
    yml: "yaml",
    yaml: "yaml",
  };
  return map[ext] ?? "plaintext";
}

export function getFileIconColor(language: string): string {
  const map: Record<string, string> = {
    markdown: "#8dc149",
    typescript: "#519aba",
    typescriptreact: "#519aba",
    javascript: "#e8c84d",
    javascriptreact: "#e8c84d",
    json: "#e37933",
    css: "#519aba",
    html: "#e37933",
    python: "#519aba",
    bash: "#8dc149",
    yaml: "#e37933",
  };
  return map[language] ?? "#858585";
}
