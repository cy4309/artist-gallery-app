/** 活動開始「日」在台灣至少還有一天時，提醒時間為開始日前一天 09:00（Asia/Taipei）。 */

type Ymd = { y: number; m: number; d: number };

function ymdInTaipei(date: Date): Ymd | null {
  if (Number.isNaN(date.getTime())) return null;

  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Taipei',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);

  const y = Number(parts.find((p) => p.type === 'year')?.value);
  const m = Number(parts.find((p) => p.type === 'month')?.value);
  const d = Number(parts.find((p) => p.type === 'day')?.value);
  if (!y || !m || !d) return null;
  return { y, m, d };
}

function ymdKey(value: Ymd): number {
  return value.y * 10000 + value.m * 100 + value.d;
}

function addCalendarDays(value: Ymd, delta: number): Ymd {
  const next = new Date(Date.UTC(value.y, value.m - 1, value.d + delta));
  return {
    y: next.getUTCFullYear(),
    m: next.getUTCMonth() + 1,
    d: next.getUTCDate(),
  };
}

function taipeiWallClock(value: Ymd, hour: number, minute: number): Date {
  const pad = (n: number) => String(n).padStart(2, '0');
  return new Date(
    `${value.y}-${pad(value.m)}-${pad(value.d)}T${pad(hour)}:${pad(minute)}:00+08:00`
  );
}

export function reminderFireAt(
  startValue?: string,
  now: Date = new Date()
): Date | null {
  if (!startValue) return null;

  const start = ymdInTaipei(new Date(startValue));
  const today = ymdInTaipei(now);
  if (!start || !today) return null;
  if (ymdKey(start) <= ymdKey(today)) return null;

  const dayBefore = addCalendarDays(start, -1);
  const fireAt = taipeiWallClock(dayBefore, 9, 0);
  if (fireAt.getTime() <= now.getTime()) return null;
  return fireAt;
}
