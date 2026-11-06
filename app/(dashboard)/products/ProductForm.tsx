'use client';

import { startTransition, useActionState, useId, useState } from 'react';
import Link from 'next/link';
import { AlertCircle, ImagePlus, Loader2, Star, X } from 'lucide-react';
import type { Category, Product } from '@/lib/api';
import { imageSrc } from '@/lib/format';
import { saveProduct, type ProductField, type ProductFormState } from '../../actions/products';
import ProductImage from '../../components/ProductImage';
import { card, inputClass, inputErrorClass, labelClass, primaryButton, secondaryButton } from '../../components/ui';

const MAX_IMAGES = 8;

// Images the website already serves, offered as suggestions in the image fields
const SITE_IMAGES = ['/images/home/fertilizers.jpeg', '/images/home/fungicides.jpeg', '/images/home/insecticides.jpeg'];

type ProductFormProps = {
  product?: Product;
  categories: Category[];
  siteUrl: string;
};

type ImageRow = { key: number; value: string };

function FieldError({ id, messages }: { id: string; messages?: string[] }) {
  if (!messages?.length) return null;
  return (
    <div id={id} className="mt-1.5 space-y-0.5">
      {messages.map((m) => (
        <p key={m} className="flex items-start gap-1.5 text-xs text-red-600">
          <AlertCircle className="w-3.5 h-3.5 mt-px flex-shrink-0" />
          {m}
        </p>
      ))}
    </div>
  );
}

function Toggle({
  checked,
  onChange,
  label,
  hint,
  icon,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  hint: string;
  icon?: React.ReactNode;
}) {
  const id = useId();
  return (
    <div className="flex items-start justify-between gap-4 py-3">
      <div className="min-w-0">
        <label htmlFor={id} className="flex items-center gap-1.5 text-sm font-medium text-[#1a1a1a] cursor-pointer">
          {icon}
          {label}
        </label>
        <p className="text-xs text-gray-500 mt-0.5">{hint}</p>
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#47A15E]/40 ${
          checked ? 'bg-[#47A15E]' : 'bg-gray-300'
        }`}
      >
        <span
          className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-5.5' : 'translate-x-0.5'}`}
        />
      </button>
    </div>
  );
}

