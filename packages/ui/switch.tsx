import { colors, focusRing } from "@shadcn-nsh/theme";
import type { JSX } from "nsh";
import { Switch as BaseSwitch } from "nsh/base";

export function Switch(props: {
  checked?: boolean;
  disabled?: boolean;
  accessibilityLabel?: string | null;
  children?: JSX.Element;
  onChange?: (event: { checked: boolean }) => void;
}) {
  const on = () => !!props.checked;

  return (
    <BaseSwitch
      checked={props.checked}
      disabled={props.disabled}
      accessibilityLabel={props.accessibilityLabel}
      onChange={props.onChange}
      focusStyle={focusRing()}
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        opacity: props.disabled ? 0.5 : 1,
      }}
      trackStyle={{
        width: 36,
        height: 20,
        borderRadius: 10,
        padding: 2,
        backgroundColor: on() ? colors.primary : colors.input,
        justifyContent: "center",
      }}
      thumbClass="checked:translate-x-4"
      thumbStyle={{
        width: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: colors.background,
      }}
    >
      {props.children}
    </BaseSwitch>
  );
}
