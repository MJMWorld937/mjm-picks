-- Bereiche-Hierarchie (angewendet 28.08.2026 via MCP "categories_hierarchy"):
-- Unterbereiche hängen an einer Eltern-Kategorie; Produkte werden in Eltern UND Kind eingetragen.
alter table public.categories
  add column parent_id uuid references public.categories(id) on delete set null;

insert into public.categories (slug, name, description, hue, sort_order, parent_id) values
  ('monitore', 'Monitore', 'Bildschirme fürs Setup — von Full-HD bis Ultrawide. Worauf es wirklich ankommt: Panel, Hertz, Ergonomie.', 'violet', 11, (select id from public.categories where slug = 'gaming')),
  ('tastaturen', 'Tastaturen', 'Mechanisch, leise oder kompakt — Tastaturen, die den Alltag und das Spiel besser machen.', 'violet', 12, (select id from public.categories where slug = 'gaming')),
  ('maeuse', 'Mäuse', 'Gaming- und Alltagsmäuse: Gewicht, Sensor, Form — die drei Dinge, die zählen.', 'violet', 13, (select id from public.categories where slug = 'gaming')),
  ('headsets', 'Headsets', 'Headsets und Kopfhörer fürs Setup — Klang, Mikrofon und Tragekomfort ehrlich eingeordnet.', 'violet', 14, (select id from public.categories where slug = 'gaming')),
  ('mikrofone', 'Mikrofone', 'Mikrofone für Discord, Streaming und Meetings — vom USB-Einstieg bis zum Boom-Arm-Setup.', 'violet', 15, (select id from public.categories where slug = 'gaming'));

insert into public.categories (slug, name, description, hue, sort_order, parent_id) values
  ('grafikkarten', 'Grafikkarten', 'Das Herz jedes Gaming-PCs — Grafikkarten nach Budget und Auflösung sortiert statt nach Hype.', 'cyan', 21, (select id from public.categories where slug = 'pc-hardware')),
  ('prozessoren', 'Prozessoren', 'CPUs für Gaming und Arbeit — wann sich mehr Kerne lohnen und wann nicht.', 'cyan', 22, (select id from public.categories where slug = 'pc-hardware')),
  ('cpu-kuehler', 'CPU-Kühler', 'Luft oder Wasser? Kühler, die leise sind und lange halten.', 'cyan', 23, (select id from public.categories where slug = 'pc-hardware')),
  ('arbeitsspeicher', 'Arbeitsspeicher', 'RAM ohne Mythen: Wie viel wirklich nötig ist und worauf man beim Kauf achtet.', 'cyan', 24, (select id from public.categories where slug = 'pc-hardware')),
  ('ssds', 'SSDs & Speicher', 'NVMe-SSDs und Speicherlösungen — das spürbarste Upgrade für fast jeden Rechner.', 'cyan', 25, (select id from public.categories where slug = 'pc-hardware')),
  ('netzteile', 'Netzteile', 'Das unterschätzteste Bauteil im PC — Effizienz, Lautstärke und ehrliche Watt-Empfehlungen.', 'cyan', 26, (select id from public.categories where slug = 'pc-hardware')),
  ('gehaeuse', 'Gehäuse', 'Airflow, Dämmung, Platz — Gehäuse, in denen Hardware gut aufgehoben ist.', 'cyan', 27, (select id from public.categories where slug = 'pc-hardware'));

insert into public.product_categories (product_id, category_id)
select p.id, c.id from public.products p, public.categories c
where p.slug = 'logitech-g-pro-x-superlight-2' and c.slug = 'maeuse'
on conflict do nothing;

insert into public.product_categories (product_id, category_id)
select p.id, c.id from public.products p, public.categories c
where p.slug = 'samsung-990-pro-2tb' and c.slug = 'ssds'
on conflict do nothing;
