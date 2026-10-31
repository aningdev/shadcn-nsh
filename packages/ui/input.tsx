import { colors, focusRing, radius } from "@shadcn-nsh/theme";
import type { InputStyle, StyleProp } from "nsh";
import { Input as BaseInput } from "nsh/base";

export function Input(props: {
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  disabled?: boolean;
  masked?: boolean;
  multiline?: boolean;
  maxLength?: number;
  accessibilityLabel?: string;
  style?: StyleProp<InputStyle>;
  onChange?: (event: { value: string }) => void;
  onSubmit?: () => void;
  onFocus?: () => void;
  onBlur?: () => void;
}) {
  return (
    <BaseInput
      value={props.value}
      defaultValue={props.defaultValue}
      placeholder={props.placeholder}
      disabled={props.disabled}
      masked={props.masked}
      multiline={props.multiline}
      maxLength={props.maxLength}
      accessibilityLabel={props.accessibilityLabel}
      onChange={props.onChange}
      onSubmit={props.onSubmit}
      onFocus={props.onFocus}
      onBlur={props.onBlur}
      focusStyle={focusRing()}
      style={[
        {
          height: props.multiline ? undefined : 36,
          minHeight: props.multiline ? 80 : 36,
          paddingHorizontal: 12,
          paddingVertical: props.multiline ? 8 : 0,
          borderRadius: radius.control,
          borderWidth: 1,
          borderColor: colors.input,
          backgroundColor: colors.background,
          color: colors.foreground,
          fontSize: 14,
          opacity: props.disabled ? 0.5 : 1,
        },
        props.style ?? null,
      ]}
    />
  );
}
