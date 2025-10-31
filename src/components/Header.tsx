import {
  FileVideo,
  Save,
  Undo2,
  Redo2,
  Settings,
  Upload,
  Download,
  Focus,
  Folder,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useEffect, useMemo, useState } from "react";
import { Timecode } from "@/components/Timecode";

type HeaderProps = {
  isFocusMode: boolean;
  onToggleFocusMode: () => void;
  isMediaPanelVisible?: boolean;
  onToggleMediaPanel?: () => void;
  onResetLayout?: () => void;
};

export const Header = ({ isFocusMode, onToggleFocusMode, isMediaPanelVisible, onToggleMediaPanel, onResetLayout }: HeaderProps) => {
  // Autosave timer moved here from Timeline
  const [secondsSinceAutosave, setSecondsSinceAutosave] = useState(12);
  useEffect(() => {
    const interval = window.setInterval(() => {
      setSecondsSinceAutosave((prev) => (prev >= 45 ? 0 : prev + 1));
    }, 1000);
    return () => window.clearInterval(interval);
  }, []);
  const autosaveLabel = useMemo(() => {
    if (secondsSinceAutosave === 0) return "Saving…";
    if (secondsSinceAutosave === 1) return "Saved 1s ago";
    return `Saved ${secondsSinceAutosave}s ago`;
  }, [secondsSinceAutosave]);

  return (
    <TooltipProvider>
      <header className="h-14 bg-panel-dark border-b border-border flex items-center justify-between px-4">
      {/* Logo & Title */}
      <div className="flex items-center gap-3">
        <FileVideo className="w-6 h-6 text-primary" />
        <h1 className="text-lg font-semibold text-foreground">ProCut Studio</h1>
      </div>

      {/* Menu Bar (standardized) */}
      <nav className="flex items-center gap-1">
        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">File</Button>
        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">Edit</Button>
        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">View</Button>
        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">Window</Button>
        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">Help</Button>
      </nav>

      {/* Timeline status cluster moved from Timeline toolbar */}
      <div className="hidden lg:flex items-center gap-3 text-xs text-muted-foreground">
        <Timecode seconds={0} size="sm" className="text-foreground font-mono tabular-nums" />
        <span className="text-foreground/90">Sequence 01</span>
        <span>4K • 24fps</span>
        <span>{autosaveLabel}</span>
        {onResetLayout && (
          <Button variant="ghost" size="sm" className="h-7 px-2 text-muted-foreground hover:text-foreground" onClick={onResetLayout}>
            Reset layout
          </Button>
        )}
      </div>

      {/* Action Buttons (deduplicated, reordered) */}
      <div className="flex items-center gap-1">
        {/* Undo/Redo/Save */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Undo" className="text-muted-foreground hover:text-foreground">
              <Undo2 className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <div className="flex items-center gap-2">
              <span>Undo</span>
              <kbd className="px-1.5 py-0.5 text-xs bg-panel-dark rounded border border-border">⌘Z</kbd>
            </div>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Redo" className="text-muted-foreground hover:text-foreground">
              <Redo2 className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <div className="flex items-center gap-2">
              <span>Redo</span>
              <kbd className="px-1.5 py-0.5 text-xs bg-panel-dark rounded border border-border">⌘⇧Z</kbd>
            </div>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Save" className="text-muted-foreground hover:text-foreground">
              <Save className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
        
          <TooltipContent>
            <div className="flex items-center gap-2">
              <span>Save Project</span>
              <kbd className="px-1.5 py-0.5 text-xs bg-panel-dark rounded border border-border">⌘S</kbd>
            </div>
          </TooltipContent>
        </Tooltip>

        <div className="w-px h-6 bg-border mx-2" />

        {/* Import */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Import media" className="text-muted-foreground hover:text-primary hover:shadow-glow-primary transition-all">
              <Upload className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <div className="flex items-center gap-2">
              <span>Import Media</span>
              <kbd className="px-1.5 py-0.5 text-xs bg-panel-dark rounded border border-border">⌘I</kbd>
            </div>
          </TooltipContent>
        </Tooltip>

        <div className="w-px h-6 bg-border mx-2" />

        {/* Focus toggle */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={isFocusMode ? "secondary" : "ghost"}
              size="sm"
              className="text-xs font-medium"
              onClick={onToggleFocusMode}
              aria-keyshortcuts="Shift+F"
            >
              <Focus className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Focus</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <div className="flex items-center gap-2">
              <span>{isFocusMode ? "Exit focus mode" : "Expand preview & timeline"}</span>
              <kbd className="px-1.5 py-0.5 text-xs bg-panel-dark rounded border border-border">⇧F</kbd>
            </div>
          </TooltipContent>
        </Tooltip>

        {/* Toggle Project Media */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={isMediaPanelVisible ? "ghost" : "secondary"}
              size="sm"
              className="text-xs font-medium"
              onClick={onToggleMediaPanel}
              aria-pressed={!!isMediaPanelVisible}
              aria-keyshortcuts="Shift+M"
            >
              <Folder className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Media</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <div className="flex items-center gap-2">
              <span>{isMediaPanelVisible ? "Hide Project Media" : "Show Project Media"}</span>
              <kbd className="px-1.5 py-0.5 text-xs bg-panel-dark rounded border border-border">⇧M</kbd>
            </div>
          </TooltipContent>
        </Tooltip>

        {/* Workspace Switcher (shadcn Select) */}
        <Select defaultValue="editing">
          <SelectTrigger className="h-8 w-[9rem] text-xs bg-panel-light border-border">
            <SelectValue placeholder="Workspace" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="editing">Editing</SelectItem>
            <SelectItem value="color">Color</SelectItem>
            <SelectItem value="audio">Audio</SelectItem>
            <SelectItem value="export">Export</SelectItem>
          </SelectContent>
        </Select>

        <div className="w-px h-6 bg-border mx-2" />

        {/* Primary CTA: Export */}
        <Button size="sm" className="bg-gradient-primary hover:opacity-90 text-white gap-2 shadow-glow-primary transition-all">
          <Download className="w-4 h-4" />
          Export
        </Button>

        {/* Settings */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Settings" className="text-muted-foreground hover:text-foreground">
              <Settings className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Settings</TooltipContent>
        </Tooltip>
      </div>
    </header>
    </TooltipProvider>
  );
};
