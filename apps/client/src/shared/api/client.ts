import {
  filtersResponseSchema,
  graphSchema,
  routesResponseSchema,
  type FiltersResponse,
  type Graph,
  type RoutesResponse,
} from "@service-graph/contracts";

async function readJson(path: string): Promise<unknown> {
  const response = await fetch(path);
  if (!response.ok) {
    const body: unknown = await response.json().catch(() => null);
    const message =
      body && typeof body === "object" && "message" in body
        ? String(body.message)
        : response.statusText;
    throw new Error(message || `Request failed (${response.status})`);
  }
  return response.json() as Promise<unknown>;
}

export function getFilters(): Promise<FiltersResponse> {
  return readJson("/api/filters").then((data) => filtersResponseSchema.parse(data));
}

export function getGraph(): Promise<Graph> {
  return readJson("/api/graph").then((data) => graphSchema.parse(data));
}

export function getRoutes(filters: readonly string[]): Promise<RoutesResponse> {
  const params = new URLSearchParams();
  if (filters.length > 0) params.set("filters", filters.join(","));
  const query = params.size > 0 ? `?${params.toString()}` : "";
  return readJson(`/api/routes${query}`).then((data) => routesResponseSchema.parse(data));
}
