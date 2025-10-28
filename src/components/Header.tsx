import { 
  FileVideo, 
  Save, 
  Undo2, 
  Redo2, 
  Settings, 
  Upload,
  Download,
  Scissors,
  ChevronDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export const Header = () => {
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
          <TooltipContent>Import Media</TooltipContent>
        </Tooltip>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
              <Undo2 className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Undo</TooltipContent>
        </Tooltip>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
              <Redo2 className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Redo</TooltipContent>
        </Tooltip>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
              <Save className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Save Project</TooltipContent>
        </Tooltip>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
              <Scissors className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Cut Tool</TooltipContent>
        </Tooltip>
        
        <div className="w-px h-6 bg-border mx-2" />
        
        {/* Mode Switcher */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="sm" className="text-xs gap-1.5 text-muted-foreground hover:text-foreground">
              Editing
              <ChevronDown className="w-3 h-3" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Switch Mode</TooltipContent>
        </Tooltip>
        
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
