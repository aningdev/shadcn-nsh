/**
 * Built-in WGSL surface and theme-switch shaders.
 *
 * Pure TypeScript and shader source: this file does not import `nsh`, so the CLI, Node and Bun
 * tests can read it. NSH supplies `nsh`, `uniforms`, `sample_content`, `sample_backdrop`,
 * `sample_from` and `sample_to` when it compiles a source.
 */
import type { SurfaceEffectKind, SurfaceEffectSpec, ThemeSwitchKind } from "./schema";

const HASH = /* wgsl */ `
fn hash(p: vec2f) -> f32 {
  let q = bitcast<vec2u>(vec2i(floor(p)));
  var h = (q.x * 1597334677u) ^ (q.y * 3812015801u);
  h = h * 1664525u + 1013904223u;
  h = (h ^ (h >> 16u)) * 2246822519u;
  h = h ^ (h >> 13u);
  return f32(h >> 8u) / 16777216.0;
}`;

const NOISE = /* wgsl */ `${HASH}
fn noise(p: vec2f) -> f32 {
  let i = floor(p);
  let f = fract(p);
  let u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i), hash(i + vec2f(1.0, 0.0)), u.x),
    mix(hash(i + vec2f(0.0, 1.0)), hash(i + vec2f(1.0, 1.0)), u.x),
    u.y
  );
}`;

/**
 * Built-in surface shaders, keyed by `SurfaceEffectKind`.
 * Every source declares `struct Uniforms { intensity: f32 }` and `fn shade(uv: vec2f) -> vec4f`.
 */
export const SURFACE_SHADERS: Record<
  SurfaceEffectKind,
  { readonly source: string; readonly defaultIntensity: number; readonly maxSampleOffset: number }
