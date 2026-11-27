// A button group: buttons joined into one control, in a row or a column.
// A split button is this group: a main `Button`, a `ButtonGroupSeparator`, and the menu button.

import type { TextStyle, ViewProps, ViewStyle } from "nsh";
import { context, split, View } from "nsh";

import {
  buttonCorner,
  colors,
  control,
  controlHeight,
  font,
  rounded,
  shape,
  stroke,
  TERMINAL_COLUMN,
  terminal,
} from "../theme";
import { density } from "./lib/surface";
import { AsText, joinClass } from "./lib/utils";
import { Separator } from "./separator";

/** Which way a group runs: `horizontal`, a row (the default); `vertical`, a column. */
export type ButtonGroupOrientation = "horizontal" | "vertical";

/** Where a thing sits in its group: at an edge, or between two others. */
export type ButtonGroupPosition = "first" | "middle" | "last";

/**
 * A group's props: a set of buttons that do one job, read as one (`role="group"`).
 * Every `nsh` view prop passes through (`class`, `classList`, `style`, `testID`, …);
 * `style` goes over the group's row or column.
 */
export type ButtonGroupProps = ViewProps & {
  /** Default `horizontal`: a row. `vertical` stacks the buttons into a column. */
  orientation?: ButtonGroupOrientation;
};

/** A word inside a group (`Path:`, `100%`), on the ground its buttons wear. */
export type ButtonGroupTextProps = ViewProps;

/**
 * The divider inside a group: a hairline across the column or down the row.
 * `orientation` is the line's own direction; unset, it is perpendicular to the group
 * (down a row, across a column), as `Separator` is. Decorative, so a reader skips it.
 */
export type ButtonGroupSeparatorProps = Omit<ViewProps, "children"> & {
  /** Default: perpendicular to the group. `vertical` runs down a row, `horizontal` across a column. */
  orientation?: ButtonGroupOrientation;
};

/**
 * Buttons joined into one control, after shadcn/ui's `ButtonGroup`: `role="group"` so a reader
 * hears them as a set, the children touching, in a row or a column, and as narrow as they are.
 *
 * shadcn squares the corners that touch with a child selector; a view styles itself and not its
 * children, so each button wears the join itself — `buttonGroupItem(position)` on its `style`,
 * `first` at the leading edge and `last` at the trailing one. Omit `orientation` and the join
 * follows this group.
 */
export function ButtonGroup(props: ButtonGroupProps) {
  const [, rest] = split(props, ["orientation", "style", "class", "classList"]);
  const orientation = () => props.orientation ?? "horizontal";
  return (
    <OrientationContext.Provider value={orientation()}>
      <View
        {...rest}
        role="group"
        class={joinClass(undefined, props.class)}
        classList={props.classList}
        style={[rootStyle(orientation()), props.style ?? null]}
      >
        {props.children}
      </View>
    </OrientationContext.Provider>
  );
}

/**
 * A word inside a group — a path, a unit, a count — on the ground its buttons wear, with their
 * edge and shade, as tall as the buttons beside it. Join it as a button would be joined
 * (`buttonGroupItem(...)`).
 */
export function ButtonGroupText(props: ButtonGroupTextProps) {
  const [, rest] = split(props, ["style", "class", "classList", "children"]);
  return (
    <View
      {...rest}
      class={joinClass(undefined, props.class)}
      classList={props.classList}
      style={[textFrameStyle(), props.style ?? null]}
    >
      <AsText style={textStyle()}>{props.children}</AsText>
    </View>
  );
}

/**
 * The divider inside a group: a hairline down a row (or across a column), the whole way across
 * it. `orientation` overrides the group's; unset, the line is perpendicular to the group.
 */
export function ButtonGroupSeparator(props: ButtonGroupSeparatorProps) {
  const [, rest] = split(props, ["orientation", "style", "class", "classList"]);
  const orientation = () =>
    props.orientation ?? (OrientationContext() === "vertical" ? "horizontal" : "vertical");
  return (
    <Separator
      {...rest}
      orientation={orientation()}
      class={joinClass(undefined, props.class)}
      classList={props.classList}
      style={[separatorStyle(orientation()), props.style ?? null]}
    />
  );
}

/**
 * The corners and the edge a control gives up to join the one beside it. `position` is where it
 * sits (`first`, `middle`, `last`). `orientation` defaults to the surrounding `ButtonGroup`;
 * outside one it is a row. Outer corners stay, the sides that touch are squared, and each join
 * keeps one edge (the one before it). In a column the outer corners clamp to `shape.container`
 * and the stack drops its shadow so the seams stay clean.
 */
export function buttonGroupItem(
  position: ButtonGroupPosition,
  orientation?: ButtonGroupOrientation,
): ViewStyle {
  return buttonGroupLook().item(orientation ?? OrientationContext(), position);
}

