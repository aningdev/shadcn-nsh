// Built-in UI icon paths derived from lucide (ISC). See NOTICE.
// Icons: lucide's nodes drawn on a canvas, the check mark as one color's SVG, and any icon as an
// image (`iconImage`) for what takes one (a native menu item).

import { Canvas, Image, Path2D, Text } from "nsh";

import { terminal } from "../../theme";

/** A lucide icon node: `[tag, attrs][]`. An icon value from the lucide package assigns to this. */
export type IconNode = readonly (readonly [
  tag: string,
  attrs: Record<string, string | number | undefined>,
])[];

/** The `ArrowDown` icon. */
export const ArrowDown: IconNode = [
  ["path", { d: "M12 5v14" }],
  ["path", { d: "m19 12-7 7-7-7" }],
];

/** The `ArrowLeft` icon. */
export const ArrowLeft: IconNode = [
  ["path", { d: "m12 19-7-7 7-7" }],
  ["path", { d: "M19 12H5" }],
];

/** The `ArrowRight` icon. */
export const ArrowRight: IconNode = [
  ["path", { d: "M5 12h14" }],
  ["path", { d: "m12 5 7 7-7 7" }],
];

/** The `ArrowUp` icon. */
export const ArrowUp: IconNode = [
  ["path", { d: "m5 12 7-7 7 7" }],
  ["path", { d: "M12 19V5" }],
];

/** The `Calendar` icon. */
export const Calendar: IconNode = [
  ["path", { d: "M8 2v3" }],
  ["path", { d: "M16 2v3" }],
  ["rect", { x: "3", y: "3", width: "18", height: "18", rx: "2" }],
  ["path", { d: "M3 9h18" }],
];

/** The `Car` icon. */
export const Car: IconNode = [
  [
    "path",
    {
      d: "M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2",
    },
  ],
  ["circle", { cx: "7", cy: "17", r: "2" }],
  ["path", { d: "M9 17h6" }],
  ["circle", { cx: "17", cy: "17", r: "2" }],
];

/** The `Check` icon. */
export const Check: IconNode = [["path", { d: "M20 6 9 17l-5-5" }]];

/** The `ChevronDown` icon. */
export const ChevronDown: IconNode = [["path", { d: "m6 9 6 6 6-6" }]];

/** The `ChevronLeft` icon. */
export const ChevronLeft: IconNode = [["path", { d: "m15 18-6-6 6-6" }]];

/** The `ChevronRight` icon. */
export const ChevronRight: IconNode = [["path", { d: "m9 18 6-6-6-6" }]];

/** The `ChevronUp` icon. */
export const ChevronUp: IconNode = [["path", { d: "m18 15-6-6-6 6" }]];

/** The `CircleCheck` icon. */
export const CircleCheck: IconNode = [
  ["circle", { cx: "12", cy: "12", r: "10" }],
  ["path", { d: "m16 9-5.5 5.5L8 12" }],
];

/** The `CircleX` icon. */
export const CircleX: IconNode = [
  ["circle", { cx: "12", cy: "12", r: "10" }],
  ["path", { d: "m15 9-6 6" }],
  ["path", { d: "m9 9 6 6" }],
];

/** The `Clock` icon. */
export const Clock: IconNode = [
  ["circle", { cx: "12", cy: "12", r: "10" }],
  ["path", { d: "M12 6v6l4 2" }],
];

/** The `Copy` icon. */
export const Copy: IconNode = [
  ["rect", { width: "14", height: "14", x: "8", y: "8", rx: "2", ry: "2" }],
  ["path", { d: "M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" }],
];

/** The `Ellipsis` icon. */
export const Ellipsis: IconNode = [
  ["circle", { cx: "12", cy: "12", r: "1" }],
  ["circle", { cx: "19", cy: "12", r: "1" }],
  ["circle", { cx: "5", cy: "12", r: "1" }],
];

/** The `ExternalLink` icon. */
export const ExternalLink: IconNode = [
  ["path", { d: "M15 3h6v6" }],
  ["path", { d: "M10 14 21 3" }],
  ["path", { d: "M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" }],
];

/** The `File` icon. */
export const File: IconNode = [
  [
    "path",
    {
      d: "M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z",
    },
  ],
  ["path", { d: "M14 2v5a1 1 0 0 0 1 1h5" }],
];

