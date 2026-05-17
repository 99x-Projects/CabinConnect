import { apiFetch } from './api';

export const invitationsApi = {
  create: (email: string, role: string) =>
    apiFetch<{ message: string }>('/api/invitations', {
      method: 'POST',
      body: JSON.stringify({ email, role }),
    }),

  resend: (email: string) =>
    apiFetch<{ message: string }>(`/api/invitations/${encodeURIComponent(email)}/resend`, {
      method: 'POST',
    }),

  cancel: (email: string) =>
    apiFetch<void>(`/api/invitations/${encodeURIComponent(email)}`, {
      method: 'DELETE',
    }),
};
