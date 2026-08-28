# Deployment & Betrieb — MJM Picks

## Architektur in einem Satz

Astro baut die Website statisch aus Supabase-Daten; GitHub Actions deployt nach GitHub Pages;
IONOS hält nur die Domain (DNS). Besucher berühren weder Supabase noch Amazon-APIs.

## Einmalige Einrichtung (Stand nach Setup dokumentiert)

### 1. Supabase (Projekt `mjm-picks`, Ref `pmbubqfaiemixgimiiph`, Region eu-central-1)

- Schema + RLS liegen in `supabase/migrations/` und sind angewendet.
- **Admin-Benutzer anlegen (manuell, einmalig):** Dashboard → Authentication → Users →
  „Add user" → E-Mail `alex.mjm@proton.me` + Passwort, „Auto Confirm" aktivieren.
  Nur diese E-Mail hat Schreibrechte (Tabelle `admin_emails`).
- **Rebuild-Button aktivieren (optional, einmalig):** Dashboard → Edge Functions → Secrets →
  `GH_PAT` = Fine-grained GitHub-PAT (nur Repo `mjm-picks`, Permission „Contents: Read and write").
  Ohne Secret funktioniert stattdessen der „Actions ↗"-Link im Admin (Run workflow).

### 2. GitHub (Repo `MJMWorld937/mjm-picks`, öffentlich)

Actions-Variablen (Settings → Secrets and variables → Actions → Variables):

| Variable | Staging (vor Domain) | Produktion (mit Domain) |
|---|---|---|
| `PUBLIC_SUPABASE_URL` | `https://pmbubqfaiemixgimiiph.supabase.co` | gleich |
| `PUBLIC_SUPABASE_ANON_KEY` | Publishable Key | gleich |
| `PUBLIC_SITE_URL` | `https://mjmworld937.github.io` | `https://www.mjm-picks.de` |
| `PUBLIC_BASE_PATH` | `/mjm-picks` | *(Variable löschen oder leer)* |

Staging (github.io) setzt automatisch `noindex` — kein Duplicate Content.

### 3. Domain-Umzug auf mjm-picks.de (wenn Domain registriert)

1. GitHub: Repo → Settings → Pages → Custom domain: `www.mjm-picks.de` eintragen, „Enforce HTTPS" an.
2. IONOS-DNS für mjm-picks.de:
   - `www` → CNAME → `mjmworld937.github.io`
   - Apex (`@`) → A-Records → `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
3. Actions-Variablen auf Produktionswerte umstellen (Tabelle oben), einmal „Deploy" laufen lassen.

## Laufender Betrieb

- Inhalte pflegen: `/admin` → speichern → „Website neu bauen" (oder täglicher Auto-Rebuild 05:00 UTC).
- Der tägliche Rebuild hält außerdem das Supabase-Free-Projekt aktiv (pausiert sonst nach ~7 Tagen).
- Partner-Tag nach PartnerNet-Freischaltung im Admin unter „Einstellungen" eintragen → nächster Rebuild versieht alle Amazon-Links damit.

## Kosten

GitHub Pages 0 € · Supabase Free 0 € · Actions (public Repo) 0 € · Domain ~12–20 €/Jahr.
