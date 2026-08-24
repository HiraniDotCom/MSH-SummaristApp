"use client";

import { useState, useEffect } from "react";

interface AudioDurationProps {
  audioUrl: string;
}

export default function AudioDuration({ audioUrl }: AudioDurationProps) {
  const [duration, setDuration] = useState<string>("Loading...");

  useEffect(() => {
    if (!audioUrl) return;

    const audio = new Audio();
    audio.src = audioUrl;
    
    audio.preload = "metadata"; 

    const handleLoadedMetadata = () => {
      const time = audio.duration;
      if (isNaN(time)) {
        setDuration("Audio");
        return;
      }
      
      const minutes = Math.floor(time / 60);
      const seconds = Math.floor(time % 60).toString().padStart(2, "0");
      setDuration(`${minutes}:${seconds}`);
    };

    const handleLoadError = () => {
      setDuration("Audio");
    };

    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("error", handleLoadError);

    return () => {
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("error", handleLoadError);
      audio.src = ""; 
    };
  }, [audioUrl]);

  return <span className="text-xs font-semibold">{duration}</span>;
}
