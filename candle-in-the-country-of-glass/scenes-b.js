/* The last ten panels of The Candle in the Country of Glass. */
(function () {
  'use strict';
  var P = window.Pen, C = P.C, K = window.CandleKit, S = window.SCENES = window.SCENES || {};

  function ease(t) { t = P.clamp(t, 0, 1); return t * t * (3 - 2 * t); }
  function ramp(p, a, b) { return ease((p - a) / (b - a)); }
  function prep(els) { els.forEach(function (e) { e.style.strokeDasharray = '1 1'; e.style.strokeDashoffset = 1; }); return els; }
  function drawTo(els, t, stagger) {
    els.forEach(function (e, i) { var s = stagger ? i / els.length * stagger : 0; e.style.strokeDashoffset = (1 - P.clamp((t - s) / (1 - s + 1e-4), 0, 1)).toFixed(3); });
  }
  function rect(x0, y0, x1, y1) { return P.poly([[x0, y0], [x1, y0], [x1, y1], [x0, y1]], true); }
  function edge(G, a, b, w, o) { o = o || {}; return P.lines(G, [[a, b]], w, { c: o.c, op: o.op, bow: o.bow == null ? 1 : o.bow, j: o.j == null ? 0.35 : o.j }); }
  function box(G, x0, y0, x1, y1, o) {
    o = o || {};
    edge(G, [x0, y0], [x1, y0], o.w || 1.5, o); edge(G, [x1, y0], [x1, y1], o.w || 1.5, o);
    edge(G, [x1, y1], [x0, y1], o.w || 1.5, o); edge(G, [x0, y1], [x0, y0], o.w || 1.5, o);
  }
  function room(G) {
    P.el('rect', { x: 0, y: 0, width: 1600, height: 1000, fill: C.night }, G);
    P.wash(G, rect(0, 585, 1600, 1000), '#201c17', 0.82, { plain: true });
    [170, 300, 430, 555].forEach(function (yy, r) { edge(G, [80, yy], [1520, yy], 1, { c: C.nightink, op: 0.14, bow: 0 }); for (var xx = 120 + (r % 2) * 100; xx < 1500; xx += 220) edge(G, [xx, yy - 120], [xx + 4, yy], 0.75, { c: C.nightink, op: 0.11, bow: 0 }); });
    edge(G, [60, 585], [1540, 585], 1.8, { c: C.nightink, op: 0.38, bow: 1 });
    [650, 728, 816, 918].forEach(function (yy) { edge(G, [100, yy], [1500, yy], 1, { c: C.nightink, op: 0.2, bow: 0 }); });
  }
  function bleachedRoom(G) {
    P.el('rect', { x: 0, y: 0, width: 1600, height: 1000, fill: C.paper }, G);
    P.el('rect', { x: 0, y: 585, width: 1600, height: 415, fill: '#fbf5e9', opacity: 0.5 }, G);
    [160, 290, 420, 550].forEach(function (yy) { edge(G, [80, yy], [1520, yy], 0.9, { c: '#9ea9a5', op: 0.25, bow: 0 }); });
    edge(G, [70, 585], [1530, 585], 1.2, { c: '#899995', op: 0.35, bow: 0 });
    [0.18, 0.36, 0.54, 0.72, 0.9].forEach(function (u) { edge(G, [800, 585], [u * 1600, 1000], 0.8, { c: '#a9b2ad', op: 0.2, bow: 0 }); });
    var rays = []; for (var i = 0; i < 18; i++) { var a = i / 18 * Math.PI * 2, r0 = 60, r1 = 470; rays.push([[1150 + Math.cos(a) * r0, 230 + Math.sin(a) * r0], [1150 + Math.cos(a) * r1, 230 + Math.sin(a) * r1]]); }
    P.lines(G, rays, 1.2, { c: '#d1d9d4', op: 0.38, bow: 0 });
    return rays;
  }
  function flatPage(G, x, y, w, h, o) {
    o = o || {}; var d = rect(x - w / 2, y - h, x + w / 2, y), g = P.g(G);
    P.wash(g, d, o.fill || C.paper, o.op == null ? 0.78 : o.op, { plain: true });
    box(g, x - w / 2, y - h, x + w / 2, y, { c: o.c || C.nightink, w: o.w || 1.2, op: o.lineOp == null ? 0.62 : o.lineOp, bow: 0 });
    return g;
  }
  function outlineTable(G, cx, top, w, h, o) {
    o = o || {}; var c = o.c || '#899590', op = o.op == null ? 0.44 : o.op;
    var backL = [cx - w / 2, top], backR = [cx + w / 2, top - 8], frontR = [cx + w / 2 - 34, top + 42], frontL = [cx - w / 2 + 24, top + 44];
    edge(G, backL, backR, 1.7, { c: c, op: op, bow: 0 }); edge(G, backR, frontR, 1.5, { c: c, op: op, bow: 0 }); edge(G, frontR, frontL, 1.8, { c: c, op: op, bow: 0 }); edge(G, frontL, backL, 1.5, { c: c, op: op, bow: 0 });
    [0.24, 0.5, 0.76].forEach(function (u) { edge(G, P.lp(backL, backR, u), P.lp(frontL, frontR, u), 0.8, { c: c, op: op * 0.72, bow: 0 }); });
    box(G, frontL[0] + 2, top + 43, frontR[0] - 2, top + 68, { c: c, w: 1.15, op: op * 0.9, bow: 0 });
    [[cx - w * 0.36, cx - w * 0.28], [cx + w * 0.28, cx + w * 0.36], [cx + w * 0.08, cx + w * 0.14]].forEach(function (q, i) {
      edge(G, [q[0], top + 62], [q[0] - 6, top + h - (i === 2 ? 28 : 0)], 1.5, { c: c, op: op, bow: 0 });
      edge(G, [q[0] + 16, top + 62], [q[1] + 8, top + h - (i === 2 ? 28 : 0)], 1.5, { c: c, op: op, bow: 0 });
    });
    edge(G, [cx - w * 0.29, top + h * 0.68], [cx + w * 0.31, top + h * 0.68], 1.7, { c: c, op: op, bow: 1 });
    return { backL: backL, backR: backR, frontL: frontL, frontR: frontR, surfaceAt: function (u, v) { return P.lp(P.lp(backL, backR, u), P.lp(frontL, frontR, u), v); } };
  }
  function outlineLedger(G, cx, top, w, o) {
    o = o || {}; var c = o.c || '#899590', op = o.op == null ? 0.44 : o.op;
    var L = [[cx, top + 8], [cx - w, top - 18], [cx - w - 18, top + 105], [cx, top + 132]], R = [[cx, top + 8], [cx + w, top - 10], [cx + w + 16, top + 102], [cx, top + 132]];
    [L, R].forEach(function (pg) { for (var j = 0; j < pg.length; j++) edge(G, pg[j], pg[(j + 1) % pg.length], 1.15, { c: c, op: op, bow: 0 }); });
    edge(G, [cx, top + 8], [cx, top + 132], 1.4, { c: c, op: op, bow: 0 });
    [0.25, 0.5, 0.75].forEach(function (u) { edge(G, P.lp(L[1], L[2], u), P.lp(L[0], L[3], u), 0.65, { c: c, op: op * 0.7, bow: 0 }); edge(G, P.lp(R[1], R[2], u), P.lp(R[0], R[3], u), 0.65, { c: c, op: op * 0.7, bow: 0 }); });
    return { L: L, R: R };
  }
  function outlineWindow(G, x, top, o) {
    o = o || {}; var c = o.c || '#899590', op = o.op == null ? 0.42 : o.op, winX = x - 115, winY = top + 120, winW = 220, winH = 260;
    box(G, winX - 22, winY - 22, winX + winW + 22, winY + winH + 22, { c: c, w: 1.7, op: op, bow: 0 }); box(G, winX, winY, winX + winW, winY + winH, { c: c, w: 1.1, op: op, bow: 0 });
    box(G, winX - 92, winY + 3, winX + 2, winY + winH - 6, { c: c, w: 1.1, op: op, bow: 0 }); box(G, winX + winW - 2, winY + 3, winX + winW + 92, winY + winH - 6, { c: c, w: 1.1, op: op, bow: 0 });
    for (var i = 1; i < 4; i++) { edge(G, [winX - 92 + i * 23, winY + 8], [winX - 92 + i * 23, winY + winH - 8], 0.7, { c: c, op: op * 0.7, bow: 0 }); edge(G, [winX + winW - 2 + i * 23, winY + 8], [winX + winW - 2 + i * 23, winY + winH - 8], 0.7, { c: c, op: op * 0.7, bow: 0 }); }
    edge(G, [winX + winW / 2, winY + 16], [winX + winW / 2, winY + winH - 16], 1.2, { c: c, op: op, bow: 0 });
    edge(G, [winX + 24, winY + 36], [winX + winW - 24, winY + 36], 0.8, { c: c, op: op * 0.75, bow: 0 });
    return { x: winX, y: winY, w: winW, h: winH };
  }
  function outlineShelf(G, x0, x1, y, o) {
    o = o || {}; var c = o.c || '#899590', op = o.op == null ? 0.44 : o.op, depth = o.depth || 54;
    edge(G, [x0, y], [x1, y], 1.7, { c: c, op: op, bow: 0 }); edge(G, [x0, y + 154], [x1, y + 154], 1.7, { c: c, op: op, bow: 0 }); edge(G, [x0, y - depth], [x1, y - depth], 1, { c: c, op: op * 0.8, bow: 0 });
    edge(G, [x0, y], [x0, y - depth], 1.1, { c: c, op: op, bow: 0 }); edge(G, [x1, y], [x1, y - depth], 1.1, { c: c, op: op, bow: 0 });
    for (var i = 0; i < 7; i++) { var x = x0 + 28 + i * (x1 - x0 - 56) / 6; edge(G, [x, y + 154], [x, y - depth], 1.5, { c: c, op: op, bow: 0 }); }
  }
  function outlineCellarObject(G, x, y, kind, o) {
    o = o || {}; var c = o.c || '#899590', op = o.op == null ? 0.44 : o.op;
    if (kind === 'jar') { box(G, x - 24, y - 72, x + 24, y, { c: c, w: 1, op: op, bow: 0 }); P.ellipseLine(G, x, y - 72, 24, 7, 0.9, { c: c, op: op }); P.ellipseLine(G, x, y - 8, 24, 6, 0.8, { c: c, op: op }); }
    else if (kind === 'bundle') { var pts = P.blobPts(x, y - 36, 45, 32, 0.04, 12); P.line(G, pts.concat([pts[0]]), 1.15, { c: c, op: op, bow: 0 }); edge(G, [x - 39, y - 6], [x + 38, y - 6], 1.1, { c: c, op: op, bow: 0 }); edge(G, [x - 34, y - 59], [x + 32, y - 14], 0.9, { c: c, op: op, bow: 0 }); }
    else if (kind === 'letters') { box(G, x - 46, y - 48, x + 42, y, { c: c, w: 1, op: op, bow: 0 }); edge(G, [x - 42, y - 34], [x + 37, y - 42], 0.75, { c: c, op: op, bow: 0 }); edge(G, [x - 39, y - 18], [x + 39, y - 26], 0.75, { c: c, op: op, bow: 0 }); }
    else { box(G, x - 42, y - 62, x + 42, y, { c: c, w: 1, op: op, bow: 0 }); edge(G, [x - 32, y - 45], [x + 30, y - 45], 0.75, { c: c, op: op, bow: 0 }); }
    edge(G, [x - 32, y + 5], [x + 32, y + 5], 1, { c: c, op: op * 0.7, bow: 0 });
  }
  function outlineCandle(G, x, base, h, o) {
    o = o || {}; var c = o.c || '#87938e', op = o.op == null ? 0.45 : o.op, g = P.g(G);
    var body = [[x - 18, base], [x - 15, base - h + 12], [x - 10, base - h], [x + 11, base - h + 3], [x + 17, base - h + 14], [x + 18, base]];
    P.line(g, body.concat([body[0]]), 1.15, { c: c, op: op, bow: 0 }); P.ellipseLine(g, x, base + 7, 34, 9, 1, { c: c, op: op }); edge(g, [x, base - h + 2], [x, base - h - 17], 0.9, { c: c, op: op, bow: 0 });
    var flame = P.el('path', { d: P.poly([[x - 10, base - h - 17], [x - 4, base - h - 42], [x + 5, base - h - 66], [x + 13, base - h - 29], [x + 7, base - h - 14]], true), fill: 'none', stroke: c, 'stroke-width': 1.05, 'stroke-dasharray': '2 5', opacity: op }, g);
    return { group: g, flame: flame };
  }
  function bleachedWoman(G, x, y) {
    var c = '#4f5a57', g = P.g(G), face = [[-95, -125], [-82, -165], [-38, -185], [18, -180], [65, -150], [92, -102], [101, -50], [124, -25], [103, -4], [112, 20], [94, 35], [90, 64], [66, 96], [22, 122], [-34, 116], [-72, 90], [-92, 48], [-100, 0]];
    P.line(g, face.map(function (pt) { return [x + pt[0], y + pt[1]]; }).concat([[x + face[0][0], y + face[0][1]]]), 1.7, { c: c, op: 0.58, bow: 0 });
    P.ellipseLine(g, x - 78, y - 118, 88, 105, 1.2, { c: c, op: 0.42 }); P.ellipseLine(g, x - 112, y - 120, 35, 40, 1.1, { c: c, op: 0.48 });
    edge(g, [x - 52, y - 164], [x - 94, y - 194], 1, { c: c, op: 0.45, bow: 1 }); edge(g, [x - 88, y - 190], [x - 135, y - 172], 1, { c: c, op: 0.42, bow: 1 });
    P.line(g, [[x - 14, y + 114], [x - 18, y + 163], [x + 30, y + 168], [x + 36, y + 116]], 1.4, { c: c, op: 0.5, bow: 0 });
    P.line(g, [[x - 24, y + 154], [x - 112, y + 178], [x - 184, y + 250]], 1.5, { c: c, op: 0.52, bow: 0 }); P.line(g, [[x + 33, y + 156], [x + 118, y + 180], [x + 188, y + 246]], 1.5, { c: c, op: 0.52, bow: 0 }); P.line(g, [[x - 184, y + 250], [x + 188, y + 246]], 1.2, { c: c, op: 0.48, bow: 0 });
    P.line(g, [[x + 4, y - 74], [x + 48, y - 78], [x + 76, y - 69]], 1.5, { c: c, op: 0.62, bow: 1 });
    P.line(g, [[x + 9, y - 52], [x + 48, y - 56]], 1.25, { c: c, op: 0.62, bow: 1 });
    P.line(g, [[x + 91, y - 53], [x + 126, y - 26], [x + 103, y - 3]], 1.3, { c: c, op: 0.62, bow: 0 });
    P.line(g, [[x + 65, y + 30], [x + 91, y + 36], [x + 66, y + 42]], 1.25, { c: c, op: 0.62, bow: 0 }); P.line(g, [[x + 67, y + 42], [x + 91, y + 43]], 0.9, { c: c, op: 0.52, bow: 0 });
    P.ellipseLine(g, x - 89, y - 26, 13, 21, 1.15, { c: c, op: 0.58 });
    var h = P.g(g, { opacity: 0.42 }); P.lines(h, [[[x + 9, y - 61], [x + 25, y - 54]], [[x + 21, y - 64], [x + 37, y - 57]], [[x + 31, y - 66], [x + 47, y - 59]], [[x + 2, y + 81], [x + 19, y + 89]], [[x + 10, y + 88], [x + 27, y + 96]], [[x + 18, y + 95], [x + 35, y + 103]]], 0.75, { c: c, op: 0.42, bow: 0 });
    return { group: g, hatch: h };
  }
  function flameOnly(G, x, y, o) {
    o = o || {}; var g = P.g(G, { transform: 'translate(' + x + ' ' + y + ')' }), glow = P.el('circle', { cx: 0, cy: -14, r: o.r || 105, fill: 'url(#goldGlow)', opacity: o.glow == null ? 0.34 : o.glow }, g);
    var d = P.closedD([[-10, 0], [-8, -12], [-2, -24], [5, -46], [12, -24], [10, -6], [4, 2]], 4);
    var flame = P.wash(g, d, C.gold, 0.96, { plain: true });
    P.line(g, [[-9, 0], [-1, -32], [10, -8]], 1.3, { c: C.goldDeep, bow: 0.5 });
    return { group: g, flame: flame, glow: glow, set: function (lean, scale, op) {
      flame.setAttribute('transform', 'translate(' + (lean || 0).toFixed(1) + ' ' + (-26 * (scale || 1)).toFixed(1) + ') scale(' + (scale || 1).toFixed(3) + ')');
      if (op != null) { flame.setAttribute('opacity', op); glow.setAttribute('opacity', op * 0.34); }
    } };
  }

  /* 10. The shutter opens: dark room, white wedge, one hard flash. */
  S.s10 = function (A) {
    var L0 = A.layer(8), L1 = A.layer(34), L2 = A.layer(76); room(L0);
    var wall = K.shutterWall(L0, 1120, 60, 900, { c: C.nightink }); wall.setClosed(1);
    var table = K.table(L0, 650, 715, 700, 285, {}), spot = table.surfaceAt(0.64, 0.3), c = K.candle(L1, spot[0], spot[1], 170, 0.75, { glowOp: 0.08 });
    var round = K.lightRound(L1, spot[0], spot[1] - 120, 230, { op: 0.5 });
    var wedge = P.el('path', { d: rect(0, 0, 1, 1), fill: '#fffdf3', opacity: 0 }, L2), fired = false;
    return { update: function (p) {
      var t = ramp(p, 0.04, 0.78), gapX = wall.win[0] + wall.win[2] / 2, bottom = wall.win[1] + wall.win[3];
      wall.setClosed(1 - t); wedge.setAttribute('d', P.poly([[gapX - 10 - 18 * t, bottom], [gapX + 10 + 18 * t, bottom], [gapX + 570 * t, 1000], [gapX - 480 * t, 1000]], true)); wedge.setAttribute('opacity', (0.88 * t).toFixed(3));
      round.set(spot[0], spot[1] - 120, 0.95, 0.5 * (1 - t)); c.setFlame(0.74, Math.sin(p * 12) * 2, 1 - t * 0.8);
      if (p > 0.05 && !fired && A.flashEl && !document.documentElement.classList.contains('still')) { fired = true; A.flashEl.classList.remove('on'); void A.flashEl.offsetWidth; A.flashEl.classList.add('on'); }
      if (p < 0.01) fired = false;
    } };
  };

  /* 11. Under the White Lamp: no corner, no shadow, all things equally visible. */
  S.s11 = function (A) {
    var L0 = A.layer(8), L1 = A.layer(32), L2 = A.layer(62), c = '#5d6966'; bleachedRoom(L0);
    var roomLines = P.g(L0, { opacity: 0.8 });
    var win = outlineWindow(roomLines, 1120, 60, { c: c, op: 0.44 }), table = outlineTable(roomLines, 650, 715, 700, 285, { c: c, op: 0.46 }), tableSpot = table.surfaceAt(0.64, 0.3);
    outlineLedger(roomLines, tableSpot[0] - 40, tableSpot[1] - 142, 210, { c: c, op: 0.46 });
    [[360, 520, 190, 110], [875, 430, 220, 128], [1160, 520, 180, 108]].forEach(function (q) { flatPage(roomLines, q[0], q[1] + q[3], q[2], q[3], { c: c, fill: 'none', op: 0, lineOp: 0.42 }); });
    var cellar = P.g(L1, { opacity: 0.75 }); outlineShelf(cellar, 160, 1450, 700, { c: c, op: 0.46 }); outlineShelf(cellar, 160, 1450, 900, { c: c, op: 0.46 });
    var kinds = ['jar', 'bundle', 'box', 'letters'], i, j, x;
    for (j = 0; j < 4; j++) for (i = 0; i < 8; i++) { x = 230 + i * 165; outlineCellarObject(cellar, x, 700, kinds[(i + j) % kinds.length], { c: c, op: 0.46 }); outlineCellarObject(cellar, x + 34, 900, kinds[(i + j + 1) % kinds.length], { c: c, op: 0.46 }); }
    var cg = P.g(L2, { opacity: 0.95 }), candle = outlineCandle(cg, table.surfaceAt(0.79, 0.3)[0], table.surfaceAt(0.79, 0.3)[1], 118, { c: c, op: 0.46 });
    return { update: function (p) { var t = ramp(p, 0.08, 0.75); roomLines.setAttribute('opacity', (0.8 + 0.2 * t).toFixed(3)); cellar.setAttribute('opacity', (0.75 + 0.25 * t).toFixed(3)); cg.setAttribute('opacity', (0.95 - 0.2 * ramp(p, 0.3, 0.9)).toFixed(3)); candle.flame.setAttribute('opacity', (0.46 - 0.34 * ramp(p, 0.35, 0.9)).toFixed(3)); } };
  };

  /* 12. The face without a shadow beneath the brow. */
  S.s12 = function (A) {
    var L0 = A.layer(8), L1 = A.layer(48), c = '#4f5a57'; bleachedRoom(L0);
    var table = outlineTable(L0, 1030, 840, 500, 200, { c: c, op: 0.35 }), pageSpot = table.surfaceAt(0.5, 0.28);
    flatPage(L0, pageSpot[0], pageSpot[1], 450, 250, { c: c, fill: 'none', op: 0, lineOp: 0.42 });
    var woman = bleachedWoman(L1, 1000, 365), hand = K.hand(L1, pageSpot[0] - 106, pageSpot[1] - 10, 1, 0.88, { fill: '#f2eadb', sleeve: '#d9d1c1', c: c, op: 0.52, sleeveOp: 0.42, bleach: true, lineOp: 0.58 });
    var fallenPen = P.line(L1, [[pageSpot[0] + 28, pageSpot[1] - 28], [pageSpot[0] + 106, pageSpot[1] - 4]], 1.6, { c: c, op: 0.58, bow: 0 });
    return { update: function (p) { woman.hatch.setAttribute('opacity', (0.42 * (1 - ramp(p, 0.12, 0.9))).toFixed(3)); hand.setAttribute('opacity', (0.4 + 0.12 * ramp(p, 0.2, 0.8)).toFixed(3)); fallenPen.setAttribute('opacity', (0.5 + 0.1 * ramp(p, 0.2, 0.8)).toFixed(3)); } };
  };

  /* 13. The Candle wedges itself into the east shutter. */
  S.s13 = function (A) {
    var L0 = A.layer(8), L1 = A.layer(36), L2 = A.layer(72); room(L0);
    var wall = K.shutterWall(L0, 1120, 60, 900, { c: C.nightink }); wall.setClosed(1);
    var table = K.table(L0, 650, 715, 700, 285, {}), pageSpot = table.surfaceAt(0.38, 0.3), ledger = K.ledger(L1, pageSpot[0], pageSpot[1] - 142, 220, {}), tableRound = K.lightRound(L1, pageSpot[0], pageSpot[1] - 112, 230, { op: 0.58 });
    var woman = K.solidWoman(L2, 'sit', 610, 1010, 1.06, { fill: '#40362e', face: '#8e7b63' });
    var sillY = wall.win[1] + wall.win[3] - 4, cx = wall.win[0] + wall.win[2] * 0.5, c = K.candle(L2, cx, sillY, 112, 0.72, { glowOp: 0.12 });
    var wax = P.g(L2, { opacity: 0.72 }), waxPath = P.el('path', { d: '', fill: '#e4d3b8', opacity: 0.82 }, wax); P.ellipseLine(wax, 11, 7, 34, 10, 1.3, { c: C.nightink });
    return { update: function (p) {
      var t = ramp(p, 0.12, 0.9), end = -58 + 58 * t, angle = 5 + 7 * t; c.group.setAttribute('transform', 'translate(' + cx + ' ' + sillY + ') rotate(-' + angle.toFixed(1) + ')'); c.setFlame(0.82, -9 * t, 1);
      wax.setAttribute('transform', 'translate(' + cx + ' ' + sillY + ') rotate(-' + angle.toFixed(1) + ')'); waxPath.setAttribute('d', P.poly([[7, -94], [19, -88], [24, end], [6, end + 8]], true)); tableRound.set(pageSpot[0], pageSpot[1] - 112, 0.9, 0.58); woman.group.setAttribute('opacity', (0.8 + 0.2 * t).toFixed(3));
    } };
  };

  /* 14. A stub in its own wax, flame tall and thin. */
  S.s14 = function (A) {
    var L0 = A.layer(8), L1 = A.layer(38), L2 = A.layer(70); room(L0);
    var table = K.table(L0, 650, 715, 700, 285, {}), pageSpot = table.surfaceAt(0.42, 0.3), ledger = K.ledger(L1, pageSpot[0], pageSpot[1] - 142, 225, {}), cSpot = table.surfaceAt(0.72, 0.3), wax = P.g(L1);
    var pool = P.closedD(P.blobPts(cSpot[0], cSpot[1] + 8, 46, 13, 0.1, 12)); P.wash(wax, pool, '#8f7c62', 0.75, { plain: true }); P.ellipseLine(wax, cSpot[0], cSpot[1] + 8, 46, 13, 1.4, { c: C.nightink });
    var c = K.candle(L2, cSpot[0], cSpot[1], 54, 0.68, { glowOp: 0.12 }), round = K.lightRound(L1, cSpot[0], cSpot[1] - 54, 210, { op: 0.56 });
    var hand = K.hand(L2, pageSpot[0] - 210, pageSpot[1] - 35, 1, 0.92, { fill: '#6e5948', sleeve: '#3e342b', c: C.nightink });
    var pen = edge(L2, [pageSpot[0] - 132, pageSpot[1] - 42], [cSpot[0] - 18, cSpot[1] - 32], 2, { c: C.nightink, bow: 0 });
    return { update: function (p) { var t = ramp(p, 0.05, 0.88); c.setFlame(0.8 + 0.16 * t, 0, 1); c.flame.setAttribute('transform', 'translate(0 ' + (-54 * (0.9 + 0.3 * t)).toFixed(1) + ') scale(' + (0.64 - 0.24 * t).toFixed(3) + ' ' + (0.92 + 0.48 * t).toFixed(3) + ')'); round.set(cSpot[0], cSpot[1] - 54 * (1.1 + 0.2 * t), 0.84 + 0.12 * t, 0.56); hand.setAttribute('opacity', (0.58 + 0.42 * t).toFixed(3)); pen.setAttribute('opacity', (0.45 + 0.55 * t).toFixed(3)); } };
  };

  /* 15. The new entry is written under the old ones. */
  S.s15 = function (A) {
    var L0 = A.layer(8), L1 = A.layer(36), L2 = A.layer(70); room(L0);
    var table = K.table(L0, 650, 715, 700, 285, {}), spot = table.surfaceAt(0.45, 0.3), ledger = K.ledger(L1, spot[0], spot[1] - 142, 240, {}), round = K.lightRound(L1, spot[0] + 20, spot[1] - 115, 200, { op: 0.5 }), cSpot = table.surfaceAt(0.78, 0.3), c = K.candle(L1, cSpot[0], cSpot[1], 76, 0.68, { glowOp: 0.08 });
    var newLines = [], i;
    for (i = 0; i < 3; i++) { var pts = P.cursive(spot[0] - 185, spot[1] - 48 + i * 16, 350, { a: 2.8, b: 4, wave: 1.2 }); newLines.push(P.el('path', { d: P.poly(pts), fill: 'none', stroke: C.nightink, 'stroke-width': 1.1, opacity: 0.72, pathLength: 1 }, L2)); }
    prep(newLines);
    return { update: function (p) { drawTo(newLines, ramp(p, 0.08, 0.88), 0.22); round.set(spot[0] + 20, spot[1] - 115, 0.86, 0.5); c.setFlame(0.76, Math.sin(p * 10) * 1.5); } };
  };

  /* 16. The old and new wick share one gold thread. */
  S.s16 = function (A) {
    var L0 = A.layer(8), L1 = A.layer(34), L2 = A.layer(72); room(L0);
    var table = K.table(L0, 650, 715, 700, 285, {}), oldSpot = table.surfaceAt(0.54, 0.28), newSpot = table.surfaceAt(0.82, 0.3);
    var old = K.candle(L1, oldSpot[0], oldSpot[1], 68, 0.66, { glowOp: 0.1 }), fresh = K.candle(L1, newSpot[0], newSpot[1], 170, 0.7, { glowOp: 0.08, noFlame: true });
    var oldFlame = old.flame, newFlame = fresh.flame; newFlame.setAttribute('opacity', 0);
    var threadPts = [[oldSpot[0], oldSpot[1] - 68], [oldSpot[0] + 55, oldSpot[1] - 116], [newSpot[0] - 36, newSpot[1] - 150], [newSpot[0], newSpot[1] - 170]], thread = P.el('path', { d: P.poly(threadPts), fill: 'none', stroke: C.gold, 'stroke-width': 2.8, 'stroke-linecap': 'round', pathLength: 1 }, L2); prep([thread]);
    var startX = oldSpot[0] + 92, startY = oldSpot[1] + 8, hand = K.hand(L2, startX - 82, startY - 118, 1, 0.84, { fill: '#6f5a48', sleeve: '#3d332b', c: C.nightink });
    return { update: function (p) { var t = ramp(p, 0.08, 0.9), x = startX + (newSpot[0] - startX) * t, y = startY + (newSpot[1] - startY) * t, angle = -24 * (1 - t); drawTo([thread], t); old.setFlame(0.78 * (1 - 0.48 * t), 0, 1); oldFlame.setAttribute('opacity', (1 - 0.5 * t).toFixed(3)); newFlame.setAttribute('opacity', (0.94 * t).toFixed(3)); fresh.group.setAttribute('transform', 'translate(' + x.toFixed(1) + ' ' + y.toFixed(1) + ') rotate(' + angle.toFixed(1) + ')'); fresh.setFlame(0.76, 0, t); hand.setAttribute('opacity', (1 - 0.92 * t).toFixed(3)); } };
  };

  /* 17. Smoke from a dark wick, with the square far off under the White Lamp. */
  S.s17 = function (A) {
    var L0 = A.layer(8), L1 = A.layer(38), L2 = A.layer(70); room(L0);
    var table = K.table(L0, 650, 715, 700, 285, {}), spot = table.surfaceAt(0.62, 0.3), c = K.candle(L1, spot[0], spot[1], 42, 0, { noFlame: true, glowOp: 0 });
    var smoke = P.g(L2), smokePts = [P.line(smoke, [[spot[0], spot[1] - 45], [spot[0] - 22, spot[1] - 130], [spot[0] + 24, spot[1] - 240], [spot[0] - 12, spot[1] - 350], [spot[0] + 18, 70]], 1.6, { c: '#9ba6aa', op: 0.48, bow: 12 }), P.line(smoke, [[spot[0] + 4, spot[1] - 54], [spot[0] + 34, spot[1] - 150], [spot[0] + 13, spot[1] - 285], [spot[0] - 4, 160]], 1.1, { c: '#9ba6aa', op: 0.34, bow: 12 })];
    var wall = K.shutterWall(L0, 1120, 60, 900, { c: C.nightink }); wall.setClosed(1);
    var slitX = wall.win[0] + wall.win[2] / 2, slitY = wall.win[1] + 12, slitH = wall.win[3] - 24, slit = rect(slitX - 13, slitY, slitX + 13, slitY + slitH);
    P.el('rect', { x: slitX - 14, y: slitY, width: 28, height: slitH, fill: C.night, opacity: 0.96 }, L1);
    var view = P.g(L1, { 'clip-path': P.clip(slit) }); var lamp = K.whiteLamp(view, slitX, slitY + slitH - 36, 150, { c: '#aab8b6', ray: '#d6ded9' });
    edge(L1, [slitX - 14, slitY], [slitX - 14, slitY + slitH], 1.5, { c: '#a7b1b0', op: 0.55, bow: 0 }); edge(L1, [slitX + 14, slitY], [slitX + 14, slitY + slitH], 1.5, { c: '#a7b1b0', op: 0.55, bow: 0 });
    return { update: function (p) { var t = ramp(p, 0.05, 0.85); smokePts.forEach(function (e, i) { e.setAttribute('opacity', ((i ? 0.3 : 0.44) * (1 - 0.56 * t)).toFixed(3)); }); smoke.setAttribute('transform', 'translate(' + (Math.sin(p * 4) * 8).toFixed(1) + ' ' + (-75 * t).toFixed(1) + ')'); lamp.setLength(0.35 + 0.2 * t); } };
  };

  /* 18. Morning at the edge of the glass: a cutaway room and an unlit candle. */
  S.s18 = function (A) {
    var L0 = A.layer(8), L1 = A.layer(36), L2 = A.layer(70); P.wash(L0, rect(0, 0, 1600, 1000), '#d9ccb5', 0.46); var country = K.glassCountry(L0, { y: 760, frontX: 250 });
    var house = K.stoneHouse(L1, 1020, 850, 520, 430, { fill: '#817667' }); house.setShutters(1); K.whiteLamp(L0, 1410, 700, 210, { c: '#aebbb7', ray: '#d6ded9' });
    var cutCx = 500, cutCy = 655, cutR = 150, cutPts = P.blobPts(cutCx, cutCy, cutR, cutR, 0.015, 26), cutD = P.closedD(cutPts, 4), cut = P.g(L2, { 'clip-path': P.clip(cutD) });
    P.el('circle', { cx: cutCx, cy: cutCy, r: cutR, fill: C.paper, opacity: 0.95 }, cut);
    var insideTable = K.table(cut, cutCx, cutCy + 44, 245, 120, { fill: '#6b5a49', op: 0.72, apron: '#504337' }), insideSpot = insideTable.surfaceAt(0.42, 0.3), ledger = K.ledger(cut, insideSpot[0], insideSpot[1] - 104, 72, { c: '#625a4d' }); ledger.ink.forEach(function (e) { e.setAttribute('opacity', 0); });
    var fresh = K.candle(cut, insideTable.surfaceAt(0.78, 0.28)[0], insideTable.surfaceAt(0.78, 0.28)[1], 78, 0, { noFlame: true, body: '#e2d5bd', glowOp: 0 });
    var clean = P.line(cut, [[insideSpot[0] - 44, insideSpot[1] - 44], [insideSpot[0] + 44, insideSpot[1] - 46]], 1.2, { c: '#544d43', op: 0.74, bow: 1 });
    P.el('circle', { cx: cutCx, cy: cutCy, r: cutR, fill: 'none', stroke: '#746a5b', 'stroke-width': 2.2, opacity: 0.76 }, L2); P.line(L2, [[cutCx + cutR, cutCy], [house.win[0] - 18, house.win[1] + house.win[3] * 0.52]], 1.3, { c: '#746a5b', op: 0.7, bow: 0 });
    return { update: function (p) { country.setFront(0); clean.setAttribute('opacity', (0.55 + 0.25 * ramp(p, 0.2, 0.8)).toFixed(3)); fresh.setFlame(0, 0, 0); } };
  };

  /* 19. End: one small gold flame in a wide dark. */
  S.s19 = function (A) {
    var L0 = A.layer(18); P.el('rect', { x: 0, y: 0, width: 1600, height: 1000, fill: C.night }, L0);
    var f = flameOnly(L0, 800, 570, { r: 115, glow: 0.4 });
    return { update: function (p) { f.set(Math.sin(p * 13) * 2.4, 0.86 + 0.1 * Math.sin(p * 11), 0.9); } };
  };
})();
