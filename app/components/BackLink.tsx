import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function BackLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-[#17643F] transition-colors"
    >
      <ArrowLeft className="w-4 h-4" />
      {children}
    </Link>
  );
}
