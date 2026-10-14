# CLSL · Closed-Loop State Legibility — interactive exhibit

Served at https://wayneusc.github.io/clsl/ and linked from the homepage's CLSL exhibit (`#project-clsl`).

## Source

`index.html` is the owner's release file `CLSL_Closed-Loop_State_Legibility_v1.0.html`, copied **byte for byte** (no edits):

- SHA-256 `d54000bb142eb544a903836209862b1988d036c0bb0ea66278a4e89b1440a523`
- 3.6 MB, single file. three.js r160 (MIT), the ICT-FaceKit android head (USC ICT, MIT) and all data are embedded.
- Its Content-Security-Policy forbids every network request, so it behaves the same here as when opened offline.

To publish a newer build, replace `index.html` with the new single-file output of `tools/build.py` and update the hash above.
The face redesign prototype (`CLSL_Face_Redesign_v2.html`) can be published the same way if preferred; it is not used here.

## Pages and deep links

The exhibit routes by hash: `#overture`, `#loop`, `#xray`, `#sweep`, `#face`, `#lineage`, `#roadmap`.
Language and theme are remembered in `localStorage` under `clsl.lang` / `clsl.theme`. The homepage writes `clsl.lang`
when a visitor follows an exhibit link, so the exhibit opens in the homepage's current language.

## Boundaries (as stated inside the exhibit)

- The observer in the live loop, X-ray and failure-boundary pages is a model. There is no human-subject data.
- Study 1's face instrument is built and awaiting a pilot; hypothesis curves on the face page are illustrative.
- The android head's skin and materials are procedural and do not depict a real person or product.
