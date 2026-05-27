# Wen Chen (陈稳) — Personal Academic Homepage

A bilingual (English / 中文) academic homepage in a clean two-column style,
built as a static site — just HTML, CSS, and vanilla JavaScript. No build step,
no framework, no dependencies.

```
.
├── index.html               # page shell + SEO meta + JSON-LD
├── 404.html                 # branded not-found page
├── site.webmanifest         # PWA manifest / icons
├── .nojekyll                # tells GitHub Pages to serve /assets as-is
├── assets/
│   ├── css/site.css         # all styling (design system)
│   ├── js/content.js        # ← ALL your content lives here (edit this)
│   ├── js/app.js            # renderer + language toggle + interactions
│   └── img/                 # photos, logo, paper/project thumbnails
└── deploy.sh                # one-shot publish helper (optional)
```

---

## 1. Preview locally

Open `index.html` directly in a browser, or serve it:

```bash
cd this-folder
python3 -m http.server 8000
# then visit http://localhost:8000
```

Click **EN / 中** (top-right) to switch languages. The choice is remembered.

---

## 2. Publish to GitHub Pages  →  https://wayneusc.github.io

Your username is **WayneUSC**, so a *user site* repo named
**`WayneUSC.github.io`** will be served at the root URL `https://wayneusc.github.io`.

> Anything that needs your password / GitHub login must be done by you — the
> steps below are the exact commands; run them in this folder.

### Option A — command line (recommended)

1. On GitHub, create a **new, empty** repository named exactly
   `WayneUSC.github.io` (no README, no .gitignore).
2. In this folder, run:

   ```bash
   ./deploy.sh
   ```

   (or do it manually:)

   ```bash
   git init
   git add -A
   git commit -m "Launch bilingual homepage"
   git branch -M main
   git remote add origin https://github.com/WayneUSC/WayneUSC.github.io.git
   git push -u origin main
   ```
3. On GitHub: **Settings → Pages → Build and deployment → Source = "Deploy from a
   branch"**, Branch = `main` / `/ (root)`, Save.
4. Wait ~1 minute, then open **https://wayneusc.github.io**.

### Option B — drag & drop (no terminal)

1. Create the empty `WayneUSC.github.io` repo on GitHub.
2. **Add file → Upload files**, drag in everything from this folder
   (keep the folder structure — upload the `assets` folder too, and the hidden
   `.nojekyll` file).
3. Commit, then enable Pages as in step 3 above.

---

## 3. Editing the site later

Almost everything you'd want to change is in **`assets/js/content.js`**, written
as `{ en: "...", zh: "..." }` pairs. Edit the text, save, refresh. For example,
to add a publication, copy one block in the `publications` array and change the
fields; to add news, add a line to the `news` array.

**Swap in a real photo:** the sidebar avatar currently uses your WAYNE logo.
Replace `assets/img/avatar.jpg` with a square headshot (≈560×560 px, same
filename) and it appears automatically.

**Add your CV:** drop a `cv.pdf` in the root and the footer/links can point to it.

---

## 4. Please double-check these details

A few things were inferred from your files — verify before sharing widely:

- **Solar-cell paper (RSC Advances).** The PDF is dated **2014** (DOI
  `10.1039/C4RA11155A`) with authors *Zhou, Zhang, Bao, Tao, Sun, W. Chen*.
  Your summary report listed it as 2024 — confirm the **year** and that the
  "W. Chen" is **you**. (Currently shown as 2014.)
- **ISPRS IJGI DOI** (`10.3390/ijgi13090331`) was reconstructed from the volume/
  article numbers — click it once to confirm it resolves.
- **Digital-heritage review (IEEE T-CSS)** has **no link** yet — add the DOI when
  the issue is paginated.
- **Bilibili link** points to a search for "腓尼基城邦23号". Replace it with your
  exact channel URL in `content.js → profile.links`.
- The **AIoT MLLM** work is shown as a *project* (it had no venue/PDF). If it’s
  formally published, move it into the `publications` array.
- Canonical URL/meta assume `https://wayneusc.github.io`. If you use a custom
  domain or a project repo, update the `<link rel="canonical">` and `og:url` in
  `index.html`.

The site was designed as a static GitHub Pages homepage, so future edits can stay
lightweight and transparent.
