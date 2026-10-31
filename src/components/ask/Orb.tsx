"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "../../lib/use-reduced-motion";

export type OrbState = "idle" | "thinking" | "speaking";

const VERT = `attribute vec2 p; void main(){ gl_Position = vec4(p, 0.0, 1.0); }`;

// A fluid sphere: domain-warped noise tinted with the site's flag colours, a fresnel rim and a soft
// specular. uEnergy swells the warp and the radius; uSpeed drives how fast the fluid moves.
const FRAG = `
precision highp float;
uniform vec2 uRes;
uniform float uTime;
uniform float uEnergy;
uniform vec3 uC1; uniform vec3 uC2; uniform vec3 uC3; uniform vec3 uC4; uniform vec3 uC5;

float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p){
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}
float fbm(vec2 p){
  float v = 0.0, a = 0.5;
  mat2 r = mat2(0.8, -0.6, 0.6, 0.8);
  for (int i = 0; i < 3; i++){ v += a * noise(p); p = r * p * 2.03 + 11.7; a *= 0.5; }
  return v;
}
vec3 palette(float t){
  t = fract(t) * 5.0;
  vec3 c = mix(uC1, uC2, smoothstep(0.0, 1.0, t));
  c = mix(c, uC3, smoothstep(1.0, 2.0, t));
  c = mix(c, uC4, smoothstep(2.0, 3.0, t));
  c = mix(c, uC5, smoothstep(3.0, 4.0, t));
  c = mix(c, uC1, smoothstep(4.0, 5.0, t));
  return c;
}
void main(){
  vec2 uv = (gl_FragCoord.xy * 2.0 - uRes) / min(uRes.x, uRes.y);
  float swell = 1.0 + uEnergy * 0.07;
  float d = length(uv) / swell;
  float mask = 1.0 - smoothstep(0.965, 1.0, d);
  if (mask <= 0.001) { gl_FragColor = vec4(0.0); return; }

  float z = sqrt(max(0.0, 1.0 - d * d));
  vec3 n = vec3(uv / swell, z);
  float t = uTime;
  vec2 q = n.xy * (0.8 + uEnergy * 0.25);
  vec2 w = vec2(fbm(q + vec2(0.0, t * 0.55)), fbm(q + vec2(5.2, 1.3) - t * 0.45));
  float f = fbm(q + (1.4 + uEnergy * 0.8) * w + t * 0.1);

  // Slow, heavily smoothed colour fields: the palette drifts across a low-frequency warp, and a soft core
  // glows from inside.
  float flow = f * 1.5 + w.x * 0.55 + t * 0.04;
  vec3 col = palette(flow);
  col = mix(col, palette(flow * 0.7 + 0.35 + w.y * 0.4), 0.5);
  // Wide, soft light bands rather than thin contours: nothing inside the orb should have a hard edge.
  float bands = 0.5 + 0.5 * sin(f * 4.0 + t * 0.35 + w.y * 1.6);
  col += bands * 0.05;

  vec3 light = normalize(vec3(-0.45, 0.6, 0.7));
  float ndl = clamp(dot(normalize(n), light), 0.0, 1.0);
  col *= 0.8 + 0.42 * ndl;
  float core = pow(z, 3.0);
  col = mix(col, vec3(1.0), core * (0.07 + uEnergy * 0.1));

  float fres = pow(1.0 - z, 2.4);
  col += fres * mix(vec3(1.0), palette(t * 0.05 + 0.2), 0.55) * (0.6 + uEnergy * 0.5);
  col += pow(ndl, 24.0) * 0.45;

  gl_FragColor = vec4(col * mask, mask);
}`;

