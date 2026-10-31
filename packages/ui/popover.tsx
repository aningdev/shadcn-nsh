import { colors } from "@shadcn-nsh/theme";
import type { JSX } from "nsh";
import { context, Text, View } from "nsh";
import { Popover as BasePopover } from "nsh/base";

import { Button } from "./button";
import {
  createOpenState,
  createTriggerSlot,
  type OpenState,
  type TriggerSlot,
} from "./lib/open-state";
import { popupSurface } from "./lib/popup-surface";

type PopoverContextValue = OpenState & {
  trigger: TriggerSlot;
  onOpen?: () => void;
  onClose?: () => void;
};

const PopoverContext = context<PopoverContextValue | null>(null);

function usePopover() {
  const ctx = PopoverContext();
  if (!ctx) throw new Error("Popover parts must be used within <Popover>");
  return ctx;
}

export function Popover(props: {
  open?: boolean | null;
  defaultOpen?: boolean;
  /** @deprecated Prefer `<PopoverTrigger>` + `<PopoverContent>`. */
  trigger?: JSX.Element;
  children?: JSX.Element;
  onOpenChange?: (event: { open: boolean; reason: string }) => void;
  onOpen?: () => void;
  onClose?: () => void;
}) {
  const state = createOpenState({
    open: props.open,
    defaultOpen: props.defaultOpen,
    onOpenChange: props.onOpenChange,
  });
  const trigger = createTriggerSlot();

  // Legacy: single-root with trigger prop and body children.
  if (props.trigger != null) {
    return (
      <BasePopover
        open={props.open}
        defaultOpen={props.defaultOpen}
        trigger={props.trigger}
        onOpenChange={props.onOpenChange as never}
        onOpen={props.onOpen}
        onClose={props.onClose}
        offset={4}
        popupStyle={{ ...popupSurface(), padding: 12, minWidth: 180 }}
      >
        {props.children}
      </BasePopover>
    );
  }

  return (
    <PopoverContext.Provider
      value={{
        ...state,
        trigger,
        onOpen: props.onOpen,
        onClose: props.onClose,
      }}
    >
      {props.children}
    </PopoverContext.Provider>
  );
}

export function PopoverTrigger(props: { children?: string | JSX.Element; disabled?: boolean }) {
  const ctx = usePopover();
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

export function PopoverContent(props: { children?: JSX.Element }) {
  const ctx = usePopover();
  const triggerAccessor = ctx.trigger.get();
  return (
    <BasePopover
      open={ctx.open()}
      trigger={(triggerAccessor?.() as JSX.Element) ?? <View />}
      onOpenChange={(event) => ctx.setOpen(event.open)}
      onOpen={ctx.onOpen}
      onClose={ctx.onClose}
      offset={4}
      popupStyle={{ ...popupSurface(), padding: 12, minWidth: 180 }}
    >
      {props.children}
    </BasePopover>
  );
}

export function PopoverHeader(props: { children?: JSX.Element }) {
  return <View style={{ gap: 4, marginBottom: 4 }}>{props.children}</View>;
}

export function PopoverTitle(props: { children?: string }) {
  return (
    <Text style={{ fontSize: 14, fontWeight: "600", color: colors.foreground }}>
      {props.children}
    </Text>
  );
}

export function PopoverDescription(props: { children?: string }) {
  return <Text style={{ fontSize: 13, color: colors.mutedForeground }}>{props.children}</Text>;
}
