# Implementation notes

Built and checked on 2026-11-06 in `/workspace/tf-1106/swarm-post`.
All eleven deliverables from PLAN.md are present under `house/`.
The house was empty before implementation. No prior files needed backup.
Nothing was published and no repository was created or modified remotely.

## Provenance and scope

Read BRIEF.md, PLAN.md, REVIEW.md, docs/VISUAL_BRIEF.md,
docs/LICENSE_EVIDENCE.md, and pack/SKILL.md. REVIEW.md begins
`VERDICT: APPROVE`. Also read the official GitBrew house and cover references.
No original Califa HTML, JavaScript, CSS, fonts, artwork, or assets were
opened or downloaded. The supplied prose was the sole inspiration input.
The geometric mark, editorial layout, copy, cursor paths, flocking code,
task choreography, and renderer are independently authored. MIT covers this
new work only; README credits Joel Califa as inspiration.

Writes are confined to the allowlisted house files and temporary capture /
validation tooling under `tmp/swarm-capture/`. The supplied pack, evidence,
plan, review, and unrelated trees remain unchanged. No remote runtime
dependencies were introduced. Both required manifest language fields contain
English, following the current English-only instruction over the earlier
plan's localized-metadata suggestion.

## Implementation

- One visible Canvas2D scene, with a deterministic seed and a 60 Hz simulation
  step. Catch-up is bounded to 50 ms; backing DPR is capped at two.
- Twelve cursors grow to 36. Separation, alignment, cohesion, damped task
  attraction, and contact avoidance produce the motion. The finale gathers
  them around contact or the center.
- The 24-second automatic tour includes an orbit, typed headlines and copy,
  crosshair rectangles with live width/height badges and fill fades, sliding
  rulers and red snap guides, a ghost duplicate with an Option-symbol cue and
  red spacing labels, a pen stroke, and a gentle reset.
- Touch drag reconstructs task progress in either direction. Contact pauses
  progress; release holds for three seconds before automatic motion resumes.
  The optional wheel path provides scrolling without being required on phones.
- Layout uses a 390-unit width and uniform scale. A virtual camera follows
  construction within the 120vw island. Canvas status edges share that budget.
- The canonical vendor HTML was authored first. `play.html` differs only in
  relative vendor paths and insertion of the bare `/sandbox/_ready.js`.
- Startup paints the actual opening scene immediately, schedules the loop,
  then calls `window.__gbSandbox.ready()` after painting and scheduling the
  next frame. The sent flag is set only after the call. An absent shim is
  retried each frame; standalone playback remains functional.
- Capture calls the same exported scene factory, simulation, and renderer at
  native 390 x 844 dimensions. It neither stretches the island bitmap nor
  changes the live CSS cap. There is no separate cover illustration or layout.

## Required protocol results

All three commands exited 0 with `"ok": true`, `"errors": []`, and
`"playIslandVw": 1.2`:

```sh
node /workspace/tf-1106/swarm-post/pack/protocol.mjs check --dir /workspace/tf-1106/swarm-post/house
node /workspace/tf-1106/swarm-post/pack/protocol.mjs check --dir /workspace/tf-1106/swarm-post/house --island-w 390 --island-h 468 --glass-h 844
node /workspace/tf-1106/swarm-post/pack/protocol.mjs check --dir /workspace/tf-1106/swarm-post/house --island-w 402 --island-h 482 --glass-h 874
```

The missing full official checker and its dependencies were fetched, unchanged,
from `https://gitbrew.ai/skills/gitbrew-post/` into
`tmp/swarm-capture/validation/`. The authentic host shim came from
`https://gitbrew.ai/sandbox/_ready.js`. No fabricated shim was used.

```sh
TMPDIR=/workspace/tf-1106/swarm-post/tmp/swarm-capture/runtime \
PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome \
node tmp/swarm-capture/validation/check.mjs house
```

Final result: exit 0, **GITBREW-CHECK: PASS**. Protocol and iPhone scans passed;
compile passed (1 ms raw, 0 ms rounded scaled, 2000 ms limit). Calibration
measured 296 ms against the 201 ms reference, a 0.68 scale. Ready runs under
4x CPU throttling measured 178 ms and 145 ms on the reference scale. Both were
below 1000 ms; the official checker skipped the third run after two passes.
The complete output is `tmp/swarm-capture/full-check-final.log`.

For reproducibility, SHA-256 identifiers:

| File | SHA-256 |
| --- | --- |
| Supplied pack/protocol.mjs | af161eac8b89e73ec67b95da75aa3eae7f97032352edc3b3b82cb8fc0d7e9f3f |
| Downloaded check.mjs | db76cae16e99611872a5a106926f9d6aca01066fbc13054404376fcab7b049ee |
| Downloaded protocol.mjs | 4b1890f08a54b709c6927083658f50217565b98e9ad05ffa703f9d52578ed697 |

