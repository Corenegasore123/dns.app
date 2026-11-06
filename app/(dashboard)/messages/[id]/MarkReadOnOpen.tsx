'use client';

import { useEffect, useRef } from 'react';
import { markMessageRead } from '../../../actions/messages';

/**
 * Marks the message read as soon as it is opened. Done from a Server Action (not during the page
 * render) so the unread badge in the sidebar and the counters refresh too.
 */
export default function MarkReadOnOpen({ id }: { id: string }) {
  const done = useRef<string | null>(null);
  useEffect(() => {
    if (done.current === id) return;
    done.current = id;
    void markMessageRead(id);
  }, [id]);
  return null;
}
