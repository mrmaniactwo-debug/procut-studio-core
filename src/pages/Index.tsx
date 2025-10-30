import { Header } from "@/components/Header";
import { Timeline } from "@/components/Timeline";
import { MediaBrowser } from "@/components/MediaBrowser";
import { PreviewMonitor } from "@/components/PreviewMonitor";
import { SourcePanel } from "@/components/SourcePanel";
import { EditingToolsBar } from "@/components/EditingToolsBar";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";

const Index = () => {
  return (
    <div className="h-screen w-full flex flex-col bg-background text-foreground overflow-hidden">
      <Header />
      
      {/* Main Resizable Layout */}
      <ResizablePanelGroup direction="horizontal" className="flex-1">
        {/* Left Panel - Media Browser */}
        <ResizablePanel defaultSize={20} minSize={15} maxSize={35}>
          <MediaBrowser />
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* Center & Right Section */}
        <ResizablePanel defaultSize={80}>
          <ResizablePanelGroup direction="vertical">
            {/* Top Row - Monitors */}
            <ResizablePanel defaultSize={50} minSize={30}>
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

            {/* Editing Tools Bar - Horizontal (fixed height) */}
            <div className="h-14 flex-shrink-0">
              <EditingToolsBar />
            </div>

            {/* Bottom - Timeline */}
            <ResizablePanel defaultSize={50} minSize={20}>
              <Timeline />
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};

export default Index;
