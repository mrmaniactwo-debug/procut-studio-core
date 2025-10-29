import { 
  MousePointer2, 
  Scissors, 
  MoveHorizontal, 
  Move, 
  Hand, 
  ZoomIn, 
  Type,
  MousePointerClick,
  Split,
  Circle,
  Square,
  Pen,
  AlignVerticalJustifyStart
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useState } from "react";

export const EditingToolsBar = () => {
  const [activeTool, setActiveTool] = useState("selection");

  const tools = [
    { id: "selection", icon: MousePointer2, label: "Selection Tool", shortcut: "V" },
    { id: "track-select", icon: MousePointerClick, label: "Track Select Forward Tool", shortcut: "A" },
    { id: "ripple", icon: Split, label: "Ripple Edit Tool", shortcut: "B" },
    { id: "rolling", icon: Circle, label: "Rolling Edit Tool", shortcut: "N" },
    { id: "rate-stretch", icon: MoveHorizontal, label: "Rate Stretch Tool", shortcut: "R" },
    { id: "razor", icon: Scissors, label: "Razor Tool", shortcut: "C" },
    { id: "slip", icon: MoveHorizontal, label: "Slip Tool", shortcut: "Y" },
    { id: "slide", icon: Move, label: "Slide Tool", shortcut: "U" },
    { id: "pen", icon: Pen, label: "Pen Tool", shortcut: "P" },
    { id: "rectangle", icon: Square, label: "Rectangle Tool", shortcut: "M" },
    { id: "hand", icon: Hand, label: "Hand Tool", shortcut: "H" },
    { id: "text", icon: Type, label: "Type Tool", shortcut: "T" },
    { id: "vertical-text", icon: AlignVerticalJustifyStart, label: "Vertical Type Tool", shortcut: "Shift+T" },
    { id: "zoom", icon: ZoomIn, label: "Zoom Tool", shortcut: "Z" },
  ];

  return (
    <TooltipProvider>
      <div className="w-14 bg-panel-dark border-r border-border flex flex-col items-center py-3 gap-0.5 shadow-panel">
        {tools.map((tool) => {
          const Icon = tool.icon;
          return (
            <Tooltip key={tool.id}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={`h-10 w-10 rounded-sm ${
                    activeTool === tool.id
                      ? "bg-primary/20 text-primary border border-primary/50"
                      : "text-muted-foreground hover:text-foreground hover:bg-panel-medium"
                  } transition-all`}
                  onClick={() => setActiveTool(tool.id)}
                >
                  <Icon className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <div className="flex items-center gap-2">
                  <span>{tool.label}</span>
                  <kbd className="px-1.5 py-0.5 text-xs bg-panel-dark rounded border border-border">
                    {tool.shortcut}
                  </kbd>
                </div>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
};
