// A toast: the look (`toastLook` and its companions) at the top, and the `Toast` that wears it below.
// From NSH's examples/nsh-gallery-ui (Apache-2.0, © Longbridge; see NOTICE): yours to change.
import { alpha, colors, finish, focusRing, hovered, radius, rounded } from "@shadcn-nsh/theme";
import type { JSX, TextStyle, ViewStyle } from "nsh";
import { platform, split, Text, View } from "nsh";
import { Toast as BaseToast, type ToastProps as BaseToastProps } from "nsh/base";

import { buttonLabel, buttonLook, type ButtonLookOptions } from "./button";
import { pressSink, pressTransition } from "./lib/press";

// @port look/overlay.ts
const pointer = platform.desktop;

/**
 * A toast (`nsh/base`'s `Toast`'s `style`): a row 12 points apart on the floating finish every
 * popup wears (not the raised one, a control's, which a theme may make a tint over the page),
 * 10-point corners (`radius.inset`), 12 by 14 points of padding. Its title takes `toastTitle`,
 * its description `toastText`.
 */
export function toastLook(): ViewStyle {
  return {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    ...rounded(radius.inset),
    borderWidth: 1,
    ...finish.menu,
  };
}

/** A toast's title: 14 points semibold. */
export function toastTitle(): TextStyle {
  return { fontSize: 14, fontWeight: "600", color: colors.foreground };
}

/** A toast's description: 13 points, muted, its figures tabular. */
export function toastText(): TextStyle {
  return { fontSize: 13, color: colors.mutedForeground, fontVariant: ["tabular-nums"] };
}

/**
 * The size of a toast's action: 28 points tall with a pointer, 10 points of padding at its sides;
 * `small` on a touch screen (36, a hit slop making 44), so the toast stays a compact row.
 */
const toastActionSize: ButtonLookOptions = pointer
  ? { style: { paddingHorizontal: 10 } }
  : { size: "sm" };

/**
 * A toast's action (an Undo, a Retry), spread on a `Button` or a pressable view: the main action's
 * citrus button (`buttonLook("default")`). Its label takes `toastActionLabel`.
 */
export function toastActionLook() {
  return buttonLook("default", toastActionSize);
}

/** The label of a `toastActionLook` (`buttonLabel("default")`). */
export function toastActionLabel(): TextStyle {
  return buttonLabel("default", toastActionSize);
}

/** A toast's close button (its cross): a circle 24 points across (the theme's
 * `radius-card` corners, half its side in the default theme), bare until the
 * pointer is over it, sinking to 90% while pressed (none with reduced
 * motion); keyboard focus `focusRing()`. */
export function toastCloseLook() {
  return {
    style: {
      width: 24,
      height: 24,
      alignItems: "center",
      justifyContent: "center",
      ...rounded(radius.card),
      ...pressTransition("background-color"),
    } as ViewStyle,
    get hoverStyle(): ViewStyle {
      return hovered();
    },
    get activeStyle(): ViewStyle {
      return { backgroundColor: alpha(colors.foreground, 0.1), ...pressSink(0.9).activeStyle };
    },
    get focusVisibleStyle(): ViewStyle {
      return focusRing();
    },
  };
}
// @port end

/**
 * `nsh/base`'s Toast in the look of `toastLook`. Every base prop passes through; `style` goes
 * over the look's. Without `children`, it draws `title` and `description` in `toastTitle` and
 * `toastText`; with them, the children are drawn as given.
 */
export type ToastProps = Omit<BaseToastProps, "children"> & {
  /** Convenience title when `children` is omitted. */
  title?: string;
  /** Convenience description when `children` is omitted. */
  description?: string;
  children?: JSX.Element;
};

/** The column that holds `title` and `description`: it takes the row's room and may shrink. */
const toastTextColumn: ViewStyle = { flex: 1, gap: 2, minWidth: 0 };

/** A toast banner. */
export function Toast(props: ToastProps) {
  const [, rest] = split(props, ["title", "description", "children", "style"]);
  return (
    <BaseToast {...rest} style={[toastLook(), props.style ?? null]}>
      {props.children ?? (
        <View style={toastTextColumn}>
          {props.title ? <Text style={toastTitle()}>{props.title}</Text> : null}
          {props.description ? <Text style={toastText()}>{props.description}</Text> : null}
        </View>
      )}
    </BaseToast>
  );
}
