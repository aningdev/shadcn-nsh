import { colors, focusRing, radius } from "@shadcn-nsh/theme";
import type { JSX } from "nsh";
import { Text, View } from "nsh";
import { Combobox as BaseCombobox, type SelectItem, type SelectItemState } from "nsh/base";

import { popupBackdrop, popupSurface } from "./lib/popup-surface";

export function Combobox(props: {
  items: SelectItem[];
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
