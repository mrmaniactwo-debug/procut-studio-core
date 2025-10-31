import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export type TimelineZoomScrollbarProps = {
  // Total timeline duration (seconds)
  totalSeconds: number;
  // Base pixels-per-second at zoom=0
  basePixelsPerSecond?: number;
  // Continuous zoom value (0..N). PixelsPerSecond = base * 2^zoom
  zoom: number;
  minZoom?: number;
  maxZoom?: number;
  onZoomChange: (nextZoom: number) => void;
  // Horizontal pan state in pixels
  scrollX: number;
  onScrollXChange: (nextScroll: number) => void;
  // Current viewport width in pixels
  viewportWidth: number;
  className?: string;
  // Minimum handle pixel width
  minHandlePx?: number;
  // Spectrum-like options
  size?: "small" | "medium" | "large"; // visual thickness only
  orientation?: "horizontal" | "vertical"; // currently horizontal behavior only
  hideTrack?: boolean; // hide the background track
  hideHandles?: boolean; // hide edge handles when idle (no hover/drag/focus)
  scaleDown?: boolean; // scale thickness down when idle (4px)
  detached?: boolean; // rounded track corners
  tone?: "neutral" | "timeline" | "primary"; // visual accent for handle
  // Vertical orientation support (panning only)
  contentHeight?: number; // total scrollable height for vertical mode
  viewportHeight?: number; // visible height for vertical mode
  scrollY?: number;
  onScrollYChange?: (next: number) => void;
  // Temporarily allow disabling zoom interactions entirely
  enableZoom?: boolean; // default true; when false, edges don't resize and +/- or mod+wheel won't zoom
};

/**
 * Premiere-like combined zoom + pan bar.
 * - Drag the center to pan horizontally
 * - Drag the left/right edge to zoom (resize the handle)
 * - Wheel to pan; Alt/Ctrl/Meta+Wheel to zoom centered under pointer
 * - Smooth animated handle using Framer Motion
 */
