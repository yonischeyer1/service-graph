interface RouteListProps {
  routes: readonly (readonly string[])[];
  truncated: boolean;
  selected: number | null;
  onSelect: (index: number | null) => void;
}

export function RouteList({ routes, truncated, selected, onSelect }: RouteListProps) {
  return (
    <section className="flex min-h-0 flex-1 flex-col px-4 py-4">
      <div className="flex items-baseline justify-between">
        <h2 className="font-mono text-[11px] tracking-[0.16em] text-muted uppercase">Routes</h2>
        <span className="font-mono text-xs text-lime">{routes.length}</span>
      </div>
      {truncated ? <p className="mt-2 text-xs text-coral">Results hit the route limit and were truncated.</p> : null}
      {routes.length === 0 ? (
        <p className="mt-3 text-sm text-muted">Nothing to list. The graph stays visible so you can inspect nodes.</p>
      ) : (
        <ol className="mt-3 min-h-0 flex-1 space-y-1 overflow-y-auto pr-1">
          {routes.map((route, index) => {
            const active = index === selected;
            return (
              <li key={route.join("→")}>
                <button
                  type="button"
                  aria-pressed={active}
                  onClick={() => onSelect(active ? null : index)}
                  className={`w-full rounded-md px-2 py-1.5 text-left font-mono text-[11px] leading-5 ${active ? "bg-lime text-ink" : "text-paper hover:bg-line/70"}`}
                >
                  {route.join(" → ")}
                </button>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
