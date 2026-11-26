// A button group: buttons joined into one control, in a row or a column.

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
  TERMINAL_ROW,
  terminal,
} from "@shadcn-nsh/theme";
import type { TextStyle, ViewProps, ViewStyle } from "nsh";
import { context, split, View } from "nsh";

import { density } from "./lib/surface";
import { AsText } from "./lib/utils";
import { Separator } from "./separator";

/** Which way a group runs: `horizontal`, a row (the default); `vertical`, a column. */
export type ButtonGroupOrientation = "horizontal" | "vertical";

/** Where a thing sits in its group: at an edge, or between two others. */
export type ButtonGroupPosition = "first" | "middle" | "last";

/** A group's parts as the styles they wear: spread each one. */
export interface ButtonGroupLook {
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
 * The group the parts under a `ButtonGroup` sit in: the join is the buttons' own, but the
 * separator turns with the group, so the root hands its orientation down.
 */
const OrientationContext = context<ButtonGroupOrientation>("horizontal");

/**
 * A button group's look, after shadcn/ui's `ButtonGroup`: the children touching (`gap: 0`) in a
 * row or a column, as narrow as its children and as tall as the tallest, so a row of buttons
 * reads as one control. `item` is the join: the corners on the sides that touch are squared and
 * one edge kept per join, the outer sides keeping the corners and the edge they came with.
 */
export function buttonGroupLook(): ButtonGroupLook {
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
      minHeight: terminal ? TERMINAL_ROW : controlHeight.md,
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
      backgroundColor: control("button").outlineEdge,
    }),
  };
}

/** A group's props: a set of buttons that do one job, read as one (`role="group"`). */
export type ButtonGroupProps = ViewProps & {
  /** Default `horizontal`: a row. `vertical` stacks the buttons into a column. */
  orientation?: ButtonGroupOrientation;
};

/** A word inside a group (`Path:`, `100%`), on the ground its buttons wear. */
export type ButtonGroupTextProps = ViewProps;

/** The divider inside a group: a hairline across the column or down the row, the group's to hide from a reader. */
export type ButtonGroupSeparatorProps = Omit<ViewProps, "children">;

/**
 * Buttons joined into one control, after shadcn/ui's `ButtonGroup`: `role="group"` so a reader
 * hears them as a set, the children touching, in a row or a column, and as narrow as they are.
 *
 * shadcn squares the corners that touch with a child selector; a view styles itself and not its
 * children, so each button wears the join itself — `buttonGroupLook().item(orientation, position)`
 * on its `style`, `first` at the leading edge and `last` at the trailing one.
 */
export function ButtonGroup(props: ButtonGroupProps) {
  const [, rest] = split(props, ["orientation", "style"]);
  const orientation = props.orientation ?? "horizontal";
  return (
    <OrientationContext.Provider value={orientation}>
      <View
        {...rest}
        role="group"
        style={[buttonGroupLook().root(orientation), props.style ?? null]}
      >
        {props.children}
      </View>
    </OrientationContext.Provider>
  );
}

/**
 * A word inside a group — a path, a unit, a count — on the ground its buttons wear, with their
 * edge and shade, as tall as the buttons beside it. Join it as a button would be joined
 * (`buttonGroupLook().item(...)`).
 */
export function ButtonGroupText(props: ButtonGroupTextProps) {
  const [, rest] = split(props, ["style", "children"]);
  return (
    <View {...rest} style={[buttonGroupLook().textFrame(), props.style ?? null]}>
      <AsText style={buttonGroupLook().text()}>{props.children}</AsText>
    </View>
  );
}

/**
 * The divider inside a group: a hairline down a row (or across a column), turned by the group's
 * own orientation, the whole way across it.
 */
export function ButtonGroupSeparator(props: ButtonGroupSeparatorProps) {
  const [, rest] = split(props, ["style"]);
  return (
    <Separator
      {...rest}
      orientation={OrientationContext() === "vertical" ? "horizontal" : "vertical"}
      style={[buttonGroupLook().separator(), props.style ?? null]}
    />
  );
}
