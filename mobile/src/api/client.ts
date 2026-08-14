import { env } from '../config/env';
import { ApiError } from './errors';
import { getSessionCookieHeader } from '../auth/session';

const DEFAULT_TIMEOUT_MS = 15_000;

type ApiRequestOptions = {
  timeoutMs?: number;
};

async function requestJson<T>(
  path: string,
  init: RequestInit,
  options?: ApiRequestOptions
): Promise<T> {
  const url = `${env.apiUrl}${path}`;
  const controller = new AbortController();
  const timeoutMs = options?.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...init,
      headers: {
        Accept: 'application/json',
        ...(init.body ? { 'Content-Type': 'application/json' } : {}),
        ...getSessionCookieHeader(),
        ...init.headers,
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      let message = `Request failed (${response.status})`;

      try {
        const body = (await response.json()) as { error?: string };
        if (body.error) {
          message = body.error;
        }
      } catch {
        // response body is not JSON
      }

      throw new ApiError(message, 'HTTP', response.status);
    }

    return (await response.json()) as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    if (error instanceof Error && error.name === 'AbortError') {
      throw new ApiError('Request timed out', 'TIMEOUT');
    }

    throw new ApiError(
      error instanceof Error ? error.message : 'Network error',
      'NETWORK'
    );
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function apiGet<T>(
  path: string,
  options?: ApiRequestOptions
): Promise<T> {
  return requestJson<T>(path, { method: 'GET' }, options);
}

export async function apiPost<T>(
  path: string,
  body: unknown,
  options?: ApiRequestOptions
): Promise<T> {
  return requestJson<T>(
    path,
    {
      method: 'POST',
      body: JSON.stringify(body),
    },
    options
  );
}
