// Source: examples/nsh-gallery-ui/look/tool.ts (`toolbarTrack`) @ 64ab8a1d (baseline), see NOTICE.
import { colors, disabledOpacity } from "@shadcn-nsh/theme";
import type { StyleProp, ViewStyle } from "nsh";
import { split } from "nsh";
import {
  ToggleGroup as BaseToggleGroup,
  type ToggleGroupProps as BaseToggleGroupProps,
} from "nsh/base";

/** Theme layer on `nsh/base` ToggleGroup: the inset track its toggles sit in. */
export type ToggleGroupProps = BaseToggleGroupProps;

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

/** The inset track: its toggles in a row 2 points apart, 3 points inside the edge, on a sunk fill. */
function trackChrome(): ViewStyle {
  return {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    padding: 3,
    borderRadius: 10,
    borderCurve: "continuous",
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.muted,
  };
}

export function ToggleGroup(props: ToggleGroupProps) {
  const [, rest] = split(props, ["style"]);

  return (
    <BaseToggleGroup
      {...rest}
      style={mergeStyle(
        { ...trackChrome(), opacity: disabledOpacity(props.disabled) },
        props.style,
      )}
    />
  );
}

export { Toggle } from "./toggle";
