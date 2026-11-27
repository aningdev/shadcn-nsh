/**
 * Theme v5 structural, pointer/touch ergonomic, and physics motion invariants (`scripts/theme-lint.ts`).
 */
import { resolveMaterial } from "../../packages/theme/materials";
import {
  SHARED_TYPE_SCALE,
  type AppTheme,
  type MotionSpringSpec,
  type SurfaceLayer,
  type SurfaceMaterial,
  type SurfaceRole,
  type TieredOrFlat,
  type TypeRole,
} from "../../packages/theme/schema";
import { resolveColour, varsOf } from "./css-colour";

export const ALLOWED_SPACING = new Set([4, 8, 12, 16, 24, 32]);

/** Stiffness, damping, mass, and damping ratio shared by `motion.spring` and each named spring. */
function checkSpring(
  path: string,
  spring: MotionSpringSpec | undefined,
  fail: (message: string) => void,
) {
  if (!spring) return;
  const mass = spring.mass ?? 1;
  if (spring.stiffness < 80 || spring.stiffness > 1200) {
    fail(`${path}.stiffness=${spring.stiffness} outside [80, 1200]`);
  }
  if (spring.damping <= 0) {
    fail(`${path}.damping=${spring.damping} must be > 0`);
  }
  if (mass < 0.2 || mass > 5) {
    fail(`${path}.mass=${mass} outside [0.2, 5]`);
  }
  const zeta = spring.damping / (2 * Math.sqrt(spring.stiffness * mass));
  if (zeta < 0.55 || zeta > 1.5) {
    fail(
      `${path} damping ratio zeta=${zeta.toFixed(3)} outside [0.55, 1.5] (would bounce wildly or creep)`,
    );
  }
}

export const TYPE_ORDER: readonly TypeRole[] = [
  "caption",
  "detail",
  "body",
  "label",
  "title",
  "headline",
  "display",
];

export const SURFACE_ROLES: readonly SurfaceRole[] = [
  "card",
  "raised",
  "inset",
  "channel",
  "plate",
  "overlay",
  "modal",
  "inverse",
  "glass",
  "accent",
  "fill",
];

function readTier<T>(v: TieredOrFlat<T>, tier: "pointer" | "touch"): T {
  if (typeof v === "object" && v !== null && !Array.isArray(v) && "pointer" in v && "touch" in v) {
    return (v as { pointer: T; touch: T })[tier];
  }
  return v as T;
}

function asBox(
  v: number | readonly [number, number] | "same",
  fallback: readonly [number, number],
): readonly [number, number] {
  if (v === "same") return fallback;
  return typeof v === "number" ? [v, v] : v;
}

function materialLabel(material: SurfaceMaterial): string {
  return typeof material === "string" ? material : material.kind;
}

function cssAlpha(expr: string, entry: AppTheme, mode: "light" | "dark"): number | undefined {
  const cssVars = { ...entry.theme.cssVars.theme, ...entry.theme.cssVars[mode] };
  const raw = expr in cssVars ? cssVars[expr]! : expr;
  try {
    const rgb = resolveColour(raw, varsOf(cssVars));
    return rgb.a ?? 1;
  } catch {
    return undefined;
  }
}

/** Effective opacity of a layer fill: a color-key's own alpha, or that alpha times a spec's `alpha`. */
function backgroundAlpha(
  bg: SurfaceLayer["background"],
  entry: AppTheme,
  mode: "light" | "dark",
): number | undefined {
  if (bg === undefined || bg === null) return undefined;
  if (typeof bg === "string") return cssAlpha(bg, entry, mode);
  if ("color" in bg) {
    const base = cssAlpha(bg.color, entry, mode) ?? 1;
    return base * bg.alpha;
  }
  if ("tint" in bg) return bg.alpha ?? entry.spec.tokens.tintAlpha[mode];
  return undefined;
}

/**
 * Validate ergonomics (pointer vs touch bounds and hit targets), control geometry safety,
 * motion timing/spring physics stability, feedback opacity/scale bounds, and material opacity floors.
 * Returns human-readable failure messages; empty array means valid.
 */
