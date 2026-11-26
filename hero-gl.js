/* Hero background — "ember trail".
   The original Figma artwork (fire streaks) sits dim at 25%, exactly like the static design,
   breathing with a faint heat haze. The pointer leaves a fading trail that reveals the streaks
   at full colour, refracting and smearing them like heat. When idle, a slow ghost ember drifts
   across the right side. Without WebGL / with reduced motion the static image remains. */
(() => {
  'use strict';
  const canvas = document.querySelector('.hero-gl');
  const hero = document.querySelector('.hero');
  if (!canvas || !hero) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const gl = canvas.getContext('webgl', { antialias: false, alpha: false, depth: false, stencil: false, premultipliedAlpha: false, powerPreference: 'high-performance' });
  if (!gl) return;

  const vert = 'attribute vec2 p; varying vec2 vUv; void main(){ vUv = p * .5 + .5; gl_Position = vec4(p, 0., 1.); }';
  const common = `
precision highp float;
varying vec2 vUv;
float hash2(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p){
  vec2 i = floor(p), f = fract(p); vec2 u = f * f * (3. - 2. * f);
  return mix(mix(hash2(i), hash2(i + vec2(1., 0.)), u.x), mix(hash2(i + vec2(0., 1.)), hash2(i + vec2(1., 1.)), u.x), u.y);
}`;
  // Pass 1: trail buffer (fades, drifts upward like warm air, paints a soft stroke along the pointer path)
  const trailFrag = common + `
uniform sampler2D uPrev;
uniform vec2 uA; uniform vec2 uB; uniform float uForce; uniform float uAsp; uniform float uTime;
float seg(vec2 p, vec2 a, vec2 b){ vec2 pa = p - a, ba = b - a; float h = clamp(dot(pa, ba) / max(dot(ba, ba), 1e-6), 0., 1.); return length(pa - ba * h); }
void main(){
  vec2 uv = vUv;
  vec2 drift = vec2(0., .0011) + (vec2(noise(uv * 5. + uTime * .25), noise(uv * 5. + 9.1 - uTime * .25)) - .5) * .0028;
  float prev = texture2D(uPrev, uv - drift).r;
  prev = max(prev * .982 - .0022, 0.);
  vec2 p = vec2(uv.x * uAsp, uv.y);
  float d = seg(p, vec2(uA.x * uAsp, uA.y), vec2(uB.x * uAsp, uB.y));
  float splat = exp(-d * d / .0045) * uForce;
  gl_FragColor = vec4(min(prev + splat, 1.), 0., 0., 1.);
}`;
  // Pass 2: composite
  const mainFrag = common + `
uniform sampler2D uImg; uniform sampler2D uTrail;
uniform vec2 uRes; uniform vec2 uImgRes; uniform vec4 uBox; uniform vec2 uTexel;
uniform float uTime; uniform float uIntro;
vec2 cover(vec2 uv){
  vec2 s = vec2(uv.x, 1. - uv.y);              // top-down, like CSS
  vec2 bu = (s - uBox.xy) / uBox.zw;           // position inside the CSS image box
  float boxAsp = (uBox.z * uRes.x) / (uBox.w * uRes.y);
  float imgAsp = uImgRes.x / uImgRes.y;
  vec2 sc = boxAsp > imgAsp ? vec2(1., imgAsp / boxAsp) : vec2(boxAsp / imgAsp, 1.);
  return (bu - .5) * sc + .5;
}
void main(){
  vec2 uv = vUv;
  float tr = texture2D(uTrail, uv).r;
  float glow = smoothstep(0., .85, tr);
  float gx = texture2D(uTrail, uv + vec2(uTexel.x, 0.)).r - texture2D(uTrail, uv - vec2(uTexel.x, 0.)).r;
  float gy = texture2D(uTrail, uv + vec2(0., uTexel.y)).r - texture2D(uTrail, uv - vec2(0., uTexel.y)).r;
  // ambient heat haze: the streaks shimmer sideways a little
  float haze = (noise(vec2(uv.y * 26., uTime * .32)) - .5) * .006 + (noise(vec2(uv.y * 6., uTime * .12)) - .5) * .012;
  // inside the trail: refraction + streak smear
  float smear = (noise(vec2(uv.y * 38., uTime * 1.1)) - .5) * .045 * glow;
  vec2 duv = uv + vec2(haze + smear, 0.) - vec2(gx, gy) * .05;
  float ca = .005 * glow;
  vec3 img;
  img.r = texture2D(uImg, cover(duv + vec2(ca, 0.))).r;
  img.g = texture2D(uImg, cover(duv)).g;
  img.b = texture2D(uImg, cover(duv - vec2(ca, 0.))).b;
  float base = .25 + .03 * sin(uTime * .55);
  vec3 col = img * (base + .9 * glow);
  // the trail carries its own ember light, streaked like the blinds in the artwork
  float stripe = .35 + .65 * smoothstep(.25, .85, noise(vec2(uv.x * 2.2 - uTime * .08, uv.y * 58.)));
  vec3 ember = mix(vec3(.30, .025, .05), vec3(1., .30, .05), smoothstep(.05, .55, tr));
  ember = mix(ember, vec3(1., .72, .30), smoothstep(.6, 1., tr));
  col += ember * stripe * glow * .72;
  col *= uIntro;
  gl_FragColor = vec4(col, 1.);
}`;

  function compile(type, src) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src); gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { console.warn(gl.getShaderInfoLog(s)); return null; }
    return s;
  }
  function program(fragSrc) {
    const vs = compile(gl.VERTEX_SHADER, vert), fs = compile(gl.FRAGMENT_SHADER, fragSrc);
    if (!vs || !fs) return null;
    const pr = gl.createProgram();
    gl.attachShader(pr, vs); gl.attachShader(pr, fs);
    gl.bindAttribLocation(pr, 0, 'p');
    gl.linkProgram(pr);
    return gl.getProgramParameter(pr, gl.LINK_STATUS) ? pr : null;
  }
  const trailProg = program(trailFrag), mainProg = program(mainFrag);
  if (!trailProg || !mainProg) return;
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
  const uniforms = (pr, names) => Object.fromEntries(names.map(n => [n, gl.getUniformLocation(pr, n)]));
  const tu = uniforms(trailProg, ['uPrev', 'uA', 'uB', 'uForce', 'uAsp', 'uTime']);
  const mu = uniforms(mainProg, ['uImg', 'uTrail', 'uRes', 'uImgRes', 'uBox', 'uTexel', 'uTime', 'uIntro']);

  function texture(w, h) {
    const t = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    if (w) gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    return t;
  }
  let targets = [];
  let trailW = 2, trailH = 2;
  function makeTargets() {
    targets.forEach(t => { gl.deleteTexture(t.tex); gl.deleteFramebuffer(t.fb); });
    targets = [0, 1].map(() => {
      const tex = texture(trailW, trailH);
      const fb = gl.createFramebuffer();
      gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
      gl.clearColor(0, 0, 0, 1); gl.clear(gl.COLOR_BUFFER_BIT);
      return { tex, fb };
    });
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }

  const coarse = window.matchMedia('(pointer: coarse)').matches;
  function resize() {
    const r = hero.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const scale = coarse ? .55 : .75;
    canvas.width = Math.max(2, Math.round(r.width * dpr * scale));
    canvas.height = Math.max(2, Math.round(r.height * dpr * scale));
    trailW = Math.max(2, Math.round(r.width / 4));
    trailH = Math.max(2, Math.round(r.height / 4));
    makeTargets();
  }

  // pointer state in GL space (0–1, origin bottom-left)
  const start = performance.now();
  const ptr = { x: .7, y: .6 }, prevPtr = { x: .7, y: .6 };
  let lastMove = -10, moving = false, ghostOn = true;
  const local = e => { const r = hero.getBoundingClientRect(); return { x: (e.clientX - r.left) / r.width, y: 1 - (e.clientY - r.top) / r.height }; };
  hero.addEventListener('pointermove', e => { const l = local(e); ptr.x = l.x; ptr.y = l.y; lastMove = (performance.now() - start) / 1000; moving = true; ghostOn = false; }, { passive: true });

  const img = new Image();
  img.decoding = 'async';
  img.src = document.querySelector('.hero-fallback')?.currentSrc || 'assets/background.webp';
  let imgTex = null, imgW = 1, imgH = 1;
  img.onload = () => {
    try {
      imgTex = texture(0, 0);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
      imgW = img.naturalWidth; imgH = img.naturalHeight;
    } catch (err) { console.warn('Hero background could not load into WebGL; keeping the static image.', err); return; }
    resize();
    window.addEventListener('resize', resize);
    document.documentElement.classList.add('has-gl');
    loop();
  };

  let visible = true, running = false, read = 0, prev = performance.now();
  new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; if (visible) loop(); }).observe(hero);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) loop(); });

  function frame(now) {
    const dt = Math.min((now - prev) / 1000, .05); prev = now;
    const t = (now - start) / 1000;
    let force;
    if (t - lastMove > 2.2) ghostOn = true;
    if (ghostOn) {
      // slow ghost ember over the right half, away from the headline
      prevPtr.x = ptr.x; prevPtr.y = ptr.y;
      const g = { x: .7 + .2 * Math.sin(t * .27) + .06 * Math.sin(t * .71), y: .58 + .26 * Math.sin(t * .39 + 1.2) };
      ptr.x += (g.x - ptr.x) * Math.min(1, dt * 1.5); ptr.y += (g.y - ptr.y) * Math.min(1, dt * 1.5);
      force = .05;
    } else {
      const speed = Math.hypot(ptr.x - prevPtr.x, ptr.y - prevPtr.y) / Math.max(dt, .001);
      force = moving ? Math.min(.6, .07 + speed * .5) : 0;
      moving = false;
    }
    const w = targets[read], wTarget = targets[1 - read];
    // pass 1 → trail
    gl.bindFramebuffer(gl.FRAMEBUFFER, wTarget.fb);
    gl.viewport(0, 0, trailW, trailH);
    gl.useProgram(trailProg);
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, w.tex);
    gl.uniform1i(tu.uPrev, 0);
    gl.uniform2f(tu.uA, prevPtr.x, prevPtr.y);
    gl.uniform2f(tu.uB, ptr.x, ptr.y);
    gl.uniform1f(tu.uForce, force * Math.min(1, dt * 60));
    gl.uniform1f(tu.uAsp, trailW / trailH);
    gl.uniform1f(tu.uTime, t);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    read = 1 - read;
    prevPtr.x = ptr.x; prevPtr.y = ptr.y;
    // pass 2 → screen
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.useProgram(mainProg);
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, imgTex);
    gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, targets[read].tex);
    gl.uniform1i(mu.uImg, 0); gl.uniform1i(mu.uTrail, 1);
    gl.uniform2f(mu.uRes, canvas.width, canvas.height);
    gl.uniform2f(mu.uImgRes, imgW, imgH);
    // same box the CSS gives the static image (see hero.css)
    if (window.innerWidth <= 650) gl.uniform4f(mu.uBox, -.65, 0, 2.1, 1);
    else gl.uniform4f(mu.uBox, -.109, -.0283, 1.16667, 1.0283);
    gl.uniform2f(mu.uTexel, 1 / trailW, 1 / trailH);
    gl.uniform1f(mu.uTime, t);
    const k = Math.min(1, t / 1.6);
    gl.uniform1f(mu.uIntro, k * k * (3 - 2 * k));
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }
  function loop() {
    if (running || !imgTex) return;
    running = true;
    prev = performance.now();
    const tick = now => {
      if (!visible || document.hidden) { running = false; return; }
      frame(now);
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }
})();
