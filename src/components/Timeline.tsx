import { Play, Pause, SkipBack, SkipForward } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Timeline = () => {
  return (
    <div className="h-80 bg-timeline-bg border-t border-border flex flex-col">
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
        
        <div className="text-xs text-muted-foreground">
          30 fps • 1920x1080
        </div>
      </div>

      {/* Timeline Ruler */}
      <div className="h-8 bg-panel-dark border-b border-border relative">
        <div className="absolute inset-0 flex items-center px-4">
          {[0, 5, 10, 15, 20, 25, 30].map((time) => (
            <div key={time} className="flex-1 relative">
              <div className="absolute left-0 top-1/2 w-px h-2 bg-timeline-grid" />
              <span className="absolute left-1 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground font-mono">
                {time}s
              </span>
            </div>
          ))}
        </div>
        {/* Playhead */}
        <div className="absolute left-20 top-0 bottom-0 w-0.5 bg-timeline-playhead shadow-[0_0_8px_rgba(0,168,255,0.6)]">
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-timeline-playhead rotate-45" />
        </div>
      </div>

      {/* Timeline Tracks */}
      <div className="flex-1 overflow-y-auto">
        {/* Video Track 1 */}
        <div className="h-16 bg-timeline-track border-b border-border flex items-center px-2 gap-2">
          <div className="w-12 text-xs text-muted-foreground font-medium">V1</div>
          <div className="flex-1 relative h-12">
            {/* Sample Video Clips */}
            <div className="absolute left-12 top-1 bottom-1 w-40 bg-clip-video/80 rounded border border-clip-video flex items-center justify-center text-xs font-medium">
              Clip 1.mp4
            </div>
            <div className="absolute left-56 top-1 bottom-1 w-32 bg-clip-video/80 rounded border border-clip-video flex items-center justify-center text-xs font-medium">
              Clip 2.mp4
            </div>
          </div>
        </div>

        {/* Audio Track 1 */}
        <div className="h-16 bg-timeline-track border-b border-border flex items-center px-2 gap-2">
          <div className="w-12 text-xs text-muted-foreground font-medium">A1</div>
          <div className="flex-1 relative h-12">
            {/* Sample Audio Waveform */}
            <div className="absolute left-12 top-1 bottom-1 w-40 bg-clip-audio/30 rounded border border-clip-audio flex items-center px-2">
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
            <div className="absolute left-56 top-1 bottom-1 w-32 bg-clip-audio/30 rounded border border-clip-audio flex items-center px-2">
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
        <div className="h-16 bg-timeline-track border-b border-border flex items-center px-2 gap-2">
          <div className="w-12 text-xs text-muted-foreground font-medium">V2</div>
          <div className="flex-1 relative h-12" />
        </div>

        {/* Audio Track 2 */}
        <div className="h-16 bg-timeline-track border-b border-border flex items-center px-2 gap-2">
          <div className="w-12 text-xs text-muted-foreground font-medium">A2</div>
          <div className="flex-1 relative h-12" />
        </div>
      </div>
    </div>
  );
};
