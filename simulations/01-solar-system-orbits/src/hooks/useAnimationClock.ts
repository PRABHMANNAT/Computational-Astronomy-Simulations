"use client";

import { useEffect, useRef, useState } from "react";

export function useAnimationClock(isPlaying: boolean, timeScaleDaysPerSecond: number) {
  const [elapsedDays, setElapsedDays] = useState(0);
  const previousTimeRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isPlaying) {
      previousTimeRef.current = null;
      return undefined;
    }

    let frameId = 0;

    const tick = (time: number) => {
      if (previousTimeRef.current !== null) {
        const deltaSeconds = (time - previousTimeRef.current) / 1000;
        setElapsedDays((current) => current + deltaSeconds * timeScaleDaysPerSecond);
      }

      previousTimeRef.current = time;
      frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [isPlaying, timeScaleDaysPerSecond]);

  return {
    elapsedDays,
    reset: () => setElapsedDays(0),
    setElapsedDays
  };
}
