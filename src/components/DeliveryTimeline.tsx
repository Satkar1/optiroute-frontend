import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Route, Package, Home, CheckCircle } from "lucide-react";
import type { RouteStep } from "@shared/schema";

interface DeliveryTimelineProps {
  optimizedRoute: RouteStep[];
}

export default function DeliveryTimeline({ optimizedRoute }: DeliveryTimelineProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "on_time":
        return "bg-success text-success-foreground";
      case "delayed":
        return "bg-destructive text-destructive-foreground";
      case "pending":
        return "bg-warning text-warning-foreground";
      default:
        return "bg-secondary text-secondary-foreground";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "on_time":
        return "On Time";
      case "delayed":
        return "Delayed";
      case "pending":
        return "Pending";
      default:
        return "Unknown";
    }
  };

  const getStepIcon = (step: number, isLast: boolean) => {
    if (isLast) {
      return (
        <div className="flex-shrink-0 w-8 h-8 bg-neutral text-neutral-foreground rounded-full flex items-center justify-center text-sm font-medium">
          <Home className="h-4 w-4" />
        </div>
      );
    }
    
    return (
      <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
        {step}
      </div>
    );
  };

  if (!optimizedRoute || optimizedRoute.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="h-5 w-5 mr-2 text-warning" />
            Delivery Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No optimized route available.</p>
            <p className="text-sm text-gray-500 mt-2">
              Configure your route and click "Optimize Route" to see the delivery timeline.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Clock className="h-5 w-5 mr-2 text-warning" />
          Delivery Timeline
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {optimizedRoute.map((step, index) => {
            const isReturn = step.location === optimizedRoute[0]?.location && index > 0;
            
            return (
              <div key={index} className="flex items-center space-x-4">
                {getStepIcon(step.step, isReturn)}
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-gray-900">
                      {isReturn ? 
                        `Return to Warehouse (Location ${step.location})` :
                        `Delivery ${step.step} (Location ${step.location})`
                      }
                    </p>
                    <span className="text-sm text-gray-500">{step.eta}</span>
                  </div>
                  <div className="mt-1 flex items-center space-x-4 text-sm text-gray-600">
                    <span className="flex items-center">
                      <Route className="h-3 w-3 mr-1" />
                      Distance: {step.distance.toFixed(1)} km
                    </span>
                    <span className="flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      Duration: {step.duration} min
                    </span>
                    {!isReturn && (
                      <span className="flex items-center">
                        <Package className="h-3 w-3 mr-1" />
                        Load: {step.load} kg
                      </span>
                    )}
                    {isReturn && (
                      <span className="flex items-center">
                        <CheckCircle className="h-3 w-3 mr-1 text-success" />
                        Route Complete
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex-shrink-0">
                  <Badge className={getStatusColor(step.status)}>
                    {getStatusText(step.status)}
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
