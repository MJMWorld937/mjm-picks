// Erkennt eine ASIN in einer Amazon-URL oder als Rohwert.
// Wird im Adminbereich genutzt; bewusst ohne Netzwerkzugriff (kein Scraping).
const ASIN_RE = /^[A-Z0-9]{10}$/;

export function parseAsin(input: string): string | null {
  const raw = input.trim();
  if (ASIN_RE.test(raw.toUpperCase()) && /\d/.test(raw)) return raw.toUpperCase();
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return null;
  }
  if (!/(^|\.)amazon\.[a-z.]+$|(^|\.)amzn\.to$/.test(url.hostname)) return null;
  const patterns = [/\/dp\/([A-Z0-9]{10})/i, /\/gp\/product\/([A-Z0-9]{10})/i, /\/gp\/aw\/d\/([A-Z0-9]{10})/i];
  for (const re of patterns) {
    const m = url.pathname.match(re);
    if (m) return m[1].toUpperCase();
  }
  const q = url.searchParams.get('asin');
  if (q && ASIN_RE.test(q.toUpperCase())) return q.toUpperCase();
  return null;
}
