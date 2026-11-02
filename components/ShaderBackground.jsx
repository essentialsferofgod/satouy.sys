"use client";
import { useEffect, useRef } from "react";

const VERT = `attribute vec2 p; void main(){ gl_Position = vec4(p,0.,1.); }`;
const FRAG = `
precision mediump float;
uniform vec2 uRes; uniform float uTime; uniform vec2 uMouse;
float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453); }
float noise(vec2 p){
  vec2 i=floor(p), f=fract(p); f=f*f*(3.-2.*f);
  return mix(mix(hash(i),hash(i+vec2(1,0)),f.x), mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x), f.y);
}
float fbm(vec2 p){ float v=0., a=.5; for(int i=0;i<5;i++){ v+=a*noise(p); p*=2.02; a*=.5; } return v; }
void main(){
  vec2 uv = gl_FragCoord.xy / uRes.xy;
  vec2 p = (gl_FragCoord.xy - .5*uRes.xy) / uRes.y;
  vec2 m = (uMouse - .5*uRes.xy) / uRes.y;
  float t = uTime * .07;
  vec2 q = vec2(fbm(p*1.6 + t), fbm(p*1.6 - t + 4.));
  vec2 r = vec2(fbm(p*2.2 + 2.*q + vec2(1.7,9.2) + t*1.3), fbm(p*2.2 + 2.*q + vec2(8.3,2.8) - t));
  float f = fbm(p*1.4 + 2.5*r);
  float d = length(p - m);
  float glow = 1.0 - smoothstep(0.0, 0.55, d);
  f += glow * .35;
  vec3 c1 = vec3(.03,.03,.07);
  vec3 c2 = vec3(.32,.14,.55);
  vec3 c3 = vec3(.95,.55,.25);
  vec3 col = mix(c1, c2, smoothstep(.15,.75,f));
  col = mix(col, c3, smoothstep(.62,1.05,f) * .55);
  col += glow * vec3(.10,.06,.16);
  col *= 1. - .55 * length(uv-.5);
  gl_FragColor = vec4(col, 1.);
}`;

const FALLBACK = "radial-gradient(circle at 30% 20%, #3a1d63, #07070c 70%)";
const DEV = process.env.NODE_ENV !== "production";

export default function ShaderBackground() {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    const gl = canvas.getContext("webgl", { antialias: false, alpha: false });
    if (!gl || gl.isContextLost()) { canvas.style.background = FALLBACK; return; }

    const shaders = [];
    const sh = (type, src) => {
      const s = gl.createShader(type); shaders.push(s);
      gl.shaderSource(s, src); gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        if (DEV) console.warn("[ShaderBackground] falha ao compilar:", gl.getShaderInfoLog(s));
        return null;
      }
      return s;
    };
    const prog = gl.createProgram();
    let buf = null;

    // libera tudo o que foi criado na GPU
    const dispose = () => {
      if (buf) gl.deleteBuffer(buf);
      for (const s of gl.getAttachedShaders(prog) || []) gl.detachShader(prog, s);
      for (const s of shaders) if (s) gl.deleteShader(s);
      gl.deleteProgram(prog);
      // O contexto só é descartado se o canvas saiu mesmo da página: no StrictMode
      // o React remonta o efeito no mesmo canvas, e um contexto perdido ali não volta.
      setTimeout(() => { if (!canvas.isConnected) gl.getExtension("WEBGL_lose_context")?.loseContext(); }, 0);
    };
    // qualquer falha cai no fundo estático
    const fail = () => { dispose(); canvas.style.background = FALLBACK; };

    const vs = sh(gl.VERTEX_SHADER, VERT);
    const fs = sh(gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) { fail(); return; }
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      if (DEV) console.warn("[ShaderBackground] falha ao linkar:", gl.getProgramInfoLog(prog));
      fail(); return;
    }
    gl.useProgram(prog);

    buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 3,-1, -1,3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "p");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(prog, "uRes");
    const uTime = gl.getUniformLocation(prog, "uTime");
    const uMouse = gl.getUniformLocation(prog, "uMouse");

    const scale = 0.6; // renderiza em resolução menor: leve e com visual "suave"
    let w = 1, h = 1;
    const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
    const resize = () => {
      w = Math.max(1, Math.floor(window.innerWidth * scale));
      h = Math.max(1, Math.floor(window.innerHeight * scale));
      canvas.width = w; canvas.height = h;
      gl.viewport(0, 0, w, h);
      mouse.x = mouse.tx = w / 2; mouse.ty = mouse.y = h / 2;
    };
    const move = (e) => { mouse.tx = e.clientX * scale; mouse.ty = (window.innerHeight - e.clientY) * scale; };
    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", move);

    let raf, start = performance.now();
    let running = document.visibilityState === "visible";
    const frame = (now) => {
      if (!running) return;
      mouse.x += (mouse.tx - mouse.x) * 0.06;
      mouse.y += (mouse.ty - mouse.y) * 0.06;
      gl.uniform2f(uRes, w, h);
      gl.uniform1f(uTime, (now - start) / 1000);
      gl.uniform2f(uMouse, mouse.x, mouse.y);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    // aba oculta: para de desenhar
    const onVis = () => {
      running = document.visibilityState === "visible";
      if (running) raf = requestAnimationFrame(frame); else cancelAnimationFrame(raf);
    };
    document.addEventListener("visibilitychange", onVis);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", move);
      dispose();
    };
  }, []);

  return <canvas ref={ref} className="bg-canvas" aria-hidden="true" />;
}
