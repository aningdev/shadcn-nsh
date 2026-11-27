import { colors, control, motion, selectTheme, shape, surface } from "@shadcn-nsh/theme";
import {
  choiceTileLook,
  comboboxLook,
  drawIcon,
  fieldFocusEdge,
  type IconCanvas,
  iconImage,
  inputLook,
  knobOffset,
  knobTravel,
  listRow,
  mergeClasses,
  type PartMap,
  pickerLook,
  type SwitchGeometry,
  switchSlop,
} from "@shadcn-nsh/ui";
import { mount, Text, View } from "nsh";

import apple from "../../../packages/theme/themes/apple/index";
import material from "../../../packages/theme/themes/material/index";
import solidGlass from "../../../packages/theme/themes/solid-glass/index";
import winui from "../../../packages/theme/themes/winui/index";

type IconNode = Parameters<typeof drawIcon>[0];
const CHECK_ICON: IconNode = [["path", { d: "M20 6 9 17l-5-5" }]];

function sameValue(a: unknown, b: unknown): boolean {
  if (Object.is(a, b)) return true;
  if (typeof a !== typeof b || a === null || b === null) return false;
  if (Array.isArray(a) || Array.isArray(b)) {
    if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) return false;
    return a.every((v, i) => sameValue(v, b[i]));
  }
  if (typeof a === "object" && typeof b === "object") {
    const ka = Object.keys(a as Record<string, unknown>).filter(
      (k) => (a as Record<string, unknown>)[k] !== undefined,
    );
    const kb = Object.keys(b as Record<string, unknown>).filter(
      (k) => (b as Record<string, unknown>)[k] !== undefined,
    );
    if (ka.length !== kb.length) return false;
    return ka.every((k) =>
      sameValue((a as Record<string, unknown>)[k], (b as Record<string, unknown>)[k]),
    );
  }
  return false;
}

function check(name: string, fn: () => string | null): string {
  try {
    const err = fn();
    return err === null ? `PASS:${name}` : `FAIL:${name}:${err}`;
  } catch (error) {
    return `FAIL:${name}:${error instanceof Error ? error.message : String(error)}`;
  }
}

type Look = {
  root?: string;
  content?: string;
  caret?: string | null;
  nodes?: PartMap;
  marks?: PartMap;
};

const look: Look = {
  root: "flex",
  content: "gap-3 px-6 py-5",
  caret: "w-px",
  nodes: { paragraph: "leading-relaxed", "heading[level=2]": "text-2xl" },
  marks: { bold: "font-bold", italic: "italic" },
};

type Recorder = IconCanvas<string> & { calls: string[] };

function recorder(): Recorder {
  const calls: string[] = [];
  const at = (...values: number[]) => values.map(String).join(" ");
  return {
    calls,
    beginPath: () => calls.push("beginPath"),
    moveTo: (...point) => calls.push(`moveTo ${at(...point)}`),
    lineTo: (...point) => calls.push(`lineTo ${at(...point)}`),
    closePath: () => calls.push("closePath"),
    arc: (x, y, radius, start, end) => calls.push(`arc ${at(x, y, radius, start, end)}`),
    ellipse: (x, y, rx, ry, rotation, start, end) =>
      calls.push(`ellipse ${at(x, y, rx, ry, rotation, start, end)}`),
    roundRect: (x, y, w, h, radius) => calls.push(`roundRect ${at(x, y, w, h, radius ?? 0)}`),
    stroke: (path) => calls.push(path == null ? "stroke" : `stroke ${path}`),
    fill: (path) => calls.push(path == null ? "fill" : `fill ${path}`),
  };
}

const drawn = (icon: IconNode, fill = false) => {
  const canvas = recorder();
  drawIcon(icon, canvas, { fill, path: (d) => `path(${d})` });
  return canvas.calls;
};

const TURN = String(Math.PI * 2);

function svgOf(url: string): string | null {
  const prefix = "data:image/svg+xml,";
  return url.startsWith(prefix) ? decodeURIComponent(url.slice(prefix.length)) : null;
}

