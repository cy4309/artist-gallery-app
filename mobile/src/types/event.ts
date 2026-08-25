export type EventSource = 'culture' | 'ntpc';

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
  description: string;
  website: string;
}
