import { colors, focusRing } from "@shadcn-nsh/theme";
import type { JSX } from "nsh";
import { Text, View } from "nsh";
import { Radio as BaseRadio, RadioGroup as BaseRadioGroup } from "nsh/base";

export function RadioGroup(props: { children?: JSX.Element; style?: object }) {
  return (
    <BaseRadioGroup style={[{ gap: 8 }, props.style ?? null]}>{props.children}</BaseRadioGroup>
  );
}

export function Radio(props: {
  checked?: boolean;
  disabled?: boolean;
  accessibilityLabel?: string | null;
  children?: JSX.Element;
  onChange?: (event: { checked: boolean }) => void;
}) {
  return (
    <BaseRadio
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
    >
      <View
        style={{
          width: 16,
          height: 16,
          borderRadius: 8,
          borderWidth: 1,
          borderColor: props.checked ? colors.primary : colors.input,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {props.checked ? (
          <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary }} />
        ) : null}
      </View>
      {props.children ?? <Text style={{ fontSize: 14, color: colors.foreground }} />}
    </BaseRadio>
  );
}