export const TimelineZoomScrollbar: React.FC<TimelineZoomScrollbarProps> = ({
  totalSeconds,
  basePixelsPerSecond = 20,
  zoom,
  minZoom = 0,
  maxZoom = 6,
  onZoomChange,
  scrollX,
  onScrollXChange,
  viewportWidth,
  className,
  minHandlePx = 32,
  size = "medium",
  orientation = "horizontal",
  hideTrack = false,
  hideHandles = false,
  scaleDown = false,
  detached = false,
  tone = "neutral",
  contentHeight,
  viewportHeight,
  scrollY,
  onScrollYChange,
  enableZoom = true,
}) => {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [trackWidth, setTrackWidth] = useState(0);
  const [trackHeight, setTrackHeight] = useState(0);
  const [isHover, setIsHover] = useState(false);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      setTrackWidth(el.clientWidth);
      setTrackHeight(el.clientHeight);
    });
    ro.observe(el);
    setTrackWidth(el.clientWidth);
    setTrackHeight(el.clientHeight);
    return () => ro.disconnect();
  }, []);

  const pixelsPerSecond = useMemo(() => basePixelsPerSecond * Math.pow(2, zoom), [basePixelsPerSecond, zoom]);
  const contentWidth = useMemo(() => totalSeconds * pixelsPerSecond, [totalSeconds, pixelsPerSecond]);

  const maxScrollX = Math.max(0, contentWidth - viewportWidth);
  const visibleRatio = contentWidth > 0 ? Math.min(1, Math.max(0, viewportWidth / contentWidth)) : 1;
  const maxScrollY = Math.max(0, (contentHeight ?? 0) - (viewportHeight ?? 0));
  const visibleRatioV = contentHeight && viewportHeight && contentHeight > 0 ? Math.min(1, Math.max(0, viewportHeight / contentHeight)) : 1;

  const handleWidth = useMemo(() => {
    if (orientation === "vertical") return 0; // width not used in vertical mode
    const w = Math.floor(visibleRatio * trackWidth);
    return Math.max(minHandlePx, Math.min(trackWidth, w));
  }, [visibleRatio, trackWidth, minHandlePx, orientation]);
  const handleHeight = useMemo(() => {
    if (orientation !== "vertical") return 0;
    const h = Math.floor(visibleRatioV * trackHeight);
    return Math.max(minHandlePx, Math.min(trackHeight, h));
  }, [visibleRatioV, trackHeight, minHandlePx, orientation]);
  const maxHandleLeft = Math.max(0, trackWidth - handleWidth);
  const maxHandleTop = Math.max(0, trackHeight - handleHeight);

  const handleLeft = useMemo(() => {
    if (orientation === "vertical") return 0;
    if (maxScrollX === 0 || maxHandleLeft === 0) return 0;
    const ratio = scrollX / maxScrollX;
    return Math.min(maxHandleLeft, Math.max(0, ratio * maxHandleLeft));
  }, [scrollX, maxScrollX, maxHandleLeft, orientation]);
  const handleTop = useMemo(() => {
    if (orientation !== "vertical") return 0;
    if (scrollY === undefined || maxScrollY === 0 || maxHandleTop === 0) return 0;
    const ratio = (scrollY ?? 0) / maxScrollY;
    return Math.min(maxHandleTop, Math.max(0, ratio * maxHandleTop));
  }, [scrollY, maxScrollY, maxHandleTop, orientation]);
  const handleRightStart = handleLeft + handleWidth;
  const handleBottomStart = handleTop + handleHeight;

  const toScrollX = useCallback(
    (nextHandleLeft: number, nextHandleWidth = handleWidth, nextContentWidth = contentWidth) => {
      const nextMaxHandleLeft = Math.max(0, trackWidth - nextHandleWidth);
      const nextMaxScrollX = Math.max(0, nextContentWidth - viewportWidth);
      if (nextMaxHandleLeft === 0 || nextMaxScrollX === 0) return 0;
      const ratio = Math.min(nextMaxHandleLeft, Math.max(0, nextHandleLeft)) / nextMaxHandleLeft;
      return Math.min(nextMaxScrollX, Math.max(0, ratio * nextMaxScrollX));
    },
    [trackWidth, viewportWidth, handleWidth, contentWidth]
  );
  const toScrollY = useCallback(
    (nextHandleTop: number, nextHandleHeight = handleHeight, nextContentHeight = contentHeight ?? 0) => {
      const nextMaxHandleTop = Math.max(0, trackHeight - nextHandleHeight);
      const nextMaxScrollY = Math.max(0, nextContentHeight - (viewportHeight ?? 0));
      if (nextMaxHandleTop === 0 || nextMaxScrollY === 0) return 0;
      const ratio = Math.min(nextMaxHandleTop, Math.max(0, nextHandleTop)) / nextMaxHandleTop;
      return Math.min(nextMaxScrollY, Math.max(0, ratio * nextMaxScrollY));
    },
    [trackHeight, viewportHeight, handleHeight, contentHeight]
  );

  // Helpers to compute zoom from desired visibleRatio
  const zoomFromVisibleRatio = useCallback(
    (ratio: number) => {
      const clamped = Math.min(1, Math.max(0.0001, ratio));
      const desiredContentWidth = viewportWidth / clamped;
      const desiredPps = desiredContentWidth / Math.max(0.0001, totalSeconds);
      const z = Math.log2(desiredPps / basePixelsPerSecond);
      return Math.min(maxZoom, Math.max(minZoom, z));
    },
    [viewportWidth, totalSeconds, basePixelsPerSecond, minZoom, maxZoom]
  );

  // Drag state
  const dragRef = useRef<
    | { kind: "center"; startX: number; startLeft: number }
    | { kind: "left"; startX: number; startLeft: number; startWidth: number }
    | { kind: "right"; startX: number; startLeft: number; startWidth: number }
    | null
  >(null);

  const onPointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    const handleEl = (e.target as HTMLElement).closest("[data-role='handle']") as HTMLElement | null;
    // Allow dragging from the track too (not only the handle) for better usability
    const trackEl = trackRef.current;
    if (!trackEl) return;

    (e.target as HTMLElement).setPointerCapture(e.pointerId);

    if (orientation === "vertical") {
      // Simpler, stable behavior: do not recenter on click; only start drag from current handle position
      dragRef.current = { kind: "center", startX: e.clientY, startLeft: handleTop } as any;
      return;
    }

    // Horizontal behavior
    if (!handleEl) {
      // Clicked track: center the handle at pointer only if scrollable; otherwise just start drag
      const trackRect = trackEl.getBoundingClientRect();
      const localX = e.clientX - trackRect.left;
      const centeredLeft = Math.min(
        Math.max(0, localX - handleWidth / 2),
        Math.max(0, trackWidth - handleWidth)
      );
      const nextMaxHandleLeft = Math.max(0, trackWidth - handleWidth);
      const nextMaxScrollX = Math.max(0, contentWidth - viewportWidth);
      if (nextMaxHandleLeft > 0 && nextMaxScrollX > 0) {
        const nextScroll = toScrollX(centeredLeft);
        queueUpdate({ scrollX: nextScroll });
      }
      dragRef.current = { kind: "center", startX: e.clientX, startLeft: centeredLeft };
      return;
    }
    const rect = handleEl.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const edgeSizeX = Math.min(12, Math.max(8, rect.width * 0.15));
    if (!enableZoom) {
      dragRef.current = { kind: "center", startX: e.clientX, startLeft: handleLeft };
    } else if (x <= edgeSizeX) {
      dragRef.current = { kind: "left", startX: e.clientX, startLeft: handleLeft, startWidth: handleWidth };
    } else if (x >= rect.width - edgeSizeX) {
      dragRef.current = { kind: "right", startX: e.clientX, startLeft: handleLeft, startWidth: handleWidth };
    } else {
      dragRef.current = { kind: "center", startX: e.clientX, startLeft: handleLeft };
    }
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const drag = dragRef.current;
    if (!drag) return;
    e.preventDefault();

    if (orientation === "vertical" && drag.kind === "center") {
      const dy = e.clientY - drag.startX;
      const nextTop = Math.min(maxHandleTop, Math.max(0, drag.startLeft + dy));
      const nextScroll = toScrollY(nextTop);
      queueUpdate({ scrollY: nextScroll });
      return;
    }

    if (drag.kind === "center") {
      const dx = e.clientX - drag.startX;
      const nextLeft = Math.min(maxHandleLeft, Math.max(0, drag.startLeft + dx));
      const nextScroll = toScrollX(nextLeft);
      // batch via rAF to reduce jitter
      queueUpdate({ scrollX: nextScroll });
      return;
    }

    // Resizing edges -> adjust visible ratio -> update zoom (smooth) and scroll anchored
    const dx = e.clientX - drag.startX;

    if (drag.kind === "left" && enableZoom) {
      const nextLeft = Math.min(maxHandleLeft, Math.max(0, drag.startLeft + dx));
      const nextWidth = Math.min(trackWidth - nextLeft, Math.max(minHandlePx, drag.startWidth - dx));
      const nextVisibleRatio = nextWidth / Math.max(1, trackWidth);
      const nextZoom = zoomFromVisibleRatio(nextVisibleRatio);
  queueUpdate({ zoom: nextZoom });
      // recompute derived widths to anchor scroll
      const nextPps = basePixelsPerSecond * Math.pow(2, nextZoom);
      const nextContentWidth = totalSeconds * nextPps;
      const nextScroll = toScrollX(nextLeft, nextWidth, nextContentWidth);
      queueUpdate({ scrollX: nextScroll });
      return;
    }

    if (drag.kind === "right" && enableZoom) {
      const nextWidth = Math.min(trackWidth - drag.startLeft, Math.max(minHandlePx, drag.startWidth + dx));
      const nextVisibleRatio = nextWidth / Math.max(1, trackWidth);
      const nextZoom = zoomFromVisibleRatio(nextVisibleRatio);
  queueUpdate({ zoom: nextZoom });
      const nextPps = basePixelsPerSecond * Math.pow(2, nextZoom);
      const nextContentWidth = totalSeconds * nextPps;
      // keep the left edge anchored by keeping handleLeft ratio the same
      const nextLeft = drag.startLeft;
      const nextScroll = toScrollX(nextLeft, nextWidth, nextContentWidth);
      queueUpdate({ scrollX: nextScroll });
      return;
    }
  };

  const onPointerUp = (e: React.PointerEvent) => {
    if (dragRef.current) {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      dragRef.current = null;
    }
  };

  // Wheel: pan, with modifier to zoom around pointer
  const onWheel = (e: React.WheelEvent) => {
    const hasZoomMod = e.ctrlKey || e.metaKey || e.altKey;
    const useX = orientation === "vertical" ? false : Math.abs(e.deltaX) > Math.abs(e.deltaY);
    const delta = orientation === "vertical" ? e.deltaY : (useX ? e.deltaX : e.deltaY);
    if (hasZoomMod && enableZoom) {
      if (orientation === "vertical") {
        // no vertical zoom behavior, treat as no-op to avoid confusion
        return;
      }
      e.preventDefault();
      const intensity = -delta * 0.0025; // tune zoom sensitivity
      const nextZoom = Math.min(maxZoom, Math.max(minZoom, zoom + intensity));
      if (nextZoom === zoom) return;
      // zoom anchored to pointer time: keep contentX under pointer constant
      const trackRect = trackRef.current?.getBoundingClientRect();
      const pointerX = trackRect ? e.clientX - trackRect.left : handleLeft + handleWidth / 2;
      const rWithinHandle = Math.min(1, Math.max(0, (pointerX - handleLeft) / Math.max(1, handleWidth)));
      const contentXOld = scrollX + rWithinHandle * viewportWidth;

      queueUpdate({ zoom: nextZoom });
      const nextPps = basePixelsPerSecond * Math.pow(2, nextZoom);
      const nextContentWidth = totalSeconds * nextPps;
      const nextHandleWidth = Math.max(minHandlePx, Math.min(trackWidth, (viewportWidth / nextContentWidth) * trackWidth));

      let nextLeft = 0;
      if (nextContentWidth > viewportWidth) {
        const nextMaxHandleLeft = Math.max(0, trackWidth - nextHandleWidth);
        const ratio = (contentXOld - rWithinHandle * viewportWidth) / Math.max(1, nextContentWidth - viewportWidth);
        const clampedRatio = Math.min(1, Math.max(0, ratio));
        nextLeft = clampedRatio * nextMaxHandleLeft;
      }
      const nextScroll = toScrollX(nextLeft, nextHandleWidth, nextContentWidth);
      queueUpdate({ scrollX: nextScroll });
      return;
    }
    // Pan
    if (orientation === "vertical") {
      if (!onScrollYChange || maxScrollY === 0) return;
      const speed = 1.0;
      const next = Math.min(maxScrollY, Math.max(0, (scrollY || 0) + delta * speed));
      if (next !== (scrollY || 0)) {
        e.preventDefault();
        queueUpdate({ scrollY: next });
      }
      return;
    }
    if (maxScrollX === 0) return;
    const speed = 1.2;
    const next = Math.min(maxScrollX, Math.max(0, scrollX + delta * speed));
    if (next !== scrollX) {
      e.preventDefault();
      queueUpdate({ scrollX: next });
    }
  };

  // Keyboard: arrows to pan, +/- to zoom
  const onKeyDown = (e: React.KeyboardEvent) => {
    let handled = false;
    if (e.key === "+" && enableZoom) {
      onZoomChange(Math.min(maxZoom, zoom + 0.1));
      handled = true;
    } else if (e.key === "-" && enableZoom) {
      onZoomChange(Math.max(minZoom, zoom - 0.1));
      handled = true;
    } else if (orientation === "vertical" && (e.key === "ArrowUp" || e.key === "ArrowDown")) {
      if (onScrollYChange) {
        const step = Math.max(16, (viewportHeight ?? 80) * 0.1);
        const next = Math.min(maxScrollY, Math.max(0, (scrollY ?? 0) + (e.key === "ArrowUp" ? -step : step)));
        onScrollYChange(next);
        handled = true;
      }
    } else if (e.key === "ArrowLeft") {
      onScrollXChange(Math.max(0, scrollX - Math.max(24, viewportWidth * 0.1)));
      handled = true;
    } else if (e.key === "ArrowRight") {
      onScrollXChange(Math.min(maxScrollX, scrollX + Math.max(24, viewportWidth * 0.1)));
      handled = true;
    } else if (e.key === "Home") {
      if (orientation === "vertical" && onScrollYChange) {
        onScrollYChange(0);
      } else {
        onScrollXChange(0);
      }
      handled = true;
    } else if (e.key === "End") {
      if (orientation === "vertical" && onScrollYChange) {
        onScrollYChange(maxScrollY);
      } else {
        onScrollXChange(maxScrollX);
      }
      handled = true;
    }
    if (handled) e.preventDefault();
  };

  const disabled = (orientation === "vertical"
    ? trackHeight === 0 || (maxScrollY === 0 && visibleRatioV >= 1)
    : trackWidth === 0 || (maxScrollX === 0 && visibleRatio >= 1));

  // rAF batching to reduce jitter when rapidly updating scroll/zoom
  const rafRef = useRef<number | null>(null);
  const pendingRef = useRef<{ scrollX?: number; scrollY?: number; zoom?: number } | null>(null);
  const queueUpdate = (next: { scrollX?: number; scrollY?: number; zoom?: number }) => {
    pendingRef.current = { ...(pendingRef.current || {}), ...next };
    if (rafRef.current == null) {
      rafRef.current = requestAnimationFrame(() => {
        const p = pendingRef.current;
        pendingRef.current = null;
        rafRef.current = null;
        if (!p) return;
        if (p.zoom !== undefined) onZoomChange(p.zoom);
        if (p.scrollX !== undefined) onScrollXChange(p.scrollX);
        if (p.scrollY !== undefined && onScrollYChange) onScrollYChange(p.scrollY);
      });
    }
  };
  useEffect(() => () => {
    if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
  }, []);

  // Visual thickness per size
  const thicknessClass = useMemo(() => {
    const map = {
      small: "h-3",
      medium: "h-4",
      large: "h-6",
    } as const;
    return map[size];
  }, [size]);

  const isIdle = !isHover && dragRef.current === null && !document.activeElement?.closest("[data-role='scroll-zoom-track']");

  // Tone classes
  const handleToneClass = useMemo(() => {
    switch (tone) {
      case "timeline":
        return "border-timeline-yellow/70 bg-timeline-yellow/25 ring-[hsla(48,100%,60%,0.25)] hover:bg-timeline-yellow/35 active:bg-timeline-yellow/45";
      case "primary":
        return "border-primary/60 bg-primary/25 ring-[hsla(199,100%,50%,0.25)] hover:bg-primary/35 active:bg-primary/45";
      default:
        return "border-border/80 bg-muted/30 ring-border/40 hover:bg-muted/40 active:bg-muted/50";
    }
  }, [tone]);

  return (
    <div
      ref={trackRef}
      role="scrollbar"
      data-role="scroll-zoom-track"
      aria-orientation={orientation}
      aria-valuemin={0}
      aria-valuemax={orientation === "vertical" ? maxScrollY : maxScrollX}
      aria-valuenow={orientation === "vertical" ? (scrollY || 0) : scrollX}
      aria-keyshortcuts="ArrowLeft, ArrowRight, Home, End, +, -"
      tabIndex={0}
      onKeyDown={onKeyDown}
      onWheel={onWheel}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerEnter={() => setIsHover(true)}
      onPointerLeave={() => setIsHover(false)}
      className={cn(
        orientation === "horizontal" ? "w-full" : "h-full",
        // thickness or scale-down when idle
        scaleDown && isIdle ? (orientation === "horizontal" ? "h-1" : "w-1") : thicknessClass,
        hideTrack ? "bg-transparent" : "bg-panel-dark/95 shadow-inner",
        orientation === "horizontal" ? "border-t" : "border-l",
        "border-border relative select-none",
        detached && "rounded-full",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60",
        disabled && "opacity-60",
        className
      )}
    >
      {/* dim outside the viewport (hidden if hideTrack) */}
      {!hideTrack && orientation === "horizontal" && (
        <>
          <div className="absolute inset-y-0 left-0 bg-black/50" style={{ width: handleLeft }} />
          <div className="absolute inset-y-0 right-0 bg-black/50" style={{ left: handleRightStart }} />
        </>
      )}
      {!hideTrack && orientation === "vertical" && (
        <>
          <div className="absolute inset-x-0 top-0 bg-black/50" style={{ height: handleTop }} />
          <div className="absolute inset-x-0 bottom-0 bg-black/50" style={{ top: handleBottomStart }} />
        </>
      )}
      {/* handle with edge grips */}
      <div
        data-role="handle"
        className={cn(
          "absolute rounded-sm border ring-1 transition-colors",
          handleToneClass,
          "cursor-grab active:cursor-grabbing focus:outline-none",
          orientation === "horizontal" ? "top-0 bottom-0" : "left-0 right-0"
        )}
        style={orientation === "horizontal" ? { left: handleLeft, width: handleWidth } : { top: handleTop, height: handleHeight }}
        aria-label="Timeline zoom and pan"
      >
        {/* edge grips visuals */}
        {orientation === "horizontal" && (
          <div
            className={cn(
              "absolute left-0 top-0 bottom-0 w-2 grid place-items-center cursor-ew-resize transition-opacity",
              hideHandles && isIdle ? "opacity-0" : "opacity-100"
            )}
          >
            <div className="w-0.5 h-2 bg-muted-foreground/70" />
          </div>
        )}
        {orientation === "horizontal" && (
          <div
            className={cn(
              "absolute right-0 top-0 bottom-0 w-2 grid place-items-center cursor-ew-resize transition-opacity",
              hideHandles && isIdle ? "opacity-0" : "opacity-100"
            )}
          >
            <div className="w-0.5 h-2 bg-muted-foreground/70" />
          </div>
        )}
        {orientation === "vertical" && (
          <>
            <div className={cn("absolute top-0 left-0 right-0 h-2 grid place-items-center cursor-ns-resize transition-opacity", hideHandles && isIdle ? "opacity-0" : "opacity-100")}
            >
              <div className="h-0.5 w-2 bg-muted-foreground/70" />
            </div>
            <div className={cn("absolute bottom-0 left-0 right-0 h-2 grid place-items-center cursor-ns-resize transition-opacity", hideHandles && isIdle ? "opacity-0" : "opacity-100")}
            >
              <div className="h-0.5 w-2 bg-muted-foreground/70" />
            </div>
          </>
        )}
      </div>
    </div>
  );
};
