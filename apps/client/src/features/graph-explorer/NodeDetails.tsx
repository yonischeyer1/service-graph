import type { GraphNode } from "@service-graph/contracts";

interface NodeDetailsProps {
  node: GraphNode | null;
}

function metadataRows(metadata: Record<string, unknown> | undefined): Array<{ key: string; value: string }> {
  if (!metadata) return [];
  return Object.entries(metadata).map(([key, value]) => ({
    key,
    value: typeof value === "string" ? value : JSON.stringify(value),
  }));
}

export function NodeDetails({ node }: NodeDetailsProps) {
  return (
    <aside className="border-t border-line bg-panel px-4 py-4 lg:border-t-0 lg:border-l">
      <h2 className="font-mono text-[11px] tracking-[0.16em] text-muted uppercase">Node</h2>
      {node ? (
        <div className="mt-3 space-y-4">
          <div>
            <p className="font-display text-2xl leading-tight text-paper">{node.name}</p>
            <p className="mt-1 font-mono text-xs text-muted">
              {node.kind}
              {node.language ? ` · ${node.language}` : ""}
              {node.publicExposed ? " · public" : ""}
              {node.synthetic ? " · synthetic" : ""}
            </p>
            {node.path ? <p className="mt-2 font-mono text-[11px] break-all text-muted">{node.path}</p> : null}
          </div>
          {metadataRows(node.metadata).length > 0 ? (
            <dl className="space-y-1 text-sm">
              {metadataRows(node.metadata).map((row) => (
                <div key={row.key} className="flex justify-between gap-3">
                  <dt className="text-muted">{row.key}</dt>
                  <dd className="font-mono text-paper">{row.value}</dd>
                </div>
              ))}
            </dl>
          ) : null}
          <div>
            <h3 className="font-mono text-[11px] tracking-[0.16em] text-muted uppercase">Vulnerabilities</h3>
            {(node.vulnerabilities?.length ?? 0) === 0 ? (
              <p className="mt-2 text-sm text-muted">None recorded.</p>
            ) : (
              <ul className="mt-2 space-y-3">
                {node.vulnerabilities?.map((vulnerability) => (
                  <li key={`${vulnerability.file}:${vulnerability.message}`} className="rounded-md border border-line px-3 py-2">
                    <p className="font-mono text-[11px] text-coral uppercase">{vulnerability.severity}</p>
                    <p className="mt-1 text-sm text-paper">{vulnerability.message}</p>
                    <p className="mt-1 font-mono text-[11px] break-all text-muted">{vulnerability.file}</p>
                    {typeof vulnerability.metadata?.cwe === "string" ? (
                      <p className="mt-1 text-xs text-gold">{vulnerability.metadata.cwe}</p>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      ) : (
        <p className="mt-3 text-sm text-muted">Select a service to see its kind, exposure, and findings.</p>
      )}
    </aside>
  );
}
