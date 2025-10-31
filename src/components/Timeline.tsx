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
  const { timelineClips, updateClipPosition, addClipToTimeline, moveClip } = useMedia();
  const { isPlaying, currentTime, duration, setIsPlaying, setCurrentTime } = usePlayback();
  const [trackStates, setTrackStates] = useState({
    v1: { visible: true, locked: false, muted: false },
    a1: { visible: true, locked: false, muted: false },
    v2: { visible: true, locked: false, muted: false },
    a2: { visible: true, locked: false, muted: false },
  });
  type TrackKey = 'v1' | 'v2' | 'a1' | 'a2';
  const [draggingClip, setDraggingClip] = useState<{id: string; track: TrackKey; offsetX: number} | null>(null);

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
  };

  const handleTrackDrop = (targetTrack: TrackKey) => (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    // account for horizontal scroll offset
    const newStartTime = Math.max(0, (x + scrollX - (draggingClip ? draggingClip.offsetX : 0)) / Math.max(1, pixelsPerSecond));

    // Case 1: internal drag of an existing timeline clip
    if (draggingClip) {
      if (draggingClip.track === targetTrack) {
        updateClipPosition(draggingClip.id, targetTrack, newStartTime);
      } else {
        // move across tracks
        moveClip(draggingClip.id, draggingClip.track, targetTrack, newStartTime);
      }
      setDraggingClip(null);
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
            file: (file as any).file,
          };
          addClipToTimeline(clip, targetTrack);
        }
      }
    } catch {}
  };

  const renderClip = (clip: TimelineClip, trackType: 'video' | 'audio', trackKey: TrackKey, pps: number) => {
    const widthPx = clip.duration * pps;
    const leftPx = clip.startTime * pps;
    const maxNameWidth = widthPx - 8; // Padding

    if (trackType === 'video') {
      return (
        <div
          key={clip.id}
          draggable
          onDragStart={(e) => handleClipDragStart(e, clip.id, trackKey, clip.startTime)}
          className="absolute top-1 bottom-1 bg-clip-video/80 hover:bg-clip-video rounded border border-clip-video hover:border-primary flex flex-col items-start justify-between p-1 text-xs font-medium shadow-md hover:shadow-panel-hover transition-all cursor-move"
          style={{ left: `${leftPx}px`, width: `${widthPx}px` }}
        >
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
          className="absolute top-1 bottom-1 bg-clip-audio/30 hover:bg-clip-audio/40 rounded border border-clip-audio hover:border-primary flex flex-col px-2 py-1 shadow-md hover:shadow-panel-hover transition-all cursor-move"
          style={{ left: `${leftPx}px`, width: `${widthPx}px` }}
        >
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
  const pixelsPerSecond = useMemo(() => 20 * Math.pow(2, zoom), [zoom]);
  const contentWidth = useMemo(() => totalSeconds * pixelsPerSecond, [totalSeconds, pixelsPerSecond]);

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

  return (
  <div className="h-full min-h-[16rem] bg-timeline-bg border-t border-primary/20 flex">
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
          <div ref={rulerRef} onScroll={onRulerScroll} className="relative flex-1 overflow-x-auto timeline-scrollbar">
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

        {/* Horizontal Zoom + Pan Scrollbar directly below the ruler */}
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
          <div ref={tracksRef} onScroll={onTracksScroll} className="flex-1 overflow-y-auto tracks-scrollbar">
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
              <div className="relative h-full" style={{ width: `${contentWidth}px`, transform: `translate3d(${-scrollX}px, 0, 0)`, willChange: 'transform' }}>
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
              <div className="relative h-full" style={{ width: `${contentWidth}px`, transform: `translate3d(${-scrollX}px, 0, 0)`, willChange: 'transform' }}>
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
              <div className="relative h-full" style={{ width: `${contentWidth}px`, transform: `translate3d(${-scrollX}px, 0, 0)`, willChange: 'transform' }}>
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
              <div className="relative h-full" style={{ width: `${contentWidth}px`, transform: `translate3d(${-scrollX}px, 0, 0)`, willChange: 'transform' }}>
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

          {/* Vertical Scroll-Zoom Bar (panning only) on the right */}
          <div className="w-6 mr-4 border-l border-border/50 bg-panel-dark/60">
            <TimelineZoomScrollbar
              totalSeconds={totalSeconds}
              zoom={zoom}
              minZoom={minZoom}
              maxZoom={maxZoom}
              onZoomChange={setZoom}
              scrollX={scrollX}
              onScrollXChange={setScrollX}
              viewportWidth={viewportWidth}
              orientation="vertical"
              size="small"
              hideTrack={false}
              hideHandles={true}
              scaleDown={false}
              detached
              tone="neutral"
              contentHeight={tracksContentHeight}
              viewportHeight={tracksViewportHeight}
              scrollY={tracksScrollY}
              onScrollYChange={setTracksScrollYProgrammatic}
            />
          </div>
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
  </div>
  );
};
