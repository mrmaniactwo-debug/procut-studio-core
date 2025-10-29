import { Play, Pause, SkipBack, SkipForward, ZoomIn, ZoomOut, Eye, EyeOff, Lock, LockOpen, Volume2, VolumeX, Mic, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useState } from "react";

export const Timeline = () => {
  const [trackStates, setTrackStates] = useState({
    v1: { visible: true, locked: false, muted: false, selected: true },
    a1: { visible: true, locked: false, muted: false, selected: false },
    v2: { visible: true, locked: false, muted: false, selected: false },
    a2: { visible: true, locked: false, muted: false, selected: false },
    v3: { visible: true, locked: false, muted: false, selected: false },
  });

  return (
    <div className="h-80 bg-timeline-bg border-t border-primary/20 flex flex-col">
      {/* Sequence Tab Header */}
      <div className="h-8 bg-panel-dark border-b border-border flex items-center px-2 gap-2">
        <div className="flex items-center gap-1 bg-panel-medium px-3 py-1 rounded-t border-t-2 border-t-primary text-xs">
          <span className="text-foreground font-medium">Sequence 01</span>
          <Button variant="ghost" size="icon" className="h-4 w-4 hover:bg-panel-dark">
            <X className="w-3 h-3" />
          </Button>
        </div>
        <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground">
          ☰
        </Button>
      </div>
      
      <div className="flex-1 flex">
      {/* Audio Level Meter - Right Side */}
      <div className="w-12 bg-panel-dark border-l border-border flex flex-col items-center py-2">
        <div className="text-[10px] text-muted-foreground mb-2 rotate-0 writing-mode-vertical">AUDIO</div>
        <div className="flex-1 flex gap-1 justify-center">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="w-2 bg-panel-medium rounded-full relative overflow-hidden">
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-green-500 via-timeline-yellow to-red-500" style={{ height: `${40 + Math.random() * 30}%` }} />
            </div>
          ))}
        </div>
        <div className="text-[9px] text-muted-foreground mt-1">-12 dB</div>
      </div>
      
      <div className="flex-1 flex flex-col">
      {/* Timeline Controls */}
      <div className="h-12 bg-panel-medium border-b border-border flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <SkipBack className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-9 w-9 bg-primary hover:bg-primary/90">
            <Play className="w-5 h-5 text-primary-foreground" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <SkipForward className="w-4 h-4" />
          </Button>
          <div className="ml-4 text-sm font-mono text-foreground">00:00:00:00</div>
        </div>
        
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground">30 fps • 1920x1080</span>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-7 w-7">
              <ZoomOut className="w-3 h-3" />
            </Button>
            <Slider defaultValue={[50]} max={100} step={1} className="w-20" />
            <Button variant="ghost" size="icon" className="h-7 w-7">
              <ZoomIn className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </div>

      {/* Timeline Ruler - Yellow accented */}
      <div className="h-8 bg-panel-dark border-b border-timeline-yellow/20 relative">
        <div className="absolute inset-0 flex items-center px-20">
          {[0, 5, 10, 15, 20, 25, 30].map((time) => (
            <div key={time} className="flex-1 relative">
              <div className="absolute left-0 top-0 w-px h-full bg-timeline-yellow/30" />
              <span className="absolute left-1 top-1 text-[10px] text-timeline-yellow font-mono font-semibold">
                {time}s
              </span>
              {/* Tick marks */}
              {time < 30 && (
                <>
                  <div className="absolute left-1/4 top-0 w-px h-2 bg-timeline-yellow/20" />
                  <div className="absolute left-1/2 top-0 w-px h-3 bg-timeline-yellow/25" />
                  <div className="absolute left-3/4 top-0 w-px h-2 bg-timeline-yellow/20" />
                </>
              )}
            </div>
          ))}
          {/* Markers - colored */}
          <div className="absolute left-32 top-0 w-2 h-2 bg-green-500 rounded-sm shadow-sm" />
          <div className="absolute left-64 top-0 w-2 h-2 bg-blue-500 rounded-sm shadow-sm" />
        </div>
        {/* Playhead - Yellow glowing */}
        <div className="absolute left-20 top-0 bottom-0 w-0.5 bg-timeline-yellow shadow-glow-yellow">
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-timeline-yellow rounded-sm shadow-glow-yellow" />
          <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[6px] border-t-timeline-yellow" />
        </div>
      </div>

      {/* Timeline Tracks */}
      <div className="flex-1 overflow-y-auto">
        {/* Video Track 3 */}
        <div className="h-16 bg-timeline-track border-b border-border/50 border-l-2 border-l-transparent flex items-center hover:bg-timeline-track/80 transition-colors">
          <div className="w-20 flex flex-col items-center justify-center gap-1 border-r border-border px-1.5 py-1">
            <div className="flex items-center gap-1 w-full justify-between">
              <span className="text-xs text-muted-foreground font-semibold">V3</span>
              <div className="flex gap-0.5">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className={`h-5 w-5 ${trackStates.v3.visible ? 'text-primary' : 'text-muted-foreground/50'} hover:text-foreground`}
                  onClick={() => setTrackStates(prev => ({ ...prev, v3: { ...prev.v3, visible: !prev.v3.visible }}))}
                >
                  {trackStates.v3.visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className={`h-5 w-5 ${trackStates.v3.locked ? 'text-primary' : 'text-muted-foreground/50'} hover:text-foreground`}
                  onClick={() => setTrackStates(prev => ({ ...prev, v3: { ...prev.v3, locked: !prev.v3.locked }}))}
                >
                  {trackStates.v3.locked ? <Lock className="w-3 h-3" /> : <LockOpen className="w-3 h-3" />}
                </Button>
              </div>
            </div>
          </div>
          <div className="flex-1 relative h-12 px-1" />
        </div>

        {/* Video Track 2 */}
        <div className="h-16 bg-timeline-track border-b border-border/50 border-l-2 border-l-transparent flex items-center hover:bg-timeline-track/80 transition-colors">
          <div className="w-20 flex flex-col items-center justify-center gap-1 border-r border-border px-1.5 py-1">
            <div className="flex items-center gap-1 w-full justify-between">
              <span className="text-xs text-muted-foreground font-semibold">V2</span>
              <div className="flex gap-0.5">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className={`h-5 w-5 ${trackStates.v2.visible ? 'text-primary' : 'text-muted-foreground/50'} hover:text-foreground`}
                  onClick={() => setTrackStates(prev => ({ ...prev, v2: { ...prev.v2, visible: !prev.v2.visible }}))}
                >
                  {trackStates.v2.visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className={`h-5 w-5 ${trackStates.v2.locked ? 'text-primary' : 'text-muted-foreground/50'} hover:text-foreground`}
                  onClick={() => setTrackStates(prev => ({ ...prev, v2: { ...prev.v2, locked: !prev.v2.locked }}))}
                >
                  {trackStates.v2.locked ? <Lock className="w-3 h-3" /> : <LockOpen className="w-3 h-3" />}
                </Button>
              </div>
            </div>
          </div>
          <div className="flex-1 relative h-12 px-1">
            <div className="absolute left-96 top-1 bottom-1 w-24 bg-clip-video/60 hover:bg-clip-video/80 rounded border border-clip-video/50 hover:border-primary flex items-center justify-center shadow-md hover:shadow-panel-hover transition-all cursor-pointer">
              <span className="text-white/70 text-[10px] font-semibold">B-Roll.mp4</span>
            </div>
          </div>
        </div>

        {/* Video Track 1 - Selected/Active */}
        <div className="h-16 bg-timeline-track border-b border-border/50 border-l-2 border-l-primary flex items-center hover:bg-timeline-track/80 transition-colors">
          <div className="w-20 flex flex-col items-center justify-center gap-1 border-r border-border px-1.5 py-1 bg-primary/10">
            <div className="flex items-center gap-1 w-full justify-between">
              <span className="text-xs text-primary font-bold">V1</span>
              <div className="flex gap-0.5">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className={`h-5 w-5 ${trackStates.v1.visible ? 'text-primary' : 'text-muted-foreground'} hover:text-foreground`}
                  onClick={() => setTrackStates(prev => ({ ...prev, v1: { ...prev.v1, visible: !prev.v1.visible }}))}
                >
                  {trackStates.v1.visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className={`h-5 w-5 ${trackStates.v1.locked ? 'text-primary' : 'text-muted-foreground'} hover:text-foreground`}
                  onClick={() => setTrackStates(prev => ({ ...prev, v1: { ...prev.v1, locked: !prev.v1.locked }}))}
                >
                  {trackStates.v1.locked ? <Lock className="w-3 h-3" /> : <LockOpen className="w-3 h-3" />}
                </Button>
              </div>
            </div>
          </div>
          <div className="flex-1 relative h-12 px-1">
            {/* Enhanced Video Clips with thumbnails */}
            <div className="absolute left-12 top-1 bottom-1 w-40 bg-gradient-to-br from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 rounded border border-purple-400/30 hover:border-primary shadow-lg hover:shadow-primary/20 transition-all cursor-pointer overflow-hidden">
              <div className="absolute inset-0 opacity-30 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
              <div className="relative h-full flex flex-col justify-between p-1">
                <div className="flex items-center justify-between">
                  <span className="text-white text-[10px] font-semibold drop-shadow-sm">A002_C018_0922BW_001...</span>
                  <span className="text-[8px] bg-pink-500/90 px-1 py-0.5 rounded text-white font-semibold">fx</span>
                </div>
                <div className="w-full h-0.5 bg-timeline-yellow/40 rounded-full" />
              </div>
            </div>
            <div className="absolute left-56 top-1 bottom-1 w-32 bg-gradient-to-br from-pink-600 to-pink-700 hover:from-pink-500 hover:to-pink-600 rounded border border-pink-400/30 hover:border-primary shadow-lg hover:shadow-primary/20 transition-all cursor-pointer overflow-hidden">
              <div className="absolute inset-0 opacity-30 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
              <div className="relative h-full flex items-start p-1">
                <span className="text-white text-[10px] font-semibold drop-shadow-sm">A001_C06...</span>
              </div>
            </div>
            <div className="absolute left-96 top-1 bottom-1 w-32 bg-gradient-to-br from-cyan-600 to-cyan-700 hover:from-cyan-500 hover:to-cyan-600 rounded border border-cyan-400/30 hover:border-primary shadow-lg hover:shadow-primary/20 transition-all cursor-pointer overflow-hidden">
              <div className="absolute inset-0 opacity-30 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
              <div className="relative h-full flex items-start p-1">
                <span className="text-white text-[10px] font-semibold drop-shadow-sm">A002_C0...</span>
              </div>
            </div>
            <div className="absolute left-[32rem] top-1 bottom-1 w-64 bg-gradient-to-br from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 rounded border border-green-400/30 hover:border-primary shadow-lg hover:shadow-primary/20 transition-all cursor-pointer overflow-hidden">
              <div className="absolute inset-0 opacity-30 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
              <div className="relative h-full flex flex-col justify-between p-1">
                <div className="flex items-center justify-between">
                  <span className="text-white text-[10px] font-semibold drop-shadow-sm">A003_C092_09231C_001.mp4 [V]</span>
                  <span className="text-[8px] bg-green-400/90 px-1 py-0.5 rounded text-white font-semibold">fx</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Audio Track 1 - Selected/Active */}
        <div className="h-16 bg-timeline-track border-b border-border/50 border-l-2 border-l-primary flex items-center hover:bg-timeline-track/80 transition-colors">
          <div className="w-20 flex flex-col items-center justify-center gap-1 border-r border-border px-1.5 py-1 bg-primary/10">
            <div className="flex items-center gap-1 w-full justify-between">
              <span className="text-xs text-cyan-400 font-bold">A1</span>
              <div className="flex gap-0.5">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className={`h-5 w-5 ${trackStates.a1.muted ? 'text-red-500' : 'text-cyan-400'} hover:text-foreground`}
                  onClick={() => setTrackStates(prev => ({ ...prev, a1: { ...prev.a1, muted: !prev.a1.muted }}))}
                >
                  <span className="text-[9px] font-bold">M</span>
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className={`h-5 w-5 text-muted-foreground hover:text-foreground`}
                >
                  <span className="text-[9px] font-bold">S</span>
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className={`h-5 w-5 ${trackStates.a1.locked ? 'text-primary' : 'text-muted-foreground'} hover:text-foreground`}
                  onClick={() => setTrackStates(prev => ({ ...prev, a1: { ...prev.a1, locked: !prev.a1.locked }}))}
                >
                  {trackStates.a1.locked ? <Lock className="w-3 h-3" /> : <LockOpen className="w-3 h-3" />}
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-5 w-5 text-muted-foreground hover:text-foreground"
                >
                  <Mic className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </div>
          <div className="flex-1 relative h-12 px-1">
            {/* Enhanced Audio Clips with waveforms */}
            <div className="absolute left-12 top-1 bottom-1 w-40 bg-gradient-to-br from-purple-600/40 to-purple-700/40 hover:from-purple-500/50 hover:to-purple-600/50 rounded border border-purple-400/40 hover:border-primary shadow-md hover:shadow-primary/10 transition-all cursor-pointer overflow-hidden">
              <div className="relative h-full flex flex-col px-2 py-1">
                <div className="flex gap-0.5 h-full items-center justify-center">
                  {Array.from({ length: 45 }).map((_, i) => (
                    <div
                      key={i}
                      className="w-0.5 bg-cyan-400 rounded-full opacity-80"
                      style={{ height: `${30 + Math.random() * 50}%` }}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="absolute left-56 top-1 bottom-1 w-32 bg-gradient-to-br from-pink-600/40 to-pink-700/40 hover:from-pink-500/50 hover:to-pink-600/50 rounded border border-pink-400/40 hover:border-primary shadow-md hover:shadow-primary/10 transition-all cursor-pointer overflow-hidden">
              <div className="relative h-full flex flex-col px-2 py-1">
                <div className="flex gap-0.5 h-full items-center justify-center">
                  {Array.from({ length: 35 }).map((_, i) => (
                    <div
                      key={i}
                      className="w-0.5 bg-cyan-400 rounded-full opacity-80"
                      style={{ height: `${30 + Math.random() * 50}%` }}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="absolute left-96 top-1 bottom-1 w-32 bg-gradient-to-br from-cyan-600/40 to-cyan-700/40 hover:from-cyan-500/50 hover:to-cyan-600/50 rounded border border-cyan-400/40 hover:border-primary shadow-md hover:shadow-primary/10 transition-all cursor-pointer overflow-hidden">
              <div className="relative h-full flex flex-col px-2 py-1">
                <div className="flex gap-0.5 h-full items-center justify-center">
                  {Array.from({ length: 35 }).map((_, i) => (
                    <div
                      key={i}
                      className="w-0.5 bg-cyan-400 rounded-full opacity-80"
                      style={{ height: `${30 + Math.random() * 50}%` }}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="absolute left-[32rem] top-1 bottom-1 w-64 bg-gradient-to-br from-green-600/40 to-green-700/40 hover:from-green-500/50 hover:to-green-600/50 rounded border border-green-400/40 hover:border-primary shadow-md hover:shadow-primary/10 transition-all cursor-pointer overflow-hidden">
              <div className="relative h-full flex flex-col px-2 py-1">
                <div className="flex gap-0.5 h-full items-center justify-center">
                  {Array.from({ length: 70 }).map((_, i) => (
                    <div
                      key={i}
                      className="w-0.5 bg-green-400 rounded-full opacity-80"
                      style={{ height: `${30 + Math.random() * 50}%` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Audio Track 2 */}
        <div className="h-16 bg-timeline-track border-b border-border/50 border-l-2 border-l-transparent flex items-center hover:bg-timeline-track/80 transition-colors">
          <div className="w-20 flex flex-col items-center justify-center gap-1 border-r border-border px-1.5 py-1">
            <div className="flex items-center gap-1 w-full justify-between">
              <span className="text-xs text-muted-foreground font-semibold">A2</span>
              <div className="flex gap-0.5">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className={`h-5 w-5 ${trackStates.a2.muted ? 'text-red-500' : 'text-muted-foreground/50'} hover:text-foreground`}
                  onClick={() => setTrackStates(prev => ({ ...prev, a2: { ...prev.a2, muted: !prev.a2.muted }}))}
                >
                  <span className="text-[9px] font-bold">M</span>
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-5 w-5 text-muted-foreground/50 hover:text-foreground"
                >
                  <span className="text-[9px] font-bold">S</span>
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className={`h-5 w-5 ${trackStates.a2.locked ? 'text-primary' : 'text-muted-foreground/50'} hover:text-foreground`}
                  onClick={() => setTrackStates(prev => ({ ...prev, a2: { ...prev.a2, locked: !prev.a2.locked }}))}
                >
                  {trackStates.a2.locked ? <Lock className="w-3 h-3" /> : <LockOpen className="w-3 h-3" />}
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-5 w-5 text-muted-foreground/50 hover:text-foreground"
                >
                  <Mic className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </div>
          <div className="flex-1 relative h-12 px-1" />
        </div>
      </div>
      </div>
      </div>
    </div>
  );
};
