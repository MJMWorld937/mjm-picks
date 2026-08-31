import { useEffect, useMemo, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from './supabaseClient';
import { parseAsin } from '../../lib/asin';

// Markenzeichen: Haken im Sechseck. Erbt die Textfarbe.
function Zeichen({ className, title }: { className?: string; title?: string }) {
  return (
    <svg
      className={['zeichen', className].filter(Boolean).join(' ')}
      viewBox="0 0 32 32"
      fill="none"
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      <path d="M16 3 L27 9.5 V22.5 L16 29 L5 22.5 V9.5 Z" stroke="currentColor" strokeWidth="2.4" strokeLinejoin="round" />
      <path d="M11.5 16.5 L14.8 20 L21 12.5" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ---------- Typen (Admin arbeitet direkt auf DB-Zeilen) ----------
interface CategoryRow {
  id: string;
  slug: string;
  name: string;
}
interface ProductRow {
  id?: string;
  pick_no?: number;
  slug: string;
  asin: string | null;
  affiliate_url: string | null;
  title: string;
  brand: string;
  status: 'draft' | 'published' | 'archived';
  featured: boolean;
  sort_order: number;
  image_url: string | null;
  image_source: 'press' | 'own' | 'none' | 'api';
  image_license: string;
  updated_at?: string;
}
interface EditorialRow {
  summary: string;
  recommendation: string;
  suited_for: string;
  not_suited_for: string;
  pros: string[];
  cons: string[];
  verdict: string;
}

const emptyProduct: ProductRow = {
  slug: '',
  asin: null,
  affiliate_url: null,
  title: '',
  brand: '',
  status: 'draft',
  featured: false,
  sort_order: 0,
  image_url: null,
  image_source: 'none',
  image_license: '',
};
const emptyEditorial: EditorialRow = {
  summary: '',
  recommendation: '',
  suited_for: '',
  not_suited_for: '',
  pros: [],
  cons: [],
  verdict: '',
};

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

// ---------- UI-Bausteine ----------
const inputCls =
  'w-full rounded-lg border border-line bg-ink px-3 py-2 text-sm text-paper placeholder:text-faint focus:border-accent focus:outline-none';
const btnPrimary =
  'rounded-lg bg-paper px-4 py-2 text-sm font-semibold text-ink disabled:opacity-50';
const btnGhost = 'rounded-lg border border-line px-4 py-2 text-sm text-muted hover:text-paper';

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="meta mb-1 block">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-faint">{hint}</span>}
    </label>
  );
}

// ---------- Login ----------
function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError('Anmeldung fehlgeschlagen. E-Mail oder Passwort prüfen.');
    setBusy(false);
  }

  return (
    <form onSubmit={submit} className="mx-auto mt-24 w-full max-w-sm space-y-4">
      <h1 className="font-display text-2xl font-bold">
        Admin<Zeichen className="star star-anhang" />
      </h1>
      <Field label="E-Mail">
        <input className={inputCls} type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" required />
      </Field>
      <Field label="Passwort">
        <input className={inputCls} type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required />
      </Field>
      {error && <p className="text-sm text-red-400">{error}</p>}
      <button className={btnPrimary} disabled={busy}>{busy ? 'Anmelden …' : 'Anmelden'}</button>
    </form>
  );
}

