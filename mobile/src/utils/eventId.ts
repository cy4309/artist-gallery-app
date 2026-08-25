/** 活動路由 / 收藏用的 canonical id 工具（與 frontend 一致） */

export function toCanonicalId(raw: string): string {
  const id = decodeEventPathId(raw).trim();
  if (!id) return '';

  if (id.includes(':')) return id;

  const dashed = id.match(/^(culture|ntpc)-(.+)$/);
  if (dashed) return `${dashed[1]}:${dashed[2]}`;

  return id;
}

export function decodeEventPathId(raw: string): string {
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

export function eventDetailPath(canonicalId: string): string {
  const canonical = toCanonicalId(canonicalId);
  const parts = canonical.match(/^(culture|ntpc):(.+)$/);
  if (parts) {
    return `/events/${parts[1]}-${parts[2]}`;
  }
  return `/events/${encodeURIComponent(canonical)}`;
}

export function eventRouteSegment(canonicalId: string): string {
  return eventDetailPath(canonicalId).replace(/^\/events\//, '');
}

export function favoriteIdAliases(eventId: string): string[] {
  const id = String(eventId).trim();
  if (!id) return [];

  const aliases = new Set<string>([id]);
  const canonical = toCanonicalId(id);
  aliases.add(canonical);

  const parts = canonical.match(/^(culture|ntpc):(.+)$/);
  if (parts) {
    aliases.add(`${parts[1]}-${parts[2]}`);
  }

  if (id.startsWith('culture:')) {
    aliases.add(`culture-${id.slice('culture:'.length)}`);
  } else if (id.startsWith('ntpc:')) {
    aliases.add(`ntpc-${id.slice('ntpc:'.length)}`);
  }

  return [...aliases];
}

export function favoritesInclude(
  favorites: string[],
  eventId: string
): boolean {
  const aliases = favoriteIdAliases(eventId);
  return favorites.some((f) => aliases.includes(String(f)));
}

export function findStoredFavoriteId(
  favorites: string[],
  eventId: string
): string | null {
  const aliases = new Set(favoriteIdAliases(eventId));
  const hit = favorites.find((f) => aliases.has(String(f)));
  return hit ?? null;
}
