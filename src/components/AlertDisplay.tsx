
import React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

interface AlertDisplayProps {
  newObjectDetected: boolean;
  missingObjectDetected: boolean;
  message: string;
}

export const AlertDisplay: React.FC<AlertDisplayProps> = ({
  newObjectDetected,
  missingObjectDetected,
  message
}) => {
  if (!newObjectDetected && !missingObjectDetected) return null;
  
  const alertClass = newObjectDetected 
    ? "border-sightguard-success bg-sightguard-success/20"
    : "border-sightguard-danger bg-sightguard-danger/20";
  
  const title = newObjectDetected 
    ? "New Object Detected" 
    : "Object Missing";
    
  return (
    <div className="absolute top-4 left-4 right-4 z-50 animate-fade-in">
      <Alert className={cn("border-2", alertClass, "alert-animation")}>
        <AlertTitle className="font-semibold">
          {title}
        </AlertTitle>
        <AlertDescription>
          {message}
        </AlertDescription>
      </Alert>
    </div>
  );
};
