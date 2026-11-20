/* pen.js: an ink, wash and glass drawing kit for The Glass Librarian.
   Everything is drawn in SVG from seeded randomness, so each drawing is the same on every visit. */
(function (W) {
  'use strict';
  var NS = 'http://www.w3.org/2000/svg';
  var C = { ink: '#1e1c19', paper: '#f7eedb', night: '#12110f', nightink: '#efe6d2',
            glass: '#35525f', glassWash: '#a7c4d1', gold: '#d9a02a', goldDeep: '#b5800f', goldPale: '#f3cf7a',
            slate: '#55636e', slateDark: '#2f3840' };
  var st = 1;
  function seed(n) { st = (n >>> 0) || 1; }
  function rnd() { st = (st + 0x6D2B79F5) >>> 0; var t = st; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }
  function rr(a, b) { return a + (b - a) * rnd(); }
  function jj(a) { return (rnd() * 2 - 1) * a; }
  function f1(n) { return Math.round(n * 10) / 10; }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function lp(p, q, t) { return [lerp(p[0], q[0], t), lerp(p[1], q[1], t)]; }
  function add(p, q) { return [p[0] + q[0], p[1] + q[1]]; }
  function clamp(x, a, b) { return x < a ? a : x > b ? b : x; }

  function el(tag, at, parent) {
    var e = document.createElementNS(NS, tag);
    if (at) for (var k in at) if (at[k] != null) e.setAttribute(k, at[k]);
    if (parent) parent.appendChild(e);
    return e;
  }
  function g(parent, at) { return el('g', at || {}, parent); }

  function cr(p0, p1, p2, p3, t) {
    var t2 = t * t, t3 = t2 * t, o = [];
    for (var d = 0; d < 2; d++) o.push(0.5 * (2 * p1[d] + (-p0[d] + p2[d]) * t + (2 * p0[d] - 5 * p1[d] + 4 * p2[d] - p3[d]) * t2 + (-p0[d] + 3 * p1[d] - 3 * p2[d] + p3[d]) * t3));
    return o;
  }
  function spline(pts, steps) {
    var n = pts.length, out = [];
    if (n < 2) return pts.slice();
    for (var i = 0; i < n - 1; i++) {
      var p0 = pts[i ? i - 1 : 0], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2 < n ? i + 2 : n - 1];
      for (var k = 0; k < steps; k++) out.push(cr(p0, p1, p2, p3, k / steps));
    }
    out.push(pts[n - 1].slice());
    return out;
  }
  function splineClosed(pts, steps) {
    var n = pts.length, out = [];
    for (var i = 0; i < n; i++) {
      var p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
      for (var k = 0; k < steps; k++) out.push(cr(p0, p1, p2, p3, k / steps));
    }
    return out;
  }
  function jit(pts, a) { return pts.map(function (p) { return [p[0] + jj(a), p[1] + jj(a)]; }); }
  function poly(P, close) {
    var d = 'M' + f1(P[0][0]) + ' ' + f1(P[0][1]);
    for (var i = 1; i < P.length; i++) d += 'L' + f1(P[i][0]) + ' ' + f1(P[i][1]);
    return d + (close ? 'Z' : '');
  }
  function bow(seg, b) { // two points become a slightly bowed hand-drawn line
    if (seg.length !== 2) return seg;
    var m = lp(seg[0], seg[1], rr(0.4, 0.6));
    return [seg[0], [m[0] + jj(b), m[1] + jj(b)], seg[1]];
  }

  // a tapered, pressure-varied stroke drawn as a filled shape
  function brush(parent, pts, w, o) {
    o = o || {};
    if (pts.length === 2) pts = bow(pts, o.bow == null ? w * 0.6 : o.bow);
    var P = spline(jit(pts, o.j == null ? 0.8 : o.j), o.steps || 6), n = P.length, L = [], R = [];
    var ph = rnd() * 6, ph2 = rnd() * 6, t0 = o.t0 == null ? 0.1 : o.t0;
    for (var i = 0; i < n; i++) {
      var a = P[i > 0 ? i - 1 : 0], b = P[i < n - 1 ? i + 1 : n - 1], dx = b[0] - a[0], dy = b[1] - a[1], len = Math.hypot(dx, dy) || 1;
      dx /= len; dy /= len;
      var t = n > 1 ? i / (n - 1) : 0.5;
      var taper = t0 + (1 - t0) * Math.pow(Math.sin(Math.PI * (o.blunt ? 0.2 + 0.6 * t : t)), 0.5);
      var hw = w * 0.5 * taper * (0.8 + 0.2 * Math.sin(t * 9 + ph) + 0.1 * Math.sin(t * 23 + ph2));
      L.push([P[i][0] - dy * hw, P[i][1] + dx * hw]);
      R.push([P[i][0] + dy * hw, P[i][1] - dx * hw]);
    }
    return el('path', { d: poly(L.concat(R.reverse()), true), fill: o.c || C.ink, opacity: o.op, class: o.cls }, parent);
  }
  // a hairline that can draw itself (pathLength 1)
  function line(parent, pts, w, o) {
    o = o || {};
    if (pts.length === 2) pts = bow(pts, o.bow == null ? 1.5 : o.bow);
    var P = spline(jit(pts, o.j == null ? 1 : o.j), o.steps || 5);
    return el('path', { d: poly(P), fill: 'none', stroke: o.c || C.ink, 'stroke-width': w || 1, 'stroke-linecap': 'round',
      'stroke-linejoin': 'round', opacity: o.op, pathLength: 1, class: 'ln' + (o.cls ? ' ' + o.cls : '') }, parent);
  }
  // a brush stroke with a loose hairline echo beside it, the way a pen goes over a line twice
  function ink(parent, pts, w, o) {
    o = o || {};
    var b = brush(parent, pts, w, o);
    if (o.echo !== false) line(parent, pts, Math.max(0.45, w * 0.2), { c: o.c, j: (o.j == null ? 0.8 : o.j) * 2.4 + 0.6, op: (o.op == null ? 1 : o.op) * 0.5 });
    return b;
  }
  // many strokes in one path element (cheap)
  function lines(parent, segs, w, o) {
    o = o || {};
    var d = '';
    for (var i = 0; i < segs.length; i++) {
      var sg = bow(segs[i], o.bow == null ? 1.2 : o.bow);
      if (sg.length < 2) continue;
      var P = sg.length > 2 ? spline(jit(sg, o.j == null ? 0.6 : o.j), o.steps || 3) : sg;
      d += poly(P);
    }
    if (!d) return null;
    return el('path', { d: d, fill: 'none', stroke: o.c || C.ink, 'stroke-width': w || 1, 'stroke-linecap': 'round',
      opacity: o.op, 'clip-path': o.clip, class: o.cls }, parent);
  }

  var defs = null, uid = 0;
  function setDefs(d) { defs = d; }
  function uidOf(p) { return (p || 'i') + (++uid); }
  function clip(d) {
    var id = uidOf('c'), cp = el('clipPath', { id: id }, defs);
    el('path', { d: d }, cp);
    return 'url(#' + id + ')';
  }

  // parallel hatching over a box, usually clipped to a shape
  function hatch(parent, box, o) {
    o = o || {};
    var x = box[0], y = box[1], w = box[2], h = box[3], a = (o.angle == null ? 45 : o.angle) * Math.PI / 180;
    var ca = Math.cos(a), sa = Math.sin(a), cx = x + w / 2, cy = y + h / 2, r = Math.hypot(w, h) / 2, segs = [], gap = o.gap || 6;
    for (var k = -r; k <= r; k += gap * rr(0.75, 1.25)) {
      if (o.density != null && rnd() > o.density) continue;
      var s0 = -r * rr(0.75, 1), s1 = r * rr(0.75, 1);
      segs.push([[cx - sa * k + ca * s0, cy + ca * k + sa * s0], [cx - sa * k + ca * s1, cy + ca * k + sa * s1]]);
    }
    if (!o.clip) o.clip = clip(poly([[x, y], [x + w, y], [x + w, y + h], [x, y + h]], true));
    return lines(parent, segs, o.w || 0.8, { c: o.c, op: o.op, clip: o.clip, j: o.j == null ? 1 : o.j, bow: o.bow == null ? 2 : o.bow, cls: o.cls });
  }
  // a dense back-and-forth scribble, for deep shadow
  function scribble(parent, box, o) {
    o = o || {};
    var x = box[0], y = box[1], w = box[2], h = box[3], pts = [], step = o.step || 5;
    if (!o.vertical) for (var xx = x; xx <= x + w; xx += step * rr(0.6, 1.4)) { pts.push([xx, y + rr(0, 0.15) * h]); pts.push([xx + step * 0.5, y + h - rr(0, 0.15) * h]); }
    else for (var yy = y; yy <= y + h; yy += step * rr(0.6, 1.4)) { pts.push([x + rr(0, 0.15) * w, yy]); pts.push([x + w - rr(0, 0.15) * w, yy + step * 0.5]); }
    if (pts.length < 2) return null;
    return el('path', { d: poly(jit(pts, step * 0.3)), fill: 'none', stroke: o.c || C.ink, 'stroke-width': o.w || 1.1,
      'stroke-linejoin': 'round', opacity: o.op, 'clip-path': o.clip }, parent);
  }
  // watercolour: a soft-edged, grainy fill
  function wash(parent, d, color, op, o) {
    o = o || {};
    return el('path', { d: d, fill: color, opacity: op == null ? 0.5 : op, filter: o.plain ? null : 'url(#wash)', class: o.cls }, parent);
  }
  function blobPts(cx, cy, rx, ry, wob, n, rot) {
    var P = [], ph = rnd() * 6, c = Math.cos(rot || 0), s = Math.sin(rot || 0);
    n = n || 14;
    for (var i = 0; i < n; i++) {
      var a = i / n * Math.PI * 2, k = 1 + (wob || 0) * (0.5 * Math.sin(a * 3 + ph) + jj(0.5));
      var x = Math.cos(a) * rx * k, y = Math.sin(a) * ry * k;
      P.push([cx + x * c - y * s, cy + x * s + y * c]);
    }
    return P;
  }
  function closedD(P, steps) { return poly(splineClosed(P, steps || 6), true); }
  function ellipseLine(parent, cx, cy, rx, ry, w, o) {
    o = o || {};
    var P = blobPts(cx, cy, rx, ry, o.wob || 0.03, o.n || 16, o.rot);
    var S = splineClosed(P, 5);
    S.push(S[0], S[1], S[2]);  // overshoot the join a little, like a pen
    return el('path', { d: poly(S), fill: 'none', stroke: o.c || C.ink, 'stroke-width': w, 'stroke-linecap': 'round', opacity: o.op, pathLength: 1, class: 'ln' }, parent);
  }

  // an outline around a centre line, as a closed point list (for limbs and sleeves)
  function capsule(pts, w0, w1) {
    var P = spline(pts, 4), n = P.length, L = [], R = [];
    for (var i = 0; i < n; i++) {
      var a = P[i > 0 ? i - 1 : 0], b = P[i < n - 1 ? i + 1 : n - 1], dx = b[0] - a[0], dy = b[1] - a[1], len = Math.hypot(dx, dy) || 1;
      dx /= len; dy /= len;
      var hw = lerp(w0, w1, i / (n - 1)) / 2;
      L.push([P[i][0] - dy * hw, P[i][1] + dx * hw]);
      R.push([P[i][0] + dy * hw, P[i][1] - dx * hw]);
    }
    var e = P[n - 1], s0 = P[0];
    return L.concat([[e[0] + (e[0] - P[n - 2][0]) * 0.3, e[1] + (e[1] - P[n - 2][1]) * 0.3]], R.reverse(), [[s0[0] - (P[1][0] - s0[0]) * 0.3, s0[1] - (P[1][1] - s0[1]) * 0.3]]);
  }

  // glass: a pale wash, two wavering contours and a highlight
  function glass(parent, P, o) {
    o = o || {};
    var dark = o.dark, d = closedD(P, 4);
    wash(parent, d, dark ? '#cfe2ea' : C.glassWash, o.wop == null ? (dark ? 0.13 : 0.34) : o.wop);
    var c = o.c || (dark ? '#d8e7ee' : C.glass), ring = P.concat([P[0], P[1]]);
    line(parent, ring, o.w || 1.1, { c: c, j: 0.5, steps: 4 });
    line(parent, ring, (o.w || 1.1) * 0.45, { c: c, j: 1.8, op: 0.55, steps: 4 });
    return d;
  }
  // faint rows of handwriting under the glass
  function script(parent, x, y, w, rows, o) {
    o = o || {};
    var segs = [], lh = o.lh || 6;
    for (var r = 0; r < rows; r++) {
      var yy = y + r * lh, xx = x + rr(0, w * 0.15), end = x + w * rr(0.55, 1), pts = [];
      while (xx < end) { pts.push([xx, yy + jj(lh * 0.28)]); xx += rr(1.6, 3.6); if (rnd() < 0.08) { if (pts.length > 1) segs.push(pts); pts = []; xx += rr(2, 5); } }
      if (pts.length > 1) segs.push(pts);
    }
    return lines(parent, segs, o.w || 0.5, { c: o.c || C.glass, op: o.op == null ? 0.5 : o.op, j: 0.2, bow: 0, clip: o.clip, cls: o.cls, steps: 2 });
  }
  // looping handwriting, as points (trochoid with varying loop height)
  function cursive(x0, y0, len, o) {
    o = o || {};
    var a = o.a || 3.4, b = o.b || 6.5, P = [], t = 0, amp = 1, loop = -1, tmax = len / a;
    for (; t <= tmax; t += 0.22) {
      var L = Math.floor(t / (Math.PI * 2));
      if (L !== loop) { loop = L; amp = rnd() < 0.22 ? rr(1.9, 2.8) : rnd() < 0.15 ? rr(0.2, 0.4) : rr(0.75, 1.15); }
      P.push([x0 + a * t - b * Math.sin(t), y0 - b * amp * (1 - Math.cos(t)) * 0.9 + Math.sin(t * 0.045) * (o.wave || 10)]);
    }
    return P;
  }

  // ---- the Librarian ----
  // joints: hd head, hr head tilt (deg), nk neck base, ch chest, hp pelvis, ls/rs shoulders, le/re elbows,
  // lh/rh hands, lk/rk knees, lf/rf feet. Units: about 280 tall, feet at y 0.
  var BASE = { hd: [2, -258], hr: 0, nk: [0, -236], ch: [0, -196], hp: [0, -128], ls: [-24, -226], rs: [24, -226],
    le: [-31, -172], re: [31, -172], lh: [-28, -122], rh: [29, -122], lk: [-11, -66], rk: [11, -66], lf: [-14, 0], rf: [14, 0] };
  function pose(o) { var p = {}; for (var k in BASE) p[k] = BASE[k]; for (k in o) p[k] = o[k]; return p; }
  var POSES = {
    stand: pose({}),
    look: pose({ hd: [6, -258], hr: -24, le: [-34, -170], re: [35, -172], lh: [-40, -126], rh: [42, -128] }),
    walk: pose({ hd: [8, -256], nk: [4, -234], ch: [2, -194], hp: [0, -126], ls: [-4, -226], rs: [10, -226], le: [-18, -176], re: [24, -178],
      lh: [-28, -132], rh: [38, -136], lk: [-16, -66], rk: [22, -70], lf: [-34, 0], rf: [36, -2] }),
    reach: pose({ hd: [10, -258], hr: -22, nk: [4, -236], ch: [2, -196], ls: [-6, -228], rs: [10, -228], le: [-12, -176], re: [30, -262],
      lh: [-14, -130], rh: [42, -300], lk: [-6, -66], rk: [10, -68], lf: [-12, 0], rf: [14, 0] }),
    recoil: pose({ hd: [-14, -248], hr: 20, nk: [-10, -228], ch: [-6, -190], hp: [0, -124], ls: [-30, -220], rs: [16, -222], le: [-28, -260],
      re: [32, -252], lh: [-4, -276], rh: [14, -286], lk: [-22, -62], rk: [18, -62], lf: [-36, 0], rf: [26, 0] }),
    trace: pose({ hd: [8, -256], hr: 12, nk: [4, -234], ch: [2, -194], hp: [0, -126], ls: [-4, -226], rs: [10, -226], le: [-12, -176],
      re: [34, -198], lh: [-14, -130], rh: [56, -216], lk: [-6, -66], rk: [10, -66], lf: [-12, 0], rf: [16, 0] }),
    kneel: pose({ hd: [42, -160], hr: 38, nk: [30, -142], ch: [16, -118], hp: [-12, -66], ls: [8, -134], rs: [22, -134], le: [24, -94],
      re: [40, -98], lh: [44, -58], rh: [60, -60], lk: [10, -6], rk: [26, -48], lf: [-38, -2], rf: [28, 0] }),
    sit: pose({ hd: [6, -204], hr: 6, nk: [4, -182], ch: [2, -146], hp: [-4, -76], ls: [-16, -172], rs: [18, -172], le: [-20, -120],
      re: [24, -122], lh: [2, -90], rh: [14, -92], lk: [26, -82], rk: [38, -80], lf: [22, 0], rf: [40, 0] }),
    speak: pose({ hd: [4, -258], hr: -16, re: [26, -174], rh: [6, -198] }),
    open: pose({ hd: [2, -258], hr: -8, le: [-46, -180], re: [46, -180], lh: [-70, -152], rh: [70, -152] })
  };

  function figure(parent, name, o) {
    o = o || {};
    var P = POSES[name] || POSES.stand, dark = !!o.dark, s = o.s || 1;
    var G = g(parent, { transform: 'translate(' + f1(o.x || 0) + ' ' + f1(o.y || 0) + ') scale(' + (o.flip ? -s : s) + ' ' + s + ')', class: 'librarian' });
    var lineC = dark ? '#e3edf1' : C.glass, inkC = dark ? C.nightink : C.ink, sw = 1.1 / Math.max(0.6, Math.min(s, 1.6)) * (o.lw || 1);
    var gl = { dark: dark, w: sw };
    var hipL = [P.hp[0] - 10, P.hp[1]], hipR = [P.hp[0] + 10, P.hp[1]];
    // glow inside, behind everything
    if (o.glow) el('circle', { cx: P.ch[0], cy: P.ch[1] + 10, r: 95, fill: 'url(#goldGlow)', opacity: o.glow, class: 'glow' }, G);
    // cloak geometry first, so the legs can show only below its hem
    var hemY = Math.min(Math.max(P.lk[1], P.rk[1]) + 40, -8);
    var lowL = Math.min(P.lk[0], P.lf[0], hipL[0]) - 22, lowR = Math.max(P.rk[0], P.rf[0], hipR[0]) + 22;
    if (name === 'sit') { hemY = -30; lowL = P.hp[0] - 30; lowR = Math.max(P.lk[0], P.rk[0]) + 14; }
    if (name === 'kneel') { hemY = -4; lowL = P.lf[0] - 4; lowR = P.rk[0] + 16; }
    var legs = g(G, { 'clip-path': clip('M-200 ' + (hemY - 6) + 'H200V60H-200Z') });
    [[hipL, P.lk, P.lf], [hipR, P.rk, P.rf]].forEach(function (leg) {
      glass(legs, capsule(leg, 14, 8), gl);
      var f = leg[2];
      glass(legs, blobPts(f[0] + 5, f[1] - 3, 10, 4, 0.05, 10), gl);
    });
    // standing collar behind the head
    var col = [[P.nk[0] - 15, P.nk[1] + 7], [P.nk[0] - 13, P.nk[1] - 4], [P.nk[0], P.nk[1] - 7], [P.nk[0] + 13, P.nk[1] - 4], [P.nk[0] + 15, P.nk[1] + 7]];
    wash(G, closedD(col, 4), dark ? '#2c3540' : C.slateDark, 0.85, { plain: true });
    ink(G, col.slice(0, 3), 1.8 * sw, { c: inkC, echo: false });
    ink(G, col.slice(2), 1.8 * sw, { c: inkC, echo: false });
    // cloak: narrow at the shoulders, falling and flaring to the hem
    var midY = lerp(P.ch[1], hemY, 0.5);
    var cl = [[P.nk[0] - 9, P.nk[1] + 2], [P.ls[0] - 1, P.ls[1] + 4], [P.ls[0] - 6, P.ch[1] + 10], [lerp(P.ls[0] - 8, lowL, 0.45), midY],
      [lowL, hemY + jj(3)], [lerp(lowL, lowR, 0.3), hemY + 6 + jj(3)], [lerp(lowL, lowR, 0.62), hemY - 1 + jj(3)], [lowR, hemY + 4 + jj(3)],
      [lerp(P.rs[0] + 8, lowR, 0.45), midY], [P.rs[0] + 6, P.ch[1] + 10], [P.rs[0] + 1, P.rs[1] + 4], [P.nk[0] + 9, P.nk[1] + 2]];
    var cd = closedD(cl, 5), ck = clip(cd);
    wash(G, cd, dark ? '#3a4652' : C.slate, dark ? 0.85 : 0.5);
    // shadow on the far side, then long folds
    hatch(G, [P.hp[0], P.nk[1], lowR - P.hp[0] + 30, hemY - P.nk[1] + 10], { angle: 76, gap: 5.5, w: 0.7 / Math.max(s, 0.7), c: dark ? '#050505' : C.slateDark, op: 0.45, clip: ck });
    scribble(G, [P.hp[0] + 10, P.ch[1] + 10, lowR - P.hp[0], hemY - P.ch[1] - 6], { step: 3.4, w: 0.8 / Math.max(s, 0.7), c: dark ? '#050505' : C.ink, op: 0.22, clip: ck, vertical: true });
    var fl = g(G, { 'clip-path': ck });
    for (var fi2 = 0; fi2 < 5; fi2++) {
      var u = 0.18 + fi2 * 0.16 + jj(0.04), top = [lerp(P.ls[0], P.rs[0], u), lerp(P.ch[1] + 20, P.hp[1], rr(0, 0.6))];
      var bot = [lerp(lowL, lowR, u + jj(0.05)), hemY + 2];
      brush(fl, [top, lp(top, bot, 0.5).map(function (v, ix) { return v + (ix ? 0 : jj(4)); }), bot], (fi2 % 2 ? 1.3 : 2) * sw, { c: dark ? '#0b0c0d' : C.slateDark, op: 0.75 });
    }
    ink(G, cl.slice(1, 6), 2.6 * sw, { c: inkC });
    ink(G, cl.slice(6, 11), 2.4 * sw, { c: inkC });
    line(G, cl.slice(4, 8), 1.2 * sw, { c: inkC, j: 1 });
    // the opening of the cloak shows the glass chest
    var vee = [[P.nk[0] - 9, P.nk[1] + 2], [P.nk[0] + 9, P.nk[1] + 2], [P.ch[0] + 3, P.ch[1] + 16], [P.ch[0] - 3, P.ch[1] + 16]];
    var vd = glass(G, vee, gl), vk = clip(vd);
    script(G, P.nk[0] - 10, P.nk[1] + 4, 20, 9, { lh: 4.4, c: o.veins || (dark ? '#bcd3dc' : C.glass), op: o.veinOp == null ? 0.55 : o.veinOp, clip: vk, cls: 'veins' });
    if (o.cracked) line(G, [[P.ch[0] - 7, P.nk[1] + 12], [P.ch[0] - 1, P.nk[1] + 18], [P.ch[0] - 4, P.nk[1] + 24], [P.ch[0] + 4, P.nk[1] + 31], [P.ch[0] + 1, P.ch[1] + 4]],
      1.1 * sw, { c: o.cracked === 'gold' ? C.goldDeep : inkC, j: 0.4, bow: 0 });
    // neck and head
    glass(G, capsule([P.nk, lp(P.nk, P.hd, 0.55)], 11, 10), gl);
    var hr = (P.hr || 0) * Math.PI / 180, head = blobPts(P.hd[0], P.hd[1], 13.5, 18.5, 0.025, 14, hr), hd = glass(G, head, gl), hk = clip(hd);
    script(G, P.hd[0] - 12, P.hd[1] - 14, 24, 7, { lh: 4.4, c: o.veins || (dark ? '#bcd3dc' : C.glass), op: (o.veinOp == null ? 0.55 : o.veinOp) * 0.8, clip: hk, cls: 'veins' });
    var hx = Math.cos(hr), hy = Math.sin(hr);   // highlight on the head
    line(G, [[P.hd[0] - 8 * hx + 7 * hy, P.hd[1] - 11 * hx - 8 * hy], [P.hd[0] - 10 * hx + 1 * hy, P.hd[1] - 3 * hx - 10 * hy], [P.hd[0] - 8 * hx - 4 * hy, P.hd[1] + 6 * hx - 8 * hy]],
      1.6 * sw, { c: '#ffffff', op: dark ? 0.6 : 0.9, j: 0.3 });
    // sleeves and hands
    [['ls', 'le', 'lh'], ['rs', 're', 'rh']].forEach(function (k) {
      var wr = lp(P[k[1]], P[k[2]], 0.8), arm = [P[k[0]], P[k[1]], wr];
      var ad = closedD(capsule(arm, 10, 15), 3);
      wash(G, ad, dark ? '#3a4652' : C.slate, dark ? 0.95 : 0.62, { plain: true });
      var ak = clip(ad);
      hatch(G, [Math.min(P[k[0]][0], P[k[1]][0], wr[0]) - 10, Math.min(P[k[0]][1], P[k[1]][1], wr[1]) - 10, 60, 120], { angle: 20, gap: 4.2, w: 0.6 / Math.max(s, 0.7), c: dark ? '#0b0b0a' : C.slateDark, op: 0.4, clip: ak });
      ink(G, arm, 2 * sw, { c: inkC, echo: false });
      var hand = P[k[2]], dir = Math.atan2(hand[1] - wr[1], hand[0] - wr[0]);
      glass(G, blobPts(lp(wr, hand, 0.55)[0], lp(wr, hand, 0.55)[1], 8, 5.5, 0.06, 10, dir), gl);
      for (var fi = -1; fi <= 1; fi++) { var a = dir + fi * 0.32, tip = [hand[0] + Math.cos(a) * 6, hand[1] + Math.sin(a) * 6]; line(G, [lp(wr, hand, 0.7), tip], 0.8 * sw, { c: lineC, op: 0.8 }); }
    });
    return G;
  }

  W.Pen = { C: C, seed: seed, rnd: rnd, rr: rr, jj: jj, lerp: lerp, lp: lp, add: add, clamp: clamp, el: el, g: g, spline: spline,
    splineClosed: splineClosed, poly: poly, brush: brush, line: line, ink: ink, lines: lines, setDefs: setDefs, clip: clip, uid: uidOf,
    hatch: hatch, scribble: scribble, wash: wash, blobPts: blobPts, closedD: closedD, ellipseLine: ellipseLine, capsule: capsule,
    glass: glass, script: script, cursive: cursive, figure: figure, POSES: POSES };
})(window);
