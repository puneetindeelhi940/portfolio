/* gate-fx.js — WebGL parallax particle field for index.html
   - Four depth layers, each with its own parallax response to the cursor
   - Particles drift autonomously; wrap at edges
   - Constellation lines fade in between particles near the cursor
   - Honours prefers-reduced-motion; pauses when tab hidden
   - Reads --signal from CSS so it tracks theme changes
*/
(function () {
  var canvas = document.getElementById('gate-fx');
  if (!canvas) return;

  var gl = canvas.getContext('webgl', { antialias: true, premultipliedAlpha: false, alpha: true });
  if (!gl) return; // leave the CSS gradient as the fallback

  var reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var DPR = Math.min(window.devicePixelRatio || 1, 2);

  // ---- particles ----
  var LAYERS = [
    { count: 110, sizeMin: 1.6, sizeMax: 3.0, parallax: 0.020, opacity: 0.55, drift: 0.0030 },
    { count: 70,  sizeMin: 2.4, sizeMax: 4.4, parallax: 0.050, opacity: 0.75, drift: 0.0055 },
    { count: 40,  sizeMin: 3.6, sizeMax: 6.5, parallax: 0.100, opacity: 0.90, drift: 0.0090 },
    { count: 16,  sizeMin: 5.5, sizeMax: 9.5, parallax: 0.180, opacity: 1.00, drift: 0.0135 }
  ];

  var particles = [];
  for (var l = 0; l < LAYERS.length; l++) {
    var L = LAYERS[l];
    for (var i = 0; i < L.count; i++) {
      var ang = Math.random() * Math.PI * 2;
      var speed = (0.5 + Math.random() * 0.7) * L.drift;
      particles.push({
        x: Math.random() * 2 - 1,
        y: Math.random() * 2 - 1,
        vx: Math.cos(ang) * speed,
        vy: Math.sin(ang) * speed,
        size: L.sizeMin + Math.random() * (L.sizeMax - L.sizeMin),
        parallax: L.parallax,
        opacity: L.opacity,
        layer: l
      });
    }
  }
  var N = particles.length;

  // Interleaved per-particle attribute buffer: [x, y, size, parallax, opacity]
  var POINT_STRIDE = 5;
  var pointData = new Float32Array(N * POINT_STRIDE);

  // Line buffer for constellations (positions + per-vertex alpha)
  // We size for worst-case but reupload only the active prefix each frame.
  var LINE_STRIDE = 3; // x, y, alpha
  var MAX_LINES = 600;
  var lineData = new Float32Array(MAX_LINES * 2 * LINE_STRIDE);
  var lineCount = 0;

  // ---- shaders ----
  function compile(type, src) {
    var s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      console.warn('gate-fx shader compile:', gl.getShaderInfoLog(s));
      gl.deleteShader(s);
      return null;
    }
    return s;
  }
  function link(vs, fs) {
    var p = gl.createProgram();
    gl.attachShader(p, vs); gl.attachShader(p, fs);
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
      console.warn('gate-fx link:', gl.getProgramInfoLog(p));
      return null;
    }
    return p;
  }

  var POINT_VS =
    'attribute vec2 a_pos;' +
    'attribute float a_size;' +
    'attribute float a_parallax;' +
    'attribute float a_opacity;' +
    'uniform vec2 u_mouse;' +
    'uniform float u_dpr;' +
    'uniform float u_heightRef;' +
    'varying float v_opacity;' +
    'void main(){' +
    '  vec2 p = a_pos + u_mouse * a_parallax;' +
    '  gl_Position = vec4(p, 0.0, 1.0);' +
    '  gl_PointSize = a_size * u_dpr * u_heightRef;' +
    '  v_opacity = a_opacity;' +
    '}';

  var POINT_FS =
    'precision mediump float;' +
    'uniform vec3 u_color;' +
    'varying float v_opacity;' +
    'void main(){' +
    '  vec2 c = gl_PointCoord - vec2(0.5);' +
    '  float d = length(c) * 2.0;' +
    // soft disk with halo: bright core, falls off to halo, then zero
    '  float core = smoothstep(1.0, 0.25, d);' +
    '  float halo = smoothstep(1.0, 0.7, d) * 0.35;' +
    '  float a = (core + halo) * v_opacity;' +
    '  gl_FragColor = vec4(u_color, a);' +
    '}';

  var LINE_VS =
    'attribute vec2 a_pos;' +
    'attribute float a_alpha;' +
    'varying float v_alpha;' +
    'void main(){' +
    '  gl_Position = vec4(a_pos, 0.0, 1.0);' +
    '  v_alpha = a_alpha;' +
    '}';

  var LINE_FS =
    'precision mediump float;' +
    'uniform vec3 u_color;' +
    'varying float v_alpha;' +
    'void main(){' +
    '  gl_FragColor = vec4(u_color, v_alpha);' +
    '}';

  var pointProg = link(compile(gl.VERTEX_SHADER, POINT_VS), compile(gl.FRAGMENT_SHADER, POINT_FS));
  var lineProg  = link(compile(gl.VERTEX_SHADER, LINE_VS),  compile(gl.FRAGMENT_SHADER, LINE_FS));
  if (!pointProg || !lineProg) return;

  // attribute locations
  var pA = {
    pos:     gl.getAttribLocation(pointProg, 'a_pos'),
    size:    gl.getAttribLocation(pointProg, 'a_size'),
    parallax:gl.getAttribLocation(pointProg, 'a_parallax'),
    opacity: gl.getAttribLocation(pointProg, 'a_opacity')
  };
  var pU = {
    mouse:     gl.getUniformLocation(pointProg, 'u_mouse'),
    color:     gl.getUniformLocation(pointProg, 'u_color'),
    dpr:       gl.getUniformLocation(pointProg, 'u_dpr'),
    heightRef: gl.getUniformLocation(pointProg, 'u_heightRef')
  };
  var lA = {
    pos:   gl.getAttribLocation(lineProg, 'a_pos'),
    alpha: gl.getAttribLocation(lineProg, 'a_alpha')
  };
  var lU = {
    color: gl.getUniformLocation(lineProg, 'u_color')
  };

  var pointBuf = gl.createBuffer();
  var lineBuf  = gl.createBuffer();

  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  // ---- theme color (live) ----
  // Use a 2D canvas to convert whatever the browser returns (rgb, oklch, hsl...)
  // into clean RGB bytes.
  var probe = document.createElement('span');
  probe.style.cssText = 'position:absolute;left:-9999px;color:var(--signal);';
  document.body.appendChild(probe);
  var colorCanvas = document.createElement('canvas');
  colorCanvas.width = colorCanvas.height = 1;
  var colorCtx = colorCanvas.getContext('2d');
  var signalRGB = [0.9, 0.7, 0.3]; // sensible fallback (warm amber)
  function refreshColor() {
    try {
      var c = getComputedStyle(probe).color;
      colorCtx.clearRect(0, 0, 1, 1);
      colorCtx.fillStyle = c;
      colorCtx.fillRect(0, 0, 1, 1);
      var d = colorCtx.getImageData(0, 0, 1, 1).data;
      if (d[3] > 0) {
        signalRGB = [d[0] / 255, d[1] / 255, d[2] / 255];
      }
    } catch (e) { /* keep fallback */ }
  }
  refreshColor();
  // Watch theme changes
  new MutationObserver(refreshColor).observe(document.documentElement, {
    attributes: true, attributeFilter: ['data-theme']
  });

  // ---- size / resize ----
  var W = 0, H = 0, aspect = 1;
  function resize() {
    var r = canvas.getBoundingClientRect();
    W = Math.max(1, Math.floor(r.width * DPR));
    H = Math.max(1, Math.floor(r.height * DPR));
    canvas.width = W;
    canvas.height = H;
    aspect = r.width / Math.max(1, r.height);
    gl.viewport(0, 0, W, H);
  }
  resize();
  window.addEventListener('resize', resize, { passive: true });

  // ---- mouse ----
  var mouseX = 0, mouseY = 0;       // current normalized [-1, 1]
  var mouseTX = 0, mouseTY = 0;     // smoothed
  var mouseInside = false;
  window.addEventListener('pointermove', function (e) {
    var r = canvas.getBoundingClientRect();
    mouseX = ((e.clientX - r.left) / r.width) * 2 - 1;
    mouseY = -(((e.clientY - r.top) / r.height) * 2 - 1);
    mouseInside = true;
  }, { passive: true });
  window.addEventListener('pointerleave', function () { mouseInside = false; });

  // ---- visibility / pause ----
  var running = true;
  document.addEventListener('visibilitychange', function () {
    running = !document.hidden;
    if (running) requestAnimationFrame(frame);
  });

  // ---- update + render ----
  var lastT = performance.now();
  function update(dt) {
    // smooth mouse toward target (decays back toward 0 when leaving)
    var tx = mouseInside ? mouseX : 0;
    var ty = mouseInside ? mouseY : 0;
    var k = 1 - Math.exp(-dt * 0.012);
    mouseTX += (tx - mouseTX) * k;
    mouseTY += (ty - mouseTY) * k;

    var speedScale = reduceMotion ? 0.25 : 1.0;

    for (var i = 0; i < N; i++) {
      var p = particles[i];
      p.x += p.vx * dt * 0.06 * speedScale;
      p.y += p.vy * dt * 0.06 * speedScale;
      // wrap
      if (p.x > 1.1) p.x = -1.1;
      else if (p.x < -1.1) p.x = 1.1;
      if (p.y > 1.1) p.y = -1.1;
      else if (p.y < -1.1) p.y = 1.1;

      var o = i * POINT_STRIDE;
      pointData[o    ] = p.x;
      pointData[o + 1] = p.y;
      pointData[o + 2] = p.size;
      pointData[o + 3] = p.parallax;
      pointData[o + 4] = p.opacity;
    }
  }

  // Build constellation lines near the cursor each frame
  function buildLines() {
    lineCount = 0;
    if (!mouseInside && Math.abs(mouseTX) < 0.02 && Math.abs(mouseTY) < 0.02) return;

    // mouse position in same parallax-aware space — use the layer 2 parallax
    // (we only render lines between particles "around" the cursor, so absolute
    // mouse position is fine)
    var mx = mouseTX, my = mouseTY;

    // Square radius cutoffs (in NDC, aspect-corrected via per-axis scaling)
    var CURSOR_R = 0.55;
    var LINK_D = 0.22;
    // Aspect correction so circles look round on wide screens
    // (work in NDC-y units: scale x by aspect so 1 unit ≈ same pixel dist)
    var ax = 1, ay = 1;
    if (aspect > 1) ax = aspect; else ay = 1 / aspect;

    // Gather "lit" particles near cursor
    var lit = [];
    for (var i = 0; i < N; i++) {
      var p = particles[i];
      // particle on-screen position (includes parallax for accurate proximity)
      var px = p.x + mouseTX * p.parallax;
      var py = p.y + mouseTY * p.parallax;
      var dx = (px - mx) * ax;
      var dy = (py - my) * ay;
      var d2 = dx * dx + dy * dy;
      if (d2 < CURSOR_R * CURSOR_R) {
        // store with screen-space position used for line endpoints
        lit.push({ x: px, y: py, d2: d2 });
      }
    }

    var R2 = CURSOR_R * CURSOR_R;
    var L2 = LINK_D * LINK_D;
    // Pair them
    for (var a = 0; a < lit.length && lineCount < MAX_LINES; a++) {
      for (var b = a + 1; b < lit.length && lineCount < MAX_LINES; b++) {
        var dx2 = (lit[a].x - lit[b].x) * ax;
        var dy2 = (lit[a].y - lit[b].y) * ay;
        var dd = dx2 * dx2 + dy2 * dy2;
        if (dd < L2) {
          // alpha fades with: (1) link distance, (2) cursor proximity of both endpoints
          var linkF = 1 - Math.sqrt(dd / L2);
          var ca = 1 - Math.sqrt(lit[a].d2 / R2);
          var cb = 1 - Math.sqrt(lit[b].d2 / R2);
          var alpha = linkF * Math.min(ca, cb) * 0.85;
          if (alpha < 0.01) continue;

          var o = lineCount * 2 * LINE_STRIDE;
          lineData[o    ] = lit[a].x;
          lineData[o + 1] = lit[a].y;
          lineData[o + 2] = alpha;
          lineData[o + 3] = lit[b].x;
          lineData[o + 4] = lit[b].y;
          lineData[o + 5] = alpha;
          lineCount++;
        }
      }
    }
  }

  function render() {
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // ---- lines ----
    if (lineCount > 0) {
      gl.useProgram(lineProg);
      gl.bindBuffer(gl.ARRAY_BUFFER, lineBuf);
      gl.bufferData(gl.ARRAY_BUFFER, lineData.subarray(0, lineCount * 2 * LINE_STRIDE), gl.DYNAMIC_DRAW);
      var stride = LINE_STRIDE * 4;
      gl.enableVertexAttribArray(lA.pos);
      gl.vertexAttribPointer(lA.pos, 2, gl.FLOAT, false, stride, 0);
      gl.enableVertexAttribArray(lA.alpha);
      gl.vertexAttribPointer(lA.alpha, 1, gl.FLOAT, false, stride, 2 * 4);
      gl.uniform3fv(lU.color, signalRGB);
      gl.drawArrays(gl.LINES, 0, lineCount * 2);
    }

    // ---- points ----
    gl.useProgram(pointProg);
    gl.bindBuffer(gl.ARRAY_BUFFER, pointBuf);
    gl.bufferData(gl.ARRAY_BUFFER, pointData, gl.DYNAMIC_DRAW);
    var s = POINT_STRIDE * 4;
    gl.enableVertexAttribArray(pA.pos);
    gl.vertexAttribPointer(pA.pos, 2, gl.FLOAT, false, s, 0);
    gl.enableVertexAttribArray(pA.size);
    gl.vertexAttribPointer(pA.size, 1, gl.FLOAT, false, s, 2 * 4);
    gl.enableVertexAttribArray(pA.parallax);
    gl.vertexAttribPointer(pA.parallax, 1, gl.FLOAT, false, s, 3 * 4);
    gl.enableVertexAttribArray(pA.opacity);
    gl.vertexAttribPointer(pA.opacity, 1, gl.FLOAT, false, s, 4 * 4);
    gl.uniform2f(pU.mouse, mouseTX, mouseTY);
    gl.uniform3fv(pU.color, signalRGB);
    gl.uniform1f(pU.dpr, DPR);
    // size scales gently with viewport height so dots look right at any size
    gl.uniform1f(pU.heightRef, Math.max(0.6, Math.min(1.4, (canvas.clientHeight || 800) / 800)));
    gl.drawArrays(gl.POINTS, 0, N);
  }

  function frame(t) {
    if (!running) return;
    var dt = Math.min(50, t - lastT);
    lastT = t;
    update(dt);
    buildLines();
    render();
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(function (t) { lastT = t; frame(t); });
})();
