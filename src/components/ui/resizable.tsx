import { GripVertical } from "lucide-react";
import * as ResizablePrimitive from "react-resizable-panels";

import { cn } from "@/lib/utils";

const ResizablePanelGroup = ({ className, ...props }: React.ComponentProps<typeof ResizablePrimitive.PanelGroup>) => (
  <ResizablePrimitive.PanelGroup
    className={cn("flex h-full w-full data-[panel-group-direction=vertical]:flex-col", className)}
    {...props}
  />
);

const ResizablePanel = ResizablePrimitive.Panel;

const ResizableHandle = ({
  withHandle,
  className,
  ...props
}: React.ComponentProps<typeof ResizablePrimitive.PanelResizeHandle> & {
  withHandle?: boolean;
}) => (
  <ResizablePrimitive.PanelResizeHandle
    className={cn(
      "group relative flex items-center justify-center touch-none transition-colors duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:ring-offset-1",
      "data-[panel-group-direction=horizontal]:w-3 data-[panel-group-direction=horizontal]:cursor-col-resize data-[panel-group-direction=horizontal]:px-1",
      "data-[panel-group-direction=vertical]:h-3 data-[panel-group-direction=vertical]:cursor-row-resize data-[panel-group-direction=vertical]:py-1 data-[panel-group-direction=vertical]:px-0",
      "before:pointer-events-none before:absolute before:bg-border/60 before:transition-colors before:duration-200",
      "data-[panel-group-direction=horizontal]:before:inset-y-1.5 data-[panel-group-direction=horizontal]:before:left-1/2 data-[panel-group-direction=horizontal]:before:w-px data-[panel-group-direction=horizontal]:before:-translate-x-1/2",
      "data-[panel-group-direction=vertical]:before:inset-x-1.5 data-[panel-group-direction=vertical]:before:top-1/2 data-[panel-group-direction=vertical]:before:h-px data-[panel-group-direction=vertical]:before:-translate-y-1/2",
      "after:pointer-events-none after:absolute after:bg-primary/40 after:opacity-0 after:transition-opacity after:duration-200 group-hover:after:opacity-80",
      "data-[panel-group-direction=horizontal]:after:inset-y-1.5 data-[panel-group-direction=horizontal]:after:left-1/2 data-[panel-group-direction=horizontal]:after:w-1 data-[panel-group-direction=horizontal]:after:-translate-x-1/2",
      "data-[panel-group-direction=vertical]:after:inset-x-1.5 data-[panel-group-direction=vertical]:after:top-1/2 data-[panel-group-direction=vertical]:after:h-1 data-[panel-group-direction=vertical]:after:-translate-y-1/2",
      "[&[data-panel-group-direction=vertical]>div]:rotate-90",
      className,
    )}
    {...props}
  >
    {withHandle && (
      <div className="relative z-10 flex h-4 w-4 items-center justify-center rounded-sm border border-primary/60 bg-panel-dark shadow-glow-primary opacity-0 group-hover:opacity-100 transition-all duration-200">
        <GripVertical className="h-3 w-3 text-primary" />
      </div>
    )}
  </ResizablePrimitive.PanelResizeHandle>
);

export { ResizablePanelGroup, ResizablePanel, ResizableHandle };
