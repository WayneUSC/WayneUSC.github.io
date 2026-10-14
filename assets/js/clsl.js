/* Closed-Loop State Legibility — a native, bilingual preview of the CLSL exhibit (clsl/).
 *
 * One turn of the loop, told in four acts around the belief rose:
 *   inner ring pᴿ  the robot's own state            (solid)
 *   middle ring q  what the observer believes        (solid)
 *   outer ring q̂  the robot's estimate of q         (dashed)
 *
 * The numbers are computed live with the exhibit's model (src/js/10_model.js, itself a port of clsl_sim.py):
 * same equations, same defaults, same starting distributions as the exhibit's overture (framework note §9).
 * Only the observer's reaction ("supplies information") is scripted, as it is in the exhibit.
 * The face is the Study 1 screen stimulus (src/js/12_face.js), drawn with identical geometry and AU presets.
 * Animation runs only while the exhibit is on screen and the tab is visible; reduced motion is respected. */

const NS = 5;
const STATE_NAMES = [['Normal', '正常'], ['Uncertain', '不确定'], ['Info missing', '信息不足'], ['Blocked', '执行受阻'], ['Needs help', '需要帮助']];
const ACTION_NAMES = {neutral: ['Stay neutral', '保持中性'], 'gaze-gap': ['Gaze at the missing label', '看向缺失信息'], verbal: ['Explain in words', '显式语言解释']};

/* ── model (unchanged arithmetic from the exhibit) ── */
const P_Y = [
  [.45, .05, .05, .05, .40],
  [.40, .15, .10, .30, .05],
  [.10, .65, .05, .18, .02],
  [.10, .10, .60, .18, .02],
  [.05, .20, .45, .28, .02]];
const ACTIONS = [
  {k: 'neutral', c: 0.00, eta: 0.05, L: [.60, .10, .10, .10, .10]},
  {k: 'hesitate', c: 0.08, eta: 0.30, L: [.15, .55, .20, .05, .05]},
  {k: 'confusion', c: 0.18, eta: 0.50, L: [.05, .35, .40, .15, .05]},
  {k: 'gaze-gap', c: 0.14, eta: 0.55, L: [.03, .15, .70, .09, .03]},
  {k: 'request-help', c: 0.30, eta: 0.62, L: [.02, .08, .15, .20, .55]},
  {k: 'verbal', c: 0.55, eta: 0.90, L: null}];
