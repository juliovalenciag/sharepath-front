export type RegionKey =
  | "Ciudad de Mexico"
  | "Estado de Mexico"
  | "Hidalgo"
  | "Morelos"
  | "Querétaro";

export const REGIONS_DATA: Record<
  RegionKey,
  { label: string; short: string; lat: number; lng: number }
> = {
  "Ciudad de Mexico": {
    label: "Ciudad de México",
    short: "CDMX",
    lat: 19.4326,
    lng: -99.1332,
  },
  "Estado de Mexico": {
    label: "Estado de México",
    short: "Edo. Méx.",
    lat: 19.3583,
    lng: -99.6552,
  },
  Hidalgo: {
    label: "Hidalgo",
    short: "HGO",
    lat: 20.1011,
    lng: -98.7591,
  },
  Morelos: {
    label: "Morelos",
    short: "MOR",
    lat: 18.9242,
    lng: -99.2216,
  },
  Querétaro: {
    label: "Querétaro",
    short: "QRO",
    lat: 20.5888,
    lng: -100.3899,
  },
};

export const REGION_OPTIONS = Object.keys(REGIONS_DATA).map((key) => ({
  value: key as RegionKey,
  label: REGIONS_DATA[key as RegionKey].label,
  hint: REGIONS_DATA[key as RegionKey].short,
}));
