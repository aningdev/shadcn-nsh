import { colors, focusRing, radius } from "@shadcn-nsh/theme";
import type { JSX, StyleProp, ViewStyle } from "nsh";
import { context, signal, Text, View } from "nsh";
import {
  Tab as BaseTab,
  Tabs as BaseTabs,
  type TabProps as BaseTabProps,
  type TabsProps as BaseTabsProps,
} from "nsh/base";

/**
 * Composition root (shadcn `Tabs`): holds the selected value and orientation.
 * `nsh/base` has no value-holding root — the list is {@link TabsList} / `BaseTabs`.
 */
export type TabsProps = {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** shadcn `bases/base` orientation — maps to root flex + list axis. */
  orientation?: "horizontal" | "vertical";
  children?: JSX.Element;
  class?: string | null;
  style?: StyleProp<ViewStyle>;
};

/** shadcn `bases/base` TabsList look — `default` muted pill rail; `line` underline. */
export type TabsListVariant = "default" | "line";

/**
 * Theme layer on `nsh/base` Tabs (the tablist). All base props + style hooks
 * pass through; consumer styles shallow-merge over defaults. Wrapper-only
 * `variant` mirrors shadcn `bases/base` (`default` | `line`).
 */
export type TabsListProps = BaseTabsProps & {
  variant?: TabsListVariant;
};

/**
 * Theme layer on `nsh/base` Tab as a shadcn `TabsTrigger`: `value` selects via
 * the {@link Tabs} context. All other base props + style hooks pass through;
 * consumer styles shallow-merge over defaults. `selected` is owned by context.
 */
export type TabsTriggerProps = Omit<BaseTabProps, "selected" | "children"> & {
  value: string;
  children?: string | JSX.Element;
};

/**
 * Panel next to the list — app content (not an `nsh/base` part). Shown while
 * its `value` matches the {@link Tabs} context.
 */
export type TabsContentProps = {
  value: string;
  children?: JSX.Element;
  class?: string | null;
  style?: StyleProp<ViewStyle>;
};

/**
 * Theme layer on the `nsh/base` {@link Tab} symbol for direct use (no composition
 * `value`). Prefer {@link TabsTrigger} inside {@link TabsList}. All base props
 * + style hooks pass through; consumer styles shallow-merge over defaults.
 */
export type TabProps = BaseTabProps;

type TabsContextValue = {
  value: () => string;
  onValueChange: (value: string) => void;
  orientation: () => "horizontal" | "vertical";
};

const TabsContext = context<TabsContextValue | null>(null);

function useTabs() {
  return TabsContext();
}

/** Concatenate wrapper + consumer `class` when both are set. */
function mergeClass(base?: string | null, consumer?: string | null): string | undefined {
  if (base && consumer) return `${base} ${consumer}`;
  return consumer ?? base ?? undefined;
}

/** Wrapper defaults, then consumer — consumer wins per key (StyleProp list L→R). */
function mergeStyle(
  base?: StyleProp<ViewStyle> | null,
  consumer?: StyleProp<ViewStyle> | null,
): StyleProp<ViewStyle> | undefined {
  if (base == null && consumer == null) return undefined;
  if (base == null) return consumer ?? undefined;
  if (consumer == null) return base ?? undefined;
  return [base, consumer];
}

function rootChrome(orientation: "horizontal" | "vertical"): ViewStyle {
  return {
    flexDirection: orientation === "vertical" ? "row" : "column",
    alignItems: orientation === "vertical" ? "stretch" : "stretch",
    gap: 8,
  };
}

function listChrome(variant: TabsListVariant, orientation: "horizontal" | "vertical"): ViewStyle {
  const axis: ViewStyle = {
    flexDirection: orientation === "vertical" ? "column" : "row",
    alignSelf: "flex-start",
  };
  if (variant === "line") {
    return {
      ...axis,
      gap: 4,
      padding: 0,
      backgroundColor: "transparent",
      borderBottomWidth: orientation === "horizontal" ? 1 : 0,
      borderRightWidth: orientation === "vertical" ? 1 : 0,
      borderColor: colors.border,
    };
  }
  return {
    ...axis,
    gap: 4,
    padding: 4,
    borderRadius: radius.control,
    backgroundColor: colors.muted,
  };
}

/** Pill indicator substitute on the selected tab (wrapper chrome; not a base list indicator). */
function triggerSelectedChrome(variant: TabsListVariant): ViewStyle {
  if (variant === "line") {
    return {
      borderBottomWidth: 2,
      borderBottomColor: colors.foreground,
      marginBottom: -1,
    };
  }
  return {
    backgroundColor: colors.background,
  };
}

function triggerChrome(variant: TabsListVariant): ViewStyle {
  return {
    height: 32,
    paddingHorizontal: 12,
    borderRadius: variant === "line" ? 0 : Math.max(4, radius.control - 2),
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  };
}

