import {
  Play,
  Pause,
  Maximize,
  Settings,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { usePlayback } from "@/context/PlaybackContext";
import { useMedia } from "@/context/MediaContext";
import { useEffect, useRef } from "react";

type PreviewMonitorProps = {
  focusMode?: boolean;
};

export const PreviewMonitor = ({ focusMode = false }: PreviewMonitorProps) => {
  const { isPlaying, currentTime, duration, setIsPlaying, setCurrentTime } = usePlayback();
  const { timelineClips } = useMedia();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Find the active video clip at current time
  const getActiveClip = () => {
    const allVideoClips = [...timelineClips.v1, ...timelineClips.v2];
    return allVideoClips.find(clip => 
      currentTime >= clip.startTime && currentTime < clip.startTime + clip.duration
    );
  };

  const activeClip = getActiveClip();

  // Load and render the active clip
  useEffect(() => {
    if (!activeClip || !activeClip.file || !videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Load video file
    const url = URL.createObjectURL(activeClip.file);
    video.src = url;

    const updateCanvas = () => {
      if (video.readyState >= 2) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      }
    };

    // Calculate the time within the clip (accounting for in/out points)
    const timeInClip = (currentTime - activeClip.startTime) + activeClip.inPoint;
    
    video.onloadedmetadata = () => {
      video.currentTime = Math.max(0, Math.min(timeInClip, video.duration));
      updateCanvas();
    };

    video.onseeked = updateCanvas;

    if (isPlaying && video.paused) {
      video.play().catch(() => {});
    } else if (!isPlaying && !video.paused) {
      video.pause();
    }

    return () => {
      URL.revokeObjectURL(url);
      video.src = '';
    };
  }, [activeClip, currentTime, isPlaying]);

  // Update video current time as playback progresses
  useEffect(() => {
    if (!activeClip || !videoRef.current) return;
    
    const video = videoRef.current;
    const timeInClip = (currentTime - activeClip.startTime) + activeClip.inPoint;
    
    if (Math.abs(video.currentTime - timeInClip) > 0.1) {
      video.currentTime = Math.max(0, Math.min(timeInClip, video.duration));
    }
  }, [currentTime, activeClip]);

  const formatTimecode = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const frames = Math.floor((seconds % 1) * 30);
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}:${frames.toString().padStart(2, '0')}`;
  };
  return (
    <div className="h-full bg-panel-medium border-l-2 border-l-primary/20 border-t border-border flex flex-col overflow-hidden min-w-0">
      {/* Header */}
      <div className="h-12 border-b border-border flex items-center justify-between px-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-semibold text-foreground">Program Monitor</h2>
          <span className="rounded bg-panel-light px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            Sequence
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Select defaultValue="full">
            <SelectTrigger className="h-8 min-w-[7rem] text-xs bg-input border-border">
              <SelectValue placeholder="Quality" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="full">Full Quality</SelectItem>
              <SelectItem value="half">1/2 Quality</SelectItem>
              <SelectItem value="quarter">1/4 Quality</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Monitor Display */}
      <div className="flex-1 bg-monitor-bg flex items-center justify-center p-2">
        <div className="relative w-full max-w-3xl aspect-video bg-black rounded border border-border overflow-hidden">
          {/* Hidden video element for loading */}
          <video ref={videoRef} className="hidden" />
          
          {/* Canvas for rendering video frames */}
          <canvas 
            ref={canvasRef}
            className={`w-full h-full object-contain ${activeClip ? '' : 'hidden'}`}
          />
          
          {/* Placeholder when no clip is active */}
          {!activeClip && (
            <div className="absolute inset-0 bg-gradient-to-br from-panel-dark via-panel-medium to-panel-dark flex items-center justify-center">
              <div className="text-center">
                <Play className="w-16 h-16 mx-auto mb-3 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Program Monitor</p>
                <p className="text-xs text-muted-foreground mt-1">No clips on timeline</p>
              </div>
            </div>
          )}

          {/* Overlay Info */}
          <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded text-xs font-mono text-foreground">
            {formatTimecode(currentTime)}
          </div>
          {isPlaying && (
            <div className="absolute top-3 right-3 bg-red-500/80 backdrop-blur-sm px-3 py-1.5 rounded text-xs text-white font-semibold">
              ⏺ PLAYING
            </div>
          )}
          
          {/* Scrub Bar */}
          <div 
            className="absolute bottom-0 left-0 right-0 h-2 bg-panel-dark/80 cursor-pointer"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const x = e.clientX - rect.left;
              const percent = x / rect.width;
              setCurrentTime(percent * duration);
            }}
          >
            <div 
              className="absolute left-0 top-0 bottom-0 bg-primary/50"
              style={{ width: `${(currentTime / duration) * 100}%` }}
            />
            <div 
              className="absolute top-0 bottom-0 w-1 bg-timeline-yellow shadow-glow-yellow"
              style={{ left: `${(currentTime / duration) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Controls - Redesigned */}
      <div className="h-16 border-t border-border bg-monitor-controls px-6 flex items-center justify-between gap-6">
        {/* Left: Playback Controls */}
        <div className="flex items-center gap-1.5">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 hover:text-primary"
            onClick={() => setCurrentTime(0)}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16">
              <path d="M8 1a1 1 0 0 1 1 1v12a1 1 0 1 1-2 0V2a1 1 0 0 1 1-1z" />
              <path d="M0 7a1 1 0 0 1 1-1h6a1 1 0 1 1 0 2H1a1 1 0 0 1-1-1z" />
            </svg>
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-10 w-10 bg-gradient-primary hover:opacity-90 shadow-glow-primary"
            onClick={() => setIsPlaying(!isPlaying)}
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 text-white" />
            ) : (
              <Play className="w-5 h-5 text-white" />
            )}
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 hover:text-primary"
            onClick={() => setCurrentTime(duration)}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16">
              <path d="M8 1a1 1 0 0 1 1 1v12a1 1 0 1 1-2 0V2a1 1 0 0 1 1-1z" />
              <path d="M9 7a1 1 0 0 1 1-1h6a1 1 0 1 1 0 2h-6a1 1 0 0 1-1-1z" />
            </svg>
          </Button>
        </div>

        {/* Center: Timecode Display */}
        <div className="flex items-center gap-3">
          <div className="text-base font-mono tabular-nums text-primary font-semibold tracking-wider">
            {formatTimecode(currentTime)}
          </div>
          <span className="text-muted-foreground">/</span>
          <div className="text-base font-mono tabular-nums text-muted-foreground tracking-wider">
            {formatTimecode(duration)}
          </div>
        </div>

        {/* Right: Utility Controls */}
        <div className="flex items-center gap-3">
          {/* Zoom Controls */}
          <div className="flex items-center gap-1 bg-panel-dark/50 rounded px-2 py-1">
            <Button variant="ghost" size="icon" className="h-7 w-7 hover:text-primary">
              <ZoomOut className="w-3.5 h-3.5" />
            </Button>
            <Slider defaultValue={[50]} max={100} step={1} className="w-24" />
            <Button variant="ghost" size="icon" className="h-7 w-7 hover:text-primary">
              <ZoomIn className="w-3.5 h-3.5" />
            </Button>
          </div>

          <div className="w-px h-6 bg-border" />

          {/* Action Buttons */}
          <Button variant="ghost" size="icon" aria-label="Fullscreen" className="h-8 w-8 hover:text-primary">
            <Maximize className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" aria-label="Settings" className="h-8 w-8 hover:text-primary">
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