const FLAG_VARS = ["--flag-amber", "--flag-pink", "--flag-violet", "--flag-blue", "--flag-teal"] as const;
const FALLBACK = ["#f5a524", "#ee5c96", "#a98cf5", "#4aa3ff", "#3cc8b4"];

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.trim().replace("#", "");
  const full = h.length === 3 ? h.replace(/./g, (c) => c + c) : h;
  const n = parseInt(full, 16);
  return Number.isNaN(n) ? [1, 1, 1] : [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

const TARGETS: Record<OrbState, { speed: number; energy: number }> = {
  idle: { speed: 0.18, energy: 0.08 },
  thinking: { speed: 0.9, energy: 0.4 },
  speaking: { speed: 0.5, energy: 0.28 },
};

export function Orb({ state }: { state: OrbState }) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const stateRef = useRef<OrbState>(state);
  const [gl, setGl] = useState<"pending" | "ready" | "none">("pending");
  const reduced = useReducedMotion();

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const ctx = canvas.getContext("webgl", { alpha: true, antialias: true, premultipliedAlpha: true, powerPreference: "low-power" });
    if (!ctx) {
      setGl("none");
      return;
    }
    const g: WebGLRenderingContext = ctx;

    function compile(type: number, src: string) {
      const s = g.createShader(type);
      if (!s) return null;
      g.shaderSource(s, src);
      g.compileShader(s);
      return g.getShaderParameter(s, g.COMPILE_STATUS) ? s : null;
    }
    const vs = compile(g.VERTEX_SHADER, VERT);
    const fs = compile(g.FRAGMENT_SHADER, FRAG);
    const program = g.createProgram();
    if (!vs || !fs || !program) {
      setGl("none");
      return;
    }
    g.attachShader(program, vs);
    g.attachShader(program, fs);
    g.linkProgram(program);
    if (!g.getProgramParameter(program, g.LINK_STATUS)) {
      setGl("none");
      return;
    }
    g.useProgram(program);

    const buffer = g.createBuffer();
    g.bindBuffer(g.ARRAY_BUFFER, buffer);
    g.bufferData(g.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), g.STATIC_DRAW);
    const loc = g.getAttribLocation(program, "p");
    g.enableVertexAttribArray(loc);
    g.vertexAttribPointer(loc, 2, g.FLOAT, false, 0, 0);

    const u = {
      res: g.getUniformLocation(program, "uRes"),
      time: g.getUniformLocation(program, "uTime"),
      energy: g.getUniformLocation(program, "uEnergy"),
    };
    const styles = getComputedStyle(document.documentElement);
    FLAG_VARS.forEach((name, i) => {
      const [r, gr, b] = hexToRgb(styles.getPropertyValue(name) || FALLBACK[i]);
      g.uniform3f(g.getUniformLocation(program, `uC${i + 1}`), r, gr, b);
    });
    g.clearColor(0, 0, 0, 0);

    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    function resize() {
      const w = Math.max(2, Math.round(canvas!.clientWidth * dpr));
      const h = Math.max(2, Math.round(canvas!.clientHeight * dpr));
      if (canvas!.width !== w || canvas!.height !== h) {
        canvas!.width = w;
        canvas!.height = h;
      }
      g.viewport(0, 0, w, h);
    }

    let time = 3 + Math.random() * 20;
    let speed: number = TARGETS.idle.speed;
    let energy: number = TARGETS.idle.energy;
    let last = performance.now();
    let raf = 0;
    let visible = true;

    function draw(now: number, animate: boolean) {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (animate) {
        const target = TARGETS[stateRef.current];
        const k = 1 - Math.exp(-dt * 3.2);
        speed += (target.speed - speed) * k;
        // Speaking pulses like a voice: two slow beats multiplied together.
        const pulse = stateRef.current === "speaking" ? 0.4 * Math.abs(Math.sin(time * 5.1)) * Math.abs(Math.sin(time * 2.3 + 1)) : 0;
        energy += (target.energy + pulse - energy) * (1 - Math.exp(-dt * 7));
        time += dt * speed;
      }
      resize();
      g.clear(g.COLOR_BUFFER_BIT);
      g.uniform2f(u.res, canvas!.width, canvas!.height);
      g.uniform1f(u.time, time);
      g.uniform1f(u.energy, energy);
      g.drawArrays(g.TRIANGLES, 0, 3);
    }

    function frame(now: number) {
      raf = 0;
      if (!visible || document.hidden) return;
      draw(now, true);
      raf = requestAnimationFrame(frame);
    }
    function start() {
      if (reduceMotion || raf || !visible || document.hidden) return;
      last = performance.now();
      raf = requestAnimationFrame(frame);
    }

    draw(performance.now(), false);
    setGl("ready");
    if (!reduceMotion) start();

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) start();
    });
    io.observe(wrap);
    const onVisibility = () => (document.hidden ? undefined : start());
    document.addEventListener("visibilitychange", onVisibility);
    const ro = new ResizeObserver(() => draw(performance.now(), false));
    ro.observe(canvas);
    const onLost = (e: Event) => {
      e.preventDefault();
      cancelAnimationFrame(raf);
      raf = 0;
      setGl("none");
    };
    canvas.addEventListener("webglcontextlost", onLost);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      canvas.removeEventListener("webglcontextlost", onLost);
      g.deleteProgram(program);
      g.deleteShader(vs);
      g.deleteShader(fs);
      g.deleteBuffer(buffer);
    };
  }, []);

  return (
    <div ref={wrapRef} className="ask-orb" data-state={state} data-gl={gl} aria-hidden="true">
      <div className="ask-orb-fallback" data-animate={!reduced} data-hidden={gl === "ready"} />
      {gl !== "none" && <canvas ref={canvasRef} />}
    </div>
  );
}