// Private helpers. The look is not exported: a caller joins with `buttonGroupItem`.

/**
 * The group the parts under a `ButtonGroup` sit in: the join is the buttons' own, but the
 * separator turns with the group, so the root hands its orientation down.
 */
const OrientationContext = context<ButtonGroupOrientation>("horizontal");

/** A group's parts as the styles they wear. Private: the shells and `buttonGroupItem` spread them. */
interface ButtonGroupLook {
  /** The group: its children touching, in a row or a column, as narrow as they are. */
  root(orientation: ButtonGroupOrientation): ViewStyle;
  /**
   * The corners and the edge a button gives up to be joined to the one beside it: its outer sides
   * keep their corners, the sides that touch are squared, and each join keeps one edge (the one
   * before it), as shadcn's does. In a column a button below another also drops the raised face's
   * lit top edge, which would otherwise draw a white seam.
   */
  item(orientation: ButtonGroupOrientation, position: ButtonGroupPosition): ViewStyle;
  /** A word inside the group: its buttons' ground behind the control's corners. */
  textFrame(): ViewStyle;
  /** That word's type. */
  text(): TextStyle;
  /** The hairline between buttons (`ButtonGroupSeparator`). */
  separator(): ViewStyle;
}

/**
 * A button group's look, after shadcn/ui's `ButtonGroup`: the children touching (`gap: 0`) in a
 * row or a column, as narrow as its children and as tall as the tallest, so a row of buttons
 * reads as one control. `item` is the join: the corners on the sides that touch are squared and
 * one edge kept per join, the outer sides keeping the corners and the edge they came with.
 */
function buttonGroupLook(): ButtonGroupLook {
  return {
    root: (orientation: ButtonGroupOrientation): ViewStyle => ({
      flexDirection: orientation === "vertical" ? "column" : "row",
      alignItems: "stretch",
      alignSelf: "flex-start",
      flexShrink: 0,
      gap: 0,
    }),
    item: (orientation: ButtonGroupOrientation, position: ButtonGroupPosition): ViewStyle => {
      const before = position !== "first";
      const after = position !== "last";
      if (orientation === "horizontal") {
        return {
          ...(before
            ? { borderTopStartRadius: 0, borderBottomStartRadius: 0, borderStartWidth: 0 }
            : {}),
          ...(after ? { borderTopEndRadius: 0, borderBottomEndRadius: 0 } : {}),
        };
      }
      // A vertical column clamps outer corners to `shape.container` so capsule buttons do not arch
      // into giant domes, and drops shadows so seams stay clean across stacked items.
      const cap = Math.min(buttonCorner("default"), shape.container);
      return {
        boxShadow: "none",
        ...(before
          ? {
              borderTopLeftRadius: 0,
              borderTopRightRadius: 0,
              borderTopWidth: 0,
            }
          : { borderTopLeftRadius: cap, borderTopRightRadius: cap }),
        ...(after
          ? { borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }
          : { borderBottomLeftRadius: cap, borderBottomRightRadius: cap }),
      };
    },
    /** A word inside the group: the muted fill behind the control's corners. */
    textFrame: (): ViewStyle => ({
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      minHeight: controlHeight.md,
      paddingHorizontal: terminal ? TERMINAL_COLUMN : 12,
      backgroundColor: colors.muted,
      borderWidth: terminal ? 0 : stroke.control,
      borderColor: control("button").outlineEdge,
      // The group's word sits between its buttons: one control, one corner.
      ...rounded(terminal ? 0 : buttonCorner("default")),
    }),
    text: (): TextStyle => ({
      fontSize: density.body,
      fontWeight: font.weight("label"),
      color: colors.foreground,
      numberOfLines: 1,
    }),
    separator: (): ViewStyle => ({
      // Above the neighbouring fills, so a `default` accent face cannot paint across the seam.
      zIndex: 1,
      flexShrink: 0,
      alignSelf: "stretch",
      backgroundColor: control("button").outlineEdge,
    }),
  };
}

function rootStyle(orientation: ButtonGroupOrientation): ViewStyle {
  return buttonGroupLook().root(orientation);
}

function textFrameStyle(): ViewStyle {
  return buttonGroupLook().textFrame();
}

function textStyle(): TextStyle {
  return buttonGroupLook().text();
}

/**
 * The group's hairline at `stroke.hairline` on the axis that divides the buttons. The other axis
 * stays the one `Separator` stretches, so a vertical line cannot grow to the row's width.
 */
function separatorStyle(orientation: ButtonGroupOrientation): ViewStyle {
  const line = stroke.hairline;
  return {
    ...buttonGroupLook().separator(),
    ...(orientation === "vertical" ? { width: line } : { height: line }),
  };
}