> = {
  "liquid-glass": {
    defaultIntensity: 0.35,
    // Bend 4.5pt + chroma 0.7pt stays inside this budget. Do not grow either without raising it.
    maxSampleOffset: 6,
    source: /* wgsl */ `
struct Uniforms { intensity: f32 }

fn sd_round_box(p: vec2f, half: vec2f, rad: f32) -> f32 {
  let q = abs(p) - half + vec2f(rad);
  return length(max(q, vec2f(0.0))) + min(max(q.x, q.y), 0.0) - rad;
}

fn box_normal(p: vec2f, half: vec2f, rad: f32) -> vec2f {
  let q = abs(p) - half + vec2f(rad);
  let outside = max(q, vec2f(0.0));
  let len = length(outside);
  let corner = q.x > 0.0 && q.y > 0.0 && len > 0.0001;
  let along_x = q.x >= q.y;
  let sx = select(-1.0, 1.0, p.x > 0.0);
  let sy = select(-1.0, 1.0, p.y > 0.0);
  let axis = select(vec2f(0.0, sy), vec2f(sx, 0.0), along_x);
  let curved = vec2f((outside.x / max(len, 0.0001)) * sx, (outside.y / max(len, 0.0001)) * sy);
  return select(axis, curved, corner);
}

fn shade(uv: vec2f) -> vec4f {
  let size = max(nsh.size, vec2f(1.0));
  let p = (uv - vec2f(0.5)) * size;
  let rad = min(min(size.x, size.y) * 0.28, 18.0);
  let sd = sd_round_box(p, size * 0.5, rad);
  let inside = smoothstep(0.5, -0.5, sd);
  let nrm = box_normal(p, size * 0.5, rad);
  let rim = smoothstep(16.0, 0.0, -sd) * inside;

  // Transparent optical rim overlay: leave the center clear so native NSGlassEffectView / CSS
  // backdropFilter and surface fill show through, while refracting and highlighting the bezel.
  let bend = nrm * rim * uniforms.intensity * 4.5;
  let chroma = nrm * rim * uniforms.intensity * 0.7;
  let sample_mid = sample_backdrop(uv + bend / size);
  let split_r = sample_backdrop(uv + (bend + chroma) / size);
  let split_b = sample_backdrop(uv + (bend - chroma) / size);
  let lens = vec3f(split_r.r, sample_mid.g, split_b.b);
  let luma = dot(lens, vec3f(0.2126, 0.7152, 0.0722));
  let vivid = clamp(mix(vec3f(luma), lens, 1.0 + uniforms.intensity * 0.45), vec3f(0.0), vec3f(1.0));
  let refract_a = rim * rim * uniforms.intensity * 0.55 * sample_mid.a;

  let top = clamp(-nrm.y, 0.0, 1.0) * rim;
  let sheen_a = clamp(top * uniforms.intensity * 0.65, 0.0, 1.0);
  let edge = smoothstep(1.5, 0.0, abs(sd)) * inside;
  let edge_a = clamp(edge * uniforms.intensity * 0.45, 0.0, 1.0);
  let bottom = clamp(nrm.y, 0.0, 1.0) * rim;
  let shadow_a = clamp(bottom * uniforms.intensity * 0.22, 0.0, 1.0);

  let light_a = clamp(sheen_a + edge_a, 0.0, 1.0);
  let base_rgb = mix(vivid, vec3f(0.0), shadow_a);
  let base_a = clamp(refract_a + shadow_a, 0.0, 1.0);
  let total_a = clamp(base_a + light_a * (1.0 - base_a), 0.0, 1.0);
  let rgb = select(vec3f(0.0), mix(base_rgb * base_a, vec3f(1.0), light_a) / total_a, total_a > 0.001);
  return vec4f(clamp(rgb, vec3f(0.0), vec3f(1.0)), total_a * inside);
}`,
  },
  "acrylic-noise": {
    defaultIntensity: 0.04,
    // Pure grain + 1px specular highlight overlay; backdrop blur & tint live on the host layer.
    maxSampleOffset: 0,
    source: /* wgsl */ `${HASH}
struct Uniforms { intensity: f32 }
fn shade(uv: vec2f) -> vec4f {
  let size = max(nsh.size, vec2f(1.0));
  let grain = hash(uv * nsh.size * max(nsh.scale, 1.0)) - 0.5;
  let px = 1.0 / max(nsh.scale, 1.0);
  let top = smoothstep(px, 0.0, uv.y * size.y);

  let grain_rgb = select(vec3f(0.0), vec3f(1.0), grain > 0.0);
  let grain_a = clamp(abs(grain) * uniforms.intensity * 1.6, 0.0, 1.0);
  let top_a = clamp(top * 0.22, 0.0, 1.0);
  let total_a = clamp(grain_a + top_a * (1.0 - grain_a), 0.0, 1.0);
  let rgb = select(vec3f(0.0), mix(grain_rgb * grain_a, vec3f(1.0), top_a) / total_a, total_a > 0.001);
  return vec4f(clamp(rgb, vec3f(0.0), vec3f(1.0)), total_a);
}`,
  },
  "specular-rim": {
    defaultIntensity: 0.4,
    maxSampleOffset: 0,
    source: /* wgsl */ `
struct Uniforms { intensity: f32 }
fn shade(uv: vec2f) -> vec4f {
  let top = smoothstep(0.22, 0.0, uv.y);
  let edge = min(min(uv.x, 1.0 - uv.x), min(uv.y, 1.0 - uv.y));
  let rim = smoothstep(0.06, 0.0, edge);
  let bottom = smoothstep(0.76, 1.0, uv.y);

  let light_a = clamp((top * 0.32 + rim * 0.28) * uniforms.intensity, 0.0, 1.0);
  let dark_a = clamp(bottom * uniforms.intensity * 0.22, 0.0, 1.0);
  let total_a = clamp(dark_a + light_a * (1.0 - dark_a), 0.0, 1.0);
  let rgb = select(vec3f(0.0), vec3f(light_a / total_a), total_a > 0.001);
  return vec4f(clamp(rgb, vec3f(0.0), vec3f(1.0)), total_a);
}`,
  },
  "paper-grain": {
    defaultIntensity: 0.03,
    maxSampleOffset: 0,
    source: /* wgsl */ `${NOISE}
struct Uniforms { intensity: f32 }
fn shade(uv: vec2f) -> vec4f {
  let p = uv * nsh.size * max(nsh.scale, 1.0);
  let low = noise(p / 42.0);
  let high = noise(p / 3.5);
  let grain = (low - 0.5) * 0.65 + (high - 0.5) * 0.35;
  let warm_rgb = vec3f(0.88, 0.82, 0.72);
  let warm_a = clamp(uniforms.intensity * 0.65, 0.0, 1.0);
  let grain_rgb = select(vec3f(0.25, 0.22, 0.18), vec3f(1.0), grain > 0.0);
  let grain_a = clamp(abs(grain) * uniforms.intensity * 1.4, 0.0, 1.0);
  let total_a = clamp(warm_a + grain_a * (1.0 - warm_a), 0.0, 1.0);
  let rgb = select(vec3f(0.0), (warm_rgb * warm_a * (1.0 - grain_a) + grain_rgb * grain_a) / total_a, total_a > 0.001);
  return vec4f(clamp(rgb, vec3f(0.0), vec3f(1.0)), total_a);
}`,
  },
};

