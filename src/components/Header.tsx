import {
  FileVideo,
  Save,
  Undo2,
  Redo2,
  Settings,
  Upload,
  Download,
  Scissors,
  Focus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type HeaderProps = {
  isFocusMode: boolean;
  onToggleFocusMode: () => void;
};

export const Header = ({ isFocusMode, onToggleFocusMode }: HeaderProps) => {
  return (
    <TooltipProvider>
      <header className="h-14 bg-panel-dark border-b border-border flex items-center justify-between px-4">
      {/* Logo & Title */}
      <div className="flex items-center gap-3">
        <FileVideo className="w-6 h-6 text-primary" />
        <h1 className="text-lg font-semibold text-foreground">ProCut Studio</h1>
      </div>

      {/* Menu Bar */}
      <nav className="flex items-center gap-1">
        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
          File
        </Button>
        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
          Edit
        </Button>
        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
          View
        </Button>
        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
          Effects
        </Button>
        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
          Export
        </Button>
      </nav>

      {/* Action Buttons */}
      <div className="flex items-center gap-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary hover:shadow-glow-primary transition-all">
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
        
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
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
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
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
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
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
        
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
              <Scissors className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <div className="flex items-center gap-2">
              <span>Cut Tool</span>
              <kbd className="px-1.5 py-0.5 text-xs bg-panel-dark rounded border border-border">C</kbd>
            </div>
          </TooltipContent>
        </Tooltip>
        
        <div className="w-px h-6 bg-border mx-2" />

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={isFocusMode ? "secondary" : "ghost"}
              size="sm"
              className="text-xs font-medium"
              onClick={onToggleFocusMode}
            >
              <Focus className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Focus</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {isFocusMode ? "Exit focus mode" : "Expand preview & timeline"}
          </TooltipContent>
        </Tooltip>
        
        {/* Workspace Switcher */}
        <select className="text-xs bg-panel-light border border-border rounded px-3 py-1.5 text-foreground hover:border-primary transition-colors cursor-pointer">
          <option>Editing</option>
          <option>Color</option>
          <option>Audio</option>
          <option>Export</option>
        </select>
        
        <div className="w-px h-6 bg-border mx-2" />
        
        <Button size="sm" className="bg-gradient-primary hover:opacity-90 text-white gap-2 shadow-glow-primary transition-all">
          <Download className="w-4 h-4" />
          Export
        </Button>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
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
