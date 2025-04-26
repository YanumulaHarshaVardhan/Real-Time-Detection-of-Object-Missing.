
import { useRef } from "react";

export const useFpsCounter = (onFpsUpdate: (fps: number) => void) => {
  const frameCountRef = useRef<number>(0);
  const lastFpsUpdateTimeRef = useRef<number>(0);
  const lastFrameTimeRef = useRef<number>(0);

  const updateFps = (timestamp: number) => {
    const elapsed = timestamp - lastFrameTimeRef.current;
    if (elapsed > 0) {
      frameCountRef.current++;
      
      if (timestamp - lastFpsUpdateTimeRef.current >= 1000) {
        const fps = Math.round((frameCountRef.current * 1000) / (timestamp - lastFpsUpdateTimeRef.current));
        onFpsUpdate(fps);
        frameCountRef.current = 0;
        lastFpsUpdateTimeRef.current = timestamp;
      }
    }
    lastFrameTimeRef.current = timestamp;
  };

  return { updateFps };
};
