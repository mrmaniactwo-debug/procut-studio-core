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
    <div className="h-full bg-panel-medium border-r-2 border-r-primary/20 border-t border-border flex flex-col">
      {/* Header */}
      <div className="h-12 border-b border-border flex items-center justify-between px-4">
        <h2 className="text-sm font-semibold text-foreground">Source Monitor</h2>
        <Button size="sm" variant="ghost" className="text-xs h-7 gap-1.5">
          <Scissors className="w-3 h-3" />
          Set In/Out
        </Button>
      </div>

      {/* Monitor Display */}
      <div className="flex-1 bg-monitor-bg flex items-center justify-center p-2">
        <div className="relative w-full aspect-video bg-black rounded border border-border overflow-hidden">
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
      <div className="h-16 border-t border-border bg-monitor-controls px-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              className={`h-8 w-8 ${isPlaying ? 'text-primary' : ''}`}
              onClick={() => setIsPlaying(!isPlaying)}
            >
              <Play className="w-4 h-4" />
            </Button>
            <div className="flex gap-2 items-center">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6"
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
                className="h-6 w-6"
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
          <div className="flex items-center gap-1">
            <div className="text-xs font-mono text-muted-foreground">
              {currentClip ? 
                `${Math.floor(currentTime / 60).toString().padStart(2, '0')}:${Math.floor(currentTime % 60).toString().padStart(2, '0')}` :
                '--:--'
              }
            </div>
            <span className="text-xs text-muted-foreground">/</span>
            <div className="text-xs font-mono text-muted-foreground">
              {currentClip ? currentClip.duration : '--:--'}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            size="sm" 
            variant="outline"
            className="h-8"
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
            className="h-8"
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
            className="bg-gradient-primary hover:opacity-90 text-white gap-2 h-8 shadow-glow-primary"
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
