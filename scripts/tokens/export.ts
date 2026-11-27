/**
 * One-way exporters from Theme v5 TypeScript specs (`ThemeSpec` / `AppTheme`) to:
 * 1. `theme.json` (`AppTheme.theme`: NSH CSS variables, always including `font-sans` / `font-mono`)
 * 2. Standalone W3C DTCG 2025.10 `{light,dark}.tokens.json` (for Figma / Tokens Studio)
 * 3. Google Labs `DESIGN.md` (`version: "alpha"`, passing `@google/design.md/linter`)
 */
import {
  EASING_BEZIERS,
  SHARED_TYPE_SCALE,
  type AppTheme,
  type ColorExpr,
  type Mode,
  type SurfaceLayer,
  type TypeRole,
} from "../../packages/theme/schema";
import { resolveColour, varsOf } from "../theme/css-colour";
import { parseColor, rgbToOklch, type Rgb } from "../theme/oklch";
import { oklchToHex6, srgbToHex6 } from "./color";

const FORMAT_SCHEMA = "https://www.designtokens.org/schemas/2025.10/format.json";
const TYPE_ROLES: readonly TypeRole[] = [
  "caption",
  "detail",
  "body",
  "label",
  "title",
  "headline",
  "display",
];

const rgbToHex = (rgb: Rgb): string => {
  const hex6 = srgbToHex6(rgb.r / 255, rgb.g / 255, rgb.b / 255);
  if (rgb.a !== undefined && rgb.a < 1) {
    const aHex = Math.round(Math.max(0, Math.min(1, rgb.a)) * 255)
      .toString(16)
      .padStart(2, "0");
    return `${hex6}${aHex}`;
  }
  return hex6;
};

const toDtcgColor = (rgb: Rgb) => {
  const { l, c, h } = rgbToOklch(rgb);
  const r5 = (n: number) => Number(n.toFixed(5));
  const r3 = (n: number) => Number(n.toFixed(3));
  const l5 = r5(l);
  const c5 = r5(c);
  const h3 = r3(h);
  return {
    colorSpace: "oklch" as const,
    components: [l5, c5, h3] as [number, number, number],
    ...(rgb.a !== undefined && rgb.a < 1 ? { alpha: Number(rgb.a.toFixed(4)) } : {}),
    hex: oklchToHex6(l5, c5, h3),
  };
};

function resolvedCssVars(entry: AppTheme, mode: Mode): Record<string, string> {
  return { ...entry.theme.cssVars.theme, ...entry.theme.cssVars[mode] };
}

function resolveColorValue(expr: ColorExpr, entry: AppTheme, mode: Mode): Rgb | undefined {
  const cssVars = resolvedCssVars(entry, mode);
  const vars = varsOf(cssVars);
  if (typeof expr === "string") {
    if (expr in cssVars) return resolveColour(cssVars[expr]!, vars);
    if (expr === "transparent" || expr === "none") return undefined;
    return resolveColour(expr, vars);
  }
  if ("color" in expr) {
    const base =
      expr.color in cssVars ? resolveColour(cssVars[expr.color]!, vars) : parseColor(expr.color);
    return { ...base, a: expr.alpha };
  }
  if ("tint" in expr) {
    const custom = entry.spec.tokens.tints?.[mode]?.[expr.tint];
    if (custom) return resolveColour(custom, vars);
    const baseKey = expr.tint;
    const base = resolveColour(cssVars[baseKey] ?? cssVars.primary!, vars);
    return { ...base, a: expr.alpha ?? entry.spec.tokens.tintAlpha[mode] };
  }
  return undefined;
}

function mergedSurface(
  entry: AppTheme,
  role: keyof AppTheme["spec"]["surfaces"],
  mode: Mode,
): SurfaceLayer {
  const s = entry.spec.surfaces[role];
  return { ...s, ...s[mode] };
}