/** The `Flag` icon. */
export const Flag: IconNode = [
  [
    "path",
    {
      d: "M4 22V4a1 1 0 0 1 .4-.8A6 6 0 0 1 8 2c3 0 5 2 7.333 2q2 0 3.067-.8A1 1 0 0 1 20 4v10a1 1 0 0 1-.4.8A6 6 0 0 1 16 16c-3 0-5-2-8-2a6 6 0 0 0-4 1.528",
    },
  ],
];

/** The `Folder` icon. */
export const Folder: IconNode = [
  [
    "path",
    {
      d: "M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z",
    },
  ],
];

/** The `FolderOpen` icon. */
export const FolderOpen: IconNode = [
  [
    "path",
    {
      d: "m6 14 1.5-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.54 6a2 2 0 0 1-1.95 1.5H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H18a2 2 0 0 1 2 2v2",
    },
  ],
];

/** The `Heart` icon. */
export const Heart: IconNode = [
  [
    "path",
    {
      d: "M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5",
    },
  ],
];

/** The `Info` icon. */
export const Info: IconNode = [
  ["circle", { cx: "12", cy: "12", r: "10" }],
  ["path", { d: "M12 16v-4" }],
  ["path", { d: "M12 8h.01" }],
];

/** The `Leaf` icon. */
export const Leaf: IconNode = [
  [
    "path",
    {
      d: "M11 20a10 10 0 0010-10 25.9 25.9 0 00-1.04-7.281 1 1 0 00-1.755-.325C15.833 5.5 13 5.5 9.8 6.1A7 7 0 0011 20",
    },
  ],
  ["path", { d: "M2 21a5 5 0 012.911-4.544C7.613 15.212 8.351 15.24 11 13" }],
];

/** The `Lightbulb` icon. */
export const Lightbulb: IconNode = [
  [
    "path",
    {
      d: "M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5",
    },
  ],
  ["path", { d: "M9 18h6" }],
  ["path", { d: "M10 22h4" }],
];

/** The `Minus` icon. */
export const Minus: IconNode = [["path", { d: "M5 12h14" }]];

/** The `PanelLeft` icon. */
export const PanelLeft: IconNode = [
  ["rect", { width: "18", height: "18", x: "3", y: "3", rx: "2" }],
  ["path", { d: "M9 3v18" }],
];

/** The `Pipette` icon. */
export const Pipette: IconNode = [
  [
    "path",
    {
      d: "m12 9-8.414 8.414A2 2 0 0 0 3 18.828v1.344a2 2 0 0 1-.586 1.414A2 2 0 0 1 3.828 21h1.344a2 2 0 0 0 1.414-.586L15 12",
    },
  ],
  ["path", { d: "m18 9 .4.4a1 1 0 1 1-3 3l-3.8-3.8a1 1 0 1 1 3-3l.4.4 3.4-3.4a1 1 0 1 1 3 3z" }],
  ["path", { d: "m2 22 .414-.414" }],
];

/** The `Plus` icon. */
export const Plus: IconNode = [
  ["path", { d: "M5 12h14" }],
  ["path", { d: "M12 5v14" }],
];

/** The `Replace` icon. */
export const Replace: IconNode = [
  ["path", { d: "M14 4a1 1 0 0 1 1-1" }],
  ["path", { d: "M15 10a1 1 0 0 1-1-1" }],
  ["path", { d: "M21 4a1 1 0 0 0-1-1" }],
  ["path", { d: "M21 9a1 1 0 0 1-1 1" }],
  ["path", { d: "m3 7 3 3 3-3" }],
  ["path", { d: "M6 10V5a2 2 0 0 1 2-2h2" }],
  ["rect", { x: "3", y: "14", width: "7", height: "7", rx: "1" }],
];

/** The `ReplaceAll` icon. */
export const ReplaceAll: IconNode = [
  ["path", { d: "M14 14a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1" }],
  ["path", { d: "M14 4a1 1 0 0 1 1-1" }],
  ["path", { d: "M15 10a1 1 0 0 1-1-1" }],
  ["path", { d: "M19 14a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1" }],
  ["path", { d: "M21 4a1 1 0 0 0-1-1" }],
  ["path", { d: "M21 9a1 1 0 0 1-1 1" }],
  ["path", { d: "m3 7 3 3 3-3" }],
  ["path", { d: "M6 10V5a2 2 0 0 1 2-2h2" }],
  ["rect", { x: "3", y: "14", width: "7", height: "7", rx: "1" }],
];

