import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { HardDrive, Clock, Cloud, Keyboard, LayoutDashboard } from "lucide-react";

interface StatusBarProps {
  isFocusMode: boolean;
  onResetLayout: () => void;
}

const keyboardShortcuts = [
  { action: "Play / Pause", keys: ["Space"] },
  { action: "Mark In", keys: ["I"] },
  { action: "Mark Out", keys: ["O"] },
  { action: "Cut Tool", keys: ["C"] },
  { action: "Ripple Delete", keys: ["Shift", "Delete"] },
  { action: "Toggle Focus Mode", keys: ["Shift", "F"] },
];

export const StatusBar = ({ isFocusMode, onResetLayout }: StatusBarProps) => {
  const [secondsSinceAutosave, setSecondsSinceAutosave] = useState(12);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setSecondsSinceAutosave((prev) => {
        if (prev >= 45) {
          return 0;
        }
        return prev + 1;
      });
    }, 1000);

    return () => window.clearInterval(interval);
  }, []);

  const autosaveLabel = useMemo(() => {
    if (secondsSinceAutosave === 0) {
      return "Saving…";
    }

    if (secondsSinceAutosave === 1) {
      return "Saved 1s ago";
    }

    return `Saved ${secondsSinceAutosave}s ago`;
  }, [secondsSinceAutosave]);

  return (
    <div className="h-11 border-t border-border bg-panel-dark/90 backdrop-blur-sm text-xs text-muted-foreground">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-foreground">
            <span className="relative flex h-2 w-2 items-center justify-center">
              <span className="absolute inline-flex h-2 w-2 rounded-full bg-green-500" />
            </span>
            <span className="font-medium tracking-wide">Sequence 01</span>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <HardDrive className="h-3.5 w-3.5" />
            <span>4K • 24fps</span>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <Clock className="h-3.5 w-3.5" />
            <span>00:00:00 / 05:00:00</span>
          </div>
          <div className="hidden xl:flex items-center gap-2">
            <Cloud className="h-3.5 w-3.5 text-primary" />
            <span>{autosaveLabel}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isFocusMode && <Badge variant="outline" className="border-primary/40 text-primary">Focus mode</Badge>}

          <Button
            variant="ghost"
            size="sm"
            className="gap-2 text-muted-foreground hover:text-foreground"
            onClick={onResetLayout}
          >
            <LayoutDashboard className="h-3.5 w-3.5" />
            Reset layout
          </Button>

          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground">
                <Keyboard className="h-3.5 w-3.5" />
                Shortcuts
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Keyboard shortcuts</DialogTitle>
                <DialogDescription>
                  Keep one hand on the keyboard with the essentials. Customize these later in Settings.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-3">
                {keyboardShortcuts.map((shortcut) => (
                  <div key={shortcut.action} className="flex items-center justify-between gap-4 rounded-md border border-border bg-panel-dark/60 px-3 py-2">
                    <span className="text-sm text-foreground">{shortcut.action}</span>
                    <div className="flex items-center gap-1">
                      {shortcut.keys.map((key) => (
                        <kbd
                          key={key}
                          className="rounded border border-border bg-panel-dark px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground"
                        >
                          {key}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
};
