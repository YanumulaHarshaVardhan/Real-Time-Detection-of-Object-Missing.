
import React, { useRef, useState, useEffect } from "react";
import { DetectedObject, processVideoFrame, DetectionModelType } from "@/utils/detectionUtils";
import { AlertDisplay } from "@/components/AlertDisplay";
import { useWebcam } from "@/hooks/useWebcam";
import { useFpsCounter } from "@/hooks/useFpsCounter";
import { DetectionBoxes } from "@/components/DetectionBoxes";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Camera } from "lucide-react";

interface VideoFeedProps {
  objectDetector: any;
  isDetectionRunning: boolean;
  confidenceThreshold: number;
  timeThresholdForNew: number;
  timeThresholdForMissing: number;
  onFpsUpdate: (fps: number) => void;
}

export const VideoFeed: React.FC<VideoFeedProps> = ({
  objectDetector,
  isDetectionRunning,
  confidenceThreshold,
  timeThresholdForNew,
  timeThresholdForMissing,
  onFpsUpdate
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestAnimationFrameRef = useRef<number | null>(null);
  const { videoRef, streamRef, error: webcamError } = useWebcam({ width: 1280, height: 720 });
  const { updateFps } = useFpsCounter(onFpsUpdate);
  
  const [trackedObjects, setTrackedObjects] = useState<DetectedObject[]>([]);
  const [newObjectDetected, setNewObjectDetected] = useState<boolean>(false);
  const [missingObjectDetected, setMissingObjectDetected] = useState<boolean>(false);
  const [alertMessage, setAlertMessage] = useState<string>("");

  useEffect(() => {
    if (!isDetectionRunning || !objectDetector || !videoRef.current || !canvasRef.current || webcamError) {
      return;
    }
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    
    if (!ctx) return;
    
    const processFrame = async (timestamp: number) => {
      if (!video.paused && !video.ended && video.readyState >= 2) {
        updateFps(timestamp);
        
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        if (objectDetector) {
          const detectionConfig = {
            modelType: 'coco-detection' as DetectionModelType,
            confidenceThreshold,
            timeThresholdForNew,
            timeThresholdForMissing,
            iouThreshold: 0.5,
          };
          
          const { detectedObjects } = await processVideoFrame(
            objectDetector,
            video,
            trackedObjects,
            detectionConfig
          );
          
          const newObjects = detectedObjects.filter(obj => obj.isNew);
          const missingObjects = detectedObjects.filter(obj => obj.isMissing);
          
          if (newObjects.length > 0) {
            setNewObjectDetected(true);
            setAlertMessage(`New object detected: ${newObjects.map(o => o.label).join(", ")}`);
            setTimeout(() => setNewObjectDetected(false), 3000);
          }
          
          if (missingObjects.length > 0) {
            setMissingObjectDetected(true);
            setAlertMessage(`Object missing: ${missingObjects.map(o => o.label).join(", ")}`);
            setTimeout(() => setMissingObjectDetected(false), 3000);
          }
          
          setTrackedObjects(detectedObjects);
        }
      }
      
      requestAnimationFrameRef.current = requestAnimationFrame(processFrame);
    };
    
    requestAnimationFrameRef.current = requestAnimationFrame(processFrame);
    
    return () => {
      if (requestAnimationFrameRef.current) {
        cancelAnimationFrame(requestAnimationFrameRef.current);
      }
    };
  }, [isDetectionRunning, objectDetector, confidenceThreshold, timeThresholdForNew, timeThresholdForMissing, onFpsUpdate, trackedObjects, webcamError]);

  return (
    <div className="video-container w-full h-full">
      {webcamError ? (
        <div className="w-full h-full flex flex-col items-center justify-center bg-black/10 rounded-md p-4">
          <Alert className="max-w-md border-destructive bg-destructive/10">
            <Camera className="h-5 w-5 text-destructive" />
            <AlertTitle>Camera Error</AlertTitle>
            <AlertDescription>
              {webcamError}
            </AlertDescription>
          </Alert>
        </div>
      ) : (
        <>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-contain"
            style={{ opacity: isDetectionRunning ? 1 : 0.7 }}
          />
          <canvas
            ref={canvasRef}
            className="hidden"
          />
          <div className="video-overlay">
            {isDetectionRunning && (
              <DetectionBoxes
                trackedObjects={trackedObjects}
                confidenceThreshold={confidenceThreshold}
              />
            )}
          </div>
          <AlertDisplay
            newObjectDetected={newObjectDetected}
            missingObjectDetected={missingObjectDetected}
            message={alertMessage}
          />
        </>
      )}
    </div>
  );
};