const DEFAULTS = {beta: .35, merr: .15, theta: .10, lam: .55, mu: .10, kappa: .12};
const norm = v => { let s = 0; for (const x of v) s += Math.max(x, 1e-12); return v.map(x => Math.max(x, 1e-12) / s); };
const log2 = x => Math.log(x) / Math.LN2;
const argmax = v => v.indexOf(Math.max(...v));
function jsd(p, q) {
  p = norm(p); q = norm(q); let d = 0;
  for (let i = 0; i < NS; i++) { const m = .5 * (p[i] + q[i]); d += .5 * p[i] * log2(p[i] / m) + .5 * q[i] * log2(q[i] / m); }
  return Math.max(0, d);
}
const entropy = p => { p = norm(p); return -p.reduce((a, x) => a + x * log2(x), 0); };
function signal(i, pR) {
  const L = ACTIONS[i].L; if (L) return norm(L.slice());
  const s = argmax(pR), v = new Array(NS).fill(.03); v[s] = .88; return norm(v);
}
function humanUpdate(q, i, pR) { const e = Math.min(.95, ACTIONS[i].eta), L = signal(i, pR); return norm(q.map((x, k) => (1 - e) * x + e * L[k])); }
function robotPredict(B, i, pR, me) {
  const e = Math.min(.95, ACTIONS[i].eta * (1 + .9 * me));
  let L = signal(i, pR); L = norm(L.map(x => (1 - me) * x + me / NS));
  const out = new Array(NS).fill(0);
  for (let m = 0; m < NS; m++) for (let j = 0; j < NS; j++) out[j] += B[m] * ((m === j ? (1 - e) : 0) + e * L[j]);
  return norm(out);
}
const robotCorrect = (Bp, y) => norm(Bp.map((b, m) => b * P_Y[m][y]));
const qHat = (B, k) => norm(B.map(b => (1 - k) * b + k / NS));
function infoGain(Bp) {
  const py = new Array(NS).fill(0);
  for (let m = 0; m < NS; m++) for (let y = 0; y < NS; y++) py[y] += Bp[m] * P_Y[m][y];
  let cond = 0; for (let m = 0; m < NS; m++) cond += Bp[m] * entropy(P_Y[m]);
  return Math.max(0, entropy(norm(py)) - cond);
}
/* a* = argmin over C(a) ≤ β of D(pᴿ, q̂′) + λ·C(a) − μ·I(m; y | a); silent while ê ≤ θ */
function choose(pR, B, P) {
  const eEst = jsd(pR, qHat(B, P.kappa));
  if (eEst <= P.theta) return {idx: 0, silent: true, eEst};
  let best = 0, bv = Infinity;
  ACTIONS.forEach((a, i) => {
    if (a.c > P.beta) return;
    const Bp = robotPredict(B, i, pR, P.merr), val = jsd(pR, qHat(Bp, P.kappa)) + P.lam * a.c - P.mu * infoGain(Bp);
    if (val < bv) { bv = val; best = i; }
  });
  return {idx: best, silent: false, eEst};
}
const STORY = (() => {
  const P = DEFAULTS;
  const pR = norm([.05, .10, .75, .05, .05]), q0 = norm([.10, .15, .10, .55, .10]);
  const B0 = norm([.05, .10, .15, .60, .10].map(x => (x - P.kappa / NS) / (1 - P.kappa)));
  const ch = choose(pR, B0, P), a = ch.idx, y = 1; /* reaction "supplies information": scripted, as in the exhibit */
  const q1 = humanUpdate(q0, a, pR), B1 = robotCorrect(robotPredict(B0, a, pR, P.merr), y), ch2 = choose(pR, B1, P);
  return {P, pR, q0, q1, qh0: qHat(B0, P.kappa), qh1: qHat(B1, P.kappa), action: ACTIONS[a], ee0: ch.eEst, ee1: ch2.eEst, standDown: ch2.silent};
})();

/* ── the Study 1 screen face (geometry and AU presets as in the exhibit) ── */
const AU_KEYS = ['au1', 'au2', 'au4', 'au5', 'au7', 'au12', 'au15', 'au20', 'au26', 'gazeX', 'gazeY', 'tilt'];
const AU_ZERO = Object.fromEntries(AU_KEYS.map(k => [k, 0]));
const FACE = {shell: '#B8C2C9', shellEdge: '#98A6AE', screen: '#151E26', feat: '#9ADCEB', pupil: '#0B1116'};
const FACE_ACTIONS = {
  neutral: {base: {}, idle: true, dyn: t => ({gazeY: .28 + .05 * Math.sin(t * .8), gazeX: .12 * Math.sin(t * .55)}), blink: [3, 5]},
  'gaze-gap': {base: {au1: .3, au2: .2, au5: .25}, idle: false, blink: [3, 4.5],
    dyn: t => { const ph = (t % 3.2) / 3.2, back = ph > .72 && ph < .95; return back ? {gazeX: .05, gazeY: -.55, au2: .3} : {gazeX: -.85, gazeY: .55, tilt: -.12}; }}
};
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const SVGNS = 'http://www.w3.org/2000/svg';
function sv(tag, attrs = {}, ...kids) {
  const node = document.createElementNS(SVGNS, tag);
  for (const [k, v] of Object.entries(attrs)) if (v != null) node.setAttribute(k, v);
  kids.forEach(kid => node.append(kid));
  return node;
}

