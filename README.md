# Tyrell Corporation — Landing Page

> *More Human Than Human™*

Landing page sci-fi neo-noir per il corso di Vibe Coding.  
Stack: HTML5 + CSS3 + JavaScript vanilla. Zero dipendenze, zero build step.

---

## Struttura del progetto

```
tyrell-corp/
├── index.html          ← tutta la pagina (HTML + CSS + JS inline)
├── images/             ← cartella per le immagini degli androidi (da popolare)
│   ├── rachael.jpg
│   ├── roy.jpg
│   ├── pris.jpg
│   ├── k.jpg
│   ├── luci.jpg
│   └── leon.jpg
└── README.md
```

---

## Aggiungere le immagini

Nel file `index.html`, nel array `androids` (cerca `const androids = [`),  
ogni oggetto ha un campo `image: null`. Sostituisci con il path relativo:

```js
{
  id: "NX-7-RACHAEL",
  name: "Rachael",
  image: "images/rachael.jpg",   // ← qui
  ...
}
```

Crea la cartella `images/` nella root del progetto e mettici i file.

---

## Deploy su Vercel via GitHub

### 1. Crea il repo su GitHub

```bash
cd tyrell-corp
git init
git add .
git commit -m "feat: initial Tyrell Corp landing page"
git branch -M main
git remote add origin https://github.com/TUO-USERNAME/tyrell-corp.git
git push -u origin main
```

### 2. Deploy su Vercel

1. Vai su [vercel.com](https://vercel.com) → **Add New Project**
2. Importa il repo GitHub `tyrell-corp`
3. Vercel lo rileva come progetto statico → **Deploy** (nessuna config necessaria)
4. Il sito è live. Ogni `git push` → deploy automatico.

---

## Aggiunta Supabase (opzionale, fase 2)

Per collegare i dati degli androidi a un database:

1. Crea progetto su [supabase.com](https://supabase.com)
2. Crea tabella `androids` con colonne: `id, name, series, tagline, purpose, price, availability, image_url`
3. Sostituisci l'array statico `androids` con una fetch alla Supabase REST API:

```js
const res = await fetch('https://TUO-PROJECT.supabase.co/rest/v1/androids', {
  headers: { 'apikey': 'TUA-ANON-KEY' }
});
const androids = await res.json();
```

---

## Androidi presenti

| ID | Nome | Serie | Ruolo | Disponibilità |
|---|---|---|---|---|
| NX-7-RACHAEL | Rachael | NX-7 | Executive Assistant | Limited |
| NX-8-ROY | Roy | NX-8 | Combat / Security | Classified |
| NX-8-PRIS | Pris | NX-8 | Domestic / Social | Available |
| NX-9-K | K | NX-9 | Field Operations | Limited |
| NX-9-LUCI | Luci | NX-9 | Scientific Research | Available |
| NX-6-LEON | Leon | NX-6 | Manual Labour | Available |

---

*© 2049 Tyrell Corporation. All replicants reserved.*
