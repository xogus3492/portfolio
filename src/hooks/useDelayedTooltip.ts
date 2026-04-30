"use client";

import { useRef, useState } from "react";

interface TooltipState {
  visible: boolean;
  top: number;
  left: number;
}

export function useDelayedTooltip(delayMs = 1000) {
  const [tooltip, setTooltip] = useState<TooltipState>({ visible: false, top: 0, left: 0 });
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const targetRef = useRef<HTMLElement | null>(null);

  const onMouseEnter = (e: React.MouseEvent<HTMLElement>) => {
    targetRef.current = e.currentTarget;
    timerRef.current = setTimeout(() => {
      if (targetRef.current) {
        const rect = targetRef.current.getBoundingClientRect();
        setTooltip({ visible: true, top: rect.bottom + 4, left: rect.left });
      }
    }, delayMs);
  };

  const onMouseLeave = () => {
    clearTimeout(timerRef.current);
    setTooltip((prev) => ({ ...prev, visible: false }));
  };

  return { tooltip, onMouseEnter, onMouseLeave };
}