export function validateThemeInvariants(entry: AppTheme): string[] {
  const failures: string[] = [];
  const { id, spec } = entry;
  const tag = `theme(${id})`;
  const fail = (m: string) => failures.push(`${tag}: ${m}`);

  // 1. Radii monotonicity
  const { control: rControl, container: rContainer, modal: rModal } = spec.tokens.radius;
  if (rControl < 0 || rContainer < rControl || rModal < rContainer) {
    fail("radii must satisfy 0 <= control <= container <= modal");
  }

  // 2. Hit target & Pointer vs Touch bounds
  if (spec.metrics.hit.pointer !== 0) {
    fail(`metrics.hit.pointer=${spec.metrics.hit.pointer} must be 0 on desktop pointers`);
  }
  if (spec.metrics.hit.touch < 44) {
    fail(`metrics.hit.touch=${spec.metrics.hit.touch} must be >= 44`);
  }

  const hPtr = spec.metrics.height.pointer;
  const hTch = spec.metrics.height.touch;
  if (hPtr.sm < 20 || hPtr.sm > 28) fail(`height.pointer.sm=${hPtr.sm} outside [20, 28]`);
  if (hPtr.md < 24 || hPtr.md > 36) fail(`height.pointer.md=${hPtr.md} outside [24, 36]`);
  if (hPtr.lg < 28 || hPtr.lg > 44) fail(`height.pointer.lg=${hPtr.lg} outside [28, 44]`);
  if (hTch.sm < 32 || hTch.sm > 44) fail(`height.touch.sm=${hTch.sm} outside [32, 44]`);
  if (hTch.md < 40 || hTch.md > 52) fail(`height.touch.md=${hTch.md} outside [40, 52]`);
  if (hTch.lg < 44 || hTch.lg > 56) fail(`height.touch.lg=${hTch.lg} outside [44, 56]`);

  for (const k of ["sm", "md", "lg"] as const) {
    if (hTch[k] < hPtr[k]) fail(`height.touch.${k}=${hTch[k]} < height.pointer.${k}=${hPtr[k]}`);
    if (spec.metrics.icon.touch[k] < spec.metrics.icon.pointer[k]) {
      fail(
        `icon.touch.${k} (${spec.metrics.icon.touch[k]}) < icon.pointer.${k} (${spec.metrics.icon.pointer[k]})`,
      );
    }
  }

  if (spec.metrics.density.touch.pad < spec.metrics.density.pointer.pad) {
    fail("metrics.density.touch.pad must be >= pointer.pad");
  }
  if (spec.metrics.density.touch.gap < spec.metrics.density.pointer.gap) {
    fail("metrics.density.touch.gap must be >= pointer.gap");
  }
  if (spec.metrics.density.touch.gap < 8) {
    fail(`metrics.density.touch.gap=${spec.metrics.density.touch.gap} must be >= 8`);
  }
  if (spec.metrics.control.touch.padding < spec.metrics.control.pointer.padding) {
    fail("metrics.control.touch.padding must be >= pointer.padding");
  }
  if (spec.metrics.control.touch.gap < spec.metrics.control.pointer.gap) {
    fail("metrics.control.touch.gap must be >= pointer.gap");
  }
  if (spec.metrics.control.touch.gap < 8) {
    fail(`metrics.control.touch.gap=${spec.metrics.control.touch.gap} must be >= 8`);
  }
  if (spec.metrics.item.touch.inset < 0 || spec.metrics.item.pointer.inset < 0) {
    fail("metrics.item inset must be >= 0");
  }
  if (spec.metrics.item.touch.pad < spec.metrics.item.pointer.pad) {
    fail("metrics.item.touch.pad must be >= pointer.pad");
  }
  if (
    spec.metrics.item.touch.inset + spec.metrics.item.touch.pad <
    spec.metrics.item.pointer.inset + spec.metrics.item.pointer.pad
  ) {
    fail(
      `metrics.item.touch total reach (${spec.metrics.item.touch.inset}+${spec.metrics.item.touch.pad}) must be >= pointer (${spec.metrics.item.pointer.inset}+${spec.metrics.item.pointer.pad})`,
    );
  }

  for (const tierName of ["pointer", "touch"] as const) {
    const h = spec.metrics.height[tierName];
    const ic = spec.metrics.icon[tierName];
    if (!(h.sm <= h.md && h.md <= h.lg)) fail(`${tierName} heights must not decrease`);
    if (!(ic.sm <= ic.md && ic.md <= ic.lg)) fail(`${tierName} icons must not decrease`);
    for (const [k, v] of Object.entries(h)) {
      if (v % 4 !== 0) fail(`height.${tierName}.${k}=${v} not on 4px grid`);
    }
    for (const [k, v] of Object.entries(ic)) {
      if (v % 4 !== 0) fail(`icon.${tierName}.${k}=${v} not on 4px grid`);
    }
    const citations = spec.meta?.scaleCitations ?? {};
    const spacingEntries: [string, number][] = [
      [`metrics.density.${tierName}.pad`, spec.metrics.density[tierName].pad],
      [`metrics.density.${tierName}.gap`, spec.metrics.density[tierName].gap],
      [`metrics.control.${tierName}.padding`, spec.metrics.control[tierName].padding],
      [`metrics.control.${tierName}.gap`, spec.metrics.control[tierName].gap],
      [`metrics.item.${tierName}.pad`, spec.metrics.item[tierName].pad],
    ];
    for (const [pathKey, val] of spacingEntries) {
      if (!ALLOWED_SPACING.has(val) && !citations[pathKey]) {
        fail(`${pathKey}=${val} is off the scale without meta.scaleCitations entry`);
      }
    }
  }

  // 3. Control geometry invariants (pointer vs touch + non-overflowing switch knob)
  const swPtrTrack = readTier(spec.controls.switch.track, "pointer");
  const swTchTrack = readTier(spec.controls.switch.track, "touch");
  if (swTchTrack[0] <= swPtrTrack[0] || swTchTrack[1] <= swPtrTrack[1]) {
    fail("controls.switch.track.touch must be strictly > pointer on both width and height");
  }
  if (swPtrTrack[1] < 16 || swPtrTrack[1] > 28) {
    fail(`controls.switch.track.pointer height=${swPtrTrack[1]} outside [16, 28]`);
  }
  if (swTchTrack[1] < 22) {
    fail(`controls.switch.track.touch height=${swTchTrack[1]} must be >= 22`);
  }
  for (const tierName of ["pointer", "touch"] as const) {
    const tr = readTier(spec.controls.switch.track, tierName);
    const edgeOff = readTier(spec.controls.switch.edge.off, tierName);
    const knob = asBox(readTier(spec.controls.switch.knob.size, tierName), [16, 16]);
    if (knob[1] > tr[1] - 2 * edgeOff) {
      fail(
        `controls.switch.knob (${knob[1]}px) overflows ${tierName} track height (${tr[1]}px - 2*${edgeOff}px)`,
      );
    }
    if (knob[0] >= tr[0]) {
      fail(
        `controls.switch.knob width (${knob[0]}px) must be < ${tierName} track width (${tr[0]}px)`,
      );
    }
  }

  const bandPtr = readTier(spec.controls.slider.band, "pointer");
  const bandTch = readTier(spec.controls.slider.band, "touch");
  if (bandPtr < 16) fail(`controls.slider.band.pointer=${bandPtr} must be >= 16`);
  if (bandTch < 32) fail(`controls.slider.band.touch=${bandTch} must be >= 32`);
  if (bandTch < bandPtr) fail(`controls.slider.band.touch (${bandTch}) < pointer (${bandPtr})`);

  const chPtr = readTier(spec.controls.choice.size, "pointer");
  const chTch = readTier(spec.controls.choice.size, "touch");
  if (chPtr < 14 || chPtr > 24) fail(`controls.choice.size.pointer=${chPtr} outside [14, 24]`);
  if (chTch < 20) fail(`controls.choice.size.touch=${chTch} must be >= 20`);
  if (chTch <= chPtr) fail(`controls.choice.size.touch (${chTch}) must be > pointer (${chPtr})`);

  const boxPtr = readTier(spec.controls.choice.box, "pointer");
  const boxTch = readTier(spec.controls.choice.box, "touch");
  if (boxPtr < 14 || boxPtr > 24) fail(`controls.choice.box.pointer=${boxPtr} outside [14, 24]`);
  if (boxTch < 20) fail(`controls.choice.box.touch=${boxTch} must be >= 20`);
  if (boxTch <= boxPtr) fail(`controls.choice.box.touch (${boxTch}) must be > pointer (${boxPtr})`);

  const markPtr = readTier(spec.controls.choice.mark, "pointer");
  const markTch = readTier(spec.controls.choice.mark, "touch");
  if (markTch <= markPtr) {
    fail(`controls.choice.mark.touch (${markTch}) must be > pointer (${markPtr})`);
  }

  // 4. Shared type scale monotonicity
  for (const tierName of ["pointer", "touch"] as const) {
    for (let i = 1; i < TYPE_ORDER.length; i += 1) {
      const prev = SHARED_TYPE_SCALE[TYPE_ORDER[i - 1]!].fontSize[tierName];
      const cur = SHARED_TYPE_SCALE[TYPE_ORDER[i]!].fontSize[tierName];
      if (cur < prev) fail(`shared type scale ${TYPE_ORDER[i]} < ${TYPE_ORDER[i - 1]}`);
    }
  }

  // 5. Feedback invariants
  if (spec.feedback.press.scale <= 0.85 || spec.feedback.press.scale > 1) {
    fail(`feedback.press.scale=${spec.feedback.press.scale} must be in (0.85, 1]`);
  }
  if (Math.abs(spec.feedback.press.translateY) > 4) {
    fail(`feedback.press.translateY=${spec.feedback.press.translateY} magnitude exceeds 4px`);
  }
  if (spec.feedback.press.accent.opacity <= 0 || spec.feedback.press.accent.opacity > 1) {
    fail(`feedback.press.accent.opacity=${spec.feedback.press.accent.opacity} must be in (0, 1]`);
  }
  if (
    spec.feedback.disabled.contentOpacity < 0.25 ||
    spec.feedback.disabled.contentOpacity > 0.75
  ) {
    fail(
      `feedback.disabled.contentOpacity=${spec.feedback.disabled.contentOpacity} outside [0.25, 0.75]`,
    );
  }

  // 6. Motion timing & physics spring invariants
  const { state, fast, default: def, slow, spring, presets } = spec.motion;
  if (state.duration < 40 || state.duration > 220) {
    fail(`motion.state.duration=${state.duration} outside [40, 220]`);
  }
  if (fast.duration < 60 || fast.duration > 250) {
    fail(`motion.fast.duration=${fast.duration} outside [60, 250]`);
  }
  if (def.duration < 100 || def.duration > 350) {
    fail(`motion.default.duration=${def.duration} outside [100, 350]`);
  }
  if (slow.duration < 150 || slow.duration > 500) {
    fail(`motion.slow.duration=${slow.duration} outside [150, 500]`);
  }
  if (
    !(
      state.duration <= fast.duration &&
      fast.duration <= def.duration &&
      def.duration <= slow.duration
    )
  ) {
    fail(
      `motion durations must satisfy state (${state.duration}) <= fast (${fast.duration}) <= default (${def.duration}) <= slow (${slow.duration})`,
    );
  }
  checkSpring("motion.spring", spring, fail);
  const named = spec.motion.springs;
  if (named) {
    for (const role of ["snappy", "smooth", "bouncy"] as const) {
      checkSpring(`motion.springs.${role}`, named[role], fail);
    }
  }
  for (const key of ["popoverEnter", "dialogEnter"] as const) {
    const p = presets[key];
    if (p.fromScale < 0.8 || p.fromScale > 1.15) {
      fail(`motion.presets.${key}.fromScale=${p.fromScale} outside [0.8, 1.15]`);
    }
    if (Math.abs(p.fromY) > 32) {
      fail(`motion.presets.${key}.fromY=${p.fromY} magnitude exceeds 32px`);
    }
  }
  if (presets.themeSwitch.duration < 0 || presets.themeSwitch.duration > 500) {
    fail(`motion.presets.themeSwitch.duration=${presets.themeSwitch.duration} outside [0, 500]`);
  }
  if (presets.themeSwitch.kind === "none" && presets.themeSwitch.duration !== 0) {
    fail('motion.presets.themeSwitch.duration must be 0 when kind is "none"');
  }

  // 7. Material fallback opacity floor, parameterized bounds, and effect strength
  for (const role of SURFACE_ROLES) {
    const s = spec.surfaces[role];
    for (const mode of ["light", "dark"] as const) {
      const merged = { ...s, ...s[mode] };
      if (merged.material) {
        const label = materialLabel(merged.material);
        if (typeof merged.material === "object") {
          const specMaterial = merged.material;
          if (
            specMaterial.blur !== undefined &&
            (specMaterial.blur < 4 || specMaterial.blur > 60)
          ) {
            fail(
              `surfaces.${role}.${mode} material ${label} blur=${specMaterial.blur} outside [4, 60]`,
            );
          }
          if (
            specMaterial.saturate !== undefined &&
            (specMaterial.saturate < 0.8 || specMaterial.saturate > 2.5)
          ) {
            fail(
              `surfaces.${role}.${mode} material ${label} saturate=${specMaterial.saturate} outside [0.8, 2.5]`,
            );
          }
          if (
            specMaterial.minOpacity !== undefined &&
            (specMaterial.minOpacity < 0.55 || specMaterial.minOpacity > 1)
          ) {
            fail(
              `surfaces.${role}.${mode} material ${label} minOpacity=${specMaterial.minOpacity} outside [0.55, 1]`,
            );
          }
        }
        const minOpacity = resolveMaterial(merged.material).minOpacity;
        const alpha = backgroundAlpha(merged.background, entry, mode);
        if (alpha !== undefined && alpha < minOpacity) {
          fail(`surfaces.${role}.${mode} material ${label} alpha ${alpha} < ${minOpacity}`);
        }
      }
      if (merged.effect) {
        const intensity = merged.effect.intensity;
        if (!(intensity === undefined || (intensity > 0 && intensity <= 1))) {
          fail(
            `surfaces.${role}.${mode} effect ${merged.effect.kind} intensity=${String(intensity)} outside (0, 1]`,
          );
        }
      }
    }
  }

  return failures;
}
