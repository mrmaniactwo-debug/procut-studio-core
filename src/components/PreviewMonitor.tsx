import {
  Play,
  Maximize,
  Settings,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { TimecodePair } from "@/components/Timecode";
import { DEFAULT_FPS } from "@/lib/timecode";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type PreviewMonitorProps = {
  focusMode?: boolean;
};

export const PreviewMonitor = ({ focusMode = false }: PreviewMonitorProps) => {
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
          {/* Placeholder Video Frame */}
          <div className="absolute inset-0 bg-gradient-to-br from-panel-dark via-panel-medium to-panel-dark flex items-center justify-center">
            <div className="text-center">
              <Play className="w-16 h-16 mx-auto mb-3 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Preview Monitor</p>
              <p className="text-xs text-muted-foreground mt-1">1920x1080 • 30fps</p>
            </div>
          </div>

          {/* Overlay Info */}
          <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded text-xs font-mono text-foreground">
            00:00:05:12
          </div>
          <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded text-xs text-foreground">
            ⏺ REC
          </div>
          
          {/* Scrub Bar */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-panel-dark/80">
            <div className="absolute left-0 top-0 bottom-0 w-1/3 bg-primary" />
            <div className="absolute left-1/3 top-0 bottom-0 w-0.5 bg-primary shadow-glow-primary" />
          </div>
        </div>
      </div>

      {/* Controls - Redesigned */}
      <div className="h-16 border-t border-border bg-monitor-controls px-6 flex items-center justify-between gap-6">
        {/* Left: Playback Controls */}
        <div className="flex items-center gap-1.5">
          <Button variant="ghost" size="icon" aria-label="Step back" className="h-8 w-8 hover:text-primary">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16">
              <path d="M8 1a1 1 0 0 1 1 1v12a1 1 0 1 1-2 0V2a1 1 0 0 1 1-1z" />
              <path d="M0 7a1 1 0 0 1 1-1h6a1 1 0 1 1 0 2H1a1 1 0 0 1-1-1z" />
            </svg>
          </Button>
          <Button variant="ghost" size="icon" aria-label="Play" className="h-10 w-10 bg-gradient-primary hover:opacity-90 shadow-glow-primary">
            <Play className="w-5 h-5 text-white" />
          </Button>
          <Button variant="ghost" size="icon" aria-label="Step forward" className="h-8 w-8 hover:text-primary">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16">
              <path d="M8 1a1 1 0 0 1 1 1v12a1 1 0 1 1-2 0V2a1 1 0 0 1 1-1z" />
              <path d="M9 7a1 1 0 0 1 1-1h6a1 1 0 1 1 0 2h-6a1 1 0 0 1-1-1z" />
            </svg>
          </Button>
        </div>

        {/* Center: Timecode Display */}
        <TimecodePair
          currentSeconds={0}
          totalSeconds={30}
          fps={DEFAULT_FPS}
          className="[&_span:first-child]:text-primary [&_span:first-child]:font-semibold"
          size="base"
          fixedWidth
        />

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
