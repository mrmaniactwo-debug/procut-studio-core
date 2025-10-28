import { Grid3x3, List, Upload, Search, Folder } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const MediaBrowser = () => {
  return (
    <div className="h-full bg-panel-medium border-r border-border flex flex-col">
      {/* Header */}
      <div className="h-12 border-b border-border flex items-center justify-between px-4">
        <h2 className="text-sm font-semibold text-foreground">Project Media</h2>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-7 w-7">
            <Grid3x3 className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7">
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="p-3 border-b border-border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search media..." 
            className="pl-9 h-8 bg-input border-border"
          />
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="media" className="flex-1 flex flex-col">
        <TabsList className="w-full justify-start rounded-none border-b border-border bg-transparent h-10 p-0">
          <TabsTrigger 
            value="media" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
          >
            Media
          </TabsTrigger>
          <TabsTrigger 
            value="sequences" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
          >
            Sequences
          </TabsTrigger>
          <TabsTrigger 
            value="audio" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
          >
            Audio
          </TabsTrigger>
        </TabsList>

        <TabsContent value="media" className="flex-1 overflow-y-auto p-3 mt-0">
          {/* Import Area */}
          <div className="border-2 border-dashed border-border rounded-lg p-6 text-center mb-4 hover:border-primary/50 transition-colors cursor-pointer">
            <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-foreground mb-1">Import Media Files</p>
            <p className="text-xs text-muted-foreground">Drag and drop or click to browse</p>
          </div>

          {/* Media Grid */}
          <div className="grid grid-cols-2 gap-2">
            {/* Sample Media Items */}
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="aspect-video bg-panel-dark rounded border border-border overflow-hidden hover:border-primary/50 transition-colors cursor-pointer">
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-clip-video/20 to-clip-image/20">
                  <Folder className="w-8 h-8 text-muted-foreground" />
                </div>
                <div className="p-2 bg-panel-light">
                  <p className="text-xs font-medium truncate">Media {item}.mp4</p>
                  <p className="text-[10px] text-muted-foreground">1920x1080 • 5:24</p>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="sequences" className="flex-1 p-3 mt-0">
          <p className="text-sm text-muted-foreground">No sequences yet</p>
        </TabsContent>

        <TabsContent value="audio" className="flex-1 p-3 mt-0">
          <p className="text-sm text-muted-foreground">No audio files yet</p>
        </TabsContent>
      </Tabs>
    </div>
  );
};
