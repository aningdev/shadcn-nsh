import { colors, focusRing, radius } from "@shadcn-nsh/theme";
import type { JSX } from "nsh";
import { Toggle as BaseToggle } from "nsh/base";

export function Toggle(props: {
  pressed?: boolean;
  disabled?: boolean;
  accessibilityLabel?: string | null;
  children?: JSX.Element;
  onChange?: (event: { pressed: boolean }) => void;
}) {
  return (
    <BaseToggle
      pressed={props.pressed}
      disabled={props.disabled}
      accessibilityLabel={props.accessibilityLabel}
      onChange={props.onChange}
      focusStyle={focusRing()}
      style={{
        height: 36,
        paddingHorizontal: 12,
        borderRadius: radius.control,
        borderWidth: 1,
        borderColor: props.pressed ? colors.accent : colors.border,
        backgroundColor: props.pressed ? colors.accent : colors.background,
        alignItems: "center",
        justifyContent: "center",
        opacity: props.disabled ? 0.5 : 1,
      }}
      pressedStyle={{
        backgroundColor: colors.accent,
        borderColor: colors.accent,
      }}
    >
      {props.children}
    </BaseToggle>
  );
}