The newer official protocol accepts a still-only cover. Both covers are
retained to satisfy the supplied protocol and this task's explicit request.

## Browser and behavior checks

Chrome 156.0.8078.47 and Playwright WebKit 27.2 both passed at 390 x 468
(input DPR 2) and 402 x 482 (input DPR 3). The latter correctly used DPR 2,
with an 804 x 964 backing canvas. Both measured the exact requested CSS
island dimensions. Resizing to taller glass kept the 120vw height cap.

Each browser/size combination passed real touchscreen tap, synthetic touch
pointer drags forward and backward, contact hold, the three-second release
delay, actual host shim pause/resume, resize, and zero page scroll leakage.
The visibility handler was exercised with a synthetic document-hidden change;
it suspended progression and resumed without an elapsed-time jump. This is
not a physical device background/foreground test.

Instrumentation observed one ready emission per navigation, with actual
canvas drawing and at least two rAF requests already recorded. Browser runs
blocked requests outside the local host. No third-party requests, JavaScript
errors, or asset 404s occurred. Static inspection of executable assets found
no remote URL, imports, network APIs, iframe, or alternate GPU renderer.

The live, no-input 60-second recording shows two complete loops and the next
tour underway. Reviewed the actual opening, typing, rectangle/badge, guide,
duplication, pen, finale, and replay images. Active construction, badges, and
the touch surface fit the island; previous/future page sections scroll past
the edges. There is no button UI or overlay to obscure the canvas.

Reports: `tmp/swarm-capture/browser-report.json` and `webkit-report.json`.
Screenshots and a tour contact sheet are alongside them; the actual live
recording is under `tmp/swarm-capture/tour/`.

## Performance and limits

On this box (Intel Xeon, 8 logical CPUs, approximately 16 GiB RAM), Chrome at
390 x 468 / DPR 2 ran for 60.09 seconds without CPU throttling. After a
one-second warmup, 3,541 measured frame intervals had median 16.7 ms and
95th percentile 16.7 ms. The maximum was 100 ms. The recording and explicit
garbage collection every ten seconds were included in this measurement.
The implementation caps agents at 36.

Post-GC heap samples were 1,725,352; 1,849,140; 1,895,884; 1,927,916;
1,927,224; and 1,956,048 bytes. This shows modest growth during initial
cache warmup, not proof of a stable long-duration heap. A longer memory soak
and physical iPhone/Safari performance remain unverified. Box WebKit and
touch emulation are not physical iPhone coverage. Server/JEV, CDN, and
publication gates were not run or claimed.

## Cover capture

Tools: Node 24.22.1, npm 11.21.1, puppeteer-core 25.16.0, Playwright 1.65.0,
Chrome 156.0.8078.47, and FFmpeg/ffprobe 7.1.5. Temporary browser profiles,
npm dependencies, and WebKit dependencies were kept under `tmp/swarm-capture`.
WebKit's missing Debian libraries were downloaded with package SHA-256
verification and extracted locally; no system package installation was needed.

The local capture server serves only the house runtime files and authentic
host shim. `capture.mjs` opens play.html, creates the real seeded scene, and
records its opening frame, then two 1/60-second simulation steps per video
frame. Encoding commands, run from the workspace root:

```sh
TMPDIR=/workspace/tf-1106/swarm-post/tmp/swarm-capture/runtime node tmp/swarm-capture/capture.mjs
ffmpeg -hide_banner -loglevel error -y -framerate 30 -i tmp/swarm-capture/frames/%03d.png -frames:v 90 -c:v libx264 -crf 20 -pix_fmt yuv420p -an -movflags +faststart house/cover.mp4
ffmpeg -hide_banner -loglevel error -y -i tmp/swarm-capture/frames/000.png -frames:v 1 -c:v libwebp -quality 86 house/cover.webp
```

| Cover | Verified output |
| --- | --- |
| cover.webp | Static VP8 WebP, 390 x 844, 13,846 bytes; no ANIM/ANMF chunks |
| cover.mp4 | H.264, yuv420p, 390 x 844, 30/1 fps, 90 frames, 3.000 seconds, 91,699 bytes, one video stream and no audio |

ffprobe verified metadata. Decoded and inspected the still plus video frames
0, 45, and 89: cursor positions and typed content visibly advance. The clip
is a three-second opening excerpt; the complete interactive tour loops every
24 seconds. All imagery is the running stage, with no host or browser chrome.
Capture and validation browsers/servers were closed. Raw numbered frames and
temporary package download/index files were removed; tooling, reports, and
review evidence remain in the task's temporary directory.
