import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Pencil, Plus, Star } from 'lucide-react';
import { getCategories, listProducts, type Product } from '@/lib/api';
import { siteUrl } from '@/lib/config';
import { imageSrc, queryString } from '@/lib/format';
import { removeProduct } from '../../actions/products';
import ConfirmDelete from '../../components/ConfirmDelete';
import Notice from '../../components/Notice';
import Pagination from '../../components/Pagination';
import ProductImage from '../../components/ProductImage';
import StockBadge from '../../components/StockBadge';
import { primaryButton } from '../../components/ui';
import ProductFilters from './ProductFilters';

export const metadata: Metadata = { title: 'Products' };

const PAGE_SIZE = 10;

const NOTICES: Record<string, string> = {
  created: 'Product created.',
  updated: 'Product saved.',
  deleted: 'Product deleted.',
};

type SearchParams = Promise<{ q?: string; category?: string; stock?: string; featured?: string; page?: string; notice?: string }>;

const iconButton =
  'inline-flex items-center justify-center w-9 h-9 rounded-md border border-gray-200 bg-white text-gray-600 transition-colors';

export default async function ProductsPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const categories = await getCategories();

  const q = (params.q ?? '').trim();
  const category = categories.some((c) => c.slug === params.category) ? params.category! : '';
  const stock = params.stock === 'in' || params.stock === 'out' ? params.stock : '';
  const featured = params.featured === 'yes' ? 'yes' : '';
  const page = Math.max(1, Math.floor(Number(params.page)) || 1);

  const result = await listProducts({
    q: q || undefined,
    category: category || undefined,
    inStock: stock ? stock === 'in' : undefined,
    featured: featured ? true : undefined,
    page,
    pageSize: PAGE_SIZE,
  });

  const filters = { q, category, stock, featured };
  const hrefFor = (p: number) => `/products${queryString({ ...filters, page: p > 1 ? p : undefined })}`;

  // Past the last page (e.g. after deleting its only product): go to the last one
  if (result.items.length === 0 && result.total > 0 && page > result.totalPages) {
    redirect(hrefFor(result.totalPages));
  }

  const currentHref = hrefFor(page);
  const site = siteUrl();
  const categoryName = (slug: string) => categories.find((c) => c.slug === slug)?.name ?? slug;
  const filtered = Boolean(q || category || stock || featured);

  const deleteAction = (product: Product) => removeProduct.bind(null, product.id, currentHref);

  return (
    <div className="space-y-5">
      {params.notice && NOTICES[params.notice] && <Notice key={crypto.randomUUID()} message={NOTICES[params.notice]} />}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-gray-500">
          {result.total} product{result.total === 1 ? '' : 's'}
          {filtered && ' match your filters'}
        </p>
        <Link href="/products/new" className={primaryButton}>
          <Plus className="w-4 h-4" />
          Add product
        </Link>
      </div>

      <ProductFilters categories={categories} values={filters} />

      {result.items.length === 0 ? (
        <div className="rounded-md border border-dashed border-gray-300 bg-white py-16 px-6 text-center">
          <p className="font-semibold text-[#1a1a1a] mb-1">No products found</p>
          <p className="text-sm text-gray-500 mb-5">
            {filtered ? 'Try another search or clear the filters.' : 'Add your first product to get started.'}
          </p>
          {filtered ? (
            <Link href="/products" className="text-sm font-semibold text-[#47A15E] hover:underline">
              Clear filters
            </Link>
          ) : (
            <Link href="/products/new" className={primaryButton}>
              <Plus className="w-4 h-4" />
              Add product
            </Link>
          )}
        </div>
      ) : (
        <>
          {/* Phones: cards */}
          <ul className="md:hidden space-y-3">
            {result.items.map((product) => (
              <li key={product.id} className="bg-white rounded-md border border-gray-200 p-3 flex gap-3">
                <ProductImage src={imageSrc(product.images[0] ?? '', site)} alt="" className="w-16 h-16 rounded-md flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start gap-1.5">
                    <Link
                      href={`/products/${product.id}/edit`}
                      className="font-semibold text-[#1a1a1a] hover:text-[#17643F] break-words min-w-0"
                    >
                      {product.name}
                    </Link>
                    {product.featured && (
                      <Star className="w-4 h-4 mt-0.5 flex-shrink-0 fill-[#F7C35F] text-[#F7C35F]" aria-label="Featured" />
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {categoryName(product.category)} &middot; {product.size}
                  </p>
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <StockBadge inStock={product.inStock} />
                    <div className="flex gap-1.5">
                      <Link
                        href={`/products/${product.id}/edit`}
                        className={`${iconButton} hover:border-[#47A15E] hover:text-[#17643F]`}
                        aria-label={`Edit ${product.name}`}
                      >
                        <Pencil className="w-4 h-4" />
                      </Link>
                      <ConfirmDelete
                        action={deleteAction(product)}
                        title={`Delete “${product.name}”?`}
                        description="The product is removed from the website straight away. This cannot be undone."
                        label={`Delete ${product.name}`}
                        triggerClassName={`${iconButton} hover:border-red-300 hover:text-red-600`}
                      />
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          {/* Tablet and up: table (scrolls inside its own box if it ever gets too narrow) */}
          <div className="hidden md:block bg-white rounded-md border border-gray-200 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50/70 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  <th scope="col" className="py-3 pl-4 pr-3 w-16">
                    <span className="sr-only">Image</span>
                  </th>
                  <th scope="col" className="py-3 px-3">Name</th>
                  <th scope="col" className="py-3 px-3">Category</th>
                  <th scope="col" className="py-3 px-3">Size</th>
                  <th scope="col" className="py-3 px-3">Stock</th>
                  <th scope="col" className="py-3 px-3 text-center">Featured</th>
                  <th scope="col" className="py-3 pl-3 pr-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {result.items.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50/60">
                    <td className="py-2.5 pl-4 pr-3">
                      <ProductImage src={imageSrc(product.images[0] ?? '', site)} alt="" className="w-11 h-11 rounded-md" />
                    </td>
                    <td className="py-2.5 px-3">
                      <Link href={`/products/${product.id}/edit`} className="font-semibold text-[#1a1a1a] hover:text-[#17643F]">
                        {product.name}
                      </Link>
                      <p className="text-xs text-gray-400">/{product.slug}</p>
                    </td>
                    <td className="py-2.5 px-3 text-gray-600 whitespace-nowrap">{categoryName(product.category)}</td>
                    <td className="py-2.5 px-3 text-gray-600 whitespace-nowrap">{product.size}</td>
                    <td className="py-2.5 px-3">
                      <StockBadge inStock={product.inStock} />
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      {product.featured ? (
                        <Star className="inline w-4 h-4 fill-[#F7C35F] text-[#F7C35F]" aria-label="Featured" />
                      ) : (
                        <Star className="inline w-4 h-4 text-gray-200" aria-label="Not featured" />
                      )}
                    </td>
                    <td className="py-2.5 pl-3 pr-4">
                      <div className="flex justify-end gap-1.5">
                        <Link
                          href={`/products/${product.id}/edit`}
                          className={`${iconButton} hover:border-[#47A15E] hover:text-[#17643F]`}
                          aria-label={`Edit ${product.name}`}
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </Link>
                        <ConfirmDelete
                          action={deleteAction(product)}
                          title={`Delete “${product.name}”?`}
                          description="The product is removed from the website straight away. This cannot be undone."
                          label={`Delete ${product.name}`}
                          triggerClassName={`${iconButton} hover:border-red-300 hover:text-red-600`}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
            <p className="text-xs text-gray-500">
              Showing {(result.page - 1) * result.pageSize + 1}–{(result.page - 1) * result.pageSize + result.items.length} of{' '}
              {result.total}
            </p>
            <Pagination page={result.page} totalPages={result.totalPages} hrefFor={hrefFor} />
          </div>
        </>
      )}
    </div>
  );
}