/** Export a standalone W3C DTCG 2025.10 `{light,dark}.tokens.json` document at pointer tier. */
export function exportDtcgTokens(entry: AppTheme, mode: Mode): Record<string, unknown> {
  const cssVars = resolvedCssVars(entry, mode);
  const vars = varsOf(cssVars);
  const { spec } = entry;

  const colorEntries: Record<string, unknown> = {
    $type: "color",
    $description: `${entry.label} (${mode}) palette colors.`,
  };
  const allColorKeys = [...Object.keys(entry.theme.cssVars[mode]), "scrim", "media", "on-media"];
  for (const key of allColorKeys) {
    const raw = cssVars[key];
    if (!raw) continue;
    const rgb = resolveColour(raw, vars);
    colorEntries[key] = { $value: toDtcgColor(rgb) };
  }

  const typographyEntries: Record<string, unknown> = {
    $type: "typography",
    $description: "Pointer-tier typography roles.",
  };
  for (const role of TYPE_ROLES) {
    const scale = SHARED_TYPE_SCALE[role];
    const m = spec.metrics.typography[role];
    typographyEntries[role] = {
      $value: {
        fontFamily: spec.tokens.font?.sans ?? "system-ui",
        fontSize: { value: scale.fontSize.pointer, unit: "px" },
        fontWeight: m.fontWeight,
        lineHeight: Number((scale.lineHeight.pointer / scale.fontSize.pointer).toFixed(4)),
        letterSpacing: { value: m.letterSpacing, unit: "px" },
      },
    };
  }

  const dim = (value: number) => ({ $value: { value, unit: "px" } });
  const dimension = {
    $type: "dimension",
    radius: {
      control: dim(spec.tokens.radius.control),
      container: dim(spec.tokens.radius.container),
      modal: dim(spec.tokens.radius.modal),
    },
    size: {
      hit: dim(spec.metrics.hit.pointer),
      density: {
        pad: dim(spec.metrics.density.pointer.pad),
        gap: dim(spec.metrics.density.pointer.gap),
      },
      item: {
        inset: dim(spec.metrics.item.pointer.inset),
        pad: dim(spec.metrics.item.pointer.pad),
      },
      control: {
        padding: dim(spec.metrics.control.pointer.padding),
        gap: dim(spec.metrics.control.pointer.gap),
      },
      height: {
        sm: dim(spec.metrics.height.pointer.sm),
        md: dim(spec.metrics.height.pointer.md),
        lg: dim(spec.metrics.height.pointer.lg),
      },
    },
    icon: {
      sm: dim(spec.metrics.icon.pointer.sm),
      md: dim(spec.metrics.icon.pointer.md),
      lg: dim(spec.metrics.icon.pointer.lg),
    },
    stroke: {
      hairline: dim(spec.metrics.stroke.hairline),
      control: dim(spec.metrics.stroke.control),
    },
    focus: {
      width: dim(spec.feedback.focus.width),
      offset: dim(spec.feedback.focus.offset),
    },
  };

  const motionEntries: Record<string, unknown> = { $type: "transition" };
  for (const role of ["fast", "default", "slow", "state"] as const) {
    const t = spec.motion[role];
    motionEntries[role] = {
      $value: {
        duration: { value: t.duration, unit: "ms" },
        delay: { value: 0, unit: "ms" },
        timingFunction: [...EASING_BEZIERS[t.easing]],
      },
    };
  }

  return {
    $schema: FORMAT_SCHEMA,
    $description: `${entry.label} (${mode}, pointer tier) W3C DTCG 2025.10 export.`,
    color: colorEntries,
    typography: typographyEntries,
    dimension,
    motion: motionEntries,
  };
}

function formatYamlScalar(value: unknown): string {
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  const str = String(value);
  if (/^[a-zA-Z0-9._-]+$/.test(str) && !/^(true|false|null|yes|no|on|off)$/i.test(str)) {
    return str;
  }
  return JSON.stringify(str);
}

