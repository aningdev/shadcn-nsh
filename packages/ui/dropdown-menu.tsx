import { colors, focusRing } from "@shadcn-nsh/theme";
import type { JSX } from "nsh";
import { Text, View } from "nsh";
import {
  Menu as BaseMenu,
  MenuItem as BaseMenuItem,
  MenuSeparator as BaseMenuSeparator,
  Submenu as BaseSubmenu,
} from "nsh/base";

import { popupBackdrop, popupSurface } from "./lib/popup-surface";

export function DropdownMenu(props: {
  open?: boolean | null;
  defaultOpen?: boolean;
  trigger?: JSX.Element;
  children?: JSX.Element;
  onOpenChange?: (event: { open: boolean; reason: string }) => void;
}) {
  return (
    <BaseMenu
      open={props.open}
      defaultOpen={props.defaultOpen}
      trigger={props.trigger}
      onOpenChange={props.onOpenChange as never}
      offset={4}
      popupStyle={{ ...popupSurface(), minWidth: 160 }}
      backdropStyle={popupBackdrop()}
    >
      {props.children}
    </BaseMenu>
  );
}

export function DropdownMenuItem(props: {
  disabled?: boolean;
  checked?: boolean | null;
  closeOnSelect?: boolean;
  accessibilityLabel?: string | null;
  children?: JSX.Element;
  onSelect?: () => void;
}) {
  return (
    <BaseMenuItem
      disabled={props.disabled}
      checked={props.checked}
      closeOnSelect={props.closeOnSelect}
      accessibilityLabel={props.accessibilityLabel}
      onSelect={props.onSelect}
      focusStyle={focusRing()}
      style={{
        height: 32,
        paddingHorizontal: 8,
        borderRadius: 6,
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        opacity: props.disabled ? 0.5 : 1,
      }}
      hoverStyle={props.disabled ? undefined : { backgroundColor: colors.accent }}
      indicatorStyle={{ width: 16, height: 16, alignItems: "center", justifyContent: "center" }}
      indicator={
        props.checked ? (
          <Text style={{ fontSize: 12, color: colors.primary }}>✓</Text>
        ) : (
          <View style={{ width: 16, height: 16 }} />
        )
      }
    >
      {props.children}
    </BaseMenuItem>
  );
}

export function DropdownMenuSeparator() {
  return (
    <BaseMenuSeparator
      style={{
        height: 1,
        marginVertical: 4,
        marginHorizontal: 4,
        backgroundColor: colors.border,
      }}
    />
  );
}

export function DropdownMenuSub(props: { trigger?: JSX.Element; children?: JSX.Element }) {
  return (
    <BaseSubmenu trigger={props.trigger} style={{ minWidth: 140 }}>
      {props.children}
    </BaseSubmenu>
  );
}

/** Alias matching shadcn naming — pass children as the menu `trigger`. */
export function DropdownMenuTrigger(props: { children?: JSX.Element }) {
  return props.children;
}
