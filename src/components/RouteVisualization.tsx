import { Badge } from "@/components/ui/badge";
import { Warehouse, MapPin, Circle } from "lucide-react";
import type { Location, Delivery, RouteStep } from "@shared/schema";

interface RouteVisualizationProps {
  locations: Location[];
  deliveries: Delivery[];
  optimizedRoute: RouteStep[];
}

export default function RouteVisualization({ locations, deliveries, optimizedRoute }: RouteVisualizationProps) {
  const createGrid = () => {
    const grid = [];
    const gridSize = 6;
    
    for (let i = 0; i < gridSize * gridSize; i++) {
      const row = Math.floor(i / gridSize);
      const col = i % gridSize;
      
      // Find location at this position
      const location = locations.find(loc => 
        loc.coordinates.x === col && loc.coordinates.y === row
      );
      
      // Find delivery at this location
      const delivery = deliveries.find(d => d.location === location?.id);
      
      // Check if this location is in the optimized route
      const routeStep = optimizedRoute.find(step => step.location === location?.id);
      
      let icon = null;
      let label = "";
      let bgColor = "bg-white";
      
      if (location) {
        label = location.id;
        
        if (location.type === "warehouse") {
          icon = <Warehouse className="text-primary text-xl mb-1" />;
          bgColor = "bg-primary/10";
        } else if (delivery) {
          icon = <MapPin className="text-secondary text-xl mb-1" />;
          bgColor = "bg-secondary/10";
        } else {
          icon = <Circle className="text-gray-400 text-xl mb-1" />;
        }
        
        // Highlight if in optimized route
        if (routeStep) {
          bgColor = "bg-success/20 ring-2 ring-success";
        }
      }
      
      grid.push(
        <div
          key={i}
          className={`${bgColor} border border-gray-300 rounded flex items-center justify-center hover:bg-blue-50 transition-colors cursor-pointer`}
        >
          {location && (
            <div className="text-center">
              {icon}
              <div className="text-xs font-medium">{label}</div>
            </div>
          )}
        </div>
      );
    }
    
    return grid;
  };

  const getOptimizedPath = () => {
    if (!optimizedRoute || optimizedRoute.length === 0) return [];
    
    const path = [];
    for (let i = 0; i < optimizedRoute.length; i++) {
      const step = optimizedRoute[i];
      path.push(
        <Badge key={i} className="bg-primary text-primary-foreground">
          {step.location}
        </Badge>
      );
      
      if (i < optimizedRoute.length - 1) {
        path.push(
          <div key={`arrow-${i}`} className="text-gray-400">→</div>
        );
      }
    }
    
    return path;
  };

  return (
    <div>
      <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
        <div className="grid grid-cols-6 gap-2 h-64">
          {createGrid()}
        </div>
        
        {/* Legend */}
        <div className="mt-4 flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-primary rounded-full"></div>
            <span className="text-sm text-gray-600">Start/Warehouse</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-secondary rounded-full"></div>
            <span className="text-sm text-gray-600">Delivery Point</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-1 bg-success rounded-full"></div>
            <span className="text-sm text-gray-600">Optimized Path</span>
          </div>
        </div>
      </div>
      
      {/* Optimized Route Path */}
      {optimizedRoute.length > 0 && (
        <div className="mt-4 bg-gray-50 rounded-lg p-4">
          <h3 className="font-medium text-gray-900 mb-2">Optimized Route Path</h3>
          <div className="flex items-center space-x-2 text-sm flex-wrap gap-2">
            {getOptimizedPath()}
          </div>
        </div>
      )}
    </div>
  );
}
