/* scenes.js: the seventeen panels of The Glass Librarian, drawn in ink, wash, glass and one gold.
   Each scene draws itself into layers (moving at their own speeds) and beats (inked in, in order, as it arrives),
   and may return update(p, e) for what happens as you scroll through it. */
(function () {
  'use strict';
  var P = window.Pen, C = P.C;
  function ease(t) { t = P.clamp(t, 0, 1); return t * t * (3 - 2 * t); }
  function ramp(p, a, b) { return ease((p - a) / (b - a)); }
  function prep(els) { els.forEach(function (e) { e.style.strokeDasharray = '1 1'; e.style.strokeDashoffset = 1; }); return els; }
  function drawTo(els, t, stagger) {
    els.forEach(function (e, i) { var s = stagger ? i / els.length * stagger : 0; e.style.strokeDashoffset = (1 - P.clamp((t - s) / (1 - s + 1e-4), 0, 1)).toFixed(3); });
  }
  function txt(G, x, y, s, o) {
    o = o || {};
    var t = P.el('text', { x: x, y: y, 'font-family': "'IM Fell English', Georgia, serif", 'font-size': o.size || 20, 'font-style': o.italic === false ? null : 'italic',
      fill: o.c || C.ink, opacity: o.op, 'text-anchor': o.anchor || 'start', transform: o.rot ? 'rotate(' + o.rot + ' ' + x + ' ' + y + ')' : null, class: o.cls }, G);
    t.textContent = s;
    return t;
  }
  function rect(x0, y0, x1, y1) { return P.poly([[x0, y0], [x1, y0], [x1, y1], [x0, y1]], true); }
  function reflect(G, y, op, fn) { var r = P.g(G, { opacity: op, transform: 'translate(0 ' + (2 * y) + ') scale(1 -1)' }); fn(r); return r; }

  // ---------- the library: a one-point-perspective hall of shelves ----------
  function hall(G, A, o) {
    o = o || {};
    var ink = o.c || (A.dark ? C.nightink : C.ink), vp = o.vp || [800, 470], X0 = o.x0 == null ? 40 : o.x0, X1 = o.x1 == null ? 1560 : o.x1;
    var T = o.top == null ? -40 : o.top, B = o.floor == null ? 820 : o.floor, shelfTop = T + (B - T) * (o.clerestory == null ? 0.27 : o.clerestory);
    function at(x, y, z) { return [vp[0] + (x - vp[0]) / z, vp[1] + (y - vp[1]) / z]; }
    var zs = []; for (var z = 1; z < 16; z *= 1.3) zs.push(z);
    var zmax = zs[zs.length - 1], boards = [];
    for (var k = 0; k <= 5; k++) boards.push(P.lerp(shelfTop, B, k / 5));
    var books = [[], [], []], frame = [[], [], []], refl = [[], [], []];
    function band(z) { return z < 2.2 ? 0 : z < 5 ? 1 : 2; }
    [X0, X1].forEach(function (xs) {
      zs.forEach(function (z) { frame[band(z)].push([at(xs, T, z), at(xs, B, z)]); });
      boards.concat([T]).forEach(function (yb) { frame[0].push([at(xs, yb, 1), at(xs, yb, 2.2)]); frame[1].push([at(xs, yb, 2.2), at(xs, yb, 5)]); frame[2].push([at(xs, yb, 5), at(xs, yb, zmax)]); });
      for (var i = 0; i < zs.length - 1; i++) {
        var za = zs[i], zb = zs[i + 1];
        for (var k2 = 1; k2 < boards.length; k2++) {
          var yTop = boards[k2 - 1], yBot = boards[k2], xa = at(xs, yBot, za)[0], xb = at(xs, yBot, zb)[0], n = Math.max(2, Math.floor(Math.abs(xb - xa) / 5.2));
          for (var m = 0; m < n; m++) {
            if (P.rnd() < 0.07) continue;
            var u = (m + P.rr(0.15, 0.85)) / n, zz = 1 / P.lerp(1 / za, 1 / zb, u), bot = at(xs, yBot, zz), top = at(xs, yTop, zz);
            var h = (bot[1] - top[1]) * P.rr(0.55, 0.9), lean = P.rnd() < 0.07 ? P.jj(h * 0.3) : P.jj(0.5), bd = band(zz);
            books[bd].push([bot, [bot[0] + lean, bot[1] - h]]);
            if (o.mirror) { var ry = 2 * at(xs, B, zz)[1]; refl[bd].push([[bot[0], ry - bot[1]], [bot[0] + lean, ry - bot[1] + h]]); }
          }
        }
      }
    });
    var ops = [1, 0.6, 0.3], ws = [1.15, 0.85, 0.6];
    for (var b = 2; b >= 0; b--) {
      P.lines(G, frame[b], ws[b] * 1.4, { c: ink, op: ops[b] * 0.9 });
      P.lines(G, books[b], ws[b], { c: ink, op: ops[b] * 0.85, bow: 0.4, j: 0.3 });
    }
    if (o.vault !== false) {
      var ribs = [];
      zs.forEach(function (z) { var a = at(X0, T, z), c = at(X1, T, z); ribs.push([a, [vp[0], a[1] - 230 / z], c]); });
      P.lines(G, ribs, 1, { c: ink, op: 0.45, steps: 8, bow: 0 });
    }
    var floorD = P.poly([at(X0, B, 0.6), at(X1, B, 0.6), at(X1, B, zmax), at(X0, B, zmax)], true);
    if (o.mirror) {
      var fk = P.clip(floorD);
      for (b = 2; b >= 0; b--) P.lines(G, refl[b], ws[b] * 0.9, { c: ink, op: ops[b] * 0.2, clip: fk, bow: 0.4 });
      var pol = [];
      for (var yy = B + 8; yy < 1000; yy += 10 + (yy - B) * 0.09) pol.push([[P.rr(0, 500), yy], [P.rr(1100, 1600), yy]]);
      P.lines(G, pol, 0.6, { c: ink, op: 0.16, clip: fk });
    }
    if (!A.dark && o.fog !== false) P.el('ellipse', { cx: vp[0], cy: vp[1], rx: 230, ry: 210, fill: 'url(#paperFog)' }, G);
    return { at: at, vp: vp, X0: X0, X1: X1, T: T, B: B, shelfTop: shelfTop, zmax: zmax };
  }
  function wallWindow(G, H, xs, za, zb, y1, y2, o) {
    o = o || {};
    var a = H.at(xs, y1, za), b = H.at(xs, y1, zb), c = H.at(xs, y2, zb), d = H.at(xs, y2, za), m = H.at(xs, y1 - (y2 - y1) * 0.4, (za + zb) / 2);
    if (o.fill) P.wash(G, P.poly([d, a, m, b, c], true), o.fill, o.fillOp || 0.5);
    P.ink(G, [d, a, m, b, c], o.w || 2.2, { c: o.c });
    P.line(G, [d, c], 1.4, { c: o.c });
    P.line(G, [H.at(xs, y1 - (y2 - y1) * 0.36, (za + zb) / 2), H.at(xs, y2, (za + zb) / 2)], 1, { c: o.c, op: 0.7 });
    P.line(G, [H.at(xs, (y1 + y2) / 2, za), H.at(xs, (y1 + y2) / 2, zb)], 0.8, { c: o.c, op: 0.5 });
    return [a, b, c, d, m];
  }
  function archD(x0, x1, y0, y1) {
    var mid = (x0 + x1) / 2, sp = y0 + (x1 - x0) * 0.45;
    return 'M' + x0 + ' ' + y1 + 'L' + x0 + ' ' + sp + 'Q' + x0 + ' ' + y0 + ' ' + mid + ' ' + (y0 - 20) + 'Q' + x1 + ' ' + y0 + ' ' + x1 + ' ' + sp + 'L' + x1 + ' ' + y1 + 'Z';
  }
  function archPts(x0, x1, y0, y1) {
    var mid = (x0 + x1) / 2, sp = y0 + (x1 - x0) * 0.45;
    return [[x0, y1], [x0, sp], [x0 + (x1 - x0) * 0.12, y0 + 30], [mid, y0 - 20], [x1 - (x1 - x0) * 0.12, y0 + 30], [x1, sp], [x1, y1]];
  }
  // a frontal wall of shelves
  function shelfWall(G, x0, x1, y0, y1, o) {
    o = o || {};
    var ink = o.c || C.ink, rows = o.rows || 6, segs = [], frame = [], dark = [];
    for (var r = 0; r <= rows; r++) frame.push([[x0, P.lerp(y0, y1, r / rows)], [x1, P.lerp(y0, y1, r / rows)]]);
    for (var cI = 0; cI <= 4; cI++) frame.push([[P.lerp(x0, x1, cI / 4), y0], [P.lerp(x0, x1, cI / 4), y1]]);
    for (r = 1; r <= rows; r++) {
      var yb = P.lerp(y0, y1, r / rows), yt = P.lerp(y0, y1, (r - 1) / rows), x = x0 + 4;
      while (x < x1 - 4) {
        var w = P.rr(5, 13), h = (yb - yt) * P.rr(0.6, 0.92), lean = P.rnd() < 0.06 ? P.rr(4, 14) : 0;
        segs.push([[x, yb], [x + lean, yb - h]]); segs.push([[x + w, yb], [x + w + lean, yb - h]]);
        if (P.rnd() < 0.18) dark.push([x, yb - h, w, h]);
        x += w + P.rr(0, 2);
      }
    }
    P.lines(G, frame, 1.6, { c: ink });
    P.lines(G, segs, 0.8, { c: ink, op: 0.8, bow: 0.3, j: 0.3 });
    dark.forEach(function (d) { P.scribble(G, d, { step: 2.2, w: 0.7, c: ink, op: 0.55, vertical: true }); });
  }

  // ---------- the outdoors ----------
  function tree(G, x, y, h, o) {
    o = o || {};
    var c = o.c || C.ink, w = h * 0.065, lean = o.lean == null ? P.jj(h * 0.04) : o.lean, foliage = [];
    var left = [[x - w, y], [x - w * 0.8 + lean * 0.3, y - h * 0.3], [x - w * 0.6 + lean * 0.6, y - h * 0.55], [x - w * 0.45 + lean, y - h * 0.68]];
    var right = [[x + w * 1.1, y], [x + w * 0.75 + lean * 0.3, y - h * 0.3], [x + w * 0.55 + lean * 0.6, y - h * 0.55], [x + w * 0.4 + lean, y - h * 0.68]];
    P.wash(G, P.poly(left.concat(right.slice().reverse()), true), '#6d5c47', 0.32);
    var tk = P.clip(P.poly(left.concat(right.slice().reverse()), true));
    P.hatch(G, [x - w * 1.2, y - h * 0.7, w * 2.6, h * 0.72], { angle: 86, gap: 3.6, w: 0.75, op: 0.55, clip: tk, bow: 3 });
    P.ink(G, left, Math.max(2, w * 0.16), { c: c });
    P.ink(G, right, Math.max(2, w * 0.2), { c: c });
    function branch(p, a, len, wd, depth) {
      if (depth > 4 || len < 9) return;
      var q = [p[0] + Math.cos(a) * len, p[1] + Math.sin(a) * len], mid = P.lp(p, q, 0.5);
      P.brush(G, [p, [mid[0] + P.jj(len * 0.07), mid[1] + P.jj(len * 0.07)], q], Math.max(1, wd), { c: c });
      var n = depth < 2 ? 3 : 2;
      for (var k = 0; k < n; k++) branch(q, a + P.rr(-0.7, 0.7), len * P.rr(0.55, 0.75), wd * 0.6, depth + 1);
      if (depth >= 2) foliage.push(q);
    }
    var top = [x + lean, y - h * 0.68];
    [-2.2, -1.75, -1.3, -0.95].forEach(function (a) { branch(top, a + P.jj(0.12), h * 0.26, w * 0.55, 0); });
    foliage.forEach(function (q, i) { if (i % 2 === 0) P.wash(G, P.closedD(P.blobPts(q[0], q[1], h * 0.075, h * 0.055, 0.3, 10)), o.leaf || '#77814f', o.leafOp || 0.24); });
    var leaves = [];
    foliage.forEach(function (q) { for (var k = 0; k < 8; k++) { var lx = q[0] + P.jj(h * 0.06), ly = q[1] + P.jj(h * 0.045); leaves.push([[lx, ly], [lx + P.jj(6), ly + P.rr(-7, 3)]]); } });
    P.lines(G, leaves, 1.1, { c: c, op: 0.7, bow: 2 });
    return { top: top, w: w };
  }
  function trunk(G, x, w, o) {
    o = o || {};
    var y0 = o.y0 == null ? -20 : o.y0, y1 = o.y1 == null ? 1000 : o.y1, lean = P.jj(w * 0.4);
    var l = [[x - w / 2, y1], [x - w / 2 + lean * 0.5, (y0 + y1) / 2], [x - w / 2 + lean, y0]], r = [[x + w / 2, y1], [x + w / 2 + lean * 0.5, (y0 + y1) / 2], [x + w / 2 + lean, y0]];
    var d = P.poly(l.concat(r.slice().reverse()), true);
    P.wash(G, d, o.col || '#6d5c47', o.op == null ? 0.38 : o.op);
    P.hatch(G, [x - w, y0, w * 2, y1 - y0], { angle: 88, gap: Math.max(2.6, w / 9), w: 0.8, op: 0.6, clip: P.clip(d), bow: 4 });
    P.ink(G, l, Math.max(1.6, w * 0.07)); P.ink(G, r, Math.max(2, w * 0.1));
  }
  function grass(G, y0, y1, n, o) {
    o = o || {};
    var segs = [];
    for (var i = 0; i < n; i++) {
      var x = P.rr(o.x0 == null ? -20 : o.x0, o.x1 == null ? 1620 : o.x1), y = P.rr(y0, y1), h = P.lerp(5, o.h || 32, (y - y0) / (y1 - y0 + 1)) * P.rr(0.6, 1.3);
      segs.push([[x, y], [x + P.jj(h * 0.3), y - h * 0.5], [x + P.jj(h * 0.6), y - h]]);
    }
    return P.lines(G, segs, o.w || 1, { c: o.c || C.ink, op: o.op || 0.75, bow: 0 });
  }
  function stone(G, cx, cy, rx, ry) {
    var pts = P.blobPts(cx, cy, rx, ry, 0.07, 12), d = P.closedD(pts);
    P.wash(G, d, '#8f897c', 0.42);
    P.hatch(G, [cx - rx, cy - ry * 0.1, rx * 2, ry * 1.2], { angle: -28, gap: 4, w: 0.7, op: 0.6, clip: P.clip(d) });
    P.ink(G, pts.slice(0, 7), 2.4);
    P.line(G, pts.concat([pts[0], pts[1]]), 0.9, { op: 0.6, j: 1.4 });
    P.lines(G, [[[cx - rx * 1.1, cy + ry * 0.95], [cx + rx * 1.15, cy + ry * 0.9]]], 1.4, { op: 0.6 });
    return pts;
  }
  function sun(G, cx, cy, r, o) {
    o = o || {};
    P.el('circle', { cx: cx, cy: cy, r: r * 2.6, fill: 'url(#goldGlow)', opacity: o.glow == null ? 0.75 : o.glow }, G);
    P.wash(G, P.closedD(P.blobPts(cx, cy, r, r, 0.02, 16)), C.goldPale, 0.8);
    P.ellipseLine(G, cx, cy, r, r, 1.7, { c: C.goldDeep });
    var rays = [], n = o.rays || 56;
    for (var i = 0; i < n; i++) {
      var a = i / n * 6.283 + P.jj(0.03), r0 = r * P.rr(1.12, 1.2), r1 = r * (i % 2 ? P.rr(1.32, 1.5) : P.rr(1.55, 2.05));
      rays.push([[cx + Math.cos(a) * r0, cy + Math.sin(a) * r0], [cx + Math.cos(a) * r1, cy + Math.sin(a) * r1]]);
    }
    P.lines(G, rays, 1.1, { c: C.goldDeep, op: 0.75, bow: 0.5 });
  }
  function birds(G, n, box, o) {
    var segs = [];
    for (var i = 0; i < n; i++) {
      var x = box[0] + P.rnd() * box[2], y = box[1] + P.rnd() * box[3], s = P.rr(5, 11);
      segs.push([[x - s, y - s * 0.3], [x - s * 0.45, y - s * 0.55], [x, y]]); segs.push([[x, y], [x + s * 0.45, y - s * 0.6], [x + s, y - s * 0.25]]);
    }
    return P.lines(G, segs, 1.3, { c: (o && o.c) || C.ink, op: 0.8, bow: 0 });
  }
  function clouds(G, n, box, o) {
    o = o || {};
    for (var i = 0; i < n; i++) {
      var cx = box[0] + P.rnd() * box[2], cy = box[1] + P.rnd() * box[3], rx = P.rr(60, 150), ry = rx * P.rr(0.25, 0.4), pts = P.blobPts(cx, cy, rx, ry, 0.25, 12);
      P.wash(G, P.closedD(pts), o.col || '#ffffff', o.op == null ? 0.55 : o.op);
      P.line(G, pts.slice(6, 12).concat([pts[0]]), 1, { c: o.c || C.ink, op: 0.55, j: 1.5 });
      P.hatch(G, [cx - rx, cy, rx * 2, ry], { angle: 0, gap: 4, w: 0.6, op: 0.35, c: o.c, clip: P.clip(P.closedD(pts)) });
    }
  }
  function facade(G, cx, base, w, h, o) {
    o = o || {};
    var c = o.c || C.glass, x0 = cx - w / 2, x1 = cx + w / 2, top = base - h, cols = o.cols || 6, win = [];
    P.wash(G, P.poly([[x0, base], [x0, top + h * 0.2], [cx, top], [x1, top + h * 0.2], [x1, base]], true), C.glassWash, o.wop == null ? 0.38 : o.wop);
    P.ink(G, [[x0 - w * 0.03, top + h * 0.21], [cx, top], [x1 + w * 0.03, top + h * 0.21]], Math.max(1.4, w * 0.005), { c: c });
    P.line(G, [[x0 - w * 0.03, top + h * 0.21], [x1 + w * 0.03, top + h * 0.21]], 1.3, { c: c });
    var segs = [];
    for (var i = 0; i <= cols; i++) { var x = P.lerp(x0, x1, i / cols); segs.push([[x, top + h * 0.23], [x, base - h * 0.07]]); segs.push([[x + w * 0.014, top + h * 0.23], [x + w * 0.014, base - h * 0.07]]); }
    P.lines(G, segs, 1, { c: c, op: 0.85 });
    var di = Math.floor(cols / 2);
    for (i = 0; i < cols; i++) {
      var xa = P.lerp(x0, x1, i / cols) + w * 0.03, xb = P.lerp(x0, x1, (i + 1) / cols) - w * 0.016, ya = top + h * 0.4, yb = base - h * 0.17;
      if (i === di) { ya = top + h * 0.44; yb = base - h * 0.07; }
      var shape = [[xa, yb], [xa, ya], [(xa + xb) / 2, ya - (xb - xa) * 0.42], [xb, ya], [xb, yb]];
      win.push({ pts: shape, door: i === di });
      P.line(G, shape, i === di ? 1.6 : 1.1, { c: c, op: 0.9 });
    }
    P.lines(G, [[[x0 - w * 0.05, base], [x1 + w * 0.05, base]], [[x0 - w * 0.025, base - h * 0.035], [x1 + w * 0.025, base - h * 0.035]], [[x0, base - h * 0.07], [x1, base - h * 0.07]]], 1.2, { c: c });
    return { win: win, top: top, x0: x0, x1: x1 };
  }
  function pebbles(G, box, n) {
    var sh = [];
    for (var i = 0; i < n; i++) {
      var v = Math.pow(P.rnd(), 0.8), y = box[1] + v * box[3], k = 0.45 + v, x = box[0] + P.rnd() * box[2], rx = P.rr(4, 11) * k * 1.3, ry = rx * P.rr(0.42, 0.62);
      P.ellipseLine(G, x, y, rx, ry, 0.9, { op: 0.8, n: 8, wob: 0.12 });
      sh.push([[x - rx * 0.8, y + ry * 0.95], [x + rx * 0.9, y + ry * 0.65]]);
    }
    P.lines(G, sh, 1.3, { op: 0.5, bow: 0.5 });
  }
  function crackWeb(G, cx, cy, R, o) {
    o = o || {};
    var c = o.c || C.ink, rays = o.rays || 11, paths = [], ends = [], a0 = P.rnd() * 6, w = o.w || 1.4;
    for (var i = 0; i < rays; i++) {
      var a = a0 + i / rays * 6.283 + P.jj(0.22), len = R * P.rr(0.45, 1), pts = [[cx, cy]], r = 0;
      while (r < len) { r += P.rr(16, 44); var aa = a + P.jj(0.13); pts.push([cx + Math.cos(aa) * r, cy + Math.sin(aa) * r]); }
      ends.push(pts);
      paths.push({ el: P.line(G, pts, w, { c: c, j: 0, bow: 0, steps: 1 }), d0: 0 });
      if (P.rnd() < 0.75) {
        var k = Math.max(1, Math.floor(pts.length * P.rr(0.3, 0.7))), bp = pts[k], ba = a + (P.rnd() < 0.5 ? -1 : 1) * P.rr(0.4, 0.85), bl = P.rr(R * 0.08, R * 0.28), bpts = [bp];
        for (var q = 1; q <= 3; q++) bpts.push([bp[0] + Math.cos(ba + P.jj(0.2)) * bl * q / 3, bp[1] + Math.sin(ba + P.jj(0.2)) * bl * q / 3]);
        paths.push({ el: P.line(G, bpts, w * 0.7, { c: c, j: 0, bow: 0, steps: 1 }), d0: k / pts.length * 0.6 });
      }
    }
    [0.22, 0.42, 0.66].forEach(function (f) {
      for (var i = 0; i < rays; i++) {
        if (P.rnd() < 0.3) continue;
        var A1 = ends[i], B1 = ends[(i + 1) % rays], p1 = A1[Math.min(A1.length - 1, Math.round(A1.length * f))], p2 = B1[Math.min(B1.length - 1, Math.round(B1.length * f))];
        var mid = P.lp(p1, p2, 0.5); mid = [mid[0] + (cx - mid[0]) * 0.12 + P.jj(5), mid[1] + (cy - mid[1]) * 0.12 + P.jj(5)];
        paths.push({ el: P.line(G, [p1, mid, p2], w * 0.6, { c: c, j: 0, bow: 0, steps: 2 }), d0: 0.25 + f * 0.6 });
      }
    });
    prep(paths.map(function (q) { return q.el; }));
    return { ends: ends, set: function (t) { paths.forEach(function (q) { var v = P.clamp((t - q.d0) / (1 - q.d0 + 1e-4) * 1.35, 0, 1); q.el.style.strokeDashoffset = (1 - v).toFixed(3); }); } };
  }
  function bolt(G, x0, y0, x1, y1) {
    var B = P.g(G, { class: 'bolt' }), main = [[x0, y0]], n = 9;
    for (var i = 1; i < n; i++) { var t = i / n; main.push([P.lerp(x0, x1, t) + P.jj(46), P.lerp(y0, y1, t) + P.jj(12)]); }
    main.push([x1, y1]);
    var all = [main];
    for (i = 2; i < n - 1; i += 2) { var s = main[i], br = [s]; for (var k = 1; k < 4; k++) br.push([s[0] + k * P.rr(14, 30) * (P.rnd() < 0.5 ? -1 : 1), s[1] + k * P.rr(18, 34)]); all.push(br); }
    all.forEach(function (pts, j) {
      var d = P.poly(pts);
      P.el('path', { d: d, fill: 'none', stroke: C.goldPale, 'stroke-width': j ? 8 : 18, opacity: 0.55, filter: 'url(#bloom)' }, B);
      P.el('path', { d: d, fill: 'none', stroke: '#fffbea', 'stroke-width': j ? 1.6 : 3.6, 'stroke-linejoin': 'round' }, B);
    });
    return B;
  }
  // a hand of glass with its sleeve, fingers pointing along +x
  function hand(G, x, y, s, rot, o) {
    o = o || {};
    var H = P.g(G, { transform: 'translate(' + x + ' ' + y + ') rotate(' + rot + ') scale(' + s + ')' }), gl = { dark: o.dark, w: 1.1 / s * 1.6 };
    var sleeve = [[-190, 64], [-120, 40], [-46, 14]], sd = P.closedD(P.capsule(sleeve, 64, 50), 3);
    P.wash(H, sd, o.dark ? '#3a4652' : C.slate, o.dark ? 0.95 : 0.7, { plain: true });
    P.hatch(H, [-220, -30, 200, 140], { angle: 25, gap: 3.4, w: 0.5, c: o.dark ? '#060606' : C.slateDark, op: 0.55, clip: P.clip(sd) });
    P.brush(H, [[-200, 40], [-120, 14], [-48, -12]], 2.4, { c: o.dark ? C.nightink : C.ink });
    P.glass(H, P.capsule([[-60, 8], [-20, 2]], 30, 34), gl);
    P.glass(H, P.blobPts(0, 0, 34, 26, 0.04, 14), gl);
    [[[26, -18], [52, -24], [78, -26]], [[30, -6], [58, -8], [88, -8]], [[30, 6], [56, 8], [82, 9]], [[26, 17], [48, 21], [68, 23]], [[-6, -22], [12, -38], [34, -46]]].forEach(function (f, i) {
      P.glass(H, P.capsule(f, i === 4 ? 13 : 11, 8.5), gl);
    });
    P.script(H, -30, -14, 50, 6, { lh: 5, c: o.dark ? '#bcd3dc' : C.glass, op: 0.5, clip: P.clip(P.closedD(P.blobPts(0, 0, 34, 26, 0.04, 14))) });
    P.line(H, [[-14, -16], [8, -20], [24, -14]], 1.4, { c: '#ffffff', op: o.dark ? 0.6 : 0.85 });
    return H;
  }
  function pedestal(G, x, top, base) {
    var stoneC = '#bfb39c', cap = [[x - 112, top], [x + 112, top], [x + 96, top + 26], [x - 96, top + 26]];
    P.wash(G, P.poly(cap, true), stoneC, 0.5);
    P.ink(G, [cap[3], cap[0], cap[1], cap[2]], 2.2); P.line(G, [cap[3], cap[2]], 1.4);
    var sx0 = x - 58, sx1 = x + 58, sy0 = top + 26, sy1 = base - 46;
    P.wash(G, rect(sx0, sy0, sx1, sy1), stoneC, 0.4);
    P.ink(G, [[sx0, sy0], [sx0 - 3, (sy0 + sy1) / 2], [sx0, sy1]], 2.4); P.ink(G, [[sx1, sy0], [sx1 + 3, (sy0 + sy1) / 2], [sx1, sy1]], 2.6);
    var fl = []; for (var i = 1; i < 6; i++) { var fx = P.lerp(sx0, sx1, i / 6); fl.push([[fx, sy0 + 8], [fx, sy1 - 8]]); }
    P.lines(G, fl, 0.9, { op: 0.6 });
    P.hatch(G, [x + 10, sy0, 50, sy1 - sy0], { angle: 82, gap: 3.6, w: 0.7, op: 0.6, clip: P.clip(rect(x + 14, sy0, sx1, sy1)) });
    var bs = [[x - 102, base], [x + 102, base], [x + 88, sy1], [x - 88, sy1]];
    P.wash(G, P.poly(bs, true), stoneC, 0.5);
    P.ink(G, [bs[3], bs[0], bs[1], bs[2]], 2.2); P.line(G, [bs[3], bs[2]], 1.2);
  }
  function book(G, x, top, w) {
    var L = [[x - w, top - 30], [x - w * 0.55, top - 50], [x - 4, top - 42], [x - 4, top + 8], [x - w * 0.5, top], [x - w + 6, top + 10]];
    var R = L.map(function (p) { return [2 * x - p[0], p[1]]; });
    P.ink(G, [[x - w - 8, top + 14], [x, top + 18], [x + w + 8, top + 14]], 3);
    [L, R].forEach(function (pg) { P.wash(G, P.closedD(pg, 4), '#fdf8ec', 1, { plain: true }); P.line(G, pg.concat([pg[0]]), 1.4, { j: 0.6 }); });
    P.script(G, x - w + 18, top - 32, w * 0.78, 6, { lh: 6.4, c: C.ink, op: 0.5, w: 0.6 });
    P.script(G, x + 18, top - 34, w * 0.75, 2, { lh: 6.4, c: C.ink, op: 0.5, w: 0.6 });
    return { L: L, R: R };
  }

  // ---------- the scenes ----------
  var S = {};

  // title: the glass arch, the hall through it, and the Librarian at its foot
  S.s0 = function (A) {
    var L0 = A.layer(10), L1 = A.layer(40), b0 = A.beat(L0, 0), b1 = A.beat(L0, 1), b2 = A.beat(L1, 2);
    var x0 = 650, x1 = 950, base = 940, top = 400;
    var inner = P.g(b0, { 'clip-path': P.clip(archD(x0, x1, top, base)) });
    P.wash(inner, archD(x0, x1, top, base), C.glassWash, 0.28);
    hall(inner, A, { vp: [800, 700], x0: 610, x1: 990, top: 380, floor: 940, mirror: true, clerestory: 0.18, vault: false, fog: false });
    P.ink(b1, archPts(x0, x1, top, base), 3.4);
    P.ink(b1, archPts(x0 - 30, x1 + 30, top - 34, base), 2);
    P.line(b1, [[260, base], [1340, base]], 1.4);
    P.hatch(b1, [260, base, 1080, 60], { angle: 0, gap: 7, w: 0.6, op: 0.25 });
    P.figure(b2, 'stand', { x: 800, y: base - 6, s: 0.92 });
    reflect(b2, base - 6, 0.14, function (r) { P.figure(r, 'stand', { x: 800, y: base - 6, s: 0.92 }); });
  };

  // 1. the Library of Glass
  S.s1 = function (A) {
    var L0 = A.layer(18), L1 = A.layer(60);
    var H = hall(A.beat(L0, 0), A, { mirror: true, vp: [830, 470] }), b1 = A.beat(L0, 1);
    [[1.3, 1.9], [2.7, 3.7]].forEach(function (z) { wallWindow(b1, H, H.X0, z[0], z[1], 50, H.shelfTop - 26); wallWindow(b1, H, H.X1, z[0], z[1], 50, H.shelfTop - 26); });
    var b2 = A.beat(L1, 2);
    P.figure(b2, 'walk', { x: 610, y: 890, s: 1.0 });
    reflect(b2, 890, 0.17, function (r) { P.figure(r, 'walk', { x: 610, y: 890, s: 1.0 }); });
  };

  // 2. a shaft of light through a high window, dust dancing in it
  S.s2 = function (A) {
    var L0 = A.layer(14), L1 = A.layer(50);
    var H = hall(A.beat(L0, 0), A, { mirror: true, vp: [930, 460] }), b1 = A.beat(L0, 1);
    var w = wallWindow(b1, H, H.X1, 1.12, 1.6, 40, H.shelfTop - 22, { fill: C.goldPale, fillOp: 0.55 });
    wallWindow(b1, H, H.X1, 2.6, 3.4, 40, H.shelfTop - 22);
    var q = [w[0], w[1], [900, 905], [420, 975]];
    var shaft = P.el('path', { d: P.poly(q, true), fill: 'url(#shaft)', opacity: 0.85 }, b1);
    P.wash(b1, P.closedD(P.blobPts(640, 935, 250, 42, 0.1, 12)), C.goldPale, 0.4);
    var b2 = A.beat(L1, 2);
    P.figure(b2, 'look', { x: 640, y: 925, s: 1.08 });
    reflect(b2, 925, 0.15, function (r) { P.figure(r, 'look', { x: 640, y: 925, s: 1.08 }); });
    return { fx: { motes: { quad: q, n: 110 } }, update: function (p) { shaft.setAttribute('opacity', (0.7 + 0.3 * Math.sin(p * 9)).toFixed(3)); } };
  };

  // 3. the pedestal, the Letter, and a first hairline flaw in a mirror
  S.s3 = function (A) {
    var L0 = A.layer(12), L1 = A.layer(34), L2 = A.layer(66), b0 = A.beat(L0, 0);
    hall(P.g(b0, { opacity: 0.42 }), A, { vp: [760, 430] });
    var b1 = A.beat(L0, 1), mx0 = 1050, mx1 = 1330, my0 = 110, my1 = 770;
    P.wash(b1, rect(mx0, my0, mx1, my1), '#dfe9ec', 0.85, { plain: true });
    P.hatch(b1, [mx0, my0, mx1 - mx0, my1 - my0], { angle: 64, gap: 22, w: 0.8, op: 0.35, c: C.glass, clip: P.clip(rect(mx0, my0, mx1, my1)) });
    P.ink(b1, [[mx0, my1], [mx0, my0], [mx1, my0], [mx1, my1]], 2.6); P.line(b1, [[mx0 - 10, my1], [mx1 + 10, my1]], 1.8);
    crackWeb(b1, mx0 + 64, my0 + 76, 64, { rays: 6, w: 0.9, c: C.glass }).set(1);
    var b2 = A.beat(L1, 2), px = 800, ptop = 610;
    pedestal(b2, px, ptop, 975);
    var bk = P.g(b2); book(bk, px, ptop - 6, 152);
    txt(bk, px + 18, ptop - 12, 'Language is the house of Being.', { size: 12.5, rot: 3 });
    var b3 = A.beat(L2, 3);
    P.figure(b3, 'trace', { x: 1090, y: 975, s: 1.45, flip: true });
  };

  // 4. the storm, the bolt, the terror; Luther on the road in 1505
  S.s4 = function (A) {
    var L0 = A.layer(14), L1 = A.layer(40), L2 = A.layer(76), ink = C.nightink;
    hall(A.beat(L0, 0), A, { vp: [820, 450], mirror: true, c: '#8c8678' });
    var b1 = A.beat(L0, 1), wx0 = 640, wx1 = 1000, wy0 = 150, wy1 = 650, wd = archD(wx0, wx1, wy0, wy1), wk = P.clip(wd);
    P.el('path', { d: wd, fill: '#1d1c25' }, b1);
    P.scribble(b1, [wx0, wy0 - 40, wx1 - wx0, 200], { step: 8, w: 1.1, c: '#77738a', op: 0.55, clip: wk });
    P.hatch(b1, [wx0, wy0, wx1 - wx0, wy1 - wy0], { angle: 80, gap: 8, w: 0.7, c: '#9a97ad', op: 0.3, clip: wk });
    var bl = bolt(P.g(b1, { 'clip-path': wk }), 870, wy0 - 40, 760, wy1 + 10);
    P.ink(b1, archPts(wx0, wx1, wy0, wy1), 3.4, { c: ink });
    P.lines(b1, [[[wx0 + 120, wy0 + 40], [wx0 + 120, wy1]], [[wx1 - 120, wy0 + 40], [wx1 - 120, wy1]], [[wx0, wy0 + 260], [wx1, wy0 + 260]]], 1.6, { c: ink, op: 0.8 });
    // Luther, in an oval plate like an old engraving
    var b2 = A.beat(L1, 2), ov = P.g(b2, { opacity: 0 }), cx = 300, cy = 470, rx = 170, ry = 225, od = P.closedD(P.blobPts(cx, cy, rx, ry, 0.01, 18)), ok = P.clip(od);
    P.wash(ov, od, '#efe3c8', 0.96, { plain: true });
    var og = P.g(ov, { 'clip-path': ok });
    P.hatch(og, [cx - rx, cy - ry, rx * 2, ry * 0.9], { angle: 12, gap: 5, w: 0.8, op: 0.75 });
    P.scribble(og, [cx - rx, cy - ry, rx * 2, 90], { step: 6, w: 1, op: 0.5 });
    P.ink(og, [[cx - rx, cy + 40], [cx - 30, cy + 30], [cx + rx, cy + 46]], 1.6);
    P.lines(og, [[[cx - 150, cy + ry], [cx - 14, cy + 34]], [[cx + 150, cy + ry], [cx + 14, cy + 34]]], 1.4, { op: 0.9 });
    var lb = [[cx + 40, cy - ry], [cx + 18, cy - 120], [cx + 52, cy - 96], [cx + 20, cy - 30], [cx + 44, cy - 12], [cx + 6, cy + 60]];
    P.el('path', { d: P.poly(lb), fill: 'none', stroke: C.gold, 'stroke-width': 4, 'stroke-linejoin': 'round' }, og);
    P.el('path', { d: P.poly(lb), fill: 'none', stroke: C.ink, 'stroke-width': 1.2, 'stroke-linejoin': 'round' }, og);
    var tx = cx + 92, ty = cy + 40;
    P.brush(og, [[tx, ty], [tx + 6, ty - 60], [tx - 4, ty - 110]], 6); P.brush(og, [[tx + 2, ty - 70], [tx - 30, ty - 108]], 3); P.brush(og, [[tx + 3, ty - 84], [tx + 34, ty - 112]], 3);
    P.scribble(og, [tx - 40, ty - 150, 80, 50], { step: 4, w: 0.9, op: 0.7 });
    var fy = cy + 118, fx0 = cx - 62;
    P.brush(og, [[fx0, fy], [fx0 + 30, fy - 4], [fx0 + 62, fy - 2]], 7);
    P.ellipseLine(og, fx0 + 74, fy - 6, 9, 8, 1.6);
    P.brush(og, [[fx0 + 52, fy - 6], [fx0 + 64, fy - 40], [fx0 + 70, fy - 66]], 3);
    P.brush(og, [[fx0 + 2, fy], [fx0 - 26, fy + 10], [fx0 - 44, fy + 4]], 4);
    P.brush(og, [[fx0 + 4, fy - 3], [fx0 - 20, fy - 16], [fx0 - 40, fy - 10]], 4);
    P.ellipseLine(ov, cx, cy, rx, ry, 2.6, { c: ink }); P.ellipseLine(ov, cx, cy, rx + 12, ry + 12, 1.2, { c: ink, op: 0.8 });
    txt(ov, cx, cy + ry + 46, 'Martin Luther, 1505', { size: 22, anchor: 'middle', c: ink });
    var b3 = A.beat(L2, 3);
    P.figure(b3, 'recoil', { x: 930, y: 950, s: 1.38, dark: true });
    var fired = false;
    return {
      fx: { rain: { n: 90, box: [650, 150, 340, 500], c: 'rgba(205,210,230,.35)' } },
      update: function (p) {
        if (p > 0.05 && !fired && A.flashEl && !document.documentElement.classList.contains('still')) { fired = true; A.flashEl.classList.remove('on'); void A.flashEl.offsetWidth; A.flashEl.classList.add('on'); }
        if (p < 0.01) fired = false;
        bl.setAttribute('opacity', p < 0.04 ? 0.15 : P.clamp(1.15 - (p - 0.05) * 1.8, 0.3, 1).toFixed(3));
        ov.setAttribute('opacity', ramp(p, 0.3, 0.45).toFixed(3));
      }
    };
  };

  // 5. the cracked pane at night; his hand on the fracture; rain beyond
  S.s5 = function (A) {
    var L0 = A.layer(8), L1 = A.layer(30), L2 = A.layer(72), ink = C.nightink, b0 = A.beat(L0, 0);
    P.el('rect', { x: 0, y: 0, width: 1600, height: 1000, fill: '#171b20' }, b0);
    [[260, 760, 520], [520, 780, 380], [1240, 770, 600], [1480, 790, 420]].forEach(function (t) { var g = P.g(b0, { opacity: 0.22 }); tree(g, t[0], t[1], t[2], { c: ink, leaf: '#9aa58a', leafOp: 0.15 }); });
    var b1 = A.beat(L1, 1);
    P.wash(b1, rect(130, 60, 1470, 940), '#cfe2ea', 0.08, { plain: true });
    var lead = [];
    [400, 800, 1200].forEach(function (x) { lead.push([[x, 60], [x, 940]]); }); [330, 640].forEach(function (y) { lead.push([[130, y], [1470, y]]); });
    P.lines(b1, lead, 2.2, { c: ink, op: 0.35 });
    P.ink(b1, [[130, 940], [130, 60], [1470, 60], [1470, 940]], 6, { c: ink, op: 0.85 });
    var cw = crackWeb(b1, 1000, 400, 470, { rays: 13, w: 1.7, c: '#eef3f5' });
    var gapP = [[992, 392], [1052, 336], [1072, 362], [1014, 424]];
    P.el('path', { d: P.closedD(gapP, 2), fill: '#06080a' }, b1);
    P.line(b1, gapP.concat([gapP[0]]), 1.2, { c: '#eef3f5' });
    var leaf = P.g(b1, { opacity: 0.9 }); P.brush(leaf, [[1040, 352], [1062, 340], [1080, 346]], 5, { c: '#7d8a55' });
    var air = [];
    for (var i = 0; i < 5; i++) { var y = 360 + i * 16; air.push(P.line(b1, [[1020, y], [960, y + P.jj(10)], [900, y + 14 + P.jj(10)], [830, y + 6]], 1, { c: ink, op: 0.45 })); }
    prep(air);
    var b2 = A.beat(L1, 2);
    P.lines(b2, [[[120, 1000], [330, 520]], [[200, 1000], [410, 520]]], 5, { c: ink, op: 0.8 });
    var rungs = []; for (var k = 0; k < 5; k++) { var t = k / 5 + 0.06; rungs.push([[P.lerp(120, 330, t), P.lerp(1000, 520, t)], [P.lerp(200, 410, t), P.lerp(1000, 520, t)]]); }
    P.lines(b2, rungs, 3, { c: ink, op: 0.7 });
    var b3 = A.beat(L2, 3);
    hand(b3, 812, 524, 2.6, -28, { dark: true });
    return {
      fx: { rain: { n: 220, c: 'rgba(214,222,232,.25)' } },
      update: function (p, e) { cw.set(P.clamp(e * 0.8 + p * 0.6 - 0.25, 0, 1)); drawTo(air, ramp(p, 0.15, 0.6), 0.5); }
    };
  };

  // 6. lamplight; the repaired scar; old passages surfacing
  S.s6 = function (A) {
    var L0 = A.layer(10), L1 = A.layer(34), L2 = A.layer(70), ink = C.nightink, b0 = A.beat(L0, 0);
    P.el('circle', { cx: 1330, cy: 760, r: 520, fill: 'url(#goldGlow)', opacity: 0.55 }, b0);
    var sw = P.g(b0, { opacity: 0.35 }); shelfWall(sw, 40, 560, 80, 900, { c: ink, rows: 6 });
    P.wash(b0, rect(600, 60, 1560, 900), '#cfe2ea', 0.07, { plain: true });
    P.lines(b0, [[[600, 60], [600, 900]], [[1560, 60], [1560, 900]], [[600, 900], [1560, 900]]], 2, { c: ink, op: 0.5 });
    var b1 = A.beat(L1, 1), cw = crackWeb(b1, 1060, 560, 190, { rays: 10, w: 1.2, c: '#dfe8ec' });
    cw.set(1);
    cw.ends.forEach(function (pts) { P.el('path', { d: P.poly(pts.slice(0, Math.max(2, Math.ceil(pts.length * 0.6)))), fill: 'none', stroke: '#f6e7bf', 'stroke-width': 5, opacity: 0.22, 'stroke-linecap': 'round' }, b1); });
    var tb = 1330;
    P.lines(b1, [[[1220, 860], [1440, 860]], [[1236, 860], [1236, 1000]], [[1424, 860], [1424, 1000]]], 3, { c: ink, op: 0.8 });
    P.ink(b1, [[tb - 34, 858], [tb - 40, 830], [tb - 24, 810], [tb + 24, 810], [tb + 40, 830], [tb + 34, 858]], 2.2, { c: ink });
    P.ink(b1, [[tb - 14, 810], [tb - 18, 760], [tb - 10, 720], [tb + 10, 720], [tb + 18, 760], [tb + 14, 810]], 1.6, { c: ink });
    P.el('path', { d: P.closedD(P.blobPts(tb, 772, 6, 16, 0.1, 10)), fill: C.goldPale }, b1);
    var words = P.g(b1), W = [['Ereignis', 1220, 330, 44], ['freedom', 1370, 470, 30], ['the event of becoming', 1100, 230, 26], ['a world beyond names', 1240, 640, 24], ['Ereignis', 700, 300, 22]];
    var wEls = W.map(function (w) { return txt(words, w[1], w[2], w[0], { size: w[3], c: '#f1e3bf', op: 0 }); });
    var b2 = A.beat(L2, 2);
    P.figure(b2, 'trace', { x: 925, y: 965, s: 1.72, dark: true });
    return {
      update: function (p) {
        wEls.forEach(function (el, i) { var t = ramp(p, 0.1 + i * 0.1, 0.35 + i * 0.1); el.setAttribute('opacity', (t * (1 - ramp(p, 0.85, 1)) * 0.75).toFixed(3)); el.setAttribute('transform', 'translate(0 ' + (-(p * 120) - i * 6).toFixed(1) + ')'); });
      }
    };
  };

  // 7. two pulls: the shelves of order, the scarred wall and the world behind it
  S.s7 = function (A) {
    var L0 = A.layer(12), L1 = A.layer(56), b0 = A.beat(L0, 0);
    var left = P.g(b0, { 'clip-path': P.clip(rect(0, 0, 800, 1000)) }), right = P.g(b0, { 'clip-path': P.clip(rect(800, 0, 1600, 1000)) });
    shelfWall(left, 30, 790, 70, 900, { rows: 7 });
    P.wash(right, rect(800, 0, 1600, 1000), '#e7efe8', 0.6, { plain: true });
    P.wash(right, P.closedD(P.blobPts(1300, 300, 180, 180, 0.05, 14)), C.goldPale, 0.5);
    var hills = P.g(right, { opacity: 0.55 });
    P.ink(hills, [[800, 640], [960, 590], [1140, 610], [1320, 560], [1600, 600]], 2); P.ink(hills, [[800, 720], [1060, 680], [1300, 700], [1600, 670]], 1.6);
    tree(hills, 1180, 640, 260, { leafOp: 0.3 });
    var cw = crackWeb(right, 1150, 420, 300, { rays: 11, w: 1.1, c: C.glass }); cw.set(1);
    P.line(b0, [[30, 900], [1570, 900]], 1.6);
    var b1 = A.beat(L0, 1), seam = [[800, -10]];
    for (var y = 40; y < 1010; y += 50) seam.push([800 + P.jj(9), y]);
    P.line(b1, seam, 1.8, { j: 0, bow: 0, steps: 1 });
    var b2 = A.beat(L1, 2);
    P.figure(P.g(b2, { 'clip-path': P.clip(rect(0, 0, 800, 1000)) }), 'walk', { x: 800, y: 935, s: 1.55, flip: true });
    P.figure(P.g(b2, { 'clip-path': P.clip(rect(800, 0, 1600, 1000)) }), 'walk', { x: 800, y: 935, s: 1.55 });
  };

  // 8. the great door; the tide of dawn
  S.s8 = function (A) {
    var L0 = A.layer(8), L1 = A.layer(26), L2 = A.layer(64), ink = C.nightink, b0 = A.beat(L0, 0);
    var blocks = [];
    for (var y = 40; y < 960; y += 64) for (var x = (y / 64 % 2) * 60; x < 1600; x += 120) if (x < 540 || x > 1060 || y < 90) blocks.push([[x, y], [x + 118, y]], [[x, y], [x, y + 62]]);
    P.lines(b0, blocks, 1, { c: ink, op: 0.16 });
    var b1 = A.beat(L1, 1), X0 = 600, X1 = 1000, Y0 = 200, Y1 = 900;
    var glow = P.el('path', { d: rect(X0, Y0, X1, Y1), fill: '#f7d886', opacity: 0 }, b1);
    var bloomC = P.el('circle', { cx: 900, cy: 560, r: 300, fill: 'url(#goldGlow)', opacity: 0 }, b1);
    P.ink(b1, archPts(X0 - 40, X1 + 40, Y0 - 60, Y1), 5, { c: ink });
    P.ink(b1, [[X0, Y1], [X0, Y0], [X1, Y0], [X1, Y1]], 2.6, { c: ink });
    P.hatch(b1, [X0 - 40, Y0 - 120, X1 - X0 + 80, 120], { angle: 70, gap: 5, w: 0.8, c: ink, op: 0.4, clip: P.clip('M' + (X0 - 40) + ' ' + Y0 + 'L' + (X0 - 40) + ' ' + (Y0 - 60) + 'Q800 ' + (Y0 - 190) + ' ' + (X1 + 40) + ' ' + (Y0 - 60) + 'L' + (X1 + 40) + ' ' + Y0 + 'Z') });
    // the leaf of the door, drawn flat and squeezed toward its hinge as it opens
    var leafG = P.g(b1), leaf = P.g(leafG);
    P.el('path', { d: rect(0, Y0, 400, Y1), fill: '#2a2119' }, leaf);
    var planks = []; for (var k = 1; k < 7; k++) planks.push([[k * 57, Y0 + 4], [k * 57 + P.jj(2), Y1 - 4]]);
    P.lines(leaf, planks, 1.4, { c: '#8a7a62', op: 0.8 });
    P.hatch(leaf, [0, Y0, 400, Y1 - Y0], { angle: 88, gap: 6, w: 0.6, c: '#0e0b08', op: 0.6, bow: 3 });
    P.lines(leaf, [[[6, Y0 + 130], [394, Y0 + 130]], [[6, Y1 - 130], [394, Y1 - 130]]], 9, { c: '#151413', op: 0.95 });
    P.ellipseLine(leaf, 350, 590, 16, 20, 3, { c: '#a8977a' });
    P.ink(leaf, [[0, Y1], [0, Y0], [400, Y0], [400, Y1], [0, Y1]], 2.4, { c: ink, echo: false });
    [].forEach.call(leaf.querySelectorAll('path'), function (pp) { pp.setAttribute('vector-effect', 'non-scaling-stroke'); });
    var wedge = P.el('path', { d: '', fill: '#f2c868', opacity: 0, filter: 'url(#wash)' }, b1);
    var b2 = A.beat(L2, 2);
    P.figure(b2, 'trace', { x: 836, y: 945, s: 1.45, dark: true });
    var white = P.el('rect', { x: 0, y: 0, width: 1600, height: 1000, fill: '#fbf1d8', opacity: 0 }, A.svg);
    return {
      update: function (p) {
        var o = ease((p - 0.12) / 0.5), xr = X1 - 300 * o;
        leafG.setAttribute('transform', 'translate(' + X0 + ' 0) scale(' + ((xr - X0) / 400).toFixed(4) + ' 1)');
        glow.setAttribute('opacity', (o * 0.95).toFixed(3));
        bloomC.setAttribute('opacity', (o * 0.9).toFixed(3)); bloomC.setAttribute('r', (300 + 500 * ramp(p, 0.45, 0.95)).toFixed(0));
        wedge.setAttribute('d', P.poly([[xr, Y1], [X1, Y1], [X1 + 520 * o, 1000], [xr - 360 * o, 1000]], true));
        wedge.setAttribute('opacity', (o * 0.75).toFixed(3));
        white.setAttribute('opacity', (ramp(p, 0.62, 0.98) * 0.92).toFixed(3));
      }
    };
  };

  // 9. over the threshold: pebbles, dew, small rainbows at his feet
  S.s9 = function (A) {
    var L0 = A.layer(10), L1 = A.layer(30), L2 = A.layer(60), b0 = A.beat(L0, 0);
    P.wash(b0, rect(330, 0, 1600, 620), '#f6dc9c', 0.35);
    P.el('circle', { cx: 1450, cy: 600, r: 420, fill: 'url(#goldGlow)', opacity: 0.8 }, b0);
    P.ink(b0, [[330, 610], [700, 596], [1100, 606], [1600, 590]], 1.8);
    P.ink(b0, [[330, 650], [900, 640], [1600, 660]], 1.2, { op: 0.6 });
    tree(P.g(b0, { opacity: 0.4 }), 1250, 610, 200, {}); tree(P.g(b0, { opacity: 0.3 }), 560, 606, 150, {});
    P.el('rect', { x: 0, y: 0, width: 330, height: 1000, fill: '#1c1915' }, b0);
    P.ink(b0, [[330, 1000], [330, 0]], 9); P.ink(b0, [[300, 1000], [300, 0]], 3);
    P.hatch(b0, [0, 0, 300, 1000], { angle: 80, gap: 7, w: 0.7, c: '#3a342b', op: 0.8 });
    var b1 = A.beat(L1, 1);
    P.wash(b1, P.poly([[0, 905], [460, 880], [470, 940], [0, 980]], true), '#a49a86', 0.55);
    P.ink(b1, [[0, 905], [460, 880], [470, 940]], 2.6);
    grass(b1, 700, 1000, 160, { x0: 360, h: 26 });
    pebbles(b1, [380, 760, 1220, 240], 130);
    var b2 = A.beat(L2, 2), fx = 860, fy = 965, s = 2.45;
    P.figure(b2, 'walk', { x: fx, y: fy, s: s });
    var bows = P.g(b2, { opacity: 0 }), cols = ['#d2453c', '#e08a2e', '#e8c44a', '#6aa65a', '#4f7fbf', '#7a5aa8'];
    [[fx - 34 * s + 24, fy + 6], [fx + 36 * s + 30, fy]].forEach(function (f) {
      cols.forEach(function (c, i) { P.el('path', { d: 'M' + (f[0] - 30 - i * 6) + ' ' + f[1] + 'A' + (30 + i * 6) + ' ' + (11 + i * 2.2) + ' 0 0 1 ' + (f[0] + 30 + i * 6) + ' ' + f[1], fill: 'none', stroke: c, 'stroke-width': 3, opacity: 0.6 }, bows); });
    });
    var dew = P.g(b2, { opacity: 0 });
    for (var i = 0; i < 46; i++) {
      var zone = i < 18 ? [fx + 8 * s, fy - 256 * s, 26, 40] : i < 30 ? [fx - 34 * s, fy - 60 * s, 46 * s, 50 * s] : [fx - 10 * s, fy - 220 * s, 20 * s, 60 * s];
      var dx = zone[0] + P.jj(zone[2]), dy = zone[1] + P.rnd() * zone[3], r = P.rr(1.8, 4.2);
      P.el('circle', { cx: dx, cy: dy, r: r, fill: '#e9f3f6', stroke: C.glass, 'stroke-width': 0.6, opacity: 0.85 }, dew);
      P.el('circle', { cx: dx - r * 0.35, cy: dy - r * 0.35, r: r * 0.3, fill: '#fff' }, dew);
    }
    return {
      fx: { spark: { box: [fx - 70, fy - 660, 160, 640], n: 16 } },
      fxOn: function (p) { return { spark: ramp(p, 0.15, 0.4) }; },
      update: function (p) { bows.setAttribute('opacity', ramp(p, 0.42, 0.7).toFixed(3)); dew.setAttribute('opacity', ramp(p, 0.15, 0.4).toFixed(3)); }
    };
  };

  // 10. the meadow at dawn; bark under his hand; the library drifting away like a dream
  S.s10 = function (A) {
    var L0 = A.layer(8), L1 = A.layer(30), L2 = A.layer(56), L3 = A.layer(120), b0 = A.beat(L0, 0);
    P.wash(b0, P.closedD(P.blobPts(1250, 540, 520, 90, 0.15, 14)), '#f4d58c', 0.5);
    P.ink(b0, [[0, 560], [380, 548], [760, 566], [1200, 552], [1600, 560]], 1.6);
    P.ink(b0, [[0, 610], [500, 596], [1100, 612], [1600, 600]], 1.1, { op: 0.6 });
    var lib = P.g(b0); facade(lib, 270, 560, 190, 150, { cols: 4 });
    var mist = P.g(b0), m = [];
    [[300, 560, 340, 34], [900, 590, 420, 30], [1350, 575, 360, 26], [520, 620, 400, 22]].forEach(function (e) { m.push(P.wash(mist, P.closedD(P.blobPts(e[0], e[1], e[2], e[3], 0.2, 12)), '#fffaf0', 0.75)); });
    birds(b0, 6, [1100, 190, 300, 120]);
    var b1 = A.beat(L1, 1); tree(b1, 880, 935, 760, { lean: -10 });
    var b2 = A.beat(L2, 2); P.figure(b2, 'trace', { x: 765, y: 935, s: 1.15 });
    var b3 = A.beat(L3, 3); grass(b3, 900, 1060, 520, { h: 46, w: 1.2 });
    return { update: function (p) { lib.setAttribute('opacity', (0.75 - 0.6 * ramp(p, 0.2, 0.8)).toFixed(3)); mist.setAttribute('transform', 'translate(' + (p * 80).toFixed(1) + ' 0)'); } };
  };

  // 11. the still pond; his reflection among the clouds; the question
  S.s11 = function (A) {
    var L0 = A.layer(8), L1 = A.layer(30), L2 = A.layer(60), b0 = A.beat(L0, 0);
    sun(b0, 1350, 170, 54, { glow: 0.6, rays: 40 });
    clouds(b0, 4, [200, 80, 1000, 160], {});
    P.ink(b0, [[0, 600], [500, 590], [1100, 604], [1600, 594]], 1.4, { op: 0.7 });
    var b1 = A.beat(L1, 1), pd = P.closedD(P.blobPts(920, 800, 660, 170, 0.04, 18)), pk = P.clip(pd);
    P.wash(b1, pd, '#b9d0d6', 0.55);
    var water = P.g(b1, { 'clip-path': pk, filter: 'url(#ripple)' });
    reflect(water, 640, 0.5, function (r) { sun(r, 1350, 170, 54, { glow: 0.5, rays: 40 }); clouds(r, 3, [300, 90, 900, 140], { op: 0.4 }); });
    P.hatch(water, [260, 630, 1320, 340], { angle: 0, gap: 9, w: 0.7, op: 0.35, c: C.glass });
    reflect(water, 690, 0.42, function (r) { P.figure(r, 'kneel', { x: 470, y: 690, s: 1.35 }); });
    P.line(b1, P.blobPts(920, 800, 660, 170, 0.04, 18).concat([P.blobPts(920, 800, 660, 170, 0.04, 18)[0]]), 1.6, { op: 0.8 });
    grass(b1, 600, 690, 140, { x0: 0, x1: 380, h: 22 }); grass(b1, 610, 700, 90, { x0: 1420, x1: 1600, h: 24 });
    var reeds = []; for (var i = 0; i < 26; i++) { var x = 1350 + P.rr(0, 160), y = P.rr(700, 760); reeds.push([[x, y], [x + P.jj(10), y - P.rr(60, 130)]]); } P.lines(b1, reeds, 1.4, {});
    var b2 = A.beat(L2, 2); P.figure(b2, 'kneel', { x: 470, y: 690, s: 1.35 });
    var q = txt(A.svg, 660, 360, 'Who am I?', { size: 110, op: 0 });
    return { update: function (p) { q.setAttribute('opacity', (ramp(p, 0.55, 0.8) * 0.92).toFixed(3)); } };
  };

  // 12. the clearing: rays through the trees, the stone, library dust lifting off his cloak
  S.s12 = function (A) {
    var L0 = A.layer(8), L1 = A.layer(28), L2 = A.layer(56), L3 = A.layer(110), b0 = A.beat(L0, 0);
    P.scribble(b0, [0, -30, 1600, 160], { step: 9, w: 1, op: 0.35 });
    [[360, 26], [520, 16], [1110, 18], [1250, 30]].forEach(function (t) { trunk(P.g(b0, { opacity: 0.55 }), t[0], t[1], { y1: 760 }); });
    var rays = P.g(b0, { opacity: 0.9 });
    [[560, 700, 860, 940], [640, 760, 900, 1000], [700, 820, 980, 1040]].forEach(function (r) { P.el('path', { d: P.poly([[r[0], -40], [r[1], -40], [r[3], 980], [r[2], 980]], true), fill: 'url(#shaft)', opacity: 0.75 }, rays); });
    P.ink(b0, [[0, 760], [600, 752], [1600, 766]], 1.2, { op: 0.6 });
    var b1 = A.beat(L1, 1);
    grass(b1, 760, 1000, 260, { h: 28 });
    stone(b1, 790, 840, 150, 62);
    var b2 = A.beat(L2, 2); P.figure(b2, 'sit', { x: 770, y: 905, s: 1.5 });
    var b3 = A.beat(L3, 3);
    [[110, 64], [240, 40], [1400, 44], [1540, 70]].forEach(function (t) { trunk(b3, t[0], t[1], {}); });
    return { fx: { rise: { box: [700, 560, 200, 300], n: 70 } }, fxOn: function (p) { return { rise: ramp(p, 0.1, 0.4) }; } };
  };

  // 13. his first own words: light leaving his lips and becoming handwriting
  S.s13 = function (A) {
    var L0 = A.layer(8), L1 = A.layer(44), b0 = A.beat(L0, 0);
    P.wash(b0, rect(0, 0, 1600, 1000), '#f6e2ad', 0.28);
    sun(b0, 1380, 220, 46, { glow: 0.6, rays: 36 });
    P.ink(b0, [[0, 760], [700, 748], [1600, 764]], 1.2, { op: 0.5 });
    var b1 = A.beat(L1, 1), H = P.g(b1, { transform: 'translate(430 520) scale(1.25)' });
    var prof = [[-150, 40], [-160, -40], [-130, -120], [-60, -175], [20, -185], [90, -160], [135, -110], [150, -50], [158, -20], [150, 0], [160, 15], [205, 70],
      [180, 88], [178, 100], [190, 115], [176, 126], [186, 140], [170, 158], [176, 190], [150, 222], [90, 240], [60, 252], [70, 330], [-60, 330], [-90, 200], [-130, 130]];
    var hd = P.glass(H, prof, { w: 1.6 }), hk = P.clip(hd);
    var vInk = P.script(H, -140, -160, 280, 66, { lh: 7, c: C.glass, op: 0.45, clip: hk, w: 0.7 });
    var vGold = P.script(H, -140, -160, 280, 66, { lh: 7, c: C.goldDeep, op: 0, clip: hk, w: 0.9 });
    P.line(H, [[40, -150], [100, -120], [125, -70]], 3, { c: '#fff', op: 0.9 });
    var col = P.g(b1); P.wash(col, P.poly([[260, 1000], [330, 900], [500, 880], [620, 900], [700, 1000]], true), C.slate, 0.7);
    P.ink(col, [[260, 1000], [330, 900], [500, 880], [620, 900], [700, 1000]], 3);
    var c1 = P.cursive(672, 668, 840, { a: 4.4, b: 12, wave: 30 });
    var gold = P.el('path', { d: P.poly(c1), fill: 'none', stroke: C.gold, 'stroke-width': 4.2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', pathLength: 1 }, b1);
    var gl = P.el('path', { d: P.poly(c1), fill: 'none', stroke: C.goldPale, 'stroke-width': 12, opacity: 0.5, filter: 'url(#bloom)', pathLength: 1 }, b1);
    var c2 = P.cursive(700, 720, 640, { a: 3.2, b: 5, wave: 12 });
    var echo = P.el('path', { d: P.poly(c2), fill: 'none', stroke: C.ink, 'stroke-width': 1, opacity: 0.45, pathLength: 1 }, b1);
    prep([gold, gl, echo]);
    return { update: function (p) { var t = ramp(p, 0.05, 0.75); drawTo([gold, gl], t); drawTo([echo], ramp(p, 0.3, 0.95)); vGold.setAttribute('opacity', (0.85 * ramp(p, 0.1, 0.6)).toFixed(3)); vInk.setAttribute('opacity', (0.45 * (1 - ramp(p, 0.1, 0.6))).toFixed(3)); } };
  };

  // 14. the tapestry: threads between him and everything he names
  S.s14 = function (A) {
    var L0 = A.layer(8), L1 = A.layer(30), L2 = A.layer(60), b0 = A.beat(L0, 0);
    sun(b0, 1320, 210, 66, {});
    birds(b0, 7, [330, 110, 320, 110]);
    P.ink(b0, [[0, 760], [800, 748], [1600, 762]], 1.2, { op: 0.55 });
    var b1 = A.beat(L1, 1);
    tree(b1, 250, 930, 640, {});
    stone(b1, 1130, 880, 100, 40);
    var brook = []; for (var i = 0; i < 6; i++) brook.push(P.line(b1, [[980, 930 + i * 12], [1180, 924 + i * 12], [1380, 936 + i * 12], [1620, 928 + i * 12]], 1, { op: 0.55, c: C.glass }));
    grass(b1, 780, 1000, 200, { h: 24 });
    var weave = P.g(b0, { opacity: 0 }), wv = [];
    for (var x = 40; x < 1600; x += 46) wv.push([[x, 0], [x + P.jj(6), 1000]]);
    for (var y = 30; y < 1000; y += 46) wv.push([[0, y], [1600, y + P.jj(6)]]);
    P.lines(weave, wv, 0.8, { c: C.goldDeep, op: 0.5 });
    var b2 = A.beat(L2, 2); P.figure(b2, 'open', { x: 780, y: 930, s: 1.4, glow: 0.5, veins: C.goldDeep });
    var ch = [780, 930 - 196 * 1.4], targets = [[300, 360], [1320, 210], [1130, 860], [1380, 950], [480, 165], [520, 950], [980, 940], [180, 600], [1500, 520]], threads = [];
    targets.forEach(function (t, i) {
      for (var k = 0; k < 3; k++) {
        var mid = P.lp(ch, t, 0.5); mid = [mid[0] + P.jj(60), mid[1] + 40 + P.jj(50)];
        threads.push(P.el('path', { d: P.poly(P.spline([[ch[0] + P.jj(10), ch[1] + P.jj(10)], mid, t], 10)), fill: 'none', stroke: k ? C.ink : C.gold, 'stroke-width': k ? 0.7 : 1.6, opacity: k ? 0.5 : 0.9, pathLength: 1 }, b1));
      }
    });
    prep(threads);
    return { update: function (p) { drawTo(threads, ramp(p, 0.05, 0.75), 0.6); weave.setAttribute('opacity', (0.32 * ramp(p, 0.4, 0.9)).toFixed(3)); } };
  };

  // 15. the sun fully risen; he falls silent and simply is; his outline dissolves into the dawn
  S.s15 = function (A) {
    var L0 = A.layer(10), L1 = A.layer(36), L2 = A.layer(60), b0 = A.beat(L0, 0);
    P.wash(b0, rect(0, 0, 1600, 760), '#f6dfa4', 0.3);
    sun(b0, 800, 330, 150, { glow: 0.9, rays: 72 });
    var bd = P.g(b0), bd1 = birds(bd, 9, [180, 160, 380, 180]);
    var b1 = A.beat(L1, 1);
    P.ink(b1, [[0, 720], [400, 700], [800, 714], [1200, 698], [1600, 716]], 1.6);
    P.ink(b1, [[0, 790], [600, 772], [1600, 792]], 1.1, { op: 0.6 });
    for (var i = 0; i < 5; i++) P.line(b1, [[0, 930 + i * 13], [500, 924 + i * 13], [1000, 936 + i * 13], [1600, 926 + i * 13]], 1, { op: 0.5, c: C.glass });
    grass(b1, 770, 920, 200, { h: 22 });
    stone(b1, 800, 846, 130, 50);
    var b2 = A.beat(L2, 2), fig = P.g(b2, { filter: 'url(#dissolve)' });
    P.figure(fig, 'sit', { x: 780, y: 905, s: 1.3, glow: 0.4 });
    var fa = document.getElementById('dissolveA');
    return { update: function (p) { fa.setAttribute('intercept', (1 - 5.6 * ramp(p, 0.25, 0.9)).toFixed(3)); bd.setAttribute('transform', 'translate(' + (p * 220).toFixed(1) + ' ' + (-p * 60).toFixed(1) + ')'); } };
  };

  // 16. he rises; far off, the library with its doors and windows thrown open to the sun
  S.s16 = function (A) {
    var L0 = A.layer(8), L1 = A.layer(30), L2 = A.layer(70), b0 = A.beat(L0, 0);
    sun(b0, 230, 250, 70, { glow: 0.85 });
    P.ink(b0, [[0, 650], [600, 640], [1600, 652]], 1.4, { op: 0.6 });
    var b1 = A.beat(L1, 1), F = facade(b1, 960, 650, 560, 380, { cols: 6 });
    var lights = P.g(b1, { opacity: 0 }), beams = P.g(b0, { opacity: 0 });
    F.win.forEach(function (w) {
      P.wash(lights, P.closedD(w.pts, 3), w.door ? '#f3c35a' : C.goldPale, w.door ? 0.9 : 0.75);
      P.el('path', { d: P.poly([[230, 250], [w.pts[1][0], w.pts[1][1]], [w.pts[4][0], w.pts[4][1]]], true), fill: C.goldPale, opacity: 0.16 }, beams);
    });
    var breeze = [];
    for (var i = 0; i < 6; i++) { var y = 340 + i * 52 + P.jj(14), x0 = P.rr(40, 160), amp = P.rr(14, 30); breeze.push(P.line(b1, [[x0, y], [x0 + 110, y - amp], [x0 + 230, y + amp * 0.6], [x0 + 330, y - amp * 0.4], [x0 + 400, y - amp * 1.4], [x0 + 380, y - amp * 2.2], [x0 + 350, y - amp * 1.6]], 1.2, { op: 0.65 })); }
    prep(breeze);
    P.ink(b1, [[920, 650], [700, 820], [460, 1000]], 1.6); P.ink(b1, [[1000, 650], [1060, 820], [1160, 1000]], 1.6);
    grass(b1, 660, 1000, 300, { h: 30 });
    var b2 = A.beat(L2, 2); P.figure(b2, 'stand', { x: 330, y: 975, s: 2.0, cracked: 'gold' });
    return { update: function (p) { var t = ramp(p, 0.1, 0.6); lights.setAttribute('opacity', t.toFixed(3)); beams.setAttribute('opacity', t.toFixed(3)); drawTo(breeze, ramp(p, 0.05, 0.7), 0.4); } };
  };

  // 17. he walks back, carrying the clearing's light within him
  S.s17 = function (A) {
    var L0 = A.layer(8), L1 = A.layer(30), L2 = A.layer(64), b0 = A.beat(L0, 0);
    sun(b0, 1020, 300, 60, { glow: 0.9 });
    P.ink(b0, [[0, 560], [700, 552], [1600, 566]], 1.3, { op: 0.6 });
    var b1 = A.beat(L1, 1), F = facade(b1, 1040, 560, 320, 230, { cols: 5 });
    F.win.forEach(function (w) { P.wash(b1, P.closedD(w.pts, 3), w.door ? '#f3c35a' : C.goldPale, 0.8); });
    P.ink(b1, [[990, 560], [760, 760], [420, 1000]], 1.8); P.ink(b1, [[1080, 560], [1160, 760], [1320, 1000]], 1.8);
    grass(b1, 600, 1000, 260, { h: 30, x1: 700 }); grass(b1, 600, 1000, 160, { h: 30, x0: 1250 });
    var b2 = A.beat(L2, 2); P.figure(b2, 'walk', { x: 860, y: 860, s: 1.05, glow: 0.9, veins: C.goldDeep, cracked: 'gold' });
    return { fx: { spark: { box: [790, 560, 150, 300], n: 18 } }, fxOn: function (p) { return { spark: 0.4 + 0.6 * ramp(p, 0, 0.5) }; } };
  };

  // the end: the book again, a single gold line rising out of it
  S.s18 = function (A) {
    var L0 = A.layer(20), b0 = A.beat(L0, 0);
    book(b0, 800, 520, 170);
    var c = P.cursive(800, 470, 700, { a: 3.4, b: 6, wave: 8 }).map(function (p) { return [p[1] - 470 + 800 + Math.sin((p[0] - 800) * 0.02) * 30, 470 - (p[0] - 800) * 0.6]; });
    var gold = P.el('path', { d: P.poly(c), fill: 'none', stroke: C.gold, 'stroke-width': 2.4, 'stroke-linecap': 'round', pathLength: 1 }, b0);
    prep([gold]);
    return { update: function (p, e) { drawTo([gold], ramp(e, 0.4, 1)); } };
  };

  window.SceneKit = { ease: ease, ramp: ramp, prep: prep, drawTo: drawTo, txt: txt, rect: rect, reflect: reflect, hall: hall, wallWindow: wallWindow,
    archD: archD, archPts: archPts, shelfWall: shelfWall, tree: tree, trunk: trunk, grass: grass, stone: stone, sun: sun, birds: birds, clouds: clouds,
    facade: facade, pebbles: pebbles, crackWeb: crackWeb, bolt: bolt, hand: hand, pedestal: pedestal, book: book };
  window.SCENES = S;
})();