function contentChrome(): ViewStyle {
  return {
    flex: 1,
    marginTop: 0,
  };
}

function defaultLabel(selected: boolean, children: string): JSX.Element {
  return (
    <Text
      style={{
        fontSize: 13,
        fontWeight: "500",
        color: selected ? colors.foreground : colors.mutedForeground,
      }}
    >
      {children}
    </Text>
  );
}

const ListVariantContext = context<TabsListVariant>("default");

export function Tabs(props: TabsProps) {
  const {
    value,
    defaultValue,
    onValueChange,
    orientation = "horizontal",
    children,
    class: className,
    style,
  } = props;
  const uncontrolled = signal(defaultValue ?? "");
  const ctx: TabsContextValue = {
    value: () => value ?? uncontrolled(),
    onValueChange: (next) => {
      if (value == null) uncontrolled.set(next);
      onValueChange?.(next);
    },
    orientation: () => orientation,
  };

  return (
    <TabsContext.Provider value={ctx}>
      <View
        class={mergeClass(undefined, className)}
        style={mergeStyle(rootChrome(orientation), style)}
      >
        {children}
      </View>
    </TabsContext.Provider>
  );
}

export function TabsList(props: TabsListProps) {
  const {
    class: className,
    style,
    hoverStyle,
    activeStyle,
    focusStyle,
    disabledStyle,
    variant = "default",
    children,
    ...rest
  } = props;
  const tabs = useTabs();
  const orientation = tabs?.orientation() ?? "horizontal";

  return (
    <ListVariantContext.Provider value={variant}>
      <BaseTabs
        {...rest}
        class={mergeClass(undefined, className)}
        style={mergeStyle(listChrome(variant, orientation), style)}
        hoverStyle={mergeStyle(undefined, hoverStyle)}
        activeStyle={mergeStyle(undefined, activeStyle)}
        focusStyle={mergeStyle(undefined, focusStyle)}
        disabledStyle={mergeStyle(undefined, disabledStyle)}
      >
        {children}
      </BaseTabs>
    </ListVariantContext.Provider>
  );
}

export function TabsTrigger(props: TabsTriggerProps) {
  const {
    class: className,
    style,
    hoverStyle,
    activeStyle,
    focusStyle,
    disabledStyle,
    selectedStyle,
    value,
    disabled,
    accessibilityLabel,
    children,
    onPress,
    ...rest
  } = props;
  const ctx = useTabs();
  const variant = ListVariantContext();
  const selected = () => (ctx ? ctx.value() === value : false);
  const on = selected();

  return (
    <BaseTab
      {...rest}
      selected={on}
      disabled={disabled}
      accessibilityLabel={accessibilityLabel ?? (typeof children === "string" ? children : null)}
      onPress={() => {
        ctx?.onValueChange(value);
        onPress?.();
      }}
      class={mergeClass(undefined, className)}
      style={mergeStyle(triggerChrome(variant), style)}
      hoverStyle={mergeStyle(undefined, hoverStyle)}
      activeStyle={mergeStyle(undefined, activeStyle)}
      focusStyle={mergeStyle(focusRing(), focusStyle)}
      disabledStyle={mergeStyle({ opacity: 0.5 }, disabledStyle)}
      selectedStyle={mergeStyle(triggerSelectedChrome(variant), selectedStyle)}
    >
      {typeof children === "string" ? defaultLabel(on, children) : children}
    </BaseTab>
  );
}

/** `nsh/base` Tab with token chrome; for composition layouts prefer `TabsTrigger`. */
export function Tab(props: TabProps) {
  const {
    class: className,
    style,
    hoverStyle,
    activeStyle,
    focusStyle,
    disabledStyle,
    selectedStyle,
    selected,
    children,
    ...rest
  } = props;

  return (
    <BaseTab
      {...rest}
      selected={selected}
      class={mergeClass(undefined, className)}
      style={mergeStyle(triggerChrome("default"), style)}
      hoverStyle={mergeStyle(undefined, hoverStyle)}
      activeStyle={mergeStyle(undefined, activeStyle)}
      focusStyle={mergeStyle(focusRing(), focusStyle)}
      disabledStyle={mergeStyle({ opacity: 0.5 }, disabledStyle)}
      selectedStyle={mergeStyle(triggerSelectedChrome("default"), selectedStyle)}
    >
      {children}
    </BaseTab>
  );
}

export function TabsContent(props: TabsContentProps) {
  const { value, children, class: className, style } = props;
  const ctx = useTabs();
  const show = () => ctx != null && ctx.value() === value;
  return (
    <View
      class={mergeClass(undefined, className)}
      style={mergeStyle({ ...contentChrome(), display: show() ? "flex" : "none" }, style)}
    >
      {children}
    </View>
  );
}