/** The `Search` icon. */
export const Search: IconNode = [
  ["path", { d: "m21 21-4.34-4.34" }],
  ["circle", { cx: "11", cy: "11", r: "8" }],
];

/** The `Smile` icon. */
export const Smile: IconNode = [
  ["path", { d: "M15 10V9" }],
  ["path", { d: "M16.472 15a6 6 0 01-8.943 0" }],
  ["path", { d: "M9 10V9" }],
  ["circle", { cx: "12", cy: "12", r: "10" }],
];

/** The `TriangleAlert` icon. */
export const TriangleAlert: IconNode = [
  ["path", { d: "m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" }],
  ["path", { d: "M12 9v4" }],
  ["path", { d: "M12 17h.01" }],
];

/** The `Undo2` icon. */
export const Undo2: IconNode = [
  ["path", { d: "M9 14 4 9l5-5" }],
  ["path", { d: "M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5a5.5 5.5 0 0 1-5.5 5.5H11" }],
];

/** The `User` icon. */
export const User: IconNode = [
  ["path", { d: "M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" }],
  ["circle", { cx: "12", cy: "7", r: "4" }],
];

/** The `Utensils` icon. */
export const Utensils: IconNode = [
  ["path", { d: "M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" }],
  ["path", { d: "M7 2v20" }],
  ["path", { d: "M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" }],
];

/** The `Volleyball` icon. */
export const Volleyball: IconNode = [
  ["path", { d: "M11 7a16 16 20 0 1 10.98 4.362" }],
  ["path", { d: "M12 12a13 13 0 0 1-8.66 5" }],
  ["path", { d: "M16.83 13.634a16 16 0 0 1-9.267 7.328" }],
  ["path", { d: "M20.66 17A13 13 0 0 0 12 12a13 13 0 0 1 0-10" }],
  ["path", { d: "M8.17 15.366a16 16 0 0 1-1.713-11.69" }],
  ["circle", { cx: "12", cy: "12", r: "10" }],
];

/** The `X` icon. */
export const X: IconNode = [
  ["path", { d: "M18 6 6 18" }],
  ["path", { d: "m6 6 12 12" }],
];

/** lucide's box: 24 units square, its viewBox and the unit a stroke's weight is measured in. */
export const ICON_BOX = 24;

/** lucide's own stroke: 2 of the box's 24 units, round ends and joins. */
export const ICON_WEIGHT = 2;

/** One element of an `IconNode`: its tag and its SVG attributes. */
type IconElement = IconNode[number];

/** How a path's SVG data becomes something the canvas can stroke or fill. */
type IconPathOf<P> = (d: string) => P;

/**
 * The canvas calls an icon makes (a `CanvasRenderingContext2D` subset, so the two agree), with
 * `P` whatever a stroke's path is: the platform's `Path2D` in the app, a note of the data in a test.
 */
export interface IconCanvas<P> {
  beginPath(): void;
  moveTo(x: number, y: number): void;
  lineTo(x: number, y: number): void;
  closePath(): void;
  arc(x: number, y: number, radius: number, start: number, end: number): void;
  ellipse(
    x: number,
    y: number,
    radiusX: number,
    radiusY: number,
    rotation: number,
    start: number,
    end: number,
  ): void;
  roundRect(x: number, y: number, w: number, h: number, radius?: number): void;
  stroke(path?: P): void;
  fill(path?: P): void;
}

/** A full turn, the end angle of a closed circle or an ellipse. */
const TURN = Math.PI * 2;

/** The shapes lucide writes besides paths and point lines. */
const SHAPES: ReadonlySet<string> = new Set(["circle", "ellipse", "rect", "line"]);

/** An attribute as a number: lucide writes them as strings. */
const attrNumber = (attrs: IconElement[1], name: string, fallback = 0) => {
  const value = attrs[name];
  return value == null ? fallback : Number(value);
};

