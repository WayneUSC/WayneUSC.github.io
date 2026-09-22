# SNAIL Lab route compatibility

The previous standalone Habitat Studio application has been replaced by the native homepage experience at `/#project-habitat`. Existing bookmarks redirect to that project. No homepage control navigates to this directory or loads an iframe.

The complete pre-integration application, including reference photographs, exports and synthetic replay, is preserved in branch `codex/backup-before-habitat-inline-2026-09-22` (commit `2fb448a6b4482aa976d881cb20109b196d86263b`).

Current implementation:
- `assets/js/habitat-renderer.js`: the original parametric scene, WebGL renderer, CPU fallback, picking and first-person camera, isolated from the source application.
- `assets/js/habitat.js`: bilingual modal, scoped keyboard/pointer controls, lazy loading and cleanup.
- `assets/css/habitat.css`: portfolio presentation and responsive viewer.

The model is manually parameterized from reference photographs. Geometry is approximate and uncalibrated; the viewer makes no live-data or calibrated-coverage claim. Walking is a bounded free camera, without furniture collision physics.
