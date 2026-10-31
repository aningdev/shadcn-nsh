import { colors, focusRing, radius } from "@shadcn-nsh/theme";
import type { JSX } from "nsh";
import { cleanup, context, signal, Text, View, type Signal } from "nsh";
import {
  Select as BaseSelect,
  type SelectItem as SelectItemData,
  type SelectItemState,
} from "nsh/base";

import {
  createItemRegistry,
  createTriggerSlot,
  type ItemRegistry,
  type TriggerSlot,
} from "./lib/open-state";
import { popupBackdrop, popupSurface } from "./lib/popup-surface";

export type { SelectItemData, SelectItemState };

type SelectContextValue = {
  items: ItemRegistry<SelectItemData>;
  trigger: TriggerSlot;
  value: () => string | null | undefined;
  placeholder: () => string;
  disabled: () => boolean | undefined;
  root: SelectRootProps;
};

type SelectRootProps = {
  items?: SelectItemData[];
  value?: string | null;
  defaultValue?: string | null;
  open?: boolean | null;
  defaultOpen?: boolean;
  searchable?: boolean;
  searchPlaceholder?: string | null;
  cleanable?: boolean;
  disabled?: boolean;
  placeholder?: string;
  accessibilityLabel?: string | null;
  /** @deprecated Prefer `<SelectTrigger>`. */
  trigger?: JSX.Element;
  empty?: JSX.Element;
  children?: JSX.Element;
  onChange?: (event: { value: string | null }) => void;
  onOpenChange?: (event: { open: boolean; reason: string }) => void;
};

const SelectContext = context<SelectContextValue | null>(null);
const SelectGroupContext = context<Signal<string | undefined> | null>(null);

function useSelect() {
  const ctx = SelectContext();
  if (!ctx) throw new Error("Select parts must be used within <Select>");
  return ctx;
}

function defaultTrigger(ctx: SelectContextValue) {
  const title = () => {
    const v = ctx.value();
    if (v == null) return ctx.placeholder();
    return ctx.items.items().find((i) => i.value === v)?.title ?? ctx.placeholder();
  };

  return (
    <View
      style={{
        height: 36,
        minWidth: 160,
        paddingHorizontal: 12,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 8,
        borderRadius: radius.control,
        borderWidth: 1,
        borderColor: colors.input,
        backgroundColor: colors.background,
        opacity: ctx.disabled() ? 0.5 : 1,
      }}
    >
      <Text
        style={{
          fontSize: 14,
          color: ctx.value() == null ? colors.mutedForeground : colors.foreground,
        }}
      >
        {title()}
      </Text>
      <Text style={{ fontSize: 12, color: colors.mutedForeground }}>▾</Text>
    </View>
  );
}

function StyledSelect(props: {
  items: SelectItemData[];
  value?: string | null;
  defaultValue?: string | null;
  open?: boolean | null;
  defaultOpen?: boolean;
  searchable?: boolean;
  searchPlaceholder?: string | null;
  cleanable?: boolean;
  disabled?: boolean;
  placeholder?: string;
  accessibilityLabel?: string | null;
  trigger?: JSX.Element;
  empty?: JSX.Element;
  onChange?: (event: { value: string | null }) => void;
  onOpenChange?: (event: { open: boolean; reason: string }) => void;
}) {
  const trigger = props.trigger ?? (
    <View
      style={{
        height: 36,
        minWidth: 160,
        paddingHorizontal: 12,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 8,
        borderRadius: radius.control,
        borderWidth: 1,
        borderColor: colors.input,
        backgroundColor: colors.background,
        opacity: props.disabled ? 0.5 : 1,
      }}
    >
      <Text
        style={{
          fontSize: 14,
          color: props.value == null ? colors.mutedForeground : colors.foreground,
        }}
      >
        {(() => {
          const v = props.value;
          if (v == null) return props.placeholder ?? "Select…";
          return props.items.find((i) => i.value === v)?.title ?? props.placeholder ?? "Select…";
        })()}
      </Text>
      <Text style={{ fontSize: 12, color: colors.mutedForeground }}>▾</Text>
    </View>
  );

  return (
    <BaseSelect
      items={props.items}
      value={props.value}
      defaultValue={props.defaultValue}
      open={props.open}
      defaultOpen={props.defaultOpen}
      searchable={props.searchable}
      searchPlaceholder={props.searchPlaceholder}
      cleanable={props.cleanable}
      disabled={props.disabled}
      accessibilityLabel={props.accessibilityLabel}
      offset={4}
      trigger={trigger}
      empty={props.empty}
      onChange={props.onChange}
      onOpenChange={props.onOpenChange as never}
      popupStyle={popupSurface()}
      backdropStyle={popupBackdrop()}
      listStyle={{ maxHeight: 240 }}
      itemStyle={{
        height: 32,
        paddingHorizontal: 8,
        borderRadius: 6,
        fontSize: 14,
        color: colors.foreground,
      }}
      groupStyle={{
        paddingHorizontal: 8,
        paddingTop: 8,
        paddingBottom: 4,
      }}
      searchStyle={{
        height: 32,
        margin: 4,
        paddingHorizontal: 8,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: colors.input,
        fontSize: 14,
        color: colors.foreground,
      }}
      focusStyle={focusRing()}
      renderItem={(item: SelectItemState) => (
        <View
          style={{
            height: 32,
            paddingHorizontal: 8,
            borderRadius: 6,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            backgroundColor: item.highlighted ? colors.accent : "transparent",
            opacity: item.disabled ? 0.4 : 1,
          }}
        >
          <Text
            style={{
              fontSize: 14,
              fontWeight: item.selected ? "600" : "400",
              color: colors.foreground,
            }}
          >
            {item.title}
          </Text>
          {item.selected ? <Text style={{ fontSize: 12, color: colors.primary }}>✓</Text> : null}
        </View>
      )}
    />
  );
}

