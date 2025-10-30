import { Play, Pause, SkipBack, SkipForward, ZoomIn, ZoomOut, Eye, EyeOff, Lock, LockOpen, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useState } from "react";
import { useMedia } from "@/context/MediaContext";
import { usePlayback } from "@/context/PlaybackContext";

export const Timeline = () => {
  const { timelineClips, updateClipPosition } = useMedia();
  const { isPlaying, currentTime, duration, setIsPlaying, setCurrentTime } = usePlayback();
  const [trackStates, setTrackStates] = useState({
    v1: { visible: true, locked: false, muted: false },
    a1: { visible: true, locked: false, muted: false },
    v2: { visible: true, locked: false, muted: false },
    a2: { visible: true, locked: false, muted: false },
  });
  const [draggingClip, setDraggingClip] = useState<{id: string; track: string; offsetX: number} | null>(null);

  // Convert seconds to pixels (1 second = 20 pixels for now)
  const PIXELS_PER_SECOND = 20;

  const formatTimecode = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const frames = Math.floor((seconds % 1) * 30);
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}:${frames.toString().padStart(2, '0')}`;
  };

  const handleClipDragStart = (e: React.DragEvent, clipId: string, track: string, startTime: number) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    setDraggingClip({ id: clipId, track, offsetX });
  };

  const handleClipDrop = (e: React.DragEvent, targetTrack: string) => {
    e.preventDefault();
    if (!draggingClip) return;

    // Calculate new start time based on drop position
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - draggingClip.offsetX;
    const newStartTime = Math.max(0, x / PIXELS_PER_SECOND);

    // Update clip position
    updateClipPosition(draggingClip.id, targetTrack as any, newStartTime);
    setDraggingClip(null);
  };

  const renderClip = (clip: any, trackType: 'video' | 'audio') => {
    const widthPx = clip.duration * PIXELS_PER_SECOND;
    const leftPx = clip.startTime * PIXELS_PER_SECOND;
    const maxNameWidth = widthPx - 8; // Padding

    if (trackType === 'video') {
      return (
        <div
          key={clip.id}
          draggable
          onDragStart={(e) => handleClipDragStart(e, clip.id, 'v1', clip.startTime)}
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
          onDragStart={(e) => handleClipDragStart(e, clip.id, 'a1', clip.startTime)}
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

  return (
  <div className="h-full min-h-[16rem] bg-timeline-bg border-t border-primary/20 flex">
      {/* Audio Level Meter - Right Side */}
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
      
      <div className="flex-1 flex flex-col">
      {/* Timeline Controls */}
      <div className="h-12 bg-panel-medium border-b border-border flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8"
            onClick={() => setCurrentTime(0)}
          >
            <SkipBack className="w-4 h-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-9 w-9 bg-primary hover:bg-primary/90"
            onClick={() => setIsPlaying(!isPlaying)}
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 text-primary-foreground" />
            ) : (
              <Play className="w-5 h-5 text-primary-foreground" />
            )}
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8"
            onClick={() => setCurrentTime(duration)}
          >
            <SkipForward className="w-4 h-4" />
          </Button>
          <div className="ml-4 text-sm font-mono text-foreground">{formatTimecode(currentTime)}</div>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Zoom controls moved to PreviewMonitor (near volume) */}
        </div>
      </div>

      {/* Timeline Ruler - Yellow accented */}
      <div className="h-8 bg-panel-dark border-b border-timeline-yellow/20 relative">
        <div className="absolute inset-0 flex items-center px-20">
          {[0, 5, 10, 15, 20, 25, 30].map((time) => (
            <div key={time} className="flex-1 relative">
              <div className="absolute left-0 top-0 w-px h-full bg-timeline-yellow/30" />
              <span className="absolute left-1 top-1 text-[10px] text-timeline-yellow font-mono font-semibold">
                {time}s
              </span>
              {/* Tick marks */}
              {time < 30 && (
                <>
                  <div className="absolute left-1/4 top-0 w-px h-2 bg-timeline-yellow/20" />
                  <div className="absolute left-1/2 top-0 w-px h-3 bg-timeline-yellow/25" />
                  <div className="absolute left-3/4 top-0 w-px h-2 bg-timeline-yellow/20" />
                </>
              )}
            </div>
          ))}
          {/* Markers - colored */}
          <div className="absolute left-32 top-0 w-2 h-2 bg-green-500 rounded-sm shadow-sm" />
          <div className="absolute left-64 top-0 w-2 h-2 bg-blue-500 rounded-sm shadow-sm" />
        </div>
        {/* Playhead - Yellow glowing - synced with playback */}
        <div 
          className="absolute top-0 bottom-0 w-0.5 bg-timeline-yellow shadow-glow-yellow transition-all duration-75"
          style={{ left: `${(currentTime * PIXELS_PER_SECOND)}px` }}
        >
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-timeline-yellow rounded-sm shadow-glow-yellow" />
          <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[6px] border-t-timeline-yellow" />
        </div>
      </div>

  {/* Timeline Tracks */}
  <div className="flex-1 overflow-y-auto timeline-scrollbar">
        {/* Video Track 2 */}
        <div className="h-16 bg-timeline-track border-b border-border/50 border-l-2 border-l-primary/20 flex items-center hover:bg-timeline-track/80 transition-colors">
          <div className="w-20 flex flex-col items-center justify-center gap-1 border-r border-border px-1.5 py-1">
            <div className="flex items-center gap-1 w-full justify-between">
              <span className="text-xs text-primary font-semibold">V2</span>
              <div className="flex gap-0.5">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className={`h-5 w-5 ${trackStates.v2.visible ? 'text-primary' : 'text-muted-foreground'} hover:text-foreground`}
                  onClick={() => setTrackStates(prev => ({ ...prev, v2: { ...prev.v2, visible: !prev.v2.visible }}))}
                >
                  {trackStates.v2.visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className={`h-5 w-5 ${trackStates.v2.locked ? 'text-primary' : 'text-muted-foreground'} hover:text-foreground`}
                  onClick={() => setTrackStates(prev => ({ ...prev, v2: { ...prev.v2, locked: !prev.v2.locked }}))}
                >
                  {trackStates.v2.locked ? <Lock className="w-3 h-3" /> : <LockOpen className="w-3 h-3" />}
                </Button>
              </div>
            </div>
          </div>
          <div 
            className="flex-1 relative h-12 px-1"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => handleClipDrop(e, 'v2')}
          >
            {/* Video 2 clips */}
            {timelineClips.v2.map((clip) => renderClip(clip, 'video'))}
          </div>
        </div>

        {/* Video Track 1 */}
        <div className="h-16 bg-timeline-track border-b border-border/50 border-l-2 border-l-primary/20 flex items-center hover:bg-timeline-track/80 transition-colors">
          {/* Track Controls - Enhanced */}
          <div className="w-20 flex flex-col items-center justify-center gap-1 border-r border-border px-1.5 py-1">
            <div className="flex items-center gap-1 w-full justify-between">
              <span className="text-xs text-primary font-semibold">V1</span>
              <div className="flex gap-0.5">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className={`h-5 w-5 ${trackStates.v1.visible ? 'text-primary' : 'text-muted-foreground'} hover:text-foreground`}
                  onClick={() => setTrackStates(prev => ({ ...prev, v1: { ...prev.v1, visible: !prev.v1.visible }}))}
                >
                  {trackStates.v1.visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className={`h-5 w-5 ${trackStates.v1.locked ? 'text-primary' : 'text-muted-foreground'} hover:text-foreground`}
                  onClick={() => setTrackStates(prev => ({ ...prev, v1: { ...prev.v1, locked: !prev.v1.locked }}))}
                >
                  {trackStates.v1.locked ? <Lock className="w-3 h-3" /> : <LockOpen className="w-3 h-3" />}
                </Button>
              </div>
            </div>
          </div>
          <div 
            className="flex-1 relative h-12 px-1"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => handleClipDrop(e, 'v1')}
          >
            {/* Video 1 clips */}
            {timelineClips.v1.map((clip) => renderClip(clip, 'video'))}
          </div>
        </div>

        {/* Separator between Video and Audio */}
        <div className="h-1 bg-gradient-to-r from-primary/30 via-primary/50 to-primary/30 border-y border-primary/20" />

        {/* Audio Track 1 */}
        <div className="h-16 bg-timeline-track border-b border-border/50 border-l-2 border-l-primary/20 flex items-center hover:bg-timeline-track/80 transition-colors">
          <div className="w-20 flex flex-col items-center justify-center gap-1 border-r border-border px-1.5 py-1">
            <div className="flex items-center gap-1 w-full justify-between">
              <span className="text-xs text-green-500 font-semibold">A1</span>
              <div className="flex gap-0.5">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className={`h-5 w-5 ${trackStates.a1.muted ? 'text-red-500' : 'text-primary'} hover:text-foreground`}
                  onClick={() => setTrackStates(prev => ({ ...prev, a1: { ...prev.a1, muted: !prev.a1.muted }}))}
                >
                  {trackStates.a1.muted ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className={`h-5 w-5 ${trackStates.a1.locked ? 'text-primary' : 'text-muted-foreground'} hover:text-foreground`}
                  onClick={() => setTrackStates(prev => ({ ...prev, a1: { ...prev.a1, locked: !prev.a1.locked }}))}
                >
                  {trackStates.a1.locked ? <Lock className="w-3 h-3" /> : <LockOpen className="w-3 h-3" />}
                </Button>
              </div>
            </div>
          </div>
          <div 
            className="flex-1 relative h-12 px-1"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => handleClipDrop(e, 'a1')}
          >
            {/* Audio 1 clips */}
            {timelineClips.a1.map((clip) => renderClip(clip, 'audio'))}
          </div>
        </div>

        {/* Audio Track 2 */}
        <div className="h-16 bg-timeline-track border-b border-border/50 border-l-2 border-l-primary/20 flex items-center hover:bg-timeline-track/80 transition-colors">
          <div className="w-20 flex flex-col items-center justify-center gap-1 border-r border-border px-1.5 py-1">
            <div className="flex items-center gap-1 w-full justify-between">
              <span className="text-xs text-green-500 font-semibold">A2</span>
              <div className="flex gap-0.5">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className={`h-5 w-5 ${trackStates.a2.muted ? 'text-red-500' : 'text-primary'} hover:text-foreground`}
                  onClick={() => setTrackStates(prev => ({ ...prev, a2: { ...prev.a2, muted: !prev.a2.muted }}))}
                >
                  {trackStates.a2.muted ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className={`h-5 w-5 ${trackStates.a2.locked ? 'text-primary' : 'text-muted-foreground'} hover:text-foreground`}
                  onClick={() => setTrackStates(prev => ({ ...prev, a2: { ...prev.a2, locked: !prev.a2.locked }}))}
                >
                  {trackStates.a2.locked ? <Lock className="w-3 h-3" /> : <LockOpen className="w-3 h-3" />}
                </Button>
              </div>
            </div>
          </div>
          <div 
            className="flex-1 relative h-12 px-1"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => handleClipDrop(e, 'a2')}
          >
            {/* Audio 2 clips */}
            {timelineClips.a2.map((clip) => renderClip(clip, 'audio'))}
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};
