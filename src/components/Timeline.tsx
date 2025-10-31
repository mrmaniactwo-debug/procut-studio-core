import { Play, Pause, SkipBack, SkipForward, ZoomIn, ZoomOut, Eye, EyeOff, Lock, LockOpen, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useEffect, useMemo, useRef, useState } from "react";
import { TimecodePair } from "@/components/Timecode";
import { TimelineZoomScrollbar } from "@/components/TimelineZoomScrollbar";
import { useMedia, TimelineClip, MediaFile } from "@/context/MediaContext";
import { usePlayback } from "@/context/PlaybackContext";

type TimelineProps = {
  onResetLayout?: () => void;
};

export const Timeline: React.FC<TimelineProps> = ({ onResetLayout }) => {
  const { timelineClips, updateClipPosition, addClipToTimeline, moveClip, removeClip, updateClip } = useMedia();
    const { toggleLinkForMedia } = useMedia();
  const { isPlaying, currentTime, duration, setIsPlaying, setCurrentTime } = usePlayback();
  const [trackStates, setTrackStates] = useState({
    v1: { visible: true, locked: false, muted: false },
    a1: { visible: true, locked: false, muted: false },
    v2: { visible: true, locked: false, muted: false },
    a2: { visible: true, locked: false, muted: false },
  });
    const [dropMode, setDropMode] = useState<'insert' | 'overwrite'>('overwrite');
  const [selectedClipIds, setSelectedClipIds] = useState<Set<string>>(new Set());
  const [showHelp, setShowHelp] = useState(false);
  type TrackKey = 'v1' | 'v2' | 'a1' | 'a2';
  const [draggingClip, setDraggingClip] = useState<{id: string; track: TrackKey; offsetX: number} | null>(null);
  const dragImageRef = useRef<HTMLElement | null>(null);

  const formatTimecode = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const frames = Math.floor((seconds % 1) * 30);
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}:${frames.toString().padStart(2, '0')}`;
  };

  const handleClipDragStart = (e: React.DragEvent, clipId: string, track: TrackKey, startTime: number) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    setDraggingClip({ id: clipId, track, offsetX });

    // Provide a nicer drag ghost using a cloned element
    try {
      const el = e.currentTarget as HTMLElement;
      const clone = el.cloneNode(true) as HTMLElement;
      clone.style.position = 'absolute';
      clone.style.top = '-10000px';
      clone.style.left = '-10000px';
      clone.style.pointerEvents = 'none';
      clone.style.opacity = '0.9';
      clone.style.transform = 'scale(0.98)';
      document.body.appendChild(clone);
      dragImageRef.current = clone;
      // Use cursor offset within the clip for natural drag
      e.dataTransfer.setDragImage(clone, Math.max(0, Math.min(offsetX, el.clientWidth)), 12);
    } catch (err) {
      console.warn('Failed to set drag image', err);
    }
  };

  const handleClipDragEnd = () => {
    if (dragImageRef.current) {
      dragImageRef.current.remove();
      dragImageRef.current = null;
    }
    setDraggingClip(null);
  };

  // Time snapping helper (Alt disables snapping)
  const snapTime = (seconds: number, altKey: boolean) => {
    if (altKey) return Math.max(0, seconds);
    const pps = pixelsPerSecond;
    let interval = 1; // default 1s
    if (pps >= 160) interval = 0.25;
    else if (pps >= 80) interval = 0.5;
    else if (pps >= 40) interval = 1;
    else if (pps >= 20) interval = 2;
    else if (pps >= 10) interval = 5;
    else if (pps >= 5) interval = 10;
    else interval = 30;
    const snapped = Math.round(seconds / interval) * interval;
    return Math.max(0, snapped);
  };

  const handleTrackDrop = (targetTrack: TrackKey) => (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    // account for horizontal scroll offset
    const rawStartTime = Math.max(0, (x + scrollX - (draggingClip ? draggingClip.offsetX : 0)) / Math.max(1, pixelsPerSecond));
    const newStartTime = snapTime(rawStartTime, e.altKey);
  const forceInsert = e.ctrlKey || e.metaKey; // Ctrl/Cmd forces insert
  const useInsert = forceInsert || dropMode === 'insert';

    // Case 1: internal drag of an existing timeline clip
    if (draggingClip) {
      if (useInsert) {
        // ripple insert: shift clips on target track at/after start by duration of moving clip
        const moving = [...timelineClips.v1, ...timelineClips.v2, ...timelineClips.a1, ...timelineClips.a2].find(c=>c.id===draggingClip.id);
        const shiftBy = moving ? moving.duration : 0;
        if (shiftBy > 0) {
          // ripple shift on target track
          const trackList = timelineClips[targetTrack];
          const toShift = trackList.filter(c => c.startTime >= newStartTime && c.id !== draggingClip.id);
          toShift.sort((a,b)=>a.startTime - b.startTime);
          toShift.forEach(c => updateClipPosition(c.id, targetTrack, c.startTime + shiftBy));
        }
      } else {
        // overwrite: remove overlapped clips on target track
        const moving = [...timelineClips.v1, ...timelineClips.v2, ...timelineClips.a1, ...timelineClips.a2].find(c=>c.id===draggingClip.id);
        const start = newStartTime;
        const end = start + (moving?.duration ?? 0);
        const overlapped = timelineClips[targetTrack].filter(c => !(c.id===draggingClip.id) && (c.startTime < end && (c.startTime + c.duration) > start));
        overlapped.forEach(c => removeClip(c.id, targetTrack));
      }
      // finally move/position the dragged clip
      if (draggingClip.track === targetTrack) {
        updateClipPosition(draggingClip.id, targetTrack, newStartTime);
      } else {
        // move across tracks
        moveClip(draggingClip.id, draggingClip.track, targetTrack, newStartTime);
      }
      handleClipDragEnd();
      return;
    }

    // Case 2: external drop from MediaBrowser
    try {
      const json = e.dataTransfer.getData('application/json');
      if (json) {
        const file = JSON.parse(json) as MediaFile;
        const isVideo = file.type?.startsWith('video');
        const isAudio = file.type?.startsWith('audio');
        const targetIsVideo = targetTrack === 'v1' || targetTrack === 'v2';
        const targetIsAudio = targetTrack === 'a1' || targetTrack === 'a2';
        if ((isVideo && targetIsVideo) || (isAudio && targetIsAudio)) {
          const clip: TimelineClip = {
            id: Math.random().toString(36).slice(2, 9),
            mediaId: file.id,
            name: file.name,
            type: file.type,
            duration: Math.max(0, file.durationSeconds ?? 0),
            inPoint: 0,
            outPoint: Math.max(0, file.durationSeconds ?? 0),
            startTime: newStartTime,
            thumbnail: file.thumbnail,
            file: file.file,
          };
          if (useInsert) {
            // ripple shift target track
            const trackList = timelineClips[targetTrack];
            const toShift = trackList.filter(c => c.startTime >= newStartTime);
            toShift.sort((a,b)=>a.startTime - b.startTime);
            toShift.forEach(c => updateClipPosition(c.id, targetTrack, c.startTime + clip.duration));
            addClipToTimeline(clip, targetTrack);
          } else {
            // overwrite: remove overlapped clips
            const start = newStartTime;
            const end = start + clip.duration;
            const overlapped = timelineClips[targetTrack].filter(c => (c.startTime < end && (c.startTime + c.duration) > start));
            overlapped.forEach(c => removeClip(c.id, targetTrack));
            addClipToTimeline(clip, targetTrack);
          }
        }
      }
    } catch (err) {
      // If parsing or data transfer fails, log for debugging but don't crash the drop handler
      console.warn('Failed to handle drop data', err);
    }
  };

  const renderClip = (clip: TimelineClip, trackType: 'video' | 'audio', trackKey: TrackKey, pps: number) => {
    const widthPx = clip.duration * pps;
    const leftPx = clip.startTime * pps;
    const maxNameWidth = widthPx - 8; // Padding
    const isSelected = selectedClipIds.has(clip.id);

    const onSelectClip = (e: React.MouseEvent) => {
      e.stopPropagation();
      setSelectedClipIds(prev => {
        const next = new Set(prev);
        if (e.shiftKey) {
          next.add(clip.id);
        } else {
          next.clear();
          next.add(clip.id);
        }
        return next;
      });
    };

    const startTrim = (edge: 'left'|'right') => (e: React.MouseEvent) => {
      e.stopPropagation();
      const startX = e.clientX;
      const orig = { startTime: clip.startTime, inPoint: clip.inPoint, duration: clip.duration };
      const minDur = 0.1;
      const onMove = (ev: MouseEvent) => {
        const dx = (ev.clientX - startX) / Math.max(1, pps);
        if (edge === 'left') {
          let newStartTime = Math.max(0, orig.startTime + dx);
          let newDuration = Math.max(minDur, orig.duration - dx);
          const delta = newStartTime - orig.startTime;
          const newInPoint = Math.max(0, orig.inPoint + delta);
          const newOutPoint = newInPoint + newDuration;
          updateClip(clip.id, trackKey, { startTime: newStartTime, inPoint: newInPoint, duration: newDuration, outPoint: newOutPoint });
        } else {
          let newDuration = Math.max(minDur, orig.duration + dx);
          const newOutPoint = orig.inPoint + newDuration;
          updateClip(clip.id, trackKey, { duration: newDuration, outPoint: newOutPoint });
        }
      };
      const onUp = () => {
        window.removeEventListener('mousemove', onMove);
        window.removeEventListener('mouseup', onUp);
      };
      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onUp);
    };
    

    if (trackType === 'video') {
      return (
        <div
          key={clip.id}
          draggable
          onDragStart={(e) => handleClipDragStart(e, clip.id, trackKey, clip.startTime)}
          onDragEnd={handleClipDragEnd}
          onMouseDown={onSelectClip}
          data-clip-id={clip.id}
          className={`absolute top-1 bottom-1 ${isSelected ? 'ring-2 ring-primary border-primary' : ''} bg-clip-video/80 hover:bg-clip-video rounded border border-clip-video hover:border-primary flex flex-col items-start justify-between p-1 text-xs font-medium shadow-md hover:shadow-panel-hover transition-all cursor-move`}
          style={{ left: `${leftPx}px`, width: `${widthPx}px` }}
        >
          <div onMouseDown={startTrim('left')} data-handle="left" className="absolute left-0 top-0 bottom-0 w-1.5 bg-white/10 hover:bg-white/30 cursor-col-resize rounded-l" />
          <div onMouseDown={startTrim('right')} data-handle="right" className="absolute right-0 top-0 bottom-0 w-1.5 bg-white/10 hover:bg-white/30 cursor-col-resize rounded-r" />
          {clip.thumbnail && (
            <img 
              src={clip.thumbnail} 
              alt={clip.name} 
              className="absolute inset-0 w-full h-full object-cover opacity-30 rounded pointer-events-none" 
            />
          )}
          <div className="relative z-10 flex items-center gap-1 max-w-full overflow-hidden">
            <span className="text-white text-[10px] font-semibold truncate" style={{ maxWidth: `${maxNameWidth}px` }}>
              {clip.name}
            </span>
          </div>
          <div className="relative z-10 w-full h-1 bg-timeline-yellow/30 rounded-full">
            <div className="w-1 h-1 bg-timeline-yellow rounded-full" />
          </div>
        </div>
      );
    } else {
      return (
        <div
          key={clip.id}
          draggable
          onDragStart={(e) => handleClipDragStart(e, clip.id, trackKey, clip.startTime)}
          onDragEnd={handleClipDragEnd}
          onMouseDown={onSelectClip}
          data-clip-id={clip.id}
          className={`absolute top-1 bottom-1 ${isSelected ? 'ring-2 ring-primary border-primary' : ''} bg-clip-audio/30 hover:bg-clip-audio/40 rounded border border-clip-audio hover:border-primary flex flex-col px-2 py-1 shadow-md hover:shadow-panel-hover transition-all cursor-move`}
          style={{ left: `${leftPx}px`, width: `${widthPx}px` }}
        >
          <div onMouseDown={startTrim('left')} data-handle="left" className="absolute left-0 top-0 bottom-0 w-1.5 bg-white/10 hover:bg-white/30 cursor-col-resize rounded-l" />
          <div onMouseDown={startTrim('right')} data-handle="right" className="absolute right-0 top-0 bottom-0 w-1.5 bg-white/10 hover:bg-white/30 cursor-col-resize rounded-r" />
          <span className="text-white text-[10px] font-semibold mb-0.5 truncate" style={{ maxWidth: `${maxNameWidth}px` }}>
            {clip.name}
          </span>
          <div className="flex gap-0.5 h-full items-center overflow-hidden">
            {Array.from({ length: Math.min(40, Math.floor(widthPx / 3)) }).map((_, i) => (
              <div
                key={i}
                className="w-0.5 bg-clip-audio rounded-full flex-shrink-0"
                style={{ height: `${20 + Math.random() * 60}%` }}
              />
            ))}
          </div>
        </div>
      );
    }
  };

  // (Autosave status moved to Header)

  // Timeline state: zoom, duration, current time (demo static)
  const [zoom, setZoom] = useState(2); // 0..6
  const minZoom = -2;
  const maxZoom = 6;
  const [totalSeconds, setTotalSeconds] = useState(300); // dynamic timeline duration
  const [snappingOn, setSnappingOn] = useState(true);
  const pixelsPerSecond = useMemo(() => 20 * Math.pow(2, zoom), [zoom]);
  const contentWidth = useMemo(() => totalSeconds * pixelsPerSecond, [totalSeconds, pixelsPerSecond]);
  const frameDuration = 1 / 30;

  // Horizontal viewport + scroll sync
  const rulerRef = useRef<HTMLDivElement | null>(null);
  const [viewportWidth, setViewportWidth] = useState(0);
  const [scrollX, setScrollX] = useState(0);
  const isSyncingRef = useRef(false);
  const scrollRafRef = useRef<number | null>(null);
  useEffect(() => {
    const el = rulerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setViewportWidth(el.clientWidth));
    ro.observe(el);
    setViewportWidth(el.clientWidth);
    return () => ro.disconnect();
  }, []);
  useEffect(() => {
    const max = Math.max(0, contentWidth - viewportWidth);
    setScrollX((x) => Math.min(max, Math.max(0, x)));
  }, [contentWidth, viewportWidth]);
  useEffect(() => {
    const el = rulerRef.current;
    if (!el) return;
    if (Math.abs(el.scrollLeft - scrollX) <= 1) return;
    isSyncingRef.current = true;
    if (scrollRafRef.current != null) cancelAnimationFrame(scrollRafRef.current);
    scrollRafRef.current = requestAnimationFrame(() => {
      el.scrollLeft = scrollX;
      scrollRafRef.current = null;
      isSyncingRef.current = false;
    });
  }, [scrollX]);
  useEffect(() => () => {
    if (scrollRafRef.current != null) cancelAnimationFrame(scrollRafRef.current);
  }, []);
  const onRulerScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (isSyncingRef.current) return;
    setScrollX((e.currentTarget as HTMLDivElement).scrollLeft);
  };
  const playheadLeft = currentTime * pixelsPerSecond;
  // Playhead dragging on the ruler with autoscroll and snapping
  const isDraggingPlayheadRef = useRef(false);
  const dragFrameReqRef = useRef<number | null>(null);
  useEffect(() => {
    const onMove = (ev: MouseEvent) => {
      if (!isDraggingPlayheadRef.current) return;
      const ruler = rulerRef.current;
      if (!ruler) return;
      const rect = ruler.getBoundingClientRect();
      // compute x within ruler content taking horizontal scroll into account
      let x = ev.clientX - rect.left + scrollX;
      x = Math.max(0, Math.min(contentWidth, x));
      let seconds = x / Math.max(1, pixelsPerSecond);
      // snapping to clip edges and major ticks
      if (snappingOn) {
        const snapPxThreshold = 8;
        const snapPointsSec: number[] = [];
        // major ticks
        snapPointsSec.push(...majorTicks);
        // clip edges across all tracks
        const addEdges = (clips: TimelineClip[]) => {
          clips.forEach(c => {
            snapPointsSec.push(c.startTime);
            snapPointsSec.push(c.startTime + Math.max(0, c.duration));
          });
        };
        addEdges(timelineClips.v1);
        addEdges(timelineClips.v2);
        addEdges(timelineClips.a1);
        addEdges(timelineClips.a2);
        const xPx = seconds * pixelsPerSecond;
        let best = seconds;
        let bestDist = snapPxThreshold + 1;
        for (const s of snapPointsSec) {
          const px = s * pixelsPerSecond;
          const d = Math.abs(px - xPx);
          if (d < bestDist) { bestDist = d; best = s; }
        }
        if (bestDist <= snapPxThreshold) seconds = best;
      }
      // autoscroll when near edges
      const edgePx = 24;
      if (ruler) {
        const localX = ev.clientX - rect.left;
        if (localX < edgePx) setScrollX(x => Math.max(0, x - 20));
        else if (localX > rect.width - edgePx) setScrollX(x => Math.min(contentWidth, x + 20));
      }
      // throttle updates with rAF
      if (dragFrameReqRef.current) cancelAnimationFrame(dragFrameReqRef.current);
      dragFrameReqRef.current = requestAnimationFrame(() => {
        setCurrentTime(Math.max(0, Math.min(totalSeconds, seconds)));
        dragFrameReqRef.current = null;
      });
    };
    const onUp = () => { isDraggingPlayheadRef.current = false; };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      if (dragFrameReqRef.current) cancelAnimationFrame(dragFrameReqRef.current);
    };
  }, [pixelsPerSecond, contentWidth, setCurrentTime, totalSeconds, snappingOn, timelineClips, scrollX]);

  // Vertical viewport + scroll sync for tracks
  const tracksRef = useRef<HTMLDivElement | null>(null);
  const [tracksViewportHeight, setTracksViewportHeight] = useState(0);
  const [tracksContentHeight, setTracksContentHeight] = useState(0);
  const [tracksScrollY, setTracksScrollY] = useState(0);
  const vSyncingRef = useRef(false);
  const vScrollRafRef = useRef<number | null>(null);
  const vProgrammaticRef = useRef(false);
  useEffect(() => {
    const el = tracksRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      setTracksViewportHeight(el.clientHeight);
      setTracksContentHeight(el.scrollHeight);
    });
    ro.observe(el);
    setTracksViewportHeight(el.clientHeight);
    setTracksContentHeight(el.scrollHeight);
    return () => ro.disconnect();
  }, []);
  useEffect(() => {
    const max = Math.max(0, tracksContentHeight - tracksViewportHeight);
    setTracksScrollY((y) => Math.min(max, Math.max(0, y)));
  }, [tracksContentHeight, tracksViewportHeight]);
  // Direct programmatic setter to avoid rAF feedback loops
  const setTracksScrollYProgrammatic = (y: number) => {
    setTracksScrollY(y);
    const el = tracksRef.current;
    if (!el) return;
    if (Math.abs(el.scrollTop - y) <= 1) return;
    vProgrammaticRef.current = true;
    el.scrollTop = y;
    // clear the flag on next frame
    if (vScrollRafRef.current != null) cancelAnimationFrame(vScrollRafRef.current);
    vScrollRafRef.current = requestAnimationFrame(() => {
      vProgrammaticRef.current = false;
      vScrollRafRef.current = null;
    });
  };
  useEffect(() => () => {
    if (vScrollRafRef.current != null) cancelAnimationFrame(vScrollRafRef.current);
  }, []);
  const onTracksScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (vProgrammaticRef.current) return;
    const el = e.currentTarget as HTMLDivElement;
    setTracksScrollY(el.scrollTop);
  };

  // Auto-extend the timeline when the visible window nears the end (on pan or zoom)
  useEffect(() => {
    if (viewportWidth <= 0) return;
    const thresholdPx = Math.max(256, viewportWidth * 0.2);
    const deficitPx = scrollX + viewportWidth + thresholdPx - contentWidth;
    if (deficitPx > 0) {
      const pps = Math.max(1, pixelsPerSecond);
      const neededSecs = Math.ceil(deficitPx / pps);
      const chunk = 60; // grow in 60s chunks
      const addSecs = Math.max(chunk, Math.ceil(neededSecs / chunk) * chunk);
      setTotalSeconds((prev) => prev + addSecs);
    }
  }, [scrollX, viewportWidth, contentWidth, pixelsPerSecond]);

  // Tick density control: choose a major step so labels don't overlap when zoomed out
  const majorStepSec = useMemo(() => {
    const pps = pixelsPerSecond;
    if (pps >= 120) return 1; // label every 1s
    if (pps >= 60) return 2;
    if (pps >= 30) return 5;
    if (pps >= 15) return 10;
    if (pps >= 7) return 20;
    if (pps >= 3) return 30;
    return 60; // very zoomed out, label every minute
  }, [pixelsPerSecond]);
  const majorTicks = useMemo(() => {
    const pps = pixelsPerSecond;
    if (majorStepSec <= 0) return [0];
    if (viewportWidth <= 0) {
      // fallback minimal set to avoid heavy render before layout is known
      const maxCount = Math.min(200, Math.floor(totalSeconds / majorStepSec) + 1);
      return Array.from({ length: maxCount }, (_, i) => i * majorStepSec);
    }
    const padPx = viewportWidth * 0.5; // render a bit outside the viewport for smoothness
    const startPx = Math.max(0, scrollX - padPx);
    const endPx = Math.min(contentWidth, scrollX + viewportWidth + padPx);
    const startSec = startPx / Math.max(1, pps);
    const endSec = endPx / Math.max(1, pps);
    const firstTick = Math.max(0, Math.floor(startSec / majorStepSec) * majorStepSec);
    const lastTick = Math.min(totalSeconds, Math.ceil(endSec / majorStepSec) * majorStepSec);
    const count = Math.floor((lastTick - firstTick) / majorStepSec) + 1;
    return Array.from({ length: Math.max(0, count) }, (_, i) => firstTick + i * majorStepSec);
  }, [pixelsPerSecond, viewportWidth, scrollX, contentWidth, totalSeconds, majorStepSec]);

  // Format seconds to HH:MM:SS for clearer long timelines
  const formatSeconds = (sec: number) => {
    const s = Math.max(0, Math.floor(sec));
    const hh = Math.floor(s / 3600);
    const mm = Math.floor((s % 3600) / 60);
    const ss = s % 60;
    const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
    return hh > 0 ? `${pad(hh)}:${pad(mm)}:${pad(ss)}` : `${pad(mm)}:${pad(ss)}`;
  };

  // Keyboard controls: snapping toggle, transport, playhead nudge
  // Keyboard controls: snapping toggle, transport, playhead nudge, delete, link toggle, help
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || (e.target as HTMLElement | null)?.isContentEditable) return;
      const key = e.key;
      if (key === 's' || key === 'S') {
        e.preventDefault();
        setSnappingOn(v => !v);
        return;
      }
      if (key === ' '){
        e.preventDefault();
        setIsPlaying(!isPlaying);
        return;
      }
      if (key === 'ArrowLeft' || key === 'ArrowRight'){
        e.preventDefault();
        const delta = (e.shiftKey ? 10 : 1) * frameDuration * (key === 'ArrowLeft' ? -1 : 1);
        const next = Math.max(0, Math.min(totalSeconds, currentTime + delta));
        setCurrentTime(next);
        return;
      }
      if (key === ',') {
        e.preventDefault();
        setDropMode('insert');
        return;
      }
      if (key === '.') {
        e.preventDefault();
        setDropMode('overwrite');
        return;
      }
      if (key === 'ArrowUp' || key === 'ArrowDown') {
        e.preventDefault();
        const edges: number[] = [];
        const addEdges = (clips: TimelineClip[]) => clips.forEach(c => { edges.push(c.startTime); edges.push(c.startTime + c.duration); });
        addEdges(timelineClips.v1); addEdges(timelineClips.v2); addEdges(timelineClips.a1); addEdges(timelineClips.a2);
        const now = currentTime;
        if (key === 'ArrowUp') {
          const prevs = edges.filter(t => t < now).sort((a,b)=>b-a);
          if (prevs[0] != null) setCurrentTime(prevs[0]);
        } else {
          const nexts = edges.filter(t => t > now).sort((a,b)=>a-b);
          if (nexts[0] != null) setCurrentTime(nexts[0]);
        }
        return;
      }
      if (key === 'q' || key === 'Q') {
        e.preventDefault();
        // Trim start to playhead (non-ripple version)
        (['v1','v2','a1','a2'] as TrackKey[]).forEach(track => {
          timelineClips[track].forEach(c => {
            if (!selectedClipIds.has(c.id)) return;
            const start = c.startTime;
            const end = c.startTime + c.duration;
            const t = currentTime;
            if (t > start && t < end) {
              const delta = t - start;
              const newIn = c.inPoint + delta;
              const newDur = Math.max(0.1, c.duration - delta);
              updateClip(c.id, track, { inPoint: newIn, duration: newDur, outPoint: newIn + newDur });
            }
          });
        });
        return;
      }
      if (key === 'w' || key === 'W') {
        e.preventDefault();
        // Trim end to playhead (non-ripple version)
        (['v1','v2','a1','a2'] as TrackKey[]).forEach(track => {
          timelineClips[track].forEach(c => {
            if (!selectedClipIds.has(c.id)) return;
            const start = c.startTime;
            const end = c.startTime + c.duration;
            const t = currentTime;
            if (t > start && t < end) {
              const newDur = Math.max(0.1, t - start);
              updateClip(c.id, track, { duration: newDur, outPoint: c.inPoint + newDur });
            }
          });
        });
        return;
      }
      if (key === 'Delete') {
        e.preventDefault();
        const tracks: TrackKey[] = ['v1','v2','a1','a2'];
        if (e.shiftKey) {
          // Ripple delete: remove and close gaps per track
          tracks.forEach(track => {
            const clips = [...timelineClips[track]].sort((a,b)=>a.startTime-b.startTime);
            const selected = clips.filter(c => selectedClipIds.has(c.id));
            selected.forEach(sel => {
              const end = sel.startTime + sel.duration;
              const dur = sel.duration;
              removeClip(sel.id, track);
              clips
                .filter(c => !selectedClipIds.has(c.id) && c.startTime >= end)
                .forEach(c => updateClipPosition(c.id, track, Math.max(0, c.startTime - dur)));
            });
          });
        } else {
          // Lift delete: remove only
          const tracks: TrackKey[] = ['v1','v2','a1','a2'];
          tracks.forEach(track => {
            timelineClips[track].forEach(c => { if (selectedClipIds.has(c.id)) removeClip(c.id, track); });
          });
        }
        setSelectedClipIds(new Set());
        return;
      }
      if ((key === 'l' || key === 'L') && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        // Toggle link for all selected mediaIds
        const mediaIds = new Set<string>();
        (['v1','v2','a1','a2'] as TrackKey[]).forEach(track => {
          timelineClips[track].forEach(c => { if (selectedClipIds.has(c.id)) mediaIds.add(c.mediaId); });
        });
        mediaIds.forEach(id => toggleLinkForMedia(id));
        return;
      }
      if (key === '?') {
        e.preventDefault();
        setShowHelp(v => !v);
        return;
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isPlaying, setIsPlaying, setCurrentTime, totalSeconds, currentTime, timelineClips, selectedClipIds]);

  return (
  <div className="h-full min-h-[16rem] bg-timeline-bg border-t border-primary/20 flex overflow-x-hidden">
    <div className="flex-1 min-w-0 flex flex-col">
          {/* Timeline header row with timecode readout */}
          <div className="h-10 bg-panel-medium border-b border-border flex items-center justify-between px-3">
            <div className="text-xs text-muted-foreground">Timeline</div>
            <TimecodePair currentSeconds={currentTime} totalSeconds={totalSeconds} size="sm" />
          </div>

      {/* Ruler + Tracks scroll container */}
    <div className="flex-1 min-h-0 flex flex-col">
        {/* Ruler with sticky left gutter */}
        <div className="h-8 bg-panel-dark border-b border-timeline-yellow/20 flex">
          <div className="w-20 border-r border-border/50 bg-panel-dark sticky left-0 z-10" />
          <div 
            ref={rulerRef}
            onScroll={onRulerScroll}
            onMouseDown={(e)=>{
              // start dragging playhead anywhere on ruler
              isDraggingPlayheadRef.current = true;
              const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
              const x = e.clientX - rect.left + scrollX;
              const secs = Math.max(0, Math.min(totalSeconds, x / Math.max(1, pixelsPerSecond)));
              setCurrentTime(secs);
            }}
            className="relative flex-1 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] cursor-col-resize"
          >
            <div className="relative" style={{ width: `${contentWidth}px` }}>
              {/* Ticks */}
              <div className="absolute inset-0">
                {majorTicks.map((sec) => {
                  const left = sec * pixelsPerSecond;
                  return (
                    <div key={sec} className="absolute top-0" style={{ left }}>
                      <div className="w-px h-4 bg-timeline-yellow/30" />
                      {/* mid ticks when zoomed in (half-second) */}
                      {pixelsPerSecond >= 80 && majorStepSec === 1 && (
                        <div className="absolute left-1/2 -translate-x-1/2 top-0 w-px h-2 bg-timeline-yellow/20" />
                      )}
                      <span className="absolute top-4 -translate-x-1 text-[10px] text-timeline-yellow font-mono font-semibold select-none">
                        {formatSeconds(sec)}
                      </span>
                    </div>
                  );
                })}
              </div>
              {/* Playhead */}
              <div className="absolute top-0 bottom-0 w-0.5 bg-timeline-yellow shadow-glow-yellow" style={{ left: playheadLeft }}>
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-timeline-yellow rounded-sm shadow-glow-yellow" />
                <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[6px] border-t-timeline-yellow" />
              </div>
            </div>
          </div>
        </div>

        {/* Horizontal Zoom + Pan Scrollbar */}
        <TimelineZoomScrollbar
          totalSeconds={totalSeconds}
          zoom={zoom}
          minZoom={minZoom}
          maxZoom={maxZoom}
          onZoomChange={setZoom}
          scrollX={scrollX}
          onScrollXChange={setScrollX}
          viewportWidth={viewportWidth}
          size="large"
          scaleDown={false}
          hideHandles={false}
          tone="timeline"
          detached
          className="border-t-timeline-yellow/30"
        />

  {/* Tracks area + Vertical zoom bar container (early version) */}
        <div className="flex-1 min-h-0 flex">
          {/* Tracks area: each row shares horizontal scroll; left controls sticky */}
          <div ref={tracksRef} onScroll={onTracksScroll} className="flex-1 overflow-y-auto overflow-x-hidden tracks-scrollbar">
          {/* Video Track 2 */}
          <div className="h-16 bg-timeline-track border-b border-border/50 border-l-2 border-l-primary/20 flex items-center hover:bg-timeline-track/80 transition-colors">
            <div className="w-20 flex flex-col items-center justify-center gap-1 border-r border-border px-1.5 py-1 sticky left-0 z-50 bg-timeline-track">
              <div className="flex items-center gap-1 w-full justify-between">
                <span className="text-xs text-primary font-semibold">V2</span>
                <div className="flex gap-0.5">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className={`h-5 w-5 ${trackStates.v2.visible ? 'text-primary' : 'text-muted-foreground'} hover:text-foreground`}
                    onClick={() => setTrackStates(prev => ({ ...prev, v2: { ...prev.v2, visible: !prev.v2.visible }}))}
                    aria-label={trackStates.v2.visible ? 'Hide track V2' : 'Show track V2'}
                    aria-pressed={trackStates.v2.visible}
                  >
                    {trackStates.v2.visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className={`h-5 w-5 ${trackStates.v2.locked ? 'text-primary' : 'text-muted-foreground'} hover:text-foreground`}
                    onClick={() => setTrackStates(prev => ({ ...prev, v2: { ...prev.v2, locked: !prev.v2.locked }}))}
                    aria-label={trackStates.v2.locked ? 'Unlock track V2' : 'Lock track V2'}
                    aria-pressed={trackStates.v2.locked}
                  >
                    {trackStates.v2.locked ? <Lock className="w-3 h-3" /> : <LockOpen className="w-3 h-3" />}
                  </Button>
                </div>
              </div>
            </div>
            <div className="flex-1 relative h-12 px-1" onDragOver={(e)=>e.preventDefault()} onDrop={handleTrackDrop('v2')}>
              <div className="relative h-full" style={{ width: `${contentWidth}px`, transform: `translate3d(${-scrollX}px, 0, 0)`, willChange: 'transform' }} onMouseDown={(e)=>{
                const target = e.target as HTMLElement;
                if (!target.closest('[data-clip-id]')) setSelectedClipIds(new Set());
              }}>
                {/* Grid lines (snapping guides) */}
                {majorTicks.map((sec) => (
                  <div key={sec} className="absolute top-0 bottom-0 w-px bg-timeline-yellow/10" style={{ left: sec * pixelsPerSecond }} />
                ))}
                {/* Playhead */}
                <div className="absolute top-0 bottom-0 w-0.5 bg-timeline-yellow" style={{ left: playheadLeft }} />
                {/* Clips V2 */}
                {timelineClips.v2.map((clip) => renderClip(clip, 'video', 'v2', pixelsPerSecond))}
              </div>
              {/* left fade scrim to prevent visual bleed under sticky controls */}
              <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-timeline-bg/80 to-transparent z-40" />
            </div>
          </div>

          {/* Video Track 1 */}
          <div className="h-16 bg-timeline-track border-b border-border/50 border-l-2 border-l-primary/20 flex items-center hover:bg-timeline-track/80 transition-colors">
            {/* Track Controls - Enhanced */}
            <div className="w-20 flex flex-col items-center justify-center gap-1 border-r border-border px-1.5 py-1 sticky left-0 z-50 bg-timeline-track">
              <div className="flex items-center gap-1 w-full justify-between">
                <span className="text-xs text-primary font-semibold">V1</span>
                <div className="flex gap-0.5">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className={`h-5 w-5 ${trackStates.v1.visible ? 'text-primary' : 'text-muted-foreground'} hover:text-foreground`}
                    onClick={() => setTrackStates(prev => ({ ...prev, v1: { ...prev.v1, visible: !prev.v1.visible }}))}
                    aria-label={trackStates.v1.visible ? 'Hide track V1' : 'Show track V1'}
                    aria-pressed={trackStates.v1.visible}
                  >
                    {trackStates.v1.visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className={`h-5 w-5 ${trackStates.v1.locked ? 'text-primary' : 'text-muted-foreground'} hover:text-foreground`}
                    onClick={() => setTrackStates(prev => ({ ...prev, v1: { ...prev.v1, locked: !prev.v1.locked }}))}
                    aria-label={trackStates.v1.locked ? 'Unlock track V1' : 'Lock track V1'}
                    aria-pressed={trackStates.v1.locked}
                  >
                    {trackStates.v1.locked ? <Lock className="w-3 h-3" /> : <LockOpen className="w-3 h-3" />}
                  </Button>
                </div>
              </div>
            </div>
            <div className="flex-1 relative h-12 px-1" onDragOver={(e)=>e.preventDefault()} onDrop={handleTrackDrop('v1')}>
              <div className="relative h-full" style={{ width: `${contentWidth}px`, transform: `translate3d(${-scrollX}px, 0, 0)`, willChange: 'transform' }} onMouseDown={(e)=>{
                const target = e.target as HTMLElement;
                if (!target.closest('[data-clip-id]')) setSelectedClipIds(new Set());
              }}>
                {/* Grid lines */}
                {majorTicks.map((sec) => (
                  <div key={sec} className="absolute top-0 bottom-0 w-px bg-timeline-yellow/10" style={{ left: sec * pixelsPerSecond }} />
                ))}
                {/* Playhead */}
                <div className="absolute top-0 bottom-0 w-0.5 bg-timeline-yellow" style={{ left: playheadLeft }} />
                {/* Clips V1 */}
                {timelineClips.v1.map((clip) => renderClip(clip, 'video', 'v1', pixelsPerSecond))}
              </div>
              <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-timeline-bg/80 to-transparent z-40" />
            </div>
          </div>

          {/* Separator between Video and Audio */}
          <div className="h-1 bg-gradient-to-r from-primary/30 via-primary/50 to-primary/30 border-y border-primary/20" />

          {/* Audio Track 1 */}
          <div className="h-16 bg-timeline-track border-b border-border/50 border-l-2 border-l-primary/20 flex items-center hover:bg-timeline-track/80 transition-colors">
            <div className="w-20 flex flex-col items-center justify-center gap-1 border-r border-border px-1.5 py-1 sticky left-0 z-50 bg-timeline-track">
              <div className="flex items-center gap-1 w-full justify-between">
                <span className="text-xs text-green-500 font-semibold">A1</span>
                <div className="flex gap-0.5">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className={`h-5 w-5 ${trackStates.a1.muted ? 'text-red-500' : 'text-primary'} hover:text-foreground`}
                    onClick={() => setTrackStates(prev => ({ ...prev, a1: { ...prev.a1, muted: !prev.a1.muted }}))}
                    aria-label={trackStates.a1.muted ? 'Unmute track A1' : 'Mute track A1'}
                    aria-pressed={trackStates.a1.muted}
                  >
                    {trackStates.a1.muted ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className={`h-5 w-5 ${trackStates.a1.locked ? 'text-primary' : 'text-muted-foreground'} hover:text-foreground`}
                    onClick={() => setTrackStates(prev => ({ ...prev, a1: { ...prev.a1, locked: !prev.a1.locked }}))}
                    aria-label={trackStates.a1.locked ? 'Unlock track A1' : 'Lock track A1'}
                    aria-pressed={trackStates.a1.locked}
                  >
                    {trackStates.a1.locked ? <Lock className="w-3 h-3" /> : <LockOpen className="w-3 h-3" />}
                  </Button>
                </div>
              </div>
            </div>
            <div className="flex-1 relative h-12 px-1" onDragOver={(e)=>e.preventDefault()} onDrop={handleTrackDrop('a1')}>
              <div className="relative h-full" style={{ width: `${contentWidth}px`, transform: `translate3d(${-scrollX}px, 0, 0)`, willChange: 'transform' }} onMouseDown={(e)=>{
                const target = e.target as HTMLElement;
                if (!target.closest('[data-clip-id]')) setSelectedClipIds(new Set());
              }}>
                {/* Fake waveform grid + playhead */}
                {majorTicks.map((sec) => (
                  <div key={sec} className="absolute top-0 bottom-0 w-px bg-timeline-yellow/10" style={{ left: sec * pixelsPerSecond }} />
                ))}
                <div className="absolute top-0 bottom-0 w-0.5 bg-timeline-yellow" style={{ left: playheadLeft }} />
                {/* Clips A1 */}
                {timelineClips.a1.map((clip) => renderClip(clip, 'audio', 'a1', pixelsPerSecond))}
              </div>
              <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-timeline-bg/80 to-transparent z-40" />
            </div>
          </div>

          {/* Audio Track 2 */}
          <div className="h-16 bg-timeline-track border-b border-border/50 border-l-2 border-l-primary/20 flex items-center hover:bg-timeline-track/80 transition-colors">
            <div className="w-20 flex flex-col items-center justify-center gap-1 border-r border-border px-1.5 py-1 sticky left-0 z-50 bg-timeline-track">
              <div className="flex items-center gap-1 w-full justify-between">
                <span className="text-xs text-green-500 font-semibold">A2</span>
                <div className="flex gap-0.5">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className={`h-5 w-5 ${trackStates.a2.muted ? 'text-red-500' : 'text-primary'} hover:text-foreground`}
                    onClick={() => setTrackStates(prev => ({ ...prev, a2: { ...prev.a2, muted: !prev.a2.muted }}))}
                    aria-label={trackStates.a2.muted ? 'Unmute track A2' : 'Mute track A2'}
                    aria-pressed={trackStates.a2.muted}
                  >
                    {trackStates.a2.muted ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className={`h-5 w-5 ${trackStates.a2.locked ? 'text-primary' : 'text-muted-foreground'} hover:text-foreground`}
                    onClick={() => setTrackStates(prev => ({ ...prev, a2: { ...prev.a2, locked: !prev.a2.locked }}))}
                    aria-label={trackStates.a2.locked ? 'Unlock track A2' : 'Lock track A2'}
                    aria-pressed={trackStates.a2.locked}
                  >
                    {trackStates.a2.locked ? <Lock className="w-3 h-3" /> : <LockOpen className="w-3 h-3" />}
                  </Button>
                </div>
              </div>
            </div>
            <div className="flex-1 relative h-12 px-1" onDragOver={(e)=>e.preventDefault()} onDrop={handleTrackDrop('a2')}>
              <div className="relative h-full" style={{ width: `${contentWidth}px`, transform: `translate3d(${-scrollX}px, 0, 0)`, willChange: 'transform' }} onMouseDown={(e)=>{
                const target = e.target as HTMLElement;
                if (!target.closest('[data-clip-id]')) setSelectedClipIds(new Set());
              }}>
                {majorTicks.map((sec) => (
                  <div key={sec} className="absolute top-0 bottom-0 w-px bg-timeline-yellow/10" style={{ left: sec * pixelsPerSecond }} />
                ))}
                <div className="absolute top-0 bottom-0 w-0.5 bg-timeline-yellow" style={{ left: playheadLeft }} />
                {/* Clips A2 */}
                {timelineClips.a2.map((clip) => renderClip(clip, 'audio', 'a2', pixelsPerSecond))}
              </div>
              <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-timeline-bg/80 to-transparent z-40" />
            </div>
          </div>
          </div>

          {/* Native vertical scrollbar only (custom vertical bar removed) */}
        </div>
      </div>
    </div>

    {/* Audio Level Meter - Right Side (placed at end to truly render on right) */}
    <div className="w-12 bg-panel-dark border-l border-border flex flex-col items-center py-2">
      <div className="text-[10px] text-muted-foreground mb-2 rotate-0 writing-mode-vertical">AUDIO</div>
      <div className="flex-1 flex gap-1 justify-center">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="w-2 bg-panel-medium rounded-full relative overflow-hidden">
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-green-500 via-timeline-yellow to-red-500" style={{ height: `${40 + Math.random() * 30}%` }} />
          </div>
        ))}
      </div>
      <div className="text-[9px] text-muted-foreground mt-1">-12 dB</div>
    </div>

    {/* Help overlay */}
    {showHelp && (
      <div className="fixed inset-0 bg-black/60 z-[1000]" onClick={()=>setShowHelp(false)}>
        <div className="absolute top-12 left-1/2 -translate-x-1/2 w-[28rem] max-w-[90vw] bg-panel-dark border border-border rounded-lg shadow-xl p-4 text-sm text-foreground">
          <div className="flex items-center justify-between mb-2">
            <div className="font-semibold">Shortcuts</div>
            <div className="text-xs text-muted-foreground">Press ? to close</div>
          </div>
          <ul className="grid grid-cols-2 gap-y-1 gap-x-4">
            <li><span className="text-muted-foreground">Play/Pause</span> <span className="float-right">Space</span></li>
            <li><span className="text-muted-foreground">Toggle snapping</span> <span className="float-right">S</span></li>
            <li><span className="text-muted-foreground">Insert mode</span> <span className="float-right">,</span></li>
            <li><span className="text-muted-foreground">Overwrite mode</span> <span className="float-right">.</span></li>
            <li><span className="text-muted-foreground">Nudge frame</span> <span className="float-right">←/→</span></li>
            <li><span className="text-muted-foreground">Nudge coarse</span> <span className="float-right">Shift + ←/→</span></li>
            <li><span className="text-muted-foreground">Prev/Next edit</span> <span className="float-right">↑/↓</span></li>
            <li><span className="text-muted-foreground">Lift delete</span> <span className="float-right">Delete</span></li>
            <li><span className="text-muted-foreground">Ripple delete</span> <span className="float-right">Shift + Delete</span></li>
            <li><span className="text-muted-foreground">Toggle A/V link</span> <span className="float-right">Cmd/Ctrl + L</span></li>
          </ul>
          <div className="mt-3 text-xs text-muted-foreground">Tip: Current drop mode is <span className="text-primary font-semibold">{dropMode}</span>. Use , and . to switch. Ripple trim via Shift-drag on trim handles is coming soon.</div>
        </div>
      </div>
    )}
  </div>
  );
};