function serializeYaml(obj: Record<string, unknown>, indent = 0): string[] {
  const pad = "  ".repeat(indent);
  const lines: string[] = [];
  for (const [key, val] of Object.entries(obj)) {
    if (val === undefined) continue;
    const safeKey = /^[a-zA-Z0-9_-]+$/.test(key) ? key : JSON.stringify(key);
    if (typeof val === "object" && val !== null && !Array.isArray(val)) {
      lines.push(`${pad}${safeKey}:`);
      lines.push(...serializeYaml(val as Record<string, unknown>, indent + 1));
    } else if (Array.isArray(val)) {
      lines.push(`${pad}${safeKey}:`);
      for (const item of val) lines.push(`${pad}  - ${formatYamlScalar(item)}`);
    } else {
      lines.push(`${pad}${safeKey}: ${formatYamlScalar(val)}`);
    }
  }
  return lines;
}

/** Export a Google Labs DESIGN.md (`version: "alpha"`) document from a `ThemeSpec`. */
export function exportDesignMd(entry: AppTheme): string {
  const { spec } = entry;
  const lightVars = resolvedCssVars(entry, "light");
  const darkVars = resolvedCssVars(entry, "dark");
  const lVars = varsOf(lightVars);
  const dVars = varsOf(darkVars);

  const sharedColorsYaml: Record<string, string> = {};
  const lightColorsYaml: Record<string, string> = {};
  const darkColorsYaml: Record<string, string> = {};
  for (const key of ["scrim", "media", "on-media"] as const) {
    sharedColorsYaml[key] = rgbToHex(resolveColour(lightVars[key]!, lVars));
  }
  for (const key of Object.keys(entry.theme.cssVars.light)) {
    lightColorsYaml[key] = rgbToHex(resolveColour(lightVars[key]!, lVars));
    darkColorsYaml[key] = rgbToHex(resolveColour(darkVars[key]!, dVars));
  }

  const typographyYaml: Record<string, Record<string, unknown>> = {};
  for (const role of TYPE_ROLES) {
    const scale = SHARED_TYPE_SCALE[role];
    const m = spec.metrics.typography[role];
    typographyYaml[role] = {
      fontSize: `${scale.fontSize.pointer}px`,
      fontWeight: m.fontWeight,
      lineHeight: `${scale.lineHeight.pointer}px`,
      letterSpacing: `${m.letterSpacing}px`,
    };
  }

  const roundedYaml = {
    control: `${spec.tokens.radius.control}px`,
    container: `${spec.tokens.radius.container}px`,
    modal: `${spec.tokens.radius.modal}px`,
  };

  const spacingYaml = {
    hit: `${spec.metrics.hit.pointer}px`,
    density: {
      pad: `${spec.metrics.density.pointer.pad}px`,
      gap: `${spec.metrics.density.pointer.gap}px`,
    },
    item: {
      inset: `${spec.metrics.item.pointer.inset}px`,
      pad: `${spec.metrics.item.pointer.pad}px`,
    },
    control: {
      padding: `${spec.metrics.control.pointer.padding}px`,
      gap: `${spec.metrics.control.pointer.gap}px`,
    },
    height: {
      sm: `${spec.metrics.height.pointer.sm}px`,
      md: `${spec.metrics.height.pointer.md}px`,
      lg: `${spec.metrics.height.pointer.lg}px`,
    },
    stroke: {
      hairline: `${spec.metrics.stroke.hairline}px`,
      control: `${spec.metrics.stroke.control}px`,
    },
    focus: {
      width: `${spec.feedback.focus.width}px`,
      offset: `${spec.feedback.focus.offset}px`,
    },
    icon: {
      sm: `${spec.metrics.icon.pointer.sm}px`,
      md: `${spec.metrics.icon.pointer.md}px`,
      lg: `${spec.metrics.icon.pointer.lg}px`,
    },
  };

  const motionYaml: Record<string, Record<string, string>> = {};
  for (const role of ["fast", "default", "slow", "state"] as const) {
    const t = spec.motion[role];
    motionYaml[role] = {
      duration: `${t.duration}ms`,
      delay: "0ms",
      timingFunction: `cubic-bezier(${EASING_BEZIERS[t.easing].join(", ")})`,
    };
  }

  const colorHexOrRef = (expr: ColorExpr | null | undefined): string | undefined => {
    if (!expr) return undefined;
    if (typeof expr === "string") {
      if (expr in lightColorsYaml) return `{colors.light.${expr}}`;
      if (expr in sharedColorsYaml) return `{colors.${expr}}`;
    }
    const rgb = resolveColorValue(expr, entry, "light");
    return rgb ? rgbToHex(rgb) : undefined;
  };

  const surfaceBg = (role: keyof AppTheme["spec"]["surfaces"], fallback: string) =>
    colorHexOrRef(mergedSurface(entry, role, "light").background) ?? fallback;

  const surfaceFg = (role: keyof AppTheme["spec"]["surfaces"], fallback: string) =>
    colorHexOrRef(mergedSurface(entry, role, "light").foreground) ?? fallback;

  const componentsYaml: Record<string, Record<string, string>> = {
    "button-primary": {
      backgroundColor: surfaceBg("accent", "{colors.light.primary}"),
      textColor: surfaceFg("accent", "{colors.light.primary-foreground}"),
      typography: "{typography.label}",
      rounded: "{rounded.control}",
      height: "{spacing.height.md}",
      padding: "{spacing.density.gap}",
    },
    "button-secondary": {
      backgroundColor: surfaceBg("raised", "{colors.light.surface}"),
      textColor: "{colors.light.foreground}",
      typography: "{typography.label}",
      rounded: "{rounded.control}",
      height: "{spacing.height.md}",
      padding: "{spacing.density.gap}",
    },
    card: {
      backgroundColor: surfaceBg("card", "{colors.light.card}"),
      textColor: "{colors.light.foreground}",
      typography: "{typography.body}",
      rounded: "{rounded.container}",
      padding: "{spacing.density.pad}",
    },
    "input-field": {
      backgroundColor:
        colorHexOrRef(
          typeof spec.controls.field.ground === "object" && "light" in spec.controls.field.ground
            ? spec.controls.field.ground.light
            : (spec.controls.field.ground as ColorExpr),
        ) ?? "{colors.light.card}",
      textColor: "{colors.light.foreground}",
      typography: "{typography.label}",
      rounded: "{rounded.control}",
      height: "{spacing.height.md}",
      padding: "{spacing.control.padding}",
    },
    "menu-popover": {
      backgroundColor: surfaceBg("overlay", "{colors.light.popover}"),
      textColor: "{colors.light.foreground}",
      typography: "{typography.body}",
      rounded: "{rounded.container}",
      padding: "{spacing.control.padding}",
    },
    dialog: {
      backgroundColor: surfaceBg("modal", "{colors.light.card}"),
      textColor: "{colors.light.foreground}",
      typography: "{typography.body}",
      rounded: "{rounded.modal}",
      padding: "{spacing.density.pad}",
    },
    tooltip: {
      backgroundColor: surfaceBg("inverse", "{colors.light.card}"),
      textColor: surfaceFg("inverse", "{colors.light.foreground}"),
      typography: "{typography.detail}",
      rounded: "{rounded.container}",
    },
  };

  const frontmatter: Record<string, unknown> = {
    version: "alpha",
    name: spec.label,
    description: spec.meta?.overview ?? `${spec.label} theme specification.`,
    colors: {
      ...sharedColorsYaml,
      light: lightColorsYaml,
      dark: darkColorsYaml,
    },
    typography: typographyYaml,
    rounded: roundedYaml,
    spacing: spacingYaml,
    motion: motionYaml,
    components: componentsYaml,
  };

  const lines: string[] = [];
  lines.push("---");
  lines.push(...serializeYaml(frontmatter));
  lines.push("---");
  lines.push("");
  lines.push(`# ${spec.label}`);
  lines.push("");
  lines.push("## Overview");
  lines.push("");
  lines.push(spec.meta?.overview ?? `${spec.label} theme.`);
  lines.push("");
  lines.push("## Colors");
  lines.push("");
  for (const key of Object.keys(lightColorsYaml)) {
    lines.push(
      `- **\`${key}\`**: light \`${lightColorsYaml[key]}\`, dark \`${darkColorsYaml[key]}\``,
    );
  }
  lines.push("");
  lines.push("## Typography");
  lines.push("");
  const fontSans = spec.tokens.font?.sans ?? "system-ui";
  const fontMono = spec.tokens.font?.mono ?? "monospace";
  lines.push(`- \`theme.json\` writes \`font-sans: ${fontSans}\` and \`font-mono: ${fontMono}\`.`);
  for (const role of TYPE_ROLES) {
    const scale = SHARED_TYPE_SCALE[role];
    const m = spec.metrics.typography[role];
    lines.push(
      `- **\`${role}\`**: ${scale.fontSize.pointer}px / ${scale.lineHeight.pointer}px, weight ${m.fontWeight}, letter-spacing ${m.letterSpacing}px`,
    );
  }
  lines.push("");
  lines.push("## Layout");
  lines.push("");
  lines.push(
    `- Control heights (pointer): ${spec.metrics.height.pointer.sm}px / ${spec.metrics.height.pointer.md}px / ${spec.metrics.height.pointer.lg}px; touch hit target: ${spec.metrics.hit.touch}px.`,
  );
  lines.push("");
  lines.push("## Elevation & Depth");
  lines.push("");
  lines.push(
    spec.meta?.elevationNote ?? "Semantic surface layers with configurable shadows and borders.",
  );
  lines.push("");
  lines.push("## Shapes");
  lines.push("");
  lines.push(
    `- Radii: \`radius-md\` (control) ${spec.tokens.radius.control}px, \`radius-lg\` (container) ${spec.tokens.radius.container}px, \`radius-xl\` (modal) ${spec.tokens.radius.modal}px; A-layer \`radius\` equals \`radius-md\` (\`curve: "${spec.tokens.radius.curve}"\`).`,
  );
  lines.push("");
  lines.push("## Motion & Micro-interaction");
  lines.push("");
  const springLine = spec.motion.spring
    ? `, spring \`${spec.motion.spring.stiffness}/${spec.motion.spring.damping}/${spec.motion.spring.mass ?? 1}\``
    : "";
  lines.push(
    `- Press scale: \`${spec.feedback.press.scale}\`, state transition: ${spec.motion.state.duration}ms \`${spec.motion.state.easing}\`${springLine}, theme switch: \`${spec.motion.presets.themeSwitch.kind}\` (${spec.motion.presets.themeSwitch.duration}ms).`,
  );
  lines.push("");
  lines.push("## Voice & Content Strategy");
  lines.push("");
  lines.push(
    "Voice & Content Strategy is intentionally omitted; copy and tone belong to the host application.",
  );
  lines.push("");
  lines.push("## Components");
  lines.push("");
  lines.push(
    "Components read semantic `surface()`, `feedback`, `motion`, and `control()` primitives.",
  );
  lines.push("");
  lines.push("## Do's and Don'ts");
  lines.push("");
  lines.push(
    "- **Do:** Read colors, surfaces, feedback, and controls via `@shadcn-nsh/theme` rather than hardcoded literals.",
  );
  for (const d of spec.meta?.dos ?? []) lines.push(`- **Do:** ${d}`);
  lines.push("- **Don't:** Branch on theme IDs inside UI components.");
  for (const d of spec.meta?.donts ?? []) lines.push(`- **Don't:** ${d}`);
  lines.push("");
  return lines.join("\n");
}
