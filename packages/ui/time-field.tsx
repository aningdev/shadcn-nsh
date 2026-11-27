// A time field: the well of `timeFieldClass` and the segments of the date picker's time row, and the
// `TimeField` that wears them.

import { split } from "nsh";
import { TimeField as BaseTimeField, type TimeFieldProps as BaseTimeFieldProps } from "nsh/base";

import { calendarLook, TimeSegment } from "./calendar";
import { timeFieldLook } from "./lib/field-look";
import { joinClass } from "./lib/utils";

/**
 * `nsh/base`'s TimeField in the look of `timeFieldLook`, its segments and its `:` the ones of the
 * date picker's time row (`calendarLook.segmentClass`, `calendarLook.separator`, `TimeSegment`),
 * so a field on a page and the one in a calendar's popup read alike. Every base prop passes
 * through; `class`, `style`, `hoverStyle`, `focusWithinStyle`, `disabledStyle`, `segmentClass`,
 * `separatorStyle` and `renderSegment` go over the look's.
 *
 * Those come from the calendar's look: a time field is the date picker's time row, so the two read
 * it from `calendar.tsx` rather than each keeping a copy.
 */
export type TimeFieldProps = BaseTimeFieldProps;

/** A time of day, one segment at a time. */
export function TimeField(props: TimeFieldProps) {
  const [, rest] = split(props, [
    "class",
    "style",
    "hoverStyle",
    "focusWithinStyle",
    "disabledStyle",
    "segmentClass",
    "separatorStyle",
    "renderSegment",
  ]);
  const look = timeFieldLook({ disabled: () => !!props.disabled });
  return (
    <BaseTimeField
      {...rest}
      class={joinClass(look.class, props.class)}
      style={[look.style, props.style ?? null]}
      hoverStyle={[look.hoverStyle ?? null, props.hoverStyle ?? null]}
      focusWithinStyle={[look.focusWithinStyle, props.focusWithinStyle ?? null]}
      disabledStyle={[look.disabledStyle, props.disabledStyle ?? null]}
      segmentClass={props.segmentClass ?? calendarLook.segmentClass}
      separatorStyle={[calendarLook.separator, props.separatorStyle ?? null]}
      renderSegment={props.renderSegment ?? ((segment) => <TimeSegment label={segment.label} />)}
    />
  );
}
