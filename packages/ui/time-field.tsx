// A time field: the look (`timeFieldClass`) and the `TimeField` that wears it.
// The look is ported from NSH's examples/nsh-gallery-ui (Apache-2.0, © Longbridge; see NOTICE).
// Its region is filled by `bun run port:vendor`: change it upstream, or in `port-map.json`.
import { terminal } from "@shadcn-nsh/theme";
import { platform, split } from "nsh";
import { TimeField as BaseTimeField, type TimeFieldProps as BaseTimeFieldProps } from "nsh/base";

import { edgeClass } from "./input";

// @port look/field.tsx
const pointer = platform.desktop;

/**
 * A time field's well (`DatePicker`'s `timeFieldClass`): a number input's, its segments inside. It sits in the
 * calendar's popup, so in dark it is shadcn's input there (`bg-input/30`, a shade over the popup) rather than the
 * field color, which is the page's and would read as a hole.
 */
export const timeFieldClass = [
  pointer ? "h-8 rounded-[7px] px-2" : "h-11 rounded-lg px-3",
  terminal ? "items-center border bg-field" : "items-center border bg-field dark:bg-input/30",
  edgeClass({ rest: "border-input", hover: "border-faint", hoverVariant: "enabled:hover" }),
].join(" ");
// @port end

/**
 * `nsh/base`'s TimeField in the look of `timeFieldClass`. Every base prop passes through; `class`
 * goes over the look's. Segment chrome lands with the listbox / date-picker family.
 */
export type TimeFieldProps = BaseTimeFieldProps;

/** A time of day, one segment at a time. */
export function TimeField(props: TimeFieldProps) {
  const [, rest] = split(props, ["class"]);
  return (
    <BaseTimeField
      {...rest}
      class={props.class ? `${timeFieldClass} ${props.class}` : timeFieldClass}
    />
  );
}
