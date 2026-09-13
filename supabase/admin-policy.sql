-- Restringe la lettura di `acquisitions` a un singolo account.
-- Applicato il 2026-09-13. Qui per riferimento: e' la forma finale della
-- policy, utile per ricrearla o per capire com'e' fatta senza aprire la
-- dashboard.
--
-- Prima era:
--   using ( auth.role() = 'authenticated'::text )
--
-- `auth.role()` vale 'authenticated' per QUALUNQUE utente autenticato, non
-- per l'amministratore. Con la registrazione pubblica aperta (com'era fino
-- a oggi) bastava che un estraneo si registrasse e confermasse la propria
-- email per leggere nomi ed email di tutte le richieste. Ora la condizione
-- guarda l'identita' dell'utente, non il suo ruolo: regge anche se un
-- domani la registrazione venisse riaperta, o se venissero abilitati gli
-- accessi anonimi (che rilasciano anch'essi un token `authenticated`).

alter policy "Authenticated read acquisitions"
  on public.acquisitions
  using ( auth.uid()::text = '7f30f2d6-6a33-4d84-bddc-e4dc16d8b76c' );

-- Note sulla forma:
--
-- `::text` su entrambi i lati evita l'errore 42883 (`operator does not
-- exist: text = uuid`) a seconda del tipo restituito da auth.uid().
--
-- Target roles resta `public` e va bene: per un visitatore anonimo
-- auth.uid() e' null, e `null = '7f30...'` non e' vero, quindi non passa.
-- La condizione basta da sola.
--
-- La policy di INSERT non e' toccata: `alter policy` cambia solo questa,
-- e il form pubblico continua a funzionare.


-- ─────────────────────────────────────────────────────────────
-- Verifica
-- ─────────────────────────────────────────────────────────────

select policyname, cmd, roles, qual
from pg_policies
where schemaname = 'public' and tablename = 'acquisitions'
order by cmd, policyname;

-- Attese due righe: questa policy di SELECT e la INSERT pubblica.


-- ─────────────────────────────────────────────────────────────
-- Se un domani servisse un secondo amministratore
-- ─────────────────────────────────────────────────────────────
--   using ( auth.uid()::text in (
--     '7f30f2d6-6a33-4d84-bddc-e4dc16d8b76c',
--     '<altro-uid>'
--   ) );
--
-- Oltre i due o tre account conviene una tabella `admins` con RLS propria:
--   using ( exists (select 1 from admins where user_id = auth.uid()) )
