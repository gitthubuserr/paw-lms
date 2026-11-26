'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ReactNode, useEffect } from 'react';
import { APP_NAME } from '@/lib/config';
import { NAV_ITEMS } from '@/lib/navigation';
import { ROLE_LABEL } from '@/lib/types';
import { useAuth } from './AuthProvider';

export function AppShell({ children }: { children: ReactNode }) {
  const { user, loading, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.replace(`/login?next=${encodeURIComponent(pathname)}`);
  }, [loading, user, pathname, router]);

  if (loading || !user) {
    return (
      <div className="splash" role="status" aria-live="polite">
        Memuat sesi Anda...
      </div>
    );
  }

  const items = NAV_ITEMS.filter((i) => i.roles.includes(user.role));

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">{APP_NAME}</div>
        <nav aria-label="Menu utama">
          {items.map((item) => {
            const href = typeof item.href === 'function' ? item.href(user.role) : item.href;
            const active = item.exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
            return (
              <Link key={item.label} href={href} className={active ? 'nav-link active' : 'nav-link'} aria-current={active ? 'page' : undefined}>
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="sidebar-foot">
          <div className="who">
            <span className="who-name">{user.name}</span>
            <span className="who-role">{ROLE_LABEL[user.role]}</span>
          </div>
          <button className="btn btn-ghost-light" onClick={logout}>
            Keluar
          </button>
        </div>
      </aside>
      <main className="content">{children}</main>
    </div>
  );
}
