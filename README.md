# Wen Chen — bilingual academic homepage

Live at https://wayneusc.github.io/. Static HTML, CSS and vanilla JavaScript, served by GitHub Pages from `main`. No dependencies, framework or build step.

## September 2026 redesign

An editorial research portfolio organized around dynamic tactile sensing, embodied human–robot interaction and multimodal systems. The live-text signature reads **Wen Chen** in **Great Vibes**, also used on Xinyi Fu's homepage. The existing locally hosted subset includes all required letters and avoids a Google Fonts network dependency; its SIL Open Font License is included in `assets/fonts/OFL.txt`.

The home page features POIROT, ShakeSort, bio-inspired tactile sensing and an interactive Smart Habitat presentation. All ten project records remain available across featured work and the expandable archive. Three relevant papers appear initially; all eight original publication records remain available. English and Chinese content, publication selection, citation copying, contact links and the POIROT browser demo are retained or supported. A standalone research profile supports printing or saving as PDF in either language.

## September 12 visual refinement

Inspired by the restrained typography and section rhythm of Apple's Mac pages: system sans-serif headings, white and light-gray surfaces, consistent rounded cards and controls, and more generous spacing. The Great Vibes signature remains unchanged.

Typography is controlled in `assets/css/site.css` through shared roles, rather than per-card size overrides:

| Role | Desktop | Mobile (≤650 px) |
| --- | --- | --- |
| Name | 72 px | 48 px |
| Section heading (including contact) | 48 px | 32 px |
| Every project title | 28 px | 24 px |
| Research / experience / outreach subtitle | 22 px | 20 px |
| Every paper title | 21 px | 19 px |
| Body text | 17 px | 16 px |

These values use rem units and follow the browser's text-size preference. Tablet sizes are shared tokens too. Featured projects gain emphasis from layout and media, with the same heading size, weight and line height as the rest. Chinese headings do not inherit negative English letter spacing. The printable research profile and error page use the same sans-serif direction.

A second backup preserves the version immediately before this refinement: `codex/backup-before-apple-refinement-2026-09-12` at `f4d65506f5395f531937afa9e203a1d5a3af0076`. The September 8 original backup remains available.

## September 22 content and Habitat update

- Kaiwu Robotics (北京清工开物科技有限公司) was established on **June 17, 2026**, as confirmed by the owner. Bilingual news, the experience timeline and Organization structured data now include that founding date. The timeline labels it as the company’s establishment date.
- The homepage signature and its accessible label use **Wen Chen**; Wayne remains the existing personal alias.
- Smart Habitat has a dedicated interactive feature linking to `habitat-studio/?view=snail` for the SNAIL Lab spatial reconstruction and `habitat-studio/?view=snail&mode=walk` for the first-person walkthrough. The source is the owner-supplied `Habitat_Studio_SNAIL_v1_3_1.html`.
- Habitat Studio presents synthetic sample replay and a spatial demonstration. Its sample signals are not a live lab data feed or validated benchmark results. Platform descriptions distinguish the research aims from what this public demonstration shows.
- Homepage styles/scripts and the printable profile’s shared content use the `20260922` cache version.

## Edit and preview

- `assets/js/content.js`: bilingual records and presentation copy (`SITE.design`). Stable project IDs and curated summaries are at the bottom. Display overrides are intentional; edit them when updating the underlying record.
- `assets/js/app.js`: homepage rendering and interactions.
- `assets/css/site.css`: layout, typography, responsive and print styles.
- `index.html`: page shell, canonical URL, existing social preview metadata and structured data.
- `research-profile.html` and `assets/js/profile.js`: printable research summary using the same content source. This is a research profile, not a replacement for a complete CV.
- `poirot/`: existing English and Chinese detective-game demos; unchanged by this redesign.
- `habitat-studio/`: interactive SNAIL Lab spatial demonstration and synthetic multimodal replay, with keyboard walkthrough controls on desktop.

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
