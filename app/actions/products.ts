'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { ApiError, createProduct, deleteProduct, updateProduct, type ProductInput } from '@/lib/api';

export type ProductField = 'name' | 'category' | 'size' | 'description' | 'images' | 'inStock' | 'featured' | 'slug';

export type ProductFormState = {
  /** Validation messages per field, from the API. */
  fieldErrors?: Partial<Record<ProductField, string[]>>;
  /** Error not tied to one field (network, 404...). */
  formError?: string;
};

const FIELDS: ProductField[] = ['name', 'category', 'size', 'description', 'images', 'inStock', 'featured', 'slug'];

/** "images must contain at least 1 elements" / "each value in images must be..." -> images */
function fieldOf(message: string): ProductField | undefined {
  const first = message.split(' ')[0].split('.')[0];
  if ((FIELDS as string[]).includes(first)) return first as ProductField;
  return FIELDS.find((f) => new RegExp(`\\b${f}\\b`).test(message));
}

/** Make the API's messages read well under a form field. */
function humanize(message: string): string {
  const text = message
    .replace(/^each value in /, '')
    .replace(/^images\.\d+ /, 'image ')
    .replace('must contain at least 1 elements', 'needs at least one image')
    .replace('must be longer than or equal to', 'must be at least')
    .replace('must be shorter than or equal to', 'must be at most');
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function readInput(formData: FormData): ProductInput {
  return {
    name: String(formData.get('name') ?? '').trim(),
    category: String(formData.get('category') ?? ''),
    size: String(formData.get('size') ?? '').trim(),
    description: String(formData.get('description') ?? '').trim(),
    images: formData
      .getAll('images')
      .map((v) => String(v).trim())
      .filter(Boolean),
    inStock: formData.get('inStock') === 'true',
    featured: formData.get('featured') === 'true',
  };
}

function toState(error: unknown): ProductFormState {
  if (!(error instanceof ApiError)) throw error; // redirects and unexpected errors propagate
  if (error.status === 400) {
    const fieldErrors: ProductFormState['fieldErrors'] = {};
    const other: string[] = [];
    for (const message of error.messages) {
      const field = fieldOf(message);
      if (field) (fieldErrors[field] ??= []).push(humanize(message));
      else other.push(message);
    }
    return { fieldErrors, formError: other.length ? other.join(' ') : 'Please fix the highlighted fields.' };
  }
  if (error.status === 409) {
    return {
      fieldErrors: { name: ['A product with this name (web address) already exists. Choose another name.'] },
      formError: 'Please fix the highlighted fields.',
    };
  }
  if (error.status === 404) return { formError: 'This product no longer exists.' };
  return { formError: error.message || 'Something went wrong. Please try again.' };
}

/** Create (no id) or update a product. Used with useActionState by the product form. */
export async function saveProduct(
  id: string | null,
  _prev: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  const input = readInput(formData);
  try {
    if (id) await updateProduct(id, input);
    else await createProduct(input);
  } catch (error) {
    return toState(error);
  }
  revalidatePath('/', 'layout');
  redirect(`/products?notice=${id ? 'updated' : 'created'}`);
}

export async function removeProduct(id: string, returnTo: string) {
  try {
    await deleteProduct(id);
  } catch (error) {
    // Already gone: treat as deleted
    if (!(error instanceof ApiError && error.status === 404)) throw error;
  }
  revalidatePath('/', 'layout');
  const target = returnTo.startsWith('/products') ? returnTo : '/products';
  redirect(`${target}${target.includes('?') ? '&' : '?'}notice=deleted`);
}
