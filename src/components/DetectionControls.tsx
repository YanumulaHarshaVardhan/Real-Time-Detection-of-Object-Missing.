
import React from "react";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Slider 
} from "@/components/ui/slider";
import { 
  Play, 
  Pause, 
  Settings,
  RotateCcw
} from "lucide-react";

interface DetectionControlsProps {
  isDetectionRunning: boolean;
  confidenceThreshold: number;
  timeThresholdForNew: number;
  timeThresholdForMissing: number;
  onToggleDetection: () => void;
  onReset: () => void;
  onConfidenceChange: (value: number) => void;
  onNewTimeThresholdChange: (value: number) => void;
  onMissingTimeThresholdChange: (value: number) => void;
  fps: number;
}

export const DetectionControls: React.FC<DetectionControlsProps> = ({
  isDetectionRunning,
  confidenceThreshold,
  timeThresholdForNew,
  timeThresholdForMissing,
  onToggleDetection,
  onReset,
  onConfidenceChange,
  onNewTimeThresholdChange,
  onMissingTimeThresholdChange,
  fps
}) => {
  return (
    <Card className="w-full bg-sightguard-dark-blue border-sightguard-secondary">
      <CardHeader className="pb-4">
        <CardTitle className="text-sightguard-accent flex items-center justify-between">
          <span>Detection Controls</span>
          <span className="text-sm font-normal text-sightguard-primary">
            {fps > 0 && `${fps} FPS`}
          </span>
        </CardTitle>
        <CardDescription>
          Configure detection parameters
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">
              Confidence Threshold: {Math.round(confidenceThreshold * 100)}%
            </label>
          </div>
          <Slider
            value={[confidenceThreshold * 100]}
            min={10}
            max={95}
            step={5}
            onValueChange={(value) => onConfidenceChange(value[0] / 100)}
            className="w-full"
          />
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">
              New Object Threshold: {(timeThresholdForNew / 1000).toFixed(1)}s
            </label>
          </div>
          <Slider
            value={[timeThresholdForNew / 1000]}
            min={0.5}
            max={5}
            step={0.5}
            onValueChange={(value) => onNewTimeThresholdChange(value[0] * 1000)}
            className="w-full"
          />
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">
              Missing Object Threshold: {(timeThresholdForMissing / 1000).toFixed(1)}s
            </label>
          </div>
          <Slider
            value={[timeThresholdForMissing / 1000]}
            min={0.5}
            max={5}
            step={0.5}
            onValueChange={(value) => onMissingTimeThresholdChange(value[0] * 1000)}
            className="w-full"
          />
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button 
          variant="secondary" 
          onClick={onReset}
          size="sm"
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          Reset
        </Button>
        
        <Button 
          variant={isDetectionRunning ? "destructive" : "default"}
          onClick={onToggleDetection}
          className={isDetectionRunning ? "bg-sightguard-danger hover:bg-sightguard-danger/80" : "bg-sightguard-primary hover:bg-sightguard-primary/80"}
        >
          {isDetectionRunning ? (
            <>
              <Pause className="h-4 w-4 mr-2" />
              Stop Detection
            </>
          ) : (
            <>
              <Play className="h-4 w-4 mr-2" />
              Start Detection
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};
