import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ExternalLink } from 'lucide-react';
import { ApiError, getCategories, getProduct } from '@/lib/api';
import { siteUrl } from '@/lib/config';
import { formatDateTime } from '@/lib/format';
import { removeProduct } from '../../../../actions/products';
import BackLink from '../../../../components/BackLink';
import ConfirmDelete from '../../../../components/ConfirmDelete';
import { dangerOutlineButton } from '../../../../components/ui';
import ProductForm from '../../ProductForm';

export const metadata: Metadata = { title: 'Edit product' };

type Params = Promise<{ id: string }>;

export default async function EditProductPage({ params }: { params: Params }) {
  const { id } = await params;
  const [product, categories] = await Promise.all([
    getProduct(id).catch((error: unknown) => {
      if (error instanceof ApiError && error.status === 404) notFound();
      throw error;
    }),
    getCategories(),
  ]);
  const site = siteUrl();

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <BackLink href="/products">All products</BackLink>
        <div className="flex items-center gap-2">
          <a
            href={`${site}/products/${product.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium text-gray-600 hover:bg-white hover:text-[#17643F]"
          >
            <ExternalLink className="w-4 h-4" />
            <span>View on website</span>
          </a>
          <ConfirmDelete
            action={removeProduct.bind(null, product.id, '/products')}
            title={`Delete “${product.name}”?`}
            description="The product is removed from the website straight away. This cannot be undone."
            triggerText="Delete"
            label={`Delete ${product.name}`}
            triggerClassName={dangerOutlineButton}
          />
        </div>
      </div>

      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-[#1a1a1a] break-words">{product.name}</h2>
        <p className="text-xs text-gray-500 mt-1">
          /{product.slug} &middot; Last updated {formatDateTime(product.updatedAt)}
        </p>
      </div>

      <ProductForm product={product} categories={categories} siteUrl={site} />
    </div>
  );
}
