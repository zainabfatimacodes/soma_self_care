/* SOMA — WebGL flowing-gradient hero (no libraries). Colours come from CSS --g1..--g4 so it follows light/dark and each page. */
(() => {
  const cv = document.getElementById('gl');
  if (!cv) return;
  const gl = cv.getContext('webgl', { antialias: false, alpha: false });
  if (!gl) return; // CSS gradient on .stage is the fallback
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const vs = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
  const fs = `precision highp float;uniform vec2 r;uniform float t;uniform vec3 c1,c2,c3,c4;
float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1.,0.)),f.x),mix(h(i+vec2(0.,1.)),h(i+vec2(1.,1.)),f.x),f.y);}
float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<4;i++){v+=a*n(p);p=p*2.+7.;a*=.5;}return v;}
void main(){
  vec2 uv=gl_FragCoord.xy/r; vec2 p=uv*vec2(r.x/r.y,1.)*1.5; float tt=t*.05;
  vec2 q=vec2(fbm(p+tt),fbm(p+vec2(5.2,1.3)-tt));
  vec2 w=vec2(fbm(p+3.*q+vec2(1.7,9.2)+tt*1.4),fbm(p+3.*q+vec2(8.3,2.8)-tt));
  float f=fbm(p+3.*w);
  vec3 col=mix(c1,c2,smoothstep(.15,.85,f));
  col=mix(col,c3,smoothstep(.35,1.05,length(q))*.95);
  col=mix(col,c4,smoothstep(.5,.95,w.x)*.85);
  col+=(h(gl_FragCoord.xy+fract(t))-.5)*.05;
  gl_FragColor=vec4(col,1.);}`;
  const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s; };
  const pr = gl.createProgram();
  gl.attachShader(pr, sh(gl.VERTEX_SHADER, vs)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, fs));
  gl.linkProgram(pr);
  if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) return;
  gl.useProgram(pr);
  const b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(pr, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const U = n => gl.getUniformLocation(pr, n);
  const uR = U('r'), uT = U('t'), uC = [U('c1'), U('c2'), U('c3'), U('c4')];

  const hex = s => { s = s.trim(); if (s[0] === '#') { if (s.length === 4) s = '#' + [...s.slice(1)].map(c => c + c).join(''); const n = parseInt(s.slice(1), 16); return [(n >> 16 & 255) / 255, (n >> 8 & 255) / 255, (n & 255) / 255]; } const m = s.match(/\d+/g) || [0, 0, 0]; return m.slice(0, 3).map(v => v / 255); };
  const setColors = () => { const cs = getComputedStyle(cv.parentNode); ['--g1', '--g2', '--g3', '--g4'].forEach((v, i) => gl.uniform3fv(uC[i], hex(cs.getPropertyValue(v)))); };
  const size = () => { const d = Math.min(devicePixelRatio || 1, 1.5), w = cv.clientWidth, h = cv.clientHeight; cv.width = w * d * .6; cv.height = h * d * .6; gl.viewport(0, 0, cv.width, cv.height); gl.uniform2f(uR, cv.width, cv.height); };
  let vis = true, t0 = performance.now(), raf;
  const draw = now => { gl.uniform1f(uT, ((now || performance.now()) - t0) / 1000 + 20); gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4); };
  const loop = now => { if (vis) draw(now); raf = requestAnimationFrame(loop); };
  setColors(); size(); draw();
  addEventListener('resize', () => { size(); draw(); });
  addEventListener('themechange', () => { setColors(); draw(); });
  if (!reduce) {
    new IntersectionObserver(e => vis = e[0].isIntersecting).observe(cv);
    raf = requestAnimationFrame(loop);
  }
})();
