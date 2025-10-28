import { Header } from "@/components/Header";
import { Timeline } from "@/components/Timeline";
import { MediaBrowser } from "@/components/MediaBrowser";
import { PreviewMonitor } from "@/components/PreviewMonitor";
import { SourcePanel } from "@/components/SourcePanel";

const Index = () => {
  return (
    <div className="h-screen w-full flex flex-col bg-background text-foreground overflow-hidden">
      <Header />
      
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Media Browser */}
        <div className="w-80 flex-shrink-0">
          <MediaBrowser />
        </div>

        {/* Center & Right Section */}
        <div className="flex-1 flex flex-col">
          {/* Top Row - Monitors */}
          <div className="flex-1 flex overflow-hidden">
            {/* Source Panel */}
            <div className="flex-1">
              <SourcePanel />
            </div>
            
            {/* Preview Monitor */}
            <div className="flex-1">
              <PreviewMonitor />
            </div>
          </div>

          {/* Bottom - Timeline */}
          <Timeline />
        </div>
      </div>
    </div>
  );
};

export default Index;
