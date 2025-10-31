import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export type VerticalTimelineScrollbarProps = {
  // Total content height (px) – e.g., total track area
  contentHeight: number;
  // Visible viewport height (px)
  viewportHeight: number;
  // Current vertical scroll (px)
  scrollY: number;
  // Change handler
  onScrollYChange: (next: number) => void;
  className?: string;
  minHandlePx?: number;
};

/**
 * Custom vertical scrollbar for track/layer navigation (Premiere-like).
 * - Draggable viewport handle
 * - Supports wheel and keyboard (Up/Down/Page/Home/End)
 */
export const VerticalTimelineScrollbar: React.FC<VerticalTimelineScrollbarProps> = ({
  contentHeight,
  viewportHeight,
  scrollY,
  onScrollYChange,
  className,
  minHandlePx = 24,
}) => {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [trackHeight, setTrackHeight] = useState(0);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setTrackHeight(el.clientHeight));
    ro.observe(el);
    setTrackHeight(el.clientHeight);
    return () => ro.disconnect();
  }, []);

  const maxScrollY = Math.max(0, contentHeight - viewportHeight);
  const visibleRatio = contentHeight > 0 ? Math.min(1, Math.max(0, viewportHeight / contentHeight)) : 1;

  const handleHeight = useMemo(() => {
    const h = Math.floor(visibleRatio * trackHeight);
    return Math.max(minHandlePx, Math.min(trackHeight, h));
  }, [visibleRatio, trackHeight, minHandlePx]);

  const maxHandleTop = Math.max(0, trackHeight - handleHeight);

  const handleTop = useMemo(() => {
    if (maxScrollY === 0 || maxHandleTop === 0) return 0;
    const ratio = scrollY / maxScrollY;
    return Math.min(maxHandleTop, Math.max(0, ratio * maxHandleTop));
  }, [scrollY, maxScrollY, maxHandleTop]);

  const toScrollY = useCallback(
    (nextHandleTop: number) => {
      if (maxHandleTop === 0) return 0;
      const ratio = nextHandleTop / maxHandleTop;
      const nextScroll = ratio * maxScrollY;
      return Math.min(maxScrollY, Math.max(0, nextScroll));
    },
    [maxHandleTop, maxScrollY]
  );

  // Drag handling
  const dragState = useRef<{ startY: number; startTop: number } | null>(null);

  const onPointerDown = (e: React.PointerEvent) => {
    if (!(e.target as HTMLElement).closest("[data-role='handle']")) return;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    dragState.current = { startY: e.clientY, startTop: handleTop };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragState.current) return;
    const dy = e.clientY - dragState.current.startY;
    const nextTop = Math.min(maxHandleTop, Math.max(0, dragState.current.startTop + dy));
    onScrollYChange(toScrollY(nextTop));
  };

  const onPointerUp = (e: React.PointerEvent) => {
    if (dragState.current) {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      dragState.current = null;
    }
  };

  // Wheel handling (vertical only)
  const onWheel = (e: React.WheelEvent) => {
    if (maxScrollY === 0) return;
    const delta = Math.abs(e.deltaY) > 0 ? e.deltaY : e.deltaX; // prefer vertical
    if (delta === 0) return;
    e.preventDefault();
    const speed = 1.2;
    const next = Math.min(maxScrollY, Math.max(0, scrollY + delta * speed));
    onScrollYChange(next);
  };

  // Keyboard support
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (maxScrollY === 0) return;
    let next = scrollY;
    const small = Math.max(24, viewportHeight * 0.1);
    const big = Math.max(48, viewportHeight * 0.8);
    switch (e.key) {
      case "ArrowUp":
        next = Math.max(0, scrollY - small);
        break;
      case "ArrowDown":
        next = Math.min(maxScrollY, scrollY + small);
        break;
      case "PageUp":
        next = Math.max(0, scrollY - big);
        break;
      case "PageDown":
        next = Math.min(maxScrollY, scrollY + big);
        break;
      case "Home":
        next = 0;
        break;
      case "End":
        next = maxScrollY;
        break;
      default:
        return;
    }
    e.preventDefault();
    onScrollYChange(next);
  };

  const disabled = maxScrollY === 0 || trackHeight === 0;

  return (
    <div
      ref={trackRef}
      role="scrollbar"
      aria-orientation="vertical"
      aria-valuemin={0}
      aria-valuemax={maxScrollY}
      aria-valuenow={scrollY}
      tabIndex={0}
      onKeyDown={onKeyDown}
      onWheel={onWheel}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      className={cn(
        "w-3 h-full bg-panel-dark/80 border-l border-border relative select-none",
        disabled && "opacity-60",
        className
      )}
    >
      {/* Track accent */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-primary/5 to-transparent pointer-events-none" />

      {/* Handle */}
      <motion.div
        data-role="handle"
        className={cn(
          "absolute left-0 right-0 rounded-sm border border-primary/50 bg-primary/40",
          "hover:bg-primary/50 active:bg-primary/60 transition-colors",
          "cursor-grab active:cursor-grabbing focus:outline-none"
        )}
        style={{ top: handleTop, height: handleHeight }}
        layout
        transition={{ type: "spring", stiffness: 350, damping: 35 }}
        aria-label="Timeline vertical viewport"
      />
    </div>
  );
};