// ---------- Produktformular ----------
function ProductForm({
  productId,
  categories,
  onDone,
}: {
  productId: string | null;
  categories: CategoryRow[];
  onDone: () => void;
}) {
  const [product, setProduct] = useState<ProductRow>(emptyProduct);
  const [editorial, setEditorial] = useState<EditorialRow>(emptyEditorial);
  const [selectedCats, setSelectedCats] = useState<string[]>([]);
  const [amazonInput, setAmazonInput] = useState('');
  const [slugTouched, setSlugTouched] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (!productId) return;
    (async () => {
      const { data: p } = await supabase.from('products').select('*').eq('id', productId).single();
      if (p) {
        setProduct(p);
        setSlugTouched(true);
        if (p.asin) setAmazonInput(p.asin);
      }
      const { data: e } = await supabase.from('product_editorial').select('*').eq('product_id', productId).maybeSingle();
      if (e) setEditorial({ ...emptyEditorial, ...e });
      const { data: pc } = await supabase.from('product_categories').select('category_id').eq('product_id', productId);
      setSelectedCats((pc ?? []).map((r) => r.category_id));
    })();
  }, [productId]);

  const detectedAsin = useMemo(() => parseAsin(amazonInput), [amazonInput]);

  // Spiegelt die Prüfung in lib/providers/amazon.ts: nur https und Amazon-eigene Hosts.
  const affiliateUrlValid = useMemo(() => {
    const raw = product.affiliate_url?.trim();
    if (!raw) return false;
    try {
      const url = new URL(raw);
      return url.protocol === 'https:' && /(^|\.)amazon\.[a-z.]+$|(^|\.)amzn\.to$|(^|\.)amzn\.eu$|(^|\.)link\.amazon$/i.test(url.hostname);
    } catch {
      return false;
    }
  }, [product.affiliate_url]);

  const affiliateUrlHasTag = useMemo(() => {
    const raw = product.affiliate_url?.trim();
    // Kurzlinks (link.amazon/…) tragen das Tag intern, dort ist kein tag= sichtbar.
    return !!raw && (/[?&]tag=/.test(raw) || /link\.amazon|amzn\.(to|eu)/i.test(raw));
  }, [product.affiliate_url]);

  function set<K extends keyof ProductRow>(key: K, value: ProductRow[K]) {
    setProduct((p) => ({ ...p, [key]: value }));
  }

  async function save() {
    setBusy(true);
    setMsg('');
    const row: ProductRow = {
      ...product,
      asin: detectedAsin ?? product.asin,
      slug: product.slug || slugify(product.title),
      image_url: product.image_url?.trim() || null,
      affiliate_url: product.affiliate_url?.trim() || null,
    };
    if (!row.title) {
      setMsg('Titel fehlt.');
      setBusy(false);
      return;
    }
    if (row.image_url && row.image_source === 'press' && !row.image_license.trim()) {
      setMsg('Pressebild ohne Lizenznachweis — bitte Quelle/Freigabe in „Bildlizenz" dokumentieren.');
      setBusy(false);
      return;
    }
    const { pick_no, updated_at, ...upsertRow } = row;
    const { data: saved, error } = await supabase
      .from('products')
      .upsert(upsertRow.id ? upsertRow : (({ id, ...r }) => r)(upsertRow))
      .select('id')
      .single();
    if (error || !saved) {
      setMsg(`Fehler beim Speichern: ${error?.message ?? 'unbekannt'}`);
      setBusy(false);
      return;
    }
    const pid = saved.id;
    const { error: e2 } = await supabase
      .from('product_editorial')
      .upsert({ product_id: pid, ...editorial });
    await supabase.from('product_categories').delete().eq('product_id', pid);
    if (selectedCats.length > 0) {
      await supabase
        .from('product_categories')
        .insert(selectedCats.map((cid) => ({ product_id: pid, category_id: cid })));
    }
    setBusy(false);
    if (e2) {
      setMsg(`Redaktionstexte: ${e2.message}`);
      return;
    }
    onDone();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-bold">
          {productId ? `Pick bearbeiten${product.pick_no ? ` (№${product.pick_no})` : ''}` : 'Neuer Pick'}
        </h2>
        <button className={btnGhost} onClick={onDone}>Zurück zur Liste</button>
      </div>

      <section className="space-y-4 rounded-2xl border border-line bg-coal p-5">
        <h3 className="meta">Amazon</h3>
        <Field label="Amazon-URL oder ASIN" hint={detectedAsin ? `Erkannte ASIN: ${detectedAsin}` : 'Produktlink von amazon.de einfügen — die ASIN wird automatisch erkannt.'}>
          <input className={inputCls} value={amazonInput} onChange={(e) => setAmazonInput(e.target.value)} placeholder="https://www.amazon.de/dp/…" />
        </Field>
        {detectedAsin && !affiliateUrlValid && (
          <p className="text-xs text-muted">
            Affiliate-Link-Vorschau: <code className="text-accent-soft">https://www.amazon.de/dp/{detectedAsin}?tag=…</code>
          </p>
        )}
        <Field
          label="Eigener PartnerNet-Link (optional)"
          hint="Fertigen Link aus dem PartnerNet (SiteStripe) einfügen — dann bleiben linkCode und linkId für die Amazon-Berichte erhalten. Leer lassen, wenn der Link oben automatisch gebaut werden soll."
        >
          <input
            className={inputCls}
            value={product.affiliate_url ?? ''}
            onChange={(e) => set('affiliate_url', e.target.value)}
            placeholder="https://www.amazon.de/dp/…?tag=mjmpicks-21&linkCode=ll2&linkId=…"
          />
        </Field>
        {product.affiliate_url?.trim() && (
          affiliateUrlValid ? (
            <p className="text-xs text-muted">
              {affiliateUrlHasTag
                ? 'Dieser Link wird verwendet.'
                : 'Dieser Link wird verwendet — Achtung: Er enthält kein tag=, dir wird dann keine Provision zugeordnet.'}
            </p>
          ) : (
            <p className="text-xs text-red-400">
              Kein gültiger Amazon-Link (nur https und Amazon-Domains). Solange er ungültig ist, wird der Link aus der ASIN gebaut.
            </p>
          )
        )}
      </section>

      <section className="space-y-4 rounded-2xl border border-line bg-coal p-5">
        <h3 className="meta">Produkt</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Titel">
            <input
              className={inputCls}
              value={product.title}
              onChange={(e) => {
                set('title', e.target.value);
                if (!slugTouched) set('slug', slugify(e.target.value));
              }}
            />
          </Field>
          <Field label="Marke">
            <input className={inputCls} value={product.brand} onChange={(e) => set('brand', e.target.value)} />
          </Field>
          <Field label="Slug (URL)" hint="Teil der Adresse: /produkt/[slug]">
            <input
              className={inputCls}
              value={product.slug}
              onChange={(e) => {
                setSlugTouched(true);
                set('slug', slugify(e.target.value));
              }}
            />
          </Field>
          <Field label="Sortierung" hint="Kleinere Zahl = weiter vorne">
            <input className={inputCls} type="number" value={product.sort_order} onChange={(e) => set('sort_order', Number(e.target.value))} />
          </Field>
        </div>
        <div className="flex flex-wrap gap-4">
          {categories.map((c) => (
            <label key={c.id} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={selectedCats.includes(c.id)}
                onChange={(e) =>
                  setSelectedCats((s) => (e.target.checked ? [...s, c.id] : s.filter((x) => x !== c.id)))
                }
              />
              {c.name}
            </label>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-6">
          <label className="flex items-center gap-2 text-sm">
            Status
            <select className={inputCls + ' w-auto'} value={product.status} onChange={(e) => set('status', e.target.value as ProductRow['status'])}>
              <option value="draft">Entwurf</option>
              <option value="published">Veröffentlicht</option>
              <option value="archived">Archiviert</option>
            </select>
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={product.featured} onChange={(e) => set('featured', e.target.checked)} />
            Top-Pick (hervorheben)
          </label>
        </div>
      </section>

      <section className="space-y-4 rounded-2xl border border-line bg-coal p-5">
        <h3 className="meta">Bild (optional)</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Bild-URL" hint="Nur Pressebilder mit Freigabe oder eigene Fotos — keine Amazon-Bilder!">
            <input className={inputCls} value={product.image_url ?? ''} onChange={(e) => set('image_url', e.target.value)} />
          </Field>
          <Field label="Bildquelle">
            <select className={inputCls} value={product.image_source} onChange={(e) => set('image_source', e.target.value as ProductRow['image_source'])}>
              <option value="none">Kein Bild</option>
              <option value="press">Hersteller-Pressebild</option>
              <option value="own">Eigenes Foto</option>
            </select>
          </Field>
        </div>
        {product.image_source === 'press' && (
          <Field label="Bildlizenz / Nachweis" hint="Woher stammt die Freigabe? (z. B. Presseportal-URL, Datum)">
            <input className={inputCls} value={product.image_license} onChange={(e) => set('image_license', e.target.value)} />
          </Field>
        )}
      </section>

      <section className="space-y-4 rounded-2xl border border-line bg-coal p-5">
        <h3 className="meta">Redaktion — dein Mehrwert</h3>
        <Field label="Kurzzusammenfassung" hint="1–2 Sätze, erscheint auf der Karte und als Meta-Description.">
          <textarea className={inputCls} rows={2} value={editorial.summary} onChange={(e) => setEditorial({ ...editorial, summary: e.target.value })} />
        </Field>
        <Field label="Warum ich es empfehle" hint="Absätze durch Leerzeile trennen.">
          <textarea className={inputCls} rows={6} value={editorial.recommendation} onChange={(e) => setEditorial({ ...editorial, recommendation: e.target.value })} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Passt zu dir, wenn …">
            <textarea className={inputCls} rows={3} value={editorial.suited_for} onChange={(e) => setEditorial({ ...editorial, suited_for: e.target.value })} />
          </Field>
          <Field label="Eher nichts für dich, wenn …">
            <textarea className={inputCls} rows={3} value={editorial.not_suited_for} onChange={(e) => setEditorial({ ...editorial, not_suited_for: e.target.value })} />
          </Field>
          <Field label="Stärken" hint="Eine pro Zeile.">
            <textarea className={inputCls} rows={4} value={editorial.pros.join('\n')} onChange={(e) => setEditorial({ ...editorial, pros: e.target.value.split('\n').filter(Boolean) })} />
          </Field>
          <Field label="Schwächen" hint="Eine pro Zeile — Ehrlichkeit ist das Konzept.">
            <textarea className={inputCls} rows={4} value={editorial.cons.join('\n')} onChange={(e) => setEditorial({ ...editorial, cons: e.target.value.split('\n').filter(Boolean) })} />
          </Field>
        </div>
        <Field label="Meine Einschätzung (Fazit)">
          <textarea className={inputCls} rows={3} value={editorial.verdict} onChange={(e) => setEditorial({ ...editorial, verdict: e.target.value })} />
        </Field>
      </section>

      {msg && <p className="text-sm text-amber-400">{msg}</p>}
      <div className="flex flex-wrap items-center gap-3">
        <button className={btnPrimary} onClick={save} disabled={busy}>
          {busy ? 'Speichern …' : 'Speichern'}
        </button>
        <button className={btnGhost} onClick={onDone}>Abbrechen</button>
        {productId && (
          <button
            className="ml-auto rounded-lg border border-red-900 px-4 py-2 text-sm text-red-400 hover:border-red-500 hover:text-red-300"
            disabled={busy}
            onClick={async () => {
              if (!window.confirm(`„${product.title}" endgültig löschen? Alle Texte gehen verloren — Archivieren ist die sanfte Alternative.`)) return;
              setBusy(true);
              const { error } = await supabase.from('products').delete().eq('id', productId);
              setBusy(false);
              if (error) setMsg(`Löschen fehlgeschlagen: ${error.message}`);
              else onDone();
            }}
          >
            Pick löschen
          </button>
        )}
      </div>
    </div>
  );
}

// ---------- Einstellungen ----------
function Settings({ onDone }: { onDone: () => void }) {
  const [tag, setTag] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'partner_tag')
      .single()
      .then(({ data }) => {
        if (typeof data?.value === 'string') setTag(data.value);
      });
  }, []);

  async function save() {
    setBusy(true);
    const { error } = await supabase
      .from('site_settings')
      .upsert({ key: 'partner_tag', value: tag.trim() });
    setMsg(error ? `Fehler: ${error.message}` : 'Gespeichert. Beim nächsten Rebuild tragen alle Links den Tag.');
    setBusy(false);
  }

  return (
    <div className="mx-auto max-w-md space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-bold">Einstellungen</h2>
        <button className={btnGhost} onClick={onDone}>Zurück</button>
      </div>
      <Field label="Amazon Partner-Tag" hint="Aus PartnerNet, z. B. mjmpicks-21. Leer lassen, solange das Konto noch nicht freigeschaltet ist.">
        <input className={inputCls} value={tag} onChange={(e) => setTag(e.target.value)} placeholder="mjmpicks-21" />
      </Field>
      {msg && <p className="text-sm text-muted">{msg}</p>}
      <button className={btnPrimary} onClick={save} disabled={busy}>Speichern</button>
    </div>
  );
}

