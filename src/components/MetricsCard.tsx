import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TrendingUp } from "lucide-react";

interface MetricsCardProps {
  metrics?: {
    totalDistance: number;
    totalTime: number;
    deliveries: number;
    capacityUsed: number;
    capacityPercent: number;
    efficiency: number;
  };
}

export default function MetricsCard({ metrics }: MetricsCardProps) {
  if (!metrics) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-warning" />
            Route Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Total Distance</span>
              <span className="font-semibold text-gray-900">-- km</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Total Time</span>
              <span className="font-semibold text-gray-900">-- min</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Deliveries</span>
              <span className="font-semibold text-gray-900">-- / --</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Capacity Used</span>
              <div className="flex items-center space-x-2">
                <Progress value={0} className="w-20" />
                <span className="text-sm font-medium text-gray-900">0%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Efficiency</span>
              <span className="font-semibold text-gray-900">--%</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <TrendingUp className="h-5 w-5 mr-2 text-warning" />
          Route Metrics
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Total Distance</span>
            <span className="font-semibold text-gray-900">
              {metrics.totalDistance.toFixed(1)} km
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Total Time</span>
            <span className="font-semibold text-gray-900">
              {Math.floor(metrics.totalTime / 60)}h {metrics.totalTime % 60}min
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Deliveries</span>
            <span className="font-semibold text-gray-900">
              {metrics.deliveries} / {metrics.deliveries}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Capacity Used</span>
            <div className="flex items-center space-x-2">
              <Progress value={metrics.capacityPercent} className="w-20" />
              <span className="text-sm font-medium text-gray-900">
                {Math.round(metrics.capacityPercent)}%
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Efficiency</span>
            <span className="font-semibold text-success">
              {Math.round(metrics.efficiency)}%
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
