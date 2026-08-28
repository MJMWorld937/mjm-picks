// Build-Time-Datenzugriff: läuft ausschließlich beim `astro build`,
// Besucher lösen nie Datenbank- oder API-Aufrufe aus.
import { createClient } from '@supabase/supabase-js';
import type { AffiliateProduct, Category, EditorialContent } from './types';

const url = import.meta.env.PUBLIC_SUPABASE_URL;
const key = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;
if (!url || !key) {
  throw new Error('PUBLIC_SUPABASE_URL / PUBLIC_SUPABASE_ANON_KEY fehlen (.env bzw. Actions-Variablen).');
}
const supabase = createClient(url, key);

const emptyEditorial: EditorialContent = {
  summary: '',
  recommendation: '',
  suited_for: '',
  not_suited_for: '',
  pros: [],
  cons: [],
  verdict: '',
};

let categoriesCache: Promise<Category[]> | null = null;
export function getCategories(): Promise<Category[]> {
  categoriesCache ??= (async () => {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('sort_order');
    if (error) throw new Error(`categories: ${error.message}`);
    return (data ?? []) as Category[];
  })();
  return categoriesCache;
}

let productsCache: Promise<AffiliateProduct[]> | null = null;
export function getPublishedProducts(): Promise<AffiliateProduct[]> {
  productsCache ??= (async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*, product_editorial!product_id(*), product_categories(categories(*))')
      .eq('status', 'published')
      .order('sort_order')
      .order('pick_no', { ascending: false });
    if (error) throw new Error(`products: ${error.message}`);
    return (data ?? []).map((row: any): AffiliateProduct => ({
      id: row.id,
      pickNo: row.pick_no,
      slug: row.slug,
      title: row.title,
      brand: row.brand,
      asin: row.asin,
      featured: row.featured,
      sortOrder: row.sort_order,
      source: row.source,
      imageUrl: row.image_url,
      imageSource: row.image_source,
      categories: (row.product_categories ?? [])
        .map((pc: any) => pc.categories)
        .filter(Boolean)
        .sort((a: Category, b: Category) => a.sort_order - b.sort_order),
      editorial: { ...emptyEditorial, ...(row.product_editorial ?? {}) },
    }));
  })();
  return productsCache;
}

let settingsCache: Promise<Record<string, unknown>> | null = null;
export function getSettings(): Promise<Record<string, unknown>> {
  settingsCache ??= (async () => {
    const { data, error } = await supabase.from('site_settings').select('key, value');
    if (error) throw new Error(`site_settings: ${error.message}`);
    return Object.fromEntries((data ?? []).map((r) => [r.key, r.value]));
  })();
  return settingsCache;
}

export async function getPartnerTag(): Promise<string> {
  const settings = await getSettings();
  return typeof settings.partner_tag === 'string' ? settings.partner_tag : '';
}
