import { colors, focusRing, radius } from "@shadcn-nsh/theme";
import type { JSX } from "nsh";
import { context, signal, Text, View } from "nsh";
import { Tab as BaseTab, Tabs as BaseTabs } from "nsh/base";

type TabsContextValue = {
  value: () => string;
  onValueChange: (value: string) => void;
};

const TabsContext = context<TabsContextValue | null>(null);

function useTabs() {
  return TabsContext();
}

export function Tabs(props: {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  children?: JSX.Element;
}) {
  const uncontrolled = signal(props.defaultValue ?? "");
  const ctx: TabsContextValue = {
    value: () => props.value ?? uncontrolled(),
    onValueChange: (next) => {
      if (props.value == null) uncontrolled.set(next);
      props.onValueChange?.(next);
    },
  };

  return <TabsContext.Provider value={ctx}>{props.children}</TabsContext.Provider>;
}

export function TabsList(props: { children?: JSX.Element }) {
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

export function TabsTrigger(props: {
  value: string;
  disabled?: boolean;
  accessibilityLabel?: string | null;
  children?: string | JSX.Element;
}) {
  const ctx = useTabs();
  const selected = () => (ctx ? ctx.value() === props.value : false);

  return (
    <BaseTab
      selected={selected()}
      disabled={props.disabled}
      accessibilityLabel={
        props.accessibilityLabel ?? (typeof props.children === "string" ? props.children : null)
      }
      onPress={() => ctx?.onValueChange(props.value)}
      focusStyle={focusRing()}
      style={{
        height: 32,
        paddingHorizontal: 12,
        borderRadius: Math.max(4, radius.control - 2),
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: selected() ? colors.background : "transparent",
        opacity: props.disabled ? 0.5 : 1,
      }}
    >
      {typeof props.children === "string" ? (
        <Text style={{ fontSize: 13, color: colors.foreground }}>{props.children}</Text>
      ) : (
        props.children
      )}
    </BaseTab>
  );
}

/** @deprecated Prefer `TabsTrigger` inside `TabsList`. */
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

export function TabsContent(props: { value: string; children?: JSX.Element }) {
  const ctx = useTabs();
  const show = () => ctx != null && ctx.value() === props.value;
  return <View style={{ marginTop: 8, display: show() ? "flex" : "none" }}>{props.children}</View>;
}
