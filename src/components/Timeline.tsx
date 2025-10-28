import { Play, Pause, SkipBack, SkipForward, ZoomIn, ZoomOut, Eye, EyeOff, Lock, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

export const Timeline = () => {
  return (
    <div className="h-80 bg-timeline-bg border-t border-primary/20 flex flex-col">
      {/* Timeline Controls */}
      <div className="h-12 bg-panel-medium border-b border-border flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <SkipBack className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-9 w-9 bg-primary hover:bg-primary/90">
            <Play className="w-5 h-5 text-primary-foreground" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <SkipForward className="w-4 h-4" />
          </Button>
          <div className="ml-4 text-sm font-mono text-foreground">00:00:00:00</div>
        </div>
        
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground">30 fps • 1920x1080</span>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-7 w-7">
              <ZoomOut className="w-3 h-3" />
            </Button>
            <Slider defaultValue={[50]} max={100} step={1} className="w-20" />
            <Button variant="ghost" size="icon" className="h-7 w-7">
              <ZoomIn className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </div>

      {/* Timeline Ruler */}
      <div className="h-8 bg-panel-dark border-b border-border relative">
        <div className="absolute inset-0 flex items-center px-16">
          {[0, 5, 10, 15, 20, 25, 30].map((time) => (
            <div key={time} className="flex-1 relative">
              <div className="absolute left-0 top-1/2 w-px h-3 bg-timeline-grid/50" />
              <span className="absolute left-1 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground font-mono">
                {time}s
              </span>
              {/* Tick marks */}
              {time < 30 && (
                <div className="absolute left-1/2 top-1/2 w-px h-1.5 bg-timeline-grid/30" />
              )}
            </div>
          ))}
          {/* Markers */}
          <div className="absolute left-32 -top-1 w-2 h-2 bg-accent rounded-full border border-background" />
          <div className="absolute left-64 -top-1 w-2 h-2 bg-accent rounded-full border border-background" />
        </div>
        {/* Playhead - thinner, more distinct */}
        <div className="absolute left-20 top-0 bottom-0 w-px bg-timeline-playhead shadow-[0_0_12px_rgba(0,168,255,0.8)]">
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-timeline-playhead rounded-sm rotate-45 shadow-glow-primary" />
        </div>
      </div>

      {/* Timeline Tracks */}
      <div className="flex-1 overflow-y-auto">
        {/* Video Track 1 */}
        <div className="h-16 bg-timeline-track border-b border-border/50 border-l-2 border-l-primary/20 flex items-center gap-1">
          {/* Track Controls */}
          <div className="w-16 flex flex-col items-center justify-center gap-0.5 border-r border-border px-1">
            <div className="flex items-center gap-1 w-full justify-between">
              <span className="text-xs text-muted-foreground font-medium">V1</span>
              <div className="flex gap-0.5">
                <Button variant="ghost" size="icon" className="h-5 w-5 text-muted-foreground hover:text-foreground">
                  <Eye className="w-3 h-3" />
                </Button>
                <Button variant="ghost" size="icon" className="h-5 w-5 text-muted-foreground hover:text-foreground">
                  <Lock className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </div>
          <div className="flex-1 relative h-12 px-1">
            {/* Sample Video Clips - rounded corners */}
            <div className="absolute left-12 top-1 bottom-1 w-40 bg-clip-video/80 rounded-md border border-clip-video flex items-center justify-center text-xs font-medium shadow-sm">
              Clip 1.mp4
            </div>
            <div className="absolute left-56 top-1 bottom-1 w-32 bg-clip-video/80 rounded-md border border-clip-video flex items-center justify-center text-xs font-medium shadow-sm">
              Clip 2.mp4
            </div>
          </div>
        </div>

        {/* Audio Track 1 */}
        <div className="h-16 bg-timeline-track border-b border-border/50 border-l-2 border-l-primary/20 flex items-center gap-1">
          <div className="w-16 flex flex-col items-center justify-center gap-0.5 border-r border-border px-1">
            <div className="flex items-center gap-1 w-full justify-between">
              <span className="text-xs text-muted-foreground font-medium">A1</span>
              <div className="flex gap-0.5">
                <Button variant="ghost" size="icon" className="h-5 w-5 text-muted-foreground hover:text-foreground">
                  <Volume2 className="w-3 h-3" />
                </Button>
                <Button variant="ghost" size="icon" className="h-5 w-5 text-muted-foreground hover:text-foreground">
                  <Lock className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </div>
          <div className="flex-1 relative h-12 px-1">
            {/* Sample Audio Waveform */}
            <div className="absolute left-12 top-1 bottom-1 w-40 bg-clip-audio/30 rounded-md border border-clip-audio flex items-center px-2 shadow-sm">
              <div className="flex gap-0.5 h-full items-center">
                {Array.from({ length: 40 }).map((_, i) => (
                  <div
                    key={i}
                    className="w-0.5 bg-clip-audio rounded-full"
                    style={{ height: `${20 + Math.random() * 60}%` }}
                  />
                ))}
              </div>
            </div>
            <div className="absolute left-56 top-1 bottom-1 w-32 bg-clip-audio/30 rounded-md border border-clip-audio flex items-center px-2 shadow-sm">
              <div className="flex gap-0.5 h-full items-center">
                {Array.from({ length: 32 }).map((_, i) => (
                  <div
                    key={i}
                    className="w-0.5 bg-clip-audio rounded-full"
                    style={{ height: `${20 + Math.random() * 60}%` }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Video Track 2 */}
        <div className="h-16 bg-timeline-track border-b border-border/50 border-l-2 border-l-primary/20 flex items-center gap-1">
          <div className="w-16 flex flex-col items-center justify-center gap-0.5 border-r border-border px-1">
            <div className="flex items-center gap-1 w-full justify-between">
              <span className="text-xs text-muted-foreground font-medium">V2</span>
              <div className="flex gap-0.5">
                <Button variant="ghost" size="icon" className="h-5 w-5 text-muted-foreground hover:text-foreground">
                  <Eye className="w-3 h-3" />
                </Button>
                <Button variant="ghost" size="icon" className="h-5 w-5 text-muted-foreground hover:text-foreground">
                  <Lock className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </div>
          <div className="flex-1 relative h-12 px-1" />
        </div>

        {/* Audio Track 2 */}
        <div className="h-16 bg-timeline-track border-b border-border/50 border-l-2 border-l-primary/20 flex items-center gap-1">
          <div className="w-16 flex flex-col items-center justify-center gap-0.5 border-r border-border px-1">
            <div className="flex items-center gap-1 w-full justify-between">
              <span className="text-xs text-muted-foreground font-medium">A2</span>
              <div className="flex gap-0.5">
                <Button variant="ghost" size="icon" className="h-5 w-5 text-muted-foreground hover:text-foreground">
                  <Volume2 className="w-3 h-3" />
                </Button>
                <Button variant="ghost" size="icon" className="h-5 w-5 text-muted-foreground hover:text-foreground">
                  <Lock className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </div>
          <div className="flex-1 relative h-12 px-1" />
        </div>
      </div>
    </div>
  );
};
