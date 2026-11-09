import { colors, radius } from "@shadcn-nsh/theme";
import type { JSX } from "nsh";
import { ToggleGroup as BaseToggleGroup } from "nsh/base";

export function ToggleGroup(props: { disabled?: boolean; children?: JSX.Element }) {
  return (
    <BaseToggleGroup
      disabled={props.disabled}
      style={{
        flexDirection: "row",
        gap: 4,
        padding: 4,
        borderRadius: radius.control,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.muted,
        opacity: props.disabled ? 0.5 : 1,
      }}
    >
      {props.children}
    </BaseToggleGroup>
  );
}

export { Toggle } from "./toggle";