/** A `points` attribute as flat x, y coordinates. */
const coordinates = (attrs: IconElement[1]) => {
  const value = String(attrs.points ?? "").trim();
  return value === "" ? [] : value.split(/[\s,]+/).map(Number);
};

/** One element, on a path of its own: stroked, or filled in the same color (`fill`). */
function drawElement<P>(
  tag: string,
  attrs: IconElement[1],
  canvas: IconCanvas<P>,
  options: { fill: boolean; path: IconPathOf<P> },
) {
  const paint = () => (options.fill ? canvas.fill() : canvas.stroke());

  // A path is drawn from its own data, which the platform parses.
  if (tag === "path") {
    const d = String(attrs.d ?? "");
    if (d === "") return;
    const drawn = options.path(d);
    if (options.fill) canvas.fill(drawn);
    else canvas.stroke(drawn);
    return;
  }

  // A line through points, closed for a polygon: too few of them draw nothing.
  if (tag === "polyline" || tag === "polygon") {
    const points = coordinates(attrs);
    if (points.length < 4) return;
    canvas.beginPath();
    canvas.moveTo(points[0], points[1]);
    for (let i = 2; i + 1 < points.length; i += 2) canvas.lineTo(points[i], points[i + 1]);
    if (tag === "polygon") canvas.closePath();
    paint();
    return;
  }

  // A shape with a curve of its own. Anything else (lucide has no other tags) draws nothing.
  if (!SHAPES.has(tag)) return;
  canvas.beginPath();
  switch (tag) {
    case "circle":
      canvas.arc(attrNumber(attrs, "cx"), attrNumber(attrs, "cy"), attrNumber(attrs, "r"), 0, TURN);
      break;
    case "ellipse":
      canvas.ellipse(
        attrNumber(attrs, "cx"),
        attrNumber(attrs, "cy"),
        attrNumber(attrs, "rx"),
        attrNumber(attrs, "ry"),
        0,
        0,
        TURN,
      );
      break;
    case "rect":
      // lucide's rects carry one radius, `rx` (`ry` repeats it): a rounded corner on all four.
      canvas.roundRect(
        attrNumber(attrs, "x"),
        attrNumber(attrs, "y"),
        attrNumber(attrs, "width"),
        attrNumber(attrs, "height"),
        attrNumber(attrs, "rx", attrNumber(attrs, "ry")),
      );
      break;
    case "line":
      canvas.moveTo(attrNumber(attrs, "x1"), attrNumber(attrs, "y1"));
      canvas.lineTo(attrNumber(attrs, "x2"), attrNumber(attrs, "y2"));
      break;
  }
  paint();
}

/**
 * Draws `icon` (a lucide `IconNode`) with canvas calls, each element on a path of its own:
 * stroked, or filled in the same color with `fill` (the solid icons, such as `Play`). `path` says
 * how a `d` becomes a drawable path: `new Path2D(d)` in the app, a recorder's note in a test.
 */
export function drawIcon<P>(
  icon: IconNode,
  canvas: IconCanvas<P>,
  options: { fill?: boolean; path: IconPathOf<P> },
): void {
  const fill = options.fill === true;
  for (const [tag, attrs] of icon) drawElement(tag, attrs, canvas, { fill, path: options.path });
}

/** One element of a lucide node as an SVG element; an attribute lucide leaves out is left out. */
function svgElement(tag: string, attrs: IconNode[number][1]) {
  const written = Object.entries(attrs)
    .filter(([, value]) => value != null)
    .map(([name, value]) => `${name}="${String(value)}"`)
    .join(" ");
  return `<${tag} ${written}/>`;
}

/** What `iconImage` writes besides the icon itself. */
export type IconImageOptions = {
  /** The stroke in the icon's 24-unit box (2 by default, lucide's own). */
  weight?: number;
  /**
   * The stroke's color: `currentColor` by default, so whatever draws the image colors it (a menu,
   * in its text color). A fixed ink makes the image a template image instead, which `tintColor`
   * recolors: `#000` for that, never the interface's own color.
   */
  ink?: string;
};

/**
 * `icon` (a lucide `IconNode`) as an SVG `data:` URL: the image form a native menu item's `icon`
 * takes (`Menu.popup`'s items, the menu bar's, the tray's), which take an image rather than a view.
 * Its stroke is `currentColor` unless `ink` pins it, so a menu draws it in its own text color.
 */
