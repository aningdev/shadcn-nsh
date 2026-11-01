import { colors, focusRing } from "@shadcn-nsh/theme";
import type { JSX } from "nsh";
import { context, Text, View } from "nsh";
import {
  Menu as BaseMenu,
  MenuItem as BaseMenuItem,
  MenuSeparator as BaseMenuSeparator,
  Submenu as BaseSubmenu,
} from "nsh/base";

import { Button } from "./button";
import {
  createOpenState,
  createTriggerSlot,
  type OpenState,
  type TriggerSlot,
} from "./lib/open-state";
import { popupBackdrop, popupSurface } from "./lib/popup-surface";

type MenuContextValue = OpenState & {
  trigger: TriggerSlot;
};

const MenuContext = context<MenuContextValue | null>(null);

function useMenu() {
  const ctx = MenuContext();
  if (!ctx) throw new Error("DropdownMenu parts must be used within <DropdownMenu>");
  return ctx;
}

export function DropdownMenu(props: {
  open?: boolean | null;
  defaultOpen?: boolean;
  /** @deprecated Prefer `<DropdownMenuTrigger>` + `<DropdownMenuContent>`. */
  trigger?: JSX.Element;
  children?: JSX.Element;
  onOpenChange?: (event: { open: boolean; reason: string }) => void;
}) {
  // Legacy single-root: trigger prop + item children.
  if (props.trigger != null) {
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

  const state = createOpenState({
    open: props.open,
    defaultOpen: props.defaultOpen,
    onOpenChange: props.onOpenChange,
  });
  const trigger = createTriggerSlot();

  return (
    <MenuContext.Provider value={{ ...state, trigger }}>{props.children}</MenuContext.Provider>
  );
}

export function DropdownMenuTrigger(props: {
  children?: string | JSX.Element;
  disabled?: boolean;
}) {
  const ctx = useMenu();
  ctx.trigger.set(() => {
    if (typeof props.children === "string") {
      return (
        <Button disabled={props.disabled} onPress={() => ctx.setOpen(true)}>
          {props.children}
        </Button>
      );
    }
    return (
      <View
        onPress={props.disabled ? undefined : () => ctx.setOpen(true)}
        style={{ opacity: props.disabled ? 0.5 : 1 }}
      >
        {props.children}
      </View>
    );
  });
  return <View style={{ width: 0, height: 0 }} />;
}

export function DropdownMenuContent(props: { children?: JSX.Element }) {
  const ctx = useMenu();
  const triggerAccessor = ctx.trigger.get();
  return (
    <BaseMenu
      open={ctx.open()}
      trigger={(triggerAccessor?.() as JSX.Element) ?? <View />}
      onOpenChange={(event) => ctx.setOpen(event.open)}
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

export function DropdownMenuCheckboxItem(props: {
  checked?: boolean | null;
  disabled?: boolean;
  children?: JSX.Element;
  onSelect?: () => void;
}) {
  return (
    <DropdownMenuItem
      checked={props.checked ?? false}
      disabled={props.disabled}
      onSelect={props.onSelect}
    >
      {props.children}
    </DropdownMenuItem>
  );
}

export function DropdownMenuLabel(props: { children?: string }) {
  return (
    <Text
      style={{
        fontSize: 12,
        fontWeight: "500",
        color: colors.mutedForeground,
        paddingHorizontal: 8,
        paddingVertical: 6,
      }}
    >
      {props.children}
    </Text>
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

type SubContextValue = { trigger: TriggerSlot };
const SubContext = context<SubContextValue | null>(null);

export function DropdownMenuSub(props: {
  /** @deprecated Prefer `<DropdownMenuSubTrigger>` + `<DropdownMenuSubContent>`. */
  trigger?: JSX.Element;
  children?: JSX.Element;
}) {
  if (props.trigger != null) {
    return (
      <BaseSubmenu trigger={props.trigger} style={{ minWidth: 140 }}>
        {props.children}
      </BaseSubmenu>
    );
  }

  const trigger = createTriggerSlot();
  return <SubContext.Provider value={{ trigger }}>{props.children}</SubContext.Provider>;
}

export function DropdownMenuSubTrigger(props: { children?: string | JSX.Element }) {
  const ctx = SubContext();
  if (!ctx) throw new Error("DropdownMenuSubTrigger must be used within <DropdownMenuSub>");
  ctx.trigger.set(() => {
    if (typeof props.children === "string") {
      return (
        <View
          style={{
            height: 32,
            paddingHorizontal: 8,
            borderRadius: 6,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Text style={{ fontSize: 14, color: colors.foreground }}>{props.children}</Text>
          <Text style={{ fontSize: 12, color: colors.mutedForeground }}>›</Text>
        </View>
      );
    }
    return props.children ?? <View />;
  });
  return <View style={{ width: 0, height: 0 }} />;
}

export function DropdownMenuSubContent(props: { children?: JSX.Element }) {
  const ctx = SubContext();
  if (!ctx) throw new Error("DropdownMenuSubContent must be used within <DropdownMenuSub>");
  const triggerAccessor = ctx.trigger.get();
  return (
    <BaseSubmenu
      trigger={(triggerAccessor?.() as JSX.Element) ?? <View />}
      style={{ minWidth: 140 }}
    >
      {props.children}
    </BaseSubmenu>
  );
}
