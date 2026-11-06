'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2, X } from 'lucide-react';

/**
 * Brief success message after a redirect (e.g. /products?notice=created). Removes the `notice`
 * query parameter right away so a refresh or a shared link does not show it again.
 */
export default function Notice({ message }: { message: string }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const url = new URL(window.location.href);
    if (url.searchParams.has('notice')) {
      url.searchParams.delete('notice');
      window.history.replaceState(window.history.state, '', url.pathname + url.search);
    }
    const timer = window.setTimeout(() => setVisible(false), 6000);
    return () => window.clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div
      role="status"
      className="mb-5 flex items-start gap-3 rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-[#17643F] animate-fade-in"
    >
      <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-[#47A15E]" />
      <p className="flex-1 pt-0.5 font-medium">{message}</p>
      <button
        type="button"
        onClick={() => setVisible(false)}
        className="-m-1 p-1 text-[#17643F]/70 hover:text-[#17643F]"
        aria-label="Dismiss"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
