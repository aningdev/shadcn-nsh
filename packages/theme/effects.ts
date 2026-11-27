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
    // Bend 4.2pt + ring 1.35pt stays inside this budget. Do not grow either without raising it.
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
  let nrm = box_normal(p, size * 0.5, rad);
  let rim = smoothstep(14.0, 0.0, -sd);
  let bend = nrm * rim * uniforms.intensity * 4.2;
  let ring = uniforms.intensity * 1.35;
  let chroma = nrm * rim * uniforms.intensity * 0.4;
  let diag = 0.70710678;
  let t0 = sample_backdrop(uv + bend / size);
  let t1 = sample_backdrop(uv + (bend + vec2f(ring, 0.0)) / size);
  let t2 = sample_backdrop(uv + (bend + vec2f(-ring, 0.0)) / size);
  let t3 = sample_backdrop(uv + (bend + vec2f(0.0, ring)) / size);
  let t4 = sample_backdrop(uv + (bend + vec2f(0.0, -ring)) / size);
  let t5 = sample_backdrop(uv + (bend + vec2f(ring * diag, ring * diag)) / size);
  let t6 = sample_backdrop(uv + (bend + vec2f(-ring * diag, ring * diag)) / size);
  let t7 = sample_backdrop(uv + (bend + vec2f(ring * diag, -ring * diag)) / size);
  let t8 = sample_backdrop(uv + (bend + vec2f(-ring * diag, -ring * diag)) / size);
  let soft = (t0 * 4.0 + t1 + t2 + t3 + t4 + t5 + t6 + t7 + t8) / 12.0;
  let split_r = sample_backdrop(uv + (bend + chroma) / size);
  let split_b = sample_backdrop(uv + (bend - chroma) / size);
  let dispersed = vec4f(split_r.r, soft.g, split_b.b, soft.a);
  let glass = mix(soft, dispersed, rim * 0.85);
  let luma = dot(glass.rgb, vec3f(0.2126, 0.7152, 0.0722));
  let vivid = clamp(mix(vec3f(luma), glass.rgb, 1.0 + uniforms.intensity * 0.35), vec3f(0.0), vec3f(1.0));
  let content = sample_content(uv);
  let color = mix(vec4f(vivid, glass.a), content, content.a);
  let top = clamp(-nrm.y, 0.0, 1.0) * rim;
  let sheen = top * uniforms.intensity;
  let edge = smoothstep(1.6, 0.0, abs(sd));
  let bottom = clamp(nrm.y, 0.0, 1.0) * rim * uniforms.intensity * 0.18;
  var rgb = mix(color.rgb, vec3f(1.0), sheen * 0.55);
  rgb = mix(rgb, vec3f(1.0), edge * uniforms.intensity * 0.28);
  rgb = rgb * (1.0 - bottom);
  return vec4f(clamp(rgb, vec3f(0.0), vec3f(1.0)), max(color.a, sheen * 0.18 + edge * 0.08));
}`,
  },
  "acrylic-noise": {
    defaultIntensity: 0.035,
    // Uniform 4.5pt ring stays inside this budget. Acrylic is flat frost, not a lens, so do not bend it.
    maxSampleOffset: 6,
    source: /* wgsl */ `${HASH}
struct Uniforms { intensity: f32 }
fn shade(uv: vec2f) -> vec4f {
  let size = max(nsh.size, vec2f(1.0));
  let radius = 4.5 / size;
  let diag = 0.70710678;
  let t0 = sample_backdrop(uv);
  let t1 = sample_backdrop(uv + vec2f(radius.x, 0.0));
  let t2 = sample_backdrop(uv + vec2f(-radius.x, 0.0));
  let t3 = sample_backdrop(uv + vec2f(0.0, radius.y));
  let t4 = sample_backdrop(uv + vec2f(0.0, -radius.y));
  let t5 = sample_backdrop(uv + vec2f(radius.x * diag, radius.y * diag));
  let t6 = sample_backdrop(uv + vec2f(-radius.x * diag, radius.y * diag));
  let t7 = sample_backdrop(uv + vec2f(radius.x * diag, -radius.y * diag));
  let t8 = sample_backdrop(uv + vec2f(-radius.x * diag, -radius.y * diag));
  let soft = (t0 * 4.0 + t1 + t2 + t3 + t4 + t5 + t6 + t7 + t8) / 12.0;
  let luma = dot(soft.rgb, vec3f(0.2126, 0.7152, 0.0722));
  let muted = mix(vec3f(luma), soft.rgb, 0.72);
  let frosted = mix(muted, vec3f(0.96, 0.96, 0.95), 0.06);
  let content = sample_content(uv);
  let tinted = mix(vec4f(frosted, soft.a), content, content.a);
  let grain = hash(uv * nsh.size * max(nsh.scale, 1.0)) - 0.5;
  var rgb = clamp(tinted.rgb + vec3f(grain * uniforms.intensity), vec3f(0.0), vec3f(1.0));
  let px = 1.0 / max(nsh.scale, 1.0);
  let top = smoothstep(px, 0.0, uv.y * size.y);
  rgb = mix(rgb, vec3f(1.0), top * 0.16);
  return vec4f(rgb, max(tinted.a, top * 0.05));
}`,
  },
  "specular-rim": {
    defaultIntensity: 0.4,
    maxSampleOffset: 0,
    source: /* wgsl */ `
struct Uniforms { intensity: f32 }
fn shade(uv: vec2f) -> vec4f {
  let content = sample_content(uv);
  let top = smoothstep(0.2, 0.0, uv.y);
  let edge = min(min(uv.x, 1.0 - uv.x), min(uv.y, 1.0 - uv.y));
  let rim = smoothstep(0.07, 0.0, edge);
  let bottom = smoothstep(0.76, 1.0, uv.y);
  var rgb = mix(content.rgb, vec3f(1.0), top * uniforms.intensity * 0.55);
  rgb = mix(rgb, vec3f(1.0), rim * uniforms.intensity * 0.22);
  rgb = mix(rgb, rgb * vec3f(0.62), bottom * uniforms.intensity);
  return vec4f(clamp(rgb, vec3f(0.0), vec3f(1.0)), content.a);
}`,
  },
  "paper-grain": {
    defaultIntensity: 0.025,
    maxSampleOffset: 0,
    source: /* wgsl */ `${NOISE}
struct Uniforms { intensity: f32 }
fn shade(uv: vec2f) -> vec4f {
  let content = sample_content(uv);
  let p = uv * nsh.size * max(nsh.scale, 1.0);
  let low = noise(p / 42.0);
  let high = noise(p / 3.5);
  let grain = (low - 0.5) * 0.65 + (high - 0.5) * 0.35;
  let warm = vec3f(0.02, 0.008, -0.012) * uniforms.intensity;
  let rgb = clamp(content.rgb + vec3f(grain * uniforms.intensity) + warm, vec3f(0.0), vec3f(1.0));
  return vec4f(rgb, content.a);
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
