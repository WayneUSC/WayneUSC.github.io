# Wen Chen — bilingual academic homepage

Live at https://wayneusc.github.io/. Static HTML, CSS and vanilla JavaScript, served by GitHub Pages from `main`. No dependencies, framework or build step.

## September 2026 redesign

An editorial research portfolio organized around dynamic tactile sensing, embodied human–robot interaction and multimodal systems. The live-text signature reads **Wen Chen** in **Great Vibes**, also used on Xinyi Fu's homepage. The existing locally hosted subset includes all required letters and avoids a Google Fonts network dependency; its SIL Open Font License is included in `assets/fonts/OFL.txt`.

The home page features POIROT, ShakeSort, Lumie and an interactive Smart Habitat presentation. All eleven project records remain available across featured work and the expandable archive. Three relevant papers appear initially; all eight original publication records remain available. English and Chinese content, publication selection, citation copying, contact links and the POIROT browser demo are retained or supported. A standalone research profile supports printing or saving as PDF in either language.

## September 23 Lumie update

- Added **Lumie / 灯仔**, a five-degree-of-freedom expressive robotic study lamp, to selected work and the printable bilingual research profile.
- The project record distinguishes implemented prototype work (incremental voice planning, expressive motion, lighting, vision and a companion SwiftUI dashboard) from longer-term memory-driven personalization goals.
- The project cover uses the owner-supplied yellow lamp artwork, center-cropped to the site’s 3:2 media ratio and compressed for the web.

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
- Smart Habitat now uses a native high-DPI Canvas preview and a bilingual in-page 3D dialog. The exact photo-assisted parametric scene is extracted from the owner-supplied `Habitat_Studio_SNAIL_v1_3_1.html`; the full application, reference photos and synthetic replay are not loaded.
- Visitors can orbit, zoom, select objects, switch to a plan view, or walk with WASD / arrow keys and on-screen direction buttons. Dragging or Q/E turns the camera; R/F looks up/down. The +/− keys also zoom in orbit mode. Escape first exits walking, then closes the dialog. Keyboard movement is restricted to the focused canvas and stops on blur, tab backgrounding or close.
- Geometry is approximate, not a metrically calibrated reconstruction. The viewer contains no live measurements or sensor-coverage claims. Walking is a bounded free camera without furniture collision physics. The existing platform background remains separate from this public demonstration.
- No homepage action navigates to a separate Habitat page. Old `habitat-studio/` bookmarks redirect to `/#project-habitat`. The original model geometry is preserved; graphics load near the project and draw on demand (continuous updates only while walking). GPU rendering supports up to DPR 3 with a 6-megapixel budget; a CPU fallback is included.
- The version before this integration is preserved in `codex/backup-before-habitat-inline-2026-09-22` at `2fb448a6b4482aa976d881cb20109b196d86263b`, plus a complete source ZIP saved outside the checkout.
- Homepage resources use the `20260922-inline` cache version for this integration.

## September 23 POIROT film and visual refinement

The POIROT project photograph now includes an explicit **Watch the film** control. It opens the owner-supplied HRI 2026 supplementary video in a native dialog, with English/Chinese interface text, original embedded English captions, native playback/fullscreen controls and a direct MP4 download. Closing pauses playback, releases the video source, and restores scroll position and keyboard focus. No video element or video request is created before clicking.

`assets/video/poirot-hri2026.mp4` preserves the original 59.2-second, 1280×720 H.264/AAC streams. Only the MP4 container was remuxed for fast start (metadata before media); there is no lossy re-encode. `assets/img/poirot-film-poster.jpg` is a frame extracted from the supplied film. `assets/js/project-video.js` owns the player lifecycle; `assets/css/project-video.css` supplies its presentation independently of the new visual theme.

The optional screen-only design layer in `assets/css/studio.css` takes cues from the owner's three industrial-design references: silver surfaces, graphite typography, fine rules, restrained corner radii and small yellow-green accents. Original photographs, content order, signature, shared title sizes, project structure and the SNAIL Lab interaction remain. The new Lumie project and the latest confirmed CV dates are preserved. The three reference artworks themselves are not included in the site.

The exact version immediately before this change is backed up in `codex/backup-before-poirot-film-2026-09-23` at `b1ce08818b6045f42de77c03c5c2f761260f2c17`, with a complete source ZIP outside the checkout. The design layer can also be removed independently by removing its stylesheet link; the video player retains its own stylesheet.

## Edit and preview

- `assets/js/content.js`: bilingual records and presentation copy (`SITE.design`). Stable project IDs and curated summaries are at the bottom. Display overrides are intentional; edit them when updating the underlying record.
- `assets/js/app.js`: homepage rendering and interactions.
- `assets/css/site.css`: layout, typography, responsive and print styles.
- `index.html`: page shell, canonical URL, existing social preview metadata and structured data.
- `research-profile.html` and `assets/js/profile.js`: printable research summary using the same content source. This is a research profile, not a replacement for a complete CV.
- `poirot/`: existing English and Chinese detective-game demos; unchanged by this redesign.
- `assets/js/habitat.js`, `assets/js/habitat-renderer.js`, `assets/css/habitat.css`: native SNAIL Lab preview and viewer.
- `habitat-studio/`: compatibility redirect for previous standalone demo links.

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
