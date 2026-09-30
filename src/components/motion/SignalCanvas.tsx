"use client";
import { useEffect, useRef } from "react";

// The living background, drawn by a fragment shader: slow washes of light, a
// dot lattice that wakes near the pointer and drifts with scroll, and grain.
// It warms toward the signal colour as the visitor moves through sections
// (see Choreography, which dispatches "signal:warmth"). Colours come from the
// CSS tokens, so the theme toggle recolours the field too. With reduced motion
// a single still frame is drawn and the loop never starts.

const VERTEX = `#version 300 es
in vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }`;

const FRAGMENT = `#version 300 es
precision highp float;
out vec4 outColor;
uniform vec2 uRes;
uniform float uTime;
uniform vec2 uPointer;
uniform float uPointerStrength;
uniform float uScrollVel;
uniform float uScroll;
uniform float uWarmth;
uniform vec3 uPaper;
uniform vec3 uInk;
uniform vec3 uSignal;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123); }
float noise(vec2 p) {
  vec2 i = floor(p); vec2 f = fract(p);
  float a = hash(i), b = hash(i + vec2(1.0, 0.0)), c = hash(i + vec2(0.0, 1.0)), d = hash(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}
float fbm(vec2 p) {
  float v = 0.0, amp = 0.5;
  for (int i = 0; i < 4; i++) { v += amp * noise(p); p = p * 2.03 + vec2(1.7, 9.2); amp *= 0.5; }
  return v;
}

// Three drifting washes of light, a fine dot lattice that wakes up near the
// pointer, and paper grain. Calm at rest, alive under the hand, and it
// deepens in colour as the visitor moves through the sections.
void main() {
  vec2 uv = gl_FragCoord.xy / uRes;
  float aspect = uRes.x / uRes.y;
  vec2 p = vec2(uv.x * aspect, uv.y);
  float dark = step(0.5, 1.0 - dot(uPaper, vec3(0.333)));

  // Washes: positions wander on slow noise, so the motion never repeats.
  vec2 c1 = vec2(0.78 * aspect + 0.22 * (noise(vec2(uTime * 0.05, 1.3)) - 0.5), 0.70 + 0.24 * (noise(vec2(3.1, uTime * 0.04)) - 0.5));
  vec2 c2 = vec2(0.22 * aspect + 0.26 * (noise(vec2(uTime * 0.04 + 7.0, 2.2)) - 0.5), 0.22 + 0.26 * (noise(vec2(5.7, uTime * 0.05 + 3.0)) - 0.5));
  vec2 c3 = vec2(0.55 * aspect + 0.30 * (noise(vec2(uTime * 0.03 + 11.0, 4.4)) - 0.5), 0.55 + 0.30 * (noise(vec2(9.9, uTime * 0.035 + 6.0)) - 0.5));
  float w1 = exp(-pow(distance(p, c1), 2.0) * 1.9);
  float w2 = exp(-pow(distance(p, c2), 2.0) * 2.4);
  float w3 = exp(-pow(distance(p, c3), 2.0) * 3.2);

  vec3 color = uPaper;
  float glow = mix(0.10, 0.22, dark);
  color = mix(color, uSignal, w1 * (glow + 0.08 * uWarmth));
  color = mix(color, mix(uInk, uSignal, 0.35), w2 * glow * 0.6);
  color = mix(color, mix(uPaper, uInk, 0.5), w3 * glow * 0.45);

  // Dot lattice with gentle scroll parallax. Cell size scales with height so
  // the density feels the same on every screen.
  float cell = 44.0 / uRes.y;
  vec2 g = vec2(p.x, p.y + uScroll * 0.00012);
  vec2 cellUv = fract(g / cell) - 0.5;
  float dot = 1.0 - smoothstep(0.045, 0.085, length(cellUv));
  vec2 pp = vec2(uPointer.x * aspect, uPointer.y);
  float near = exp(-pow(distance(p, pp), 2.0) * 9.0) * uPointerStrength;
  float wake = 0.16 + near * 0.85 + abs(uScrollVel) * 0.15;
  vec3 dotColor = mix(uInk, uSignal, near * 0.9);
  color = mix(color, dotColor, dot * wake * mix(0.16, 0.26, dark));

  // A soft halo under the pointer so the wake reads as light, not paint.
  color = mix(color, uSignal, near * 0.05);

  // Paper grain.
  color += (hash(gl_FragCoord.xy + uTime) - 0.5) * 0.02;
  outColor = vec4(color, 1.0);
}`;

