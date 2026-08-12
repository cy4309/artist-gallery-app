export function formatEventDate(value?: string): string {
  if (!value) return '';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

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
