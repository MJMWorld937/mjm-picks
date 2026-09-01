// Filter für die Bereichsseiten. Die Werte kommen aus den technischen Datenblättern,
// die Gruppen sind bewusst nach Kaufentscheidung geschnitten, nicht nach Datenfeld:
// "Passt in mein Gehäuse" ist eine Frage, "Länge in Millimetern" ist eine Zahl.
import type { AffiliateProduct, ProductSpec } from './types';

export interface FilterOption {
  /** Kurzer Wert, landet als data-Attribut im Markup */
  id: string;
  label: string;
  /** Erklärt, was die Auswahl bedeutet — erscheint als Titel am Chip */
  hint?: string;
}

export interface FilterGroup {
  /** Schlüssel des data-Attributs, z. B. 'speicher' → data-f-speicher */
  key: string;
  label: string;
  options: FilterOption[];
  /** Bestimmt aus Produkt und Datenblatt, welche Optionen zutreffen. Mehrere sind erlaubt. */
  match: (product: AffiliateProduct, specs: Map<string, string>) => string[];
}

/** Erste Zahl aus einem Wert wie "289 (mit Slotblende 304)" oder "ab 550". */
const zahl = (wert: string | undefined): number | null => {
  if (!wert) return null;
  const m = wert.match(/\d+/);
  return m ? Number(m[0]) : null;
};

const grafikkarten: FilterGroup[] = [
  {
    key: 'klasse',
    label: 'Wofür',
    options: [
      { id: 'full-hd', label: 'Full HD', hint: 'Für 1920 × 1080 Pixel' },
      { id: 'wqhd', label: 'WQHD', hint: 'Für 2560 × 1440 Pixel' },
      { id: '4k', label: '4K', hint: 'Für 3840 × 2160 Pixel' },
    ],
    match: (p) => {
      const map: Record<string, string> = { 'Full HD': 'full-hd', WQHD: 'wqhd', '4K': '4k' };
      const treffer = p.rankingGroup ? map[p.rankingGroup] : null;
      return treffer ? [treffer] : [];
    },
  },
  {
    key: 'speicher',
    label: 'Speicher',
    options: [
      { id: '12', label: '12 GB' },
      { id: '16', label: '16 GB', hint: 'Reicht auch in ein paar Jahren noch' },
    ],
    match: (_p, s) => {
      const v = zahl(s.get('gpu_vram'));
      return v ? [String(v)] : [];
    },
  },
  {
    key: 'marke',
    label: 'Marke',
    options: [
      { id: 'amd', label: 'AMD' },
      { id: 'nvidia', label: 'NVIDIA' },
      { id: 'intel', label: 'Intel' },
    ],
    match: (_p, s) => {
      const chip = (s.get('gpu_chip') ?? '').toLowerCase();
      if (chip.includes('amd') || chip.includes('radeon')) return ['amd'];
      if (chip.includes('nvidia') || chip.includes('geforce')) return ['nvidia'];
      if (chip.includes('intel') || chip.includes('arc')) return ['intel'];
      return [];
    },
  },
  {
    key: 'baulaenge',
    label: 'Baulänge',
    options: [
      { id: 'kompakt', label: 'bis 250 mm', hint: 'Passt auch in kleine Gehäuse' },
      { id: 'mittel', label: 'bis 310 mm', hint: 'Passt in die meisten Midi-Tower' },
      { id: 'lang', label: 'über 310 mm', hint: 'Braucht ein großes Gehäuse' },
    ],
    // Die Angabe ohne Slotblende, das ist die Zahl, die Gehäusehersteller meinen.
    match: (_p, s) => {
      const mm = zahl(s.get('gpu_laenge'));
      if (mm === null) return [];
      if (mm <= 250) return ['kompakt', 'mittel'];
      if (mm <= 310) return ['mittel'];
      return ['lang'];
    },
  },
  {
    key: 'netzteil',
    label: 'Mein Netzteil',
    options: [
      { id: '550', label: 'ab 550 W' },
      { id: '650', label: 'ab 650 W' },
      { id: '750', label: '750 W und mehr' },
    ],
    // Wer ein 750-Watt-Netzteil hat, kann auch die sparsamen Karten betreiben —
    // deshalb trifft eine Karte auf alle Stufen ab ihrer Empfehlung zu.
    match: (_p, s) => {
      const w = zahl(s.get('gpu_netzteil'));
      if (w === null) return [];
      const stufen = [550, 650, 750];
      return stufen.filter((stufe) => w <= stufe).map(String);
    },
  },
];

