# Tyrell Corporation

> _"More Human Than Human™"_

![Vercel](https://img.shields.io/badge/deploy-Vercel-black?logo=vercel)
![Supabase](https://img.shields.io/badge/database-Supabase-3ECF8E?logo=supabase)
![HTML](https://img.shields.io/badge/stack-HTML%20%2B%20CSS%20%2B%20JS-f0b429)
![GitHub](https://img.shields.io/badge/repo-GitHub-181717?logo=github)

Progetto finale del corso **Vibe Coding for Design 2026 di NID**.  
Landing page di una società fittizia che produce e vende androidi — ispirata all'universo di **Blade Runner**.

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
- **Animazioni scroll** con IntersectionObserver
- **Design responsive** con griglia CSS adattiva

---

## Stack Tecnologico

| Layer      | Tecnologia                          | Note                             |
| ---------- | ------------------------------------ | --------------------------------- |
| Frontend   | HTML5 + CSS3 + JS vanilla           | Zero dipendenze, zero build step |
| Font       | Orbitron, Share Tech Mono, Rajdhani | Google Fonts                     |
| Database   | Supabase (PostgreSQL)               | REST API, Row Level Security     |
| Hosting    | Vercel                              | Deploy automatico da GitHub push |
| Versioning | Git + GitHub                        | Repository pubblico              |

---

## Architettura

```
tyrell-corp/
├── .github/
│   └── workflows/
│       └── keep-alive.yml   ← ping periodico per evitare la pausa Supabase
├── index.html       ← tutta la pagina (HTML + CSS + JS in un unico file)
├── images/          ← immagini AI degli androidi
│   ├── rachael.jpg
│   ├── roy.jpg
│   ├── pris.jpg
│   ├── k.jpg
│   ├── luci.jpg
│   └── leon.jpg
└── README.md
```

La scelta di un **singolo file HTML** è intenzionale: nessun bundler, nessuna dipendenza, deploy immediato su qualsiasi hosting statico.

---

## Database Supabase

Due tabelle in PostgreSQL con Row Level Security abilitata:

### `androids`

Contiene i dati di tutti gli androidi del catalogo. Lettura pubblica abilitata.

| Colonna        | Tipo | Descrizione                      |
| -------------- | ---- | --------------------------------- |
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

Raccoglie le richieste di acquisto inviate dal form. Solo scrittura pubblica.

| Colonna            | Tipo      | Descrizione         |
| ------------------- | --------- | -------------------- |
| id                 | UUID      | Chiave primaria     |
| first_name         | TEXT      | Nome richiedente    |
| last_name          | TEXT      | Cognome richiedente |
| email              | TEXT      | Email corporativa   |
| unit_requested     | TEXT      | Modello richiesto   |
| deployment_context | TEXT      | Contesto operativo  |
| created_at         | TIMESTAMP | Data richiesta      |

---

## Il Catalogo — Nexus Series

| Modello | Nome    | Ruolo                     | Disponibilità |
| ------- | ------- | -------------------------- | -------------- |
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

## Keep-Alive Supabase

Il piano free di Supabase metterà automaticamente **in pausa** il progetto dopo 7 giorni senza attività (e, se la pausa si prolunga troppo, può arrivare alla sospensione). Per evitarlo, il repo include un workflow GitHub Actions che esegue una query di lettura sulla tabella `androids` ogni 3 giorni, mantenendo il progetto attivo.

**File:** `.github/workflows/keep-alive.yml`

```yaml
name: Keep Supabase Alive

on:
  schedule:
    - cron: '0 3 */3 * *' # ogni 3 giorni, alle 03:00 UTC
  workflow_dispatch:

jobs:
  ping-supabase:
    runs-on: ubuntu-latest
    steps:
      - name: Ping androids table
        run: |
          curl -s -o /dev/null -w "%{http_code}" \
            "${{ secrets.SUPABASE_PROJECT_URL }}/rest/v1/androids?select=id&limit=1" \
            -H "apikey: ${{ secrets.SUPABASE_PUBLISHABLE_KEY }}" \
            -H "Authorization: Bearer ${{ secrets.SUPABASE_PUBLISHABLE_KEY }}"
```

**Secrets richiesti** (Settings → Secrets and variables → Actions del repo):

| Secret                    | Valore                                                                 |
| -------------------------- | ----------------------------------------------------------------------- |
| `SUPABASE_PROJECT_URL`     | Project URL (Project Settings → Integrations → Data API)              |
| `SUPABASE_PUBLISHABLE_KEY` | Publishable key (Project Settings → API Keys) — **mai** la Secret key |

**Se il progetto va in pausa comunque:** dashboard Supabase → progetto → pulsante **"Restore project"**. I dati restano intatti; dopo il restore conviene verificare che il deploy su Vercel risponda ancora (redeploy se necessario).

**Nota:** se il repo resta senza commit per 60+ giorni, GitHub può disabilitare i workflow schedulati — in tal caso basta rilanciarlo manualmente una volta da **Actions → Keep Supabase Alive → Run workflow**.

---

## Scelte Progettuali

**Perché HTML vanilla?**  
Per un progetto di corso è la scelta più trasparente — ogni riga di codice è visibile e comprensibile senza conoscere framework o toolchain. Facilita anche il deploy: basta un file su qualsiasi hosting statico.

**Perché Supabase?**  
Offre una REST API immediata senza scrivere un backend. Con la Publishable Key e le RLS policies è possibile esporre le chiamate API direttamente nel frontend in modo sicuro.

**Perché le immagini in locale?**  
Le immagini degli androidi sono generate da AI (copiate da Pinterest) e salvate nella cartella `images/`. In una versione futura potrebbero essere caricate su Supabase Storage e referenziate tramite URL pubblico.

---

_© 2049 Tyrell Corporation. All replicants reserved._  
_Progetto didattico — Vibe Coding for Design 2026 di NID_
