import { Play, Pause, Volume2, Maximize, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

export const PreviewMonitor = () => {
  return (
    <div className="h-full bg-panel-medium border-l-2 border-l-primary/20 border-t border-border flex flex-col">
      {/* Header */}
      <div className="h-12 border-b border-border flex items-center justify-between px-4">
        <h2 className="text-sm font-semibold text-foreground">Program Monitor</h2>
        <div className="flex items-center gap-2">
          <select className="text-xs bg-input border border-border rounded px-2 py-1 text-foreground">
            <option>Full Quality</option>
            <option>1/2 Quality</option>
            <option>1/4 Quality</option>
          </select>
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

      {/* Controls */}
      <div className="h-16 border-t border-border bg-monitor-controls px-4 flex items-center justify-between gap-4">
        {/* Playback Controls */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16">
              <path d="M8 1a1 1 0 0 1 1 1v12a1 1 0 1 1-2 0V2a1 1 0 0 1 1-1z"/>
              <path d="M0 7a1 1 0 0 1 1-1h6a1 1 0 1 1 0 2H1a1 1 0 0 1-1-1z"/>
            </svg>
          </Button>
          <Button variant="ghost" size="icon" className="h-9 w-9 bg-gradient-primary hover:opacity-90 shadow-glow-primary">
            <Play className="w-5 h-5 text-white" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16">
              <path d="M8 1a1 1 0 0 1 1 1v12a1 1 0 1 1-2 0V2a1 1 0 0 1 1-1z"/>
              <path d="M9 7a1 1 0 0 1 1-1h6a1 1 0 1 1 0 2h-6a1 1 0 0 1-1-1z"/>
            </svg>
          </Button>
          <div className="ml-2 text-xs font-mono text-muted-foreground">
            00:00:00:00 / 00:00:30:00
          </div>
        </div>

        {/* Volume & Settings */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-muted-foreground" />
            <Slider 
              defaultValue={[70]} 
              max={100} 
              step={1}
              className="w-20"
            />
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Maximize className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
