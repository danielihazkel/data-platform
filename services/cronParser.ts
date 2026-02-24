/**
 * Parses a Spring 6-field cron expression and returns all {dayIndex, hour} fire slots.
 * Format: sec min hour dayOfMonth month dayOfWeek
 * dayIndex: 0=Mon, 1=Tue, 2=Wed, 3=Thu, 4=Fri, 5=Sat, 6=Sun
 */

const DOW_MAP: Record<string, number> = {
  MON: 0, TUE: 1, WED: 2, THU: 3, FRI: 4, SAT: 5, SUN: 6,
};

function parseField(field: string, min: number, max: number, nameMap?: Record<string, number>): number[] {
  const results = new Set<number>();

  if (field === '*' || field === '?') {
    for (let i = min; i <= max; i++) results.add(i);
    return Array.from(results);
  }

  for (const part of field.split(',')) {
    if (part.includes('/')) {
      const [rangeStr, stepStr] = part.split('/');
      const step = parseInt(stepStr, 10);
      let start = min;
      let end = max;
      if (rangeStr !== '*' && rangeStr !== '?') {
        const rangeParts = rangeStr.split('-');
        start = resolveValue(rangeParts[0], nameMap ?? {});
        end = rangeParts[1] !== undefined ? resolveValue(rangeParts[1], nameMap ?? {}) : max;
      }
      for (let i = start; i <= end; i += step) results.add(i);
    } else if (part.includes('-')) {
      const [startStr, endStr] = part.split('-');
      const start = resolveValue(startStr, nameMap ?? {});
      const end = resolveValue(endStr, nameMap ?? {});
      for (let i = start; i <= end; i++) results.add(i);
    } else {
      results.add(resolveValue(part, nameMap ?? {}));
    }
  }

  return Array.from(results);
}

function resolveValue(val: string, nameMap: Record<string, number>): number {
  const upper = val.toUpperCase();
  if (nameMap[upper] !== undefined) return nameMap[upper];
  return parseInt(val, 10);
}

export function parseCronFireSlots(cronExpr: string): Array<{ dayIndex: number; hour: number }> {
  const parts = cronExpr.trim().split(/\s+/);
  if (parts.length < 6) return [];

  // sec(0) min(1) hour(2) dayOfMonth(3) month(4) dayOfWeek(5)
  const hourField = parts[2];
  const dowField = parts[5];

  const hours = parseField(hourField, 0, 23);
  const days = parseField(dowField, 0, 6, DOW_MAP);

  const slots: Array<{ dayIndex: number; hour: number }> = [];
  for (const day of days) {
    for (const hour of hours) {
      slots.push({ dayIndex: day % 7, hour });
    }
  }
  return slots;
}
