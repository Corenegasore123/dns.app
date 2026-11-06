'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import { primaryButton, secondaryButton } from './components/ui';

// Shown when a page fails to load, usually because the API is unreachable
export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="min-h-dvh bg-[#F7F7F5] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md bg-white rounded-md border border-gray-200 p-6 sm:p-8 text-center">
        <span className="mx-auto mb-4 w-12 h-12 rounded-full bg-red-50 text-red-600 inline-flex items-center justify-center">
          <AlertTriangle className="w-6 h-6" />
        </span>
        <h1 className="text-lg font-bold text-[#1a1a1a]">Something went wrong</h1>
        <p className="text-sm text-gray-500 mt-1 mb-6">
          The dashboard could not load this page. The shop&rsquo;s server may be unavailable; please try again.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-2.5">
          <button type="button" onClick={reset} className={primaryButton}>
            <RotateCcw className="w-4 h-4" />
            Try again
          </button>
          <Link href="/" className={secondaryButton}>
            Go to overview
          </Link>
        </div>
      </div>
    </main>
  );
}
