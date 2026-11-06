/* Swarm Build. Independently authored Canvas2D choreography; MIT licensed. */
(() => {
  'use strict';

  const WIDTH = 390;
  const DURATION = 24;
  const STEP = 1 / 60;
  const TAU = Math.PI * 2;
  const PAPER = '#f7f7f2';
  const INK = '#242b29';
  const MUTED = '#7c837c';
  const RED = '#dc625c';
  const COLORS = ['#7461d8', '#e57b48', '#449e84', '#e45e8c', '#508dcc', '#b69b28', '#9a63ba', '#3c9fa5', '#d75b53', '#748d45', '#636cd7', '#cc7eaa'];
  const FONT = '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
  const MONO = 'ui-monospace, "SFMono-Regular", Consolas, monospace';
  const clamp = (n, a = 0, b = 1) => Math.min(b, Math.max(a, n));
  const smooth = n => { n = clamp(n); return n * n * (3 - 2 * n); };
  const mix = (a, b, t) => a + (b - a) * t;
  const portion = (t, a, b) => clamp((t - a) / (b - a));
  const tasks = [
    { id: 'headline', kind: 'text', start: 1, end: 3.6, depends: [], agent: 0, x: 28, y: 258, w: 334, h: 96, lines: ['Small moves.', 'Big things.'], size: 42, line: 47, weight: 650 },
    { id: 'intro', kind: 'text', start: 3.6, end: 5.2, depends: ['headline'], agent: 1, x: 30, y: 334, w: 330, h: 40, lines: ['A little coordination.', 'A whole lot of possibility.'], size: 15, line: 23, weight: 400 },
    { id: 'hero', kind: 'rect', start: 5.2, end: 7.7, depends: ['intro'], agent: 2, x: 28, y: 392, w: 334, h: 166 },
    { id: 'guides', kind: 'guide', start: 8, end: 9.7, depends: ['hero'], agent: 3, x: 28, y: 611, w: 334, h: 0 },
    { id: 'section', kind: 'text', start: 9.7, end: 11, depends: ['guides'], agent: 3, x: 28, y: 613, w: 320, h: 28, lines: ['Better, together.'], size: 26, line: 32, weight: 600 },
    { id: 'card', kind: 'rect', start: 11, end: 12.7, depends: ['section'], agent: 4, x: 28, y: 640, w: 159, h: 124 },
    { id: 'copy', kind: 'duplicate', start: 12.7, end: 15.4, depends: ['card'], agent: 5, x: 203, y: 640, w: 159, h: 124 },
    { id: 'closing', kind: 'text', start: 16, end: 18.1, depends: ['copy'], agent: 6, x: 28, y: 836, w: 330, h: 70, lines: ['Many minds.', 'One good idea.'], size: 32, line: 38, weight: 600 },
    { id: 'accent', kind: 'pen', start: 18.1, end: 20, depends: ['closing'], agent: 7, x: 28, y: 894, w: 210, h: 15 }
  ];
  const taskById = Object.fromEntries(tasks.map(task => [task.id, task]));
  const widths = new Map();
  function font(ctx, size, weight = 400, mono = false) {
    ctx.font = `${weight} ${size}px ${mono ? MONO : FONT}`;
  }
  function measure(ctx, value) {
    const key = ctx.font + value;
    if (!widths.has(key)) widths.set(key, ctx.measureText(value).width);
    return widths.get(key);
  }
  function text(ctx, value, x, y, size = 12, color = INK, weight = 400, mono = false) {
    font(ctx, size, weight, mono);
    ctx.fillStyle = color;
    ctx.fillText(value, x, y);
  }
  function line(ctx, x1, y1, x2, y2, color, width = 1) {
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
  }
  function box(ctx, x, y, w, h, r, fill, stroke) {
    r = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r); ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h); ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y); ctx.closePath();
    if (fill) { ctx.fillStyle = fill; ctx.fill(); }
    if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 1; ctx.stroke(); }
  }
  function circle(ctx, x, y, r, fill, stroke) {
    ctx.beginPath(); ctx.arc(x, y, r, 0, TAU);
    if (fill) { ctx.fillStyle = fill; ctx.fill(); }
    if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 1; ctx.stroke(); }
  }
  function mark(ctx, x, y, size) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(-Math.PI / 4);
    box(ctx, -size * 0.5, -size * 0.16, size, size * 0.32, size * 0.09, INK);
    box(ctx, -size * 0.16, -size * 0.5, size * 0.32, size, size * 0.09, INK);
    circle(ctx, size * 0.32, -size * 0.32, size * 0.1, '#a9bf7a');
    ctx.restore();
  }
  function taskProgress(task, time) {
    for (const id of task.depends) if (time < taskById[id].end) return 0;
    return portion(time, task.start, task.end);
  }
  function cameraAt(time, height) {
    const keys = [[0, 0], [5.1, 0], [7.8, 210], [8, 245], [9.6, 330], [12.5, 400], [15.5, 400], [18, 540], [20, 540], [21.4, 190], [23, 190], [24, 0]];
    let target = 0;
    for (let i = 1; i < keys.length; i++) {
      if (time <= keys[i][0]) {
        target = mix(keys[i - 1][1], keys[i][1], smooth(portion(time, keys[i - 1][0], keys[i][0])));
        break;
      }
    }
    return Math.min(target, Math.max(0, 970 - height));
  }
  function createScene() {
    let seed = 251106;
    const random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
    const agents = [];
    for (let i = 0; i < 36; i++) {
      const angle = i / 12 * TAU;
      const radius = 78 + random() * 28;
      agents.push({ x: 195 + Math.cos(angle) * radius, y: 143 + Math.sin(angle) * radius * 0.65, vx: -Math.sin(angle) * 22, vy: Math.cos(angle) * 22, color: COLORS[i % COLORS.length], phase: random() * TAU, tx: 0, ty: 0, form: 'arrow', task: -1 });
    }
    return { time: 0, motion: 0, loop: 0, count: 12, agents, pointer: { active: false, x: 195, y: 230 }, pause: 0, camera: 0 };
  }
  function advance(scene, dt, height) {
    scene.motion += dt;
    if (!scene.pointer.active && scene.pause <= 0) {
      scene.time += dt;
      if (scene.time >= DURATION) { scene.time -= DURATION; scene.loop++; }
    }
    scene.pause = Math.max(0, scene.pause - dt);
    const t = scene.time;
    scene.camera = cameraAt(t, height);
    scene.count = 12 + Math.floor(24 * clamp(t / 20));
    const camera = scene.camera;
    for (let i = 0; i < scene.count; i++) {
      const agent = scene.agents[i];
      agent.form = 'arrow'; agent.task = -1;
      const orbit = i / scene.count * TAU + scene.motion * 0.62;
      if (t < 1 || t > 23) {
        agent.tx = 195 + Math.cos(orbit) * 95;
        agent.ty = 143 + Math.sin(orbit) * 65 - camera;
      } else if (t >= 20) {
        const px = scene.pointer.active ? scene.pointer.x : 195;
        const py = scene.pointer.active ? scene.pointer.y : height * 0.48;
        agent.tx = px + Math.cos(orbit) * (30 + i * 1.25);
        agent.ty = py + Math.sin(orbit) * (22 + i);
      } else {
        agent.tx = 195 + Math.cos(orbit * 0.64 + agent.phase) * 145;
        agent.ty = 90 + (height - 165) * (0.5 + 0.42 * Math.sin(orbit + agent.phase));
        for (let k = 0; k < tasks.length; k++) {
          const task = tasks[k];
          if (task.agent !== i || t < task.start || t >= task.end) continue;
          const p = taskProgress(task, t);
          agent.task = k;
          if (task.kind === 'rect') {
            agent.tx = task.x + task.w * smooth(clamp(p / 0.8));
            agent.ty = task.y + task.h * smooth(clamp(p / 0.8)) - camera;
            agent.form = 'crosshair';
          } else if (task.kind === 'text') {
            // The precise caret is rendered with the text; this agent arrives beside it.
            agent.tx = task.x + Math.min(task.w - 12, p * task.w);
            agent.ty = task.y - camera;
            agent.form = 'ibeam';
          } else {
            agent.tx = task.x + task.w * smooth(p);
            agent.ty = task.y - camera + (task.kind === 'duplicate' ? 50 : 0);
            agent.form = task.kind === 'pen' ? 'pen' : 'arrow';
          }
        }
      }
      agent.tx = clamp(agent.tx, 16, 367);
      agent.ty = clamp(agent.ty, 67, height - 45);
    }
    // Bounded pairwise separation, cohesion and alignment; no per-agent allocations.
    for (let i = 0; i < scene.count; i++) {
      const a = scene.agents[i];
      let sx = 0, sy = 0, cx = 0, cy = 0, ax = 0, ay = 0, neighbors = 0;
      for (let j = 0; j < scene.count; j++) {
        if (i === j) continue;
        const b = scene.agents[j], dx = a.x - b.x, dy = a.y - b.y, d2 = dx * dx + dy * dy;
        if (d2 > 0 && d2 < 900) { sx += dx / d2; sy += dy / d2; }
        if (d2 < 6400) { cx += b.x; cy += b.y; ax += b.vx; ay += b.vy; neighbors++; }
      }
      let fx = (a.tx - a.x) * (a.task >= 0 ? 12 : 2.4) - a.vx * 2.9 + sx * 1000;
      let fy = (a.ty - a.y) * (a.task >= 0 ? 12 : 2.4) - a.vy * 2.9 + sy * 1000;
      if (neighbors) {
        fx += (cx / neighbors - a.x) * 0.15 + (ax / neighbors - a.vx) * 0.3;
        fy += (cy / neighbors - a.y) * 0.15 + (ay / neighbors - a.vy) * 0.3;
      }
      if (scene.pointer.active && t < 20) {
        const dx = a.x - scene.pointer.x, dy = a.y - scene.pointer.y;
        const d2 = Math.max(36, dx * dx + dy * dy);
        if (d2 < 10000) { fx += dx / d2 * 6500; fy += dy / d2 * 6500; }
      }
      const force = Math.hypot(fx, fy);
      if (force > 650) { fx *= 650 / force; fy *= 650 / force; }
      a.vx += fx * dt; a.vy += fy * dt;
      const speed = Math.hypot(a.vx, a.vy);
      if (speed > 190) { a.vx *= 190 / speed; a.vy *= 190 / speed; }
      a.x = clamp(a.x + a.vx * dt, 12, 372);
      a.y = clamp(a.y + a.vy * dt, 61, height - 38);
    }
  }

  function badge(ctx, label, x, y, color = '#7461d8') {
    font(ctx, 10, 500, true);
    const w = measure(ctx, label) + 14;
    x = clamp(x, 8, WIDTH - w - 8);
    box(ctx, x, y - 14, w, 22, 5, color);
    text(ctx, label, x + 7, y + 1, 10, '#ffffff', 500, true);
  }
  function arrow(ctx, a, scale = 1) {
    ctx.save(); ctx.translate(a.x, a.y); ctx.scale(scale, scale);
    if (a.form === 'crosshair') {
      line(ctx, -7, 0, 7, 0, a.color, 1.6); line(ctx, 0, -7, 0, 7, a.color, 1.6);
      circle(ctx, 0, 0, 2, PAPER, a.color);
    } else if (a.form === 'ibeam') {
      line(ctx, 0, -9, 0, 9, a.color, 1.8);
      line(ctx, -4, -9, 4, -9, a.color, 1.8); line(ctx, -4, 9, 4, 9, a.color, 1.8);
    } else {
      ctx.rotate(-0.2 + clamp(a.vx / 200, -0.3, 0.3));
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(3, 20); ctx.lineTo(8, 14);
      ctx.lineTo(13, 22); ctx.lineTo(17, 19); ctx.lineTo(12, 12); ctx.lineTo(20, 11); ctx.closePath();
      ctx.fillStyle = a.color; ctx.fill(); ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1.4; ctx.lineJoin = 'round'; ctx.stroke();
      if (a.form === 'pen') circle(ctx, 0, 0, 3, INK, '#ffffff');
    }
    ctx.restore();
  }
  function drawTextTask(ctx, task, t) {
    const p = taskProgress(task, t);
    const total = task.lines.reduce((n, value) => n + value.length, 0);
    let remaining = Math.floor(total * p);
    let cursorX = task.x, cursorY = task.y;
    const snap = task.id === 'section' ? (1 - smooth(p / 0.2)) * 9 : 0;
    task.lines.forEach((value, i) => {
      const y = task.y + i * task.line;
      text(ctx, value, task.x + snap, y, task.size, '#dde1d8', task.weight);
      const count = Math.max(0, Math.min(value.length, remaining));
      const visible = value.slice(0, count);
      text(ctx, visible, task.x + snap, y, task.size, task.size < 20 ? MUTED : INK, task.weight);
      if (remaining >= 0) { cursorX = task.x + snap + measure(ctx, visible); cursorY = y; }
      remaining -= value.length;
    });
    if (p > 0 && p < 1) {
      if (Math.floor(t * 7) % 2 === 0) line(ctx, cursorX + 2, cursorY - task.size * 0.8, cursorX + 2, cursorY + 3, '#7461d8', 2);
      badge(ctx, 'Aa', cursorX + 8, cursorY - task.size - 9);
    }
  }
  function feature(ctx, x, y, second, alpha = 1) {
    ctx.save(); ctx.globalAlpha *= alpha;
    box(ctx, x, y, 159, 124, 12, second ? '#eee9f5' : '#edf0e6', '#dce0d5');
    if (second) {
      for (let i = 0; i < 3; i++) box(ctx, x + 17 + i * 8, y + 20 + i * 5, 20, 16, 3, i === 2 ? '#8573bb' : '#c8badd');
    } else {
      circle(ctx, x + 27, y + 30, 10, '#83985e');
      circle(ctx, x + 43, y + 30, 10, '#bdca9e');
      circle(ctx, x + 35, y + 42, 8, '#a2b776');
    }
    text(ctx, second ? 'In sync.' : 'In motion.', x + 17, y + 82, 20, INK, 600);
    text(ctx, second ? 'Every detail, aligned.' : 'Find your own rhythm.', x + 17, y + 104, 10.5, MUTED);
    ctx.restore();
  }
  function hero(ctx, p, t) {
    if (p <= 0) return;
    ctx.save(); ctx.globalAlpha *= smooth(portion(p, 0.72, 1));
    box(ctx, 28, 392, 334, 166, 14, '#e9eddf', '#d4dbc8');
    text(ctx, 'ONE IDEA. MANY HANDS.', 46, 420, 10, '#65724e', 500, true);
    const nodes = [[90, 480], [195, 480], [300, 480]];
    line(ctx, 90, 480, 300, 480, '#b2bf9e', 1.5);
    for (let i = 0; i < 3; i++) {
      circle(ctx, nodes[i][0], nodes[i][1], 25, '#f8f9f3', '#cbd4bb');
      if (i === 0) circle(ctx, 90, 480, 7, '#8da56c');
      if (i === 1) mark(ctx, 195, 480, 23);
      if (i === 2) { line(ctx, 292, 480, 298, 486, '#7461d8', 2); line(ctx, 298, 486, 310, 474, '#7461d8', 2); }
      text(ctx, ['Imagine', 'Assemble', 'Make it real'][i], nodes[i][0] - [20, 25, 29][i], 530, 10, '#65724e');
    }
    const dot = portion(t % 2, 0, 2);
    circle(ctx, mix(90, 300, dot), 480, 3, '#8da56c');
    ctx.restore();
  }
  function drawRect(ctx, task, p, time) {
    if (task.id === 'hero') hero(ctx, p, time);
    else if (p > 0) feature(ctx, task.x, task.y, false, smooth(portion(p, 0.72, 1)));
    if (p <= 0 || p >= 1) return;
    const r = smooth(clamp(p / 0.8)), w = task.w * r, h = task.h * r;
    ctx.setLineDash([3, 3]); box(ctx, task.x, task.y, w, h, 0, null, '#8b78ca'); ctx.setLineDash([]);
    for (const x of [task.x, task.x + w]) for (const y of [task.y, task.y + h]) box(ctx, x - 2.5, y - 2.5, 5, 5, 0, PAPER, '#8b78ca');
    badge(ctx, `${Math.round(w)} × ${Math.round(h)}`, task.x + w - 80, task.y + h + 20);
    line(ctx, task.x + w - 7, task.y + h, task.x + w + 7, task.y + h, '#7461d8');
    line(ctx, task.x + w, task.y + h - 7, task.x + w, task.y + h + 7, '#7461d8');
  }
  function drawGuides(ctx, time, height, camera) {
    const enter = smooth(portion(time, 8, 8.6));
    const leave = 1 - smooth(portion(time, 11, 11.6));
    if (enter * leave <= 0) return;
    ctx.save(); ctx.globalAlpha *= enter * leave;
    ctx.fillStyle = '#eeeee7'; ctx.fillRect(0, camera + 54, WIDTH, 18);
    for (let x = 0; x < WIDTH; x += 10) {
      line(ctx, x, camera + 54, x, camera + (x % 50 ? 58 : 63), '#aaaFA4');
      if (x % 50 === 0) text(ctx, String(x), x + 3, camera + 69, 6, MUTED, 400, true);
    }
    const x = mix(-10, 28, enter);
    line(ctx, x, camera + 72, x, camera + height - 32, RED);
    line(ctx, 12, 618, 378, 618, RED);
    badge(ctx, 'snap / 28', 33, 590, RED);
    ctx.restore();
  }
  function drawPage(ctx, scene, height) {
    const t = scene.time;
    const reset = 1 - smooth(portion(t, 23, 24));
    ctx.save(); ctx.translate(0, -scene.camera);
    ctx.globalAlpha = reset;
    // Construction scaffolding belongs to the live scene from its first frame.
    ctx.setLineDash([3, 5]);
    box(ctx, 28, 392, 334, 166, 14, null, '#d9ded2');
    box(ctx, 28, 640, 159, 124, 12, null, '#d9ded2');
    box(ctx, 203, 640, 159, 124, 12, null, '#d9ded2');
    ctx.setLineDash([]);
    text(ctx, '01 / AN IDEA TAKES SHAPE', 30, 380, 8, '#a0a797', 500, true);
    text(ctx, '02 / ROOM TO GROW', 30, 583, 8, '#a0a797', 500, true);
    if (t < 5.2) {
      circle(ctx, 90, 480, 25, '#f1f3eb', '#dfe4d6');
      circle(ctx, 195, 480, 25, '#f1f3eb', '#dfe4d6');
      circle(ctx, 300, 480, 25, '#f1f3eb', '#dfe4d6');
      line(ctx, 116, 480, 169, 480, '#dfe4d6'); line(ctx, 221, 480, 274, 480, '#dfe4d6');
    }
    circle(ctx, 195, 143, 83, '#f0f1e9');
    ctx.setLineDash([2, 6]); circle(ctx, 195, 143, 103, null, '#d4d9cb'); ctx.setLineDash([]);
    line(ctx, 177, 40, 213, 40, '#d4d9cb');
    mark(ctx, 195, 143, 66);
    text(ctx, 'INDEPENDENT MOVES. SHARED DIRECTION.', 72, 207, 8, MUTED, 400, true);
    for (const task of tasks) {
      const p = taskProgress(task, t);
      if (task.kind === 'text') drawTextTask(ctx, task, t);
      if (task.kind === 'rect') drawRect(ctx, task, p, t);
      if (task.kind === 'duplicate' && p > 0) {
        const x = mix(28, task.x, smooth(p));
        feature(ctx, x, task.y, p > 0.8, 0.4 + p * 0.6);
        if (p < 1) {
          ctx.setLineDash([4, 3]); box(ctx, x, task.y, task.w, task.h, 12, null, RED); ctx.setLineDash([]);
          const space = Math.max(0, x - 187);
          line(ctx, 187, 780, x, 780, RED);
          line(ctx, 187, 776, 187, 784, RED); line(ctx, x, 776, x, 784, RED);
          badge(ctx, `${Math.round(space)} px`, 171, 807, RED);
          badge(ctx, '⌥ copy', x + 62, 628, RED);
        }
      }
      if (task.kind === 'pen' && p > 0) {
        ctx.strokeStyle = '#8fa666'; ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.beginPath();
        const end = Math.max(1, Math.ceil(60 * p));
        for (let i = 0; i <= end; i++) {
          const x = task.x + task.w * Math.min(p, i / 60);
          const y = task.y + Math.sin(i / 60 * Math.PI) * -7 + Math.sin(i * 0.5) * 0.5;
          if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke(); ctx.lineCap = 'butt';
        if (p < 1) { circle(ctx, task.x + task.w * p, task.y - Math.sin(p * Math.PI) * 7, 4, PAPER, '#8fa666'); badge(ctx, 'pen', task.x + task.w * p + 12, task.y + 20, '#7c9258'); }
      }
    }
    drawGuides(ctx, t, height, scene.camera);
    text(ctx, 'A small experiment in working as one.', 28, 942, 12, MUTED);
    ctx.restore();
  }
  function render(ctx, viewport, scene) {
    const scale = viewport.width / WIDTH;
    const height = viewport.height / scale;
    const dpr = viewport.dpr || 1;
    scene.camera = cameraAt(scene.time, height);
    ctx.setTransform(scale * dpr, 0, 0, scale * dpr, 0, 0);
    ctx.globalAlpha = 1; ctx.fillStyle = PAPER; ctx.fillRect(0, 0, WIDTH, height);
    ctx.fillStyle = '#e3e6dc';
    for (let y = 64 - scene.camera % 20; y < height - 28; y += 20) for (let x = 10; x < WIDTH; x += 20) ctx.fillRect(x, y, 1, 1);
    ctx.save(); ctx.beginPath(); ctx.rect(0, 53, WIDTH, height - 85); ctx.clip();
    drawPage(ctx, scene, height);
    for (let i = 0; i < scene.count; i++) arrow(ctx, scene.agents[i], i < 12 ? 0.9 : 0.75);
    ctx.restore();
    ctx.fillStyle = PAPER; ctx.fillRect(0, 0, WIDTH, 53); ctx.fillRect(0, height - 32, WIDTH, 32);
    mark(ctx, 29, 28, 18); text(ctx, 'swarm build', 47, 33, 16, INK, 650);
    circle(ctx, 283, 28, 3, '#819d57'); text(ctx, 'LIVE BUILD', 292, 31, 8, MUTED, 500, true);
    line(ctx, 20, 52, 370, 52, '#dfe3d7');
    line(ctx, 20, height - 31, 370, height - 31, '#dfe3d7');
    line(ctx, 20, height - 31, 20 + 350 * scene.time / DURATION, height - 31, '#8ca266', 2);
    const active = tasks.find(task => scene.time >= task.start && scene.time < task.end);
    const status = scene.time >= 23 ? 'ANOTHER LITTLE BEGINNING' : scene.time >= 20 ? 'BUILT TOGETHER' : active ? { text: 'SETTING TYPE', rect: 'DRAWING A SHAPE', guide: 'FINDING ALIGNMENT', duplicate: 'MAKING ROOM', pen: 'ONE LAST DETAIL' }[active.kind] : 'FINDING OUR RHYTHM';
    text(ctx, status, 22, height - 12, 7.5, MUTED, 500, true);
    text(ctx, `${scene.count} AGENTS`, 287, height - 12, 8, MUTED, 500, true);
    if (scene.time < 1) text(ctx, 'DRAG TO EXPLORE', 140, 76, 7, '#929a89', 500, true);
  }

  const canvas = document.getElementById('swarm');
  const context = canvas.getContext('2d', { alpha: false });
  const scene = createScene();
  const viewport = { width: 390, height: 468, dpr: 1 };
  let last = performance.now(), accumulator = 0, readySent = false;
  let dragY = 0, dragTime = 0, pointerId = null;
  function resize() {
    const rect = canvas.getBoundingClientRect();
    viewport.width = Math.max(1, rect.width); viewport.height = Math.max(1, rect.height);
    viewport.dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(viewport.width * viewport.dpr);
    canvas.height = Math.round(viewport.height * viewport.dpr);
    render(context, viewport, scene);
  }
  function point(event) {
    const rect = canvas.getBoundingClientRect(), scale = WIDTH / rect.width;
    scene.pointer.x = (event.clientX - rect.left) * scale;
    scene.pointer.y = (event.clientY - rect.top) * scale;
  }
  canvas.addEventListener('pointerdown', event => {
    if (pointerId !== null) return;
    pointerId = event.pointerId; point(event); scene.pointer.active = true;
    dragY = event.clientY; dragTime = scene.time;
    // The host can also forward synthetic touch pointers, which cannot be captured.
    if (event.isTrusted) canvas.setPointerCapture(event.pointerId);
  });
  canvas.addEventListener('pointermove', event => {
    if (event.pointerId !== pointerId) return;
    point(event);
    scene.time = clamp(dragTime + (dragY - event.clientY) / viewport.height * 24, 0, 23.95);
  });
  function release(event) {
    if (event.pointerId !== pointerId) return;
    scene.pointer.active = false; scene.pause = 3; pointerId = null;
  }
  canvas.addEventListener('pointerup', release);
  canvas.addEventListener('pointercancel', release);
  canvas.addEventListener('lostpointercapture', release);
  canvas.addEventListener('wheel', event => {
    event.preventDefault(); scene.time = clamp(scene.time + event.deltaY * 0.018, 0, 23.95); scene.pause = 3;
  }, { passive: false });
  window.addEventListener('resize', resize);
  document.addEventListener('visibilitychange', () => {
    last = performance.now(); accumulator = 0;
    if (document.hidden) { scene.pointer.active = false; pointerId = null; }
  });
  function frame(now) {
    const delta = Math.min(0.05, Math.max(0, (now - last) / 1000)); last = now;
    if (!document.hidden) {
      accumulator += delta;
      while (accumulator >= STEP) { advance(scene, STEP, viewport.height / (viewport.width / WIDTH)); accumulator -= STEP; }
      render(context, viewport, scene);
    }
    requestAnimationFrame(frame);
    // A real scene was painted in resize and this frame; the next frame is scheduled.
    if (!readySent && window.__gbSandbox && typeof window.__gbSandbox.ready === 'function') {
      window.__gbSandbox.ready(); readySent = true;
    }
  }
  // Capture uses the exact same scene factory, fixed step and renderer as live play.
  window.SwarmBuild = Object.freeze({ createScene, advance, render, duration: DURATION,
    inspect: () => ({ time: scene.time, loop: scene.loop, agents: scene.count, camera: scene.camera, pause: scene.pause, contact: scene.pointer.active, readySent, width: viewport.width, height: viewport.height, dpr: viewport.dpr }) });
  resize();
  requestAnimationFrame(frame);
})();