/** Create / edit form shared by /products/new and /products/[id]/edit. */
export default function ProductForm({ product, categories, siteUrl }: ProductFormProps) {
  const [state, formAction, pending] = useActionState<ProductFormState, FormData>(
    saveProduct.bind(null, product?.id ?? null),
    {},
  );

  // Controlled fields: the values survive a failed submit untouched
  const [name, setName] = useState(product?.name ?? '');
  const [category, setCategory] = useState<string>(product?.category ?? '');
  const [size, setSize] = useState(product?.size ?? '');
  const [description, setDescription] = useState(product?.description ?? '');
  const [inStock, setInStock] = useState(product?.inStock ?? true);
  const [featured, setFeatured] = useState(product?.featured ?? false);
  const [images, setImages] = useState<ImageRow[]>(() =>
    (product?.images.length ? product.images : ['']).map((value, i) => ({ key: i, value })),
  );
  const [nextKey, setNextKey] = useState(images.length);

  const errors = state.fieldErrors ?? {};
  const err = (field: ProductField) => errors[field];
  const errorProps = (field: ProductField) =>
    err(field) ? { 'aria-invalid': true as const, 'aria-describedby': `${field}-error` } : {};

  const addImage = () => {
    if (images.length >= MAX_IMAGES) return;
    setImages([...images, { key: nextKey, value: '' }]);
    setNextKey(nextKey + 1);
  };
  const removeImage = (key: number) => setImages(images.length > 1 ? images.filter((r) => r.key !== key) : [{ key, value: '' }]);
  const setImage = (key: number, value: string) => setImages(images.map((r) => (r.key === key ? { ...r, value } : r)));

  // Submit without React's automatic form reset, so nothing is lost when the API rejects the data
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    startTransition(() => formAction(data));
  };

  return (
    <form action={formAction} onSubmit={onSubmit} noValidate className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_22rem] gap-5 lg:gap-6 items-start">
      <input type="hidden" name="inStock" value={String(inStock)} />
      <input type="hidden" name="featured" value={String(featured)} />

      {state.formError && (
        <p role="alert" className="xl:col-span-2 flex items-start gap-2 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          {state.formError}
        </p>
      )}

      <div className="space-y-5 min-w-0">
        <section className={`${card} p-4 sm:p-6 space-y-5`}>
          <h2 className="text-base font-bold text-[#1a1a1a]">Details</h2>

          <div>
            <label htmlFor="name" className={labelClass}>
              Name
            </label>
            <input
              id="name"
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`${inputClass} ${err('name') || err('slug') ? inputErrorClass : ''}`}
              placeholder="e.g. NPK 17-17-17"
              {...errorProps('name')}
            />
            <FieldError id="name-error" messages={[...(err('name') ?? []), ...(err('slug') ?? [])]} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label htmlFor="category" className={labelClass}>
                Category
              </label>
              <select
                id="category"
                name="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className={`${inputClass} ${err('category') ? inputErrorClass : ''}`}
                {...errorProps('category')}
              >
                <option value="" disabled>
                  Choose a category
                </option>
                {categories.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>
              <FieldError id="category-error" messages={err('category') && ['Choose a category']} />
            </div>

            <div>
              <label htmlFor="size" className={labelClass}>
                Size
              </label>
              <input
                id="size"
                name="size"
                value={size}
                onChange={(e) => setSize(e.target.value)}
                className={`${inputClass} ${err('size') ? inputErrorClass : ''}`}
                placeholder="e.g. 50kg, 1L, 500ml"
                {...errorProps('size')}
              />
              <FieldError id="size-error" messages={err('size')} />
            </div>
          </div>

          <div>
            <label htmlFor="description" className={labelClass}>
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={6}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={`${inputClass} resize-y min-h-32 ${err('description') ? inputErrorClass : ''}`}
              placeholder="What it is, how to use it, safety advice…"
              {...errorProps('description')}
            />
            <div className="flex justify-between gap-3">
              <FieldError id="description-error" messages={err('description')} />
              <p className="mt-1.5 ml-auto text-xs text-gray-400 whitespace-nowrap">{description.trim().length} characters (min 10)</p>
            </div>
          </div>
        </section>

        <section className={`${card} p-4 sm:p-6`}>
          <div className="flex flex-wrap items-baseline justify-between gap-2 mb-1">
            <h2 className="text-base font-bold text-[#1a1a1a]">Images</h2>
            <p className="text-xs text-gray-500">
              {images.filter((r) => r.value.trim()).length} of {MAX_IMAGES} max
            </p>
          </div>
          <p className="text-xs text-gray-500 mb-4">
            A website path like <code className="rounded bg-gray-100 px-1 py-0.5">/images/home/fertilizers.jpeg</code> or a full https URL.
            The first image is the main one.
          </p>

          <datalist id="site-images">
            {SITE_IMAGES.map((p) => (
              <option key={p} value={p} />
            ))}
          </datalist>

          <ul className="space-y-3">
            {images.map((row, i) => (
              <li key={row.key} className="flex items-center gap-3">
                <ProductImage
                  src={imageSrc(row.value, siteUrl)}
                  alt={row.value ? `Preview of image ${i + 1}` : ''}
                  className="w-14 h-14 rounded-md flex-shrink-0 border border-gray-200"
                />
                <div className="min-w-0 flex-1">
                  <label htmlFor={`image-${row.key}`} className="sr-only">
                    Image {i + 1}
                  </label>
                  <input
                    id={`image-${row.key}`}
                    name="images"
                    list="site-images"
                    value={row.value}
                    onChange={(e) => setImage(row.key, e.target.value)}
                    className={`${inputClass} ${err('images') ? inputErrorClass : ''}`}
                    placeholder={i === 0 ? '/images/home/fertilizers.jpeg' : 'Another image (optional)'}
                    {...errorProps('images')}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeImage(row.key)}
                  className="p-2 -mr-1 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 flex-shrink-0"
                  aria-label={`Remove image ${i + 1}`}
                  title="Remove"
                >
                  <X className="w-4 h-4" />
                </button>
              </li>
            ))}
          </ul>
          <FieldError id="images-error" messages={err('images')} />

          <button
            type="button"
            onClick={addImage}
            disabled={images.length >= MAX_IMAGES}
            className={`${secondaryButton} mt-4`}
          >
            <ImagePlus className="w-4 h-4" />
            Add image
          </button>
        </section>
      </div>

      <aside className="space-y-5 min-w-0 xl:sticky xl:top-24">
        <section className={`${card} px-4 sm:px-6 py-2 divide-y divide-gray-100`}>
          <Toggle
            checked={inStock}
            onChange={setInStock}
            label="In stock"
            hint={inStock ? 'Shown as available on the website.' : 'Shown as out of stock on the website.'}
          />
          <Toggle
            checked={featured}
            onChange={setFeatured}
            label="Featured"
            hint="Highlighted on the website's home page."
            icon={<Star className={`w-4 h-4 ${featured ? 'fill-[#F7C35F] text-[#F7C35F]' : 'text-gray-400'}`} />}
          />
        </section>

        <div className="flex flex-col-reverse sm:flex-row xl:flex-col-reverse gap-2.5">
          <Link href="/products" className={`${secondaryButton} sm:flex-1 xl:flex-none`}>
            Cancel
          </Link>
          <button type="submit" disabled={pending} className={`${primaryButton} sm:flex-1 xl:flex-none py-3`}>
            {pending && <Loader2 className="w-4 h-4 animate-spin" />}
            {pending ? 'Saving…' : product ? 'Save changes' : 'Create product'}
          </button>
        </div>
      </aside>
    </form>
  );
}
