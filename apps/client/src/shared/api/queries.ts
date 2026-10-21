import { queryOptions } from "@tanstack/react-query";
import { getFilters, getGraph, getRoutes } from "./client.ts";

export const filtersQuery = queryOptions({
  queryKey: ["filters"],
  queryFn: getFilters,
});

export const graphQuery = queryOptions({
  queryKey: ["graph"],
  queryFn: getGraph,
});

export function routesQuery(filters: readonly string[]) {
  return queryOptions({
    queryKey: ["routes", [...filters]],
    queryFn: () => getRoutes(filters),
  });
}
