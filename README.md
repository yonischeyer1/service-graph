# Train-ticket graph query engine

A query API and a React client for the [train-ticket](https://github.com/FudanSELab/train-ticket) service graph. The server loads the attached JSON, normalizes it, and returns routes that a client can draw.

## Decisions

A **route** is a maximal path. It starts at an entry point (a node with no incoming edges) and ends at a leaf (a node with no outgoing edges). An isolated node is a one-node route. The search keeps only simple paths, so a cycle cannot be walked twice.

Filters combine with **AND**. Each filter runs at one stage:

| Stage | Question it answers | Built-in filter |
| --- | --- | --- |
| `start` | May this entry point begin a route? | `public-start` — `publicExposed` is true |
| `end` | May this leaf end a route? | `sink-end` — `kind` is `rds` or `sql` |
| `path` | Does the finished path qualify? | `vulnerable` — some node has a vulnerability |

NestJS dependency injection wires the classes: controller, service, graph repository, and filter registry. It does **not** search the train-ticket graph. That search is a pure function, `findRoutes`. What Nest does provide is extension: `@RouteFilter()` is created with `DiscoveryService.createDecorator()`. On startup the registry collects every decorated provider. Adding a filter does not change the path finder or the client.

Before the depth-first search, a reverse breadth-first search keeps only nodes that can reach an allowed leaf. Branches that cannot are skipped. The search stops at `maxRoutes` (default 10,000). If it stops early, `meta.truncated` is true.

`GET /api/routes` returns the matching routes plus the subgraph those routes use (`nodes` and `edges`), which React Flow draws directly.

## Assumptions about the sample file

- An edge `to` value may be a string or an array. `consign-service` uses a string. The loader always stores an array.
- `assurance-service` is named by edges and missing from `nodes`. The loader inserts `{ kind: "unknown", synthetic: true }` and logs a warning.
- `prod-sqs` is a queue, not a sink. Only `rds` and `sql` count.
- Nodes with no edges, such as `gateway-service`, are one-node routes.
- The file is checked with zod when the process starts. Invalid data aborts boot.
- All three built-in filters together match nothing. The only public service with outgoing edges is `frontend`, and it never reaches `prod-postgresdb`.

## API

- `GET /api/graph` — normalized graph.
- `GET /api/filters` — `{ id, description, stage }[]`, discovered from the registry.
- `GET /api/routes?filters=public-start,sink-end&maxRoutes=100` — `{ nodes, edges, routes, meta }`.

Unknown filter ids and a non-positive `maxRoutes` respond with 400. Omit `filters` to get every maximal route.

## Layout

```
apps/server/src/features/
  graph/          load, index, GET /api/graph
  route-filters/  @RouteFilter(), registry, built-in filters, GET /api/filters
  routes/         path finder, GET /api/routes
apps/client/      Vite+ React 19 explorer (React Flow + dagre)
packages/contracts/  zod schemas shared by the server and the client
```

The client reads `GET /api/filters`, so a new server filter shows up as a checkbox without a client change. The full graph is drawn dimmed. Nodes and edges on the matching routes are highlighted. Choosing a route highlights that path. Choosing a node shows its kind, exposure, and vulnerabilities.

## Run

```bash
pnpm install
pnpm --filter @service-graph/contracts build
pnpm dev
```

The API listens on [http://localhost:3000](http://localhost:3000). The client listens on [http://localhost:5173](http://localhost:5173) and proxies `/api` to the server.

```bash
pnpm test          # server unit tests and HTTP tests against the sample file
pnpm build         # contracts, server, and client
```

`GRAPH_DATA_PATH` overrides the graph file (default `data/train-ticket.json`, resolved from `apps/server`). `PORT` overrides the API port (default `3000`).

## Add a filter

1. Add a class under `apps/server/src/features/route-filters/filters/`.
2. Decorate it with `@Injectable()` and `@RouteFilter()`.
3. Implement `id`, `description`, `stage` (`start`, `end`, or `path`), and `matches`.
4. List the class in the `providers` array of `RouteFiltersModule`.

Restart the API. The registry publishes it from `GET /api/filters`, and the client renders a checkbox for it. The path finder stays unchanged.
