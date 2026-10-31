import { colors, focusRing, radius } from "@shadcn-nsh/theme";
import type { JSX } from "nsh";
import { Tab as BaseTab, Tabs as BaseTabs } from "nsh/base";

export function Tabs(props: { children?: JSX.Element }) {
  return (
    <BaseTabs
      style={{
        flexDirection: "row",
        gap: 4,
        padding: 4,
        borderRadius: radius.control,
        backgroundColor: colors.muted,
      }}
      indicatorStyle={{ display: "none" }}
    >
      {props.children}
    </BaseTabs>
  );
}

export function Tab(props: {
  selected?: boolean;
  disabled?: boolean;
  accessibilityLabel?: string | null;
  children?: JSX.Element;
  onPress?: () => void;
}) {
  return (
    <BaseTab
      selected={props.selected}
      disabled={props.disabled}
      accessibilityLabel={props.accessibilityLabel}
      onPress={props.onPress}
      focusStyle={focusRing()}
      style={{
        height: 32,
        paddingHorizontal: 12,
        borderRadius: Math.max(4, radius.control - 2),
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: props.selected ? colors.background : "transparent",
        opacity: props.disabled ? 0.5 : 1,
      }}
    >
      {props.children}
    </BaseTab>
  );
}
