-- Tabella di heartbeat per il workflow "Keep Supabase Alive".
-- Il ping precedente faceva solo una SELECT su `androids`: rispondeva 200
-- ma Supabase continuava a segnalare il progetto come inattivo (email
-- "is going to be paused" ricevute più volte anche con i ping attivi).
-- Una scrittura reale viene invece registrata in modo affidabile come attività.

create table if not exists public.keepalive (
  id bigint generated always as identity primary key,
  pinged_at timestamptz not null default now()
);

alter table public.keepalive enable row level security;

create policy "public can insert keepalive pings"
  on public.keepalive
  for insert
  to anon
  with check (true);
