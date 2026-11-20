import { describe, expect, test } from "bun:test";

import { Check, type IconNode } from "lucide";

import { iconImage } from "./icon-image";

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
