import { PageMeta, Role, User } from '@/lib/types';
import { request } from './api';

export interface UserInput {
  name: string;
  email: string;
  role: Role;
  identityNumber?: string;
  password?: string;
  isActive?: boolean;
}

export const usersService = {
  async list(query: { page?: number; limit?: number; search?: string; role?: Role | ''; isActive?: boolean }) {
    const res = await request<User[]>('/users', { query: { ...query, role: query.role || undefined } });
    return { items: res.data, meta: res.meta as PageMeta };
  },
  async create(input: UserInput & { password: string }) {
    const res = await request<{ user: User }>('/users', { method: 'POST', body: input });
    return res.data.user;
  },
  async update(id: string, input: Partial<UserInput>) {
    const res = await request<{ user: User }>(`/users/${id}`, { method: 'PATCH', body: input });
    return res.data.user;
  },
  async remove(id: string) {
    await request(`/users/${id}`, { method: 'DELETE' });
  },
  async updateProfile(name: string) {
    const res = await request<{ user: User }>('/users/me/profile', { method: 'PATCH', body: { name } });
    return res.data.user;
  },
  async changePassword(currentPassword: string, newPassword: string) {
    await request('/users/me/password', { method: 'PATCH', body: { currentPassword, newPassword } });
  },
};
