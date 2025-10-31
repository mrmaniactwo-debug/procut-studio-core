import { Play, Pause, ArrowRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useRef } from "react";
import { useMedia } from "@/context/MediaContext";

export const SourcePanel = () => {
  const { selectedMedia, addClipToTimeline } = useMedia();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [inPoint, setInPoint] = useState(0);
  const [outPoint, setOutPoint] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Reset when new media is selected
  useEffect(() => {
    if (selectedMedia) {
      setCurrentTime(0);
      setInPoint(0);
      setOutPoint(selectedMedia.durationSeconds);
      setIsPlaying(false);
      
      // Load the media into the video/audio element
      if (selectedMedia.file) {
        const url = URL.createObjectURL(selectedMedia.file);
        if (selectedMedia.type.startsWith('video') && videoRef.current) {
          videoRef.current.src = url;
        } else if (selectedMedia.type.startsWith('audio') && audioRef.current) {
          audioRef.current.src = url;
        }
      }
    }
  }, [selectedMedia]);

  // Update current time as media plays
  useEffect(() => {
    const mediaElement = selectedMedia?.type.startsWith('video') ? videoRef.current : audioRef.current;
    if (!mediaElement) return;

    const updateTime = () => setCurrentTime(mediaElement.currentTime);
    mediaElement.addEventListener('timeupdate', updateTime);
    return () => mediaElement.removeEventListener('timeupdate', updateTime);
  }, [selectedMedia]);

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const togglePlayPause = () => {
    const mediaElement = selectedMedia?.type.startsWith('video') ? videoRef.current : audioRef.current;
    if (!mediaElement) return;

    if (isPlaying) {
      mediaElement.pause();
    } else {
      mediaElement.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleInsert = () => {
    if (!selectedMedia) return;

    const clip = {
      id: Math.random().toString(36).substr(2, 9),
      mediaId: selectedMedia.id,
      name: selectedMedia.name,
      type: selectedMedia.type,
      duration: outPoint - inPoint,
      inPoint,
      outPoint,
      startTime: 0, // Will be calculated based on timeline position
      thumbnail: selectedMedia.thumbnail,
      file: selectedMedia.file,
    };

    // Determine which track to add to based on media type
    if (selectedMedia.type.startsWith('video')) {
      addClipToTimeline(clip, 'v1');
    } else if (selectedMedia.type.startsWith('audio')) {
      addClipToTimeline(clip, 'a1');
    }
  };
  return (
    <div className="h-full bg-panel-medium border-r-2 border-r-primary/20 border-t border-border flex flex-col overflow-hidden min-w-0">
      {/* Header */}
      <div className="h-12 border-b border-border flex items-center justify-between px-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-semibold text-foreground">Source Monitor</h2>
          {selectedMedia && (
            <span className="rounded bg-panel-light px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              {selectedMedia.name}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {/* Spacer to match Program Monitor dropdown width */}
          <div className="w-[7rem]"></div>
        </div>
      </div>

      {/* Monitor Display */}
      <div className="flex-1 bg-monitor-bg flex items-center justify-center p-2">
        <div className="relative w-full max-w-3xl aspect-video bg-black rounded border border-border overflow-hidden">
          {selectedMedia ? (
            <>
              {selectedMedia.type.startsWith('video') ? (
                <video
                  ref={videoRef}
                  className="w-full h-full object-contain"
                  poster={selectedMedia.thumbnail}
                />
              ) : selectedMedia.type.startsWith('audio') ? (
                <div className="absolute inset-0 bg-gradient-to-br from-panel-dark via-panel-medium to-panel-dark flex items-center justify-center">
                  <audio ref={audioRef} />
                  <div className="text-center">
                    <div className="w-24 h-24 mx-auto mb-4 bg-clip-audio/20 rounded-full flex items-center justify-center">
                      <div className={`w-16 h-16 bg-clip-audio rounded-full ${isPlaying ? 'animate-pulse' : ''}`} />
                    </div>
                    <p className="text-sm text-foreground">{selectedMedia.name}</p>
                  </div>
                </div>
              ) : null}
            </>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-panel-dark via-panel-medium to-panel-dark flex items-center justify-center">
              <div className="text-center">
                <Play className="w-12 h-12 mx-auto mb-2 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">Select a clip to preview</p>
              </div>
            </div>
          )}
          
          {/* Scrub Bar with In/Out Points */}
          {selectedMedia && (
            <div className="absolute bottom-0 left-0 right-0 h-8 bg-panel-dark/90 px-2 flex items-center">
              <div className="flex-1 h-2 bg-panel-medium rounded-full relative mx-2">
                {/* In/Out range */}
                <div 
                  className="absolute h-full bg-primary/30 rounded-full"
                  style={{
                    left: `${(inPoint / selectedMedia.durationSeconds) * 100}%`,
                    width: `${((outPoint - inPoint) / selectedMedia.durationSeconds) * 100}%`,
                  }}
                />
                {/* Playhead */}
                <div 
                  className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-timeline-yellow rounded-full shadow-glow-yellow -ml-1.5"
                  style={{ left: `${(currentTime / selectedMedia.durationSeconds) * 100}%` }}
                />
                {/* In point marker */}
                <div 
                  className="absolute top-1/2 -translate-y-1/2 w-2 h-4 bg-green-500 -ml-1"
                  style={{ left: `${(inPoint / selectedMedia.durationSeconds) * 100}%` }}
                />
                {/* Out point marker */}
                <div 
                  className="absolute top-1/2 -translate-y-1/2 w-2 h-4 bg-red-500 -mr-1"
                  style={{ left: `${(outPoint / selectedMedia.durationSeconds) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="min-h-16 border-t border-border bg-monitor-controls px-4 flex items-center justify-between flex-shrink-0 gap-2 flex-wrap py-2 min-w-0">
        <div className="flex items-center gap-4 min-w-0">
          <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 shrink-0"
                onClick={togglePlayPause}
                disabled={!selectedMedia}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>
            <div className="flex gap-2 items-center">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6 shrink-0"
                aria-label="Step back"
                onClick={() => {
                  const mediaElement = selectedMedia?.type.startsWith('video') ? videoRef.current : audioRef.current;
                  if (mediaElement) {
                    mediaElement.currentTime = Math.max(0, currentTime - 1);
                  }
                }}
                disabled={!selectedMedia}
              >
                <ArrowLeft className="w-3 h-3" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6 shrink-0"
                aria-label="Step forward"
                onClick={() => {
                  const mediaElement = selectedMedia?.type.startsWith('video') ? videoRef.current : audioRef.current;
                  if (mediaElement && selectedMedia) {
                    mediaElement.currentTime = Math.min(selectedMedia.durationSeconds, currentTime + 1);
                  }
                }}
                disabled={!selectedMedia}
              >
                <ArrowRight className="w-3 h-3" />
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-1 font-mono text-xs text-muted-foreground">
            <span className="inline-flex w-[70px] justify-end">
              {selectedMedia ? formatTime(currentTime) : "--:--:--"}
            </span>
            <span>/</span>
            <span className="inline-flex w-[70px]">
              {selectedMedia ? selectedMedia.duration : "--:--:--"}
            </span>
          </div>
          <div className="flex items-center gap-1 font-mono text-xs text-muted-foreground">
            <span className="inline-flex w-[70px] justify-end">
              {selectedMedia ? formatTime(currentTime) : "--:--:--"}
            </span>
            <span>/</span>
            <span className="inline-flex w-[70px]">
              {selectedMedia ? selectedMedia.duration : "--:--:--"}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap min-w-0">
          <Button 
            size="sm" 
            variant="outline"
            className="h-8 shrink-0"
            onClick={() => setInPoint(currentTime)}
            disabled={!selectedMedia}
          >
            Mark In [{formatTime(inPoint)}]
          </Button>
          <Button 
            size="sm" 
            variant="outline"
            className="h-8 shrink-0"
            onClick={() => setOutPoint(currentTime)}
            disabled={!selectedMedia}
          >
            Mark Out [{formatTime(outPoint)}]
          </Button>
          <Button 
            size="sm" 
            className="bg-gradient-primary hover:opacity-90 text-white gap-2 h-8 shadow-glow-primary shrink-0"
            disabled={!selectedMedia}
            onClick={handleInsert}
          >
            <ArrowRight className="w-4 h-4" />
            Insert to Timeline
          </Button>
        </div>
      </div>
    </div>
  );
};
