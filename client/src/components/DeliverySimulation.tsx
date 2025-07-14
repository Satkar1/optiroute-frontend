import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Play, Pause, RotateCcw, Truck } from "lucide-react";
import type { RouteStep } from "@shared/schema";

interface DeliverySimulationProps {
  optimizedRoute: RouteStep[];
}

export default function DeliverySimulation({ optimizedRoute }: DeliverySimulationProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [animationSpeed, setAnimationSpeed] = useState(1000); // ms

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isPlaying && currentStep < optimizedRoute.length) {
      interval = setInterval(() => {
        setCurrentStep(prev => {
          if (prev >= optimizedRoute.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, animationSpeed);
    }

    return () => clearInterval(interval);
  }, [isPlaying, currentStep, optimizedRoute.length, animationSpeed]);

  const handlePlay = () => {
    if (currentStep >= optimizedRoute.length) {
      setCurrentStep(0);
    }
    setIsPlaying(true);
  };

  const handlePause = () => {
    setIsPlaying(false);
  };

  const handleReset = () => {
    setCurrentStep(0);
    setIsPlaying(false);
  };

  if (!optimizedRoute || optimizedRoute.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Truck className="h-5 w-5 mr-2 text-primary" />
            Delivery Simulation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">No route available for simulation.</p>
        </CardContent>
      </Card>
    );
  }

  const currentLocation = optimizedRoute[currentStep];
  const progress = ((currentStep + 1) / optimizedRoute.length) * 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center">
            <Truck className="h-5 w-5 mr-2 text-primary" />
            Delivery Simulation
          </span>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              disabled={currentStep === 0}
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={isPlaying ? handlePause : handlePlay}
              disabled={optimizedRoute.length === 0}
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Current Location */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  Step {currentStep + 1} of {optimizedRoute.length}
                </p>
                <p className="text-lg font-semibold text-blue-800 dark:text-blue-200">
                  Location: {currentLocation?.location || "N/A"}
                </p>
                <p className="text-sm text-blue-600 dark:text-blue-300">
                  ETA: {currentLocation?.eta || "N/A"} | 
                  Load: {currentLocation?.load || 0}kg | 
                  Status: {currentLocation?.status || "pending"}
                </p>
              </div>
              <div className="animate-pulse">
                <Truck className="h-8 w-8 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Speed Control */}
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Animation Speed
            </label>
            <select
              value={animationSpeed}
              onChange={(e) => setAnimationSpeed(Number(e.target.value))}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-primary"
            >
              <option value={500}>2x Speed</option>
              <option value={1000}>Normal</option>
              <option value={2000}>0.5x Speed</option>
            </select>
          </div>

          {/* Route Steps Preview */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Route Steps</h4>
            <div className="max-h-40 overflow-y-auto space-y-1">
              {optimizedRoute.map((step, index) => (
                <div
                  key={index}
                  className={`flex items-center space-x-2 p-2 rounded text-sm transition-colors ${
                    index === currentStep
                      ? "bg-primary text-white"
                      : index < currentStep
                      ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200"
                      : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                  }`}
                >
                  <span className="font-medium">{index + 1}.</span>
                  <span>{step.location}</span>
                  <span>({step.eta})</span>
                  {index < currentStep && <span className="text-xs">✓</span>}
                  {index === currentStep && <span className="text-xs animate-pulse">→</span>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}