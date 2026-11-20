// A toolbar: the hairline (`toolbarRule`) and the parts that wear the inset track.
// The track (`toolbarTrack`) is shared with `ToggleGroup` and lives in `lib/tool.ts`.
// From NSH's examples/nsh-gallery-ui (Apache-2.0, © Longbridge; see NOTICE): yours to change.
import { colors, terminal, TERMINAL_GAP, stroke } from "@shadcn-nsh/theme";
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

import { toolbarTrack } from "./lib/tool";

// @port look/tool.ts
/** A hairline between runs of a toolbar's tools (a `ToolbarSeparator`'s or a view's `style`): 18 points tall in a row, across a column. */
export function toolbarRule(vertical = false): ViewStyle {
  return vertical
    ? {
        height: stroke.hairline,
        alignSelf: "stretch",
        marginVertical: 4,
        marginHorizontal: 6,
        backgroundColor: colors.line,
      }
    : { width: stroke.hairline, height: 18, marginHorizontal: 4, backgroundColor: colors.line };
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

/** The bar: one toolbar for screen readers, arrow keys along `axis`. */
export function Toolbar(props: ToolbarProps) {
  const [, rest] = split(props, ["style", "axis"]);
  const vertical = props.axis === "vertical";
  return (
    <ToolbarContext.Provider value={{ vertical }}>
      <BaseToolbar
        {...rest}
        axis={props.axis}
        // Read in the style itself, so a theme's colors and radius are the ones in use.
        style={[toolbarTrack({ vertical }), props.style ?? null]}
      />
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
  return (
    <BaseToolbarSeparator {...rest} style={[toolbarRule(bar.vertical), props.style ?? null]} />
  );
}
