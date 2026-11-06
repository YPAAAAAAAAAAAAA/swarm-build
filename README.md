# Swarm Build

Small moves. Big things. An original Canvas2D experiment in cursors working
together: they orbit a geometric mark, set type, drag shapes, align guides,
duplicate cards, and draw a finishing stroke. The page builds itself on a
24-second repeating tour, with 12 to 36 colorful agents.

Drag vertically to move forward or backward through the build. Contact pauses
the tour; automatic motion resumes three seconds after release. During the
finale, hold anywhere to gather the swarm around your finger. The demo works
without a gesture, audio, keyboard, or external dependencies.

## Run

Serve this directory with any static HTTP server and open `vendor/index.html`
for the standalone demo. `play.html` is that same page adapted to GitBrew: it
loads the bare host `/sandbox/_ready.js` and the same relative vendor files.
Outside GitBrew, use the canonical standalone page to avoid a missing host
shim request. The renderer continues working even when that shim is absent.

The live stage is width-scaled and capped at `120vw`, including its small
canvas status edges. It fits a 390 x 468 or 402 x 482 phone island. A virtual
camera follows the construction without shrinking the whole page into the
island. Device pixel ratio is capped at two. All type uses system fonts.

## Source and capture

`vendor/swarm.js` contains the simulation, task records, touch handling, and
shared renderer. `SwarmBuild.createScene()`, `advance(scene, dt, height)`, and
`render(context, viewport, scene)` allow deterministic box capture of that
same scene at a native 390 x 844 viewport. Capture does not alter the play
island or substitute a cover layout. `cover.webp` is its opening frame;
`cover.mp4` contains its first three seconds at 30 fps with no audio.

## Provenance

Inspired by [Joel Califa's Swarm](https://github.com/califa/swarm-site),
described publicly as a website that builds itself as you scroll. This is an
independently authored clean-room recreation of that broad interaction idea,
not the original implementation and not an official Califa project. The
layout, copy, mark, cursor paths, simulation, and drawing code were invented
from the supplied prose brief. No original source, bundles, fonts, artwork,
or other assets were fetched, inspected, or reused.

The included MIT license applies only to this new implementation. It makes
no claim to the original Swarm's source or assets. Both manifest language
fields retain English wording under this task's English-only requirement.

See `IMPLEMENT_NOTES.md` and `SKILL_PROOF.md` for measured local checks and
the limits of browser testing. This artifact has not been published.
