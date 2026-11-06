import type { Metadata } from 'next';
import { getCategories } from '@/lib/api';
import { siteUrl } from '@/lib/config';
import BackLink from '../../../components/BackLink';
import ProductForm from '../ProductForm';

export const metadata: Metadata = { title: 'Add product' };

export default async function NewProductPage() {
  const categories = await getCategories();
  return (
    <div className="space-y-5">
      <BackLink href="/products">All products</BackLink>
      <ProductForm categories={categories} siteUrl={siteUrl()} />
    </div>
  );
}
