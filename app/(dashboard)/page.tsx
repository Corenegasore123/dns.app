import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, Mail, Package, Plus, XCircle } from 'lucide-react';
import { getStats, listMessages } from '@/lib/api';
import { formatDate, snippet } from '@/lib/format';
import { card, primaryButton } from '../components/ui';

export const metadata: Metadata = { title: 'Overview' };

export default async function OverviewPage() {
  const [stats, latest] = await Promise.all([getStats(), listMessages({ page: 1, pageSize: 5 })]);

  const statCards = [
    {
      label: 'Total products',
      value: stats.products,
      hint: `${stats.featured} featured`,
      href: '/products',
      icon: Package,
      tone: 'bg-green-50 text-[#17643F]',
    },
    {
      label: 'In stock',
      value: stats.inStock,
      hint: stats.products ? `${Math.round((stats.inStock / stats.products) * 100)}% of products` : '—',
      href: '/products?stock=in',
      icon: CheckCircle2,
      tone: 'bg-emerald-50 text-emerald-600',
    },
    {
      label: 'Out of stock',
      value: stats.outOfStock,
      hint: stats.outOfStock ? 'Needs restocking' : 'Everything is available',
      href: '/products?stock=out',
      icon: XCircle,
      tone: 'bg-red-50 text-red-600',
    },
    {
      label: 'Unread messages',
      value: stats.unreadMessages,
      hint: `${stats.messages} message${stats.messages === 1 ? '' : 's'} in total`,
      href: '/messages?tab=unread',
      icon: Mail,
      tone: 'bg-[#F7C35F]/20 text-[#9a6700]',
    },
  ];

  const maxCount = Math.max(1, ...stats.productsByCategory.map((c) => c.count));

  return (
    <div className="space-y-6 lg:space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#1a1a1a]">Welcome back</h2>
          <p className="text-sm text-gray-500 mt-1">Here is what is happening in the shop.</p>
        </div>
        <Link href="/products/new" className={primaryButton}>
          <Plus className="w-4 h-4" />
          Add product
        </Link>
      </div>

      <section aria-label="Key numbers" className="grid grid-cols-1 min-[22.5rem]:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
        {statCards.map(({ label, value, hint, href, icon: Icon, tone }) => (
          <Link
            key={label}
            href={href}
            className={`${card} group p-4 sm:p-5 flex flex-col gap-3 hover:border-[#47A15E]/50 hover:shadow-sm transition-all`}
          >
            <div className="flex items-start justify-between gap-2">
              <p className="text-xs sm:text-sm font-medium text-gray-500">{label}</p>
              <span className={`w-8 h-8 sm:w-9 sm:h-9 flex-shrink-0 rounded-md inline-flex items-center justify-center ${tone}`}>
                <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
              </span>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-[#1a1a1a] tabular-nums" data-stat={label}>
              {value}
            </p>
            <p className="text-xs text-gray-500 truncate">{hint}</p>
          </Link>
        ))}
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 lg:gap-6 items-start">
        <section className={`${card} p-4 sm:p-6`} aria-labelledby="by-category">
          <div className="flex items-baseline justify-between gap-3 mb-5">
            <h2 id="by-category" className="text-base font-bold text-[#1a1a1a]">
              Products by category
            </h2>
            <Link href="/products" className="text-sm font-medium text-[#17643F] hover:underline whitespace-nowrap">
              View all
            </Link>
          </div>
          <ul className="space-y-4">
            {stats.productsByCategory.map((c) => (
              <li key={c.slug}>
                <Link href={`/products?category=${c.slug}`} className="group block">
                  <div className="flex items-baseline justify-between gap-3 text-sm mb-1.5">
                    <span className="text-gray-700 group-hover:text-[#17643F] truncate">{c.name}</span>
                    <span className="font-semibold text-[#1a1a1a] tabular-nums">{c.count}</span>
                  </div>
                  <div className="h-2.5 rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[#47A15E] group-hover:bg-[#17643F] transition-colors"
                      style={{ width: `${(c.count / maxCount) * 100}%` }}
                    />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className={card} aria-labelledby="latest-messages">
          <div className="flex items-baseline justify-between gap-3 p-4 sm:p-6 pb-3 sm:pb-4">
            <h2 id="latest-messages" className="text-base font-bold text-[#1a1a1a]">
              Latest messages
            </h2>
            <Link href="/messages" className="text-sm font-medium text-[#17643F] hover:underline whitespace-nowrap">
              View all
            </Link>
          </div>
          {latest.items.length === 0 ? (
            <p className="px-4 sm:px-6 pb-6 text-sm text-gray-500">No messages yet.</p>
          ) : (
            <ul className="divide-y divide-gray-100 border-t border-gray-100">
              {latest.items.map((m) => (
                <li key={m.id}>
                  <Link href={`/messages/${m.id}`} className="group flex items-start gap-3 px-4 sm:px-6 py-3.5 hover:bg-gray-50 transition-colors">
                    <span className="w-2 pt-1.5 flex-shrink-0" aria-hidden="true">
                      {!m.read && <span className="block w-2 h-2 rounded-full bg-[#47A15E]" />}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-3">
                        <p className={`truncate text-sm ${m.read ? 'font-medium text-gray-700' : 'font-bold text-[#1a1a1a]'}`}>
                          {m.name}
                          {!m.read && <span className="sr-only"> (unread)</span>}
                        </p>
                        <time dateTime={m.createdAt} className="text-xs text-gray-400 whitespace-nowrap">
                          {formatDate(m.createdAt)}
                        </time>
                      </div>
                      <p className="text-sm text-gray-500 truncate">{snippet(m.message, 140)}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 mt-1 text-gray-300 group-hover:text-[#17643F] flex-shrink-0" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
