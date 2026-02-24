/**
 * Deterministic sparkline data generator using Mulberry32 PRNG.
 * Same queryId always produces the same data — no API calls needed.
 */

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

function mulberry32(seed: number): () => number {
  let s = seed;
  return () => {
    s += 0x6d2b79f5;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function getQuerySparklineData(queryId: string, days: number = 14): number[] {
  const rand = mulberry32(hashCode(queryId));
  const base = 50 + rand() * 200; // 50–250
  const trendEnd = rand() * 70;   // 0–70 total drift over period
  const data: number[] = [];

  for (let i = 0; i < days; i++) {
    const trend = (trendEnd / days) * i;
    const noise = (rand() - 0.5) * 60; // ±30
    data.push(Math.max(0, Math.round(base + trend + noise)));
  }

  return data;
}
