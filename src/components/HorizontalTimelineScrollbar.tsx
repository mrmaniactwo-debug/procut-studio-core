import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export type HorizontalTimelineScrollbarProps = {
  // Total timeline content width in px
  contentWidth: number;
  // Currently visible viewport width in px
  viewportWidth: number;
  // Current horizontal scroll offset in px
  scrollX: number;
  // Change handler for horizontal scroll (px)
  onScrollXChange: (next: number) => void;
  // Optional zoom level, for styling/animations
  zoomLevel?: number;
  className?: string;
  // Minimum handle pixel width for usability
  minHandlePx?: number;
};

/**
 * Custom horizontal scrollbar for the Timeline (Premiere-like).
 * - Shows overview bar with draggable viewport handle
 * - Supports drag, wheel, and keyboard (Left/Right/Page/Home/End)
 * - Fully controlled via scrollX/contentWidth/viewportWidth
 */
export const HorizontalTimelineScrollbar: React.FC<HorizontalTimelineScrollbarProps> = ({
  contentWidth,
  viewportWidth,
  scrollX,
  onScrollXChange,
  zoomLevel,
  className,
  minHandlePx = 24,
}) => {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [trackWidth, setTrackWidth] = useState(0);

  // Track Resize Observer
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setTrackWidth(el.clientWidth));
    ro.observe(el);
    setTrackWidth(el.clientWidth);
    return () => ro.disconnect();
  }, []);

  const maxScrollX = Math.max(0, contentWidth - viewportWidth);
  const visibleRatio = contentWidth > 0 ? Math.min(1, Math.max(0, viewportWidth / contentWidth)) : 1;

  const handleWidth = useMemo(() => {
    const w = Math.floor(visibleRatio * trackWidth);
    return Math.max(minHandlePx, Math.min(trackWidth, w));
  }, [visibleRatio, trackWidth, minHandlePx]);

  const maxHandleLeft = Math.max(0, trackWidth - handleWidth);

  const handleLeft = useMemo(() => {
    if (maxScrollX === 0 || maxHandleLeft === 0) return 0;
    const ratio = scrollX / maxScrollX;
    return Math.min(maxHandleLeft, Math.max(0, ratio * maxHandleLeft));
  }, [scrollX, maxScrollX, maxHandleLeft]);

  // Map handle left to scrollX
  const toScrollX = useCallback(
    (nextHandleLeft: number) => {
      if (maxHandleLeft === 0) return 0;
      const ratio = nextHandleLeft / maxHandleLeft;
      const nextScroll = ratio * maxScrollX;
      return Math.min(maxScrollX, Math.max(0, nextScroll));
    },
    [maxHandleLeft, maxScrollX]
  );

  // Drag handling
  const dragState = useRef<{ startX: number; startLeft: number } | null>(null);

  const onPointerDown = (e: React.PointerEvent) => {
    if (!(e.target as HTMLElement).closest("[data-role='handle']")) return;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    dragState.current = { startX: e.clientX, startLeft: handleLeft };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragState.current) return;
    const dx = e.clientX - dragState.current.startX;
    const nextLeft = Math.min(maxHandleLeft, Math.max(0, dragState.current.startLeft + dx));
    onScrollXChange(toScrollX(nextLeft));
  };

  const onPointerUp = (e: React.PointerEvent) => {
    if (dragState.current) {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      dragState.current = null;
    }
  };

  // Wheel handling (prefer horizontal, fallback to vertical)
  const onWheel = (e: React.WheelEvent) => {
    if (maxScrollX === 0) return;
    const delta = Math.abs(e.deltaX) > 0 ? e.deltaX : e.deltaY;
    if (delta === 0) return;
    e.preventDefault();
    const speed = 1.5; // tuning factor
    const next = Math.min(maxScrollX, Math.max(0, scrollX + delta * speed));
    onScrollXChange(next);
  };

  // Keyboard support
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (maxScrollX === 0) return;
    let next = scrollX;
    const small = Math.max(24, viewportWidth * 0.1);
    const big = Math.max(48, viewportWidth * 0.8);
    switch (e.key) {
      case "ArrowLeft":
        next = Math.max(0, scrollX - small);
        break;
      case "ArrowRight":
        next = Math.min(maxScrollX, scrollX + small);
        break;
      case "PageUp":
        next = Math.max(0, scrollX - big);
        break;
      case "PageDown":
        next = Math.min(maxScrollX, scrollX + big);
        break;
      case "Home":
        next = 0;
        break;
      case "End":
        next = maxScrollX;
        break;
      default:
        return;
    }
    e.preventDefault();
    onScrollXChange(next);
  };

  const disabled = maxScrollX === 0 || trackWidth === 0;

  return (
    <div
      ref={trackRef}
      role="scrollbar"
      aria-orientation="horizontal"
      aria-valuemin={0}
      aria-valuemax={maxScrollX}
      aria-valuenow={scrollX}
      tabIndex={0}
      onKeyDown={onKeyDown}
      onWheel={onWheel}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      className={cn(
        "h-3 w-full bg-panel-dark/80 border-t border-border relative select-none",
        disabled && "opacity-60",
        className
      )}
    >
      {/* Track background accent (optional) */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent pointer-events-none" />

      {/* Handle */}
      <motion.div
        data-role="handle"
        className={cn(
          "absolute top-0 bottom-0 rounded-sm border border-primary/50 bg-primary/40",
          "hover:bg-primary/50 active:bg-primary/60 transition-colors",
          "cursor-grab active:cursor-grabbing focus:outline-none"
        )}
        style={{ left: handleLeft, width: handleWidth }}
        layout
        transition={{ type: "spring", stiffness: 350, damping: 35 }}
        aria-label="Timeline horizontal viewport"
      />
    </div>
  );
};
