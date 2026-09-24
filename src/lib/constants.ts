export const FELLOWSHIPS = ["AA", "NA", "CA", "GA", "MA", "SLAA", "Al-Anon", "Annat"] as const;

export const SUBSTANCES = [
  "Alkohol",
  "Narkotika",
  "Kokain",
  "Cannabis",
  "Opioider",
  "Läkemedel",
  "Spel",
  "Nikotin",
] as const;

export const MOOD_LABELS: Record<number, string> = {
  1: "Mycket dåligt",
  2: "Dåligt",
  3: "Okej",
  4: "Bra",
  5: "Mycket bra",
};

/** Milstolpar i dagar för nykterhet. */
export const MILESTONES = [1, 7, 14, 30, 60, 90, 180, 270, 365, 548, 730, 1095, 1825, 3650];

export const RANGES = {
  "1m": { label: "1M", days: 30 },
  "3m": { label: "3M", days: 91 },
  "1a": { label: "1Å", days: 365 },
} as const;
export type RangeKey = keyof typeof RANGES;

export const METRICS = {
  mood: { label: "Mående", unit: "", domain: [1, 5], ticks: [1, 3, 5] },
  craving: { label: "Sug", unit: "", domain: [0, 10], ticks: [0, 5, 10] },
  sleep: { label: "Sömn", unit: "h", domain: [0, 12], ticks: [0, 6, 12] },
  weight: { label: "Vikt", unit: "kg", domain: null, ticks: null },
} as const;
export type MetricKey = keyof typeof METRICS;
