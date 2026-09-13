-- Limiti sulle tabelle a scrittura pubblica.
--
-- STATO: sezioni 1, 2 e 2b applicate al database il 13/09/2026.
--        La sezione 3 non e' stata eseguita: al momento non c'era nulla da
--        cancellare (31 righe in keepalive, nessuna oltre i 30 giorni).
--        Non rilanciare le sezioni 2 e 2b: darebbero `constraint already
--        exists`. Restano qui come documentazione dei vincoli attivi.
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
   or char_length(deployment_context) > 2000
   or email is null
   or btrim(email) = '';


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


-- ─────────────────────────────────────────────────────────────
-- 2b. L'email deve esserci
-- ─────────────────────────────────────────────────────────────
-- Una richiesta di acquisto senza email e' inservibile: non c'e' modo di
-- rispondere. Il `required` aggiunto al form vale solo per chi passa dal
-- browser; una richiesta costruita a mano contro l'API lo ignora, ed e'
-- cosi' che erano entrate le righe vuote ripulite a mano il 13/09/2026.
--
-- `btrim(...) <> ''` oltre a `is not null` perche' il form manda
-- `.value.trim()`: un campo mai compilato arriva come stringa vuota, non
-- come null. Un vincolo sul solo null non fermerebbe nulla.
--
-- Il contesto operativo resta facoltativo, per scelta.

alter table public.acquisitions
  add constraint acquisitions_email_presente
    check (email is not null and btrim(email) <> '');

-- Volendo si puo' pretendere anche nome e cognome, che il form ora
-- richiede allo stesso modo:
--   add constraint acquisitions_nome_presente
--     check (btrim(first_name) <> '' and btrim(last_name) <> '');

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
--
-- Attenzione a non scambiare questa pulizia per una difesa: contro
-- un'inondazione non serve, perche' interverrebbe trenta giorni dopo. E'
-- manutenzione. Il vettore si chiuderebbe solo togliendo l'INSERT
-- pubblico, cosa che richiede di far autenticare il workflow di
-- keep-alive con una chiave di servizio invece della publishable key —
-- valutato il 13/09/2026 e rimandato: mettere una `service_role` key nei
-- secret del repo e' un rischio maggiore del danno che evita (oggi il
-- peggio e' una tabella di timestamp riempita da un estraneo).

delete from public.keepalive
where pinged_at < now() - interval '30 days';

-- Per automatizzarlo, se hai l'estensione pg_cron attiva:
--   select cron.schedule(
--     'keepalive-retention', '0 4 * * *',
--     $$delete from public.keepalive where pinged_at < now() - interval '30 days'$$
--   );
