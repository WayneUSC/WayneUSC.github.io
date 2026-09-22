# Habitat Studio on Wen Chen's portfolio

`index.html` is the self-contained public demo adapted from `Habitat_Studio_SNAIL_v1_3_1.html`. It retains the original scene geometry, reference images, provenance, exports, and synthetic replay. No build step or third-party runtime is required.

## Entry links

- `./?view=snail` opens the SNAIL Lab workbench.
- `./?view=snail&mode=walk` opens the room in walking mode, without starting motion or replay.
- Add `&embed=1` to either link to replace the sidebar with a compact, horizontally scrollable six-page navigation bar inside a portfolio iframe.
- `#snail` and `#walk` are also accepted. URL values are allowlisted by the app's existing page router.

## Walking

Click the room to give the canvas keyboard focus. Use WASD to move, Space to raise the viewpoint, Shift to lower it, and drag to look around. Alt slows movement. Escape restores the previous orbit view. Touch users can hold the direction and height buttons overlaid on the room; dragging the room changes the viewing direction. The controls also accept keyboard activation in discrete steps. Keyboard and touch holds are tracked separately, so a focus change within the controls does not cancel a held touch.

Movement stops on focus loss, backgrounding, page changes, and modal dialogs. Playback shortcuts do not intercept walking controls or form input. Reduced-motion settings disable automatic playback when synthetic overlays are enabled; visitors can still deliberately start replay.

## Data and boundaries

The room is a photo-assisted, manually parameterized reference model, with uncalibrated dimensions. Built-in signals and anonymous avatar trajectories are synthetic examples, not measurements or experimental results. Walking is a camera navigation mode, without furniture collision physics.

The eight embedded reference photos are retained from the supplied HTML, including its existing screen masks and metadata removal. Local JSON and video imports stay in the browser. The content security policy blocks network connections, and only the interface text-size preference is stored locally. The return link navigates back to the portfolio.
