import { colors, focusRing, radius } from "@shadcn-nsh/theme";
import { OtpInput as BaseOtpInput } from "nsh/base";

export function OtpInput(props: {
  length: number;
  value?: string | null;
  defaultValue?: string | null;
  masked?: boolean;
  disabled?: boolean;
  groups?: number;
  accessibilityLabel?: string | null;
  onChange?: (event: { value: string }) => void;
  onComplete?: (event: { value: string }) => void;
}) {
  return (
    <BaseOtpInput
      length={props.length}
      value={props.value}
      defaultValue={props.defaultValue}
      masked={props.masked}
      disabled={props.disabled}
      groups={props.groups}
      accessibilityLabel={props.accessibilityLabel}
      onChange={props.onChange}
      onComplete={props.onComplete as never}
      style={{
        flexDirection: "row",
        gap: 8,
        opacity: props.disabled ? 0.5 : 1,
      }}
      groupStyle={{ flexDirection: "row", gap: 8 }}
      cellStyle={{
        width: 40,
        height: 44,
        borderRadius: radius.control,
        borderWidth: 1,
        borderColor: colors.input,
        backgroundColor: colors.background,
        color: colors.foreground,
        fontSize: 18,
        fontWeight: "600",
        textAlign: "center",
        ...focusRing(),
      }}
      caretStyle={{
        width: 2,
        height: 20,
        backgroundColor: colors.foreground,
      }}
    />
  );
}
