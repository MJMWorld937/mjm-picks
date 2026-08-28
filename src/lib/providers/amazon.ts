import type { AffiliateOffer, AffiliateProduct } from '../types';

// Modus A: Link wird aus ASIN + Partner-Tag gebaut — transparent, kein Redirect.
// Modus B ergänzt später enrich() über die Creators API (Edge Function).
export function getAmazonOffer(product: AffiliateProduct, partnerTag: string): AffiliateOffer {
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
