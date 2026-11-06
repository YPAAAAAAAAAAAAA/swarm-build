# Skill proof

I read the supplied gitbrew-post SKILL.md and the official references/house.md
and references/cover.md. The approved clean-room plan replaces copying the
unlicensed original with independently authored canonical vendor files.

repo: YPAAAAAAAAAAAAA/swarm-build
play: play.html
official: vendor/swarm.js

- ready: play.html loads /sandbox/_ready.js without a query. The real scene
  is painted immediately; after painting and scheduling requestAnimationFrame,
  the loop calls window.__gbSandbox.ready() when present, then marks it sent.
  A late shim is retried on subsequent frames. No timer or input gates boot.
- local vendor: play references only relative ./vendor/swarm.css and
  ./vendor/swarm.js plus the required host shim. System fonts and procedural
  Canvas2D paths require no remote CSS, JavaScript, fonts, or assets.
- ratio/island: phone max-height 120vw (PLAY_ISLAND_VW=1.2), uniform scaling
  from a 390-unit width, and a virtual camera. html,body height 100% with
  overflow:hidden. Cover rendering uses the same scene at native 390 x 844.
- composition: viewport-fit=cover; one visible canvas; no safe-area padding,
  hidden boot, veil, or button dock. The status edges are inside the stage.
  The canonical page and play page preserve the same stage and swarm IDs.

Executed results: the supplied protocol returns ok:true with no errors for
the default check, 390 x 468 island, and 402 x 482 island. The separately
downloaded official checker returns GITBREW-CHECK: PASS, including its iPhone
scan and calibrated ready gate (178 ms and 145 ms scaled at 4x CPU throttle;
two passes, third run skipped by the checker). Chrome and WebKit passed the
island, touch, resize, DPR-cap, readiness-order, and local-only request checks.
Both covers are actual native 390 x 844 renderer captures; the MP4 is 30 fps,
3 seconds, with no audio. Detailed evidence and physical-device/memory-soak
limitations are in IMPLEMENT_NOTES.md. No publication result is claimed.
