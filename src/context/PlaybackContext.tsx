import { createContext, useContext, useState, useRef, useEffect, ReactNode } from 'react';

interface PlaybackContextType {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  setIsPlaying: (playing: boolean) => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  playheadRef: React.MutableRefObject<HTMLVideoElement | null>;
}

const PlaybackContext = createContext<PlaybackContextType | undefined>(undefined);

export const PlaybackProvider = ({ children }: { children: ReactNode }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(30); // Default 30 seconds
  const playheadRef = useRef<HTMLVideoElement | null>(null);

  // Auto-increment currentTime when playing
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setCurrentTime((prev) => {
        if (prev >= duration) {
          setIsPlaying(false);
          return duration;
        }
        return prev + 0.033; // ~30fps
      });
    }, 33);

    return () => clearInterval(interval);
  }, [isPlaying, duration]);

  return (
    <PlaybackContext.Provider
      value={{
        isPlaying,
        currentTime,
        duration,
        setIsPlaying,
        setCurrentTime,
        setDuration,
        playheadRef,
      }}
    >
      {children}
    </PlaybackContext.Provider>
  );
};

export const usePlayback = () => {
  const context = useContext(PlaybackContext);
  if (!context) {
    throw new Error('usePlayback must be used within PlaybackProvider');
  }
  return context;
};
