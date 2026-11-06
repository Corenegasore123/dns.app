'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, X } from 'lucide-react';
import type { Category } from '@/lib/api';

type Filters = { q: string; category: string; stock: string; featured: string };

const selectClass =
  'w-full rounded-md border border-gray-200 bg-white pl-3 pr-8 py-2.5 text-sm text-[#1a1a1a] focus:outline-none focus:border-[#47A15E] focus:ring-2 focus:ring-[#47A15E]/20';

/**
 * Search + filters as a plain GET form, so the state lives in the URL (?q=&category=&stock=&featured=)
 * like the website's product list. Changing a select submits right away; the search submits on Enter.
 */
export default function ProductFilters({ categories, values }: { categories: Category[]; values: Filters }) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const submit = () => formRef.current?.requestSubmit();

  // Client-side navigation with a tidy URL: leave out empty fields (and the page, so results start at 1)
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const params = new URLSearchParams();
    for (const [key, value] of new FormData(e.currentTarget)) {
      const v = String(value).trim();
      if (v) params.set(key, v);
    }
    const qs = params.toString();
    router.push(qs ? `/products?${qs}` : '/products');
  };
  const active = Boolean(values.q || values.category || values.stock || values.featured);

  return (
    <form
      ref={formRef}
      action="/products"
      onSubmit={onSubmit}
      role="search"
      // Re-mount when the URL changes (back/forward, "Clear") so the inputs show the current filters
      key={JSON.stringify(values)}
      className="bg-white rounded-md border border-gray-200 p-3 sm:p-4 grid grid-cols-2 lg:grid-cols-[minmax(0,1fr)_repeat(3,minmax(0,11rem))_auto] gap-2.5 sm:gap-3"
    >
      <div className="relative col-span-2 lg:col-span-1">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        <input
          type="search"
          name="q"
          defaultValue={values.q}
          placeholder="Search by name or description"
          aria-label="Search products"
          className="w-full rounded-md bg-gray-100 border border-transparent pl-10 pr-3 py-2.5 text-sm text-[#1a1a1a] placeholder:text-gray-400 focus:outline-none focus:border-[#47A15E] focus:bg-white transition-colors"
        />
      </div>

      <select name="category" defaultValue={values.category} onChange={submit} aria-label="Category" className={selectClass}>
        <option value="">All categories</option>
        {categories.map((c) => (
          <option key={c.slug} value={c.slug}>
            {c.name}
          </option>
        ))}
      </select>

      <select name="stock" defaultValue={values.stock} onChange={submit} aria-label="Stock" className={selectClass}>
        <option value="">Any stock</option>
        <option value="in">In stock</option>
        <option value="out">Out of stock</option>
      </select>

      <select name="featured" defaultValue={values.featured} onChange={submit} aria-label="Featured" className={selectClass}>
        <option value="">All products</option>
        <option value="yes">Featured only</option>
      </select>

      <div className="flex gap-2">
        <button
          type="submit"
          className="flex-1 lg:flex-none rounded-md bg-[#17643F] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#12502f] transition-colors"
        >
          Search
        </button>
        {active && (
          <Link
            href="/products"
            className="inline-flex items-center justify-center gap-1 rounded-md border border-gray-200 px-3 py-2.5 text-sm text-gray-600 hover:bg-gray-50"
            aria-label="Clear filters"
            title="Clear filters"
          >
            <X className="w-4 h-4" />
          </Link>
        )}
      </div>
    </form>
  );
}
