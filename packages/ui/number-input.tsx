import { colors, focusRing, radius } from "@shadcn-nsh/theme";
import type { JSX } from "nsh";
import { Text } from "nsh";
import { NumberInput as BaseNumberInput } from "nsh/base";

export function NumberInput(props: {
  value?: number | null;
  defaultValue?: number | null;
  min?: number | null;
  max?: number | null;
  step?: number;
  disabled?: boolean;
  readonly?: boolean;
  placeholder?: string | null;
  accessibilityLabel?: string | null;
  controlsRight?: boolean;
  prefix?: JSX.Element;
  suffix?: JSX.Element;
  onChange?: (event: { value: number | null }) => void;
  onSubmit?: (event: { value: number | null }) => void;
}) {
  const btn = {
    width: 28,
    height: 28,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.secondary,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  };

  return (
    <BaseNumberInput
      value={props.value}
      defaultValue={props.defaultValue}
      min={props.min}
      max={props.max}
      step={props.step}
      disabled={props.disabled}
      readonly={props.readonly}
      placeholder={props.placeholder}
      accessibilityLabel={props.accessibilityLabel}
      controlsRight={props.controlsRight ?? true}
      prefix={props.prefix}
      suffix={props.suffix}
      onChange={props.onChange}
      onSubmit={props.onSubmit}
      style={{
        height: 36,
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        opacity: props.disabled ? 0.5 : 1,
      }}
      inputStyle={{
        flex: 1,
        height: 36,
        paddingHorizontal: 12,
        borderRadius: radius.control,
        borderWidth: 1,
        borderColor: colors.input,
        backgroundColor: colors.background,
        color: colors.foreground,
        fontSize: 14,
        textAlign: "center",
        ...focusRing(),
      }}
      decrementButtonStyle={btn}
      incrementButtonStyle={btn}
      decrementButton={<Text style={{ fontSize: 16, color: colors.foreground }}>−</Text>}
      incrementButton={<Text style={{ fontSize: 16, color: colors.foreground }}>+</Text>}
      controlsStyle={{ gap: 2 }}
    />
  );
}
