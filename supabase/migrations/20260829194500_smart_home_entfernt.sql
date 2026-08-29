-- Datenänderung (29.08.2026, via MCP execute_sql): Smart Home vorerst entfernt.
-- Alex braucht den Bereich aktuell nicht; Rückweg dokumentiert.
update public.products set status = 'archived' where slug = 'philips-hue-white-color-starter-set';
delete from public.categories where slug = 'smart-home';

-- REAKTIVIEREN (falls später gewünscht):
-- insert into public.categories (slug, name, description, hue, sort_order) values
--   ('smart-home', 'Smart Home', 'Vernetzte Technik, die wirklich Alltag vereinfacht statt App-Frust zu erzeugen.', 'green', 3);
-- update public.products set status = 'published' where slug = 'philips-hue-white-color-starter-set';
-- insert into public.product_categories (product_id, category_id)
--   select p.id, c.id from public.products p, public.categories c
--   where p.slug = 'philips-hue-white-color-starter-set' and c.slug = 'smart-home';
