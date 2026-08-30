import type { AffiliateOffer, AffiliateProduct } from '../types';

// Modus A: Link wird aus ASIN + Partner-Tag gebaut — transparent, kein Redirect.
// Modus B ergänzt später enrich() über die Creators API (Edge Function).

// Ein im Admin hinterlegter PartnerNet-Link (SiteStripe) hat Vorrang, damit dessen
// linkCode/linkId-Parameter für die Berichte im PartnerNet erhalten bleiben.
// Akzeptiert werden nur Amazon-eigene Hosts — sonst könnte ein Tippfehler die
// Kaufabsicht auf eine fremde Domain leiten.
const AMAZON_HOST = /(^|\.)amazon\.[a-z.]+$|(^|\.)amzn\.to$|(^|\.)amzn\.eu$|(^|\.)link\.amazon$/i;

function sanitizeAffiliateUrl(raw: string | null): string | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;
  try {
    const url = new URL(trimmed);
    if (url.protocol !== 'https:') return null;
    return AMAZON_HOST.test(url.hostname) ? url.toString() : null;
  } catch {
    return null;
  }
}

export function getAmazonOffer(product: AffiliateProduct, partnerTag: string): AffiliateOffer {
  const custom = sanitizeAffiliateUrl(product.affiliateUrl);
  if (custom) {
    return { url: custom, label: 'Bei Amazon ansehen', providerName: 'Amazon' };
  }
  if (!product.asin) {
    return { url: null, label: 'Amazon-Link folgt', providerName: 'Amazon' };
  }
  const tag = partnerTag ? `?tag=${encodeURIComponent(partnerTag)}` : '';
  return {
    url: `https://www.amazon.de/dp/${product.asin}${tag}`,
    label: 'Bei Amazon ansehen',
    providerName: 'Amazon',
  };
}
