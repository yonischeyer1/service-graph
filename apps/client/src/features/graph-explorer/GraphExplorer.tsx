import { useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { filtersQuery, graphQuery, routesQuery } from "../../shared/api/queries.ts";
import { FilterPanel } from "./FilterPanel.tsx";
import { GraphCanvas } from "./GraphCanvas.tsx";
import { NodeDetails } from "./NodeDetails.tsx";
import { RouteList } from "./RouteList.tsx";

export function GraphExplorer() {
  const { data: filters } = useSuspenseQuery(filtersQuery);
  const { data: graph } = useSuspenseQuery(graphQuery);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<number | null>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const { data: routes } = useSuspenseQuery(routesQuery(activeFilters));

  const node = graph.nodes.find((item) => item.name === selectedNode) ?? null;
  const visibleRoute = selectedRoute !== null && selectedRoute < routes.routes.length ? selectedRoute : null;

  function toggleFilter(id: string) {
    setSelectedRoute(null);
    setActiveFilters((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  }

  return (
    <div className="min-h-svh bg-ink text-paper lg:grid lg:h-svh lg:grid-rows-[auto_minmax(0,1fr)]">
      <header className="flex items-end justify-between gap-4 border-b border-line px-5 py-4">
        <div>
          <p className="font-mono text-[11px] tracking-[0.18em] text-lime uppercase">Service graph</p>
          <h1 className="font-display text-3xl leading-none text-paper">Train-ticket routes</h1>
        </div>
        <p className="max-w-sm text-right text-xs text-muted">
          Maximal paths from an entry with no callers to a leaf with no callees. Filters combine with AND.
        </p>
      </header>
      <div className="lg:grid lg:min-h-0 lg:grid-cols-[320px_minmax(0,1fr)_300px]">
        <aside className="flex max-h-[42svh] flex-col overflow-hidden border-b border-line bg-panel lg:max-h-none lg:border-r lg:border-b-0">
          <FilterPanel filters={filters.filters} selected={activeFilters} onToggle={toggleFilter} />
          <RouteList
            routes={routes.routes}
            truncated={routes.meta.truncated}
            selected={visibleRoute}
            onSelect={setSelectedRoute}
          />
        </aside>
        <GraphCanvas
          key={activeFilters.join(",")}
          graph={graph}
          routes={routes}
          selectedRoute={visibleRoute}
          selectedNode={selectedNode}
          onSelectNode={setSelectedNode}
        />
        <NodeDetails node={node} />
      </div>
    </div>
  );
}