const prozessoren: FilterGroup[] = [
  {
    key: 'klasse',
    label: 'Wofür',
    options: [
      { id: 'budget', label: 'Budget' },
      { id: 'allrounder', label: 'Allrounder' },
      { id: 'gaming', label: 'Gaming-Spitze' },
      { id: 'workstation', label: 'Workstation' },
    ],
    match: (p) => {
      const map: Record<string, string> = {
        Budget: 'budget',
        Allrounder: 'allrounder',
        'Gaming-Spitze': 'gaming',
        Workstation: 'workstation',
      };
      const treffer = p.rankingGroup ? map[p.rankingGroup] : null;
      return treffer ? [treffer] : [];
    },
  },
  {
    key: 'marke',
    label: 'Marke',
    options: [
      { id: 'amd', label: 'AMD' },
      { id: 'intel', label: 'Intel' },
    ],
    match: (p) => {
      const marke = (p.brand ?? '').toLowerCase();
      if (marke.includes('amd')) return ['amd'];
      if (marke.includes('intel')) return ['intel'];
      return [];
    },
  },
  {
    key: 'sockel',
    label: 'Sockel',
    options: [
      { id: 'am5', label: 'AM5', hint: 'AMD, Aufrüstpfad bis 2027/2028' },
      { id: 'lga1851', label: 'LGA 1851', hint: 'Intel, aktuelle Plattform' },
      { id: 'lga1700', label: 'LGA 1700', hint: 'Intel, erlaubt noch günstigen DDR4-Speicher' },
    ],
    match: (_p, s) => {
      const sockel = (s.get('cpu_sockel') ?? '').toLowerCase().replace(/\s+/g, '');
      if (sockel.includes('am5')) return ['am5'];
      if (sockel.includes('1851')) return ['lga1851'];
      if (sockel.includes('1700')) return ['lga1700'];
      return [];
    },
  },
  {
    key: 'grafik',
    label: 'Grafikeinheit',
    options: [
      { id: 'ja', label: 'eingebaut', hint: 'Läuft auch ohne Grafikkarte' },
      { id: 'nein', label: 'keine', hint: 'Braucht zwingend eine Grafikkarte' },
    ],
    match: (_p, s) => {
      const igpu = (s.get('cpu_igpu') ?? '').toLowerCase();
      if (!igpu) return [];
      return [igpu === 'keine' ? 'nein' : 'ja'];
    },
  },
];

const nachBereich: Record<string, FilterGroup[]> = {
  grafikkarten: grafikkarten,
  prozessoren: prozessoren,
};

export function filterGruppenFuer(categorySlug: string): FilterGroup[] {
  return nachBereich[categorySlug] ?? [];
}

/**
 * Baut die data-Attribute für ein Produkt. Leere Gruppen fallen weg,
 * damit ein Produkt ohne Datenblatt nicht fälschlich als Treffer zählt.
 */
export function filterAttribute(
  product: AffiliateProduct,
  alleSpecs: ProductSpec[],
  gruppen: FilterGroup[]
): Record<string, string> {
  const specs = new Map(
    alleSpecs.filter((s) => s.productId === product.id).map((s) => [s.key, s.value])
  );
  const attribute: Record<string, string> = {};
  for (const gruppe of gruppen) {
    const treffer = gruppe.match(product, specs);
    if (treffer.length > 0) attribute[`data-f-${gruppe.key}`] = treffer.join(' ');
  }
  return attribute;
}
