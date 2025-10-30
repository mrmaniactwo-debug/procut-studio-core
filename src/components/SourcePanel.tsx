import { Play, Scissors, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

import { useState } from "react";

interface Clip {
  id: string;
  name: string;
  duration: string;
  inPoint: number;
  outPoint: number;
}

export const SourcePanel = () => {
  const [currentClip, setCurrentClip] = useState<Clip | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  return (
    <div className="h-full bg-panel-medium border-r-2 border-r-primary/20 border-t border-border flex flex-col overflow-hidden">
      {/* Header */}
      <div className="h-12 border-b border-border flex items-center px-4">
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-semibold text-foreground">Source Monitor</h2>
          <span className="rounded bg-panel-light px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            Project
          </span>
        </div>
      </div>

      {/* Monitor Display */}
      <div className="flex-1 bg-monitor-bg flex items-center justify-center p-2">
        <div className="relative w-full max-w-3xl aspect-video bg-black rounded border border-border overflow-hidden">
          {/* Placeholder */}
          <div className="absolute inset-0 bg-gradient-to-br from-panel-dark via-panel-medium to-panel-dark flex items-center justify-center">
            <div className="text-center">
              <Play className="w-12 h-12 mx-auto mb-2 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">Select a clip to preview</p>
            </div>
          </div>
          
          {/* Scrub Bar */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-panel-dark/80" />
        </div>
      </div>

      {/* Controls */}
      <div className="min-h-16 border-t border-border bg-monitor-controls px-4 flex items-center justify-between flex-shrink-0 overflow-x-auto gap-2 flex-wrap py-2">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              className={`h-8 w-8 shrink-0 ${isPlaying ? 'text-primary' : ''}`}
              onClick={() => setIsPlaying(!isPlaying)}
            >
              <Play className="w-4 h-4" />
            </Button>
            <div className="flex gap-2 items-center">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6 shrink-0"
                onClick={() => {
                  if (currentClip) {
                    setCurrentTime(Math.max(0, currentTime - 1));
                  }
                }}
              >
                <ArrowRight className="w-3 h-3 rotate-180" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6 shrink-0"
                onClick={() => {
                  if (currentClip) {
                    setCurrentTime(Math.min(parseFloat(currentClip.duration), currentTime + 1));
                  }
                }}
              >
                <ArrowRight className="w-3 h-3" />
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-1 font-mono text-xs text-muted-foreground">
            <span className="inline-flex w-[70px] justify-end">
              {currentClip
                ? `${Math.floor(currentTime / 60).toString().padStart(2, "0")}:${Math.floor(currentTime % 60)
                    .toString()
                    .padStart(2, "0")}`
                : "--:--"}
            </span>
            <span>/</span>
            <span className="inline-flex w-[70px]">
              {currentClip ? currentClip.duration : "--:--"}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            size="sm" 
            variant="outline"
            className="h-8 shrink-0"
            onClick={() => {
              if (currentClip) {
                setCurrentClip({
                  ...currentClip,
                  inPoint: currentTime,
                });
              }
            }}
          >
            Set In
          </Button>
          <Button 
            size="sm" 
            variant="outline"
            className="h-8 shrink-0"
            onClick={() => {
              if (currentClip) {
                setCurrentClip({
                  ...currentClip,
                  outPoint: currentTime,
                });
              }
            }}
          >
            Set Out
          </Button>
          <Button 
            size="sm" 
            className="bg-gradient-primary hover:opacity-90 text-white gap-2 h-8 shadow-glow-primary shrink-0"
            disabled={!currentClip}
            onClick={() => {
              if (currentClip) {
                // TODO: Implement timeline insertion
                console.log('Insert clip to timeline:', {
                  ...currentClip,
                  inPoint: currentClip.inPoint,
                  outPoint: currentClip.outPoint
                });
              }
            }}
          >
            <ArrowRight className="w-4 h-4" />
            Insert
          </Button>
        </div>
      </div>
    </div>
  );
};
