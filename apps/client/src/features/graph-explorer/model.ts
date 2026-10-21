export type Emphasis = "hot" | "match" | "dim";

export interface ServiceNodeData extends Record<string, unknown> {
  label: string;
  kind: string;
  publicExposed: boolean;
  vulnCount: number;
  synthetic: boolean;
  emphasis: Emphasis;
  selected: boolean;
}
