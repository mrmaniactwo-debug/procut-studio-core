import { createContext, useContext, useState, ReactNode } from 'react';

export interface MediaFile {
  id: string;
  name: string;
  type: string;
  duration: string;
  durationSeconds: number;
  resolution: string;
  thumbnail?: string;
  file?: File;
}

export interface TimelineClip {
  id: string;
  mediaId: string;
  name: string;
  type: string;
  duration: number;
  inPoint: number;
  outPoint: number;
  startTime: number;
  thumbnail?: string;
  file?: File;
}

interface MediaContextType {
  mediaFiles: MediaFile[];
  setMediaFiles: (files: MediaFile[]) => void;
  selectedMedia: MediaFile | null;
  setSelectedMedia: (media: MediaFile | null) => void;
  timelineClips: {
    v1: TimelineClip[];
    v2: TimelineClip[];
    a1: TimelineClip[];
    a2: TimelineClip[];
  };
  addClipToTimeline: (clip: TimelineClip, track: 'v1' | 'v2' | 'a1' | 'a2') => void;
  updateClipPosition: (clipId: string, track: 'v1' | 'v2' | 'a1' | 'a2', newStartTime: number) => void;
  moveClip: (clipId: string, fromTrack: 'v1' | 'v2' | 'a1' | 'a2', toTrack: 'v1' | 'v2' | 'a1' | 'a2', newStartTime: number) => void;
}

const MediaContext = createContext<MediaContextType | undefined>(undefined);

export const MediaProvider = ({ children }: { children: ReactNode }) => {
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [selectedMedia, setSelectedMedia] = useState<MediaFile | null>(null);
  const [timelineClips, setTimelineClips] = useState<{
    v1: TimelineClip[];
    v2: TimelineClip[];
    a1: TimelineClip[];
    a2: TimelineClip[];
  }>({
    v1: [],
    v2: [],
    a1: [],
    a2: [],
  });

  const addClipToTimeline = (clip: TimelineClip, track: 'v1' | 'v2' | 'a1' | 'a2') => {
    setTimelineClips((prev) => ({
      ...prev,
      [track]: [...prev[track], clip],
    }));
  };

  const updateClipPosition = (clipId: string, track: 'v1' | 'v2' | 'a1' | 'a2', newStartTime: number) => {
    setTimelineClips((prev) => ({
      ...prev,
      [track]: prev[track].map((clip) =>
        clip.id === clipId ? { ...clip, startTime: newStartTime } : clip
      ),
    }));
  };

  const moveClip: MediaContextType['moveClip'] = (clipId, fromTrack, toTrack, newStartTime) => {
    setTimelineClips((prev) => {
      // Find the clip in fromTrack
      const clip = prev[fromTrack].find((c) => c.id === clipId);
      if (!clip) return prev; // nothing to move
      // Remove from source track
      const nextFrom = prev[fromTrack].filter((c) => c.id !== clipId);
      // Insert (or replace existing) in target track with updated startTime
      const moved: TimelineClip = { ...clip, startTime: newStartTime };
      const nextTo = [...prev[toTrack], moved];
      return {
        ...prev,
        [fromTrack]: nextFrom,
        [toTrack]: nextTo,
      };
    });
  };

  return (
    <MediaContext.Provider
      value={{
        mediaFiles,
        setMediaFiles,
        selectedMedia,
        setSelectedMedia,
        timelineClips,
        addClipToTimeline,
        updateClipPosition,
        moveClip,
      }}
    >
      {children}
    </MediaContext.Provider>
  );
};

export const useMedia = () => {
  const context = useContext(MediaContext);
  if (!context) {
    throw new Error('useMedia must be used within MediaProvider');
  }
  return context;
};