export function iconImage(icon: IconNode, options: IconImageOptions = {}): string {
  const stroke = options.ink ?? "currentColor";
  const weight = options.weight ?? ICON_WEIGHT;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${ICON_BOX}" height="${ICON_BOX}" viewBox="0 0 ${ICON_BOX} ${ICON_BOX}" fill="none" stroke="${stroke}" stroke-width="${weight}" stroke-linecap="round" stroke-linejoin="round">${icon.map(([tag, attrs]) => svgElement(tag, attrs)).join("")}</svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

/** SVG path data parsed once per `d` (an icon is redrawn whenever it lays out). */
const parsed = new Map<string, Path2D>();

/** The path for `d`: the platform parses the SVG data the first time an icon needs it. */
function pathOf(d: string) {
  let path = parsed.get(d);
  if (!path) {
    path = new Path2D(d);
    parsed.set(d, path);
  }
  return path;
}

/** The icons that point along the line (forward, back): mirrored from right to left. */
const directional: ReadonlySet<IconNode> = new Set<IconNode>([
  ChevronRight,
  ChevronLeft,
  ArrowLeft,
  ArrowRight,
]);

/** What `Icon` draws: a lucide node, the side of its box, and the color and weight of its stroke. */
export type IconProps = {
  /** The icon itself, a lucide `IconNode` (for example `ChevronDown`). */
  icon: IconNode;
  /** The side of its square, in points (20 by default). */
  size?: number;
  /** Its color: the stroke, and the fill when `fill` is set. */
  tint: string;
  /** The stroke in the icon's 24-unit box (2 by default, lucide's own). */
  weight?: number;
  /** Fill the shape in `tint` instead of stroking it (a solid icon, such as `Play`). */
  fill?: boolean;
};

/**
 * An icon, stroked in `tint` at `size`: a lucide node drawn in its 24-unit box, so it reads the
 * same size and weight as everywhere else lucide is used. In the terminal, which draws no icons,
 * a check is a mark (`✓`); any other icon shows nothing there.
 */
export function Icon(props: IconProps) {
  const size = props.size ?? 20;
  // The terminal draws no icons; a check is a mark there too (a chosen
  // option, the command in effect, a step done), so it keeps its glyph.
  if (terminal && props.icon === Check) return <Text style={{ color: props.tint }}>✓</Text>;
  return (
    <Canvas
      class={directional.has(props.icon) ? "rtl:-scale-x-100" : undefined}
      style={{ pointerEvents: "none", width: size, height: size }}
      draw={(cx, { width }) => {
        cx.scale(width / ICON_BOX, width / ICON_BOX);
        cx.strokeStyle = props.tint;
        cx.fillStyle = props.tint;
        cx.lineWidth = props.weight ?? ICON_WEIGHT;
        cx.lineCap = "round";
        cx.lineJoin = "round";
        drawIcon(props.icon, cx as IconCanvas<Path2D>, {
          fill: props.fill,
          path: pathOf,
        });
      }}
    />
  );
}

/**
 * An icon-only control's content: the icon, or in the terminal, which draws
 * no icons, `label` as text in the icon's tint (a short word: the control's
 * accessibility label keeps its full name).
 */
export function IconLabel(props: { label: string } & Omit<IconProps, "fill">) {
  return terminal ? (
    <Text style={{ color: props.tint }}>{props.label}</Text>
  ) : (
    <Icon icon={props.icon} size={props.size} tint={props.tint} weight={props.weight} />
  );
}

/**
 * The image's ink when nothing colors it: a template image takes `CheckMark`'s `tintColor`, so this
 * is no color of the interface and not a theme literal.
 */
const TEMPLATE_INK = "#000"; // color: template ink a drawing is recoloured from, never painted

/** A check mark drawn as SVG, in `tint`; `weight` is the stroke in its 24-unit box (2 by default). */
export function CheckMark(props: { size?: number; tint: string; weight?: number }) {
  const size = props.size ?? 20;
  return (
    <Image
      src={iconImage(Check, { weight: props.weight ?? ICON_WEIGHT, ink: TEMPLATE_INK })}
      style={{ pointerEvents: "none", width: size, height: size, tintColor: props.tint }}
    />
  );
}
