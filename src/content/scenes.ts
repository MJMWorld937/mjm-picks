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
  /** Auf welcher Seite des Punkts das Label steht (Standard: right) */
  labelSide?: 'left' | 'right' | 'top' | 'bottom';
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
      { id: 'pc', label: 'In den PC schauen', x: 87.5, y: 57, labelSide: 'left', target: { type: 'scene', id: 'pc-innen' } },
      { id: 'tastatur', label: 'Tastaturen', x: 41, y: 87, target: { type: 'bereich', slug: 'tastaturen' } },
      { id: 'maus', label: 'Mäuse', x: 64.5, y: 88, target: { type: 'bereich', slug: 'maeuse' } },
      { id: 'headset', label: 'Headsets', x: 7.5, y: 69, labelSide: 'bottom', target: { type: 'bereich', slug: 'headsets' } },
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
      { id: 'gpu', label: 'Grafikkarten', x: 45, y: 54.5, target: { type: 'bereich', slug: 'grafikkarten' } },
      { id: 'kuehler', label: 'CPU-Kühler', x: 44.5, y: 31.5, labelSide: 'left', target: { type: 'bereich', slug: 'cpu-kuehler' } },
      { id: 'cpu', label: 'Prozessoren', x: 48.5, y: 41, labelSide: 'bottom', target: { type: 'bereich', slug: 'prozessoren' } },
      { id: 'ram', label: 'Arbeitsspeicher', x: 51.3, y: 32, target: { type: 'bereich', slug: 'arbeitsspeicher' } },
      { id: 'mainboard', label: 'Mainboards', x: 35, y: 65.5, labelSide: 'left', target: { type: 'bereich', slug: 'mainboards' } },
      { id: 'ssd', label: 'SSDs & Speicher', x: 44, y: 63, labelSide: 'right', target: { type: 'bereich', slug: 'ssds' } },
      { id: 'netzteil', label: 'Netzteile', x: 47.5, y: 78, target: { type: 'bereich', slug: 'netzteile' } },
      { id: 'gehaeuse', label: 'Gehäuse', x: 29, y: 12, target: { type: 'bereich', slug: 'gehaeuse' } },
    ],
  },
];
