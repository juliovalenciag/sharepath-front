export const REGIONS = [
  { value: "cdmx", label: "Ciudad de México", hint: "CDMX" },
  { value: "edomex", label: "Estado de México", hint: "Edo. Méx." },
  { value: "hgo", label: "Hidalgo", hint: "HGO" },
  { value: "mor", label: "Morelos", hint: "MOR" },
  { value: "qro", label: "Querétaro", hint: "QRO" },
] as const;

export const REGION_LABELS = Object.fromEntries(
  REGIONS.map((r) => [r.value, r.label])
) as Record<string, string>;

export type RegionValue = (typeof REGIONS)[number]["value"];
