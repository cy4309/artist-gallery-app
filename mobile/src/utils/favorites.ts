/** 與網站 favorites 相同：結束日以台灣當天 23:59:59 計 */
export function isEventEnded(endDate?: string): boolean {
  if (!endDate) return false;

  const end = new Date(endDate);
  if (Number.isNaN(end.getTime())) return false;

  const taiwanEndOfDay = new Date(
    end.toLocaleDateString('en-CA', { timeZone: 'Asia/Taipei' }) + 'T23:59:59'
  );

  return Date.now() > taiwanEndOfDay.getTime();
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
