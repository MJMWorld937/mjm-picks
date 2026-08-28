# MJM Picks ✳

Handverlesene Tech-Empfehlungen — kuratiertes Amazon-Affiliate-Portal (deutsch).

- **Stack:** Astro 5 (statisch) · Tailwind 4 · React-Insel für den Admin · Supabase (Postgres, Auth, Edge Functions)
- **Hosting:** GitHub Pages · Domain/DNS: IONOS
- **Betrieb & Setup:** [docs/DEPLOY.md](docs/DEPLOY.md)
- **Amazon-Regeln:** [docs/AMAZON-COMPLIANCE.md](docs/AMAZON-COMPLIANCE.md)

## Entwicklung

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # statischer Build nach dist/
```

Benötigt `.env` (siehe `.env.example`). Inhalte werden zur Build-Zeit aus Supabase gelesen —
Besucher der fertigen Seite erzeugen keinerlei Datenbank- oder API-Aufrufe.
