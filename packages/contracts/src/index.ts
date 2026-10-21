import { z } from 'zod';

export const vulnerabilitySchema = z.object({
  file: z.string(),
  severity: z.string(),
  message: z.string(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export type Vulnerability = z.infer<typeof vulnerabilitySchema>;

export const graphNodeSchema = z.object({
  name: z.string().min(1),
  kind: z.string().min(1),
  language: z.string().optional(),
  path: z.string().optional(),
  publicExposed: z.boolean().optional(),
  vulnerabilities: z.array(vulnerabilitySchema).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
  synthetic: z.boolean().optional(),
});

export type GraphNode = z.infer<typeof graphNodeSchema>;

export const graphEdgeSchema = z.object({
  from: z.string().min(1),
  to: z.array(z.string().min(1)).min(1),
});

export type GraphEdge = z.infer<typeof graphEdgeSchema>;

export const graphSchema = z.object({
  nodes: z.array(graphNodeSchema),
  edges: z.array(graphEdgeSchema),
});

export type Graph = z.infer<typeof graphSchema>;

export const rawGraphSchema = z.object({
  nodes: z.array(graphNodeSchema),
  edges: z.array(
    z.object({
      from: z.string().min(1),
      to: z.union([z.string().min(1), z.array(z.string().min(1)).min(1)]),
    }),
  ),
});

export const filterStageSchema = z.enum(['start', 'end', 'path']);

export type FilterStage = z.infer<typeof filterStageSchema>;

export const filterDescriptorSchema = z.object({
  id: z.string().min(1),
  description: z.string().min(1),
  stage: filterStageSchema,
});

export type FilterDescriptor = z.infer<typeof filterDescriptorSchema>;

export const filtersResponseSchema = z.object({
  filters: z.array(filterDescriptorSchema),
});

export type FiltersResponse = z.infer<typeof filtersResponseSchema>;

export const routesResponseSchema = z.object({
  nodes: z.array(graphNodeSchema),
  edges: z.array(graphEdgeSchema),
  routes: z.array(z.array(z.string().min(1))),
  meta: z.object({
    routeCount: z.number().int().nonnegative(),
    truncated: z.boolean(),
    appliedFilters: z.array(z.string()),
  }),
});

export type RoutesResponse = z.infer<typeof routesResponseSchema>;

export const DEFAULT_MAX_ROUTES = 10_000;
