// Source: examples/nsh-gallery-ui/look/tool.ts @ 64ab8a1d (baseline), see NOTICE.
import { colors, disabledOpacity } from "@shadcn-nsh/theme";
import type { StyleProp, ViewStyle } from "nsh";
import { computed, context, split } from "nsh";
import {
  Toolbar as BaseToolbar,
  ToolbarGroup as BaseToolbarGroup,
  ToolbarSeparator as BaseToolbarSeparator,
  type ToolbarGroupProps as BaseToolbarGroupProps,
  type ToolbarProps as BaseToolbarProps,
  type ToolbarSeparatorProps as BaseToolbarSeparatorProps,
} from "nsh/base";

/**
 * Theme layer on `nsh/base` Toolbar: the inset track. Items keep their own
 * look (`Button`, `Toggle`, `Link`). `axis` is read when the bar is made.
 */
export type ToolbarProps = BaseToolbarProps;

/** Theme layer on `nsh/base` ToolbarGroup: a run along the toolbar's axis. */
export type ToolbarGroupProps = BaseToolbarGroupProps;

/** Theme layer on `nsh/base` ToolbarSeparator: a hairline, never a tab stop. */
export type ToolbarSeparatorProps = BaseToolbarSeparatorProps;

type ToolbarContextValue = {
  vertical: boolean;
};

const ToolbarContext = context<ToolbarContextValue | null>(null);

function useToolbar() {
  const ctx = ToolbarContext();
  if (!ctx) throw new Error("Toolbar parts must be used within <Toolbar>");
  return ctx;
}

/** Wrapper defaults, then consumer — consumer wins per key (StyleProp list L→R). */
function mergeStyle(
  base?: StyleProp<ViewStyle> | null,
  consumer?: StyleProp<ViewStyle> | null,
): StyleProp<ViewStyle> | undefined {
  if (base == null && consumer == null) return undefined;
  if (base == null) return consumer ?? undefined;
  if (consumer == null) return base ?? undefined;
  return [base, consumer];
}

/**
 * The inset track (`toolbarTrack`): tools 2 points apart, 3 points inside the
 * edge, on `muted` (the reference's inset) with the border's edge. Call it from
 * `computed`: a bare read snapshots the resolved color and the bar stays dark
 * after a switch to light.
 * The rule is a hairline, not a control, so its thickness is a fixed 1 point
 * and its length a fixed 18 (a row) — it must not grow with a label.
 */
function look(vertical: boolean) {
  return {
    bar: {
      flexDirection: vertical ? "column" : "row",
      alignItems: "center",
      gap: 2,
      padding: 3,
      borderRadius: 10,
      borderCurve: "continuous",
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.muted,
    } satisfies ViewStyle,
    group: {
      flexDirection: vertical ? "column" : "row",
      alignItems: "center",
      gap: 2,
    } satisfies ViewStyle,
    rule: (vertical
      ? {
          height: 1,
          alignSelf: "stretch",
          marginVertical: 4,
          marginHorizontal: 6,
          backgroundColor: colors.border,
        }
      : {
          width: 1,
          height: 18,
          marginHorizontal: 4,
          backgroundColor: colors.border,
        }) satisfies ViewStyle,
  };
}

/** The inset track, the same style {@link Toolbar} puts on the bar. */
export function toolbarTrackStyle(vertical?: boolean): ViewStyle {
  return look(Boolean(vertical)).bar;
}

/** The hairline, the same style {@link ToolbarSeparator} puts on the rule. */
export function toolbarRuleStyle(vertical?: boolean): ViewStyle {
  return look(Boolean(vertical)).rule;
}

/** The bar: one toolbar for screen readers, arrow keys along `axis`. */
export function Toolbar(props: ToolbarProps) {
  const [, rest] = split(props, ["style", "axis"]);
  const vertical = props.axis === "vertical";
  const bar = computed(() => toolbarTrackStyle(vertical));
  return (
    <ToolbarContext.Provider value={{ vertical }}>
      <BaseToolbar
        {...rest}
        axis={props.axis}
        style={mergeStyle(
          props.disabled ? { ...bar(), opacity: disabledOpacity() } : bar(),
          props.style,
        )}
      />
    </ToolbarContext.Provider>
  );
}

/** A named run of items. Its direction follows the toolbar. */
export function ToolbarGroup(props: ToolbarGroupProps) {
  const bar = useToolbar();
  const [, rest] = split(props, ["style"]);
  return (
    <BaseToolbarGroup
      {...rest}
      style={mergeStyle(
        props.disabled
          ? { ...look(bar.vertical).group, opacity: disabledOpacity() }
          : look(bar.vertical).group,
        props.style,
      )}
    />
  );
}

/** A hairline between runs. Not a stop of the keyboard focus. */
export function ToolbarSeparator(props: ToolbarSeparatorProps) {
  const bar = useToolbar();
  const [, rest] = split(props, ["style"]);
  const rule = computed(() => toolbarRuleStyle(bar.vertical));
  return <BaseToolbarSeparator {...rest} style={mergeStyle(rule(), props.style)} />;
}
