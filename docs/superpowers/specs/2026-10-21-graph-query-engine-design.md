# Graph Query Engine Design

## Problem

Load the train-ticket service graph and expose a REST API that returns routes through that graph, plus a subgraph a client can draw. Routes can be narrowed by filters, and adding a filter must not require changes to the search algorithm or the client.

## Decisions

- A route is a maximal path. It starts at an entry point (no incoming edges) and ends at a leaf (no outgoing edges). Start and end filters narrow those defaults. An isolated node is a one-node route.
- Active filters combine with AND.
- The server is NestJS, organized by feature. Nest dependency injection wires classes (controller, service, repository, filter registry). It does not search the service graph. A custom `@RouteFilter()` decorator, created with `DiscoveryService.createDecorator()`, lets each filter register itself. The registry discovers every decorated provider at startup.
- The client is a Vite+ React 19 app. It draws the graph with React Flow and lays it out with dagre.
- The monorepo is pnpm: `apps/server`, `apps/client`, `packages/contracts`.

## Algorithm

1. Split the requested filters into start, end, and path stages.
2. Start set: entry points that match every start filter. With no start filter, every entry point.
3. End set: leaves that match every end filter. With no end filter, every leaf.
4. Reverse breadth-first search from the end set. Keep only nodes that can reach an allowed end node.
5. Depth-first search from each start node. Skip nodes outside the reachable set and nodes already on the current path (cycle guard).
6. When the search reaches an end node, keep the path only if every path filter matches.
7. Stop at `maxRoutes` (default 10,000) and set `meta.truncated`.

The path finder is a pure function with no NestJS imports.

Built-in filters:

- `public-start` (start): `publicExposed === true`.
- `sink-end` (end): `kind` is `rds` or `sql`.
- `vulnerable` (path): some node on the path has at least one vulnerability.

## API

- `GET /api/graph` returns the normalized graph.
- `GET /api/filters` returns `{ id, description, stage }[]` from the registry.
- `GET /api/routes?filters=public-start,sink-end&maxRoutes=100` returns `{ nodes, edges, routes, meta }`. `nodes` and `edges` are the subgraph used by the returned routes. Unknown filter ids and invalid `maxRoutes` respond with 400.

## Data assumptions

- An edge `to` field may be a string or an array. The loader normalizes it to an array.
- A name referenced by an edge but missing from `nodes` is inserted as `{ kind: "unknown", synthetic: true }`, and the loader logs a warning. `assurance-service` is the only such name in the sample file.
- `prod-sqs` is not a sink. Only `rds` and `sql` are.
- The sample file is validated with zod at startup. Invalid data aborts boot.
- All three built-in filters together match nothing in the sample: the only public entry with outgoing edges (`frontend`) never reaches `prod-postgresdb`.

## Client

Filter checkboxes come from `GET /api/filters`. The full graph is drawn dimmed. Nodes and edges on the matching routes are highlighted. Choosing a route highlights that path. Choosing a node shows its kind, public exposure, and vulnerabilities.

## Tests

- Path finder: linear graph, branching, cycles, unreachable ends, AND-combined filters, `maxRoutes` truncation, isolated nodes.
- Loader: string `to` values, missing nodes, duplicate names, invalid documents.
- HTTP tests against the sample file, including the route `cancel-service -> user-service -> auth-service -> prod-postgresdb` for the sink filter, and an empty result for all three filters.
