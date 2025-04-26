
import React from "react";
import { DetectedObject } from "@/utils/detectionUtils";

interface DetectionBoxesProps {
  trackedObjects: DetectedObject[];
  confidenceThreshold: number;
}

export const DetectionBoxes: React.FC<DetectionBoxesProps> = ({
  trackedObjects,
  confidenceThreshold
}) => {
  if (!trackedObjects.length) return null;
  
  return (
    <>
      {trackedObjects.map((obj) => {
        if (obj.score < confidenceThreshold) return null;
        
        let boxClassName = "detection-box tracked";
        let labelClassName = "detection-label tracked";
        
        if (obj.isNew) {
          boxClassName = "detection-box new";
          labelClassName = "detection-label new";
        } else if (obj.isMissing) {
          boxClassName = "detection-box missing";
          labelClassName = "detection-label missing";
        }
        
        const style = {
          left: `${obj.box.x * 100}%`,
          top: `${obj.box.y * 100}%`,
          width: `${obj.box.width * 100}%`,
          height: `${obj.box.height * 100}%`
        };
        
        const status = obj.isNew ? "New" : obj.isMissing ? "Missing" : "";
        
        return (
          <div key={obj.id}>
            <div className={boxClassName} style={style}></div>
            <div className={labelClassName} style={{ left: `${obj.box.x * 100}%`, top: `${obj.box.y * 100}%` }}>
              {obj.label} {status} ({Math.round(obj.score * 100)}%)
            </div>
          </div>
        );
      })}
    </>
  );
};
