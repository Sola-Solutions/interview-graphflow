import { z } from "zod";

// Base schemas that can be reused
const PositionSchema = z.object({
  x: z.number(),
  y: z.number(),
});

const NodeSchema = z.object({
  id: z.string(),
  position: PositionSchema,
});

const EdgeSchema = z.object({
  id: z.string().optional(),
  source: z.string(),
  target: z.string(),
});

// API Schemas - Add new request/response pairs here
export const schemas = {
  GraphPayload: z.object({
    nodes: z.array(NodeSchema),
    edges: z.array(EdgeSchema),
  }),

  ProcessNodeConnectionsRequest: z.object({
    nodes: z.array(
      z.object({
        id: z.string(),
        position: PositionSchema,
        data: z.record(z.any()).optional(),
      })
    ),
    edges: z.array(EdgeSchema),
    selectedNodeId: z.string().optional(),
  }),

  ProcessNodeConnectionsResponse: z.object({
    nodes: z.array(
      z.object({
        id: z.string(),
        hasConnections: z.boolean(),
        connectedEdges: z.array(z.string()),
        isHighlighted: z.boolean(),
      })
    ),
    processedAt: z.string(),
  }),

  // (neil): Interviewees should add new schemas here - they will be automatically generated
} as const;

// Export types for all schemas
export type Schemas = {
  [K in keyof typeof schemas]: z.infer<(typeof schemas)[K]>;
};
