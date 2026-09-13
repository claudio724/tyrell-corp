-- Limiti sulle tabelle a scrittura pubblica.
-- Da eseguire una volta nello SQL Editor di Supabase.
--
-- Contesto: `acquisitions` e `keepalive` hanno INSERT pubblico. Chiunque
-- conosca la publishable key (che sta nel sorgente della pagina, per
-- progetto) puo' scriverci senza passare dal form. I vincoli del browser
-- non contano nulla contro una richiesta costruita a mano: l'unico punto
-- in cui un limite e' davvero applicato e' il database.


-- ─────────────────────────────────────────────────────────────
-- 1. Verifica preliminare
-- ─────────────────────────────────────────────────────────────
-- Se questa query restituisce righe, i vincoli del passo 2 fallirebbero.
-- Correggi o elimina quelle righe prima di procedere.

select
  id,
  char_length(first_name)         as len_first_name,
  char_length(last_name)          as len_last_name,
  char_length(email)              as len_email,
  char_length(unit_requested)     as len_unit,
  char_length(deployment_context) as len_context
from public.acquisitions
where char_length(first_name) > 80
   or char_length(last_name) > 80
   or char_length(email) > 254
   or char_length(unit_requested) > 120
   or char_length(deployment_context) > 2000;


-- ─────────────────────────────────────────────────────────────
-- 2. Limiti di lunghezza su acquisitions
-- ─────────────────────────────────────────────────────────────
-- Impediscono che un singolo INSERT scriva megabyte nella tabella.
-- I valori NULL passano (char_length(null) e' null, non false), quindi
-- le righe gia' presenti con campi vuoti non vengono invalidate.

alter table public.acquisitions
  add constraint acquisitions_first_name_len
    check (char_length(first_name) <= 80),
  add constraint acquisitions_last_name_len
    check (char_length(last_name) <= 80),
  add constraint acquisitions_email_len
    check (char_length(email) <= 254),
  add constraint acquisitions_unit_len
    check (char_length(unit_requested) <= 120),
  add constraint acquisitions_context_len
    check (char_length(deployment_context) <= 2000);

-- Se il passo 1 segnala righe che vuoi conservare cosi' come sono,
-- aggiungi i vincoli con `not valid`: valgono solo da qui in avanti.
--   alter table public.acquisitions
--     add constraint acquisitions_context_len
--       check (char_length(deployment_context) <= 2000) not valid;


-- ─────────────────────────────────────────────────────────────
-- 3. Retention su keepalive
-- ─────────────────────────────────────────────────────────────
-- La tabella cresce di due righe al giorno per sempre, e la sua policy
-- di INSERT e' `with check (true)` per il ruolo anon: chiunque puo'
-- gonfiarla. Del heartbeat interessa solo che sia recente.

delete from public.keepalive
where pinged_at < now() - interval '30 days';

-- Per automatizzarlo, se hai l'estensione pg_cron attiva:
--   select cron.schedule(
--     'keepalive-retention', '0 4 * * *',
--     $$delete from public.keepalive where pinged_at < now() - interval '30 days'$$
--   );
