
import React, { useState, useEffect } from "react";
import { VideoFeed } from "@/components/VideoFeed";
import { DetectionControls } from "@/components/DetectionControls";
import { PerformanceMetrics } from "@/components/PerformanceMetrics";
import { initializeDetection, defaultDetectionConfig } from "@/utils/detectionUtils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const Index = () => {
  const { toast } = useToast();
  const [objectDetector, setObjectDetector] = useState<any>(null);
  const [isDetectionRunning, setIsDetectionRunning] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [fps, setFps] = useState<number>(0);
  
  // Detection parameters
  const [confidenceThreshold, setConfidenceThreshold] = useState<number>(defaultDetectionConfig.confidenceThreshold);
  const [timeThresholdForNew, setTimeThresholdForNew] = useState<number>(defaultDetectionConfig.timeThresholdForNew);
  const [timeThresholdForMissing, setTimeThresholdForMissing] = useState<number>(defaultDetectionConfig.timeThresholdForMissing);
  
  // Object stats
  const [objectCount, setObjectCount] = useState<number>(0);
  const [newObjectCount, setNewObjectCount] = useState<number>(0);
  const [missingObjectCount, setMissingObjectCount] = useState<number>(0);

  // Initialize object detection
  useEffect(() => {
    const loadDetector = async () => {
      try {
        setIsLoading(true);
        const detector = await initializeDetection(defaultDetectionConfig.modelType);
        setObjectDetector(detector);
        setIsLoading(false);
        
        toast({
          title: "Detection Model Loaded",
          description: "The object detection model has been successfully loaded.",
          duration: 3000,
        });
      } catch (err) {
        console.error("Failed to initialize detector:", err);
        setError("Failed to initialize object detection. Please ensure browser compatibility and refresh the page.");
        setIsLoading(false);
      }
    };
    
    loadDetector();
  }, [toast]);

  const handleToggleDetection = () => {
    setIsDetectionRunning(!isDetectionRunning);
    
    toast({
      title: isDetectionRunning ? "Detection Stopped" : "Detection Started",
      description: isDetectionRunning 
        ? "Object detection has been stopped." 
        : "Object detection is now running. New and missing objects will be highlighted.",
      duration: 3000,
    });
  };

  const handleResetSettings = () => {
    setConfidenceThreshold(defaultDetectionConfig.confidenceThreshold);
    setTimeThresholdForNew(defaultDetectionConfig.timeThresholdForNew);
    setTimeThresholdForMissing(defaultDetectionConfig.timeThresholdForMissing);
    
    toast({
      title: "Settings Reset",
      description: "Detection settings have been reset to default values.",
      duration: 3000,
    });
  };

  const handleFpsUpdate = (newFps: number) => {
    setFps(newFps);
  };

  // For demo purposes, simulate random object counts
  useEffect(() => {
    if (isDetectionRunning) {
      const interval = setInterval(() => {
        const randomObjectCount = Math.floor(Math.random() * 5) + 1;
        const randomNewCount = Math.floor(Math.random() * 2);
        const randomMissingCount = Math.floor(Math.random() * 2);
        
        setObjectCount(randomObjectCount);
        setNewObjectCount(randomNewCount);
        setMissingObjectCount(randomMissingCount);
      }, 3000);
      
      return () => clearInterval(interval);
    }
  }, [isDetectionRunning]);

  return (
    <div className="min-h-screen bg-sightguard-dark text-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <header className="mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-sightguard-primary">SightGuard</h1>
              <p className="text-muted-foreground">Real-time object presence detection system</p>
            </div>
          </div>
        </header>

        {error && (
          <Card className="mb-6 bg-destructive/10 border-destructive">
            <CardHeader className="py-4">
              <CardTitle className="text-destructive flex items-center">
                <AlertCircle className="h-5 w-5 mr-2" />
                Error
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>{error}</p>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-sightguard-dark-blue rounded-lg p-4 border border-sightguard-secondary mb-6">
              <h2 className="text-xl font-semibold mb-4 text-sightguard-accent">Video Feed</h2>
              <div className="aspect-video bg-black rounded-md overflow-hidden relative">
                {isLoading ? (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="animate-spin h-12 w-12 border-4 border-sightguard-primary border-t-transparent rounded-full"></div>
                    <p className="ml-3 text-lg">Loading detection model...</p>
                  </div>
                ) : (
                  <VideoFeed 
                    objectDetector={objectDetector}
                    isDetectionRunning={isDetectionRunning}
                    confidenceThreshold={confidenceThreshold}
                    timeThresholdForNew={timeThresholdForNew}
                    timeThresholdForMissing={timeThresholdForMissing}
                    onFpsUpdate={handleFpsUpdate}
                  />
                )}
              </div>
            </div>
            
            <PerformanceMetrics 
              fps={fps}
              objectCount={objectCount}
              newObjects={newObjectCount}
              missingObjects={missingObjectCount}
            />
          </div>
          
          <div>
            <DetectionControls 
              isDetectionRunning={isDetectionRunning}
              confidenceThreshold={confidenceThreshold}
              timeThresholdForNew={timeThresholdForNew}
              timeThresholdForMissing={timeThresholdForMissing}
              onToggleDetection={handleToggleDetection}
              onReset={handleResetSettings}
              onConfidenceChange={setConfidenceThreshold}
              onNewTimeThresholdChange={setTimeThresholdForNew}
              onMissingTimeThresholdChange={setTimeThresholdForMissing}
              fps={fps}
            />
            
            <Card className="mt-6 bg-sightguard-dark-blue border-sightguard-secondary">
              <CardHeader>
                <CardTitle className="text-sightguard-accent">How It Works</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-sightguard-primary mb-1">Object Detection</h3>
                  <p className="text-sm text-muted-foreground">
                    SightGuard uses machine learning to detect objects in real-time through your camera.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-sightguard-success mb-1">New Object Detection</h3>
                  <p className="text-sm text-muted-foreground">
                    Objects that appear in the scene will be highlighted in green and labeled as "New".
                  </p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-sightguard-danger mb-1">Missing Object Detection</h3>
                  <p className="text-sm text-muted-foreground">
                    Objects that disappear from the scene will be highlighted in red and labeled as "Missing".
                  </p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-sightguard-warning mb-1">Adjust Settings</h3>
                  <p className="text-sm text-muted-foreground">
                    Use the controls to adjust confidence threshold and time thresholds for detection sensitivity.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
