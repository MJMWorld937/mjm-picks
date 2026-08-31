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
      affiliateUrl: row.affiliate_url ?? null,
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
      specsSourceUrl: row.specs_source_url ?? null,
      specsSourceName: row.specs_source_name ?? null,
      specsCheckedAt: row.specs_checked_at ?? null,
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

// ---------- PICKS-Quellensystem: RLS liefert dem Anon-Key nur veröffentlichte Zeilen ----------
import type { CommunityPattern, PicksScore, ProductConflict, SourceItemPublic } from './types';

let sourceItemsCache: Promise<SourceItemPublic[]> | null = null;
export function getSourceItems(): Promise<SourceItemPublic[]> {
  sourceItemsCache ??= (async () => {
    const { data, error } = await supabase
      .from('source_items')
      .select('id, product_id, url, title, author_channel, published_at, content_type, sources(name, tier)')
      .order('published_at', { ascending: false });
    if (error) throw new Error(`source_items: ${error.message}`);
    return (data ?? []).map((r: any): SourceItemPublic => ({
      id: r.id,
      productId: r.product_id,
      url: r.url,
      title: r.title,
      authorChannel: r.author_channel,
      publishedAt: r.published_at,
      contentType: r.content_type,
      sourceName: r.sources?.name ?? '',
      sourceTier: r.sources?.tier ?? 'B',
    }));
  })();
  return sourceItemsCache;
}

let patternsCache: Promise<CommunityPattern[]> | null = null;
export function getCommunityPatterns(): Promise<CommunityPattern[]> {
  patternsCache ??= (async () => {
    const { data, error } = await supabase
      .from('community_patterns')
      .select('product_id, issue_type, positive, summary, severity, confidence');
    if (error) throw new Error(`community_patterns: ${error.message}`);
    return (data ?? []).map((r: any) => ({
      productId: r.product_id,
      issueType: r.issue_type,
      positive: r.positive,
      summary: r.summary,
      severity: r.severity,
      confidence: r.confidence,
    }));
  })();
  return patternsCache;
}

let conflictsCache: Promise<ProductConflict[]> | null = null;
export function getConflicts(): Promise<ProductConflict[]> {
  conflictsCache ??= (async () => {
    const { data, error } = await supabase
      .from('conflicts')
      .select('product_id, claim_category, side_a, side_b, explanation_candidates, note');
    if (error) throw new Error(`conflicts: ${error.message}`);
    return (data ?? []).map((r: any) => ({
      productId: r.product_id,
      claimCategory: r.claim_category,
      sideA: r.side_a,
      sideB: r.side_b,
      explanationCandidates: r.explanation_candidates ?? [],
      note: r.note,
    }));
  })();
  return conflictsCache;
}

let scoresCache: Promise<PicksScore[]> | null = null;
export function getPicksScores(): Promise<PicksScore[]> {
  scoresCache ??= (async () => {
    const { data, error } = await supabase.from('picks_scores').select('*');
    if (error) throw new Error(`picks_scores: ${error.message}`);
    return (data ?? []).map((r: any) => ({
      productId: r.product_id,
      p: Number(r.p), i: Number(r.i), c: Number(r.c), k: Number(r.k), s: Number(r.s),
      total: Number(r.total),
      confidencePct: Number(r.confidence_pct),
      methodologyVersion: r.methodology_version,
      rankingGroup: r.ranking_group,
      rankingPosition: r.ranking_position,
      rankingTotal: r.ranking_total,
    }));
  })();
  return scoresCache;
}

// ---------- Technische Datenblätter ----------
import type { ProductSpec, SpecField } from './types';

let specFieldsCache: Promise<SpecField[]> | null = null;
export function getSpecFields(): Promise<SpecField[]> {
  specFieldsCache ??= (async () => {
    const { data, error } = await supabase
      .from('spec_fields')
      .select('key, label, unit, hint, sort_order')
      .order('sort_order');
    if (error) throw new Error(`spec_fields: ${error.message}`);
    return (data ?? []).map((r: any): SpecField => ({
      key: r.key,
      label: r.label,
      unit: r.unit,
      hint: r.hint,
      sortOrder: r.sort_order,
    }));
  })();
  return specFieldsCache;
}

let specsCache: Promise<ProductSpec[]> | null = null;
export function getProductSpecs(): Promise<ProductSpec[]> {
  specsCache ??= (async () => {
    const { data, error } = await supabase
      .from('product_specs')
      .select('product_id, key, value, source_url, source_name');
    if (error) throw new Error(`product_specs: ${error.message}`);
    return (data ?? []).map((r: any): ProductSpec => ({
      productId: r.product_id,
      key: r.key,
      value: r.value,
      sourceUrl: r.source_url,
      sourceName: r.source_name,
    }));
  })();
  return specsCache;
}
