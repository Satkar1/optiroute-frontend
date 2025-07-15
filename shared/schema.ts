import { z } from "zod";

// Location schema
export const locationSchema = z.object({
  id: z.string(),
  name: z.string(),
  coordinates: z.object({
    x: z.number(),
    y: z.number()
  }),
  type: z.enum(['warehouse', 'delivery', 'hub'])
});

// Delivery schema
export const deliverySchema = z.object({
  id: z.string(),
  name: z.string(),
  location: z.string(),
  timeWindow: z.object({
    start: z.number(),
    end: z.number()
  }),
  priority: z.enum(['Low', 'Normal', 'High']),
  load: z.number(),
  profit: z.number()
});

// Route configuration schema
export const routeConfigSchema = z.object({
  sourceLocation: z.string(),
  vehicleCapacity: z.number(),
  algorithm: z.enum(['dijkstra', 'astar', 'tsp', 'bellman'])
});

// Optimized route step schema
export const routeStepSchema = z.object({
  step: z.number(),
  location: z.string(),
  deliveryId: z.string().optional(),
  distance: z.number(),
  duration: z.number(),
  eta: z.string(),
  load: z.number(),
  status: z.enum(['pending', 'on_time', 'delayed'])
});

// Route optimization result schema
export const routeOptimizationResultSchema = z.object({
  optimizedRoute: z.array(routeStepSchema),
  metrics: z.object({
    totalDistance: z.number(),
    totalTime: z.number(),
    deliveries: z.number(),
    capacityUsed: z.number(),
    capacityPercent: z.number(),
    efficiency: z.number()
  }),
  algorithm: z.string(),
  executionTime: z.number(),
  nodesExplored: z.number(),
  improvement: z.number()
});

// Algorithm performance schema
export const algorithmPerformanceSchema = z.object({
  executionTime: z.number(),
  nodesExplored: z.number(),
  improvement: z.number()
});

// Insert schemas
export const insertDeliverySchema = deliverySchema.omit({ id: true });
export const insertRouteConfigSchema = routeConfigSchema;

// Types
export type Location = z.infer<typeof locationSchema>;
export type Delivery = z.infer<typeof deliverySchema>;
export type RouteConfig = z.infer<typeof routeConfigSchema>;
export type RouteStep = z.infer<typeof routeStepSchema>;
export type RouteOptimizationResult = z.infer<typeof routeOptimizationResultSchema>;
export type AlgorithmPerformance = z.infer<typeof algorithmPerformanceSchema>;
export type InsertDelivery = z.infer<typeof insertDeliverySchema>;
export type InsertRouteConfig = z.infer<typeof insertRouteConfigSchema>;
