import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";

import { Header } from "@/components/Header";
import { Timeline } from "@/components/Timeline";
import { MediaBrowser } from "@/components/MediaBrowser";
import { PreviewMonitor } from "@/components/PreviewMonitor";
import { SourcePanel } from "@/components/SourcePanel";
import { EditingToolsBar } from "@/components/EditingToolsBar";
// import { StatusBar } from "../components/StatusBar";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";

const Index = () => {
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [showMediaPanel, setShowMediaPanel] = useState(true);
  const [layoutKey, setLayoutKey] = useState(0);

  const handleToggleFocusMode = useCallback(() => {
    setIsFocusMode((prev) => {
      const next = !prev;
      toast(next ? "Focus mode enabled" : "Focus mode disabled");
      return next;
    });
  }, []);

  const handleToggleMediaPanel = useCallback(() => {
    setShowMediaPanel((prev) => {
      const next = !prev;
      toast(next ? "Project Media shown" : "Project Media hidden");
      return next;
    });
  }, []);

  // Keyboard shortcut: Shift+M toggles Project Media panel; Shift+F toggles Focus mode
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.shiftKey && !e.ctrlKey && !e.metaKey && !e.altKey) {
        const target = e.target as HTMLElement | null;
        const tag = target?.tagName;
        const editable = target?.getAttribute("contenteditable") === "true";
        if (tag === "INPUT" || tag === "TEXTAREA" || editable) return;

        const key = e.key.toLowerCase();
        if (key === "m") {
          e.preventDefault();
          handleToggleMediaPanel();
        } else if (key === "f") {
          e.preventDefault();
          handleToggleFocusMode();
        }
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handleToggleFocusMode, handleToggleMediaPanel]);

  const handleResetLayout = () => {
    setIsFocusMode(false);
    setLayoutKey((prev) => prev + 1);
  };

  const activeLayoutKey = `${isFocusMode ? "focus" : "default"}-${layoutKey}`;

  return (
    <div className="h-screen w-full flex flex-col bg-background text-foreground overflow-hidden">
      <Header
        isFocusMode={isFocusMode}
        onToggleFocusMode={handleToggleFocusMode}
        isMediaPanelVisible={showMediaPanel}
        onToggleMediaPanel={handleToggleMediaPanel}
        onResetLayout={handleResetLayout}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        {isFocusMode ? (
          <ResizablePanelGroup key={activeLayoutKey} direction="vertical" className="flex-1">
            <ResizablePanel defaultSize={65} minSize={55} maxSize={70} collapsible={false}>
              <PreviewMonitor focusMode />
            </ResizablePanel>

            <ResizableHandle />

            <ResizablePanel defaultSize={10} minSize={6} maxSize={10}>
              <EditingToolsBar />
            </ResizablePanel>

            <ResizableHandle />

            <ResizablePanel defaultSize={25} minSize={25} maxSize={35}>
              <Timeline onResetLayout={handleResetLayout} />
            </ResizablePanel>
          </ResizablePanelGroup>
        ) : (
          <ResizablePanelGroup key={activeLayoutKey} direction="horizontal" className="flex-1">
            {/* Left Panel - Media Browser (toggleable) */}
            {showMediaPanel && (
              <>
                <ResizablePanel defaultSize={20} minSize={15} maxSize={35}>
                  <MediaBrowser />
                </ResizablePanel>
                <ResizableHandle />
              </>
            )}

            {/* Center & Right Section */}
            <ResizablePanel defaultSize={showMediaPanel ? 80 : 100}>
              <ResizablePanelGroup direction="vertical">
                {/* Top Row - Monitors */}
                <ResizablePanel defaultSize={65} minSize={55} maxSize={70} collapsible={false}>
                  <ResizablePanelGroup direction="horizontal">
                    {/* Source Panel */}
                    <ResizablePanel defaultSize={50} minSize={30} maxSize={70} collapsible={false} className="min-w-0">
                      <SourcePanel />
                    </ResizablePanel>

                    <ResizableHandle />

                    {/* Preview Monitor */}
                    <ResizablePanel defaultSize={50} minSize={30} maxSize={70} collapsible={false} className="min-w-0">
                      <PreviewMonitor />
                    </ResizablePanel>
                  </ResizablePanelGroup>
                </ResizablePanel>

                <ResizableHandle />

                {/* Editing Tools Bar */}
                <ResizablePanel defaultSize={7} minSize={6} maxSize={8}>
                  <EditingToolsBar />
                </ResizablePanel>

                <ResizableHandle />

                {/* Bottom - Timeline */}
                <ResizablePanel defaultSize={28} minSize={25} maxSize={35}>
                  <Timeline onResetLayout={handleResetLayout} />
                </ResizablePanel>
              </ResizablePanelGroup>
            </ResizablePanel>
          </ResizablePanelGroup>
        )}
      </div>

  {/* Footer moved inline into Timeline toolbar */}
    </div>
  );
};

export default Index;
