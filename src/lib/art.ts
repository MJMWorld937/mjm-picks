// Higgsfield-Brand-Artwork (generiert 28./29.08.2026, Cinema Studio 2.5, markenfrei).
// Neue Kategorie ohne Artwork fällt automatisch auf den Farbverlauf zurück.
import type { ImageMetadata } from 'astro';
import hero from '../assets/art/hero.png';
import gaming from '../assets/art/gaming.png';
import pcHardware from '../assets/art/pc-hardware.png';
import smartHome from '../assets/art/smart-home.png';
import technik from '../assets/art/technik.png';
import monitore from '../assets/art/monitore.png';
import tastaturen from '../assets/art/tastaturen.png';
import maeuse from '../assets/art/maeuse.png';
import headsets from '../assets/art/headsets.png';
import mikrofone from '../assets/art/mikrofone.png';
import lautsprecher from '../assets/art/lautsprecher.png';
import grafikkarten from '../assets/art/grafikkarten.png';
import prozessoren from '../assets/art/prozessoren.png';
import cpuKuehler from '../assets/art/cpu-kuehler.png';
import arbeitsspeicher from '../assets/art/arbeitsspeicher.png';
import ssds from '../assets/art/ssds.png';
import netzteile from '../assets/art/netzteile.png';
import gehaeuse from '../assets/art/gehaeuse.png';
import mainboards from '../assets/art/mainboards.png';

export const heroArt = hero;

const byCategory: Record<string, ImageMetadata> = {
  gaming,
  'pc-hardware': pcHardware,
  'smart-home': smartHome,
  technik,
  monitore,
  tastaturen,
  maeuse,
  headsets,
  mikrofone,
  lautsprecher,
  grafikkarten,
  prozessoren,
  'cpu-kuehler': cpuKuehler,
  arbeitsspeicher,
  ssds,
  netzteile,
  gehaeuse,
  mainboards,
};

export function categoryArt(slug?: string): ImageMetadata | null {
  return slug ? (byCategory[slug] ?? null) : null;
}