function hexToRgb(value: string): [number, number, number] {
  const hex = value.trim().replace("#", "");
  const full = hex.length === 3 ? hex.split("").map((c) => c + c).join("") : hex;
  const n = parseInt(full, 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

const WARMTH_BY_SECTION: Record<string, number> = { home: 0.15, now: 0.55, work: 0.25, credentials: 0.7, about: 0.2, toolkit: 0.35, journey: 0.3, contact: 0.6 };

export default function SignalCanvas() {
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const node = canvas.current;
    if (!node) return;
    const gl = node.getContext("webgl2", { antialias: false, alpha: false, powerPreference: "low-power" });
    if (!gl) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const compile = (type: number, source: string) => {
      const shader = gl.createShader(type)!;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(shader) || "shader");
      return shader;
    };
    let program: WebGLProgram;
    try {
      program = gl.createProgram()!;
      gl.attachShader(program, compile(gl.VERTEX_SHADER, VERTEX));
      gl.attachShader(program, compile(gl.FRAGMENT_SHADER, FRAGMENT));
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program) || "link");
    } catch (error) {
      // Without a working program the opaque canvas would paint black, so hide
      // it and let the paper background show instead.
      console.warn("Signal background disabled:", error instanceof Error ? error.message : error);
      node.style.display = "none";
      return;
    }
    gl.useProgram(program);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(program, "aPos");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);
    const u = (name: string) => gl.getUniformLocation(program, name);
    const uniforms = {
      res: u("uRes"), time: u("uTime"), pointer: u("uPointer"), strength: u("uPointerStrength"),
      vel: u("uScrollVel"), scroll: u("uScroll"), warmth: u("uWarmth"), paper: u("uPaper"), ink: u("uInk"), signal: u("uSignal"),
    };

    const state = { pointer: [0.5, 0.5], targetPointer: [0.5, 0.5], strength: 0, targetStrength: 0, vel: 0, warmth: 0.15, targetWarmth: 0.15, lastScroll: window.scrollY, lastTime: performance.now() };

    const readTokens = () => {
      const style = getComputedStyle(document.documentElement);
      gl.uniform3fv(uniforms.paper, hexToRgb(style.getPropertyValue("--paper") || "#f6f1e8"));
      gl.uniform3fv(uniforms.ink, hexToRgb(style.getPropertyValue("--ink") || "#16140f"));
      gl.uniform3fv(uniforms.signal, hexToRgb(style.getPropertyValue("--signal") || "#b8391f"));
    };
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      node.width = Math.floor(window.innerWidth * dpr);
      node.height = Math.floor(window.innerHeight * dpr);
      gl.viewport(0, 0, node.width, node.height);
      gl.uniform2f(uniforms.res, node.width, node.height);
    };
    const draw = (time: number) => {
      gl.uniform1f(uniforms.time, time / 1000);
      gl.uniform2f(uniforms.pointer, state.pointer[0], state.pointer[1]);
      gl.uniform1f(uniforms.strength, state.strength);
      gl.uniform1f(uniforms.vel, state.vel);
      gl.uniform1f(uniforms.scroll, window.scrollY);
      gl.uniform1f(uniforms.warmth, state.warmth);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    readTokens();
    resize();
    if (reduced) {
      draw(0);
      return;
    }

    let frame = 0;
    let running = true;
    const loop = (time: number) => {
      if (!running) return;
      const dt = Math.min(0.05, (time - state.lastTime) / 1000);
      state.lastTime = time;
      const k = 1 - Math.exp(-dt * 6);
      state.pointer[0] += (state.targetPointer[0] - state.pointer[0]) * k;
      state.pointer[1] += (state.targetPointer[1] - state.pointer[1]) * k;
      state.strength += (state.targetStrength - state.strength) * k;
      state.warmth += (state.targetWarmth - state.warmth) * k * 0.6;
      state.vel *= Math.exp(-dt * 4);
      draw(time);
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);

    const onMove = (event: PointerEvent) => {
      state.targetPointer = [event.clientX / window.innerWidth, 1 - event.clientY / window.innerHeight];
      state.targetStrength = 1;
    };
    const onLeave = () => {
      state.targetStrength = 0;
    };
    const onScroll = () => {
      const delta = window.scrollY - state.lastScroll;
      state.lastScroll = window.scrollY;
      state.vel = Math.max(-1, Math.min(1, state.vel + delta / 900));
    };
    const onWarmth = (event: Event) => {
      const detail = (event as CustomEvent<string>).detail;
      state.targetWarmth = WARMTH_BY_SECTION[detail] ?? 0.2;
    };
    const onVisibility = () => {
      running = document.visibilityState === "visible";
      if (running) {
        state.lastTime = performance.now();
        frame = requestAnimationFrame(loop);
      } else cancelAnimationFrame(frame);
    };
    const themeWatcher = new MutationObserver(readTokens);
    themeWatcher.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerleave", onLeave);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", resize);
    window.addEventListener("signal:warmth", onWarmth);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      running = false;
      cancelAnimationFrame(frame);
      themeWatcher.disconnect();
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", resize);
      window.removeEventListener("signal:warmth", onWarmth);
      document.removeEventListener("visibilitychange", onVisibility);
      gl.deleteProgram(program);
      gl.deleteBuffer(buffer);
    };
  }, []);

  return <canvas ref={canvas} className="signal-canvas" aria-hidden="true" />;
}
