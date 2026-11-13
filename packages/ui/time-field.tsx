// A time field: `nsh/base`'s TimeField in the well and the segments of the date picker's time
// row (`timeFieldClass`, `calendarLook`, `TimeSegment`, all ported from NSH's
// examples/nsh-gallery-ui — Apache-2.0, © Longbridge; see NOTICE).
import { split } from "nsh";
import { TimeField as BaseTimeField, type TimeFieldProps as BaseTimeFieldProps } from "nsh/base";

import { calendarLook, TimeSegment } from "./calendar";
import { timeFieldClass } from "./input";

export { timeFieldClass } from "./input";

/**
 * `nsh/base`'s TimeField in the look of `timeFieldClass`, its segments and its `:` the ones of
 * the date picker's time row (`calendarLook.segmentClass`, `calendarLook.separator`,
 * `TimeSegment`), so a field on a page and the one in a calendar's popup read alike. Every base
 * prop passes through; `class`, `segmentClass`, `separatorStyle` and `renderSegment` go over the
 * look's.
 */
export type TimeFieldProps = BaseTimeFieldProps;

/** A time of day, one segment at a time. */
export function TimeField(props: TimeFieldProps) {
  const [, rest] = split(props, [
    "class",
    "segmentClass",
    "separatorClass",
    "separatorStyle",
    "renderSegment",
  ]);
  return (
    <BaseTimeField
      {...rest}
      class={props.class ? `${timeFieldClass} ${props.class}` : timeFieldClass}
      segmentClass={props.segmentClass ?? calendarLook.segmentClass}
      separatorClass={props.separatorClass}
      separatorStyle={[calendarLook.separator, props.separatorStyle ?? null]}
      renderSegment={props.renderSegment ?? ((segment) => <TimeSegment label={segment.label} />)}
    />
  );
}
