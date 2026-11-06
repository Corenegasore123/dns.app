import Link from 'next/link';
import Logo from './components/Logo';
import { primaryButton } from './components/ui';

export default function NotFound() {
  return (
    <main className="min-h-dvh bg-[#F7F7F5] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md bg-white rounded-md border border-gray-200 p-6 sm:p-8 text-center">
        <div className="flex justify-center mb-5">
          <Logo className="text-xl text-center" />
        </div>
        <h1 className="text-lg font-bold text-[#1a1a1a]">Page not found</h1>
        <p className="text-sm text-gray-500 mt-1 mb-6">This page does not exist, or the item was deleted.</p>
        <Link href="/" className={primaryButton}>
          Back to the dashboard
        </Link>
      </div>
    </main>
  );
}
