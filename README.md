# Wen Chen — bilingual academic homepage

Live at https://wayneusc.github.io/. Static HTML, CSS and vanilla JavaScript, served by GitHub Pages from `main`. No dependencies, framework or build step.

## September 2026 redesign

An editorial research portfolio organized around dynamic tactile sensing, embodied human–robot interaction and multimodal systems. The live-text signature uses **Great Vibes**, also used on Xinyi Fu's homepage. A locally hosted subset for “Wayne Chen” avoids a Google Fonts network dependency; its SIL Open Font License is included in `assets/fonts/OFL.txt`.

The home page features POIROT, ShakeSort and bio-inspired tactile sensing, with all ten projects available in the expandable project archive. Three relevant papers appear initially; all eight original publication records remain available. English and Chinese content, publication selection, citation copying, contact links and the POIROT browser demo are retained or supported. A standalone research profile supports printing or saving as PDF in either language.

## Edit and preview

- `assets/js/content.js`: bilingual records and presentation copy (`SITE.design`). Stable project IDs and curated summaries are at the bottom. Display overrides are intentional; edit them when updating the underlying record.
- `assets/js/app.js`: homepage rendering and interactions.
- `assets/css/site.css`: layout, typography, responsive and print styles.
- `index.html`: page shell, canonical URL, existing social preview metadata and structured data.
- `research-profile.html` and `assets/js/profile.js`: printable research summary using the same content source. This is a research profile, not a replacement for a complete CV.
- `poirot/`: existing English and Chinese detective-game demos; unchanged by this redesign.

Run `python3 -m http.server 8000` in this directory and open http://localhost:8000/. The homepage remembers an explicit language choice and otherwise follows the browser language. The profile accepts `?lang=en` or `?lang=zh`.

GitHub Pages continues to serve the repository root. Preserve `.nojekyll`, asset paths, and the existing project routes. Social preview images are preserved.

## Backup and rollback

The complete version before the redesign is preserved at:

- Branch: `codex/backup-before-redesign-2026-09-08`
- Original commit: `1a14c072737b180fff5be852002b661b1a3deb05`

A source ZIP and a Git bundle with history were also saved outside the checkout. The backup branch should remain unchanged.

For a complete return to the original site without rewriting Git history, make a new branch from current `main`, run `git restore --source=codex/backup-before-redesign-2026-09-08 --staged --worktree .`, inspect the changes, and commit them. This restores the saved source tree, including removing newly added tracked files, while retaining the history of the redesign. Merge that restoration into `main` to publish it. Preserve any later work you want to retain before restoring the entire tree.

## Content maintenance notes

- Add an approved CV file and a real link if a full CV is available. No missing CV download is advertised.
- The owner confirmed on September 8, 2026 that the 2014 RSC Advances paper is his work. It remains in the full publication list as part of his materials research background; the topical selection focuses on HRI, CoG, and IUI Companion.
- Planned tactile-mapping research stays labeled as planned. Platform and bio-inspired sensing descriptions express research scope rather than unverified benchmark results.
- Outreach counts from the previous content are retained in the data but omitted from the redesigned presentation because their measurement date was not supplied.
- Future news, positions, paper status, and project results should be updated from verified sources. No PhD intake year or availability window is assumed.
