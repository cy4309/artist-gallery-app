const MONTHS: Record<string, number> = {
  jan: 1,
  feb: 2,
  mar: 3,
  apr: 4,
  may: 5,
  jun: 6,
  jul: 7,
  aug: 8,
  sep: 9,
  oct: 10,
  nov: 11,
  dec: 12,
};

function pad(value: number): string {
  return String(value).padStart(2, '0');
}

/** 文化部 org 日期（Aug 16, 2026 12:00:00 AM）在 Hermes 無法用 new Date 解析 */
const ORG_DATE_RE =
  /^([A-Za-z]+)\s+(\d{1,2}),\s+(\d{4})(?:\s+(\d{1,2}):(\d{2}):(\d{2})\s*(AM|PM))?$/i;

/**
 * 解析活動日期。org 的英文日期視為台灣當地時間（與網站 toISODateTime 意圖一致）。
 */
export function parseEventDate(value?: string): Date | null {
  if (!value) return null;

  const trimmed = value.trim();
  const org = trimmed.match(ORG_DATE_RE);
  if (org) {
    const month = MONTHS[org[1].slice(0, 3).toLowerCase()];
    if (!month) return null;

    const day = Number(org[2]);
    const year = Number(org[3]);
    let hour = org[4] ? Number(org[4]) : 0;
    const minute = org[5] ? Number(org[5]) : 0;
    const second = org[6] ? Number(org[6]) : 0;
    const meridiem = org[7]?.toUpperCase();

    if (meridiem === 'AM' && hour === 12) hour = 0;
    if (meridiem === 'PM' && hour !== 12) hour += 12;

    const parsed = new Date(
      `${year}-${pad(month)}-${pad(day)}T${pad(hour)}:${pad(minute)}:${pad(second)}+08:00`
    );
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  const native = new Date(trimmed);
  return Number.isNaN(native.getTime()) ? null : native;
}

/** 與網站相同：收藏寫入時轉 ISO */
export function toISODateTime(input?: string): string {
  const date = parseEventDate(input);
  return date ? date.toISOString() : '';
}

export function formatEventDate(value?: string): string {
  if (!value) return '';

  const date = parseEventDate(value);
  if (!date) return value;

  return new Intl.DateTimeFormat('zh-TW', {
    timeZone: 'Asia/Taipei',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

export function formatEventDateRange(startTime?: string, endTime?: string): string {
  const start = formatEventDate(startTime);
  const end = formatEventDate(endTime);

  if (start && end && start !== end) {
    return `${start} – ${end}`;
  }

  return start || end;
}
