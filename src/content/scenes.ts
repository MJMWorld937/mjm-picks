// Setup-Explorer: Szenen + Hotspots.
// ERWEITERN: neue Szene = Bild nach src/assets/art/ + Eintrag hier; neuer Hotspot = eine Zeile.
// Koordinaten sind Prozent (x von links, y von oben) im Bild — ablesbar in jedem Bildbetrachter.
import type { ImageMetadata } from 'astro';
import deskArt from '../assets/art/setup-desk.png';
import pcArt from '../assets/art/setup-pc.png';

export interface SceneHotspot {
  id: string;
  label: string;
  /** Prozent von links */
  x: number;
  /** Prozent von oben */
  y: number;
  target:
    | { type: 'bereich'; slug: string }
    | { type: 'scene'; id: string };
}

export interface ExplorerScene {
  id: string;
  title: string;
  art: ImageMetadata;
  artAlt: string;
  /** Szene, zu der der Zurück-Button führt */
  backTo?: string;
  hotspots: SceneHotspot[];
}

export const scenes: ExplorerScene[] = [
  {
    id: 'desk',
    title: 'Das Setup',
    art: deskArt,
    artAlt: 'Gaming-Schreibtisch mit Ultrawide-Monitor, PC, Tastatur, Maus, Headset, Mikrofon und Lautsprechern',
    hotspots: [
      { id: 'monitor', label: 'Monitore', x: 50, y: 38, target: { type: 'bereich', slug: 'monitore' } },
      { id: 'pc', label: 'In den PC schauen', x: 88.5, y: 55, target: { type: 'scene', id: 'pc-innen' } },
      { id: 'tastatur', label: 'Tastaturen', x: 45.5, y: 85, target: { type: 'bereich', slug: 'tastaturen' } },
      { id: 'maus', label: 'Mäuse', x: 65, y: 85.5, target: { type: 'bereich', slug: 'maeuse' } },
      { id: 'headset', label: 'Headsets', x: 14, y: 68, target: { type: 'bereich', slug: 'headsets' } },
      { id: 'mikrofon', label: 'Mikrofone', x: 21.5, y: 46.5, target: { type: 'bereich', slug: 'mikrofone' } },
      { id: 'speaker', label: 'Lautsprecher', x: 28, y: 71.5, target: { type: 'bereich', slug: 'lautsprecher' } },
    ],
  },
  {
    id: 'pc-innen',
    title: 'Im PC',
    art: pcArt,
    artAlt: 'Geöffneter Gaming-PC mit Blick auf Grafikkarte, CPU-Kühler, RAM, Mainboard, Netzteil und Lüfter',
    backTo: 'desk',
    hotspots: [
      { id: 'gpu', label: 'Grafikkarten', x: 47.5, y: 53, target: { type: 'bereich', slug: 'grafikkarten' } },
      { id: 'kuehler', label: 'CPU-Kühler', x: 43.5, y: 31, target: { type: 'bereich', slug: 'cpu-kuehler' } },
      { id: 'cpu', label: 'Prozessoren', x: 46.5, y: 26, target: { type: 'bereich', slug: 'prozessoren' } },
      { id: 'ram', label: 'Arbeitsspeicher', x: 51.5, y: 32, target: { type: 'bereich', slug: 'arbeitsspeicher' } },
      { id: 'mainboard', label: 'Mainboards', x: 38, y: 65, target: { type: 'bereich', slug: 'mainboards' } },
      { id: 'ssd', label: 'SSDs & Speicher', x: 48.5, y: 64, target: { type: 'bereich', slug: 'ssds' } },
      { id: 'netzteil', label: 'Netzteile', x: 50, y: 82, target: { type: 'bereich', slug: 'netzteile' } },
      { id: 'gehaeuse', label: 'Gehäuse', x: 64, y: 12, target: { type: 'bereich', slug: 'gehaeuse' } },
    ],
  },
];
