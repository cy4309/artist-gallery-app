import { parseEventDate } from './formatDate';

function taipeiYmd(date: Date): { y: string; m: string; d: string } | null {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Taipei',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);

  const y = parts.find((part) => part.type === 'year')?.value;
  const m = parts.find((part) => part.type === 'month')?.value;
  const d = parts.find((part) => part.type === 'day')?.value;
  if (!y || !m || !d) return null;
  return { y, m, d };
}

/** 與網站 favorites 相同：結束日以台灣當天 23:59:59 計 */
export function isEventEnded(
  endDate?: string,
  now: number = Date.now()
): boolean {
  const end = parseEventDate(endDate);
  if (!end) return false;

  const ymd = taipeiYmd(end);
  if (!ymd) return false;

  // 不用 `YYYY-MM-DDTHH:mm:ss`（無時區）：Hermes/Android 會是 Invalid Date
  const taiwanEndOfDay = new Date(`${ymd.y}-${ymd.m}-${ymd.d}T23:59:59+08:00`);
  if (Number.isNaN(taiwanEndOfDay.getTime())) return false;

  return now > taiwanEndOfDay.getTime();
}

/** 未結束在前；同組再依收藏時間新→舊 */
export function sortFavoritesLikeWeb<
  T extends { createdAt?: string; eventEndDate?: string },
>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    const aEnded = isEventEnded(a.eventEndDate);
    const bEnded = isEventEnded(b.eventEndDate);
    if (aEnded !== bEnded) {
      return aEnded ? 1 : -1;
    }

    const at = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const bt = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return bt - at;
  });
}
