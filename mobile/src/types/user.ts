export type AuthProvider = 'google' | 'line';

export type User = {
  id: string;
  provider: AuthProvider;
  name: string;
  picture: string;
  email?: string;
  lineUserId?: string;
};
