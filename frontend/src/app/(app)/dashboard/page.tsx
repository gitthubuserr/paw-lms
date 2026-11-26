'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { roleHome } from '@/lib/types';

/** /dashboard hanya perantara: arahkan ke beranda sesuai role. */
export default function DashboardRedirect() {
  const { user } = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (user) router.replace(roleHome(user.role));
  }, [user, router]);
  return null;
}
