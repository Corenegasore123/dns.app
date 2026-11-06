import type { Metadata } from 'next';
import Logo from '../components/Logo';
import LoginForm from './LoginForm';

export const metadata: Metadata = { title: 'Sign in' };

type SearchParams = Promise<{ next?: string; expired?: string }>;

export default async function LoginPage({ searchParams }: { searchParams: SearchParams }) {
  const { next = '/', expired } = await searchParams;

  return (
    <main className="min-h-dvh bg-[#F5F5F2] flex flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-6">
          <Logo className="text-2xl sm:text-3xl text-center" />
        </div>
        <div className="bg-white rounded-md border border-gray-200 shadow-sm p-6 sm:p-8">
          <h1 className="text-xl sm:text-2xl font-bold text-[#1a1a1a]">Admin sign in</h1>
          <p className="text-sm text-gray-500 mt-1 mb-6">Manage products and customer messages.</p>
          {expired && (
            <p role="status" className="mb-5 rounded-md border border-amber-200 bg-amber-50 px-3.5 py-2.5 text-sm text-amber-800">
              Your session has ended. Please sign in again.
            </p>
          )}
          <LoginForm next={next} />
        </div>
        <p className="text-center text-xs text-gray-400 mt-6">Duhingeneza Shop &middot; Admin dashboard</p>
      </div>
    </main>
  );
}
