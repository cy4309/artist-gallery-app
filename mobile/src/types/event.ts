export type EventSource = 'culture' | 'ntpc';

/** 活動圖片來源：official=API 原圖；og=官網 og:image；search=關鍵字搜圖 */
export type EventImageSource = 'official' | 'og' | 'search';

/** 統一活動格式（多來源整合後） */
export interface CanonicalEvent {
  id: string;
  source: EventSource;
  sourceId?: string;
  category?: string;
  title: string;
  startTime: string;
  endTime: string;
  cityName: string;
  address: string;
  description: string;
  website: string;
  imageUrl: string;
  imageSource?: EventImageSource;
  syncedAt: string;
}

/** 前端 UI 使用的格式（相容層） */
export interface OrgEvent {
  id: string;
  source?: EventSource;
  category?: string;
  actId: number;
  cityName: string;
  actName: string;
  startTime: string;
  endTime: string;
  address: string;
  imageUrl: string;
  imageSource?: EventImageSource;
  description: string;
  website: string;
}
