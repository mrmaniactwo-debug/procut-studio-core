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
  updateClip: (clipId: string, track: 'v1'|'v2'|'a1'|'a2', changes: Partial<TimelineClip>) => void;
  removeClip: (clipId: string, track: 'v1'|'v2'|'a1'|'a2') => void;
  // Linking
  isLinked: (mediaId: string) => boolean;
  toggleLinkForMedia: (mediaId: string) => void;
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
  // mediaIds that are unlinked (A/V can move independently)
  const [unlinkedMediaIds, setUnlinkedMediaIds] = useState<Set<string>>(new Set());

  const isLinked = (mediaId: string) => !unlinkedMediaIds.has(mediaId);
  const toggleLinkForMedia = (mediaId: string) => {
    setUnlinkedMediaIds(prev => {
      const next = new Set(prev);
      if (next.has(mediaId)) next.delete(mediaId); else next.add(mediaId);
      return next;
    });
  };

  const addClipToTimeline = (clip: TimelineClip, track: 'v1' | 'v2' | 'a1' | 'a2') => {
    setTimelineClips((prev) => ({
      ...prev,
      [track]: [...prev[track], clip],
    }));
  };

  const updateClip: MediaContextType['updateClip'] = (clipId, track, changes) => {
    setTimelineClips(prev => ({
      ...prev,
      [track]: prev[track].map(c => c.id === clipId ? { ...c, ...changes } : c)
    }));
  };

  const removeClip: MediaContextType['removeClip'] = (clipId, track) => {
    setTimelineClips(prev => ({
      ...prev,
      [track]: prev[track].filter(c => c.id !== clipId)
    }));
  };

  const updateClipPosition = (clipId: string, track: 'v1' | 'v2' | 'a1' | 'a2', newStartTime: number) => {
    setTimelineClips((prev) => {
      const currentClips = prev[track];
      const moving = currentClips.find(c => c.id === clipId);
      if (!moving) return prev;
      const delta = newStartTime - moving.startTime;
      const next: typeof prev = { ...prev };
      next[track] = currentClips.map(c => c.id === clipId ? { ...c, startTime: newStartTime } : c);
      // Move linked counterparts by same delta
      if (isLinked(moving.mediaId)) {
        const isVideo = track === 'v1' || track === 'v2';
        const counterpartTracks: Array<'v1'|'v2'|'a1'|'a2'> = isVideo ? ['a1','a2'] : ['v1','v2'];
        counterpartTracks.forEach(tk => {
          next[tk] = next[tk].map(c => c.mediaId === moving.mediaId ? { ...c, startTime: Math.max(0, c.startTime + delta) } : c);
        });
      }
      return next;
    });
  };

  const moveClip: MediaContextType['moveClip'] = (clipId, fromTrack, toTrack, newStartTime) => {
    setTimelineClips((prev) => {
      const srcList = prev[fromTrack];
      const clip = srcList.find(c => c.id === clipId);
      if (!clip) return prev;
      const delta = newStartTime - clip.startTime;
      const next: typeof prev = { ...prev };
      next[fromTrack] = srcList.filter(c => c.id !== clipId);
      next[toTrack] = [...prev[toTrack], { ...clip, startTime: newStartTime }];
      // Move linked counterparts on their tracks by same delta
      if (isLinked(clip.mediaId)) {
        const isVideo = fromTrack === 'v1' || fromTrack === 'v2' || toTrack === 'v1' || toTrack === 'v2';
        const counterpartTracks: Array<'v1'|'v2'|'a1'|'a2'> = isVideo ? ['a1','a2'] : ['v1','v2'];
        counterpartTracks.forEach(tk => {
          next[tk] = next[tk].map(c => c.mediaId === clip.mediaId ? { ...c, startTime: Math.max(0, c.startTime + delta) } : c);
        });
      }
      return next;
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
        updateClip,
        updateClipPosition,
        moveClip,
        removeClip,
        isLinked,
        toggleLinkForMedia,
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
