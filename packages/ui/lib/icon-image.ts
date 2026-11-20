// The elements of a lucide icon, written as an SVG `data:` URL: what takes an image rather than a
// view (a native menu item's `icon`, a tray's, an `Image`). Apart from `icons.tsx` and free of
// imports but lucide's types, so a unit test reads the URL it writes instead of running NSH. This
// library's own: upstream writes this in its gallery's `lucideSvg`. Yours to change.
import type { IconNode } from "lucide";

/** lucide's box: 24 units square, its viewBox and the unit a stroke's weight is measured in. */
export const ICON_BOX = 24;

/** lucide's own stroke: 2 of the box's 24 units, round ends and joins. */
export const ICON_WEIGHT = 2;

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