export function mountClsl(root, lang) {
  const tr = pair => pair[lang === 'zh' ? 1 : 0];
  const text = (en, zh) => lang === 'zh' ? zh : en;
  const fmt = v => v.toFixed(3);
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const lifecycle = new AbortController(), signal = lifecycle.signal;
  const svg = root.querySelector('.clsl-rose'), caption = root.querySelector('[data-clsl-caption]');
  const actButtons = [...root.querySelectorAll('[data-clsl-act]')], playButton = root.querySelector('[data-clsl-play]');
  const readout = root.querySelector('[data-clsl-readout]');
  if (!svg || !caption || !readout) return {dispose() {}};

  /* ── rose ── */
  const C = 300, RINGS = {r: [128, 36], h: [172, 36], e: [216, 36]}, HALF = (72 / 2 - 6.5) * Math.PI / 180;
  const ang = i => (-90 + i * 72) * Math.PI / 180;
  const pt = (r, a) => `${(C + r * Math.cos(a)).toFixed(2)} ${(C + r * Math.sin(a)).toFixed(2)}`;
  const sector = (r0, r1, a0, a1) => `M ${pt(r0, a0)} A ${r0} ${r0} 0 0 1 ${pt(r0, a1)} L ${pt(r1, a1)} A ${r1} ${r1} 0 0 0 ${pt(r1, a0)} Z`;
  svg.textContent = '';
  /* The frame leaves room for the side labels inside the rose's own box, so they never run into the headline or readout. */
  const narrow = matchMedia('(max-width: 650px)');
  const frameRose = () => svg.setAttribute('viewBox', narrow.matches ? '-100 -14 800 624' : '-84 -10 768 620');
  frameRose(); narrow.addEventListener('change', frameRose, {signal});
  svg.append(sv('defs', {}, sv('radialGradient', {id: 'clslGlow', cx: '50%', cy: '50%', r: '50%'},
    sv('stop', {offset: '0', 'stop-color': '#4FD6E8', 'stop-opacity': '.13'}), sv('stop', {offset: '1', 'stop-color': '#4FD6E8', 'stop-opacity': '0'}))));
  svg.append(sv('circle', {cx: C, cy: C, r: 262, fill: 'url(#clslGlow)'}));
  for (const r of [124, 168, 212, 256]) svg.append(sv('circle', {cx: C, cy: C, r, class: 'clsl-guide'}));
  const rings = {};
  for (const key of ['r', 'h', 'e']) {
    const [r0, w] = RINGS[key], g = sv('g', {class: 'clsl-ring clsl-ring-' + key}), bars = [];
    for (let i = 0; i < NS; i++) {
      const a = ang(i);
      g.append(sv('path', {d: sector(r0, r0 + w, a - HALF, a + HALF), class: 'track'}));
      const bar = sv('path', {class: 'val'}); g.append(bar); bars.push(bar);
    }
    const peak = sv('circle', {r: 3.6, class: 'peak'}); g.append(peak);
    svg.append(g);
    rings[key] = {g, bars, peak, cur: new Array(NS).fill(1 / NS), tgt: new Array(NS).fill(1 / NS), vis: 0, visT: 0};
  }
  const keyAngle = -126 * Math.PI / 180;
  for (const [key, sym] of [['r', 'pᴿ'], ['h', 'q'], ['e', 'q̂']]) {
    const [r0, w] = RINGS[key], rr = r0 + w / 2;
    svg.append(sv('text', {x: C + rr * Math.cos(keyAngle), y: C + rr * Math.sin(keyAngle) + 5, 'text-anchor': 'middle', class: 'clsl-ring-key clsl-key-' + key}, document.createTextNode(sym)));
  }
  STATE_NAMES.forEach((name, i) => {
    const a = ang(i), c = Math.cos(a), x = C + 282 * c, y = C + 282 * Math.sin(a) + 6;
    svg.append(sv('text', {x, y, 'text-anchor': Math.abs(c) < .3 ? 'middle' : c > 0 ? 'start' : 'end', class: 'clsl-state', 'data-state': i}, document.createTextNode(tr(name))));
  });

  /* ── face, centred inside the inner ring ── */
  const faceSvg = sv('svg', {x: 208, y: 199, width: 184, height: 202.4, viewBox: '0 0 400 440', class: 'clsl-face', 'aria-hidden': 'true'});
  const fid = 'clslFace' + Math.random().toString(36).slice(2, 7);
  const defs = sv('defs');
  defs.append(sv('filter', {id: fid + 'Glow', x: '-40%', y: '-40%', width: '180%', height: '180%'},
    sv('feGaussianBlur', {stdDeviation: '2.2', result: 'b'}), sv('feMerge', {}, sv('feMergeNode', {in: 'b'}), sv('feMergeNode', {in: 'SourceGraphic'}))));
  defs.append(sv('linearGradient', {id: fid + 'Shell', x1: '0', y1: '0', x2: '0', y2: '1'}, sv('stop', {offset: '0', 'stop-color': '#C9D2D8'}), sv('stop', {offset: '1', 'stop-color': FACE.shell})));
  faceSvg.append(defs);
  const head = sv('g', {transform: 'translate(200,225)'}), tilt = sv('g');
  head.append(tilt); faceSvg.append(head);
  tilt.append(
    sv('rect', {x: -150, y: -175, width: 300, height: 350, rx: 70, fill: `url(#${fid}Shell)`, stroke: FACE.shellEdge, 'stroke-width': 3}),
    sv('rect', {x: -122, y: -140, width: 244, height: 280, rx: 46, fill: FACE.screen}),
    sv('rect', {x: -162, y: -40, width: 14, height: 80, rx: 7, fill: FACE.shellEdge}),
    sv('rect', {x: 148, y: -40, width: 14, height: 80, rx: 7, fill: FACE.shellEdge}),
    sv('path', {d: 'M -104 -118 Q -60 -132 10 -128', stroke: 'rgba(255,255,255,.10)', 'stroke-width': 6, fill: 'none', 'stroke-linecap': 'round'}));
  const glow = `url(#${fid}Glow)`;
  const browL = sv('rect', {x: -28, y: -5, width: 56, height: 10, rx: 5, fill: FACE.feat, filter: glow});
  const browR = sv('rect', {x: -28, y: -5, width: 56, height: 10, rx: 5, fill: FACE.feat, filter: glow});
  tilt.append(browL, browR);
  const eyes = [-58, 58].map((cx, n) => {
    const clipId = fid + 'Eye' + n, clip = sv('ellipse', {cx, cy: -8, rx: 30, ry: 17});
    defs.append(sv('clipPath', {id: clipId}, clip));
    const white = sv('ellipse', {cx, cy: -8, rx: 30, ry: 17, fill: FACE.feat, filter: glow}), pupil = sv('circle', {cx, cy: -8, r: 9.5, fill: FACE.pupil});
    tilt.append(sv('g', {'clip-path': `url(#${clipId})`}, white, pupil));
    return {cx, clip, white, pupil};
  });
  const mouth = sv('path', {fill: 'none', stroke: FACE.feat, 'stroke-width': 6, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', filter: glow});
  tilt.append(mouth);
  svg.append(faceSvg);

  const face = {cur: {...AU_ZERO}, base: {...AU_ZERO}, spec: FACE_ACTIONS.neutral, t0: 0, k: 4, blinkAt: 1.5, blink: [3, 5], saccadeAt: 1, idle: {x: 0, y: 0}};
  function setFace(key, now) {
    const spec = FACE_ACTIONS[key] || FACE_ACTIONS.neutral;
    face.spec = spec; face.base = {...AU_ZERO, ...spec.base}; face.t0 = now; face.k = 4 / .7; face.blink = spec.blink;
  }
  function drawFace(now, dt) {
    const goal = {...AU_ZERO}, dyn = face.spec.dyn((now - face.t0)) || {};
    for (const k of AU_KEYS) goal[k] = (face.base[k] || 0) + (dyn[k] || 0);
    if (face.spec.idle && !reduced) {
      if (now >= face.saccadeAt) { face.idle = {x: (Math.random() - .5) * .25, y: (Math.random() - .5) * .18}; face.saccadeAt = now + 1 + Math.random() * 1.6; }
      goal.gazeX += face.idle.x; goal.gazeY += face.idle.y;
    }
    const k = reduced ? 1 : clamp(face.k * dt, 0, 1), kFast = reduced ? 1 : clamp(8 * dt, 0, 1);
    for (const key of AU_KEYS) face.cur[key] += (goal[key] - face.cur[key]) * (key === 'gazeX' || key === 'gazeY' ? kFast : k);
    let blinkMul = 1;
    if (!reduced && now >= face.blinkAt) {
      const ph = (now - face.blinkAt) / .14;
      if (ph >= 1) face.blinkAt = now + face.blink[0] + Math.random() * (face.blink[1] - face.blink[0]);
      else blinkMul = ph < .5 ? 1 - ph * 2 : (ph - .5) * 2;
    }
    const c = face.cur, bob = reduced ? 0 : Math.sin(now * 1.1) * 2.2;
    const lift = -c.au1 * 7 - c.au2 * 11 + c.au4 * 10, knit = c.au4 * 9;
    const aperture = clamp(0.85 + c.au5 * 0.55 - c.au7 * 0.62, 0.06, 1.5) * blinkMul;
    const ry = Math.max(1.2, 17 * aperture), rx = 30 * (1 - c.au7 * 0.12);
    const w = 50 * (1 + c.au20 * 0.35), sm = c.au12 * 24 - c.au15 * 18, yC = 78;
    tilt.setAttribute('transform', `translate(0, ${bob.toFixed(2)}) rotate(${(c.tilt * 8).toFixed(2)})`);
    browL.setAttribute('transform', `translate(${(-58 + knit).toFixed(2)}, ${(-62 + lift).toFixed(2)}) rotate(${(-c.au1 * 15 + c.au4 * 17).toFixed(2)})`);
    browR.setAttribute('transform', `translate(${(58 - knit).toFixed(2)}, ${(-62 + lift).toFixed(2)}) rotate(${(c.au1 * 15 - c.au4 * 17).toFixed(2)})`);
    eyes.forEach(e => {
      for (const node of [e.white, e.clip]) { node.setAttribute('rx', rx.toFixed(2)); node.setAttribute('ry', ry.toFixed(2)); }
      e.pupil.setAttribute('cx', (e.cx + c.gazeX * 11).toFixed(2)); e.pupil.setAttribute('cy', (-8 + c.gazeY * 7.5).toFixed(2));
    });
    mouth.setAttribute('d', `M ${-w} ${yC - sm * .7} Q 0 ${yC + sm * .5} ${w} ${yC - sm * .7}`);
  }

  /* ── the four acts ── */
  const S = STORY, P = S.P, stateName = v => tr(STATE_NAMES[argmax(v)]);
  const ACTS = [
    {title: ['The truth', '真实状态'],
      body: ['A home robot is fetching your medicine, but the bottle’s label is missing. Its actual state is “info missing.”', '家用机器人在帮你拿药，但药瓶的标签不见了。它真实处于「信息不足」。'],
      beats: [{at: 0, r: S.pR, h: S.q0, show: {r: 1, h: .18, e: 0}, face: 'neutral', ee: null, act: null}]},
    {title: ['The misreading', '误读'],
      body: ['You think it is stuck. The robot estimates that misreading: its estimated error ê rises above the threshold θ, so it decides to respond.', '你以为它「执行受阻」。机器人估计出这个误读：估计误差 ê 高于阈值 θ，于是决定回应。'],
      beats: [{at: 0, show: {r: 1, h: 1, e: 0}}, {at: .9, e: S.qh0, show: {r: 1, h: 1, e: 1}, ee: S.ee0}]},
    {title: ['The expression', '表达'],
      body: ['Within its expressive budget, it chooses a glance at the missing label rather than the most dramatic failure face. Explaining in words would exceed the budget.', '在表达预算之内，它选择「看向缺失信息」，而不是最夸张的「失败脸」；用语言解释则超出了预算。'],
      beats: [{at: 0, face: S.action.k, act: S.action}]},
    {title: ['The repair', '纠偏'],
      body: ['You tell it where the bottle is. That reaction revises its estimate of how you see it; the error falls and it returns to neutral.', '你告诉它药瓶在哪里。这个反应修正了它对「你如何看我」的估计；误差回落，它回到中性，不再多表达。'],
      beats: [{at: 0, h: S.q1}, {at: 1.1, e: S.qh1}, {at: 2.2, ee: S.ee1, face: S.standDown ? 'neutral' : S.action.k, act: S.standDown ? ACTIONS[0] : S.action}]}
  ];
  const ACT_MS = 4600, END_MS = 7000;
  let act = 0, actT0 = 0, beatsDone = 0, playing = !reduced, visible = false, frame = 0, last = 0, autoTimer = 0;
  let model = {ee: null, act: null};
  const state = {r: S.pR, h: S.q0, e: S.qh0, show: {r: 1, h: .18, e: 0}};

  function renderReadout() {
    const ee = model.ee, pct = ee == null ? 0 : clamp(ee / .5, 0, 1) * 100, th = P.theta / .5 * 100, over = ee != null && ee > P.theta;
    const row = (cls, sym, label, value) => `<div class="clsl-read-row"><span class="clsl-swatch ${cls}" aria-hidden="true"></span><span class="clsl-read-k"><i>${sym}</i> ${label}</span><b>${value}</b></div>`;
    readout.innerHTML =
      row('r', 'pᴿ', text('Robot’s state', '机器人的实际状态'), stateName(state.r)) +
      row('h', 'q', text('Your reading', '你以为的状态'), state.show.h > .5 ? stateName(state.h) : '—') +
      row('e', 'q̂', text('Its estimate of your reading', '它以为你以为的'), state.show.e > .5 ? stateName(state.e) : '—') +
      `<div class="clsl-gauge${over ? ' is-over' : ''}${ee == null ? ' is-idle' : ''}"><div class="clsl-gauge-k"><span><i>ê</i> ${text('Estimated misreading', '估计误读')}</span><b>${ee == null ? '—' : fmt(ee)}</b></div>` +
      `<div class="clsl-gauge-track"><span class="clsl-gauge-fill" style="width:${pct.toFixed(1)}%"></span><span class="clsl-gauge-theta" style="left:${th.toFixed(1)}%"></span></div>` +
      `<div class="clsl-gauge-note">${ee == null ? text('Not yet estimated', '尚未估计') : over ? text(`Above θ = ${P.theta.toFixed(2)}: respond`, `高于 θ = ${P.theta.toFixed(2)}：回应`) : text(`Below θ = ${P.theta.toFixed(2)}: stay quiet`, `低于 θ = ${P.theta.toFixed(2)}：保持安静`)}</div></div>` +
      `<div class="clsl-read-act"><span>${text('Expression', '面部表达')}</span><b>${model.act ? tr(ACTION_NAMES[model.act.k] || [model.act.k, model.act.k]) : '—'}</b>${model.act ? `<em>${text('cost', '成本')} ${model.act.c.toFixed(2)} · β ${P.beta.toFixed(2)}</em>` : ''}</div>`;
  }
  function applyBeat(b, now) {
    if (b.r) state.r = b.r; if (b.h) state.h = b.h; if (b.e) state.e = b.e; if (b.show) state.show = {...state.show, ...b.show};
    if ('ee' in b) model.ee = b.ee; if ('act' in b) model.act = b.act;
    if (b.face) setFace(b.face, now);
    rings.r.tgt = state.r.slice(); rings.h.tgt = state.h.slice(); rings.e.tgt = state.e.slice();
    rings.r.visT = state.show.r; rings.h.visT = state.show.h; rings.e.visT = state.show.e;
    renderReadout();
  }
  /* Rebuild an act from the start of the story so jumping between acts always lands on the same computed state. */
  function goAct(i, now, instantly) {
    act = (i + ACTS.length) % ACTS.length; actT0 = now; beatsDone = 0;
    Object.assign(state, {r: S.pR, h: S.q0, e: S.qh0, show: {r: 1, h: .18, e: 0}}); model = {ee: null, act: null};
    for (let k = 0; k < act; k++) ACTS[k].beats.forEach(b => applyBeat(b, now));
    actButtons.forEach((b, k) => { b.setAttribute('aria-current', k === act ? 'step' : 'false'); b.classList.toggle('is-done', k < act); });
    caption.innerHTML = `<b>${tr(ACTS[act].title)}${text('.', '：')}</b>${text(' ', '')}${tr(ACTS[act].body)}`;
    root.style.setProperty('--clsl-act-ms', (act === ACTS.length - 1 ? END_MS : ACT_MS) + 'ms');
    /* restart the progress line of the current act */
    const list = root.querySelector('.clsl-acts');
    if (list) { list.classList.remove('is-running'); void list.offsetWidth; list.classList.toggle('is-running', playing); }
    stepBeats(now);
    if (instantly || reduced) {
      while (beatsDone < ACTS[act].beats.length) applyBeat(ACTS[act].beats[beatsDone++], now);
      for (const ring of Object.values(rings)) { ring.cur = ring.tgt.slice(); ring.vis = ring.visT; }
      drawFace(now, 1);
    }
    renderRings();
  }
  function stepBeats(now) {
    const beats = ACTS[act].beats;
    while (beatsDone < beats.length && now - actT0 >= beats[beatsDone].at) applyBeat(beats[beatsDone++], now);
  }
  function renderRings() {
    for (const [key, ring] of Object.entries(rings)) {
      const [r0, w] = RINGS[key];
      ring.g.style.opacity = (.1 + .9 * ring.vis).toFixed(3);
      for (let i = 0; i < NS; i++) {
        const a = ang(i), len = Math.max(1.2, ring.cur[i] * w);
        ring.bars[i].setAttribute('d', sector(r0, r0 + len, a - HALF, a + HALF));
      }
      const m = argmax(ring.cur), a = ang(m), rr = r0 + Math.max(1.2, ring.cur[m] * w) + 7;
      ring.peak.setAttribute('cx', (C + rr * Math.cos(a)).toFixed(2)); ring.peak.setAttribute('cy', (C + rr * Math.sin(a)).toFixed(2));
    }
    svg.querySelectorAll('.clsl-state').forEach(label => label.classList.toggle('is-true', Number(label.dataset.state) === argmax(state.r)));
  }
  function tick(time) {
    frame = 0;
    if (!visible || document.hidden || signal.aborted) { last = 0; return; }
    const now = time / 1000, dt = last ? Math.min(now - last, .05) : 0; last = now;
    stepBeats(now);
    const k = 1 - Math.exp(-dt * 5.5);
    for (const ring of Object.values(rings)) {
      ring.vis += (ring.visT - ring.vis) * k;
      for (let i = 0; i < NS; i++) ring.cur[i] += (ring.tgt[i] - ring.cur[i]) * k;
    }
    renderRings();
    drawFace(now, dt);
    if (reduced) return;   /* one still frame per change; no continuous motion */
    frame = requestAnimationFrame(tick);
  }
  const start = () => { if (!frame && visible && !document.hidden) frame = requestAnimationFrame(tick); };
  function schedule() {
    clearTimeout(autoTimer);
    if (!playing || !visible || document.hidden) return;
    autoTimer = setTimeout(() => { goAct(act + 1, performance.now() / 1000); schedule(); }, act === ACTS.length - 1 ? END_MS : ACT_MS);
  }
  function setPlaying(on) {
    playing = on;
    root.classList.toggle('is-playing', on);
    if (playButton) {
      playButton.setAttribute('aria-pressed', String(on));
      playButton.querySelector('[data-clsl-play-label]').textContent = on ? text('Pause', '暂停') : text('Play', '播放');
    }
    if (on) goAct(act, performance.now() / 1000);
    else root.querySelector('.clsl-acts')?.classList.remove('is-running');
    schedule();
  }
  actButtons.forEach((button, i) => button.addEventListener('click', () => { setPlaying(false); goAct(i, performance.now() / 1000); start(); }, {signal}));
  playButton?.addEventListener('click', () => setPlaying(!playing), {signal});
  document.addEventListener('visibilitychange', () => { if (document.hidden) clearTimeout(autoTimer); else { start(); schedule(); } }, {signal});

  goAct(0, performance.now() / 1000, true);
  drawFace(0, 0);
  setPlaying(playing);
  root.classList.add('is-ready');
  const observer = 'IntersectionObserver' in window ? new IntersectionObserver(entries => {
    const was = visible; visible = entries[0].isIntersecting;
    if (visible && !was) { if (playing) goAct(act, performance.now() / 1000); start(); schedule(); }
    if (!visible) clearTimeout(autoTimer);
  }, {threshold: .25}) : null;
  if (observer) observer.observe(root.querySelector('.clsl-screen') || root); else { visible = true; start(); schedule(); }

  return {
    dispose() {
      lifecycle.abort(); clearTimeout(autoTimer); cancelAnimationFrame(frame); observer?.disconnect();
    }
  };
}
