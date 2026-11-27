import { User } from '@/lib/types';
import { request } from './api';

export const authService = {
  async login(email: string, password: string) {
    const res = await request<{ user: User }>('/auth/login', { method: 'POST', body: { email, password } });
    return res.data.user;
  },
  async register(input: { name: string; email: string; identityNumber?: string; password: string }) {
    const res = await request<{ user: User }>('/auth/register', { method: 'POST', body: input });
    return res.data.user;
  },
  async logout() {
    await request('/auth/logout', { method: 'POST' });
  },
  async me() {
    const res = await request<{ user: User }>('/auth/me');
    return res.data.user;
  },
};