export function Select(props: SelectRootProps) {
  // Data-driven API (nsh-native): keep working for galleries and lists.
  if (props.items) {
    return (
      <StyledSelect
        items={props.items}
        value={props.value}
        defaultValue={props.defaultValue}
        open={props.open}
        defaultOpen={props.defaultOpen}
        searchable={props.searchable}
        searchPlaceholder={props.searchPlaceholder}
        cleanable={props.cleanable}
        disabled={props.disabled}
        placeholder={props.placeholder}
        accessibilityLabel={props.accessibilityLabel}
        trigger={props.trigger}
        empty={props.empty}
        onChange={props.onChange}
        onOpenChange={props.onOpenChange}
      />
    );
  }

  const items = createItemRegistry<SelectItemData>([]);
  const trigger = createTriggerSlot();
  const ctx: SelectContextValue = {
    items,
    trigger,
    value: () => props.value,
    placeholder: () => props.placeholder ?? "Select…",
    disabled: () => props.disabled,
    root: props,
  };

  return <SelectContext.Provider value={ctx}>{props.children}</SelectContext.Provider>;
}

export function SelectTrigger(props: { children?: JSX.Element }) {
  const ctx = useSelect();
  ctx.trigger.set(() => (
    <View
      style={{
        height: 36,
        minWidth: 160,
        paddingHorizontal: 12,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 8,
        borderRadius: radius.control,
        borderWidth: 1,
        borderColor: colors.input,
        backgroundColor: colors.background,
        opacity: ctx.disabled() ? 0.5 : 1,
      }}
    >
      <View style={{ flex: 1 }}>{props.children ?? <SelectValue />}</View>
      <Text style={{ fontSize: 12, color: colors.mutedForeground }}>▾</Text>
    </View>
  ));
  return <View style={{ width: 0, height: 0 }} />;
}

export function SelectValue(props: { placeholder?: string }) {
  const ctx = useSelect();
  const v = ctx.value();
  const label =
    v == null
      ? (props.placeholder ?? ctx.placeholder())
      : (ctx.items.items().find((i) => i.value === v)?.title ??
        props.placeholder ??
        ctx.placeholder());

  return (
    <Text
      style={{
        fontSize: 14,
        color: v == null ? colors.mutedForeground : colors.foreground,
      }}
    >
      {label}
    </Text>
  );
}

export function SelectContent(props: { children?: JSX.Element }) {
  const ctx = useSelect();
  const triggerAccessor = ctx.trigger.get();
  const root = ctx.root;

  return (
    <View style={{ gap: 0 }}>
      {props.children}
      <StyledSelect
        items={ctx.items.items()}
        value={root.value}
        defaultValue={root.defaultValue}
        open={root.open}
        defaultOpen={root.defaultOpen}
        searchable={root.searchable}
        searchPlaceholder={root.searchPlaceholder}
        cleanable={root.cleanable}
        disabled={root.disabled}
        placeholder={root.placeholder}
        accessibilityLabel={root.accessibilityLabel}
        trigger={(triggerAccessor?.() as JSX.Element) ?? defaultTrigger(ctx)}
        empty={root.empty}
        onChange={root.onChange}
        onOpenChange={root.onOpenChange}
      />
    </View>
  );
}

export function SelectGroup(props: { children?: JSX.Element }) {
  const label = signal<string | undefined>(undefined);
  return <SelectGroupContext.Provider value={label}>{props.children}</SelectGroupContext.Provider>;
}

export function SelectLabel(props: { children?: string }) {
  const label = SelectGroupContext();
  label?.set(props.children);
  return <View style={{ width: 0, height: 0 }} />;
}

export function SelectItem(props: {
  value: string;
  disabled?: boolean;
  group?: string;
  children?: string;
}) {
  const ctx = useSelect();
  const groupLabel = SelectGroupContext();
  ctx.items.register({
    value: props.value,
    title: props.children ?? props.value,
    disabled: props.disabled,
    group: props.group ?? groupLabel?.(),
  });
  cleanup(() => ctx.items.unregister(props.value));
  return <View style={{ width: 0, height: 0 }} />;
}

export function SelectSeparator() {
  return <View style={{ width: 0, height: 0 }} />;
}
