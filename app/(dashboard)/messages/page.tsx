import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Inbox } from 'lucide-react';
import { getStats, listMessages } from '@/lib/api';
import { formatDateTime, queryString, snippet } from '@/lib/format';
import Notice from '../../components/Notice';
import Pagination from '../../components/Pagination';

export const metadata: Metadata = { title: 'Messages' };

const PAGE_SIZE = 15;

const NOTICES: Record<string, string> = {
  deleted: 'Message deleted.',
  unread: 'Message marked as unread.',
};

type Tab = 'all' | 'unread' | 'read';
type SearchParams = Promise<{ tab?: string; page?: string; notice?: string }>;

export default async function MessagesPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const tab: Tab = params.tab === 'unread' || params.tab === 'read' ? params.tab : 'all';
  const page = Math.max(1, Math.floor(Number(params.page)) || 1);

  const [result, stats] = await Promise.all([
    listMessages({ read: tab === 'all' ? undefined : tab === 'read', page, pageSize: PAGE_SIZE }),
    getStats(),
  ]);

  const hrefFor = (p: number, t: Tab = tab) =>
    `/messages${queryString({ tab: t === 'all' ? undefined : t, page: p > 1 ? p : undefined })}`;

  if (result.items.length === 0 && result.total > 0 && page > result.totalPages) redirect(hrefFor(result.totalPages));

  const tabs: { id: Tab; label: string; count: number }[] = [
    { id: 'all', label: 'All', count: stats.messages },
    { id: 'unread', label: 'Unread', count: stats.unreadMessages },
    { id: 'read', label: 'Read', count: stats.messages - stats.unreadMessages },
  ];

  return (
    <div className="space-y-5">
      {params.notice && NOTICES[params.notice] && <Notice key={crypto.randomUUID()} message={NOTICES[params.notice]} />}

      <nav aria-label="Filter messages" className="flex gap-1 border-b border-gray-200 overflow-x-auto">
        {tabs.map((t) => {
          const active = t.id === tab;
          return (
            <Link
              key={t.id}
              href={hrefFor(1, t.id)}
              aria-current={active ? 'page' : undefined}
              className={`-mb-px inline-flex items-center gap-2 border-b-2 px-3 sm:px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors ${
                active ? 'border-[#47A15E] text-[#17643F]' : 'border-transparent text-gray-500 hover:text-[#1a1a1a]'
              }`}
            >
              {t.label}
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                  active ? 'bg-green-50 text-[#17643F]' : 'bg-gray-100 text-gray-500'
                }`}
              >
                {t.count}
              </span>
            </Link>
          );
        })}
      </nav>

      {result.items.length === 0 ? (
        <div className="rounded-md border border-dashed border-gray-300 bg-white py-16 px-6 text-center">
          <Inbox className="w-8 h-8 mx-auto text-gray-300 mb-3" />
          <p className="font-semibold text-[#1a1a1a] mb-1">
            {tab === 'unread' ? 'No unread messages' : tab === 'read' ? 'No read messages' : 'No messages yet'}
          </p>
          <p className="text-sm text-gray-500">Messages sent from the website&rsquo;s contact form appear here.</p>
        </div>
      ) : (
        <>
          <ul className="bg-white rounded-md border border-gray-200 divide-y divide-gray-100 overflow-hidden">
            {result.items.map((m) => (
              <li key={m.id}>
                <Link
                  href={`/messages/${m.id}`}
                  className={`flex gap-3 px-4 py-3.5 sm:py-4 transition-colors hover:bg-gray-50 ${m.read ? '' : 'bg-green-50/40'}`}
                >
                  <span className="w-2.5 pt-1.5 flex-shrink-0" aria-hidden="true">
                    {!m.read && <span className="block w-2.5 h-2.5 rounded-full bg-[#47A15E]" />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-baseline sm:gap-3">
                      <p className={`truncate text-sm ${m.read ? 'font-medium text-gray-700' : 'font-bold text-[#1a1a1a]'}`}>
                        {m.name}
                        {!m.read && <span className="sr-only"> (unread)</span>}
                      </p>
                      <p className="truncate text-xs text-gray-500 sm:flex-1">{m.email}</p>
                      <time dateTime={m.createdAt} className="hidden sm:block text-xs text-gray-500 whitespace-nowrap">
                        {formatDateTime(m.createdAt)}
                      </time>
                    </div>
                    <p className={`mt-1 text-sm line-clamp-2 sm:line-clamp-1 ${m.read ? 'text-gray-500' : 'text-gray-700'}`}>{snippet(m.message, 200)}</p>
                    <time dateTime={m.createdAt} className="sm:hidden block mt-1 text-xs text-gray-400">
                      {formatDateTime(m.createdAt)}
                    </time>
                  </div>
                </Link>
              </li>
            ))}
          </ul>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-gray-500">
              Showing {(result.page - 1) * result.pageSize + 1}–{(result.page - 1) * result.pageSize + result.items.length} of{' '}
              {result.total}
            </p>
            <Pagination page={result.page} totalPages={result.totalPages} hrefFor={(p) => hrefFor(p)} />
          </div>
        </>
      )}
    </div>
  );
}
