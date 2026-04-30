import { FileText, User, Briefcase, Layers, Award } from "lucide-react";
import { getFileIconColor } from "@/lib/utils";

interface FileIconEntry {
  icon: React.ElementType;
  color: string;
}

const FILE_ID_ICONS: Record<string, FileIconEntry> = {
  "자기소개.md": { icon: User, color: "#4ec9b0" },
  "career/플레이투게더(2025.04~재직중).md": { icon: Briefcase, color: "#e37933" },
  "skills/기술스택.md": { icon: Layers, color: "#519aba" },
  "certificate/자격증.md": { icon: Award, color: "#e5c07b" },
};

interface FileIconProps {
  id: string;
  language?: string;
  iconUrl?: string;
  size?: number;
}

export default function FileIcon({ id, language, iconUrl, size = 15 }: FileIconProps) {
  if (iconUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={iconUrl}
        alt=""
        width={size}
        height={size}
        className="shrink-0 object-contain"
        style={{ width: size, height: size }}
      />
    );
  }

  const entry = FILE_ID_ICONS[id];
  if (entry) {
    const Icon = entry.icon;
    return <Icon size={size} style={{ color: entry.color, flexShrink: 0 }} />;
  }

  const color = getFileIconColor(language ?? "plaintext");
  return <FileText size={size} style={{ color, flexShrink: 0 }} />;
}
