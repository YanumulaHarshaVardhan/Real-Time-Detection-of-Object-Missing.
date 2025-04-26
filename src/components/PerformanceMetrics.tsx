
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Gauge, EyeOff, Eye, Clock } from "lucide-react";

interface PerformanceMetricsProps {
  fps: number;
  objectCount: number;
  newObjects: number;
  missingObjects: number;
}

export const PerformanceMetrics: React.FC<PerformanceMetricsProps> = ({
  fps,
  objectCount,
  newObjects,
  missingObjects
}) => {
  const getFpsColor = () => {
    if (fps >= 20) return "text-sightguard-success";
    if (fps >= 10) return "text-sightguard-warning";
    return "text-sightguard-danger";
  };
  
  return (
    <Card className="w-full bg-sightguard-dark-blue border-sightguard-secondary">
      <CardHeader className="pb-2">
        <CardTitle className="text-sightguard-accent text-lg">Performance Metrics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center space-x-2">
            <Gauge className="h-5 w-5 text-sightguard-primary" />
            <div>
              <p className="text-xs text-muted-foreground">FPS</p>
              <p className={`text-lg font-bold ${getFpsColor()}`}>
                {fps}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Eye className="h-5 w-5 text-sightguard-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Objects</p>
              <p className="text-lg font-bold">
                {objectCount}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Eye className="h-5 w-5 text-sightguard-success" />
            <div>
              <p className="text-xs text-muted-foreground">New</p>
              <p className="text-lg font-bold text-sightguard-success">
                {newObjects}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <EyeOff className="h-5 w-5 text-sightguard-danger" />
            <div>
              <p className="text-xs text-muted-foreground">Missing</p>
              <p className="text-lg font-bold text-sightguard-danger">
                {missingObjects}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
