
import { useEffect, useRef, useState } from "react";

interface WebcamConfig {
  width: number;
  height: number;
}

export const useWebcam = (config: WebcamConfig = { width: 1280, height: 720 }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeWebcam = async () => {
      try {
        const constraints = {
          video: {
            width: { ideal: config.width },
            height: { ideal: config.height },
            facingMode: "environment"
          }
        };
        
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          streamRef.current = stream;
          setError(null);
        }
      } catch (err: any) {
        console.error("Error accessing webcam:", err);
        
        if (err.name === "NotAllowedError") {
          setError("Camera access was denied. Please allow camera access in your browser settings and reload the page.");
        } else if (err.name === "NotFoundError") {
          setError("No camera device was found. Please connect a camera and reload the page.");
        } else if (err.name === "NotReadableError") {
          setError("Camera is in use by another application. Please close other apps using the camera and reload.");
        } else {
          setError(`Error accessing camera: ${err.message || 'Unknown error'}`);
        }
      }
    };
    
    initializeWebcam();
    
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [config.width, config.height]);

  return { videoRef, streamRef, error };
};
