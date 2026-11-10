// Source: examples/nsh-gallery-ui/look/button.ts, surface.tsx (`pointer`, `slop`) @ 64ab8a1d (baseline), see NOTICE.
import { platform } from "nsh";

/** Smallest comfortable finger target (Accessibility touch targets), in points. */
export const TOUCH_TARGET = 44;

/** Whether a pointer is the way in (a desktop OS, or the web in the desktop idiom), else a finger. */
export const isPointer = () => platform.desktop;

/**
 * How far presses count past a control `size` points tall, so a finger gets `TOUCH_TARGET`
 * without the control looking bigger. None with a pointer.
 */
export function touchHitSlop(size: number): number | undefined {
  if (isPointer()) return undefined;
  const slop = Math.max(0, (TOUCH_TARGET - size) / 2);
  return slop || undefined;
}

/**
 * The box of a checkbox or the ring of a radio, in points: 16 with a pointer, 22 on a touch screen
 * (`control`), its corner radius, the mark's size, the radio's dot.
 */
export function choiceBox() {
  return isPointer()
    ? { control: 16, corner: 5, check: 12, dot: 6 }
    : { control: 22, corner: 7, check: 16, dot: 8 };
}
