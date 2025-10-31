import React from "react";
import { cn } from "@/lib/utils";
import { DEFAULT_FPS, TIMECODE_PLACEHOLDER, formatTimecode } from "@/lib/timecode";

type TimecodeProps = {
  seconds?: number;
  fps?: number;
  placeholder?: string;
  className?: string;
  fixedWidth?: boolean;
  size?: "sm" | "base";
  title?: string;
};

export const Timecode: React.FC<TimecodeProps> = ({
  seconds,
  fps = DEFAULT_FPS,
  placeholder = TIMECODE_PLACEHOLDER,
  className,
  fixedWidth = true,
  size = "base",
  title,
}) => {
  const text = seconds == null ? placeholder : formatTimecode(seconds, fps);
  const widthClass = fixedWidth ? "w-[7.5rem]" : undefined; // fits HH:MM:SS:FF
  const sizeClass = size === "sm" ? "text-sm" : "text-base";
  return (
    <span
      className={cn(
        "inline-flex justify-end tabular-nums font-mono whitespace-nowrap shrink-0",
        widthClass,
        sizeClass,
        className
      )}
      title={title ?? text}
    >
      {text}
    </span>
  );
};

type TimecodePairProps = {
  currentSeconds?: number;
  totalSeconds?: number;
  fps?: number;
  className?: string;
  size?: "sm" | "base";
  fixedWidth?: boolean;
};

export const TimecodePair: React.FC<TimecodePairProps> = ({
  currentSeconds,
  totalSeconds,
  fps = DEFAULT_FPS,
  className,
  size = "base",
  fixedWidth = true,
}) => {
  return (
    <div className={cn("flex items-center gap-1 min-w-0", className)}>
      <Timecode seconds={currentSeconds} fps={fps} fixedWidth={fixedWidth} size={size} />
      <span className="text-muted-foreground">/</span>
      <Timecode seconds={totalSeconds} fps={fps} fixedWidth={fixedWidth} size={size} className="text-muted-foreground" />
    </div>
  );
};
