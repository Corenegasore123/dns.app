import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Mail, MailOpen, Reply } from 'lucide-react';
import { ApiError, getMessage } from '@/lib/api';
import { formatDateTime } from '@/lib/format';
import { markMessageUnread, removeMessage } from '../../../actions/messages';
import BackLink from '../../../components/BackLink';
import ConfirmDelete from '../../../components/ConfirmDelete';
import { card, dangerOutlineButton, primaryButton, secondaryButton } from '../../../components/ui';
import MarkReadOnOpen from './MarkReadOnOpen';

export const metadata: Metadata = { title: 'Message' };

type Params = Promise<{ id: string }>;

export default async function MessagePage({ params }: { params: Params }) {
  const { id } = await params;
  const message = await getMessage(id).catch((error: unknown) => {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  });

  const subject = encodeURIComponent('Re: your message to Duhingeneza Shop');
  const quoted = message.message
    .split('\n')
    .map((line) => `> ${line}`)
    .join('\n');
  const body = encodeURIComponent(`\n\n---\nOn ${formatDateTime(message.createdAt)}, ${message.name} wrote:\n${quoted}`);
  const mailto = `mailto:${message.email}?subject=${subject}&body=${body}`;

  return (
    <div className="space-y-5 max-w-4xl">
      {!message.read && <MarkReadOnOpen id={message.id} />}

      <BackLink href="/messages">All messages</BackLink>

      <article className={card}>
        <header className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4 border-b border-gray-100 p-4 sm:p-6">
          <span className="w-11 h-11 flex-shrink-0 rounded-full bg-[#47A15E]/10 text-[#17643F] text-base font-bold inline-flex items-center justify-center uppercase">
            {message.name.slice(0, 1)}
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-bold text-[#1a1a1a] break-words">{message.name}</h2>
            <a href={`mailto:${message.email}`} className="text-sm text-[#17643F] hover:underline break-all">
              {message.email}
            </a>
          </div>
          <div className="text-sm text-gray-500 sm:text-right">
            <time dateTime={message.createdAt} className="block whitespace-nowrap">
              {formatDateTime(message.createdAt)}
            </time>
            <span className="inline-flex items-center gap-1 text-xs mt-1">
              <MailOpen className="w-3.5 h-3.5" /> Read
            </span>
          </div>
        </header>

        <div className="p-4 sm:p-6">
          <p className="whitespace-pre-wrap break-words text-[0.9375rem] leading-relaxed text-[#1a1a1a]">{message.message}</p>
        </div>

        <footer className="flex flex-col sm:flex-row sm:flex-wrap gap-2.5 border-t border-gray-100 p-4 sm:px-6">
          <a href={mailto} className={primaryButton}>
            <Reply className="w-4 h-4" />
            Reply by email
          </a>
          <form action={markMessageUnread.bind(null, message.id)} className="contents">
            <button type="submit" className={secondaryButton}>
              <Mail className="w-4 h-4" />
              Mark as unread
            </button>
          </form>
          <div className="sm:ml-auto flex flex-col">
            <ConfirmDelete
              action={removeMessage.bind(null, message.id)}
              title="Delete this message?"
              description={`The message from ${message.name} will be permanently deleted.`}
              triggerText="Delete"
              label="Delete message"
              triggerClassName={dangerOutlineButton}
            />
          </div>
        </footer>
      </article>
    </div>
  );
}
