export type ApiErrorCode = 'NETWORK' | 'TIMEOUT' | 'HTTP' | 'EMPTY';

export class ApiError extends Error {
  status?: number;
  code: ApiErrorCode;

  constructor(message: string, code: ApiErrorCode, status?: number) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
  }
}
