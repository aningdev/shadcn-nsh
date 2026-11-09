import { colors, focusRing, radius } from "@shadcn-nsh/theme";
import type { JSX } from "nsh";
import { cleanup, context, Text, View } from "nsh";
import {
  Combobox as BaseCombobox,
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

type ComboboxRootProps = {
  items?: SelectItemData[];
  multiple?: boolean;
  value?: string[] | null;
  defaultValue?: string[];
  open?: boolean | null;
  defaultOpen?: boolean;
  searchable?: boolean;
  searchPlaceholder?: string | null;
  cleanable?: boolean;
  disabled?: boolean;
  placeholder?: string;
  accessibilityLabel?: string | null;
  /** @deprecated Prefer `<ComboboxTrigger>`. */
  trigger?: JSX.Element;
  empty?: JSX.Element;
  children?: JSX.Element;
  onChange?: (event: { value: string[] }) => void;
  onOpenChange?: (event: { open: boolean; reason: string }) => void;
};

type ComboboxContextValue = {
  items: ItemRegistry<SelectItemData>;
  trigger: TriggerSlot;
  empty: TriggerSlot;
  value: () => string[] | null | undefined;
  placeholder: () => string;
  disabled: () => boolean | undefined;
  root: ComboboxRootProps;
};

const ComboboxContext = context<ComboboxContextValue | null>(null);

function useCombobox() {
  const ctx = ComboboxContext();
  if (!ctx) throw new Error("Combobox parts must be used within <Combobox>");
  return ctx;
}

function defaultTrigger(ctx: ComboboxContextValue) {
  const label = () => {
    const values = ctx.value() ?? [];
    if (values.length === 0) return ctx.placeholder();
    return values.map((v) => ctx.items.items().find((i) => i.value === v)?.title ?? v).join(", ");
  };

  return (
    <View
      style={{
        height: 36,
        minWidth: 180,
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
          flex: 1,
          fontSize: 14,
          color: (ctx.value()?.length ?? 0) === 0 ? colors.mutedForeground : colors.foreground,
        }}
      >
        {label()}
      </Text>
      <Text style={{ fontSize: 12, color: colors.mutedForeground }}>▾</Text>
    </View>
  );
}

function StyledCombobox(props: {
  items: SelectItemData[];
  multiple?: boolean;
  value?: string[] | null;
  defaultValue?: string[];
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
  onChange?: (event: { value: string[] }) => void;
  onOpenChange?: (event: { open: boolean; reason: string }) => void;
}) {
  const label = () => {
    const values = props.value ?? [];
    if (values.length === 0) return props.placeholder ?? "Choose…";
    return values.map((v) => props.items.find((i) => i.value === v)?.title ?? v).join(", ");
  };

  const trigger = props.trigger ?? (
    <View
      style={{
        height: 36,
        minWidth: 180,
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
          flex: 1,
          fontSize: 14,
          color: (props.value?.length ?? 0) === 0 ? colors.mutedForeground : colors.foreground,
        }}
      >
        {label()}
      </Text>
      <Text style={{ fontSize: 12, color: colors.mutedForeground }}>▾</Text>
    </View>
  );

  return (
    <BaseCombobox
      items={props.items}
      multiple={props.multiple}
      value={props.value}
      defaultValue={props.defaultValue}
      open={props.open}
      defaultOpen={props.defaultOpen}
      searchable={props.searchable ?? true}
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

export function Combobox(props: ComboboxRootProps) {
  if (props.items) {
    return (
      <StyledCombobox
        items={props.items}
        multiple={props.multiple}
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
  const empty = createTriggerSlot();
  const ctx: ComboboxContextValue = {
    items,
    trigger,
    empty,
    value: () => props.value,
    placeholder: () => props.placeholder ?? "Choose…",
    disabled: () => props.disabled,
    root: props,
  };

  return <ComboboxContext.Provider value={ctx}>{props.children}</ComboboxContext.Provider>;
}

export function ComboboxTrigger(props: { children?: JSX.Element }) {
  const ctx = useCombobox();
  ctx.trigger.set(() => (
    <View
      style={{
        height: 36,
        minWidth: 180,
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
      <View style={{ flex: 1 }}>{props.children ?? <ComboboxValue />}</View>
      <Text style={{ fontSize: 12, color: colors.mutedForeground }}>▾</Text>
    </View>
  ));
  return <View style={{ width: 0, height: 0 }} />;
}

export function ComboboxValue(props: { placeholder?: string }) {
  const ctx = useCombobox();
  const values = ctx.value() ?? [];
  const label =
    values.length === 0
      ? (props.placeholder ?? ctx.placeholder())
      : values.map((v) => ctx.items.items().find((i) => i.value === v)?.title ?? v).join(", ");

  return (
    <Text
      style={{
        fontSize: 14,
        color: values.length === 0 ? colors.mutedForeground : colors.foreground,
      }}
    >
      {label}
    </Text>
  );
}

export function ComboboxContent(props: { children?: JSX.Element }) {
  const ctx = useCombobox();
  const triggerAccessor = ctx.trigger.get();
  const emptyAccessor = ctx.empty.get();
  const root = ctx.root;

  return (
    <View style={{ gap: 0 }}>
      {props.children}
      <StyledCombobox
        items={ctx.items.items()}
        multiple={root.multiple}
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
        empty={(emptyAccessor?.() as JSX.Element) ?? root.empty ?? undefined}
        onChange={root.onChange}
        onOpenChange={root.onOpenChange}
      />
    </View>
  );
}

export function ComboboxEmpty(props: { children?: string }) {
  const ctx = useCombobox();
  ctx.empty.set(() => (
    <Text style={{ fontSize: 13, color: colors.mutedForeground, padding: 8 }}>
      {props.children ?? "No results"}
    </Text>
  ));
  return <View style={{ width: 0, height: 0 }} />;
}

export function ComboboxItem(props: { value: string; disabled?: boolean; children?: string }) {
  const ctx = useCombobox();
  ctx.items.register({
    value: props.value,
    title: props.children ?? props.value,
    disabled: props.disabled,
  });
  cleanup(() => ctx.items.unregister(props.value));
  return <View style={{ width: 0, height: 0 }} />;
}
