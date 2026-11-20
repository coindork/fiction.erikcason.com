/* words-scenes.js: the card catalogue. For each word the Librarian met before the storm, a title card,
   two panels of the time before, and the source itself. Same pen, same paper, same one gold. */
(function () {
  'use strict';
  var P = window.Pen, C = P.C, K = window.SceneKit, ramp = K.ramp, txt = K.txt, rect = K.rect;
  var WD = window.WORD || {};
  var WOOD = '#8a6a48', LEATHER = '#5b3b26';

  // ---------- furniture of the catalogue ----------
  function edges(G, pts, w, o) { for (var i = 0; i < pts.length - 1; i++) P.ink(G, [pts[i], pts[i + 1]], w, o); }
  function box(G, x0, y0, x1, y1, w, o) { return P.lines(G, [[[x0, y0], [x1, y0]], [[x1, y0], [x1, y1]], [[x1, y1], [x0, y1]], [[x0, y1], [x0, y0]]], w || 1.2, o || { bow: 0.4 }); }
  // a cabinet of small drawers, each with a label slot and a pull
  function cabinet(G, x0, y0, x1, y1, cols, rows, o) {
    o = o || {};
    var d = rect(x0, y0, x1, y1), cells = [], segs = [], labels = [], pulls = [], pad = 10, cw = (x1 - x0 - pad * 2) / cols, rh = (y1 - y0 - pad * 2) / rows;
    P.wash(G, d, WOOD, o.op == null ? 0.42 : o.op);
    P.hatch(G, [x0, y0, x1 - x0, y1 - y0], { angle: 3, gap: 7, w: 0.5, op: 0.22, clip: P.clip(d), bow: 3 });
    P.hatch(G, [x1 - 70, y0, 70, y1 - y0], { angle: 80, gap: 4, w: 0.6, op: 0.35, clip: P.clip(d) });
    edges(G, [[x0, y1], [x0, y0], [x1, y0], [x1, y1]], 2.6);
    P.lines(G, [[[x0 - 16, y0], [x1 + 16, y0]], [[x0 - 16, y0 - 14], [x1 + 16, y0 - 14]], [[x0 - 16, y0 - 14], [x0 - 16, y0]], [[x1 + 16, y0 - 14], [x1 + 16, y0]]], 1.6, { bow: 0.5 });
    for (var c = 0; c < cols; c++) for (var r = 0; r < rows; r++) {
      var ax = x0 + pad + c * cw + 4, ay = y0 + pad + r * rh + 4, bx = ax + cw - 8, by = ay + rh - 8;
      cells.push([ax, ay, bx, by]);
      segs.push([[ax, ay], [bx, ay]], [[bx, ay], [bx, by]], [[bx, by], [ax, by]], [[ax, by], [ax, ay]]);
      var lx = (ax + bx) / 2, ly = ay + (by - ay) * 0.32, lw = Math.min(24, (bx - ax) * 0.28), lh = Math.min(9, (by - ay) * 0.16);
      labels.push([[lx - lw, ly - lh], [lx + lw, ly - lh]], [[lx + lw, ly - lh], [lx + lw, ly + lh]], [[lx + lw, ly + lh], [lx - lw, ly + lh]], [[lx - lw, ly + lh], [lx - lw, ly - lh]]);
      var py = ly + lh + (by - ay) * 0.2;
      pulls.push([[lx - lw * 0.6, py], [lx, py + (by - ay) * 0.12], [lx + lw * 0.6, py]]);
    }
    P.lines(G, segs, 1.1, { op: 0.85, bow: 0.4 });
    P.lines(G, labels, 0.7, { op: 0.6, bow: 0.2 });
    P.lines(G, pulls, 1.5, { op: 0.85, bow: 0 });
    return cells;
  }
  // a drawer pulled toward us out of its cell; returns the front panel box
  function drawerOut(G, c, depth) {
    var fx0 = c[0] - 10, fx1 = c[2] + 10, fy0 = c[1] + depth, fy1 = c[3] + depth + 10;
    P.scribble(G, [c[0], c[1], c[2] - c[0], depth + 6], { step: 2.4, w: 0.8, op: 0.8, vertical: true });
    P.lines(G, [[[c[0], c[1]], [fx0, fy0]], [[c[2], c[1]], [fx1, fy0]]], 1.3, { bow: 0 });
    return [fx0, fy0, fx1, fy1];
  }
  function drawerFront(G, f) {
    P.wash(G, rect(f[0], f[1], f[2], f[3]), C.paper, 1, { plain: true });
    P.wash(G, rect(f[0], f[1], f[2], f[3]), WOOD, 0.55);
    box(G, f[0], f[1], f[2], f[3], 1.8);
    var lx = (f[0] + f[2]) / 2, ly = f[1] + (f[3] - f[1]) * 0.36;
    box(G, lx - 22, ly - 8, lx + 22, ly + 8, 0.8, { op: 0.7, bow: 0.2 });
    P.line(G, [[lx - 14, ly + 26], [lx, ly + 34], [lx + 14, ly + 26]], 1.6, { bow: 0 });
  }
  // an index card: ruled, with a gold heading rule and a hole for the rod
  function card(G, cx, cy, w, h, rot, rows) {
    var Cg = P.g(G, { transform: 'translate(' + cx + ' ' + cy + ') rotate(' + (rot || 0) + ')' });
    var d = rect(-w / 2, -h / 2, w / 2, h / 2), ruled = [];
    P.wash(Cg, d, '#fffaf0', 1, { plain: true });
    P.wash(Cg, d, '#efe3c8', 0.4);
    for (var y = -h / 2 + h * 0.36; y < h / 2 - 14; y += Math.max(18, h * 0.1)) ruled.push([[-w / 2 + 8, y], [w / 2 - 8, y]]);
    P.lines(Cg, ruled, 0.6, { c: C.glass, op: 0.32, bow: 0.2 });
    P.line(Cg, [[-w / 2 + 8, -h / 2 + h * 0.24], [w / 2 - 8, -h / 2 + h * 0.24]], 1.3, { c: C.gold, bow: 0.3 });
    box(Cg, -w / 2, -h / 2, w / 2, h / 2, 1.3, { bow: 0.3 });
    P.ellipseLine(Cg, 0, h / 2 - Math.min(16, h * 0.09), 4.5, 4.5, 1, { op: 0.7 });
    (rows || []).forEach(function (r) { txt(Cg, r[0], r[1], r[2], r[3] || {}); });
    return Cg;
  }
  // a large open book seen from the front, for plates and forests
  function openBook(G, cx, cy, w, h) {
    var L = [[cx - w, cy - h / 2 + 14], [cx - w * 0.5, cy - h / 2 - 6], [cx - 6, cy - h / 2 + 8], [cx - 6, cy + h / 2], [cx - w * 0.5, cy + h / 2 - 12], [cx - w, cy + h / 2 + 6]];
    var R = L.map(function (p) { return [2 * cx - p[0], p[1]]; });
    P.wash(G, P.poly([[cx - w - 14, cy + h / 2 + 20], [cx + w + 14, cy + h / 2 + 20], [cx + w + 8, cy + h / 2 + 2], [cx - w - 8, cy + h / 2 + 2]], true), LEATHER, 0.75);
    [L, R].forEach(function (pg) { P.wash(G, P.closedD(pg, 4), '#fdf8ec', 1, { plain: true }); P.line(G, pg.concat([pg[0]]), 1.5, { j: 0.6 }); });
    P.hatch(G, [cx - 30, cy - h / 2, 60, h + 6], { angle: 90, gap: 4.5, w: 0.6, op: 0.3 });
    P.ink(G, [[cx - 6, cy - h / 2 + 8], [cx - 4, cy + h / 2]], 1.4, { echo: false });
    return { L: L, R: R };
  }
  function ladder(G, x0, y0, x1, y1, w, n) {
    P.ink(G, [[x0, y0], [x1, y1]], 3.2); P.ink(G, [[x0 + w, y0], [x1 + w, y1]], 3.2);
    var r = []; for (var i = 1; i < n; i++) { var a = P.lp([x0, y0], [x1, y1], i / n); r.push([a, [a[0] + w, a[1]]]); }
    P.lines(G, r, 2.2, { bow: 0.5 });
  }
  function desk(G, x0, x1, top, bot) {
    P.wash(G, rect(x0, top, x1, top + 24), WOOD, 0.6);
    P.ink(G, [[x0, top], [x1, top]], 2.6);
    P.line(G, [[x0, top + 24], [x1, top + 24]], 1.4);
    P.ink(G, [[x0 + 28, top + 24], [x0 + 26, bot]], 2.4); P.ink(G, [[x1 - 28, top + 24], [x1 - 26, bot]], 2.4);
  }
  // a small person in a woodcut: not glass, just ink
  function manThrown(G, x, y, s) {
    var g = P.g(G, { transform: 'translate(' + x + ' ' + y + ') scale(' + s + ')' });
    P.ink(g, [[0, 0], [22, -26], [40, -50]], 7, { echo: false });          // body, falling back
    P.ink(g, [[40, -50], [30, -78], [14, -92]], 4, { echo: false });       // arm flung up
    P.ink(g, [[36, -46], [66, -70], [74, -96]], 4, { echo: false });       // the other arm
    P.ink(g, [[0, 0], [-26, 6], [-40, 22]], 5, { echo: false });           // leg
    P.ink(g, [[4, -4], [-12, 24], [-6, 44]], 5, { echo: false });          // leg
    P.el('circle', { cx: 50, cy: -64, r: 10, fill: C.ink }, g);            // head
    P.ink(g, [[38, -76], [62, -80]], 3, { echo: false });                  // hat brim, knocked askew
  }

  // ---------- shared scenes ----------
  // the title: a card rising out of its drawer in the cabinet
  function titleScene(A) {
    var L0 = A.layer(10), L1 = A.layer(30), L2 = A.layer(60), b0 = A.beat(L0, 0);
    K.hall(P.g(b0, { opacity: 0.3 }), A, { vp: [800, 430] });
    var b1 = A.beat(L1, 1);
    var cells = cabinet(b1, 480, 610, 1120, 1010, 3, 3);
    var c = cells[1 * 3 + 0], f = drawerOut(b1, c, 46);
    P.el('circle', { cx: 800, cy: 520, r: 230, fill: 'url(#goldGlow)', opacity: 0.32 }, b1);
    var rise = P.g(b1), cw = 400, ch = 250, rows = [
      [-176, -86, WD.call || '', { size: 14, italic: false, op: 0.7 }],
      [-176, -16, WD.card || WD.title || '', { size: 40 }],
      [-176, 30, WD.orig || '', { size: 20, op: 0.85 }],
      [-176, 76, WD.see || '', { size: 15, op: 0.65 }]];
    card(rise, 800, 560, cw, ch, -1.5, rows);
    drawerFront(b1, f);
    var b2 = A.beat(L2, 2);
    P.figure(b2, 'look', { x: 1300, y: 985, s: 1.25, flip: true });
    return { update: function (p, e) { var t = ramp(e, 0.3, 0.95), s = 0.5 + 0.5 * t; rise.setAttribute('transform', 'translate(800 ' + (720 - 160 * t).toFixed(1) + ') scale(' + s.toFixed(3) + ') translate(-800 -560)'); } };
  }
  // the source: the book itself on its pedestal, a gold ribbon marking the page
  function sourceScene(A) {
    var L0 = A.layer(10), L1 = A.layer(36), b0 = A.beat(L0, 0);
    K.hall(P.g(b0, { opacity: 0.26 }), A, { vp: [1120, 420] });
    var b1 = A.beat(L1, 1), x = 1130, top = 610;
    P.el('circle', { cx: x, cy: top - 30, r: 280, fill: 'url(#goldGlow)', opacity: 0.38 }, b1);
    K.pedestal(b1, x, top, 975);
    K.book(b1, x, top - 6, 170);
    P.brush(b1, [[x + 26, top + 16], [x + 36, top + 70], [x + 24, top + 130], [x + 32, top + 176]], 7, { c: C.gold, op: 0.92 });
    P.brush(b1, [[x + 32, top + 176], [x + 22, top + 196]], 5, { c: C.gold, op: 0.92 });
    if (WD.pageLine) txt(b1, x - 152, top - 16, WD.pageLine, { size: 12, rot: 3, op: 0.8 });
  }
  // the catalogue: the whole cabinet, a few drawers out, the Librarian at it
  function catalogueScene(A) {
    var L0 = A.layer(10), L1 = A.layer(30), L2 = A.layer(62), b0 = A.beat(L0, 0);
    K.hall(P.g(b0, { opacity: 0.32 }), A, { vp: [800, 400], mirror: false });
    var b1 = A.beat(L1, 1), cells = cabinet(b1, 330, 560, 1270, 1010, 8, 4);
    [[1, 0, 30, -3], [3, 1, 52, 2], [6, 0, 38, -2]].forEach(function (q) {
      var c = cells[q[0] * 4 + q[1]], f = drawerOut(b1, c, q[2]);
      var cx = (c[0] + c[2]) / 2;
      [-1, 0, 1].forEach(function (k) { card(b1, cx + k * 6, c[1] + q[2] - 16 - k * 3, (c[2] - c[0]) * 0.86, 70, q[3] + k * 2, []); });
      drawerFront(b1, f);
    });
    var b2 = A.beat(L2, 2);
    P.figure(b2, 'trace', { x: 1380, y: 990, s: 1.3, flip: true });
  }

  // ---------- the time before, word by word ----------
  var W = {};

  W['house-of-being'] = {
    // a thin volume on the returns cart; a line rising off it
    s1: function (A) {
      var L0 = A.layer(12), L1 = A.layer(36), L2 = A.layer(64), b0 = A.beat(L0, 0);
      K.hall(b0, A, { vp: [1080, 440], mirror: true });
      var b1 = A.beat(L1, 1), cx0 = 860, cx1 = 1220, ct = 760, cb = 900, vx = 1040, vy = ct - 4;
      P.wash(b1, rect(cx0, ct, cx1, ct + 14), WOOD, 0.6); P.wash(b1, rect(cx0, cb - 12, cx1, cb), WOOD, 0.55);
      P.ink(b1, [[cx0, ct], [cx1, ct]], 2.6); P.ink(b1, [[cx0, cb], [cx1, cb]], 2.4);
      P.ink(b1, [[cx0 + 14, ct], [cx0 + 14, cb + 30]], 2.4); P.ink(b1, [[cx1 - 14, ct], [cx1 - 14, cb + 30]], 2.4);
      P.ink(b1, [[cx1 - 14, ct + 4], [cx1 + 24, ct - 40], [cx1 + 44, ct - 74]], 2.2);
      [cx0 + 14, cx1 - 14].forEach(function (wx) { P.ellipseLine(b1, wx, cb + 42, 13, 13, 2); });
      var segs = []; for (var x = cx0 + 34; x < cx1 - 34; x += P.rr(9, 15)) { var h = P.rr(50, 84), l = P.jj(9); segs.push([[x, cb - 12], [x + l, cb - 12 - h]]); }
      P.lines(b1, segs, 1.1, { op: 0.8 });
      var glow = P.el('circle', { cx: vx, cy: vy - 30, r: 150, fill: 'url(#goldGlow)', opacity: 0.2 }, b1);
      P.wash(b1, P.poly([[vx - 72, vy], [vx + 72, vy], [vx + 64, vy - 13], [vx - 80, vy - 13]], true), LEATHER, 0.8);
      P.ink(b1, [[vx - 72, vy], [vx + 72, vy], [vx + 64, vy - 13]], 1.4, { echo: false });
      P.line(b1, [[vx + 64, vy - 13], [vx - 80, vy - 13], [vx - 72, vy]], 1.2);
      var b2 = A.beat(L2, 2);
      P.figure(b2, 'look', { x: 1360, y: 935, s: 1.3, flip: true });
      K.reflect(b2, 935, 0.14, function (r) { P.figure(r, 'look', { x: 1360, y: 935, s: 1.3, flip: true }); });
      var line = txt(L2, vx - 200, vy - 46, 'Language is the house of Being.', { size: 32, c: C.goldDeep, op: 0 });
      return { update: function (p) {
        var t = ramp(p, 0.06, 0.6);
        glow.setAttribute('opacity', (0.2 + 0.55 * t).toFixed(3));
        line.setAttribute('opacity', (0.95 * t).toFixed(3));
        line.setAttribute('transform', 'translate(0 ' + (-t * 250).toFixed(1) + ')');
      } };
    },
    // the hall looks back like a house with no one home; it carries the letter to the pedestal
    s2: function (A) {
      var L0 = A.layer(12), L1 = A.layer(30), L2 = A.layer(60), b0 = A.beat(L0, 0);
      K.hall(b0, A, { vp: [560, 470], mirror: true });
      var b1 = A.beat(L1, 1), hx0 = 300, hx1 = 820, hb = 800, ht = 480, peak = [560, 250];
      var house = [
        P.line(L1, [[hx0, hb], [hx0, ht], peak, [hx1, ht], [hx1, hb]], 2.4, { c: C.gold, bow: 0, j: 1.4, steps: 1 }),
        P.line(L1, [[hx0 - 34, ht + 24], peak, [hx1 + 34, ht + 24]], 1.4, { c: C.gold, op: 0.7, bow: 0, j: 1.6, steps: 1 }),
        P.line(L1, [[524, hb], [524, 668], [596, 668], [596, hb]], 1.8, { c: C.gold, bow: 0, steps: 1 }),
        P.line(L1, [[372, 548], [452, 548], [452, 616], [372, 616], [372, 548]], 1.4, { c: C.gold, bow: 0, steps: 1 }),
        P.line(L1, [[668, 548], [748, 548], [748, 616], [668, 616], [668, 548]], 1.4, { c: C.gold, bow: 0, steps: 1 })];
      K.prep(house);
      K.pedestal(b1, 170, 740, 930);
      K.book(b1, 170, 734, 90);
      var b2 = A.beat(L2, 2);
      P.figure(b2, 'walk', { x: 610, y: 935, s: 1.0, flip: true });
      P.wash(b2, P.poly([[536, 784], [566, 778], [570, 806], [540, 812]], true), LEATHER, 0.85, { plain: true });
      K.reflect(b2, 935, 0.15, function (r) { P.figure(r, 'walk', { x: 610, y: 935, s: 1.0, flip: true }); });
      return { update: function (p) { K.drawTo(house, ramp(p, 0.04, 0.62), 0.5); } };
    }
  };

  W['dwelling'] = {
    // the dictionary wing: a wall of drawers, one pulled out, the card for "dwell"
    s1: function (A) {
      var L0 = A.layer(10), L1 = A.layer(34), L2 = A.layer(64), b0 = A.beat(L0, 0);
      var cells = cabinet(b0, 760, 70, 1560, 950, 8, 10, { op: 0.34 });
      var b1 = A.beat(L1, 1), c = cells[3 * 10 + 4], f = drawerOut(b1, c, 44);
      drawerFront(b1, f);
      var lead = P.el('path', { d: P.poly([[(f[0] + f[2]) / 2 + 30, f[1]], [1200, 400]]), fill: 'none', stroke: C.goldDeep, 'stroke-width': 1.3, 'stroke-dasharray': '3 7', opacity: 0.8 }, b1);
      card(b1, 1300, 268, 440, 250, -2.5, [
        [-198, -84, 'dwell', { size: 40 }], [118, -92, 'D · 1951', { size: 13, italic: false, op: 0.7 }],
        [-198, -32, 'v. Old English dwellan: to lead astray,', { size: 16 }],
        [-198, -6, 'to hinder, to delay. Later: to linger,', { size: 16 }],
        [-198, 20, 'to abide. At last: to live in a place.', { size: 16 }],
        [-198, 74, 'see also: house; home; inhabit', { size: 15, op: 0.7 }]]);
      var b2 = A.beat(L2, 2);
      P.figure(b2, 'reach', { x: 990, y: 975, s: 1.42 });
    },
    // looking at its own hands; beyond the window a city still rebuilding
    s2: function (A) {
      var L0 = A.layer(8), L1 = A.layer(30), L2 = A.layer(62), b0 = A.beat(L0, 0);
      var wx0 = 110, wx1 = 640, wy0 = 120, wy1 = 770, wd = K.archD(wx0, wx1, wy0, wy1);
      P.wash(b0, wd, '#e6eef1', 0.95, { plain: true });
      var city = P.g(b0, { 'clip-path': P.clip(wd) });
      var roofs = [], scaff = [], hz = 690;
      for (var x = wx0 - 10; x < wx1; ) {
        var w = P.rr(34, 74), h = P.rr(40, 120), base = hz + P.rr(-8, 10), roofed = P.rnd() < 0.62;
        P.wash(city, rect(x, base - h, x + w, base + 200), '#9fb3bb', 0.35);
        roofs.push([[x, base], [x, base - h]], [[x + w, base], [x + w, base - h]]);
        if (roofed) roofs.push([[x - 3, base - h], [x + w / 2, base - h - w * 0.45], [x + w + 3, base - h]]);
        else { for (var k = 1; k < 4; k++) scaff.push([[x, base - h * k / 4], [x + w, base - h * k / 4]]); scaff.push([[x, base - h], [x + w, base - h * 0.4]]); }
        x += w + P.rr(2, 14);
      }
      P.lines(city, roofs, 1.2, { c: C.glass, op: 0.75, bow: 0.4 });
      P.lines(city, scaff, 0.8, { c: C.glass, op: 0.6, bow: 0.2 });
      P.lines(city, [[[500, hz], [500, 330]], [[440, 344], [624, 340]], [[600, 342], [598, 430]], [[500, 330], [440, 344]], [[500, 330], [624, 340]]], 1.4, { c: C.glass, op: 0.8, bow: 0 });
      K.clouds(city, 2, [wx0, 230, wx1 - wx0, 120], { op: 0.6 });
      P.ink(b0, K.archPts(wx0, wx1, wy0, wy1), 3.2);
      P.lines(b0, [[[(wx0 + wx1) / 2, wy0 - 20], [(wx0 + wx1) / 2, wy1]], [[wx0, 470], [wx1, 470]]], 1.4, { op: 0.8 });
      P.lines(b0, [[[0, 860], [900, 860]]], 1.4, { op: 0.6 });
      var b1 = A.beat(L1, 1);
      desk(b1, 600, 860, 770, 975);
      K.book(b1, 730, 764, 92);
      var b2 = A.beat(L2, 2);
      P.figure(b2, 'open', { x: 400, y: 975, s: 1.55 });
    }
  };

  W['luther-1505'] = {
    // the page with the plate: the storm on the road, the man thrown down
    s1: function (A) {
      var L0 = A.layer(10), L1 = A.layer(34), L2 = A.layer(62), b0 = A.beat(L0, 0);
      K.shelfWall(P.g(b0, { opacity: 0.28 }), 30, 900, 50, 940, { rows: 7 });
      var b1 = A.beat(L1, 1), bx = 470, by = 560;
      P.wash(b1, P.poly([[bx - 70, by + 170], [bx + 70, by + 170], [bx + 44, 960], [bx - 44, 960]], true), WOOD, 0.45);
      P.ink(b1, [[bx - 70, by + 170], [bx - 44, 960]], 2.2); P.ink(b1, [[bx + 70, by + 170], [bx + 44, 960]], 2.4);
      P.ink(b1, [[bx - 130, 966], [bx + 130, 966]], 2.4);
      openBook(b1, bx, by, 330, 320);
      var px0 = bx - 300, px1 = bx - 44, py0 = by - 128, py1 = by + 74, pd = rect(px0, py0, px1, py1), plate = P.g(b1, { 'clip-path': P.clip(pd) });
      P.wash(plate, pd, '#e9dfc8', 1, { plain: true });
      P.hatch(plate, [px0, py0, px1 - px0, (py1 - py0) * 0.58], { angle: -14, gap: 4, w: 0.8, op: 0.75 });
      P.hatch(plate, [px0, py0 + (py1 - py0) * 0.62, px1 - px0, (py1 - py0) * 0.4], { angle: 4, gap: 6, w: 0.7, op: 0.5 });
      P.ink(plate, [[px0 - 10, py1 - 34], [px0 + 120, py1 - 44], [px1 + 10, py1 - 56]], 2);
      K.tree(plate, px1 - 46, py1 - 50, 130, {});
      K.bolt(plate, px0 + 130, py0 - 10, px0 + 104, py1 - 52);
      manThrown(plate, px0 + 70, py1 - 30, 0.62);
      edges(b1, [[px0, py0], [px1, py0], [px1, py1], [px0, py1], [px0, py0]], 1.7, { echo: false });
      txt(b1, px0 + 6, py1 + 28, 'The road to Erfurt, 2 July 1505', { size: 13, op: 0.8 });
      txt(b1, bx + 40, by - 118, 'Stotternheim', { size: 18 });
      P.script(b1, bx + 36, by - 96, 250, 24, { lh: 9, c: C.ink, op: 0.45, w: 0.6 });
      var b2 = A.beat(L2, 2);
      K.hand(b2, bx + 300, by + 166, 1.15, -128, {});
    },
    // calm glass, a calm sky; the first card it ever wrote in its own hand
    s2: function (A) {
      var L0 = A.layer(8), L1 = A.layer(32), L2 = A.layer(62), b0 = A.beat(L0, 0);
      [[800, 1040], [1080, 1320], [1360, 1580]].forEach(function (w) {
        var d = K.archD(w[0], w[1], 140, 580);
        P.wash(b0, d, '#d3e3ea', 0.8, { plain: true });
        var cg = P.g(b0, { 'clip-path': P.clip(d) });
        K.clouds(cg, 2, [w[0] - 20, 300, w[1] - w[0] + 40, 170], { op: 0.75 });
        P.ink(b0, K.archPts(w[0], w[1], 140, 580), 2.6);
        P.lines(b0, [[[(w[0] + w[1]) / 2, 124], [(w[0] + w[1]) / 2, 580]], [[w[0], 380], [w[1], 380]]], 1.1, { op: 0.7 });
      });
      P.lines(b0, [[[740, 620], [1600, 620]], [[740, 634], [1600, 634]]], 1.4, { op: 0.7 });
      var b1 = A.beat(L1, 1);
      desk(b1, 820, 1400, 772, 985);
      P.ellipseLine(b1, 1270, 754, 26, 9, 1.6);
      P.wash(b1, P.poly([[1246, 756], [1294, 756], [1290, 772], [1250, 772]], true), C.ink, 0.85, { plain: true });
      P.brush(b1, [[1262, 752], [1300, 690], [1352, 610]], 5, {});
      var barbs = []; for (var i = 0; i < 12; i++) { var q = P.lp([1290, 706], [1352, 610], i / 12); barbs.push([q, [q[0] - 16 + i, q[1] - 6]]); barbs.push([q, [q[0] + 12, q[1] + 10 - i * 0.5]]); }
      P.lines(b1, barbs, 0.8, { op: 0.75, bow: 0.5 });
      var cd = card(b1, 1060, 712, 250, 140, -4, [[-108, -38, 'Luther, M.', { size: 15 }], [52, -42, 'L · 1505', { size: 11, italic: false, op: 0.7 }]]);
      var ask = txt(cd, -88, 30, 'Ask again.', { size: 36, c: C.goldDeep, op: 0 });
      var b2 = A.beat(L2, 2);
      P.figure(b2, 'look', { x: 1480, y: 985, s: 1.42, flip: true });
      return { update: function (p) { ask.setAttribute('opacity', ramp(p, 0.3, 0.66).toFixed(3)); } };
    }
  };

  W['enframing'] = {
    // inventory: the ladder, the counting, a grid drawing itself over everything
    s1: function (A) {
      var L0 = A.layer(10), L1 = A.layer(30), L2 = A.layer(58), b0 = A.beat(L0, 0);
      K.shelfWall(b0, 60, 820, 60, 900, { rows: 7 });
      var b1 = A.beat(L1, 1);
      P.lines(b1, [[[30, 930], [880, 930]]], 1.6);
      ladder(b1, 472, 965, 536, 80, 72, 12);
      K.book(b1, 230, 930, 110);
      var b2 = A.beat(L2, 2);
      P.figure(b2, 'reach', { x: 534, y: 598, s: 1.05 });
      var grid = [], nums = [], gx0 = 40, gx1 = 860, gy0 = 30, gy1 = 930, n = 1;
      for (var x = gx0; x <= gx1 + 1; x += 164) grid.push(P.line(L2, [[x, gy0], [x, gy1]], 2, { c: C.glass, op: 0.8, bow: 0, j: 0.3, steps: 1 }));
      for (var y = gy0; y <= gy1 + 1; y += 180) grid.push(P.line(L2, [[gx0, y], [gx1, y]], 2, { c: C.glass, op: 0.8, bow: 0, j: 0.3, steps: 1 }));
      K.prep(grid);
      for (y = gy0; y < gy1 - 1; y += 180) for (x = gx0; x < gx1 - 1; x += 164) nums.push(txt(L2, x + 8, y + 22, 'No. ' + (n++), { size: 16, italic: false, c: C.glass, op: 0 }));
      return { update: function (p) {
        K.drawTo(grid, ramp(p, 0.04, 0.5), 0.6);
        nums.forEach(function (el, i) { el.setAttribute('opacity', (0.9 * ramp(p, 0.2 + i * 0.008, 0.35 + i * 0.008)).toFixed(3)); });
      } };
    },
    // the glass wall as a grid of frames; in one corner, a gold shoot
    s2: function (A) {
      var L0 = A.layer(6), L1 = A.layer(26), L2 = A.layer(60), b0 = A.beat(L0, 0), X0 = 680, X1 = 1560, Y0 = 50, Y1 = 900;
      P.wash(b0, rect(X0, Y0, X1, Y1), '#dfe9ec', 0.85, { plain: true });
      var hills = [[X0, 640], [860, 600], [1040, 632], [1240, 580], [1420, 622], [X1, 600]];
      P.wash(b0, P.poly(hills.concat([[X1, Y1], [X0, Y1]]), true), '#9aa77e', 0.35);
      P.line(b0, hills, 1.3, { op: 0.6 });
      K.tree(b0, 1420, 630, 210, {});
      K.clouds(b0, 3, [X0 + 40, 110, X1 - X0 - 80, 200], { op: 0.6 });
      var b1 = A.beat(L1, 1), mull = [], cols = 6, rows = 6;
      for (var i = 0; i <= cols; i++) { var x = P.lerp(X0, X1, i / cols); mull.push([[x, Y0], [x, Y1]]); }
      for (var j = 0; j <= rows; j++) { var y = P.lerp(Y0, Y1, j / rows); mull.push([[X0, y], [X1, y]]); }
      P.lines(b1, mull, 4.4, { op: 0.9, bow: 0.3 });
      P.lines(b1, mull, 1, { c: C.glass, op: 0.5, bow: 1.2, j: 1.4 });
      P.hatch(b1, [X0, Y0, X1 - X0, Y1 - Y0], { angle: 62, gap: 34, w: 0.7, c: C.glass, op: 0.25 });
      P.lines(b1, [[[600, 902], [1600, 902]]], 2);
      var b2 = A.beat(L2, 2);
      P.figure(b2, 'look', { x: 910, y: 980, s: 1.4 });
      var sx = P.lerp(X0, X1, 3 / 6) + 16, sy = P.lerp(Y0, Y1, 5 / 6) - 6;
      var shoot = [P.line(L2, [[sx, sy], [sx + 6, sy - 30], [sx + 2, sy - 62], [sx + 10, sy - 88]], 2.2, { c: C.gold, bow: 0 }),
        P.line(L2, [[sx + 3, sy - 40], [sx + 24, sy - 54], [sx + 38, sy - 50]], 1.8, { c: C.gold, bow: 0 }),
        P.line(L2, [[sx + 4, sy - 66], [sx - 16, sy - 80], [sx - 28, sy - 76]], 1.8, { c: C.gold, bow: 0 })];
      K.prep(shoot);
      var poem = [txt(L2, sx + 46, sy - 66, 'But where danger is, grows', { size: 23, c: C.goldDeep, op: 0 }), txt(L2, sx + 70, sy - 36, 'the saving power also.', { size: 23, c: C.goldDeep, op: 0 })];
      return { update: function (p) {
        K.drawTo(shoot, ramp(p, 0.15, 0.55), 0.4);
        poem.forEach(function (t, k) { t.setAttribute('opacity', (0.92 * ramp(p, 0.42 + k * 0.1, 0.66 + k * 0.1)).toFixed(3)); });
      } };
    }
  };

  W['aletheia'] = {
    // a gallery no one visits; at its end, a mirror under a cloth
    s1: function (A) {
      var L0 = A.layer(12), L1 = A.layer(34), L2 = A.layer(64), b0 = A.beat(L0, 0);
      K.hall(b0, A, { vp: [520, 470], x1: 1000, mirror: true });
      var b1 = A.beat(L1, 1), mx = 520, mw = 74, mt = 320, mb = 570;
      var cloth = [[mx - mw, mt + 8], [mx - mw * 0.4, mt - 10], [mx + mw * 0.5, mt - 8], [mx + mw, mt + 10], [mx + mw + 6, mb], [mx + mw * 0.3, mb + 8], [mx - mw * 0.5, mb + 3], [mx - mw - 6, mb + 10]];
      P.wash(b1, P.closedD(cloth, 4), '#ece4d2', 1, { plain: true });
      P.wash(b1, P.closedD(cloth, 4), '#b9ae98', 0.5);
      P.line(b1, cloth.concat([cloth[0], cloth[1]]), 1.6, { j: 0.8 });
      for (var k = 0; k < 5; k++) P.brush(b1, [[mx - mw * 0.7 + k * 32, mt + 8], [mx - mw * 0.66 + k * 33 + P.jj(6), (mt + mb) / 2], [mx - mw * 0.8 + k * 37, mb + 4]], k % 2 ? 1.2 : 1.8, { c: C.slateDark, op: 0.6 });
      P.lines(b1, [[[mx - mw + 6, mb + 8], [mx - mw + 2, mb + 30]], [[mx + mw - 6, mb + 8], [mx + mw - 2, mb + 30]]], 2.2, { bow: 0 });
      var b2 = A.beat(L2, 2);
      P.figure(b2, 'look', { x: 210, y: 965, s: 1.55 });
      P.wash(b2, P.poly([[262, 760], [300, 752], [306, 776], [268, 784]], true), LEATHER, 0.85, { plain: true });
      K.reflect(b2, 965, 0.13, function (r) { P.figure(r, 'look', { x: 210, y: 965, s: 1.55 }); });
    },
    // the glass hand at the corner of the cloth; underneath, a glint
    s2: function (A) {
      var L0 = A.layer(8), L1 = A.layer(28), L2 = A.layer(52), b0 = A.beat(L0, 0);
      K.shelfWall(P.g(b0, { opacity: 0.22 }), 640, 1600, 30, 960, { rows: 7 });
      var b1 = A.beat(L1, 1), x0 = 860, x1 = 1300, y0 = 90, y1 = 880, md = rect(x0, y0, x1, y1);
      P.wash(b1, md, '#e3ecef', 1, { plain: true });
      P.el('circle', { cx: 1250, cy: 760, r: 280, fill: 'url(#goldGlow)', opacity: 0.95 }, b1);
      P.hatch(b1, [x0, y0, x1 - x0, y1 - y0], { angle: 64, gap: 26, w: 0.8, c: C.glass, op: 0.35, clip: P.clip(md) });
      edges(b1, [[x0 - 24, y1 + 24], [x0 - 24, y0 - 24], [x1 + 24, y0 - 24], [x1 + 24, y1 + 24]], 3.2);
      P.lines(b1, [[[x0 - 34, y1 + 24], [x1 + 34, y1 + 24]], [[x0 - 10, y1 + 24], [x0 - 14, y1 + 70]], [[x1 + 10, y1 + 24], [x1 + 14, y1 + 70]]], 2.4, { bow: 0 });
      var clothFill = P.el('path', { fill: '#ece4d2' }, b1), clothWash = P.el('path', { fill: '#b9ae98', opacity: 0.45, filter: 'url(#wash)' }, b1);
      var clothLine = P.el('path', { fill: 'none', stroke: C.ink, 'stroke-width': 1.8, 'stroke-linejoin': 'round' }, b1);
      var folds = [0, 1, 2, 3, 4].map(function (k) { return P.el('path', { fill: 'none', stroke: C.slateDark, 'stroke-width': k % 2 ? 1.2 : 1.8, opacity: 0.55, 'stroke-linecap': 'round' }, b1); });
      var handG = P.g(L2), handIn = P.g(handG); K.hand(handIn, 0, 0, 1.35, 200, {});
      function pts(t) {
        var corner = [P.lerp(x1 + 22, 1385, t), P.lerp(y1 + 30, 560, t)];
        return [[x0 - 34, y0 - 32], [x0 + 150, y0 - 46], [x1 - 120, y0 - 42], [x1 + 32, y0 - 28], [P.lerp(x1 + 34, x1 - 30, t), P.lerp(y0 + 360, y0 + 280, t)], corner,
          [P.lerp(x0 + 300, x0 + 160, t), P.lerp(y1 + 34, y1 + 14, t)], [x0 + 110, y1 + 32], [x0 - 36, y1 + 30], [x0 - 38, (y0 + y1) / 2]];
      }
      function setT(t) {
        var Q = pts(t), d = P.closedD(Q, 4), corner = Q[5];
        clothFill.setAttribute('d', d); clothWash.setAttribute('d', d); clothLine.setAttribute('d', d);
        folds.forEach(function (f, k) {
          var top = [P.lerp(x0 - 10, x1 + 10, (k + 0.6) / 5.4), y0 - 30], bot = P.lp([x0 - 20, y1 + 30], corner, (k + 0.5) / 5), mid = P.lp(top, bot, 0.55);
          f.setAttribute('d', P.poly(P.spline([top, [mid[0] + 8, mid[1]], bot], 4)));
        });
        handG.setAttribute('transform', 'translate(' + (corner[0] + 112).toFixed(1) + ' ' + (corner[1] + 30).toFixed(1) + ')');
      }
      setT(0);
      return { update: function (p) { setT(0.85 * ramp(p, 0.08, 0.4) * (1 - ramp(p, 0.62, 0.92))); } };
    }
  };

  W['ereignis'] = {
    // five cards pinned to a board, and the word itself, unpinned, between them
    s1: function (A) {
      var L0 = A.layer(8), L1 = A.layer(30), L2 = A.layer(62), b0 = A.beat(L0, 0);
      K.shelfWall(P.g(b0, { opacity: 0.22 }), 600, 1600, 40, 960, { rows: 7 });
      var b1 = A.beat(L1, 1), bx0 = 900, bx1 = 1550, by0 = 100, by1 = 740, bd = rect(bx0, by0, bx1, by1);
      P.wash(b1, bd, '#b48a5a', 0.6);
      P.hatch(b1, [bx0, by0, bx1 - bx0, by1 - by0], { angle: 35, gap: 5, w: 0.5, op: 0.22, clip: P.clip(bd) });
      box(b1, bx0, by0, bx1, by1, 2.8, { bow: 0.5 });
      box(b1, bx0 - 12, by0 - 12, bx1 + 12, by1 + 12, 1.4, { bow: 0.5 });
      [['event', 'the dictionaries', 1020, 220, -4], ['occurrence', 'the dictionaries', 1430, 220, 3], ['event of appropriation', 'Stambaugh, 1969', 1020, 620, 2],
       ['enowning', 'Emad and Maly, 1999', 1430, 620, -3], ['the event', 'Rojcewicz and Vallega-Neu, 2012', 1225, 650, 1]].forEach(function (q) {
        card(b1, q[2], q[3], 220, 116, q[4], [[-96, -12, q[0], { size: 19 }], [-96, 24, q[1], { size: 11, op: 0.7 }]]);
        var pin = [q[2] + Math.sin(q[4] * 0.0175) * -46, q[3] - 46];
        P.el('circle', { cx: pin[0], cy: pin[1], r: 6, fill: C.ink }, b1);
        P.el('circle', { cx: pin[0] - 2, cy: pin[1] - 2, r: 1.6, fill: '#ffffff', opacity: 0.8 }, b1);
      });
      var free = P.g(L1);
      P.el('circle', { cx: 1225, cy: 410, r: 170, fill: 'url(#goldGlow)', opacity: 0.55 }, free);
      txt(free, 1225, 432, 'Ereignis', { size: 64, c: C.goldDeep, anchor: 'middle' });
      var b2 = A.beat(L2, 2);
      P.figure(b2, 'look', { x: 830, y: 980, s: 1.42 });
      return { update: function (p, e) { free.setAttribute('opacity', (0.25 + 0.75 * ramp(e, 0.5, 1)).toFixed(3)); free.setAttribute('transform', 'translate(' + (Math.sin(p * 7) * 14).toFixed(1) + ' ' + (Math.cos(p * 5) * 10 - p * 30).toFixed(1) + ')'); } };
    },
    // night; a palm flat on the glass, waiting; far off, unseen, a flicker
    s2: function (A) {
      var L0 = A.layer(6), L1 = A.layer(26), L2 = A.layer(56), b0 = A.beat(L0, 0), ink = C.nightink;
      P.wash(b0, rect(0, 0, 940, 1000), '#1b1d26', 1, { plain: true });
      K.clouds(b0, 4, [40, 330, 760, 200], { col: '#2c2e3a', op: 0.95, c: '#6c6876' });
      var far = P.g(b0, { opacity: 0 });
      P.el('circle', { cx: 300, cy: 540, r: 240, fill: 'url(#goldGlow)', opacity: 0.45 }, far);
      K.bolt(far, 290, 420, 330, 664);
      var hills = [[0, 700], [160, 664], [340, 690], [520, 640], [700, 682], [940, 650]];
      P.wash(b0, P.poly(hills.concat([[940, 1000], [0, 1000]]), true), '#0a0a0b', 1, { plain: true });
      P.line(b0, hills, 1.2, { c: '#77726a', op: 0.8 });
      var b1 = A.beat(L1, 1), mull = [];
      [0, 310, 620, 930].forEach(function (x) { mull.push([[x, 0], [x, 1000]]); });
      [300, 640].forEach(function (y) { mull.push([[0, y], [940, y]]); });
      P.lines(b1, mull, 5, { c: '#05060a', op: 0.95, bow: 0.3 });
      P.lines(b1, mull, 1, { c: ink, op: 0.45, bow: 1, j: 1.2 });
      P.hatch(b1, [0, 0, 940, 1000], { angle: 60, gap: 40, w: 0.7, c: '#cfe2ea', op: 0.12 });
      P.el('circle', { cx: 880, cy: 860, r: 420, fill: 'url(#goldGlow)', opacity: 0.22 }, b1);
      var b2 = A.beat(L2, 2);
      P.wash(b2, P.closedD(P.blobPts(520, 560, 150, 190, 0.2, 12)), '#cfe2ea', 0.1);
      K.hand(b2, 520, 770, 2.5, -90, { dark: true });
      return { update: function (p) {
        var f = Math.max(0, Math.sin((p - 0.5) * 46)) * ramp(p, 0.5, 0.56) * (1 - ramp(p, 0.72, 0.8));
        far.setAttribute('opacity', f.toFixed(3));
      } };
    }
  };

  W['clearing'] = {
    // a forest standing up out of a book, an open place in the middle where the light falls
    s1: function (A) {
      var L0 = A.layer(10), L1 = A.layer(34), L2 = A.layer(62), b0 = A.beat(L0, 0);
      K.shelfWall(P.g(b0, { opacity: 0.24 }), 0, 900, 40, 760, { rows: 6 });
      desk(b0, 30, 900, 800, 1000);
      var b1 = A.beat(L1, 1), bx = 470, by = 728;
      P.el('path', { d: P.poly([[420, -20], [520, -20], [568, 690], [372, 690]], true), fill: 'url(#shaft)', opacity: 0.95 }, b1);
      openBook(b1, bx, by, 310, 120);
      P.wash(b1, P.closedD(P.blobPts(bx, by - 24, 74, 20, 0.1, 10)), C.goldPale, 0.65);
      var trees = [];
      [[196, 170], [250, 236], [306, 196], [356, 150], [588, 160], [636, 222], [690, 250], [744, 170]].forEach(function (t) {
        var g = P.g(b1); K.tree(g, t[0], by - 40, t[1], {}); trees.push([g, t[0], by - 40]);
      });
      P.el('circle', { cx: bx, cy: by - 40, r: 150, fill: 'url(#goldGlow)', opacity: 0.45 }, b1);
      var b2 = A.beat(L2, 2);
      P.figure(b2, 'look', { x: 120, y: 985, s: 1.32 });
      return { update: function (p, e) {
        trees.forEach(function (t, i) { var s = 0.25 + 0.75 * ramp(e * 0.6 + p * 0.6, 0.2 + i * 0.03, 0.75 + i * 0.03); t[0].setAttribute('transform', 'translate(' + t[1] + ' ' + t[2] + ') scale(1 ' + s.toFixed(3) + ') translate(' + (-t[1]) + ' ' + (-t[2]) + ')'); });
      } };
    },
    // a ring of open books on the floor, the Librarian in the middle, lamplight and dust falling
    s2: function (A) {
      var L0 = A.layer(8), L1 = A.layer(30), L2 = A.layer(60), b0 = A.beat(L0, 0), cx = 1110, cy = 850, rx = 360, ry = 82;
      K.hall(P.g(b0, { opacity: 0.38 }), A, { vp: [1110, 440] });
      var b1 = A.beat(L1, 1);
      P.line(b1, [[cx, -10], [cx, 150]], 1.3, { bow: 0 });
      P.el('circle', { cx: cx, cy: 196, r: 340, fill: 'url(#goldGlow)', opacity: 0.5 }, b1);
      P.el('path', { d: P.poly([[cx - 40, 192], [cx + 40, 192], [cx + rx + 50, cy + 30], [cx - rx - 50, cy + 30]], true), fill: 'url(#shaft)', opacity: 0.55 }, b1);
      P.ink(b1, [[cx - 44, 194], [cx - 28, 152], [cx + 28, 152], [cx + 44, 194]], 2.2);
      P.el('path', { d: P.closedD(P.blobPts(cx, 186, 10, 12, 0.1, 10)), fill: C.goldPale }, b1);
      var b2 = A.beat(L2, 2), back = P.g(b1), front = [], flaps = [];
      for (var i = 0; i < 14; i++) {
        var a = i / 14 * 6.283 + 0.2, x = cx + Math.cos(a) * rx, y = cy + Math.sin(a) * ry, w = 30 + 8 * Math.sin(a);
        if (y < cy) K.book(back, x, y, w); else front.push([x, y, w]);
      }
      P.figure(b2, 'stand', { x: cx, y: cy + 12, s: 1.18 });
      front.forEach(function (f, k) {
        K.book(b2, f[0], f[1], f[2]);
        var g = P.g(b2); P.line(g, [[f[0], f[1] + 14], [f[0] + f[2] * 0.4, f[1] - 30], [f[0] + f[2] * 0.85, f[1] - 18]], 1.2, { bow: 0 });
        flaps.push([g, f[0], f[1] + 14, k]);
      });
      return { fx: { motes: { quad: [[cx - 50, 200], [cx + 50, 200], [cx + rx, cy], [cx - rx, cy]], n: 100 } },
        update: function (p) { var amp = ramp(p, 0.25, 0.5) * (1 - ramp(p, 0.8, 1)); flaps.forEach(function (f) { f[0].setAttribute('transform', 'rotate(' + (Math.sin(p * 30 + f[3] * 1.7) * 28 * amp).toFixed(1) + ' ' + f[1] + ' ' + f[2] + ')'); }); } };
    }
  };

  // ---------- the page's scenes ----------
  var S = {};
  if (WD.slug === 'catalogue') S.s0 = catalogueScene;
  else if (W[WD.slug]) { S.s0 = titleScene; S.s1 = W[WD.slug].s1; S.s2 = W[WD.slug].s2; S.s3 = sourceScene; }
  window.SCENES = S;
})();