const geometryCases = [
  { name: "default pointer", width: 36, height: 20, border: 1, knob: 16, knobHeight: 16 },
  { name: "shadcn pointer", width: 32, height: 18, border: 0, knob: 16, knobHeight: 16 },
  { name: "material pointer", width: 40, height: 24, border: 1, knob: 16, knobHeight: 16 },
  { name: "material sm pointer", width: 32, height: 20, border: 1, knob: 12, knobHeight: 12 },
  { name: "material sm touch", width: 40, height: 24, border: 2, knob: 16, knobHeight: 16 },
  { name: "winui pointer", width: 40, height: 20, border: 1, knob: 12, knobHeight: 12 },
  { name: "winui touch", width: 44, height: 22, border: 1, knob: 14, knobHeight: 14 },
  { name: "winui sm pointer", width: 32, height: 16, border: 1, knob: 10, knobHeight: 10 },
  { name: "winui sm touch", width: 36, height: 18, border: 1, knob: 12, knobHeight: 12 },
  { name: "apple default pointer", width: 54, height: 24, border: 0, knob: 31, knobHeight: 20 },
  { name: "apple default touch", width: 63, height: 28, border: 0, knob: 37, knobHeight: 24 },
  { name: "apple sm pointer", width: 40, height: 18, border: 0, knob: 23, knobHeight: 14 },
];

