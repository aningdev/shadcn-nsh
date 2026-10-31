import { colors, focusRing, radius } from "@shadcn-nsh/theme";
import type { JSX } from "nsh";
import { Text, View } from "nsh";
import { Checkbox as BaseCheckbox } from "nsh/base";

function CheckMark() {
  return (
    <Text
      style={{ fontSize: 12, fontWeight: "700", color: colors.primaryForeground, lineHeight: 14 }}
    >
      ✓
    </Text>
  );
}

function DashMark() {
  return (
    <View
      style={{ width: 10, height: 2, borderRadius: 1, backgroundColor: colors.primaryForeground }}
    />
  );
}

export function Checkbox(props: {
  checked?: boolean;
  indeterminate?: boolean;
  disabled?: boolean;
  accessibilityLabel?: string | null;
  children?: JSX.Element;
  onChange?: (event: { checked: boolean }) => void;
}) {
  const on = () => !!props.checked || !!props.indeterminate;

  return (
    <BaseCheckbox
      checked={props.checked}
      indeterminate={props.indeterminate}
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
      indicatorStyle={{
        width: 16,
        height: 16,
        borderRadius: Math.min(4, radius.control),
        borderWidth: 1,
        borderColor: on() ? colors.primary : colors.input,
        backgroundColor: on() ? colors.primary : "transparent",
        alignItems: "center",
        justifyContent: "center",
      }}
      indicator={
        props.indeterminate ? (
          <DashMark />
        ) : props.checked ? (
          <CheckMark />
        ) : (
          <View style={{ width: 16, height: 16 }} />
        )
      }
    >
      {props.children}
    </BaseCheckbox>
  );
}