// ---------- Liste + Rahmen ----------
export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  const [view, setView] = useState<{ name: 'list' } | { name: 'edit'; id: string | null } | { name: 'settings' }>({ name: 'list' });
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [rebuildMsg, setRebuildMsg] = useState('');

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  async function loadList() {
    const [{ data: p }, { data: c }] = await Promise.all([
      supabase.from('products').select('*').order('status').order('sort_order').order('pick_no', { ascending: false }),
      supabase.from('categories').select('id, slug, name').order('sort_order'),
    ]);
    setProducts((p ?? []) as ProductRow[]);
    setCategories((c ?? []) as CategoryRow[]);
  }
  useEffect(() => {
    if (session && view.name === 'list') loadList();
  }, [session, view]);

  async function triggerRebuild() {
    setRebuildMsg('Rebuild wird angestoßen …');
    const { error } = await supabase.functions.invoke('trigger-rebuild', { body: {} });
    setRebuildMsg(
      error
        ? 'Automatischer Trigger noch nicht eingerichtet — nutze den „Actions"-Link oben, dort „Deploy" → „Run workflow".'
        : 'Rebuild läuft! Die Änderungen sind in ~2 Minuten live.'
    );
  }

  if (!ready) return <p className="mt-24 text-center text-muted">Lade …</p>;
  if (!session) return <Login />;

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10">
      <header className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-bold">
          MJM Picks<Zeichen className="star star-anhang" /> <span className="text-muted">Admin</span>
        </h1>
        <div className="flex flex-wrap items-center gap-2">
          <a className={btnGhost} href="https://github.com/MJMWorld937/mjm-picks/actions" target="_blank" rel="noopener noreferrer">Actions ↗</a>
          <button className={btnGhost} onClick={() => setView({ name: 'settings' })}>Einstellungen</button>
          <button className={btnGhost} onClick={() => supabase.auth.signOut()}>Abmelden</button>
        </div>
      </header>

      {view.name === 'list' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <button className={btnPrimary} onClick={() => setView({ name: 'edit', id: null })}>+ Neuer Pick</button>
            <button className={btnGhost} onClick={triggerRebuild}>Website neu bauen</button>
          </div>
          {rebuildMsg && <p className="text-sm text-muted">{rebuildMsg}</p>}
          <ul className="divide-y divide-line rounded-2xl border border-line bg-coal">
            {products.map((p) => (
              <li key={p.id} className="flex items-center gap-3 px-4 py-3">
                <span className="meta w-14 shrink-0">№{String(p.pick_no).padStart(2, '0')}</span>
                <span className="grow truncate">{p.title || <em className="text-faint">ohne Titel</em>}</span>
                {p.featured && <Zeichen className="star" title="Top-Pick" />}
                <span
                  className={
                    'meta shrink-0 rounded-full border px-2 py-0.5 ' +
                    (p.status === 'published' ? 'border-green-700 text-green-400!' : p.status === 'draft' ? 'border-line' : 'border-line text-faint!')
                  }
                >
                  {p.status === 'published' ? 'Live' : p.status === 'draft' ? 'Entwurf' : 'Archiv'}
                </span>
                <button className={btnGhost + ' shrink-0'} onClick={() => setView({ name: 'edit', id: p.id! })}>
                  Bearbeiten
                </button>
              </li>
            ))}
            {products.length === 0 && <li className="px-4 py-6 text-sm text-muted">Noch keine Picks — leg den ersten an.</li>}
          </ul>
          <p className="text-xs text-faint">
            Nach dem Speichern erscheinen Änderungen erst nach einem Rebuild auf der Website
            (Button oben oder automatisch täglich um 05:00 UTC).
          </p>
        </div>
      )}

      {view.name === 'edit' && (
        <ProductForm productId={view.id} categories={categories} onDone={() => setView({ name: 'list' })} />
      )}
      {view.name === 'settings' && <Settings onDone={() => setView({ name: 'list' })} />}
    </div>
  );
}
