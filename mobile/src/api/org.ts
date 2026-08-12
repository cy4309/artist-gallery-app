import { OrgEvent } from '../types/orgEvent';
import { apiGet } from './client';
import { ApiError } from './errors';

export async function getOrgData(): Promise<OrgEvent[]> {
  const data = await apiGet<OrgEvent[]>('/api/org');

  if (!Array.isArray(data)) {
    throw new ApiError('Invalid response format', 'EMPTY');
  }

  return data;
}
