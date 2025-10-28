import { Play, Scissors, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export const SourcePanel = () => {
  return (
    <div className="h-full bg-panel-medium border-r border-border flex flex-col">
      {/* Header */}
      <div className="h-12 border-b border-border flex items-center justify-between px-4">
        <h2 className="text-sm font-semibold text-foreground">Source Monitor</h2>
        <Button size="sm" variant="ghost" className="text-xs h-7 gap-1.5">
          <Scissors className="w-3 h-3" />
          Set In/Out
        </Button>
      </div>

      {/* Monitor Display */}
      <div className="flex-1 bg-monitor-bg flex items-center justify-center p-4">
        <div className="relative w-full aspect-video bg-black rounded border border-border overflow-hidden">
          {/* Placeholder */}
          <div className="absolute inset-0 bg-gradient-to-br from-panel-dark via-panel-medium to-panel-dark flex items-center justify-center">
            <div className="text-center">
              <Play className="w-12 h-12 mx-auto mb-2 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">Select a clip to preview</p>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="h-16 border-t border-border bg-monitor-controls px-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Play className="w-4 h-4" />
          </Button>
          <div className="text-xs font-mono text-muted-foreground">
            --:--:--:--
          </div>
        </div>
        <Button size="sm" className="bg-primary hover:bg-primary/90 gap-2 h-8">
          <ArrowRight className="w-4 h-4" />
          Insert to Timeline
        </Button>
      </div>
    </div>
  );
};
