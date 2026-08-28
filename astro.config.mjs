// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// Produktion: https://www.mjm-picks.de (Root). Staging vor DNS-Umstellung:
// PUBLIC_SITE_URL=https://mjmworld937.github.io, PUBLIC_BASE_PATH=/mjm-picks
const site = process.env.PUBLIC_SITE_URL || 'https://www.mjm-picks.de';
const base = process.env.PUBLIC_BASE_PATH || '/';

export default defineConfig({
  site,
  base,
  trailingSlash: 'ignore',
  integrations: [react(), sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
});
