import { describe, expect, test } from "bun:test";

import { Check, type IconNode } from "lucide";

import { drawIcon, type IconCanvas, iconImage } from "./icon-drawing";

/** Every canvas call, in the order the icon makes it, as one line each. */
type Recorder = IconCanvas<string> & { calls: string[] };

/** A context that records instead of drawing; a path is its own `d`, so a test can read it. */
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

/** An icon drawn with `recorder()`. */
const drawn = (icon: IconNode, fill = false) => {
  const canvas = recorder();
  drawIcon(icon, canvas, { fill, path: (d) => `path(${d})` });
  return canvas.calls;
};

const TURN = String(Math.PI * 2);

describe("an icon node on a canvas", () => {
  test("a path is stroked from its own data, without starting a path", () => {
    expect(drawn([["path", { d: "M5 5h14" }]])).toEqual(["stroke path(M5 5h14)"]);
  });

  test("each element is a path of its own", () => {
    expect(
      drawn([
        ["path", { d: "M0 0h1" }],
        ["path", { d: "M2 2h3" }],
      ]),
    ).toEqual(["stroke path(M0 0h1)", "stroke path(M2 2h3)"]);
  });

  test("a circle is one full arc", () => {
    expect(drawn([["circle", { cx: "12", cy: "12", r: "10" }]])).toEqual([
      "beginPath",
      `arc 12 12 10 0 ${TURN}`,
      "stroke",
    ]);
  });

  test("an ellipse keeps its two radii", () => {
    expect(drawn([["ellipse", { cx: "12", cy: "5", rx: "6", ry: "2" }]])).toEqual([
      "beginPath",
      `ellipse 12 5 6 2 0 0 ${TURN}`,
      "stroke",
    ]);
  });

  test("a rect is rounded by rx, and square without one", () => {
    expect(drawn([["rect", { x: "3", y: "4", width: "18", height: "16", rx: "2" }]])).toEqual([
      "beginPath",
      "roundRect 3 4 18 16 2",
      "stroke",
    ]);
    expect(drawn([["rect", { x: "3", y: "4", width: "18", height: "16" }]])).toEqual([
      "beginPath",
      "roundRect 3 4 18 16 0",
      "stroke",
    ]);
  });

  test("a line is two points", () => {
    expect(drawn([["line", { x1: "4", y1: "12", x2: "20", y2: "12" }]])).toEqual([
      "beginPath",
      "moveTo 4 12",
      "lineTo 20 12",
      "stroke",
    ]);
  });

  test("a polyline runs through its points; a polygon closes", () => {
    const points = "4,6 20,6 20,18";
    expect(drawn([["polyline", { points }]])).toEqual([
      "beginPath",
      "moveTo 4 6",
      "lineTo 20 6",
      "lineTo 20 18",
      "stroke",
    ]);
    expect(drawn([["polygon", { points }]])).toEqual([
      "beginPath",
      "moveTo 4 6",
      "lineTo 20 6",
      "lineTo 20 18",
      "closePath",
      "stroke",
    ]);
  });

  test("fill fills every element in the stroke's color instead of stroking it", () => {
    expect(
      drawn(
        [
          ["path", { d: "M5 5h14" }],
          ["circle", { cx: "12", cy: "12", r: "2" }],
        ],
        true,
      ),
    ).toEqual(["fill path(M5 5h14)", "beginPath", `arc 12 12 2 0 ${TURN}`, "fill"]);
  });

  test("an element it cannot draw is left out whole", () => {
    expect(
      drawn([
        ["style", { d: "irrelevant" }],
        ["polyline", { points: "4,6" }],
      ]),
    ).toEqual([]);
  });
});

/** The SVG an `iconImage` URL carries. */
function svgOf(url: string) {
  const prefix = "data:image/svg+xml,";
  expect(url.startsWith(prefix)).toBe(true);
  return decodeURIComponent(url.slice(prefix.length));
}

describe("an icon as an image", () => {
  test("the URL decodes to an SVG of the icon's elements, in lucide's box, in the text color", () => {
    expect(svgOf(iconImage(Check))).toBe(
      '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>',
    );
  });

  test("each element keeps the attributes lucide writes", () => {
    const icon: IconNode = [
      ["circle", { cx: 12, cy: 12, r: 10, fill: "currentColor" }],
      ["path", { d: "M8 12h8" }],
    ];
    const svg = svgOf(iconImage(icon));
    expect(svg).toContain('<circle cx="12" cy="12" r="10" fill="currentColor"/>');
    expect(svg).toContain('<path d="M8 12h8"/>');
  });

  test("an attribute lucide leaves out is left out", () => {
    const icon: IconNode = [["path", { d: "M0 0", opacity: undefined }]];
    expect(svgOf(iconImage(icon))).toContain('<path d="M0 0"/>');
  });

  test("the stroke is the weight and ink asked for", () => {
    const svg = svgOf(iconImage(Check, { weight: 3, ink: "#000" }));
    expect(svg).toContain('stroke="#000"');
    expect(svg).toContain('stroke-width="3"');
    expect(svg).not.toContain("currentColor");
  });
});
