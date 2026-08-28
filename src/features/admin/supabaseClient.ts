import { createClient } from '@supabase/supabase-js';

// Publishable Key — bewusst im Client. Schreibrechte vergibt ausschließlich RLS
// (admin_emails-Tabelle serverseitig), nicht dieser Schlüssel.
export const supabase = createClient(
  import.meta.env.PUBLIC_SUPABASE_URL,
  import.meta.env.PUBLIC_SUPABASE_ANON_KEY
);
