import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Route, MapPin, Clock, Package, TrendingUp, Zap, Activity, Target, Save } from "lucide-react";
import RouteVisualization from "@/components/RouteVisualization";
import DeliveryTimeline from "@/components/DeliveryTimeline";
import DeliveryForm from "@/components/DeliveryForm";
import MetricsCard from "@/components/MetricsCard";
import DeliverySimulation from "@/components/DeliverySimulation";
import { ThemeToggle } from "@/components/ThemeToggle";
import type { Delivery, Location, RouteConfig, RouteOptimizationResult } from "@shared/schema";

export default function Home() {
  const { toast } = useToast();
  const [routeConfig, setRouteConfig] = useState<RouteConfig>({
    sourceLocation: "",
    vehicleCapacity: 100,
    algorithm: "dijkstra"
  });
  const [optimizationResult, setOptimizationResult] = useState<RouteOptimizationResult | null>(null);

  // Fetch locations
  const { data: locations, isLoading: locationsLoading } = useQuery<Location[]>({
    queryKey: ["/api/locations"],
  });

  // Fetch deliveries
  const { data: deliveries, isLoading: deliveriesLoading } = useQuery<Delivery[]>({
    queryKey: ["/api/deliveries"],
  });

  // Optimize route mutation
  const optimizeRouteMutation = useMutation({
    mutationFn: async (config: RouteConfig) => {
      const response = await apiRequest("POST", "/api/optimize-route", config);
      const result = await response.json();
      
      // Check if the response contains an error
      if (result.error) {
        throw new Error(result.error);
      }
      
      return result;
    },
    onSuccess: (result) => {
      setOptimizationResult(result);
      toast({
        title: "Route Optimized",
        description: `Route optimized successfully using ${result.algorithm} algorithm. Distance: ${result.metrics.totalDistance.toFixed(1)}km, Time: ${result.metrics.totalTime}min`,
      });
    },
    onError: (error) => {
      console.error('Optimization error:', error);
      toast({
        title: "Optimization Failed",
        description: error instanceof Error ? error.message : "Failed to optimize route. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Save plan mutation
  const savePlanMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/save-plan", {});
      const result = await response.json();
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      return result;
    },
    onSuccess: (result) => {
      toast({
        title: "Plan Saved",
        description: `Successfully saved ${result.savedCount} of ${result.totalCount} deliveries to database.`,
      });
    },
    onError: (error) => {
      toast({
        title: "Save Failed",
        description: error instanceof Error ? error.message : "Failed to save plan. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleOptimizeRoute = () => {
    if (!routeConfig.sourceLocation) {
      toast({
        title: "Missing Source Location",
        description: "Please select a source location.",
        variant: "destructive",
      });
      return;
    }

    if (!deliveries || deliveries.length === 0) {
      toast({
        title: "No Deliveries",
        description: "Please add at least one delivery.",
        variant: "destructive",
      });
      return;
    }

    optimizeRouteMutation.mutate(routeConfig);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":
        return "bg-destructive text-destructive-foreground";
      case "Normal":
        return "bg-success text-success-foreground";
      case "Low":
        return "bg-primary text-primary-foreground";
      default:
        return "bg-secondary text-secondary-foreground";
    }
  };

  if (locationsLoading || deliveriesLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading OptiRoute...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-primary text-white w-10 h-10 rounded-lg flex items-center justify-center">
                <Route className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">OptiRoute</h1>
                <p className="text-sm text-gray-500">Smart Route Optimization</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Last optimized: <span className="font-medium">
                  {optimizationResult ? "Just now" : "Never"}
                </span>
              </span>
              <div className="flex items-center space-x-2">
                <ThemeToggle />
                <Button 
                  onClick={() => savePlanMutation.mutate()}
                  disabled={savePlanMutation.isPending || !deliveries || deliveries.length === 0}
                  className="bg-primary hover:bg-primary/90"
                >
                  {savePlanMutation.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Plan
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Control Panel Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Route Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2 text-primary" />
                  Route Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="source-location" className="text-sm font-medium text-gray-700">
                    Source Location
                  </Label>
                  <Select
                    value={routeConfig.sourceLocation}
                    onValueChange={(value) => setRouteConfig(prev => ({ ...prev, sourceLocation: value }))}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select starting point..." />
                    </SelectTrigger>
                    <SelectContent>
                      {locations?.map((location) => (
                        <SelectItem key={location.id} value={location.id}>
                          {location.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="vehicle-capacity" className="text-sm font-medium text-gray-700">
                    Vehicle Capacity
                  </Label>
                  <div className="flex items-center space-x-2 mt-2">
                    <Input
                      id="vehicle-capacity"
                      type="number"
                      value={routeConfig.vehicleCapacity}
                      onChange={(e) => setRouteConfig(prev => ({ ...prev, vehicleCapacity: Number(e.target.value) }))}
                      placeholder="100"
                      className="flex-1"
                    />
                    <span className="text-sm text-gray-500">kg</span>
                  </div>
                </div>

                <div>
                  <Label htmlFor="algorithm" className="text-sm font-medium text-gray-700">
                    Algorithm
                  </Label>
                  <Select
                    value={routeConfig.algorithm}
                    onValueChange={(value: any) => setRouteConfig(prev => ({ ...prev, algorithm: value }))}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dijkstra">Dijkstra (Shortest Path)</SelectItem>
                      <SelectItem value="astar">A* (Heuristic)</SelectItem>
                      <SelectItem value="tsp">TSP Solver (Multi-stop)</SelectItem>
                      <SelectItem value="bellman">Bellman-Ford</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  onClick={handleOptimizeRoute}
                  className="w-full bg-primary hover:bg-primary/90"
                  disabled={optimizeRouteMutation.isPending}
                >
                  {optimizeRouteMutation.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Optimizing...
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4 mr-2" />
                      Optimize Route
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Delivery Points */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center">
                    <MapPin className="h-5 w-5 mr-2 text-secondary" />
                    Delivery Points
                  </span>
                  <DeliveryForm />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {deliveries?.map((delivery) => (
                    <div key={delivery.id} className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-900">{delivery.name}</span>
                        <div className="flex items-center space-x-2">
                          <Badge className={getPriorityColor(delivery.priority)}>
                            {delivery.priority}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p className="flex items-center">
                          <MapPin className="h-3 w-3 mr-1" />
                          Location: {delivery.location}
                        </p>
                        <p className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          Time: {delivery.timeWindow?.start || 0}:00 - {delivery.timeWindow?.end || 0}:00
                        </p>
                        <p className="flex items-center">
                          <Package className="h-3 w-3 mr-1" />
                          Load: {delivery.load}kg
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Route Metrics */}
            <MetricsCard metrics={optimizationResult?.metrics} />
          </div>

          {/* Main Visualization Area */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Route Visualization */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center">
                    <Route className="h-5 w-5 mr-2 text-primary" />
                    Route Visualization
                  </span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">
                      Algorithm: <span className="font-medium">
                        {optimizationResult?.algorithm || "None"}
                      </span>
                    </span>
                    {optimizationResult && (
                      <div className="flex items-center space-x-1">
                        <div className="w-3 h-3 bg-success rounded-full"></div>
                        <span className="text-sm text-success">Optimized</span>
                      </div>
                    )}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RouteVisualization
                  locations={locations || []}
                  deliveries={deliveries || []}
                  optimizedRoute={optimizationResult?.optimizedRoute || []}
                />
              </CardContent>
            </Card>

            {/* Delivery Timeline */}
            <DeliveryTimeline optimizedRoute={optimizationResult?.optimizedRoute || []} />

            {/* Delivery Simulation */}
            <DeliverySimulation optimizedRoute={optimizationResult?.optimizedRoute || []} />

            {/* Algorithm Performance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="h-5 w-5 mr-2 text-destructive" />
                  Algorithm Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-blue-900">Execution Time</p>
                        <p className="text-2xl font-bold text-blue-600">
                          {optimizationResult?.executionTime ? 
                            `${optimizationResult.executionTime.toFixed(3)}s` : 
                            "0.000s"
                          }
                        </p>
                      </div>
                      <div className="p-3 bg-blue-100 rounded-full">
                        <Clock className="h-6 w-6 text-blue-600" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-green-900">Nodes Explored</p>
                        <p className="text-2xl font-bold text-green-600">
                          {optimizationResult?.nodesExplored || 0}
                        </p>
                      </div>
                      <div className="p-3 bg-green-100 rounded-full">
                        <Target className="h-6 w-6 text-green-600" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-purple-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-purple-900">Improvement</p>
                        <p className="text-2xl font-bold text-purple-600">
                          {optimizationResult?.improvement ? 
                            `${optimizationResult.improvement.toFixed(1)}%` : 
                            "0.0%"
                          }
                        </p>
                      </div>
                      <div className="p-3 bg-purple-100 rounded-full">
                        <TrendingUp className="h-6 w-6 text-purple-600" />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
