import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type VerticalTrackScrollbarProps = {
  // Total content height (px)
  contentHeight: number;
  // Visible viewport height (px)
  viewportHeight: number;
  // Current scrollTop (px)
  scrollY: number;
  // Setter to update scrollTop (should update the DOM scrollTop programmatically)
  onScrollYChange: (next: number) => void;
  className?: string;
  minHandlePx?: number;
  size?: "thin" | "medium" | "thick";
  hideTrack?: boolean;
};

// A simple, reliable vertical scrollbar (pan only). No zoom, no fancy states.
export const VerticalTrackScrollbar: React.FC<VerticalTrackScrollbarProps> = ({
  contentHeight,
  viewportHeight,
  scrollY,
  onScrollYChange,
  className,
  minHandlePx = 24,
  size = "medium",
  hideTrack = false,
}) => {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [trackHeight, setTrackHeight] = useState(0);
  const [isHover, setIsHover] = useState(false);
  const [isActive, setIsActive] = useState(false);

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
      const nextMaxHandleTop = Math.max(0, trackHeight - handleHeight);
      const nextMaxScrollY = Math.max(0, contentHeight - viewportHeight);
      if (nextMaxHandleTop === 0 || nextMaxScrollY === 0) return 0;
      const ratio = Math.min(nextMaxHandleTop, Math.max(0, nextHandleTop)) / nextMaxHandleTop;
      return Math.min(nextMaxScrollY, Math.max(0, ratio * nextMaxScrollY));
    },
    [trackHeight, handleHeight, contentHeight, viewportHeight]
  );

  // Drag state
  const dragRef = useRef<
    | { kind: "center"; startY: number; startTop: number }
    | null
  >(null);

  const onPointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    const target = e.target as HTMLElement;
    const handleEl = target.closest("[data-role='v-handle']") as HTMLElement | null;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    if (handleEl) {
      dragRef.current = { kind: "center", startY: e.clientY, startTop: handleTop };
      setIsActive(true);
      return;
    }
    // Click on track: jump so handle centers on pointer, then start drag
    const trackEl = trackRef.current;
    if (!trackEl) return;
    const rect = trackEl.getBoundingClientRect();
    const localY = e.clientY - rect.top;
    const centeredTop = Math.min(Math.max(0, localY - handleHeight / 2), Math.max(0, trackHeight - handleHeight));
    const next = toScrollY(centeredTop);
    onScrollYChange(next);
    dragRef.current = { kind: "center", startY: e.clientY, startTop: centeredTop };
    setIsActive(true);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const drag = dragRef.current;
    if (!drag) return;
    e.preventDefault();
    const dy = e.clientY - drag.startY;
    const nextTop = Math.min(maxHandleTop, Math.max(0, drag.startTop + dy));
    const nextScroll = toScrollY(nextTop);
    onScrollYChange(nextScroll);
  };

  const onPointerUp = (e: React.PointerEvent) => {
    if (dragRef.current) {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      dragRef.current = null;
      setIsActive(false);
    }
  };

  const onWheel = (e: React.WheelEvent) => {
    const delta = e.deltaY;
    if (maxScrollY === 0) return;
    const speed = 1.0;
    const next = Math.min(maxScrollY, Math.max(0, scrollY + delta * speed));
    if (next !== scrollY) {
      e.preventDefault();
      onScrollYChange(next);
    }
  };

  const thickness = useMemo(() => {
    switch (size) {
      case "thin":
        return "w-2";
      case "thick":
        return "w-5";
      default:
        return "w-3";
    }
  }, [size]);

  const disabled = trackHeight === 0 || (maxScrollY === 0 && visibleRatio >= 1);

  return (
    <div
      ref={trackRef}
      role="scrollbar"
      aria-orientation="vertical"
      aria-valuemin={0}
      aria-valuemax={maxScrollY}
      aria-valuenow={scrollY}
      tabIndex={0}
      onWheel={onWheel}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerEnter={() => setIsHover(true)}
      onPointerLeave={() => setIsHover(false)}
      className={cn(
        "relative select-none border-l border-border rounded-sm",
        hideTrack ? "bg-transparent" : "bg-panel-dark/70",
        thickness,
        disabled && "opacity-60",
        className
      )}
    >
      {/* dim regions above/below handle for clarity */}
      {!hideTrack && (
        <>
          <div className="absolute inset-x-0 top-0 bg-black/40" style={{ height: handleTop }} />
          <div className="absolute inset-x-0 bottom-0 bg-black/40" style={{ top: handleTop + handleHeight }} />
        </>
      )}
      <div
        data-role="v-handle"
        className={cn(
          "absolute left-0 right-0 rounded-sm border border-border/70 bg-muted/40 ring-1 ring-border/40 transition-colors",
          "cursor-grab active:cursor-grabbing"
        )}
        style={{ top: handleTop, height: handleHeight }}
        aria-label="Vertical scroll"
      />
    </div>
  );
};

export default VerticalTrackScrollbar;
