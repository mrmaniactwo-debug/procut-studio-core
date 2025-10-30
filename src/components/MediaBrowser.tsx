import { Grid3x3, List, Upload, Search, Folder, Music2, Film } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { useMedia } from "@/context/MediaContext";

export const MediaBrowser = () => {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const { mediaFiles, setMediaFiles, setSelectedMedia } = useMedia();
  const [searchQuery, setSearchQuery] = useState("");
  
  // Extract video metadata and generate thumbnail
  const extractVideoMetadata = (file: File): Promise<{ duration: string; durationSeconds: number; resolution: string; thumbnail: string }> => {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      
      video.onloadedmetadata = () => {
        const durationSeconds = video.duration;
        const hours = Math.floor(durationSeconds / 3600);
        const minutes = Math.floor((durationSeconds % 3600) / 60);
        const seconds = Math.floor(durationSeconds % 60);
        const duration = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        const resolution = `${video.videoWidth}x${video.videoHeight}`;
        
        // Generate thumbnail at 1 second
        video.currentTime = Math.min(1, durationSeconds / 2);
      };
      
      video.onseeked = () => {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
        const thumbnail = canvas.toDataURL('image/jpeg', 0.7);
        
        const durationSeconds = video.duration;
        const hours = Math.floor(durationSeconds / 3600);
        const minutes = Math.floor((durationSeconds % 3600) / 60);
        const seconds = Math.floor(durationSeconds % 60);
        const duration = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        const resolution = `${video.videoWidth}x${video.videoHeight}`;
        
        resolve({ duration, durationSeconds, resolution, thumbnail });
        URL.revokeObjectURL(video.src);
      };
      
      video.src = URL.createObjectURL(file);
    });
  };

  // Extract audio metadata
  const extractAudioMetadata = (file: File): Promise<{ duration: string; durationSeconds: number }> => {
    return new Promise((resolve) => {
      const audio = document.createElement('audio');
      audio.preload = 'metadata';
      
      audio.onloadedmetadata = () => {
        const durationSeconds = audio.duration;
        const hours = Math.floor(durationSeconds / 3600);
        const minutes = Math.floor((durationSeconds % 3600) / 60);
        const seconds = Math.floor(durationSeconds % 60);
        const duration = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        resolve({ duration, durationSeconds });
        URL.revokeObjectURL(audio.src);
      };
      
      audio.src = URL.createObjectURL(file);
    });
  };
  
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const newFilesPromises = acceptedFiles.map(async (file) => {
      const baseFile = {
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        type: file.type,
        file: file
      };

      if (file.type.startsWith('video')) {
        const metadata = await extractVideoMetadata(file);
        return { ...baseFile, ...metadata };
      } else if (file.type.startsWith('audio')) {
        const metadata = await extractAudioMetadata(file);
        return { ...baseFile, ...metadata, resolution: 'Audio' };
      } else {
        return { ...baseFile, duration: '00:00:00', durationSeconds: 0, resolution: 'Unknown' };
      }
    });

    const newFiles = await Promise.all(newFilesPromises);
    setMediaFiles([...mediaFiles, ...newFiles]);
  }, [mediaFiles, setMediaFiles]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'video/*': ['.mp4', '.mov', '.avi'],
      'audio/*': ['.mp3', '.wav'],
      'image/*': ['.jpg', '.png', '.jpeg']
    }
  });

  const filteredMedia = mediaFiles.filter(file => 
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
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
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
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
          <div 
            {...getRootProps()} 
            className={`border-2 border-dashed rounded-lg p-5 text-center mb-4 transition-all cursor-pointer ${
              isDragActive 
                ? 'border-primary bg-primary/10 shadow-glow-primary' 
                : 'border-border hover:border-primary/50 hover:shadow-glow-primary'
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-foreground mb-1">
              {isDragActive ? 'Drop files here...' : 'Import Media Files'}
            </p>
            <p className="text-xs text-muted-foreground">Drag and drop or click to browse</p>
          </div>

          {/* Media Grid/List */}
          {filteredMedia.length > 0 ? (
            <div className={viewMode === "grid" ? "grid grid-cols-2 gap-2" : "flex flex-col gap-2"}>
              {filteredMedia.map((file) => (
                <div 
                  key={file.id} 
                  className={`border border-border rounded overflow-hidden hover:border-primary/50 transition-colors cursor-pointer ${
                    viewMode === "list" ? "flex items-center" : ""
                  }`}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData('application/json', JSON.stringify(file));
                  }}
                  onClick={() => setSelectedMedia(file)}
                >
                  <div className={`bg-panel-dark flex items-center justify-center overflow-hidden ${
                    viewMode === "grid" ? "aspect-video" : "w-16 h-16"
                  }`}>
                    {file.thumbnail ? (
                      <img src={file.thumbnail} alt={file.name} className="w-full h-full object-cover" />
                    ) : file.type.startsWith('video') ? (
                      <Film className="w-8 h-8 text-muted-foreground" />
                    ) : file.type.startsWith('audio') ? (
                      <Music2 className="w-8 h-8 text-muted-foreground" />
                    ) : (
                      <Folder className="w-8 h-8 text-muted-foreground" />
                    )}
                  </div>
                  <div className="p-2 bg-panel-light flex-1">
                    <p className="text-xs font-medium truncate">{file.name}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {file.resolution} • {file.duration}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center mt-4">No media imported yet. Drag and drop files to get started.</p>
          )}
        </TabsContent>

        <TabsContent value="sequences" className="flex-1 p-3 mt-0 overflow-y-auto">
          <div 
            className="border-2 border-dashed border-border rounded-lg p-5 text-center mb-4 hover:border-primary/50 hover:shadow-glow-primary transition-all cursor-pointer"
            onClick={() => {
              const newSequence = {
                id: Math.random().toString(36).substr(2, 9),
                name: `Sequence ${filteredMedia.filter(f => f.type === 'sequence').length + 1}`,
                type: 'sequence',
                duration: '00:00',
                durationSeconds: 0,
                resolution: '1920x1080'
              };
              setMediaFiles([...mediaFiles, newSequence]);
            }}
          >
            <Film className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-foreground mb-1">Create New Sequence</p>
            <p className="text-xs text-muted-foreground">Start with a blank timeline</p>
          </div>
          {filteredMedia.filter(f => f.type === 'sequence' || f.type.startsWith('video')).length > 0 ? (
            <div className={viewMode === "grid" ? "grid grid-cols-2 gap-2" : "flex flex-col gap-2"}>
              {filteredMedia
                .filter(f => f.type === 'sequence' || f.type.startsWith('video'))
                .map(file => (
                  <div 
                    key={file.id} 
                    className={`border border-border rounded overflow-hidden hover:border-primary/50 transition-colors cursor-pointer ${
                      viewMode === "list" ? "flex items-center" : ""
                    }`}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData('application/json', JSON.stringify(file));
                    }}
                  >
                    <div className={`bg-panel-dark flex items-center justify-center ${
                      viewMode === "grid" ? "aspect-video" : "w-16 h-16"
                    }`}>
                      <Film className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <div className="p-2 bg-panel-light flex-1">
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

        <TabsContent value="audio" className="flex-1 p-3 mt-0 overflow-y-auto">
          <div 
            {...getRootProps()} 
            className={`border-2 border-dashed rounded-lg p-5 text-center mb-4 transition-all cursor-pointer ${
              isDragActive 
                ? 'border-primary bg-primary/10 shadow-glow-primary' 
                : 'border-border hover:border-primary/50 hover:shadow-glow-primary'
            }`}
          >
            <input {...getInputProps()} />
            <Music2 className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-foreground mb-1">
              {isDragActive ? 'Drop audio files here...' : 'Import Audio Files'}
            </p>
            <p className="text-xs text-muted-foreground">Drag and drop or click to browse</p>
          </div>
          {filteredMedia.filter(f => f.type.startsWith('audio')).length > 0 ? (
            <div className={viewMode === "grid" ? "grid grid-cols-2 gap-2" : "flex flex-col gap-2"}>
              {filteredMedia
                .filter(f => f.type.startsWith('audio'))
                .map(file => (
                  <div 
                    key={file.id} 
                    className={`border border-border rounded overflow-hidden hover:border-primary/50 transition-colors cursor-pointer ${
                      viewMode === "list" ? "flex items-center gap-2" : ""
                    }`}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData('application/json', JSON.stringify(file));
                    }}
                  >
                    {viewMode === "grid" ? (
                      <div className="p-3 bg-panel-light">
                        <Music2 className="w-6 h-6 text-muted-foreground mb-2" />
                        <p className="text-xs font-medium truncate">{file.name}</p>
                        <p className="text-[10px] text-muted-foreground">{file.duration}</p>
                      </div>
                    ) : (
                      <>
                        <div className="w-12 h-12 bg-panel-dark flex items-center justify-center">
                          <Music2 className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <div className="p-2 bg-panel-light flex-1">
                          <p className="text-xs font-medium truncate">{file.name}</p>
                          <p className="text-[10px] text-muted-foreground">{file.duration}</p>
                        </div>
                      </>
                    )}
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
