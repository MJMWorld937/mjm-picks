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
      { id: 'monitor', label: 'Monitore', x: 43, y: 34, target: { type: 'bereich', slug: 'monitore' } },
      { id: 'pc', label: 'In den PC schauen', x: 87.5, y: 57, target: { type: 'scene', id: 'pc-innen' } },
      { id: 'tastatur', label: 'Tastaturen', x: 41, y: 87, target: { type: 'bereich', slug: 'tastaturen' } },
      { id: 'maus', label: 'Mäuse', x: 64.5, y: 88, target: { type: 'bereich', slug: 'maeuse' } },
      { id: 'headset', label: 'Headsets', x: 7.5, y: 69, target: { type: 'bereich', slug: 'headsets' } },
      { id: 'mikrofon', label: 'Mikrofone', x: 15, y: 42, target: { type: 'bereich', slug: 'mikrofone' } },
      { id: 'speaker', label: 'Lautsprecher', x: 20.5, y: 71.5, target: { type: 'bereich', slug: 'lautsprecher' } },
    ],
  },
  {
    id: 'pc-innen',
    title: 'Im PC',
    art: pcArt,
    artAlt: 'Geöffneter Gaming-PC mit Blick auf Grafikkarte, CPU-Kühler, RAM, Mainboard, Netzteil und Lüfter',
    backTo: 'desk',
    hotspots: [
      { id: 'gpu', label: 'Grafikkarten', x: 46.5, y: 53, target: { type: 'bereich', slug: 'grafikkarten' } },
      { id: 'kuehler', label: 'CPU-Kühler', x: 44, y: 28.5, target: { type: 'bereich', slug: 'cpu-kuehler' } },
      { id: 'cpu', label: 'Prozessoren', x: 48, y: 34, target: { type: 'bereich', slug: 'prozessoren' } },
      { id: 'ram', label: 'Arbeitsspeicher', x: 52.8, y: 29.5, target: { type: 'bereich', slug: 'arbeitsspeicher' } },
      { id: 'mainboard', label: 'Mainboards', x: 39, y: 63, target: { type: 'bereich', slug: 'mainboards' } },
      { id: 'ssd', label: 'SSDs & Speicher', x: 45, y: 61.5, target: { type: 'bereich', slug: 'ssds' } },
      { id: 'netzteil', label: 'Netzteile', x: 47.5, y: 74.5, target: { type: 'bereich', slug: 'netzteile' } },
      { id: 'gehaeuse', label: 'Gehäuse', x: 50, y: 9.5, target: { type: 'bereich', slug: 'gehaeuse' } },
    ],
  },
];
