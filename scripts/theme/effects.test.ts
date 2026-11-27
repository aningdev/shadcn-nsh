import { describe, expect, test } from "bun:test";

import {
  resolveSurfaceEffect,
  resolveTransitionShader,
  SURFACE_SHADERS,
  TRANSITION_SHADERS,
} from "../../packages/theme/effects";
import { resolveMaterial } from "../../packages/theme/materials";
import type { SurfaceEffectKind } from "../../packages/theme/schema";

const SURFACE_KINDS: readonly SurfaceEffectKind[] = [
  "liquid-glass",
  "acrylic-noise",
  "specular-rim",
  "paper-grain",
];

describe("built-in surface and transition shaders", () => {
  test("every surface shader declares Uniforms and shade, and samples the pictures it needs", () => {
    for (const kind of SURFACE_KINDS) {
      const shader = SURFACE_SHADERS[kind];
      expect(shader.source, kind).toContain("struct Uniforms { intensity: f32 }");
      expect(shader.source, kind).toContain("fn shade(uv: vec2f) -> vec4f");
      expect(shader.source, kind).not.toContain("sample_content");
    }
    const liquid = SURFACE_SHADERS["liquid-glass"].source;
    expect(liquid).toContain("sample_backdrop");
    expect(liquid).toContain("nsh.size");
    expect(liquid).toContain("sd_round_box");
    expect(liquid.split("sample_backdrop").length - 1).toBeGreaterThanOrEqual(3);
    expect(SURFACE_SHADERS["liquid-glass"].defaultIntensity).toBe(0.35);
    expect(SURFACE_SHADERS["liquid-glass"].maxSampleOffset).toBe(6);
    expect(SURFACE_SHADERS["acrylic-noise"].defaultIntensity).toBe(0.04);
    expect(SURFACE_SHADERS["acrylic-noise"].maxSampleOffset).toBe(0);
    expect(SURFACE_SHADERS["specular-rim"].defaultIntensity).toBe(0.4);
    expect(SURFACE_SHADERS["specular-rim"].maxSampleOffset).toBe(0);
    expect(SURFACE_SHADERS["paper-grain"].defaultIntensity).toBe(0.03);
    expect(SURFACE_SHADERS["paper-grain"].maxSampleOffset).toBe(0);
    const acrylic = SURFACE_SHADERS["acrylic-noise"].source;
    expect(acrylic).not.toContain("sample_backdrop");
    expect(acrylic).toContain("hash(uv * nsh.size * max(nsh.scale, 1.0)) - 0.5");
    expect(acrylic).not.toContain("split_r");
    expect(acrylic).not.toContain("dispersed");
    expect(acrylic).not.toContain("chroma");
    expect(acrylic).not.toContain("sd_round_box");
  });

  test("dissolve and radial-wipe read progress and both sides", () => {
    for (const kind of ["dissolve", "radial-wipe"] as const) {
      const source = TRANSITION_SHADERS[kind].source;
      expect(source, kind).toContain("fn shade(uv: vec2f) -> vec4f");
      expect(source, kind).toContain("nsh.progress");
      expect(source, kind).toContain("sample_from");
      expect(source, kind).toContain("sample_to");
    }
  });

  test("resolveSurfaceEffect applies defaults, overrides and wgsl, and treats null as absent", () => {
    expect(resolveSurfaceEffect(null)).toBeNull();
    expect(resolveSurfaceEffect(undefined)).toBeNull();

    const defaults = resolveSurfaceEffect({ kind: "paper-grain" });
    expect(defaults).toEqual({
      source: SURFACE_SHADERS["paper-grain"].source,
      uniforms: { intensity: 0.03 },
      maxSampleOffset: 0,
    });

    const custom = resolveSurfaceEffect({ kind: "liquid-glass", intensity: 0.6 });
    expect(custom?.uniforms.intensity).toBe(0.6);
    expect(custom?.maxSampleOffset).toBe(6);
    expect(custom?.source).toBe(SURFACE_SHADERS["liquid-glass"].source);

    const wgsl = "fn shade(uv: vec2f) -> vec4f { return sample_content(uv); }";
    const overridden = resolveSurfaceEffect({ kind: "specular-rim", wgsl });
    expect(overridden).toEqual({
      source: wgsl,
      uniforms: { intensity: 0.4 },
      maxSampleOffset: 0,
    });
  });

  test("resolveTransitionShader returns source only for dissolve and radial-wipe", () => {
    expect(resolveTransitionShader("none")).toBeNull();
    expect(resolveTransitionShader("fade")).toBeNull();
    expect(resolveTransitionShader("dissolve")).toBe(TRANSITION_SHADERS.dissolve.source);
    expect(resolveTransitionShader("radial-wipe")).toBe(TRANSITION_SHADERS["radial-wipe"].source);
  });
});

describe("resolveMaterial", () => {
  test("presets keep their platform recipe and fallback floors", () => {
    expect(resolveMaterial("glass")).toEqual({
      glassEffect: "regular",
      props: { ios: { backdropMaterial: "regular" } },
      blur: 30,
      minOpacity: 0.72,
    });
    expect(resolveMaterial("acrylic")).toEqual({
      props: { windows: { backdrop: { material: "blur" } } },
      blur: 30,
      minOpacity: 0.85,
    });
  });

  test("a spec overrides blur and minOpacity and keeps saturate and specular", () => {
    expect(
      resolveMaterial({
        kind: "glass",
        blur: 14,
        minOpacity: 0.6,
        saturate: 1.8,
        specular: "border",
      }),
    ).toEqual({
      glassEffect: "regular",
      props: { ios: { backdropMaterial: "regular" } },
      blur: 14,
      minOpacity: 0.6,
      saturate: 1.8,
      specular: "border",
    });
    expect(resolveMaterial({ kind: "blur", saturate: 1.2 })).toEqual({
      props: {},
      blur: 16,
      minOpacity: 0.68,
      saturate: 1.2,
    });
  });

  test("glass clear, ios materials, and macos backdrops fill platform defaults", () => {
    expect(
      resolveMaterial({
        kind: "glass",
        glass: "clear",
        ios: "ultraThin",
        macos: "hudWindow",
      }),
    ).toEqual({
      glassEffect: "clear",
      props: {
        ios: { backdropMaterial: "ultraThin" },
        macos: {
          backdrop: {
            material: "hudWindow",
            blending: "withinWindow",
            state: "followsWindowActiveState",
          },
        },
      },
      blur: 30,
      minOpacity: 0.72,
    });
    expect(
      resolveMaterial({
        kind: "acrylic",
        macos: { material: "sidebar", blending: "behindWindow", state: "active" },
      }),
    ).toEqual({
      props: {
        windows: { backdrop: { material: "blur" } },
        macos: {
          backdrop: { material: "sidebar", blending: "behindWindow", state: "active" },
        },
      },
      blur: 30,
      minOpacity: 0.85,
    });
    expect(
      resolveMaterial({
        kind: "blur",
        ios: "thin",
        macos: { blending: "behindWindow" },
      }),
    ).toEqual({
      props: {
        ios: { backdropMaterial: "thin" },
        macos: {
          backdrop: { blending: "behindWindow", state: "followsWindowActiveState" },
        },
      },
      blur: 16,
      minOpacity: 0.68,
    });
  });
});
