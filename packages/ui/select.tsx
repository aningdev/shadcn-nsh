import { colors, focusRing, radius } from "@shadcn-nsh/theme";
import type { JSX } from "nsh";
import { Text, View } from "nsh";
import { Select as BaseSelect, type SelectItem, type SelectItemState } from "nsh/base";

import { popupBackdrop, popupSurface } from "./lib/popup-surface";

export type { SelectItem, SelectItemState };

export function Select(props: {
  items: SelectItem[];
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
  const title = () => {
    const v = props.value;
    if (v == null) return props.placeholder ?? "Select…";
    return props.items.find((i) => i.value === v)?.title ?? props.placeholder ?? "Select…";
  };

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
        {title()}
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
