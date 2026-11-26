import { colors, shape } from "@shadcn-nsh/theme";
import {
  choiceTileLook,
  drawIcon,
  type IconCanvas,
  iconImage,
  knobOffset,
  knobTravel,
  listRow,
  mergeClasses,
  type PartMap,
  type SwitchGeometry,
  switchSlop,
} from "@shadcn-nsh/ui";
import { mount, Text, View } from "nsh";

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
  { name: "winui touch", width: 48, height: 24, border: 1, knob: 16, knobHeight: 16 },
  { name: "winui sm pointer", width: 32, height: 16, border: 1, knob: 10, knobHeight: 10 },
  { name: "winui sm touch", width: 40, height: 20, border: 1, knob: 14, knobHeight: 14 },
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
