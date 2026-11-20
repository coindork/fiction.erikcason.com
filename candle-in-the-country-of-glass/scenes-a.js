/* The first ten panels of The Candle in the Country of Glass. */
(function () {
  'use strict';
  var P = window.Pen, C = P.C, S = window.SCENES = window.SCENES || {};

  function ease(t) { t = P.clamp(t, 0, 1); return t * t * (3 - 2 * t); }
  function ramp(p, a, b) { return ease((p - a) / (b - a)); }
  function prep(els) { els.forEach(function (e) { e.style.strokeDasharray = '1 1'; e.style.strokeDashoffset = 1; }); return els; }
  function drawTo(els, t, stagger) {
    els.forEach(function (e, i) { var s = stagger ? i / els.length * stagger : 0; e.style.strokeDashoffset = (1 - P.clamp((t - s) / (1 - s + 1e-4), 0, 1)).toFixed(3); });
  }
  function rect(x0, y0, x1, y1) { return P.poly([[x0, y0], [x1, y0], [x1, y1], [x0, y1]], true); }
  function edge(G, a, b, w, o) { o = o || {}; return P.lines(G, [[a, b]], w, { c: o.c, op: o.op, bow: o.bow == null ? 1.1 : o.bow, j: o.j == null ? 0.35 : o.j }); }
  function boxInk(G, x0, y0, x1, y1, o) {
    o = o || {}; var c = o.c || C.ink, w = o.w || 2, op = o.op == null ? 1 : o.op;
    edge(G, [x0, y0], [x1, y0], w, { c: c, op: op, bow: 0 }); edge(G, [x1, y0], [x1, y1], w, { c: c, op: op, bow: 0 });
    edge(G, [x1, y1], [x0, y1], w, { c: c, op: op, bow: 0 }); edge(G, [x0, y1], [x0, y0], w, { c: c, op: op, bow: 0 });
  }
  function glowCircle(G, cx, cy, r, op) { return P.el('circle', { cx: cx, cy: cy, r: r, fill: 'url(#goldGlow)', opacity: op == null ? 0.7 : op }, G); }
  function solid(G, pts, o) {
    o = o || {}; var d = P.closedD(pts, 4), b = bounds(pts), fill = o.fill || '#51463a';
    P.wash(G, d, fill, o.op == null ? 0.84 : o.op, { plain: true });
    if (!o.bleach) P.hatch(G, b, { angle: o.angle || 72, gap: o.gap || 5, w: 0.75, op: o.hatchOp == null ? 0.55 : o.hatchOp, c: o.hatch || C.ink, clip: P.clip(d) });
    P.line(G, pts.concat([pts[0]]), o.w || 1.8, { c: o.c || C.ink, op: o.lineOp == null ? 0.92 : o.lineOp, bow: 0.5 });
    return d;
  }
  function bounds(pts) {
    var xs = pts.map(function (p) { return p[0]; }), ys = pts.map(function (p) { return p[1]; });
    return [Math.min.apply(Math, xs), Math.min.apply(Math, ys), Math.max.apply(Math, xs) - Math.min.apply(Math, xs), Math.max.apply(Math, ys) - Math.min.apply(Math, ys)];
  }

  var K = window.CandleKit = {};

  K.lightRound = function (G, cx, cy, r, o) {
    o = o || {}; var el = glowCircle(G, cx, cy, r, o.op == null ? 0.68 : o.op);
    var core = P.el('ellipse', { cx: cx, cy: cy + r * 0.08, rx: r * 0.68, ry: r * 0.38, fill: C.goldPale, opacity: o.core == null ? 0.12 : o.core }, G);
    return { el: el, core: core, set: function (x, y, scale, opacity) {
      el.setAttribute('cx', x); el.setAttribute('cy', y); el.setAttribute('r', r * scale);
      core.setAttribute('cx', x); core.setAttribute('cy', y + r * scale * 0.08); core.setAttribute('rx', r * scale * 0.68); core.setAttribute('ry', r * scale * 0.38);
      if (opacity != null) { el.setAttribute('opacity', opacity); core.setAttribute('opacity', opacity * 0.18); }
    } };
  };

  K.candle = function (G, x, base, h, flame, o) {
    o = o || {}; flame = flame == null ? 1 : flame;
    var g = P.g(G, { transform: 'translate(' + x + ' ' + base + ')' }), bodyG = P.g(g), flameG = P.g(g);
    var body = [[-20, 0], [-17, -h + 13], [-11, -h], [11, -h + 3], [18, -h + 15], [20, 0]];
    var bodyD = P.closedD(body, 4), glow = glowCircle(g, 0, -h * 0.92, o.glow || 116, o.glowOp == null ? 0.2 : o.glowOp);
    P.wash(g, P.closedD(P.blobPts(0, 7, 38, 10, 0.08, 12)), '#9c8f7b', 0.42, { plain: true }); P.ellipseLine(g, 0, 7, 36, 10, 1.6, { c: o.ink || C.ink });
    P.wash(bodyG, bodyD, o.body || '#e7d8bd', 0.94, { plain: true });
    P.hatch(bodyG, [-20, -h, 40, h], { angle: 78, gap: 4.5, w: 0.7, op: 0.52, clip: P.clip(bodyD) });
    edge(bodyG, [-20, 0], [-17, -h + 13], 1.8, { c: o.ink || C.ink, bow: 0 }); edge(bodyG, [20, 0], [18, -h + 15], 1.8, { c: o.ink || C.ink, bow: 0 }); edge(bodyG, [-11, -h], [11, -h + 3], 1.6, { c: o.ink || C.ink, bow: 0 });
    edge(g, [0, -h + 2], [0, -h - 20], 2.1, { c: o.ink || C.ink, bow: 0 });
    var flameD = P.closedD([[-14, 0], [-11, -22], [-3, -53], [7, -73], [16, -36], [12, -9], [5, 0]], 4);
    P.wash(flameG, flameD, C.gold, 0.96, { plain: true }); P.line(flameG, [[-11, 0], [-2, -50], [12, -9]], 1.5, { c: C.goldDeep, bow: 0.5 });
    P.wash(flameG, P.closedD([[-5, -4], [-3, -24], [2, -43], [7, -21], [5, -5]], 4), C.goldPale, 0.9, { plain: true });
    if (o.noFlame) { flameG.setAttribute('opacity', 0); glow.setAttribute('opacity', 0); }
    function setFlame(q, lean, op) { q = q == null ? 1 : q; lean = lean || 0; flameG.setAttribute('transform', 'translate(' + lean.toFixed(1) + ' ' + (-h * q).toFixed(1) + ') scale(' + (flame * q).toFixed(3) + ' ' + (flame * q).toFixed(3) + ')'); if (op != null) flameG.setAttribute('opacity', op); }
    return { group: g, body: bodyG, flame: flameG, glow: glow, height: h, base: base,
      setHeight: function (q) { q = P.clamp(q, 0.12, 1); bodyG.setAttribute('transform', 'scale(1 ' + q.toFixed(3) + ')'); setFlame(q, 0); glow.setAttribute('cy', (-h * q * 0.92).toFixed(1)); },
      setFlame: setFlame, setPosition: function (px, py) { g.setAttribute('transform', 'translate(' + px.toFixed(1) + ' ' + (py == null ? base : py).toFixed(1) + ')'); } };
  };

  K.table = function (G, cx, top, w, h, o) {
    o = o || {}; var c = o.c || C.ink, backL = [cx - w / 2, top], backR = [cx + w / 2, top - 8], frontR = [cx + w / 2 - 34, top + 42], frontL = [cx - w / 2 + 24, top + 44];
    var topD = P.poly([backL, backR, frontR, frontL], true); P.wash(G, topD, o.fill || '#665846', o.op == null ? 0.8 : o.op, { plain: true });
    P.hatch(G, [cx - w / 2, top - 4, w, 52], { angle: 14, gap: 5, w: 0.75, op: 0.48, clip: P.clip(topD) });
    edge(G, backL, backR, 2.5, { c: c, bow: 0 }); edge(G, backR, frontR, 2.3, { c: c, bow: 0 }); edge(G, frontR, frontL, 2.7, { c: c, bow: 0 }); edge(G, frontL, backL, 2.3, { c: c, bow: 0 });
    [0.24, 0.5, 0.76].forEach(function (u) { edge(G, P.lp(backL, backR, u), P.lp(frontL, frontR, u), 1, { c: c, op: 0.56, bow: 0 }); });
    var apron = P.poly([[frontL[0], frontL[1]], [frontR[0], frontR[1]], [frontR[0] - 2, top + 68], [frontL[0] + 2, top + 70]], true);
    P.wash(G, apron, o.apron || '#4a4035', 0.9, { plain: true }); boxInk(G, frontL[0] + 2, top + 43, frontR[0] - 2, top + 68, { c: c, w: 1.7, op: 0.82 });
    var legs = [[cx - w * 0.36, top + 62, cx - w * 0.28, top + h], [cx + w * 0.28, top + 62, cx + w * 0.36, top + h], [cx + w * 0.08, top + 62, cx + w * 0.14, top + h * 0.86]];
    legs.forEach(function (q) { var d = P.poly([[q[0], q[1]], [q[0] + 16, q[1]], [q[2] + 8, q[3]], [q[0] - 6, q[3]]], true); P.wash(G, d, '#443a31', 0.9, { plain: true }); edge(G, [q[0], q[1]], [q[0] - 6, q[3]], 2, { c: c, bow: 0 }); edge(G, [q[0] + 16, q[1]], [q[2] + 8, q[3]], 2, { c: c, bow: 0 }); });
    edge(G, [cx - w * 0.29, top + h * 0.68], [cx + w * 0.31, top + h * 0.68], 2.8, { c: c, bow: 1 });
    return { top: top, left: cx - w / 2, right: cx + w / 2, front: top + 44,
      backL: backL, backR: backR, frontL: frontL, frontR: frontR,
      surfaceAt: function (u, v) {
        u = P.clamp(u, 0, 1); v = P.clamp(v, 0, 1);
        return P.lp(P.lp(backL, backR, u), P.lp(frontL, frontR, u), v);
      } };
  };

  K.ledger = function (G, cx, top, w, o) {
    o = o || {}; var c = o.c || C.ink, L = [[cx, top + 8], [cx - w, top - 18], [cx - w - 18, top + 105], [cx, top + 132]], R = [[cx, top + 8], [cx + w, top - 10], [cx + w + 16, top + 102], [cx, top + 132]];
    P.wash(G, P.poly([[cx - w - 12, top - 8], [cx, top - 1], [cx + w + 12, top - 2], [cx + w + 5, top + 145], [cx, top + 151], [cx - w - 8, top + 143]], true), '#443a30', 0.92, { plain: true });
    [L, R].forEach(function (pg) { P.wash(G, P.poly(pg, true), '#f7ecd7', 0.98, { plain: true }); for (var j = 0; j < pg.length; j++) edge(G, pg[j], pg[(j + 1) % pg.length], 1.7, { c: c, bow: 0.7 }); });
    edge(G, [cx, top + 8], [cx, top + 132], 2.1, { c: c, bow: 0 });
    [0.25, 0.5, 0.75].forEach(function (u) { edge(G, P.lp(L[1], L[2], u), P.lp(L[0], L[3], u), 0.9, { c: c, op: 0.35, bow: 0 }); edge(G, P.lp(R[1], R[2], u), P.lp(R[0], R[3], u), 0.9, { c: c, op: 0.35, bow: 0 }); });
    var ink = [], i;
    for (i = 0; i < 6; i++) {
      var y = top + 18 + i * 16, left = cx - w + 18 + i * 2, right = cx + w - 22 - i * 2;
      var lp = P.cursive(left, y, Math.max(42, w * 0.72), { a: 2.6, b: 4.1, wave: 1.5 });
      var rp = P.cursive(cx + 18, y + 2, Math.max(42, w * 0.72), { a: 2.6, b: 4.1, wave: 1.2 });
      lp = lp.map(function (p) { return [p[0], p[1] + (p[0] - left) * 0.05]; }); rp = rp.map(function (p) { return [p[0], p[1] + (p[0] - cx) * -0.035]; });
      if (lp[lp.length - 1][0] > cx - 8) lp = lp.slice(0, Math.floor(lp.length * 0.8));
      if (rp[rp.length - 1][0] > right) rp = rp.slice(0, Math.floor(rp.length * 0.8));
      ink.push(P.el('path', { d: P.poly(lp), fill: 'none', stroke: c, 'stroke-width': 1.15, opacity: 0.7, pathLength: 1 }, G));
      ink.push(P.el('path', { d: P.poly(rp), fill: 'none', stroke: c, 'stroke-width': 1.15, opacity: 0.7, pathLength: 1 }, G));
    }
    return { L: L, R: R, ink: ink, top: top, bottom: top + 132, stone: function (x, y) {
      var pts = P.blobPts(x, y, 28, 18, 0.1, 12), d = P.closedD(pts); P.wash(G, d, '#777064', 0.92, { plain: true }); P.hatch(G, [x - 28, y - 18, 56, 36], { angle: -30, gap: 4, w: 0.7, op: 0.7, clip: P.clip(d) }); P.ink(G, pts.slice(0, 7), 1.9, { c: c }); return d;
    } };
  };

  function shutterPlank(G, x, y, w, h, o) {
    o = o || {}; var c = o.c || C.ink, d = rect(x, y, x + w, y + h); P.wash(G, d, o.fill || '#625748', 0.9, { plain: true });
    boxInk(G, x, y, x + w, y + h, { c: c, w: 1.8, op: 0.92 });
    for (var i = 1; i < 4; i++) edge(G, [x + w * i / 4, y + 5], [x + w * i / 4, y + h - 5], 0.9, { c: c, op: 0.55, bow: 0 });
    [0.28, 0.72].forEach(function (u) { edge(G, [x - 3, y + h * u], [x + w + 3, y + h * u], 2.6, { c: c, op: 0.8, bow: 0 }); });
    return G;
  }
  K.shutterWall = function (G, x, top, bottom, o) {
    o = o || {}; var c = o.c || C.nightink, wall = P.g(G), winX = x - 115, winY = top + 120, winW = 220, winH = 260;
    P.wash(wall, rect(x - 80, top, 1580, bottom), o.fill || '#25231e', o.op == null ? 0.5 : o.op, { plain: true });
    for (var r = 0; r < 3; r++) { edge(wall, [x - 70, top + 120 + r * 125], [1580, top + 120 + r * 125], 1.1, { c: c, op: 0.16, bow: 0 }); edge(wall, [x + 110 + (r % 2) * 190, top + 90], [x + 100 + (r % 2) * 190, bottom], 0.9, { c: c, op: 0.13, bow: 0 }); }
    var reveal = rect(winX - 22, winY - 22, winX + winW + 22, winY + winH + 22); P.wash(wall, reveal, '#4b4339', 0.8, { plain: true }); boxInk(wall, winX - 22, winY - 22, winX + winW + 22, winY + winH + 22, { c: c, w: 2.2, op: 0.82 });
    P.wash(wall, rect(winX, winY, winX + winW, winY + winH), o.window || '#080908', 0.96, { plain: true });
    var shA = P.g(wall), shB = P.g(wall); shutterPlank(shA, winX - 94, winY + 3, 96, winH - 6, { c: c, fill: o.shutter }); shutterPlank(shB, winX + winW - 2, winY + 3, 96, winH - 6, { c: c, fill: o.shutter });
    var gap = edge(wall, [winX + winW / 2, winY + 18], [winX + winW / 2, winY + winH - 18], 2.2, { c: o.gap || C.goldPale, op: 0.48, bow: 0 }); edge(wall, [winX + 26, winY + 36], [winX + winW - 26, winY + 36], 1, { c: c, op: 0.45, bow: 0 });
    P.el('circle', { cx: winX + winW / 2, cy: winY + winH * 0.57, r: 6, fill: '#79684e', opacity: 0.9 }, wall); edge(wall, [winX + winW / 2 - 18, winY + winH * 0.57], [winX + winW / 2 + 18, winY + winH * 0.57], 1.5, { c: c, op: 0.85, bow: 0 });
    return { wall: wall, shA: shA, shB: shB, gap: gap, win: [winX, winY, winW, winH], setClosed: function (t) { t = P.clamp(t, 0, 1); shA.setAttribute('transform', 'translate(' + (94 * t).toFixed(1) + ' 0)'); shB.setAttribute('transform', 'translate(' + (-94 * t).toFixed(1) + ' 0)'); gap.setAttribute('opacity', (0.48 * (1 - t)).toFixed(3)); } };
  };

  K.stoneHouse = function (G, cx, base, w, h, o) {
    o = o || {}; var c = o.c || C.ink, left = cx - w / 2, right = cx + w / 2, top = base - h, body = rect(left, top + 82, right, base);
    P.wash(G, body, o.fill || '#807567', o.op == null ? 0.72 : o.op, { plain: true }); P.hatch(G, [left, top + 82, w, h - 82], { angle: -28, gap: 8, w: 0.8, op: 0.58, clip: P.clip(body) });
    edge(G, [left, base], [left, top + 82], 2.8, { c: c, bow: 0 }); edge(G, [right, base], [right, top + 82], 2.8, { c: c, bow: 0 });
    for (var row = 0; row < 4; row++) { var yy = top + 145 + row * 74; edge(G, [left + 5, yy], [right - 5, yy], 1.1, { c: c, op: 0.42, bow: 0 }); var off = row % 2 ? 72 : 0; for (var xx = left + 40 + off; xx < right - 15; xx += 145) edge(G, [xx, yy - 70], [xx + 3, yy], 0.8, { c: c, op: 0.28, bow: 0 }); }
    var roof = [[left - 34, top + 84], [cx, top], [right + 34, top + 84]]; P.wash(G, P.poly(roof, true), '#4f463c', 0.86, { plain: true }); P.hatch(G, [left - 30, top + 10, w + 60, 78], { angle: 68, gap: 7, w: 0.8, op: 0.58, clip: P.clip(P.poly(roof, true)) }); edge(G, roof[0], roof[1], 3, { c: c, bow: 0 }); edge(G, roof[1], roof[2], 3, { c: c, bow: 0 });
    var chimney = rect(cx + w * 0.2, top - 72, cx + w * 0.2 + 48, top + 20); P.wash(G, chimney, '#5a5044', 0.9, { plain: true }); boxInk(G, cx + w * 0.2, top - 72, cx + w * 0.2 + 48, top + 20, { c: c, w: 1.8 }); edge(G, [cx + w * 0.2 - 7, top - 72], [cx + w * 0.2 + 55, top - 72], 2, { c: c, bow: 0 });
    var wx = cx - 92, wy = top + 168, ww = 184, wh = 142; P.wash(G, rect(wx, wy, wx + ww, wy + wh), '#202629', 0.9, { plain: true }); boxInk(G, wx, wy, wx + ww, wy + wh, { c: c, w: 2.2 }); edge(G, [cx, wy], [cx, wy + wh], 1.2, { c: c, op: 0.7, bow: 0 }); edge(G, [wx, wy + wh / 2], [wx + ww, wy + wh / 2], 1.2, { c: c, op: 0.7, bow: 0 });
    var a = P.g(G), b = P.g(G); shutterPlank(a, wx - 52, wy + 2, 52, wh - 4, { c: c, fill: '#615647' }); shutterPlank(b, wx + ww, wy + 2, 52, wh - 4, { c: c, fill: '#615647' });
    var doorX = cx + 118, doorY = base - 210; P.wash(G, rect(doorX, doorY, doorX + 96, base), '#40372f', 0.94, { plain: true }); boxInk(G, doorX, doorY, doorX + 96, base, { c: c, w: 2.2 }); [0.2, 0.42, 0.64, 0.84].forEach(function (u) { edge(G, [doorX + 6, doorY + (base - doorY) * u], [doorX + 90, doorY + (base - doorY) * u], 0.9, { c: c, op: 0.55, bow: 0 }); });
    var cellar = rect(cx - 165, base - 34, cx - 2, base + 3); P.wash(G, cellar, '#292520', 0.96, { plain: true }); boxInk(G, cx - 165, base - 34, cx - 2, base + 3, { c: c, w: 1.8 }); edge(G, [cx - 83, base - 33], [cx - 83, base - 1], 1.1, { c: c, op: 0.7, bow: 0 });
    return { body: body, win: [wx, wy, ww, wh], shA: a, shB: b, setShutters: function (t) { t = P.clamp(t, 0, 1); a.setAttribute('transform', 'translate(' + (52 * t).toFixed(1) + ' 0)'); b.setAttribute('transform', 'translate(' + (-52 * t).toFixed(1) + ' 0)'); } };
  };

  K.glassCountry = function (G, o) {
    o = o || {}; var y = o.y || 690, frontX = o.frontX || 460, c = o.c || C.glass, ground = P.g(G);
    P.wash(ground, P.closedD(P.blobPts(920, y + 45, 840, 96, 0.12, 14), 4), C.glassWash, 0.25);
    [0, 28, 62].forEach(function (dy, i) { edge(ground, [0, y + dy], [1600, y + dy - 8], 1.4, { c: c, op: 0.55 - i * 0.08, bow: 2 }); });
    var fronts = [];
    for (var i = 0; i < 6; i++) {
      var x = 520 + i * 166, h = 124 + (i % 3) * 38, f = P.g(G), house = [[x - 64, y], [x - 62, y - h + 30], [x, y - h], [x + 62, y - h + 30], [x + 64, y]];
      P.wash(f, P.poly(house, true), C.glassWash, 0.22); for (var j = 0; j < house.length; j++) edge(f, house[j], house[(j + 1) % house.length], 1.05, { c: c, op: 0.75, bow: 0 });
      edge(f, [x - 30, y - h + 24], [x - 30, y - 8], 0.85, { c: c, op: 0.68, bow: 0 }); edge(f, [x + 26, y - h + 22], [x + 26, y - 8], 0.85, { c: c, op: 0.68, bow: 0 }); edge(f, [x - 47, y - h + 44], [x + 40, y - 38], 1.1, { c: '#e8f5f6', op: 0.65, bow: 1 }); fronts.push(f);
    }
    var flow = P.g(G), sheet = [[frontX - 15, y - 112], [frontX + 95, y - 94], [frontX + 220, y - 25], [frontX + 244, y + 28], [frontX + 166, y + 66], [frontX + 44, y + 51], [frontX - 18, y + 5]];
    P.wash(flow, P.poly(sheet, true), C.glassWash, 0.36); for (i = 0; i < sheet.length; i++) edge(flow, sheet[i], sheet[(i + 1) % sheet.length], 1.7, { c: c, op: 0.86, bow: 5 });
    [0, 1, 2].forEach(function (n) { var yy = y - 68 + n * 33; P.line(flow, [[frontX - 6, yy], [frontX + 90, yy + 13], [frontX + 204, yy + 33]], 1.5, { c: c, op: 0.8, bow: 5 }); });
    return { ground: ground, flow: flow, fronts: fronts, setFront: function (p) { flow.setAttribute('transform', 'translate(' + (p * 620).toFixed(1) + ' 0)'); } };
  };

  K.whiteLamp = function (G, x, base, h, o) {
    o = o || {}; var c = o.c || C.slate, top = base - h, tower = P.g(G); P.wash(tower, rect(x - 54, top + 58, x + 54, base), '#dfe7e6', 0.38, { plain: true });
    boxInk(tower, x - 54, top + 58, x + 54, base, { c: c, w: 2, op: 0.62 }); edge(tower, [x - 70, base], [x + 70, base], 2, { c: c, op: 0.65, bow: 0 });
    var lamp = P.el('circle', { cx: x, cy: top + 28, r: 28, fill: '#fffdf3', opacity: 0.86 }, tower); P.ellipseLine(tower, x, top + 28, 31, 31, 1.5, { c: c, op: 0.55 });
    var rays = P.g(G), segs = []; for (var i = 0; i < 24; i++) { var a = i / 24 * Math.PI * 2, r0 = 47, r1 = 300 + (i % 3) * 58; segs.push([[x + Math.cos(a) * r0, top + 28 + Math.sin(a) * r0], [x + Math.cos(a) * r1, top + 28 + Math.sin(a) * r1]]); }
    P.lines(rays, segs, 2, { c: o.ray || '#dfe8e6', op: 0.42, bow: 0 });
    return { tower: tower, rays: rays, lamp: lamp, setLength: function (t) { rays.setAttribute('transform', 'translate(' + x + ' ' + (top + 28) + ') scale(' + (0.55 + 0.7 * t).toFixed(3) + ') translate(' + (-x) + ' ' + (-(top + 28)) + ')'); } };
  };

  K.solidWoman = function (G, name, x, y, s, o) {
    o = o || {}; var g = P.g(G, { transform: 'translate(' + x + ' ' + y + ') scale(' + s + ')' }), ink = o.ink || (name === 'stand' ? C.ink : C.nightink), fill = o.fill || '#3d342d', faceC = o.face || '#796b59';
    if (name === 'stand') {
      var body = [[-58, -276], [-93, -225], [-82, -40], [-30, -28], [30, -28], [84, -42], [92, -228], [54, -276]]; solid(g, body, { fill: fill, c: ink, hatch: '#151311', hatchOp: 0.65 });
      solid(g, P.blobPts(0, -315, 31, 38, 0.04, 14), { fill: faceC, c: ink, hatch: '#352b24', hatchOp: 0.35 }); edge(g, [48, -338], [70, -276], 2.4, { c: C.gold, op: 0.5, bow: 1 }); edge(g, [-36, -300], [-54, -84], 1.2, { c: ink, op: 0.7, bow: 1 });
      return { group: g };
    }
    P.wash(g, rect(-72, -4, 82, 12), '#4a3d31', 0.85, { plain: true }); boxInk(g, -72, -4, 82, 12, { c: ink, w: 1.6 }); edge(g, [-50, 8], [-58, 26], 2, { c: ink, bow: 0 }); edge(g, [58, 8], [67, 26], 2, { c: ink, bow: 0 });
    var shawl = [[-20, -302], [-86, -278], [-126, -202], [-145, -52], [-78, -31], [15, -39], [110, -52], [87, -207], [48, -278]];
    solid(g, shawl, { fill: fill, c: ink, hatch: '#161311', hatchOp: 0.7, gap: 4.5, w: 2.5 }); P.hatch(g, [-130, -260, 80, 220], { angle: 72, gap: 5, w: 0.9, op: 0.62, c: '#12100f', clip: P.clip(P.closedD(shawl, 4)) });
    var hair = P.blobPts(-22, -355, 42, 47, 0.12, 14); solid(g, hair, { fill: '#211d19', c: ink, hatch: '#0a0908', hatchOp: 0.8, w: 2 }); P.wash(g, P.closedD(P.blobPts(27, -382, 17, 18, 0.1, 10)), '#211d19', 0.98, { plain: true });
    var head = P.blobPts(0, -354, 31, 38, 0.04, 14, -0.12); solid(g, head, { fill: faceC, c: ink, hatch: '#4c3d31', hatchOp: 0.32, w: 1.9 }); edge(g, [22, -361], [31, -351], 1.5, { c: ink, bow: 0 }); edge(g, [16, -341], [29, -338], 1.2, { c: ink, bow: 0 }); edge(g, [42, -383], [72, -238], 2.2, { c: C.gold, op: 0.62, bow: 1 });
    var arms = [[[-72, -274], [-47, -226], [-24, -204]], [[38, -274], [63, -231], [91, -204]]];
    arms.forEach(function (arm, i) { solid(g, P.capsule(arm, 27, 20), { fill: '#4a3b30', c: ink, hatch: '#171311', hatchOp: 0.65, w: 1.7 }); var hand = P.blobPts(arm[2][0], arm[2][1], 16, 9, 0.05, 10); solid(g, hand, { fill: faceC, c: ink, hatch: '#4d3c2f', hatchOp: 0.25, w: 1.2 }); if (i === 1) edge(g, [arm[2][0] + 7, arm[2][1] - 4], [arm[2][0] + 58, arm[2][1] - 22], 2, { c: ink, bow: 0 }); });
    edge(g, [72, -276], [103, -202], 1.8, { c: C.gold, op: 0.55, bow: 1 });
    return { group: g, face: head };
  };

  K.hand = function (G, x, y, dir, s, o) {
    o = o || {}; dir = dir < 0 ? -1 : 1; s = s || 1;
    var c = o.c || C.nightink, fill = o.fill || '#725d4b', H = P.g(G, { transform: 'translate(' + x + ' ' + y + ') scale(' + s + ')' });
    var op = o.op == null ? 0.9 : o.op, sleeveOp = o.sleeveOp == null ? op : o.sleeveOp;
    function mirror(pts) { return pts.map(function (pt) { return [pt[0] * dir, pt[1]]; }); }
    function part(pts, opts) { opts = opts || {}; return solid(H, mirror(pts), { fill: opts.fill || fill, c: opts.c || c, op: opts.op == null ? op : opts.op,
      lineOp: opts.lineOp == null ? op : opts.lineOp, hatch: opts.hatch || '#2a211b', hatchOp: opts.hatchOp == null ? 0.28 : opts.hatchOp,
      bleach: !!opts.bleach, w: opts.w || 1.35 }); }
    var sleeve = mirror([[-12, 20], [-18, 84], [-31, 140], [21, 150], [30, 91], [18, 22]]);
    P.wash(H, P.closedD(sleeve, 3), o.sleeve || '#40352d', sleeveOp, { plain: true });
    P.line(H, sleeve.concat([sleeve[0]]), 1.8, { c: c, op: op, bow: 0 });
    var cuff = mirror([[-25, 102], [25, 108]]); P.line(H, cuff, 1.2, { c: c, op: op, bow: 0 });
    var palm = part([[0, 0], [25, -13], [62, -11], [80, 4], [70, 22], [18, 26]]);
    for (var i = 0; i < 4; i++) part(P.capsule([[43, -10 + i * 6], [77 + i * 2, -11 + i * 5]], 12, 5), { w: 1.1 });
    part(P.capsule([[18, 14], [34, 31], [54, 27]], 15, 6), { w: 1.1 });
    P.lines(H, [mirror([[39, -4], [44, 4]]), mirror([[47, 1], [52, 9]]), mirror([[55, 6], [60, 14]])], 0.9, { c: c, op: op * 0.85, bow: 0 });
    return H;
  };

  function room(G, o) {
    o = o || {}; var c = o.c || C.nightink, wall = o.wall || C.night, floor = o.floor || '#201c17';
    P.el('rect', { x: 0, y: 0, width: 1600, height: 1000, fill: wall }, G); P.wash(G, rect(0, 585, 1600, 1000), floor, 0.8, { plain: true });
    [180, 305, 430, 555].forEach(function (yy, r) { edge(G, [90, yy], [1510, yy], 1.1, { c: c, op: 0.16, bow: 0 }); for (var xx = 130 + (r % 2) * 95; xx < 1500; xx += 220) edge(G, [xx, yy - 120], [xx + 4, yy], 0.8, { c: c, op: 0.13, bow: 0 }); });
    edge(G, [60, 585], [1540, 585], 2, { c: c, op: 0.42, bow: 1 }); [650, 728, 816, 918].forEach(function (yy) { edge(G, [100, yy], [1500, yy], 1.1, { c: c, op: 0.22, bow: 0 }); });
    [240, 430, 640, 860, 1080, 1290].forEach(function (xx) { edge(G, [760, 585], [xx, 1000], 1.3, { c: c, op: 0.25, bow: 1 }); });
  }
  function draft(G, x, y) { for (var i = 0; i < 4; i++) P.line(G, [[x + 50, y + i * 26], [x + 2, y + 12 + i * 26], [x - 44, y + 7 + i * 26], [x - 100, y + 22 + i * 26]], 1.5, { c: '#b9ad94', op: 0.58, bow: 7 }); }
  function hands(G, x, y, s) { K.hand(G, x - 150 * s, y, 1, s, { fill: '#6d5a48', sleeve: '#3d332b', c: C.nightink }); K.hand(G, x + 150 * s, y, -1, s, { fill: '#6d5a48', sleeve: '#3d332b', c: C.nightink }); }
  function halfHouse(G, x, y, h, p) {
    var w = 128, top = y - h, x0 = x - w / 2, x1 = x + w / 2, split = x0 + w * P.clamp(p, 0, 1), d = rect(x0, top, x1, y);
    var brick = P.g(G, { 'clip-path': P.clip(d) });
    P.wash(brick, rect(x0, top, split, y), '#806d5b', 0.74, { plain: true });
    if (split > x0 + 2) {
      P.hatch(brick, [x0, top, split - x0, h], { angle: -28, gap: 7, w: 0.7, op: 0.55, clip: P.clip(rect(x0, top, split, y)) });
      for (var row = 1; row < 4; row++) edge(brick, [x0 + 3, top + row * h / 4], [split - 2, top + row * h / 4], 0.75, { c: C.ink, op: 0.36, bow: 0 });
      for (var col = x0 + 24; col < split; col += 34) edge(brick, [col, top + 4], [col + 2, y - 3], 0.65, { c: C.ink, op: 0.3, bow: 0 });
    }
    P.wash(brick, rect(split, top, x1, y), C.glassWash, 0.26);
    if (split < x1 - 2) {
      for (var mull = split + 22; mull < x1; mull += 30) edge(brick, [mull, top + 9], [mull, y - 8], 0.85, { c: C.glass, op: 0.72, bow: 0 });
      edge(brick, [split + 7, top + h * 0.52], [x1 - 7, top + h * 0.52], 0.75, { c: C.glass, op: 0.62, bow: 0 });
      edge(brick, [split + 8, top + 15], [x1 - 13, y - 18], 1, { c: '#e8f5f6', op: 0.65, bow: 1 });
    }
    boxInk(G, x0, top, x1, y, { c: C.glass, w: 1.6 });
    edge(G, [split, top], [split, y], 1.2, { c: C.glass, bow: 0 });
    var roofBase = top + 18, roofPeak = top - 58, roof = [[x0 - 18, roofBase], [x, roofPeak], [x1 + 18, roofBase]], roofD = P.poly(roof, true), roofG = P.g(G, { 'clip-path': P.clip(roofD) });
    P.wash(roofG, rect(x0 - 25, roofPeak - 4, split, roofBase + 8), '#5a4d40', 0.86, { plain: true });
    if (split > x0 + 2) P.hatch(roofG, [x0 - 20, roofPeak - 5, Math.max(4, split - x0 + 20), roofBase - roofPeak + 10], { angle: 68, gap: 6, w: 0.75, op: 0.55, clip: P.clip(rect(x0 - 20, roofPeak - 5, Math.max(4, split - x0 + 20), roofBase - roofPeak + 10)) });
    P.wash(roofG, rect(split, roofPeak - 4, x1 + 25, roofBase + 8), C.glassWash, 0.3);
    if (split < x1 - 2) for (var roofMull = Math.max(split + 16, x); roofMull < x1 + 18; roofMull += 30) edge(roofG, [roofMull, roofPeak + 5], [roofMull, roofBase + 3], 0.8, { c: C.glass, op: 0.68, bow: 0 });
    edge(G, roof[0], roof[1], 2, { c: C.glass, bow: 0 }); edge(G, roof[1], roof[2], 2, { c: C.glass, bow: 0 }); edge(G, roof[0], roof[2], 1.2, { c: C.glass, bow: 0 });
  }

  function windowWoman(G, win, o) {
    o = o || {};
    var x = win[0] + win[2] * 0.52, y = win[1] + win[3] * 0.94, s = o.s || 0.3;
    var W = P.g(G, { 'clip-path': P.clip(rect(win[0], win[1], win[0] + win[2], win[1] + win[3])) });
    var woman = K.solidWoman(W, 'stand', x, y, s, { fill: o.fill || '#453e35', face: o.face || '#9b8d77' });
    var arm = [[x - 24 * s, y - 254 * s], [win[0] + win[2] * 0.34, win[1] + win[3] * 0.58], [win[0] + 18, win[1] + win[3] * 0.48]];
    P.ink(W, arm, 3.2, { c: C.ink, bow: 1 }); P.ellipseLine(W, arm[2][0], arm[2][1], 8, 5, 1.2, { c: C.ink, wob: 0.04 });
    return woman;
  }
  function libraryDoor(G) {
    var x0 = 84, x1 = 360, y0 = 265, y1 = 795, mid = (x0 + x1) / 2, sp = y0 + 112, arch = 'M' + x0 + ' ' + y1 + 'L' + x0 + ' ' + sp + 'Q' + x0 + ' ' + y0 + ' ' + mid + ' ' + (y0 - 22) + 'Q' + x1 + ' ' + y0 + ' ' + x1 + ' ' + sp + 'L' + x1 + ' ' + y1 + 'Z';
    P.wash(G, rect(56, 235, 390, 820), '#77746c', 0.72, { plain: true }); P.wash(G, arch, '#252522', 0.98, { plain: true }); P.hatch(G, [56, 235, 334, 585], { angle: -28, gap: 8, w: 0.8, op: 0.42, clip: P.clip(rect(56, 235, 390, 820)) });
    edge(G, [56, 820], [56, 235], 3, { c: C.ink, bow: 0 }); edge(G, [56, 235], [390, 235], 3, { c: C.ink, bow: 0 }); edge(G, [390, 235], [390, 820], 3, { c: C.ink, bow: 0 }); edge(G, [x0, y1], [x0, sp], 2.2, { c: C.ink, bow: 0 }); edge(G, [x0, sp], [mid, y0 - 22], 2.2, { c: C.ink, bow: 0 }); edge(G, [mid, y0 - 22], [x1, sp], 2.2, { c: C.ink, bow: 0 }); edge(G, [x1, sp], [x1, y1], 2.2, { c: C.ink, bow: 0 });
    for (var row = 0; row < 5; row++) { edge(G, [125, 440 + row * 62], [320, 440 + row * 62], 1, { c: C.nightink, op: 0.34, bow: 0 }); for (var col = 0; col < 4; col++) edge(G, [140 + col * 49, 425 + row * 62], [140 + col * 49, 440 + row * 62], 0.8, { c: C.nightink, op: 0.28, bow: 0 }); }
  }
  function cellarShelf(G, x0, x1, y, depth) {
    depth = depth || 62; var c = C.nightink;
    edge(G, [x0, y], [x1, y], 3, { c: c, op: 0.78, bow: 0 }); edge(G, [x0, y + 156], [x1, y + 156], 3, { c: c, op: 0.72, bow: 0 }); edge(G, [x0, y - depth], [x1, y - depth], 2, { c: c, op: 0.48, bow: 0 });
    edge(G, [x0, y], [x0, y - depth], 2, { c: c, op: 0.55, bow: 0 }); edge(G, [x1, y], [x1, y - depth], 2, { c: c, op: 0.55, bow: 0 });
    for (var i = 0; i < 7; i++) { var x = x0 + 28 + i * (x1 - x0 - 56) / 6; edge(G, [x, y + 156], [x, y - depth], 3, { c: c, op: 0.68, bow: 0 }); edge(G, [x + 10, y + 146], [x + 10, y - depth + 8], 1, { c: c, op: 0.26, bow: 0 }); }
  }
  function cellarObject(G, x, y, kind, o) {
    o = o || {}; var g = P.g(G, { opacity: o.opacity == null ? 1 : o.opacity }); edge(g, [x - 32, y + 5], [x + 35, y + 5], 3, { c: '#070706', op: 0.72, bow: 2 });
    if (kind === 'jar') { var d = rect(x - 25, y - 72, x + 25, y); if (!o.outlineOnly) P.wash(g, d, '#6e6656', 0.88, { plain: true }); boxInk(g, x - 25, y - 72, x + 25, y, { c: C.nightink, w: 1.3 }); P.ellipseLine(g, x, y - 72, 25, 7, 1.1, { c: C.nightink }); P.ellipseLine(g, x, y - 8, 25, 6, 1, { c: C.nightink });
    } else if (kind === 'bundle') { var bd = P.closedD(P.blobPts(x, y - 36, 47, 35, 0.08, 12)); if (!o.outlineOnly) P.wash(g, bd, '#4f493e', 0.9, { plain: true }); P.line(g, P.blobPts(x, y - 36, 47, 35, 0.08, 12), 1.5, { c: C.nightink, op: 0.9, bow: 0 }); P.ink(g, [[x - 39, y - 7], [x + 40, y - 7]], 1.7, { c: C.nightink }); edge(g, [x - 35, y - 60], [x + 34, y - 14], 1.2, { c: C.nightink, bow: 0 });
    } else if (kind === 'letters') { var stack = rect(x - 48, y - 48, x + 42, y); if (!o.outlineOnly) P.wash(g, stack, '#d6c49d', 0.76, { plain: true }); boxInk(g, x - 48, y - 48, x + 42, y, { c: C.nightink, w: 1.2 }); edge(g, [x - 45, y - 34], [x + 37, y - 42], 0.9, { c: C.nightink, op: 0.65, bow: 0 }); edge(g, [x - 42, y - 18], [x + 39, y - 26], 0.9, { c: C.nightink, op: 0.65, bow: 0 });
    } else { var xd = rect(x - 43, y - 62, x + 43, y); if (!o.outlineOnly) P.wash(g, xd, '#38342e', 0.94, { plain: true }); boxInk(g, x - 43, y - 62, x + 43, y, { c: C.nightink, w: 1.2 }); edge(g, [x - 33, y - 45], [x + 30, y - 45], 0.9, { c: C.nightink, op: 0.6, bow: 0 }); }
    if (!o.outlineOnly) { P.wash(g, rect(x - 13, y - 43, x + 13, y - 19), '#d8c79e', 0.8, { plain: true }); boxInk(g, x - 13, y - 43, x + 13, y - 19, { c: C.nightink, w: 0.8 }); }
    return g;
  }

  S.s0 = function (A) {
    var L0 = A.layer(8), L1 = A.layer(30), L2 = A.layer(70); P.wash(L0, rect(0, 0, 1600, 1000), '#d7c9b1', 0.58); K.glassCountry(L0, { y: 770, frontX: 930 });
    var house = K.stoneHouse(L1, 760, 830, 520, 450, { fill: '#817666' }); P.wash(L1, rect(house.win[0] + 18, house.win[1] + 18, house.win[0] + house.win[2] - 18, house.win[1] + house.win[3] - 14), '#20201d', 0.78, { plain: true });
    var c = K.candle(L2, 760, house.win[1] + house.win[3] - 18, 82, 0.55, { glowOp: 0.24 }); K.lightRound(L2, 760, house.win[1] + house.win[3] - 26, 128, { op: 0.2 }); K.whiteLamp(L1, 1390, 710, 370, { ray: '#c6d3d1' });
    return { update: function (p) { c.setFlame(0.84 + 0.1 * Math.sin(p * 12), Math.sin(p * 18) * 1.8); house.setShutters(0.18); } };
  };
  S.s1 = function (A) {
    var L0 = A.layer(10), L1 = A.layer(38), L2 = A.layer(72); P.wash(L0, rect(0, 0, 1600, 1000), '#d9ccb4', 0.36); P.wash(L0, P.closedD(P.blobPts(850, 780, 860, 170, 0.12, 14)), '#d5c199', 0.52); libraryDoor(L1);
    var country = K.glassCountry(L1, { y: 690, frontX: 392 }); [490, 665, 840].forEach(function (x, i) { halfHouse(L2, x, 690, 158 + i * 28, i === 0 ? 0.92 : i === 1 ? 0.52 : 0.16); });
    return { update: function (p) { country.setFront(p); } };
  };
  S.s2 = function (A) {
    var L0 = A.layer(8), L1 = A.layer(35), L2 = A.layer(70), citizens = P.g(L2, { opacity: 0.72 }); P.el('rect', { x: 0, y: 0, width: 1600, height: 1000, fill: C.paper }, L0); edge(L0, [0, 760], [1600, 760], 1.3, { c: '#d7d4c9', op: 0.7, bow: 0 });
    var lamp = K.whiteLamp(L1, 950, 780, 600, { c: '#b9c7c6', ray: '#d5dedc' }); [[390, 820, 0.72], [570, 840, 0.82], [750, 830, 0.68], [1110, 835, 0.75], [1260, 815, 0.64], [1400, 840, 0.75]].forEach(function (q) { P.figure(citizens, 'look', { x: q[0], y: q[1], s: q[2], veinOp: 0.28 }); });
    return { update: function (p) { lamp.setLength(0.35 + 0.65 * p); citizens.setAttribute('opacity', (0.72 - 0.42 * p).toFixed(3)); } };
  };
  S.s3 = function (A) {
    var L0 = A.layer(8), L1 = A.layer(36), L2 = A.layer(70), dusk = P.el('rect', { x: 0, y: 0, width: 1600, height: 1000, fill: '#3d3940', opacity: 0 }, L0); P.wash(L0, rect(0, 0, 1600, 700), '#d5c5a8', 0.34);
    var country = K.glassCountry(L0, { y: 735, frontX: 130 }); country.flow.setAttribute('transform', 'translate(-520 0)'); var house = K.stoneHouse(L1, 980, 840, 560, 420, { fill: '#817667' }); var woman = windowWoman(L2, house.win, { s: 0.3, fill: '#453e35', face: '#9b8d77' });
    return { update: function (p) { country.setFront(0); house.setShutters(p); dusk.setAttribute('opacity', (0.44 * p).toFixed(3)); woman.group.setAttribute('opacity', (1 - 0.1 * p).toFixed(3)); } };
  };
  S.s4 = function (A) {
    var L0 = A.layer(8), L1 = A.layer(34), L2 = A.layer(70), smoke = P.g(L1, { opacity: 0.55 }); room(L0, {}); var wall = K.shutterWall(L0, 1180, 70, 900, { c: C.nightink }); wall.setClosed(1); var table = K.table(L0, 650, 690, 720, 300, {}), candleSpot = table.surfaceAt(0.75, 0.34), bookSpot = table.surfaceAt(0.35, 0.28), bookTop = bookSpot[1] - 142;
    var c = K.candle(L1, candleSpot[0], candleSpot[1], 285, 1, { glowOp: 0 }), round = K.lightRound(L1, candleSpot[0], candleSpot[1] - 115, 255, { op: 0 }), book = K.ledger(L2, bookSpot[0], bookTop, 205, {}); book.stone(bookSpot[0] + 170, bookTop + 4); P.line(smoke, [[candleSpot[0], candleSpot[1] - 285], [candleSpot[0] - 20, candleSpot[1] - 330], [candleSpot[0] + 4, candleSpot[1] - 373], [candleSpot[0] - 12, candleSpot[1] - 415]], 2, { c: C.nightink, op: 0.45, bow: 9 });
    return { update: function (p) { var t = ramp(p, 0.08, 0.7); c.setFlame(ramp(p, 0.18, 0.68), 3 * (1 - t), t); round.set(candleSpot[0], candleSpot[1] - 115, 0.34 + 0.66 * t, 0.8 * t); smoke.setAttribute('opacity', (0.55 * (1 - ramp(p, 0.25, 0.8))).toFixed(3)); } };
  };
  S.s5 = function (A) {
    var L0 = A.layer(8), L1 = A.layer(36), L2 = A.layer(70); room(L0, {}); var table = K.table(L0, 650, 710, 720, 285, {}), round = K.lightRound(L1, 610, 570, 260, { op: 0.64 }), stubs = [], i;
    for (i = 0; i < 14; i++) stubs.push(K.candle(L1, 260 + i * 60, 555 - i * 20, 42 - i * 1.4, 0, { noFlame: true, glowOp: 0.01, body: '#62594b' }));
    var bookSpot = table.surfaceAt(0.37, 0.28), book = K.ledger(L2, bookSpot[0], bookSpot[1] - 142, 280, {}); book.stone(bookSpot[0] + 252, bookSpot[1] - 138); prep(book.ink); var candleSpot = table.surfaceAt(0.82, 0.32), candle = K.candle(L1, candleSpot[0], candleSpot[1], 175, 0.72, { glowOp: 0.04 });
    return { update: function (p) { drawTo(book.ink, ramp(p, 0.08, 0.82), 0.26); stubs.forEach(function (s, j) { s.group.setAttribute('opacity', ramp(p, 0.12 + j * 0.025, 0.32 + j * 0.035).toFixed(3)); }); round.set(bookSpot[0], bookSpot[1] - 115, 0.95, 0.62); candle.setFlame(0.7, Math.sin(p * 9) * 2); } };
  };
  S.s6 = function (A) {
    var L0 = A.layer(8), L1 = A.layer(34), L2 = A.layer(72); room(L0, {}); var wall = K.shutterWall(L0, 1120, 60, 900, { c: C.nightink }); wall.setClosed(0); var table = K.table(L0, 650, 715, 700, 285, {}), sillY = wall.win[1] + wall.win[3] - 4, sill = [[wall.win[0] - 38, sillY], [wall.win[0] + wall.win[2] + 38, sillY - 3], [wall.win[0] + wall.win[2] + 48, sillY + 20], [wall.win[0] - 28, sillY + 23]];
    P.wash(L0, P.poly(sill, true), '#625748', 0.88, { plain: true }); edge(L0, sill[0], sill[1], 2.2, { c: C.nightink, bow: 0 }); edge(L0, sill[1], sill[2], 1.6, { c: C.nightink, bow: 0 }); edge(L0, sill[2], sill[3], 2.2, { c: C.nightink, bow: 0 }); edge(L0, sill[3], sill[0], 1.6, { c: C.nightink, bow: 0 }); draft(L1, 1070, 380);
    var tableSpot = table.surfaceAt(0.63, 0.3), windowSpot = [wall.win[0] + wall.win[2] * 0.55, sillY], c = K.candle(L2, tableSpot[0], tableSpot[1], 250, 1, { glowOp: 0.08 }), round = K.lightRound(L1, tableSpot[0], tableSpot[1] - 115, 230, { op: 0.56 });
    return { update: function (p) { var t = ramp(p, 0.08, 0.9), x = tableSpot[0] + (windowSpot[0] - tableSpot[0]) * t, y = tableSpot[1] + (windowSpot[1] - tableSpot[1]) * t, tremble = 21 * (1 - t); c.setPosition(x, y); c.setFlame(0.9 + 0.07 * (1 - t), tremble * Math.sin(p * 18), 1); round.set(x, y - 115, 0.9, 0.55); wall.gap.setAttribute('opacity', (0.48 * (1 - t)).toFixed(3)); wall.setClosed(t); } };
  };
  S.s7 = function (A) {
    var L0 = A.layer(8), L1 = A.layer(34), L2 = A.layer(70); room(L0, {}); var table = K.table(L0, 700, 770, 760, 290, {}), tableCandle = table.surfaceAt(0.82, 0.34), pages = [P.g(L1), P.g(L1, { opacity: 0 })];
    pages.forEach(function (g, i) { var x = 720, y = 682; P.wash(g, rect(x - 126, y, x + 126, y + 120), '#f7ecd7', 0.94, { plain: true }); boxInk(g, x - 126, y, x + 126, y + 120, { c: C.nightink, w: 1.3 }); P.script(g, x - 102, y + 26, 190, 7, { c: C.goldDeep, op: 0.62 }); if (i) P.script(g, x - 90, y + 33, 166, 6, { c: C.goldDeep, op: 0.56 }); });
    var c = K.candle(L1, tableCandle[0], tableCandle[1], 235, 0.88, { glowOp: 0.08 }), round = K.lightRound(L1, 900, 650, 285, { op: 0.64 }), woman = K.solidWoman(L2, 'sit', 610, 1010, 1.06, { fill: '#40362e', face: '#8e7b63' });
    return { update: function (p) { var t = ramp(p, 0.35, 0.7); pages[0].setAttribute('opacity', (1 - t).toFixed(3)); pages[1].setAttribute('opacity', t.toFixed(3)); round.set(900, 650, 0.92, 0.64); c.setFlame(0.9, Math.sin(p * 16) * 2); woman.group.setAttribute('transform', 'translate(610 1010) scale(1.06)'); } };
  };
  S.s8 = function (A) {
    var L0 = A.layer(8), L1 = A.layer(34), L2 = A.layer(72); P.el('rect', { x: 0, y: 0, width: 1600, height: 1000, fill: '#0e0d0b' }, L0); cellarShelf(L0, 220, 1450, 410, 64); cellarShelf(L0, 220, 1450, 700, 64);
    var objects = [], faint = [], outline = [[275, 410, 'jar'], [360, 410, 'bundle'], [450, 410, 'box'], [540, 410, 'letters'], [635, 410, 'jar'], [730, 410, 'bundle'], [825, 410, 'box'], [920, 410, 'jar'], [1015, 410, 'letters'], [1110, 410, 'bundle'], [1205, 410, 'box'], [1300, 410, 'jar'], [1380, 410, 'bundle'], [1430, 410, 'letters'],
      [275, 700, 'box'], [360, 700, 'jar'], [450, 700, 'bundle'], [540, 700, 'letters'], [635, 700, 'box'], [730, 700, 'jar'], [825, 700, 'bundle'], [920, 700, 'box'], [1015, 700, 'letters'], [1110, 700, 'jar'], [1205, 700, 'bundle'], [1300, 700, 'box'], [1380, 700, 'jar'], [1430, 700, 'letters']];
    outline.forEach(function (q) { faint.push(cellarObject(L0, q[0], q[1], q[2], { opacity: 0.28, outlineOnly: true })); objects.push(cellarObject(L2, q[0], q[1], q[2], { opacity: 0 })); });
    var c = K.candle(L2, 300, 700, 175, 0.72, { glowOp: 0.03 }), round = K.lightRound(L1, 300, 600, 220, { op: 0.68 });
    c.setFlame(0.72, 0, 1);
    return { update: function (p) { var x = 300 + 930 * p; c.setPosition(x, 700); c.setFlame(0.72, 0, 1); round.set(x, 600, 0.92, 0.68); objects.forEach(function (g, i) { var d = Math.abs(outline[i][0] - x); g.setAttribute('opacity', (d < 175 ? 0.96 : 0).toFixed(3)); faint[i].setAttribute('opacity', (d < 175 ? 0.05 : 0.28).toFixed(3)); }); } };
  };
  S.s9 = function (A) {
    var L0 = A.layer(8), L1 = A.layer(36), L2 = A.layer(70); room(L0, {}); var table = K.table(L0, 770, 690, 760, 300, {}), bundleSpot = table.surfaceAt(0.5, 0.3), round = K.lightRound(L1, bundleSpot[0], bundleSpot[1] - 125, 240, { op: 0.66 });
    var bx = bundleSpot[0], by = bundleSpot[1] - 84, bundle = P.g(L2), packet = [[bx - 110, by], [bx + 108, by + 8], [bx + 128, by + 82], [bx - 108, by + 74]]; P.wash(bundle, P.poly(packet, true), '#6e5d4b', 0.94, { plain: true }); P.hatch(bundle, [bx - 112, by - 2, 242, 88], { angle: 22, gap: 5, w: 0.8, op: 0.65, clip: P.clip(P.poly(packet, true)) }); for (var i = 0; i < packet.length; i++) edge(bundle, packet[i], packet[(i + 1) % packet.length], 2, { c: C.nightink, bow: 0.5 });
    edge(bundle, [bx - 95, by + 5], [bx + 110, by + 72], 2, { c: C.nightink, op: 0.85, bow: 1 }); edge(bundle, [bx + 92, by + 5], [bx - 96, by + 72], 2, { c: C.nightink, op: 0.85, bow: 1 }); P.ellipseLine(bundle, bx, by + 40, 13, 10, 2, { c: C.nightink }); P.ink(bundle, [[bx - 9, by + 40], [bx - 23, by + 33], [bx - 31, by + 43]], 2, { c: C.nightink }); P.ink(bundle, [[bx + 9, by + 42], [bx + 23, by + 50], [bx + 31, by + 42]], 2, { c: C.nightink }); hands(L2, bx, by + 98, 1.45); var candleSpot = table.surfaceAt(0.84, 0.27), c = K.candle(L1, candleSpot[0], candleSpot[1], 155, 0.62, { glowOp: 0.04 });
    return { update: function (p) { var pulse = 0.64 + 0.04 * Math.sin(p * 12); round.set(bundleSpot[0], bundleSpot[1] - 125, 0.95 + 0.025 * Math.sin(p * 10), pulse); c.setFlame(0.6 + 0.05 * Math.sin(p * 9), Math.sin(p * 11) * 2); } };
  };
})();
