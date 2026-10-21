import type { FilterDescriptor } from "@service-graph/contracts";

interface FilterPanelProps {
  filters: readonly FilterDescriptor[];
  selected: readonly string[];
  onToggle: (id: string) => void;
}

export function FilterPanel({ filters, selected, onToggle }: FilterPanelProps) {
  return (
    <section className="border-b border-line px-4 py-4">
      <h2 className="font-mono text-[11px] tracking-[0.16em] text-muted uppercase">Filters</h2>
      <ul className="mt-3 space-y-2">
        {filters.map((filter) => {
          const checked = selected.includes(filter.id);
          return (
            <li key={filter.id}>
              <label className="flex cursor-pointer gap-3 rounded-md border border-transparent px-1 py-1 hover:border-line">
                <input
                  type="checkbox"
                  className="mt-1 accent-lime"
                  checked={checked}
                  onChange={() => onToggle(filter.id)}
                />
                <span>
                  <span className="block text-sm text-paper">{filter.id}</span>
                  <span className="mt-0.5 block text-xs text-muted">
                    <span className="font-mono text-teal">{filter.stage}</span> · {filter.description}
                  </span>
                </span>
              </label>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
