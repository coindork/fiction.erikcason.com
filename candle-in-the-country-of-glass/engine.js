/* engine.js: scroll engine for The Glass Librarian.
   Each scene is a tall panel with a sticky stage. Its drawing inks itself in as it arrives (e),
   then its story plays out as you scroll through it (p), with parallax layers moving at their own speeds,
   the way the-bea.st (2012) moved its drawings. */
(function () {
  'use strict';
  var Pen = window.Pen, SCENES = window.SCENES;
  Pen.setDefs(document.getElementById('globaldefs'));
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var still = /#still=(\d+)(?:,([\d.]+))?(?:,(v|c))?/.exec(location.hash);
  if (still) document.documentElement.classList.add('still');
  if (still && still[3] === 'v') document.documentElement.classList.add('withverse');
  if (still && still[3] === 'c') document.documentElement.classList.add('clean');  // the drawing alone, for a cover image

  var list = [].slice.call(document.querySelectorAll('section.scene')).map(function (sec) {
    var svg = sec.querySelector('svg.art'), cv = sec.querySelector('canvas.fx');
    var S = { sec: sec, svg: svg, cv: cv, cx: cv.getContext('2d'), stage: sec.querySelector('.stage'), flash: sec.querySelector('.flash'),
      i: +sec.getAttribute('data-i'), focus: +sec.getAttribute('data-fx') || 800, dark: sec.classList.contains('dark'),
      layers: [], beats: [], p: -1, e: -1, parts: [], vb: [0, 0, 1600, 1000] };
    var api = {
      svg: svg, dark: S.dark, stage: S.stage, flashEl: S.flash,
      layer: function (depth) { var l = Pen.g(svg, { 'data-depth': depth || 0 }); l._depth = depth || 0; S.layers.push(l); return l; },
      beat: function (parent, k) { var b = Pen.g(parent, { 'data-beat': k }); b._k = k; S.beats.push(b); return b; }
    };
    var def = SCENES['s' + S.i];
    Pen.seed(1000 + S.i * 7919);
    S.def = def ? def(api) || {} : {};
    S.parts = makeParticles(S.def.fx || {});
    return S;
  });

  // ---- particles: rain, dust motes in a quad, gold dust rising ----
  function makeParticles(fx) {
    var P = [];
    if (fx.rain) for (var i = 0; i < (fx.rain.n || 160); i++) { var rb = fx.rain.box || [0, 0, 1600, 1000]; P.push({ k: 'rain', b: rb, x: rb[0] + Math.random() * rb[2], y: rb[1] + Math.random() * rb[3], v: 9 + Math.random() * 7, l: 10 + Math.random() * 18, c: fx.rain.c }); }
    if (fx.motes) for (i = 0; i < (fx.motes.n || 70); i++) P.push({ k: 'mote', u: Math.random(), w: Math.random(), du: (Math.random() - 0.5) * 0.0006, dw: 0.0004 + Math.random() * 0.0009, r: 0.8 + Math.random() * 2, ph: Math.random() * 6, q: fx.motes.quad, c: fx.motes.c });
    if (fx.rise) for (i = 0; i < (fx.rise.n || 60); i++) P.push({ k: 'rise', b: fx.rise.box, x: Math.random(), y: Math.random(), v: 0.0006 + Math.random() * 0.0012, r: 0.8 + Math.random() * 2.4, ph: Math.random() * 6, c: fx.rise.c });
    if (fx.spark) for (i = 0; i < (fx.spark.n || 14); i++) P.push({ k: 'spark', b: fx.spark.box, x: Math.random(), y: Math.random(), ph: Math.random() * 6, r: 3 + Math.random() * 5, c: fx.spark.c });
    return P;
  }
  function quadPt(q, u, w) { var a = Pen.lp(q[0], q[1], u), b = Pen.lp(q[3], q[2], u); return Pen.lp(a, b, w); }
  function drawParticles(S, t, dt) {
    var c = S.cx, k = S.k, ox = S.ox, oy = S.oy, on = S.fxOn;
    c.clearRect(0, 0, S.cv.width, S.cv.height);
    if (!S.parts.length) return;
    for (var i = 0; i < S.parts.length; i++) {
      var q = S.parts[i];
      if (q.k === 'rain') {
        if (!on.rain) continue;
        q.y += q.v * dt * 0.06; if (q.y > q.b[1] + q.b[3]) { q.y = q.b[1] - q.l; q.x = q.b[0] + Math.random() * q.b[2]; }
        c.strokeStyle = q.c || 'rgba(239,230,210,.38)'; c.lineWidth = Math.max(1, k * 1.1);
        c.beginPath(); c.moveTo(ox + q.x * k, oy + q.y * k); c.lineTo(ox + (q.x - 2) * k, oy + (q.y + q.l) * k); c.stroke();
      } else if (q.k === 'mote') {
        q.w += q.dw * dt * 0.06; q.u += q.du * dt * 0.06 + Math.sin(t * 0.0007 + q.ph) * 0.0002;
        if (q.w > 1) { q.w = 0; q.u = Math.random(); } if (q.u < 0 || q.u > 1) q.u = Math.random();
        var m = quadPt(q.q, q.u, q.w), tw = 0.45 + 0.55 * Math.sin(t * 0.002 + q.ph);
        c.fillStyle = q.c || 'rgba(255,236,170,' + (0.75 * tw).toFixed(3) + ')';
        c.beginPath(); c.arc(ox + m[0] * k, oy + m[1] * k, q.r * k * 1.2, 0, 6.283); c.fill();
      } else if (q.k === 'rise') {
        if (!on.rise) continue;
        q.y -= q.v * dt * 0.06; if (q.y < 0) { q.y = 1; q.x = Math.random(); }
        var bx = q.b, x = bx[0] + (q.x + Math.sin(t * 0.0009 + q.ph) * 0.06) * bx[2], y = bx[1] + q.y * bx[3], al = Math.min(1, q.y * 3) * Math.min(1, (1 - q.y) * 4);
        c.fillStyle = 'rgba(232,176,62,' + (0.85 * al * on.rise).toFixed(3) + ')';
        c.beginPath(); c.arc(ox + x * k, oy + y * k, q.r * k, 0, 6.283); c.fill();
      } else if (q.k === 'spark') {
        if (!on.spark) continue;
        var s = Math.max(0, Math.sin(t * 0.0021 + q.ph * 3)), sx = ox + (q.b[0] + q.x * q.b[2]) * k, sy = oy + (q.b[1] + q.y * q.b[3]) * k, r = q.r * k * s * on.spark;
        if (r < 0.3) continue;
        c.strokeStyle = 'rgba(255,240,190,' + (0.9 * s).toFixed(3) + ')'; c.lineWidth = Math.max(1, k);
        c.beginPath(); c.moveTo(sx - r, sy); c.lineTo(sx + r, sy); c.moveTo(sx, sy - r); c.lineTo(sx, sy + r); c.stroke();
      }
    }
  }

  // ---- layout: the stage's view box follows the screen, cropping around the scene's focus on narrow screens ----
  function layout() {
    var W = window.innerWidth, H = window.innerHeight, dpr = Math.min(2, window.devicePixelRatio || 1);
    list.forEach(function (S) {
      var r = S.stage.getBoundingClientRect(), w = r.width || W, h = r.height || H, ratio = w / h;
      if (ratio >= 1.6) { S.vb = [0, 0, 1600, 1000]; S.k = w / 1600; S.ox = 0; S.oy = (h - 1000 * S.k) / 2; }
      else { var vw = 1000 * ratio, vx = Pen.clamp(S.focus - vw / 2, 0, 1600 - vw); S.vb = [vx, 0, vw, 1000]; S.k = h / 1000; S.ox = -vx * S.k; S.oy = 0; }
      S.svg.setAttribute('viewBox', S.vb.map(function (n) { return Math.round(n); }).join(' '));
      S.cv.width = Math.round(w * dpr); S.cv.height = Math.round(h * dpr);
      S.k *= dpr; S.ox *= dpr; S.oy *= dpr;
    });
  }

  // ---- per frame ----
  function apply(S, p, e) {
    var vh = 1000;
    if (e !== S.e) {
      for (var i = 0; i < S.beats.length; i++) {
        var b = S.beats[i], t = Pen.clamp((e - 0.18 - b._k * 0.085) / 0.2, 0, 1);
        if (b._t !== t) { b._t = t; b.style.opacity = t; }
      }
    }
    if (p !== S.p || e !== S.e) {
      for (i = 0; i < S.layers.length; i++) {
        var L = S.layers[i];
        if (L._depth) L.setAttribute('transform', 'translate(0 ' + ((0.5 - p) * L._depth).toFixed(1) + ')');
      }
      if (S.def.update) S.def.update(p, e);
      S.p = p; S.e = e;
    }
  }
  var last = performance.now(), visible = [];
  function frame(t) {
    var dt = Math.min(50, t - last); last = t;
    var vh = window.innerHeight;
    visible = [];
    for (var i = 0; i < list.length; i++) {
      var S = list[i];
      if (still) { if (S.i !== +still[1]) continue; apply(S, +(still[2] || 0.5), 1); }
      else {
        var r = S.sec.getBoundingClientRect();
        if (r.bottom < -40 || r.top > vh + 40) continue;
        var e = Pen.clamp((vh - r.top) / vh, 0, 1), span = Math.max(1, r.height - vh), p = Pen.clamp(-r.top / span, 0, 1);
        apply(S, p, e);
      }
      visible.push(S);
      S.fxOn = (S.def.fxOn && S.def.fxOn(S.p)) || { rain: 1, rise: 1, spark: 1 };
      if (!reduce || still) drawParticles(S, t, dt);
    }
    var doc = document.documentElement, max = doc.scrollHeight - vh;
    if (progress) progress.style.width = (max > 0 ? (window.scrollY / max) * 100 : 0).toFixed(2) + '%';
    if (floatBtn) floatBtn.classList.toggle('show', window.scrollY > vh * 0.8 || playing);
    requestAnimationFrame(frame);
  }

  // ---- play ----
  // With a reading (window.NARRATION, from narration/narration.js) Play reads the story aloud and the scroll follows the voice:
  // while a paragraph is read, the spoken line stays near the middle of the screen; between paragraphs the scroll glides
  // for N.hold seconds while the next drawing plays. Without one, Play is a slow continuous scroll at reading pace.
  // Any touch, wheel or key pauses; Play again resumes from wherever the page is.
  var progress = document.getElementById('progress'), floatBtn = document.getElementById('play'), playing = false, pf = 0;
  var N = window.NARRATION, sim = /#nsim/.test(location.hash), voice = null, simLog = [];
  var SIM_RATE = 40;  // checking aid (#nsim): a silent clock 40 times faster than real time, results written into the page
  var raf = sim ? function (f) { return setTimeout(function () { f(performance.now()); }, 16); } : requestAnimationFrame.bind(window);  // headless pages get no frames
  var caf = sim ? clearTimeout : cancelAnimationFrame.bind(window);
  function verseOf(k) { var s = document.getElementById('p' + k); return s && s.querySelector('.verse'); }
  function band(k) {  // the scroll positions where paragraph k starts and finishes being read
    var v = verseOf(k), vh = window.innerHeight, top = v.getBoundingClientRect().top + window.scrollY;
    return [top - 0.58 * vh, top + v.offsetHeight - 0.42 * vh];
  }
  function makeVoice() {
    if (!sim) { var a = new Audio(N.src); a.preload = 'auto'; return a; }
    var f = { currentTime: 0, paused: true, ended: false, _t: performance.now(),
      play: function () { f.paused = false; f._t = performance.now(); return Promise.resolve(); }, pause: function () { f.paused = true; } };
    (function tick(t) { if (!f.paused) f.currentTime += (t - f._t) / 1000 * SIM_RATE; f._t = t; raf(tick); })(performance.now());
    return f;
  }
  function narrate() {
    voice = voice || makeVoice();
    var K = N.paras.length, y0 = window.scrollY, k = 1, b;
    while (k <= K && (b = band(k))[1] <= y0 + 1) k++;  // the first paragraph not yet finished
    if (k > K) move(K + 1);
    else if (y0 > b[0] + 1) read(k, (y0 - b[0]) / (b[1] - b[0]));  // mid-paragraph: pick up the voice at the same place
    else move(k);
  }
  function move(k) {  // glide to where paragraph k starts (past the last one: to the end card)
    var from = window.scrollY, t0 = performance.now(), dur = (N.hold || 4.5) * 1000 / (sim ? SIM_RATE : 1), K = N.paras.length;
    (function step(t) {
      if (!playing) return;
      var to = k > K ? document.documentElement.scrollHeight - window.innerHeight : band(k)[0];
      var u = Math.min(1, (t - t0) / dur), e = u < 0.5 ? 2 * u * u : 1 - Math.pow(2 - 2 * u, 2) / 2;
      window.scrollTo(0, from + (to - from) * e);
      if (u < 1) { pf = raf(step); return; }
      if (sim) simLog.push({ move: k, ms: Math.round((t - t0) * SIM_RATE) });
      if (k > K) { setPlay(false); if (sim) simDone(true); return; }
      read(k, 0);
    })(t0);
  }
  function read(k, f) {
    var a = N.paras[k - 1][0], z = N.paras[k - 1][1], first = true;
    voice.currentTime = a + f * (z - a);
    var go = voice.play(); if (go && go.catch) go.catch(function () { setPlay(false); });
    (function step() {
      if (!playing) return;
      var b = band(k), u = Pen.clamp((voice.currentTime - a) / (z - a), 0, 1);
      window.scrollTo(0, b[0] + (b[1] - b[0]) * u);
      if (sim && (first || u >= 1)) {  // where the spoken line sits on screen, as a share of the screen's height
        var r = verseOf(k).getBoundingClientRect();
        simLog.push({ para: k, at: +u.toFixed(2), line: +((r.top + u * r.height) / window.innerHeight).toFixed(3), voice: +voice.currentTime.toFixed(2) });
        first = false; simDone(false);
      }
      if (u < 1 && !voice.ended) { pf = raf(step); return; }
      voice.pause(); move(k + 1);
    })();
  }
  function simDone(done) { var pre = document.getElementById('nsim-out') || document.body.appendChild(document.createElement('pre')); pre.id = 'nsim-out'; pre.textContent = JSON.stringify({ done: !!done, log: simLog }); }
  function setPlay(on) {
    playing = on;
    [].forEach.call(document.querySelectorAll('.playbtn, #play'), function (b) { b.textContent = on ? 'Pause' : 'Play'; });
    caf(pf);
    if (!on) { if (voice) voice.pause(); return; }
    if (N) { narrate(); return; }
    var t0 = performance.now(), y = window.scrollY; (function step(t) { if (!playing) return; var dt = Math.min(60, t - t0); t0 = t; y += dt * 0.042; window.scrollTo(0, y); if (y >= document.documentElement.scrollHeight - window.innerHeight - 2) { setPlay(false); return; } pf = raf(step); })(t0);
  }
  if (sim && N) setTimeout(function () { window.scrollTo(0, 0); setPlay(true); }, 300);
  [].forEach.call(document.querySelectorAll('.playbtn, #play'), function (b) { b.addEventListener('click', function (ev) { ev.stopPropagation(); setPlay(!playing); }); });
  ['wheel', 'touchstart', 'keydown'].forEach(function (n) { window.addEventListener(n, function () { if (playing) setPlay(false); }, { passive: true }); });
  var again = document.querySelector('.again');
  if (again) again.addEventListener('click', function (ev) { ev.preventDefault(); window.scrollTo(0, 0); });

  if (still) list.forEach(function (S) { if (S.i === +still[1]) S.sec.classList.add('shown'); });
  var shift = /#shift=(\d+)/.exec(location.hash);  // checking aid: shows content further down without scrolling
  if (shift) document.body.style.transform = 'translateY(-' + shift[1] + 'px)';
  layout();
  window.addEventListener('resize', layout);
  requestAnimationFrame(frame);
})();
