// Higgsfield-Brand-Artwork (generiert 28.08.2026, Cinema Studio 2.5, markenfrei).
// Neue Kategorie ohne Artwork fällt automatisch auf den Farbverlauf zurück.
import type { ImageMetadata } from 'astro';
import hero from '../assets/art/hero.png';
import gaming from '../assets/art/gaming.png';
import pcHardware from '../assets/art/pc-hardware.png';
import smartHome from '../assets/art/smart-home.png';
import technik from '../assets/art/technik.png';

export const heroArt = hero;

const byCategory: Record<string, ImageMetadata> = {
  gaming,
  'pc-hardware': pcHardware,
  'smart-home': smartHome,
  technik,
};

export function categoryArt(slug?: string): ImageMetadata | null {
  return slug ? (byCategory[slug] ?? null) : null;
}
