import { Grid3x3, List, Upload, Search, Folder, Music2, Film } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";

export const MediaBrowser = () => {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [mediaFiles, setMediaFiles] = useState<Array<{ id: string; name: string; type: string; duration?: string; resolution?: string }>>([]);
  
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      type: file.type,
      // In a real app, you'd extract duration and resolution from the file
      duration: "00:00",
      resolution: "1920x1080"
    }));
    setMediaFiles(prev => [...prev, ...newFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'video/*': ['.mp4', '.mov', '.avi'],
      'audio/*': ['.mp3', '.wav'],
    }
  });
  return (
    <div className="h-full bg-panel-medium border-r-2 border-r-primary/20 flex flex-col">
      {/* Header with View Toggle */}
      <div className="h-12 border-b border-border flex items-center justify-between px-4">
        <h2 className="text-sm font-semibold text-foreground">Project Media</h2>
        <div className="flex items-center gap-1">
          <Button 
            variant="ghost" 
            size="icon" 
            className={`h-7 w-7 ${viewMode === "grid" ? "text-primary bg-primary/20" : ""}`}
            onClick={() => setViewMode("grid")}
          >
            <Grid3x3 className="w-4 h-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className={`h-7 w-7 ${viewMode === "list" ? "text-primary bg-primary/20" : ""}`}
            onClick={() => setViewMode("list")}
          >
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
          <div className="border-2 border-dashed border-border rounded-lg p-5 text-center mb-4 hover:border-primary/50 hover:shadow-glow-primary transition-all cursor-pointer">
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
          <div className="border-2 border-dashed border-border rounded-lg p-5 text-center mb-4 hover:border-primary/50 hover:shadow-glow-primary transition-all cursor-pointer">
            <Film className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-foreground mb-1">Create New Sequence</p>
            <p className="text-xs text-muted-foreground">Start with a blank timeline</p>
          </div>
          {mediaFiles.filter(f => f.type.startsWith('video')).length > 0 ? (
            <div className={viewMode === "grid" ? "grid grid-cols-2 gap-2" : "flex flex-col gap-2"}>
              {mediaFiles
                .filter(f => f.type.startsWith('video'))
                .map(file => (
                  <div key={file.id} className="border border-border rounded overflow-hidden hover:border-primary/50 transition-colors cursor-pointer">
                    <div className="aspect-video bg-panel-dark flex items-center justify-center">
                      <Film className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <div className="p-2 bg-panel-light">
                      <p className="text-xs font-medium truncate">{file.name}</p>
                      <p className="text-[10px] text-muted-foreground">{file.resolution} • {file.duration}</p>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center mt-4">No sequences created yet</p>
          )}
        </TabsContent>

        <TabsContent value="audio" className="flex-1 p-3 mt-0">
          <div {...getRootProps()} className="border-2 border-dashed border-border rounded-lg p-5 text-center mb-4 hover:border-primary/50 hover:shadow-glow-primary transition-all cursor-pointer">
            <input {...getInputProps()} />
            <Music2 className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-foreground mb-1">Import Audio Files</p>
            <p className="text-xs text-muted-foreground">Drag and drop or click to browse</p>
          </div>
          {mediaFiles.filter(f => f.type.startsWith('audio')).length > 0 ? (
            <div className={viewMode === "grid" ? "grid grid-cols-2 gap-2" : "flex flex-col gap-2"}>
              {mediaFiles
                .filter(f => f.type.startsWith('audio'))
                .map(file => (
                  <div key={file.id} className="border border-border rounded overflow-hidden hover:border-primary/50 transition-colors cursor-pointer">
                    <div className="p-2 bg-panel-light">
                      <Music2 className="w-4 h-4 text-muted-foreground mb-1" />
                      <p className="text-xs font-medium truncate">{file.name}</p>
                      <p className="text-[10px] text-muted-foreground">{file.duration}</p>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center mt-4">No audio files imported yet</p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
