
import { pipeline, env } from "@huggingface/transformers";

// Configure transformers.js to use WebGL acceleration if available
env.backends.onnx.wasm.numThreads = 4;

// Represents a detected object
export interface DetectedObject {
  id: string;
  label: string;
  score: number;
  box: {
    x: number;
    y: number; 
    width: number;
    height: number;
  };
  firstDetectedAt: number;
  lastDetectedAt: number;
  isNew: boolean;
  isMissing: boolean;
}

// Types of detection models available
export type DetectionModelType = 'coco-detection' | 'custom-detection';

// Configuration for detection
export interface DetectionConfig {
  modelType: DetectionModelType;
  confidenceThreshold: number;
  timeThresholdForNew: number; // Time in ms to consider object as "new"
  timeThresholdForMissing: number; // Time in ms to consider object as "missing"
  iouThreshold: number; // Intersection over Union threshold for tracking
}

// Default configuration
export const defaultDetectionConfig: DetectionConfig = {
  modelType: 'coco-detection',
  confidenceThreshold: 0.5,
  timeThresholdForNew: 2000,
  timeThresholdForMissing: 2000,
  iouThreshold: 0.5,
};

// Initialize object detection pipeline
export async function initializeDetection(modelType: DetectionModelType) {
  console.log("Initializing object detection pipeline...");
  
  // Select the appropriate model based on type
  let model = "Xenova/yolos-tiny";
  
  if (modelType === 'custom-detection') {
    // Can be replaced with a custom model later
    model = "Xenova/yolos-tiny";
  }
  
  try {
    const objectDetector = await pipeline("object-detection", model);
    console.log("Object detection pipeline initialized successfully");
    return objectDetector;
  } catch (error) {
    console.error("Failed to initialize object detection:", error);
    throw new Error("Failed to initialize object detection");
  }
}

// Calculate Intersection over Union (IoU) between two boxes
function calculateIoU(box1: DetectedObject['box'], box2: DetectedObject['box']): number {
  // Calculate coordinates of intersection
  const x1 = Math.max(box1.x, box2.x);
  const y1 = Math.max(box1.y, box2.y);
  const x2 = Math.min(box1.x + box1.width, box2.x + box2.width);
  const y2 = Math.min(box1.y + box1.height, box2.y + box2.height);
  
  // No intersection
  if (x2 < x1 || y2 < y1) return 0;
  
  const intersection = (x2 - x1) * (y2 - y1);
  const area1 = box1.width * box1.height;
  const area2 = box2.width * box2.height;
  
  // Return IoU
  return intersection / (area1 + area2 - intersection);
}

// Track objects across frames
export function trackObjects(
  previousObjects: DetectedObject[],
  currentDetections: Array<{
    label: string;
    score: number;
    box: { xmin: number; ymin: number; xmax: number; ymax: number };
  }>,
  frameWidth: number,
  frameHeight: number,
  config: DetectionConfig
): DetectedObject[] {
  const currentTime = Date.now();
  const newObjects: DetectedObject[] = [];
  
  // Convert raw detections to normalized format
  const normalizedDetections = currentDetections
    .filter(det => det.score >= config.confidenceThreshold)
    .map(det => {
      return {
        label: det.label,
        score: det.score,
        box: {
          x: det.box.xmin / frameWidth,
          y: det.box.ymin / frameHeight,
          width: (det.box.xmax - det.box.xmin) / frameWidth,
          height: (det.box.ymax - det.box.ymin) / frameHeight
        }
      };
    });
  
  // Track existing objects
  const trackedPrevObjects = [...previousObjects];
  
  // Match current detections to existing objects
  for (const detection of normalizedDetections) {
    let matched = false;
    
    // Try to match with existing objects
    for (let i = 0; i < trackedPrevObjects.length; i++) {
      const prevObject = trackedPrevObjects[i];
      
      // Skip already matched objects
      if (prevObject.lastDetectedAt === currentTime) continue;
      
      // Check if same object class and sufficient IoU
      if (
        prevObject.label === detection.label &&
        calculateIoU(prevObject.box, detection.box) >= config.iouThreshold
      ) {
        // Update existing object
        prevObject.box = detection.box;
        prevObject.score = detection.score;
        prevObject.lastDetectedAt = currentTime;
        
        // If previously marked as missing, it's no longer missing
        if (prevObject.isMissing) {
          prevObject.isMissing = false;
        }
        
        // If object is recent enough, still mark it as new
        prevObject.isNew = (currentTime - prevObject.firstDetectedAt < config.timeThresholdForNew);
        
        matched = true;
        break;
      }
    }
    
    // If no match found, create new object
    if (!matched) {
      const newObject: DetectedObject = {
        id: `obj_${currentTime}_${Math.random().toString(36).substr(2, 9)}`,
        label: detection.label,
        score: detection.score,
        box: detection.box,
        firstDetectedAt: currentTime,
        lastDetectedAt: currentTime,
        isNew: true,
        isMissing: false
      };
      
      newObjects.push(newObject);
    }
  }
  
  // Add all new objects
  trackedPrevObjects.push(...newObjects);
  
  // Update missing state for previously tracked objects not found in current frame
  for (const obj of trackedPrevObjects) {
    if (obj.lastDetectedAt !== currentTime) {
      // Check if it should be considered missing
      const timeSinceLastSeen = currentTime - obj.lastDetectedAt;
      obj.isMissing = timeSinceLastSeen >= config.timeThresholdForMissing;
    }
  }
  
  // Filter out objects that have been missing for too long (3x the threshold)
  return trackedPrevObjects.filter(obj => {
    return !obj.isMissing || (currentTime - obj.lastDetectedAt < config.timeThresholdForMissing * 3);
  });
}

// Process a video frame for object detection
export async function processVideoFrame(
  objectDetector: any,
  videoElement: HTMLVideoElement,
  trackedObjects: DetectedObject[],
  config: DetectionConfig
): Promise<{ 
  detectedObjects: DetectedObject[],
  processingTimeMs: number
}> {
  const startTime = performance.now();
  
  try {
    // Run object detection on the video frame
    const results = await objectDetector(videoElement, {
      threshold: config.confidenceThreshold,
      percentage: true
    });
    
    // Track objects across frames
    const frameWidth = videoElement.videoWidth;
    const frameHeight = videoElement.videoHeight;
    
    const detectedObjects = trackObjects(
      trackedObjects,
      results,
      frameWidth,
      frameHeight,
      config
    );
    
    const endTime = performance.now();
    const processingTimeMs = endTime - startTime;
    
    return {
      detectedObjects,
      processingTimeMs
    };
  } catch (error) {
    console.error("Error processing video frame:", error);
    return {
      detectedObjects: trackedObjects,
      processingTimeMs: performance.now() - startTime
    };
  }
}
