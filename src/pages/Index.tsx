import { useState } from "react";

import { Header } from "@/components/Header";
import { Timeline } from "@/components/Timeline";
import { MediaBrowser } from "@/components/MediaBrowser";
import { PreviewMonitor } from "@/components/PreviewMonitor";
import { SourcePanel } from "@/components/SourcePanel";
import { EditingToolsBar } from "@/components/EditingToolsBar";
import { StatusBar } from "../components/StatusBar";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";

const Index = () => {
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [layoutKey, setLayoutKey] = useState(0);

  const handleResetLayout = () => {
    setIsFocusMode(false);
    setLayoutKey((prev) => prev + 1);
  };

  const activeLayoutKey = `${isFocusMode ? "focus" : "default"}-${layoutKey}`;

  return (
    <div className="h-screen w-full flex flex-col bg-background text-foreground overflow-hidden">
      <Header
        isFocusMode={isFocusMode}
        onToggleFocusMode={() => setIsFocusMode((prev) => !prev)}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        {isFocusMode ? (
          <ResizablePanelGroup key={activeLayoutKey} direction="vertical" className="flex-1">
            <ResizablePanel defaultSize={60} minSize={45}>
              <PreviewMonitor focusMode />
            </ResizablePanel>

            <ResizableHandle withHandle />

            <ResizablePanel defaultSize={12} minSize={8} maxSize={18}>
              <EditingToolsBar />
            </ResizablePanel>

            <ResizableHandle withHandle />

            <ResizablePanel defaultSize={28} minSize={20}>
              <Timeline />
            </ResizablePanel>
          </ResizablePanelGroup>
        ) : (
          <ResizablePanelGroup key={activeLayoutKey} direction="horizontal" className="flex-1">
            {/* Left Panel - Media Browser */}
            <ResizablePanel defaultSize={20} minSize={15} maxSize={35}>
              <MediaBrowser />
            </ResizablePanel>

            <ResizableHandle withHandle />

            {/* Center & Right Section */}
            <ResizablePanel defaultSize={80}>
              <ResizablePanelGroup direction="vertical">
                {/* Top Row - Monitors */}
                <ResizablePanel defaultSize={50} minSize={25}>
                  <ResizablePanelGroup direction="horizontal">
                    {/* Source Panel */}
                    <ResizablePanel defaultSize={50} minSize={30}>
                      <SourcePanel />
                    </ResizablePanel>

                    <ResizableHandle withHandle />

                    {/* Preview Monitor */}
                    <ResizablePanel defaultSize={50} minSize={30}>
                      <PreviewMonitor />
                    </ResizablePanel>
                  </ResizablePanelGroup>
                </ResizablePanel>

                <ResizableHandle withHandle />

                {/* Editing Tools Bar */}
                <ResizablePanel defaultSize={10} minSize={8} maxSize={15}>
                  <EditingToolsBar />
                </ResizablePanel>

                <ResizableHandle withHandle />

                {/* Bottom - Timeline */}
                <ResizablePanel defaultSize={40} minSize={20}>
                  <Timeline />
                </ResizablePanel>
              </ResizablePanelGroup>
            </ResizablePanel>
          </ResizablePanelGroup>
        )}
      </div>

      <StatusBar isFocusMode={isFocusMode} onResetLayout={handleResetLayout} />
    </div>
  );
};

export default Index;
