export const BRAND = 'MJM Picks';
export const DISCLOSURE = 'Als Amazon-Partner verdiene ich an qualifizierten Verkäufen.';

/** Interner Link unter Berücksichtigung des Base-Pfads (Staging läuft unter /mjm-picks/). */
export function href(path: string): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  return `${base}${path.startsWith('/') ? path : `/${path}`}`;
}
