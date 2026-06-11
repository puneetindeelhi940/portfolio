/* globe-fx.js — rotating wireframe globe behind the gate page.
   Pieces:
   - World coastlines drawn as a uniform green land wash (no political borders)
   - India outlined per Survey of India (datameet/maps): includes full J&K,
     Ladakh, Aksai Chin, and Arunachal Pradesh
   - India shaded with a saffron→green vertical gradient, brightened around
     Bengaluru, and meshed with a blurred silicon-chip overlay
   - Five animated great-circle arcs from Bengaluru to Delhi, Palo Alto,
     Chicago, Round Rock, Darmstadt. Each arc has a persistent faint base
     line and a bright "data pulse" travelling along it
   - Pulse rings emanating from Bengaluru
   - Globe loads with India dead-centre, then drifts at ~0.4°/sec eastward;
     cursor adds extra tilt/yaw
   - Honours prefers-reduced-motion (slower drift, no pulse animation),
     pauses when the tab is hidden, no-ops if the canvas is missing
*/
(async function () {
  var canvas = document.getElementById('gate-globe');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  if (!ctx) return;

  var reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var DPR = Math.min(window.devicePixelRatio || 1, 2);

  // ---- Load data (silently no-op if either fails) ----
  var worldRaw, indiaSoi;
  try {
    var fetched = await Promise.all([
      fetch('assets/world.json').then(function (r) { return r.json(); }),
      fetch('assets/india-soi.json').then(function (r) { return r.json(); })
    ]);
    worldRaw = fetched[0];
    indiaSoi = fetched[1];
  } catch (e) {
    return; // gracefully bail — the gradient bg still renders
  }
  var land = worldRaw.features.filter(function (f) { return f.name !== 'India'; });
  var indiaFeature = indiaSoi.features[0];

  // ---- Cities (lon, lat) ----
  var C = {
    bengaluru: [77.59, 12.97],
    delhi:     [77.21, 28.61],
    paloAlto:  [-122.14, 37.44],
    chicago:   [-87.63, 41.88],
    roundRock: [-97.68, 30.51],
    darmstadt: [8.65, 49.87]
  };
  var ARC_TARGETS = ['delhi', 'paloAlto', 'chicago', 'roundRock', 'darmstadt'];

  var HIMALAYAS = [
    [73.0, 35.2], [74.5, 35.0], [75.8, 34.8], [76.5, 34.0], [77.7, 33.0],
    [78.5, 32.3], [80.0, 31.2], [81.5, 30.5], [82.8, 30.0], [84.5, 29.0],
    [86.0, 28.3], [87.8, 28.0], [89.5, 28.0], [91.5, 28.2], [93.5, 28.4],
    [95.0, 28.5], [96.5, 29.0]
  ];

  // ---- Pre-rendered silicon chip pattern ----
  var CHIP_SIZE = 600;
  function drawChipPattern(c, size) {
    c.clearRect(0, 0, size, size);
    var die = size * 0.58;
    var dx = (size - die) / 2;
    var dy = (size - die) / 2;
    c.strokeStyle = 'rgba(110, 220, 255, 0.95)';
    c.lineWidth = 5;
    c.strokeRect(dx, dy, die, die);
    c.lineWidth = 3.5;
    c.strokeStyle = 'rgba(90, 200, 235, 0.85)';
    var PINS = 14, PIN_LEN = die * 0.12;
    for (var i = 0; i < PINS; i++) {
      var t = (i + 0.5) / PINS, x = dx + t * die, y = dy + t * die;
      c.beginPath(); c.moveTo(x, dy); c.lineTo(x, dy - PIN_LEN); c.stroke();
      c.beginPath(); c.moveTo(x, dy + die); c.lineTo(x, dy + die + PIN_LEN); c.stroke();
      c.beginPath(); c.moveTo(dx, y); c.lineTo(dx - PIN_LEN, y); c.stroke();
      c.beginPath(); c.moveTo(dx + die, y); c.lineTo(dx + die + PIN_LEN, y); c.stroke();
    }
    c.strokeStyle = 'rgba(255, 90, 200, 0.55)';
    c.lineWidth = 2;
    var grid = 6;
    for (var k = 1; k < grid; k++) {
      var t2 = k / grid;
      c.beginPath(); c.moveTo(dx + t2 * die, dy); c.lineTo(dx + t2 * die, dy + die); c.stroke();
      c.beginPath(); c.moveTo(dx, dy + t2 * die); c.lineTo(dx + die, dy + t2 * die); c.stroke();
    }
    c.fillStyle = 'rgba(255, 190, 90, 0.75)';
    for (var r = 0; r < 4; r++) {
      for (var q = 0; q < 4; q++) {
        var px = dx + (r + 0.5) * die / 4;
        var py = dy + (q + 0.5) * die / 4;
        c.fillRect(px - 6, py - 6, 12, 12);
      }
    }
    c.strokeStyle = 'rgba(200, 240, 255, 0.95)';
    c.lineWidth = 3.5;
    var cpuS = die * 0.42;
    var cpuX = dx + (die - cpuS) / 2;
    var cpuY = dy + (die - cpuS) / 2;
    c.strokeRect(cpuX, cpuY, cpuS, cpuS);
    c.lineWidth = 2.5;
    var cs = 18;
    c.beginPath();
    c.moveTo(cpuX, cpuY + cs); c.lineTo(cpuX, cpuY); c.lineTo(cpuX + cs, cpuY);
    c.moveTo(cpuX + cpuS - cs, cpuY); c.lineTo(cpuX + cpuS, cpuY); c.lineTo(cpuX + cpuS, cpuY + cs);
    c.moveTo(cpuX + cpuS, cpuY + cpuS - cs); c.lineTo(cpuX + cpuS, cpuY + cpuS); c.lineTo(cpuX + cpuS - cs, cpuY + cpuS);
    c.moveTo(cpuX + cs, cpuY + cpuS); c.lineTo(cpuX, cpuY + cpuS); c.lineTo(cpuX, cpuY + cpuS - cs);
    c.stroke();
    c.fillStyle = 'rgba(220, 250, 255, 0.85)';
    c.fillRect(cpuX + cpuS / 2 - 3, cpuY + cpuS / 2 - 3, 6, 6);
  }
  function makeChipCanvas() {
    var sharp = document.createElement('canvas');
    sharp.width = sharp.height = CHIP_SIZE;
    drawChipPattern(sharp.getContext('2d'), CHIP_SIZE);
    var blurred = document.createElement('canvas');
    blurred.width = blurred.height = CHIP_SIZE;
    var bc = blurred.getContext('2d');
    if ('filter' in bc) { bc.filter = 'blur(7px)'; }
    bc.drawImage(sharp, 0, 0);
    return blurred;
  }
  var chipCanvas = makeChipCanvas();

  // ---- Geometry ----
  var cw, ch, cx, cy, R;
  function resize() {
    var r = canvas.getBoundingClientRect();
    cw = Math.max(1, Math.floor(r.width * DPR));
    ch = Math.max(1, Math.floor(r.height * DPR));
    canvas.width = cw;
    canvas.height = ch;
    cx = cw * 0.66; // bias right so the form area gets clearer space on the left
    cy = ch * 0.52;
    R  = Math.min(cw, ch) * 0.42;
  }
  resize();
  window.addEventListener('resize', resize);

  // ---- Rotation: India centred on load, slow eastward drift, cursor adds offset ----
  var INDIA_CENTERED_ROT = -1.354;
  var baseRotY = INDIA_CENTERED_ROT;
  var cursorX = 0, cursorY = 0;
  var cursorTargetX = 0, cursorTargetY = 0;
  window.addEventListener('pointermove', function (e) {
    cursorTargetX = (e.clientX / window.innerWidth) * 2 - 1;
    cursorTargetY = (e.clientY / window.innerHeight) * 2 - 1;
  }, { passive: true });

  // ---- Math ----
  function transform(vx, vy, vz, rotY, tilt) {
    var cR = Math.cos(rotY), sR = Math.sin(rotY);
    var x1 = vx * cR + vz * sR;
    var z1 = -vx * sR + vz * cR;
    var cT = Math.cos(tilt), sT = Math.sin(tilt);
    var y1 = vy * cT - z1 * sT;
    var z2 = vy * sT + z1 * cT;
    return { x: x1, y: y1, z: z2 };
  }
  function lonLatToVec(lon, lat) {
    var lonR = lon * Math.PI / 180, latR = lat * Math.PI / 180;
    return [Math.cos(latR) * Math.sin(lonR), Math.sin(latR), Math.cos(latR) * Math.cos(lonR)];
  }
  function project(lon, lat, rotY, tilt) {
    var v = lonLatToVec(lon, lat);
    return transform(v[0], v[1], v[2], rotY, tilt);
  }

  function fillOcean() {
    var g = ctx.createRadialGradient(cx - R * 0.35, cy - R * 0.35, R * 0.1, cx, cy, R);
    g.addColorStop(0, 'rgba(72, 120, 120, 0.30)');
    g.addColorStop(0.7, 'rgba(40, 80, 90, 0.20)');
    g.addColorStop(1, 'rgba(18, 38, 48, 0.10)');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.fill();
  }
  function strokeSphere() {
    ctx.strokeStyle = 'rgba(190, 210, 200, 0.28)';
    ctx.lineWidth = 1 * DPR;
    ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.stroke();
  }
  function drawGraticule(rotY, tilt) {
    ctx.strokeStyle = 'rgba(190, 215, 200, 0.07)';
    ctx.lineWidth = 0.6 * DPR;
    for (var lat = -60; lat <= 60; lat += 30) {
      ctx.beginPath();
      var first = true;
      for (var lon = -180; lon <= 180; lon += 4) {
        var p = project(lon, lat, rotY, tilt);
        if (p.z < 0) { first = true; continue; }
        var sx = cx + p.x * R, sy = cy - p.y * R;
        if (first) { ctx.moveTo(sx, sy); first = false; } else ctx.lineTo(sx, sy);
      }
      ctx.stroke();
    }
    for (var lon2 = -180; lon2 < 180; lon2 += 30) {
      ctx.beginPath();
      var f2 = true;
      for (var lat2 = -85; lat2 <= 85; lat2 += 3) {
        var p2 = project(lon2, lat2, rotY, tilt);
        if (p2.z < 0) { f2 = true; continue; }
        var sx2 = cx + p2.x * R, sy2 = cy - p2.y * R;
        if (f2) { ctx.moveTo(sx2, sy2); f2 = false; } else ctx.lineTo(sx2, sy2);
      }
      ctx.stroke();
    }
  }

  function drawRingFill(ring, rotY, tilt, style) {
    ctx.fillStyle = style;
    ctx.beginPath();
    var started = false, lastVisible = false;
    for (var i = 0; i < ring.length; i++) {
      var p = project(ring[i][0], ring[i][1], rotY, tilt);
      var visible = p.z >= -0.02;
      if (visible) {
        var sx = cx + p.x * R, sy = cy - p.y * R;
        if (!lastVisible) { ctx.moveTo(sx, sy); started = true; }
        else ctx.lineTo(sx, sy);
      }
      lastVisible = visible;
    }
    if (started) { ctx.closePath(); ctx.fill(); }
  }
  function pathRing(ring, rotY, tilt, ptsOut) {
    var lastVisible = false;
    for (var i = 0; i < ring.length; i++) {
      var p = project(ring[i][0], ring[i][1], rotY, tilt);
      var visible = p.z >= -0.02;
      if (visible) {
        var sx = cx + p.x * R, sy = cy - p.y * R;
        if (!lastVisible) ctx.moveTo(sx, sy); else ctx.lineTo(sx, sy);
        if (ptsOut) ptsOut.push([sx, sy]);
      }
      lastVisible = visible;
    }
  }
  function drawRingStroke(ring, rotY, tilt, style, width) {
    ctx.strokeStyle = style;
    ctx.lineWidth = width * DPR;
    ctx.beginPath();
    var lastVisible = false;
    for (var i = 0; i <= ring.length; i++) {
      var pt = ring[i % ring.length];
      var p = project(pt[0], pt[1], rotY, tilt);
      var visible = p.z >= -0.02;
      if (visible) {
        var sx = cx + p.x * R, sy = cy - p.y * R;
        if (!lastVisible) ctx.moveTo(sx, sy); else ctx.lineTo(sx, sy);
      }
      lastVisible = visible;
    }
    ctx.stroke();
  }
  function drawFeatureFill(f, rotY, tilt, style) {
    var g = f.geometry;
    if (g.type === 'Polygon') for (var i = 0; i < g.coordinates.length; i++) drawRingFill(g.coordinates[i], rotY, tilt, style);
    else if (g.type === 'MultiPolygon') for (var j = 0; j < g.coordinates.length; j++) for (var k = 0; k < g.coordinates[j].length; k++) drawRingFill(g.coordinates[j][k], rotY, tilt, style);
  }
  function drawFeatureStroke(f, rotY, tilt, style, width) {
    var g = f.geometry;
    if (g.type === 'Polygon') for (var i = 0; i < g.coordinates.length; i++) drawRingStroke(g.coordinates[i], rotY, tilt, style, width);
    else if (g.type === 'MultiPolygon') for (var j = 0; j < g.coordinates.length; j++) for (var k = 0; k < g.coordinates[j].length; k++) drawRingStroke(g.coordinates[j][k], rotY, tilt, style, width);
  }
  function pathFeature(f, rotY, tilt, ptsOut) {
    var g = f.geometry;
    if (g.type === 'Polygon') for (var i = 0; i < g.coordinates.length; i++) pathRing(g.coordinates[i], rotY, tilt, ptsOut);
    else if (g.type === 'MultiPolygon') for (var j = 0; j < g.coordinates.length; j++) for (var k = 0; k < g.coordinates[j].length; k++) pathRing(g.coordinates[j][k], rotY, tilt, ptsOut);
  }

  function drawIndiaGradient(rotY, tilt) {
    // Bright saffron interior with a subtle yellow→green falloff toward the south
    var pts = [];
    ctx.save();
    ctx.beginPath();
    pathFeature(indiaFeature, rotY, tilt, pts);
    if (pts.length < 3) { ctx.restore(); return; }
    ctx.clip();
    var minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (var i = 0; i < pts.length; i++) {
      var p = pts[i];
      if (p[0] < minX) minX = p[0]; if (p[0] > maxX) maxX = p[0];
      if (p[1] < minY) minY = p[1]; if (p[1] > maxY) maxY = p[1];
    }
    var grad = ctx.createLinearGradient(0, minY, 0, maxY);
    grad.addColorStop(0,    'rgba(255, 150, 45, 0.78)');  // brighter saffron, north
    grad.addColorStop(0.45, 'rgba(255, 175, 70, 0.62)');  // warm middle
    grad.addColorStop(0.75, 'rgba(220, 175, 90, 0.45)');  // muted
    grad.addColorStop(1,    'rgba(85, 165, 90, 0.55)');   // green, south
    ctx.fillStyle = grad;
    ctx.fillRect(minX - 8, minY - 8, (maxX - minX) + 16, (maxY - minY) + 16);
    ctx.restore();
  }

  // Dark-green wash that intensifies toward the N + NE — gradient runs from
  // the south-Indian reference point (SW) to a NE reference (lon 92°, lat 30°)
  // and stays correctly oriented as the globe rotates.
  function drawNorthEastGreenWash(rotY, tilt) {
    var ne = project(92, 30, rotY, tilt);
    var sw = project(76, 12, rotY, tilt);
    if (ne.z < -0.4 && sw.z < -0.4) return;
    var sxNE = cx + ne.x * R, syNE = cy - ne.y * R;
    var sxSW = cx + sw.x * R, sySW = cy - sw.y * R;
    var pts = [];
    ctx.save();
    ctx.beginPath();
    pathFeature(indiaFeature, rotY, tilt, pts);
    if (pts.length < 3) { ctx.restore(); return; }
    ctx.clip();
    var grad = ctx.createLinearGradient(sxSW, sySW, sxNE, syNE);
    grad.addColorStop(0,    'rgba(18, 70, 35, 0)');
    grad.addColorStop(0.55, 'rgba(18, 70, 35, 0.18)');
    grad.addColorStop(1,    'rgba(12, 55, 28, 0.78)');
    ctx.fillStyle = grad;
    var minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (var i = 0; i < pts.length; i++) {
      var p = pts[i];
      if (p[0] < minX) minX = p[0]; if (p[0] > maxX) maxX = p[0];
      if (p[1] < minY) minY = p[1]; if (p[1] > maxY) maxY = p[1];
    }
    ctx.fillRect(minX - 10, minY - 10, maxX - minX + 20, maxY - minY + 20);
    ctx.restore();
  }

  // Radial dark-green wash from India's centroid outward — gives the borders a
  // darker tone while keeping the interior bright orange.
  function drawIndiaBorderWash(rotY, tilt) {
    var c = project(80, 22, rotY, tilt);
    if (c.z < 0) return;
    var csx = cx + c.x * R, csy = cy - c.y * R;
    var pts = [];
    ctx.save();
    ctx.beginPath();
    pathFeature(indiaFeature, rotY, tilt, pts);
    if (pts.length < 3) { ctx.restore(); return; }
    ctx.clip();
    var maxRad = 0;
    for (var i = 0; i < pts.length; i++) {
      var dx = pts[i][0] - csx, dy = pts[i][1] - csy;
      var d = Math.sqrt(dx * dx + dy * dy);
      if (d > maxRad) maxRad = d;
    }
    var grad = ctx.createRadialGradient(csx, csy, maxRad * 0.45, csx, csy, maxRad * 1.05);
    grad.addColorStop(0,   'rgba(20, 80, 35, 0)');
    grad.addColorStop(0.7, 'rgba(20, 80, 35, 0.20)');
    grad.addColorStop(1,   'rgba(10, 55, 25, 0.55)');
    ctx.fillStyle = grad;
    ctx.fillRect(csx - maxRad * 1.2, csy - maxRad * 1.2, maxRad * 2.4, maxRad * 2.4);
    ctx.restore();
  }
  function drawSouthIndiaHighlight(rotY, tilt) {
    var center = project(C.bengaluru[0], C.bengaluru[1], rotY, tilt);
    if (center.z < 0) return;
    var sx = cx + center.x * R, sy = cy - center.y * R;
    ctx.save();
    ctx.beginPath();
    pathFeature(indiaFeature, rotY, tilt, null);
    ctx.clip();
    var grad = ctx.createRadialGradient(sx, sy, 2 * DPR, sx, sy, R * 0.18);
    grad.addColorStop(0, 'rgba(160, 230, 140, 0.45)');
    grad.addColorStop(1, 'rgba(160, 230, 140, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(sx - R, sy - R, 2 * R, 2 * R);
    ctx.restore();
  }
  function drawChipInIndia(rotY, tilt) {
    var pts = [];
    ctx.save();
    ctx.beginPath();
    pathFeature(indiaFeature, rotY, tilt, pts);
    if (pts.length < 3) { ctx.restore(); return; }
    ctx.clip();
    var minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (var i = 0; i < pts.length; i++) {
      var p = pts[i];
      if (p[0] < minX) minX = p[0]; if (p[0] > maxX) maxX = p[0];
      if (p[1] < minY) minY = p[1]; if (p[1] > maxY) maxY = p[1];
    }
    var bw = maxX - minX, bh = maxY - minY;
    var pad = Math.max(bw, bh) * 0.18;
    ctx.globalAlpha = 0.55;
    ctx.drawImage(chipCanvas, minX - pad, minY - pad, bw + pad * 2, bh + pad * 2);
    ctx.globalAlpha = 1;
    ctx.restore();
  }

  function drawPolyline(pts, rotY, tilt, style, width) {
    ctx.strokeStyle = style;
    ctx.lineWidth = width * DPR;
    ctx.lineCap = 'round';
    ctx.beginPath();
    var lastVisible = false;
    for (var i = 0; i < pts.length; i++) {
      var p = project(pts[i][0], pts[i][1], rotY, tilt);
      var visible = p.z >= -0.02;
      if (visible) {
        var sx = cx + p.x * R, sy = cy - p.y * R;
        if (!lastVisible) ctx.moveTo(sx, sy); else ctx.lineTo(sx, sy);
      }
      lastVisible = visible;
    }
    ctx.stroke();
  }

  function drawLand(rotY, tilt) {
    ctx.save();
    ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.clip();
    // Global land wash (continuous landmass, no political borders)
    for (var i = 0; i < land.length; i++) drawFeatureFill(land[i], rotY, tilt, 'rgba(58, 92, 58, 0.55)');

    // India layered fill
    drawFeatureFill(indiaFeature, rotY, tilt, 'rgba(255, 140, 50, 0.45)'); // bright saffron base
    drawIndiaGradient(rotY, tilt);                                          // saffron→green vertical
    drawIndiaBorderWash(rotY, tilt);                                        // darker green at the edges
    drawNorthEastGreenWash(rotY, tilt);                                     // strong dark green N + NE
    drawSouthIndiaHighlight(rotY, tilt);                                    // Bengaluru bright halo
    drawChipInIndia(rotY, tilt);                                            // blurred silicon chip

    // Himalayas as a subtle ridge
    drawPolyline(HIMALAYAS, rotY, tilt, 'rgba(220, 230, 215, 0.55)', 1.4);
    var himShift = HIMALAYAS.map(function (p) { return [p[0], p[1] + 0.4]; });
    drawPolyline(himShift, rotY, tilt, 'rgba(200, 210, 195, 0.30)', 1.0);

    // White inner rim — soft accent inside the border
    ctx.save();
    ctx.beginPath();
    pathFeature(indiaFeature, rotY, tilt, null);
    ctx.clip();
    drawFeatureStroke(indiaFeature, rotY, tilt, 'rgba(255, 255, 255, 0.40)', 2.4);
    ctx.restore();
    // Crisp dark-green outline on top of everything
    drawFeatureStroke(indiaFeature, rotY, tilt, 'rgba(35, 100, 50, 0.95)', 1.2);
    ctx.restore();
  }

  function drawArcWithAlpha(from, to, rotY, tilt, t, r, g, b, alphaFn) {
    var v1 = lonLatToVec(from[0], from[1]);
    var v2 = lonLatToVec(to[0], to[1]);
    var dot = Math.max(-1, Math.min(1, v1[0] * v2[0] + v1[1] * v2[1] + v1[2] * v2[2]));
    var omega = Math.acos(dot);
    var sinO = Math.sin(omega) || 1e-6;
    var BULGE = 0.20, STEPS = 80;
    var maxI = Math.max(1, Math.floor(STEPS * t));
    var pts = new Array(maxI + 1);
    for (var i = 0; i <= maxI; i++) {
      var u = i / STEPS;
      var a = Math.sin((1 - u) * omega) / sinO;
      var c2 = Math.sin(u * omega) / sinO;
      var vx = a * v1[0] + c2 * v2[0];
      var vy = a * v1[1] + c2 * v2[1];
      var vz = a * v1[2] + c2 * v2[2];
      var bulge = 1 + BULGE * Math.sin(u * Math.PI);
      vx *= bulge; vy *= bulge; vz *= bulge;
      var p = transform(vx, vy, vz, rotY, tilt);
      var limb;
      if (p.z > 0.15) limb = 1;
      else if (p.z > -0.35) {
        var u2 = (p.z + 0.35) / 0.50;
        limb = u2 * u2 * (3 - 2 * u2);
      } else limb = 0;
      pts[i] = { x: cx + p.x * R, y: cy - p.y * R, a: limb * alphaFn(u) };
    }
    var BUCKETS = 8;
    var paths = new Array(BUCKETS);
    for (var s = 0; s < maxI; s++) {
      var A = pts[s], B = pts[s + 1];
      var segA = (A.a + B.a) * 0.5;
      if (segA < 0.02) continue;
      var idx = Math.min(BUCKETS - 1, Math.floor(segA * BUCKETS));
      if (!paths[idx]) paths[idx] = new Path2D();
      paths[idx].moveTo(A.x, A.y);
      paths[idx].lineTo(B.x, B.y);
    }
    ctx.lineCap = 'round';
    ctx.lineWidth = 1.4 * DPR;
    for (var bi = 0; bi < BUCKETS; bi++) {
      if (!paths[bi]) continue;
      var aOut = ((bi + 0.5) / BUCKETS);
      ctx.strokeStyle = 'rgba(' + r + ',' + g + ',' + b + ',' + aOut.toFixed(3) + ')';
      ctx.stroke(paths[bi]);
    }
  }

  function drawCity(lonlat, rotY, tilt, color, radiusPx) {
    var p = project(lonlat[0], lonlat[1], rotY, tilt);
    if (p.z < 0) return;
    var sx = cx + p.x * R, sy = cy - p.y * R;
    ctx.fillStyle = color;
    ctx.beginPath(); ctx.arc(sx, sy, radiusPx * DPR, 0, Math.PI * 2); ctx.fill();
  }
  function drawPulses(rotY, tilt, time) {
    var p = project(C.bengaluru[0], C.bengaluru[1], rotY, tilt);
    if (p.z < 0) return;
    var sx = cx + p.x * R, sy = cy - p.y * R;
    var PERIOD = 2800, N_RINGS = 3;
    for (var i = 0; i < N_RINGS; i++) {
      var phase = ((time + i * PERIOD / N_RINGS) % PERIOD) / PERIOD;
      var r = phase * R * 0.32;
      var alpha = (1 - phase) * 0.55;
      ctx.strokeStyle = 'rgba(170, 245, 170, ' + alpha + ')';
      ctx.lineWidth = 1.2 * DPR;
      ctx.beginPath(); ctx.arc(sx, sy, r, 0, Math.PI * 2); ctx.stroke();
    }
    ctx.fillStyle = 'rgba(210, 255, 210, 0.95)';
    ctx.beginPath(); ctx.arc(sx, sy, 3 * DPR, 0, Math.PI * 2); ctx.fill();
  }

  // ---- Visibility / pause ----
  var running = true;
  document.addEventListener('visibilitychange', function () {
    running = !document.hidden;
    if (running) requestAnimationFrame(frame);
  });

  // ---- Loop ----
  var t0 = performance.now();
  var ARC_PERIOD = 3400;
  var PULSE_SIGMA = 0.10;
  function frame(now) {
    if (!running) return;
    var dt = Math.min(50, now - t0); t0 = now;
    var k = 1 - Math.exp(-dt * 0.008);
    cursorX += (cursorTargetX - cursorX) * k;
    cursorY += (cursorTargetY - cursorY) * k;
    var speedScale = reduceMotion ? 0.25 : 1.0;
    baseRotY += dt * 0.00010 * speedScale;
    var rotY = baseRotY + cursorX * 0.35;
    var tilt = 0.22 + cursorY * 0.18;

    ctx.clearRect(0, 0, cw, ch);
    fillOcean();
    drawGraticule(rotY, tilt);
    drawLand(rotY, tilt);
    strokeSphere();

    // Persistent faint base arcs
    for (var j = 0; j < ARC_TARGETS.length; j++) {
      drawArcWithAlpha(C.bengaluru, C[ARC_TARGETS[j]], rotY, tilt, 1.0, 170, 235, 175, function () { return 0.22; });
    }
    // Animated pulses (skipped under reduce-motion)
    if (!reduceMotion) {
      for (var m = 0; m < ARC_TARGETS.length; m++) {
        var dest = C[ARC_TARGETS[m]];
        var phase = m * (ARC_PERIOD / ARC_TARGETS.length);
        var headT = ((now + phase) % ARC_PERIOD) / ARC_PERIOD;
        (function (h) {
          drawArcWithAlpha(C.bengaluru, dest, rotY, tilt, 1.0, 200, 255, 200, function (u) {
            var d = u - h;
            return Math.exp(-(d * d) / (PULSE_SIGMA * PULSE_SIGMA));
          });
        })(headT);
      }
    }

    for (var n = 0; n < ARC_TARGETS.length; n++) drawCity(C[ARC_TARGETS[n]], rotY, tilt, 'rgba(210, 255, 210, 0.9)', 3);
    drawPulses(rotY, tilt, now);

    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
