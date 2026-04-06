import type { UUID, UserRole, Locale } from './index.js';

export interface UserProfile {
  id: UUID;
  displayName: string;
  email: string;
  role: UserRole;
  locale: Locale;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfileInput {
  displayName?: string;
  locale?: Locale;
}
