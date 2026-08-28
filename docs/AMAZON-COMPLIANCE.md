# Amazon-/Affiliate-Compliance — Checkliste

Grundlage: PartnerNet-Teilnahmebedingungen + EU-IP-Lizenz (Stand 28.08.2026,
`partnernet.amazon.de/help/operating/license`).

## Immer gültig (Modus A, seit Start)

- [x] Offenlegung „Als Amazon-Partner verdiene ich an qualifizierten Verkäufen." im Footer jeder Seite + `/affiliate-hinweis`
- [x] Jeder Amazon-CTA trägt „Anzeige · Bezahlter Link" + `rel="sponsored"`
- [x] Links direkt zu `amazon.de/dp/ASIN?tag=…` — kein Cloaking, keine Redirects
- [x] **Keine Amazon-Produktbilder** (Affiliate-Link ≠ Bildlizenz; Bilder erst über die Creators API)
- [x] Keine Preisanzeige — CTA „Aktuellen Preis bei Amazon prüfen"
- [x] Kein „Test"-Vokabular ohne echten Test (Hinweis auf jeder Produktseite)
- [x] Produktbilder nur: Hersteller-Pressebild (mit dokumentierter Freigabe in `image_license`) oder eigenes Foto
- [x] ASINs dauerhaft gespeichert (erlaubt), sonst keine Amazon-Daten

## Nach PartnerNet-Freischaltung

- [ ] Partner-Tag im Admin eintragen (Einstellungen)
- [ ] 3 qualifizierte Verkäufe innerhalb 180 Tagen (sonst Kontoschließung; Neubewerbung möglich)

## Bei Creators-API-Zugang (Modus B; erst ab 10 qualifizierten Verkäufen/30 Tage)

- [ ] Nur Login-with-Amazon-OAuth (v3.0-Credentials aus PartnerNet → Tools → Content-Creator-API)
- [ ] Credentials NUR als Supabase-Secrets, nie im Repo/Client
- [ ] Produktdaten-Cache ≤ 24 h (`amazon_cache.expires_at` + täglicher Rebuild)
- [ ] Bilder ausschließlich als Amazon-Bild-URLs hotlinken, ≤ 24 h Refresh
- [ ] Attribution in den Footer aufnehmen: „CERTAIN CONTENT THAT APPEARS ON THIS WEBSITE COMES FROM AMAZON EUROPE CORE S.à r.l. THIS CONTENT IS PROVIDED 'AS IS' AND IS SUBJECT TO CHANGE OR REMOVAL AT ANY TIME."
- [ ] Falls Preise angezeigt werden: Zeitstempel + Pflicht-Disclaimer („Produktpreise und Verfügbarkeit sind zum angegebenen Datum/zur angegebenen Uhrzeit zutreffend und können sich jederzeit ändern.")
