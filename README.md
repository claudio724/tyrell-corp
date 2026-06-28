# Tyrell Corporation

> _"More Human Than Human™"_

![Vercel](https://img.shields.io/badge/deploy-Vercel-black?logo=vercel)
![Supabase](https://img.shields.io/badge/database-Supabase-3ECF8E?logo=supabase)
![HTML](https://img.shields.io/badge/stack-HTML%20%2B%20CSS%20%2B%20JS-f0b429)
![GitHub](https://img.shields.io/badge/repo-GitHub-181717?logo=github)

Progetto finale del corso **Vibe Coding for Design 2026**.  
Landing page di una società che produce e vende androidi — ispirata all'universo di **Blade Runner**.

🔗 **Live:** [tyrell-corp.vercel.app](https://tyrell-corp.vercel.app)  
📁 **Repo:** [github.com/claudio724/tyrell-corp](https://github.com/claudio724/tyrell-corp)

---

## Il Concept

La **Tyrell Corporation** è la megacorporation immaginaria di Blade Runner, responsabile della creazione dei replicanti Nexus. L'idea era costruire una landing page che sembrasse il sito ufficiale di questa azienda — un catalogo di prodotti distopico, elegante e inquietante allo stesso tempo.

L'estetica scelta è **neo-noir industriale**: palette scura con accenti oro/ambra, font futuristici, animazione pioggia sullo sfondo, overlay scanline che ricordano i vecchi monitor CRT. Ogni dettaglio è pensato per evocare Los Angeles 2049.

---

## Funzionalità

- **Hero animato** con pioggia procedurale (Canvas API) e animazioni di ingresso sfalsate
- **Ticker scorrevole** con annunci corporate in stile borsa valori
- **Catalogo androidi** dinamico — dati caricati da database Supabase
- **Schede prodotto** con specifiche tecniche, badge disponibilità e immagini AI
- **Form di acquisizione** funzionante — le richieste vengono salvate nel database
- **Dashboard amministrativa protetta** — consultazione delle richieste riservata a utenti autenticati
- **Animazioni scroll** con IntersectionObserver
- **Design responsive** con griglia CSS adattiva

---

## Stack Tecnologico

| Layer          | Tecnologia                          | Note                             |
| -------------- | ----------------------------------- | -------------------------------- |
| Frontend       | HTML5 + CSS3 + JS vanilla           | Zero dipendenze, zero build step |
| Font           | Orbitron, Share Tech Mono, Rajdhani | Google Fonts                     |
| Database       | Supabase (PostgreSQL)               | REST API, Row Level Security     |
| Autenticazione | Supabase Auth                       | Email + password, sessioni JWT   |
| Hosting        | Vercel                              | Deploy automatico da GitHub push |
| Versioning     | Git + GitHub                        | Repository pubblico              |

---

## Architettura

```
tyrell-corp/
├── index.html       ← landing page pubblica (HTML + CSS + JS)
├── admin.html       ← dashboard protetta — richiede login
├── images/          ← immagini AI degli androidi
│   ├── rachael.jpg
│   ├── roy.jpg
│   ├── pris.jpg
│   ├── k.jpg
│   ├── luci.jpg
│   └── leon.jpg
└── README.md
```

La scelta di file HTML singoli per ogni pagina è intenzionale: nessun bundler, nessuna dipendenza, deploy immediato su qualsiasi hosting statico.

---

## Database Supabase

Due tabelle in PostgreSQL con Row Level Security abilitata:

### `androids`

Contiene i dati di tutti gli androidi del catalogo. **Lettura pubblica** abilitata (il catalogo è visibile a chiunque visiti il sito).

| Colonna        | Tipo | Descrizione                      |
| -------------- | ---- | -------------------------------- |
| id             | UUID | Chiave primaria                  |
| series         | TEXT | Es. "NX-9 Series"                |
| name           | TEXT | Nome dell'androide               |
| tagline        | TEXT | Frase descrittiva                |
| spec_cognitive | TEXT | Classe cognitiva                 |
| spec_strength  | TEXT | Moltiplicatore forza             |
| spec_lifespan  | TEXT | Durata operativa                 |
| price          | TEXT | Prezzo di listino                |
| availability   | TEXT | available / limited / classified |
| image_url      | TEXT | Path dell'immagine               |

### `acquisitions`

Raccoglie le richieste di acquisto inviate dal form.

| Colonna            | Tipo      | Descrizione         |
| ------------------ | --------- | ------------------- |
| id                 | UUID      | Chiave primaria     |
| first_name         | TEXT      | Nome richiedente    |
| last_name          | TEXT      | Cognome richiedente |
| email              | TEXT      | Email corporativa   |
| unit_requested     | TEXT      | Modello richiesto   |
| deployment_context | TEXT      | Contesto operativo  |
| created_at         | TIMESTAMP | Data richiesta      |

**Permessi:**

- **Scrittura (`INSERT`)**: pubblica — chiunque può inviare il form dal sito
- **Lettura (`SELECT`)**: riservata agli **utenti autenticati** — solo chi ha effettuato login può consultare le richieste

---

## Autenticazione & Dashboard Admin

Il pulsante **"Admin"** nel menu di navigazione apre un modale di login. Il flusso è gestito interamente da **Supabase Auth**:

1. L'utente inserisce email e password nel modale su `index.html`
2. Supabase verifica le credenziali e, se corrette, restituisce un token di sessione (JWT)
3. L'utente viene reindirizzato a `admin.html`
4. `admin.html` controlla la presenza di una sessione valida (`auth guard`) — in assenza di login, reindirizza automaticamente a `index.html`
5. Tutte le richieste alla tabella `acquisitions` vengono effettuate includendo il token di sessione, che il database verifica tramite la policy RLS `auth.role() = 'authenticated'`
6. Un bottone **Logout** in `admin.html` chiude la sessione

Questo significa che i dati sensibili (nomi, email, richieste) **non sono leggibili** da chi non possiede credenziali valide, anche conoscendo l'URL diretto della dashboard o leggendo il codice sorgente della pagina.

### Dashboard — funzionalità

- Contatori totali e per modello androide, cliccabili come filtri rapidi
- Tabella ordinabile per nome, email, unità richiesta, data
- Ricerca testuale su nome ed email
- Refresh manuale dei dati

---

## Il Catalogo — Nexus Series

| Modello | Nome    | Ruolo                     | Disponibilità |
| ------- | ------- | ------------------------- | ------------- |
| NX-7    | Rachael | Executive Assistant       | Limited       |
| NX-8    | Roy     | Combat / Security         | Classified    |
| NX-8    | Pris    | Domestic / Social         | Available     |
| NX-9    | K       | Field Operations          | Limited       |
| NX-9    | Luci    | Scientific Research       | Available     |
| NX-6    | Leon    | Manual Labour / Off-World | Available     |

---

## Deploy

Il progetto usa un workflow **Git → GitHub → Vercel**:

```bash
# Prima volta
git init && git add . && git commit -m "feat: initial commit"
git remote add origin https://github.com/claudio724/tyrell-corp.git
git push -u origin main

# Aggiornamenti successivi
git add . && git commit -m "descrizione" && git push
```

Vercel rileva automaticamente ogni push su `main` e fa il redeploy in ~30 secondi.

---

## Scelte Progettuali

**Perché HTML vanilla?**  
Per un progetto di corso è la scelta più trasparente — ogni riga di codice è visibile e comprensibile senza conoscere framework o toolchain. Facilita anche il deploy: basta un file su qualsiasi hosting statico.

**Perché Supabase?**  
Offre una REST API immediata senza scrivere un backend, oltre a un sistema di autenticazione già pronto (Supabase Auth). Con la Publishable Key, le RLS policies e i token di sessione è possibile costruire un'applicazione sicura interamente lato frontend, senza un server proprietario.

**Perché proteggere solo `acquisitions` e non `androids`?**  
Il catalogo è contenuto pubblicitario, deve essere visibile a chiunque visiti il sito. Le richieste del form contengono invece dati personali (nomi, email, messaggi) di persone reali — vanno protette da accessi non autorizzati, anche se il sito è ospitato pubblicamente.

**Perché le immagini in locale?**  
Le immagini degli androidi sono generate con AI e salvate nella cartella `images/`. In una versione futura potrebbero essere caricate su Supabase Storage e referenziate tramite URL pubblico.

---

## Possibili Sviluppi Futuri

- Autenticazione a due fattori (MFA) per l'account amministrativo
- Notifiche email automatiche alla ricezione di una nuova richiesta (Supabase Edge Functions)
- Stock in tempo reale degli androidi con Supabase Realtime
- Gestione stato delle richieste (pending / approved / rejected) dalla dashboard

---

_© 2049 Tyrell Corporation. All replicants reserved._  
_Progetto didattico — Vibe Coding for Design 2026_
