'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ExternalLink, LayoutDashboard, LogOut, Mail, Menu, Package, X } from 'lucide-react';
import type { Admin } from '@/lib/api';
import { logout } from '../actions/auth';
import Logo from './Logo';

type ShellProps = {
  admin: Admin;
  unreadMessages: number;
  siteUrl: string;
  children: React.ReactNode;
};

const nav = [
  { label: 'Overview', href: '/', icon: LayoutDashboard },
  { label: 'Products', href: '/products', icon: Package },
  { label: 'Messages', href: '/messages', icon: Mail },
];

function isActive(pathname: string, href: string) {
  return href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`);
}

function pageTitle(pathname: string): string {
  if (pathname === '/') return 'Overview';
  if (pathname === '/products/new') return 'Add product';
  if (/^\/products\/[^/]+\/edit$/.test(pathname)) return 'Edit product';
  if (pathname.startsWith('/products')) return 'Products';
  if (/^\/messages\/[^/]+$/.test(pathname)) return 'Message';
  if (pathname.startsWith('/messages')) return 'Messages';
  return 'Dashboard';
}

function SidebarContent({
  admin,
  unreadMessages,
  siteUrl,
  pathname,
  onNavigate,
}: Omit<ShellProps, 'children'> & { pathname: string; onNavigate?: () => void }) {
  return (
    <div className="flex h-full flex-col">
      <div className="px-6 pt-6 pb-5">
        <Logo href="/" className="text-xl" />
        <span className="mt-2 inline-block rounded-full bg-[#F7C35F]/25 px-2.5 py-0.5 text-[0.6875rem] font-semibold uppercase tracking-wide text-[#8a5a00]">
          Admin
        </span>
      </div>

      <nav aria-label="Dashboard" className="flex-1 overflow-y-auto px-3 py-2">
        <ul className="space-y-1">
          {nav.map(({ label, href, icon: Icon }) => {
            const active = isActive(pathname, href);
            return (
              <li key={href}>
                <Link
                  href={href}
                  onClick={onNavigate}
                  aria-current={active ? 'page' : undefined}
                  className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
                    active ? 'bg-green-50 text-[#17643F]' : 'text-gray-600 hover:bg-gray-50 hover:text-[#1a1a1a]'
                  }`}
                >
                  <Icon className={`w-[1.125rem] h-[1.125rem] flex-shrink-0 ${active ? 'text-[#47A15E]' : 'text-gray-400'}`} />
                  <span className="flex-1">{label}</span>
                  {href === '/messages' && unreadMessages > 0 && (
                    <span
                      className="min-w-5 h-5 px-1.5 inline-flex items-center justify-center rounded-full bg-[#F7C35F] text-[0.6875rem] font-bold text-[#1a1a1a]"
                      aria-label={`${unreadMessages} unread`}
                    >
                      {unreadMessages > 99 ? '99+' : unreadMessages}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="my-4 border-t border-gray-100" />

        <a
          href={siteUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-[#1a1a1a] transition-colors"
        >
          <ExternalLink className="w-[1.125rem] h-[1.125rem] text-gray-400 flex-shrink-0" />
          View website
        </a>
      </nav>

      <div className="border-t border-gray-100 p-4">
        <div className="flex items-center gap-3 px-1 mb-3 min-w-0">
          <span className="w-9 h-9 flex-shrink-0 rounded-full bg-[#47A15E] text-white text-sm font-bold inline-flex items-center justify-center uppercase">
            {(admin.name || admin.email).slice(0, 1)}
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[#1a1a1a] truncate">{admin.name}</p>
            <p className="text-xs text-gray-500 truncate">{admin.email}</p>
          </div>
        </div>
        <form action={logout}>
          <button
            type="submit"
            className="w-full flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-700 transition-colors"
          >
            <LogOut className="w-[1.125rem] h-[1.125rem] flex-shrink-0" />
            Log out
          </button>
        </form>
      </div>
    </div>
  );
}

export default function DashboardShell({ admin, unreadMessages, siteUrl, children }: ShellProps) {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const close = () => setDrawerOpen(false);

  // Drawer: close on Escape or when the viewport grows to the desktop layout; lock page scroll while open
  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setDrawerOpen(false);
    const mq = window.matchMedia('(min-width: 64rem)');
    const onResize = () => mq.matches && setDrawerOpen(false);
    window.addEventListener('keydown', onKey);
    mq.addEventListener('change', onResize);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      mq.removeEventListener('change', onResize);
      document.body.style.overflow = overflow;
    };
  }, [drawerOpen]);

  const sidebarProps = { admin, unreadMessages, siteUrl, pathname };

  return (
    <div className="min-h-dvh bg-[#F7F7F5]">
      {/* Desktop sidebar */}
      <aside className="hidden lg:block fixed inset-y-0 left-0 z-30 w-64 border-r border-gray-200 bg-white">
        <SidebarContent {...sidebarProps} />
      </aside>

      {/* Mobile / tablet drawer */}
      {drawerOpen && (
        <div className="lg:hidden fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Menu">
          <button
            type="button"
            className="absolute inset-0 bg-black/40 animate-fade-in"
            aria-label="Close menu"
            onClick={close}
          />
          <aside className="absolute inset-y-0 left-0 w-72 max-w-[85vw] bg-white shadow-xl animate-slide-in">
            <button
              type="button"
              onClick={close}
              className="absolute right-3 top-4 p-2 text-gray-500 hover:text-[#1a1a1a]"
              aria-label="Close menu"
              autoFocus
            >
              <X className="w-5 h-5" />
            </button>
            <SidebarContent {...sidebarProps} onNavigate={close} />
          </aside>
        </div>
      )}

      <div className="lg:pl-64 min-w-0">
        <header className="sticky top-0 z-20 border-b border-gray-200 bg-white/95 backdrop-blur">
          <div className="content-container flex h-16 items-center gap-3">
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="lg:hidden -ml-2 p-2 text-gray-700 hover:text-[#1a1a1a]"
              aria-label="Open menu"
              aria-expanded={drawerOpen}
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="flex-1 min-w-0 truncate text-lg sm:text-xl font-bold text-[#1a1a1a]">{pageTitle(pathname)}</h1>
            <span className="hidden sm:block text-sm text-gray-500 truncate max-w-[40%]">
              Signed in as <span className="font-medium text-[#1a1a1a]">{admin.name}</span>
            </span>
          </div>
        </header>
        <main className="content-container py-6 sm:py-8">{children}</main>
      </div>
    </div>
  );
}