const results: string[] = [
  check("mergeClasses:keeps-none", () =>
    mergeClasses(look) === look && mergeClasses(look, null) === look ? null : "identity mismatch",
  ),
  check("mergeClasses:appends-part", () =>
    sameValue(mergeClasses(look, { root: "p-4" }), { ...look, root: "flex p-4" })
      ? null
      : "append mismatch",
  ),
  check("mergeClasses:drops-null", () =>
    sameValue(mergeClasses(look, { caret: null, content: undefined }), {
      root: "flex",
      content: "gap-3 px-6 py-5",
      nodes: look.nodes,
      marks: look.marks,
    })
      ? null
      : "null drop mismatch",
  ),
  check("mergeClasses:merges-maps", () =>
    sameValue(
      mergeClasses(look, {
        nodes: { paragraph: "text-xl", blockquote: "italic" },
        marks: { bold: null, link: "underline" },
      }),
      {
        root: "flex",
        content: "gap-3 px-6 py-5",
        caret: "w-px",
        nodes: {
          paragraph: "leading-relaxed text-xl",
          "heading[level=2]": "text-2xl",
          blockquote: "italic",
        },
        marks: { italic: "italic", link: "underline" },
      },
    )
      ? null
      : "map merge mismatch",
  ),
  check("mergeClasses:immutable-base", () => {
    mergeClasses(look, { nodes: { paragraph: "text-xl" } });
    return sameValue(look.nodes, {
      paragraph: "leading-relaxed",
      "heading[level=2]": "text-2xl",
    })
      ? null
      : "mutated base";
  }),
  check("drawIcon:path", () =>
    sameValue(drawn([["path", { d: "M5 5h14" }]]), ["stroke path(M5 5h14)"])
      ? null
      : "path mismatch",
  ),
  check("drawIcon:multi-path", () =>
    sameValue(
      drawn([
        ["path", { d: "M0 0h1" }],
        ["path", { d: "M2 2h3" }],
      ]),
      ["stroke path(M0 0h1)", "stroke path(M2 2h3)"],
    )
      ? null
      : "multi-path mismatch",
  ),
  check("drawIcon:circle", () =>
    sameValue(drawn([["circle", { cx: "12", cy: "12", r: "10" }]]), [
      "beginPath",
      `arc 12 12 10 0 ${TURN}`,
      "stroke",
    ])
      ? null
      : "circle mismatch",
  ),
  check("drawIcon:ellipse", () =>
    sameValue(drawn([["ellipse", { cx: "12", cy: "5", rx: "6", ry: "2" }]]), [
      "beginPath",
      `ellipse 12 5 6 2 0 0 ${TURN}`,
      "stroke",
    ])
      ? null
      : "ellipse mismatch",
  ),
  check("drawIcon:rect", () =>
    sameValue(drawn([["rect", { x: "3", y: "4", width: "18", height: "16", rx: "2" }]]), [
      "beginPath",
      "roundRect 3 4 18 16 2",
      "stroke",
    ]) &&
    sameValue(drawn([["rect", { x: "3", y: "4", width: "18", height: "16" }]]), [
      "beginPath",
      "roundRect 3 4 18 16 0",
      "stroke",
    ])
      ? null
      : "rect mismatch",
  ),
  check("drawIcon:line", () =>
    sameValue(drawn([["line", { x1: "4", y1: "12", x2: "20", y2: "12" }]]), [
      "beginPath",
      "moveTo 4 12",
      "lineTo 20 12",
      "stroke",
    ])
      ? null
      : "line mismatch",
  ),
  check("drawIcon:polyline-polygon", () => {
    const points = "4,6 20,6 20,18";
    return sameValue(drawn([["polyline", { points }]]), [
      "beginPath",
      "moveTo 4 6",
      "lineTo 20 6",
      "lineTo 20 18",
      "stroke",
    ]) &&
      sameValue(drawn([["polygon", { points }]]), [
        "beginPath",
        "moveTo 4 6",
        "lineTo 20 6",
        "lineTo 20 18",
        "closePath",
        "stroke",
      ])
      ? null
      : "polyline/polygon mismatch";
  }),
  check("drawIcon:fill", () =>
    sameValue(
      drawn(
        [
          ["path", { d: "M5 5h14" }],
          ["circle", { cx: "12", cy: "12", r: "2" }],
        ],
        true,
      ),
      ["fill path(M5 5h14)", "beginPath", `arc 12 12 2 0 ${TURN}`, "fill"],
    )
      ? null
      : "fill mismatch",
  ),
  check("drawIcon:unsupported-dropped", () =>
    sameValue(
      drawn([
        ["style", { d: "irrelevant" }],
        ["polyline", { points: "4,6" }],
      ]),
      [],
    )
      ? null
      : "unsupported mismatch",
  ),
  check("iconImage:default-svg", () => {
    const svg = svgOf(iconImage(CHECK_ICON));
    return svg ===
      '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>'
      ? null
      : `svg=${svg}`;
  }),
  check("iconImage:attrs", () => {
    const icon: IconNode = [
      ["circle", { cx: 12, cy: 12, r: 10, fill: "currentColor" }],
      ["path", { d: "M8 12h8" }],
    ];
    const svg = svgOf(iconImage(icon));
    return svg !== null &&
      svg.includes('<circle cx="12" cy="12" r="10" fill="currentColor"/>') &&
      svg.includes('<path d="M8 12h8"/>')
      ? null
      : "attrs mismatch";
  }),
  check("iconImage:omit-undefined", () => {
    const svg = svgOf(iconImage([["path", { d: "M0 0", opacity: undefined }]]));
    return svg !== null && svg.includes('<path d="M0 0"/>') ? null : "undefined attr mismatch";
  }),
  check("iconImage:ink-weight", () => {
    const svg = svgOf(iconImage(CHECK_ICON, { weight: 3, ink: "#000" }));
    return svg !== null &&
      svg.includes('stroke="#000"') &&
      svg.includes('stroke-width="3"') &&
      !svg.includes("currentColor")
      ? null
      : "ink/weight mismatch";
  }),
  check("switchGeometry:symmetry", () => {
    for (const c of geometryCases) {
      const inset = Math.max(0, (c.height - c.knobHeight) / 2 - c.border);
      const g: SwitchGeometry = {
        width: c.width,
        height: c.height,
        border: c.border,
        inset,
        knob: c.knob,
        knobHeight: c.knobHeight,
      };
      const pad = knobOffset(g);
      const travel = knobTravel(g);
      if (pad < 0 || travel <= 0 || pad + travel + g.knob !== g.width - 2 * g.border - pad) {
        return `case=${c.name}`;
      }
    }
    return null;
  }),
  check("switchGeometry:switchSlop", () => {
    const slop = switchSlop({ width: 36, height: 20, border: 1, inset: 1, knob: 16 }, 44);
    return sameValue(slop, { top: 12, bottom: 12, left: 4, right: 4 })
      ? null
      : JSON.stringify(slop);
  }),
  check("checkbox:listRowHover", () => {
    const enabled = listRow().hoverStyle;
    const disabled = listRow({ disabled: true }).hoverStyle;
    if (disabled !== undefined) return `disabled=${JSON.stringify(disabled)}`;
    if (!enabled || enabled.backgroundColor !== colors.accent) {
      return `enabled=${JSON.stringify(enabled)}`;
    }
    if (
      enabled.backgroundColor === colors.primary ||
      enabled.borderColor !== undefined ||
      enabled.boxShadow !== undefined
    ) {
      return `accentStyleLeak=${JSON.stringify(enabled)}`;
    }
    return null;
  }),
  check("checkbox:choiceTileCorner", () => {
    const radius = choiceTileLook(() => false).style.borderRadius;
    return radius === shape.control ? null : `radius=${String(radius)}`;
  }),
  check("apple:liquidGlass", () => {
    selectTheme(apple);
    try {
      const glass = surface("glass");
      const overlay = surface("overlay");
      const modal = surface("modal");
      if (glass.style.glassEffect !== "clear")
        return `glassEffect=${String(glass.style.glassEffect)}`;
      if (overlay.style.glassEffect !== "regular") {
        return `overlayGlass=${String(overlay.style.glassEffect)}`;
      }
      if (modal.style.glassEffect !== "regular") {
        return `modalGlass=${String(modal.style.glassEffect)}`;
      }
      const filters: Record<string, string> = {
        glass: "blur(26px) saturate(200%)",
        overlay: "blur(30px) saturate(190%)",
        modal: "blur(36px) saturate(180%)",
      };
      for (const [name, layer] of [
        ["glass", glass],
        ["overlay", overlay],
        ["modal", modal],
      ] as const) {
        if (layer.style.backdropFilter !== filters[name]) {
          return `${name} blur=${String(layer.style.backdropFilter)}`;
        }
        const shadow = layer.style.boxShadow;
        const shadowText = typeof shadow === "string" ? shadow : JSON.stringify(shadow ?? null);
        if (!shadowText.includes("inset 0 1px 0")) return `${name} shadow=${shadowText}`;
      }
      if (glass.platformProps.macos !== undefined) {
        return `glass macos=${JSON.stringify(glass.platformProps.macos)}`;
      }
      if (overlay.platformProps.macos !== undefined) return "overlay macos";
      if (modal.platformProps.macos !== undefined) return "modal macos";
      if (glass.platformProps.ios?.backdropMaterial !== "ultraThin") return "glass ios";
      if (overlay.platformProps.ios?.backdropMaterial !== "regular") return "overlay ios";
      if (modal.platformProps.ios?.backdropMaterial !== "thick") return "modal ios";
      if (motion.springCss({ stiffness: 360, damping: 30, mass: 1 }) !== "spring(360, 30)") {
        return "springCss mass 1";
      }
      if (motion.springCss({ stiffness: 360, damping: 30, mass: 1.2 }) !== "spring(360, 30, 1.2)") {
        return "springCss mass";
      }
      const reveal = motion.revealSpring;
      const pressed = motion.pressSpring;
      if (!reveal || reveal.stiffness !== 340 || reveal.damping !== 34) {
        return `reveal=${JSON.stringify(reveal)}`;
      }
      if (!pressed || pressed.stiffness !== 520 || pressed.damping !== 34) {
        return `press=${JSON.stringify(pressed)}`;
      }
      return null;
    } finally {
      selectTheme(null);
    }
  }),
  check("winui:acrylic", () => {
    selectTheme(winui);
    try {
      const roles = ["overlay", "glass", "inverse", "modal"] as const;
      for (const role of roles) {
        const layer = surface(role);
        const filter = String(layer.style.backdropFilter ?? "");
        if (!filter.includes("blur(") || !filter.includes("saturate(")) {
          return `${role} blur=${filter}`;
        }
        const shadow = layer.style.boxShadow;
        const shadowText = typeof shadow === "string" ? shadow : JSON.stringify(shadow ?? null);
        if (!shadowText.includes("inset 0 1px 0")) return `${role} shadow=${shadowText}`;
        if (layer.platformProps.windows?.backdrop.material !== "blur") {
          return `${role} windows=${JSON.stringify(layer.platformProps.windows)}`;
        }
      }
      const zeta = (stiffness: number, damping: number, mass = 1) =>
        damping / (2 * Math.sqrt(stiffness * mass));
      for (const role of ["snappy", "smooth", "bouncy"] as const) {
        const spring = motion.springOf(role);
        if (!spring) return `missing ${role}`;
        const ratio = zeta(spring.stiffness, spring.damping, spring.mass ?? 1);
        if (ratio < 1) return `${role} zeta=${String(ratio)}`;
      }
      const reveal = motion.revealSpring;
      if (!reveal || reveal.stiffness !== 420 || reveal.damping !== 42) {
        return `reveal=${JSON.stringify(reveal)}`;
      }
      if (motion.pressSpring !== undefined) return `press=${JSON.stringify(motion.pressSpring)}`;
      return null;
    } finally {
      selectTheme(null);
    }
  }),
  check("materialAndSolidGlass", () => {
    const readReveal = () => motion.revealSpring;
    const readPress = () => motion.pressSpring;
    try {
      selectTheme(material);
      if (motion.springOf("snappy")?.stiffness !== 520) return "material snappy";
      if (motion.springOf("smooth")?.damping !== 38) return "material smooth";
      if (motion.springOf("bouncy")?.damping !== 22) return "material bouncy";
      if (readReveal()?.stiffness !== 360) return "material reveal";
      if (readPress() !== undefined) return "material press";

      selectTheme(solidGlass);
      for (const role of ["overlay", "inverse", "modal"] as const) {
        const layer = surface(role);
        const filter = String(layer.style.backdropFilter ?? "");
        if (!filter.includes("blur(") || !filter.includes("saturate(")) {
          return `solidGlass ${role} blur=${filter}`;
        }
        const shadowText =
          typeof layer.style.boxShadow === "string"
            ? layer.style.boxShadow
            : JSON.stringify(layer.style.boxShadow ?? null);
        if (!shadowText.includes("inset 0 1px 0")) {
          return `solidGlass ${role} shadow=${shadowText}`;
        }
      }
      if (motion.springOf("snappy")?.stiffness !== 420) return "solidGlass snappy";
      if (motion.springOf("smooth")?.damping !== 30) return "solidGlass smooth";
      if (motion.springOf("bouncy")?.damping !== 24) return "solidGlass bouncy";
      if (readReveal()?.stiffness !== 280) return "solidGlass reveal";
      return null;
    } finally {
      selectTheme(null);
    }
  }),
  check("fieldFocusLine:noBlackOutlineFlash", () => {
    try {
      for (const theme of [winui, material] as const) {
        selectTheme(theme);
        const input = inputLook();
        if (input.style.outlineStyle !== "none" || input.style.outlineWidth !== 0) {
          return `${theme.id} input rest outline=${String(input.style.outlineStyle)}/${String(input.style.outlineWidth)}`;
        }
        if (
          input.focusStyle.outlineStyle !== "none" ||
          input.focusStyle.outlineWidth !== 0 ||
          input.focusStyle.outlineColor !== undefined ||
          input.focusStyle.borderBottomWidth !== 2 ||
          input.focusStyle.borderBottomColor !== colors.brand
        ) {
          return `${theme.id} input focus=${JSON.stringify(input.focusStyle)}`;
        }
        const select = pickerLook();
        if (select.style.outlineStyle !== "none" || select.style.outlineWidth !== 0) {
          return `${theme.id} select rest outline=${String(select.style.outlineStyle)}`;
        }
        const combo = comboboxLook(false);
        if (combo.style.outlineStyle !== "none" || combo.inputStyle.outlineStyle !== "none") {
          return `${theme.id} combo outline=${String(combo.style.outlineStyle)}/${String(combo.inputStyle.outlineStyle)}`;
        }
        const edge = fieldFocusEdge(control("field"), colors.brand);
        if (edge.outlineStyle !== "none" || edge.outlineColor !== undefined) {
          return `${theme.id} edge=${JSON.stringify(edge)}`;
        }
      }
      selectTheme(apple);
      const appleFocus = inputLook().focusStyle;
      if (appleFocus.outlineStyle !== "solid" || (appleFocus.outlineWidth ?? 0) <= 0) {
        return `apple focus=${JSON.stringify(appleFocus)}`;
      }
      return null;
    } finally {
      selectTheme(null);
    }
  }),
];

function App() {
  return (
    <View>
      <Text>{`TOTAL:${results.length}`}</Text>
      <Each of={results}>{(line) => <Text>{String(line())}</Text>}</Each>
    </View>
  );
}

mount(App);