/**
 * Theme-switch shaders for the kinds that are not a plain fade.
 * Every source defines `fn shade(uv: vec2f) -> vec4f` and reads `nsh.progress`, `sample_from` and `sample_to`.
 */
export const TRANSITION_SHADERS: Record<
  Exclude<ThemeSwitchKind, "none" | "fade">,
  { readonly source: string }
> = {
  dissolve: {
    source: /* wgsl */ `${HASH}
fn shade(uv: vec2f) -> vec4f {
  let n = hash(uv * nsh.size * max(nsh.scale, 1.0));
  let t = 1.0 - smoothstep(nsh.progress - 0.06, nsh.progress + 0.06, n);
  return mix(sample_from(uv), sample_to(uv), t);
}`,
  },
  "radial-wipe": {
    source: /* wgsl */ `
fn shade(uv: vec2f) -> vec4f {
  let aspect = nsh.size.x / max(nsh.size.y, 1.0);
  let p = (uv - vec2f(0.5)) * vec2f(aspect, 1.0);
  let d = length(p);
  let reach = nsh.progress * 1.15;
  let t = 1.0 - smoothstep(reach, reach + 0.12, d);
  return mix(sample_from(uv), sample_to(uv), t);
}`,
  },
};

/** A surface effect ready to hand to `ShaderEffect`. */
export interface ResolvedSurfaceEffect {
  /** WGSL source (`fn shade`). */
  readonly source: string;
  /** Uniforms the source's `struct Uniforms` reads. */
  readonly uniforms: { readonly intensity: number };
  /** How far, in points, samples may reach outside the view. */
  readonly maxSampleOffset: number;
}

/** Resolve a surface effect spec to shader source and uniforms, or `null` when unset. */
export function resolveSurfaceEffect(
  spec: SurfaceEffectSpec | null | undefined,
): ResolvedSurfaceEffect | null {
  if (spec == null) return null;
  const built = SURFACE_SHADERS[spec.kind];
  return {
    source: spec.wgsl ?? built.source,
    uniforms: { intensity: spec.intensity ?? built.defaultIntensity },
    maxSampleOffset: built.maxSampleOffset,
  };
}

/** WGSL for a theme-switch kind, or `null` for `"none"` and `"fade"`. */
export function resolveTransitionShader(kind: ThemeSwitchKind): string | null {
  switch (kind) {
    case "none":
    case "fade":
      return null;
    case "dissolve":
    case "radial-wipe":
      return TRANSITION_SHADERS[kind].source;
    default: {
      const exhaustive: never = kind;
      return exhaustive;
    }
  }
}
