// Stößt den GitHub-Actions-Build an (repository_dispatch).
// Zugriff: nur eingeloggte Admins (Prüfung über public.is_admin() / RLS-Identität).
// Benötigtes Secret: GH_PAT (Fine-grained PAT, nur Repo mjm-picks, nur Contents:read+write? → Actions-Dispatch braucht "Contents: read & write" ODER klassisches repo-Scope; Details in docs/DEPLOY.md)
import { createClient } from 'jsr:@supabase/supabase-js@2';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method !== 'POST') return new Response('method not allowed', { status: 405, headers: cors });

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    { global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } } }
  );
  const { data: isAdmin, error } = await supabase.rpc('is_admin');
  if (error || isAdmin !== true) {
    return new Response(JSON.stringify({ error: 'forbidden' }), {
      status: 403,
      headers: { ...cors, 'Content-Type': 'application/json' },
    });
  }

  const pat = Deno.env.get('GH_PAT');
  if (!pat) {
    return new Response(JSON.stringify({ error: 'GH_PAT secret fehlt (Supabase → Edge Functions → Secrets)' }), {
      status: 500,
      headers: { ...cors, 'Content-Type': 'application/json' },
    });
  }

  const res = await fetch('https://api.github.com/repos/MJMWorld937/mjm-picks/dispatches', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${pat}`,
      Accept: 'application/vnd.github+json',
      'User-Agent': 'mjm-picks-admin',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ event_type: 'rebuild' }),
  });

  if (res.status !== 204) {
    const body = await res.text();
    return new Response(JSON.stringify({ error: `GitHub: ${res.status}`, detail: body.slice(0, 300) }), {
      status: 502,
      headers: { ...cors, 'Content-Type': 'application/json' },
    });
  }
  return new Response(JSON.stringify({ ok: true }), {
    headers: { ...cors, 'Content-Type': 'application/json' },
  });
});
