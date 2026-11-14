// A toolbar: the look (`toolbarTrack`, `toolbarRule`) and the parts that wear it.
// From NSH's examples/nsh-gallery-ui (Apache-2.0, © Longbridge; see NOTICE): yours to change.
import { colors, terminal, TERMINAL_GAP } from "@shadcn-nsh/theme";
import type { ViewStyle } from "nsh";
import { context, split } from "nsh";
import {
  Toolbar as BaseToolbar,
  ToolbarGroup as BaseToolbarGroup,
  ToolbarSeparator as BaseToolbarSeparator,
  type ToolbarGroupProps as BaseToolbarGroupProps,
  type ToolbarProps as BaseToolbarProps,
  type ToolbarSeparatorProps as BaseToolbarSeparatorProps,
} from "nsh/base";

// @port look/tool.ts
/** Options of `toolbarTrack`. */
export interface ToolbarTrackOptions {
  /** A column of tools (a `Toolbar`'s `axis="vertical"`). */
  vertical?: boolean;
}

/**
 * The inset track a toolbar or a `ToggleGroup` sits in: its tools in a row
 * (a column when `vertical`) 2 points apart, 3 points inside its edge, on
 * the inset with the border's edge. A terminal sets each tool as its label
 * two columns apart and wraps a row too narrow for them.
 */
export function toolbarTrack(o?: ToolbarTrackOptions): ViewStyle {
  return {
    flexDirection: o?.vertical ? "column" : "row",
    alignItems: o?.vertical && terminal ? "flex-start" : "center",
    gap: terminal ? TERMINAL_GAP : 2,
    flexWrap: terminal && !o?.vertical ? "wrap" : undefined,
    padding: 3,
    borderRadius: 10,
    borderCurve: "continuous",
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.inset,
  };
}

/** A hairline between runs of a toolbar's tools (a `ToolbarSeparator`'s or a view's `style`): 18 points tall in a row, across a column. */
export function toolbarRule(vertical = false): ViewStyle {
  return vertical
    ? {
        height: 1,
        alignSelf: "stretch",
        marginVertical: 4,
        marginHorizontal: 6,
        backgroundColor: colors.line,
      }
    : { width: 1, height: 18, marginHorizontal: 4, backgroundColor: colors.line };
}
// @port end

/**
 * `nsh/base`'s Toolbar in the look of `toolbarTrack`. Every base prop passes through; `style`
 * goes over the look's. Items keep their own look (`Button`, `Toggle`, …).
 */
export type ToolbarProps = BaseToolbarProps;

/** A named run of items along the toolbar's axis. */
export type ToolbarGroupProps = BaseToolbarGroupProps;

/** A hairline between runs; never a tab stop. */
export type ToolbarSeparatorProps = BaseToolbarSeparatorProps;

type ToolbarContextValue = { vertical: boolean };

const ToolbarContext = context<ToolbarContextValue | null>(null);

function useToolbar() {
  const ctx = ToolbarContext();
  if (!ctx) throw new Error("Toolbar parts must be used within <Toolbar>");
  return ctx;
}

/** A run's direction and gap, matching `toolbarTrack`'s tools. */
function groupChrome(vertical: boolean): ViewStyle {
  return {
    flexDirection: vertical ? "column" : "row",
    alignItems: "center",
    gap: terminal ? TERMINAL_GAP : 2,
  };
}

/**
 * Live color reads over `toolbarTrack` / `toolbarRule`, so the bar follows the scheme where the
 * style is applied (same reason as ToggleGroup's inset track).
 */
function liveTrack(vertical: boolean): ViewStyle {
  const base = toolbarTrack({ vertical });
  return {
    ...base,
    get backgroundColor() {
      return colors.inset;
    },
    get borderColor() {
      return colors.border;
    },
  };
}

function liveRule(vertical: boolean): ViewStyle {
  const base = toolbarRule(vertical);
  return {
    ...base,
    get backgroundColor() {
      return colors.line;
    },
  };
}

/** The bar: one toolbar for screen readers, arrow keys along `axis`. */
export function Toolbar(props: ToolbarProps) {
  const [, rest] = split(props, ["style", "axis"]);
  const vertical = props.axis === "vertical";
  return (
    <ToolbarContext.Provider value={{ vertical }}>
      <BaseToolbar {...rest} axis={props.axis} style={[liveTrack(vertical), props.style ?? null]} />
    </ToolbarContext.Provider>
  );
}

/** A named run of items. Its direction follows the toolbar. */
export function ToolbarGroup(props: ToolbarGroupProps) {
  const bar = useToolbar();
  const [, rest] = split(props, ["style"]);
  return <BaseToolbarGroup {...rest} style={[groupChrome(bar.vertical), props.style ?? null]} />;
}

/** A hairline between runs. Not a stop of the keyboard focus. */
export function ToolbarSeparator(props: ToolbarSeparatorProps) {
  const bar = useToolbar();
  const [, rest] = split(props, ["style"]);
  return <BaseToolbarSeparator {...rest} style={[liveRule(bar.vertical), props.style ?? null]} />;
}
