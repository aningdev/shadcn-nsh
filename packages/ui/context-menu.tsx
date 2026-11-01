import type { JSX } from "nsh";
import { context, View } from "nsh";
import { ContextMenu as BaseContextMenu } from "nsh/base";

import {
  createOpenState,
  createTriggerSlot,
  type OpenState,
  type TriggerSlot,
} from "./lib/open-state";
import { popupBackdrop, popupSurface } from "./lib/popup-surface";

export {
  DropdownMenuCheckboxItem as ContextMenuCheckboxItem,
  DropdownMenuItem as ContextMenuItem,
  DropdownMenuLabel as ContextMenuLabel,
  DropdownMenuSeparator as ContextMenuSeparator,
  DropdownMenuSub as ContextMenuSub,
  DropdownMenuSubContent as ContextMenuSubContent,
  DropdownMenuSubTrigger as ContextMenuSubTrigger,
} from "./dropdown-menu";

type ContextMenuContextValue = OpenState & {
  trigger: TriggerSlot;
  disabled?: boolean;
};

const ContextMenuContext = context<ContextMenuContextValue | null>(null);

function useContextMenu() {
  const ctx = ContextMenuContext();
  if (!ctx) throw new Error("ContextMenu parts must be used within <ContextMenu>");
  return ctx;
}

export function ContextMenu(props: {
  open?: boolean | null;
  disabled?: boolean;
  /** @deprecated Prefer `<ContextMenuTrigger>` + `<ContextMenuContent>`. */
  trigger?: JSX.Element;
  children?: JSX.Element;
  onOpenChange?: (event: { open: boolean; reason: string }) => void;
}) {
  if (props.trigger != null) {
    return (
      <BaseContextMenu
        open={props.open}
        disabled={props.disabled}
        trigger={props.trigger}
        onOpenChange={props.onOpenChange as never}
        offset={4}
        popupStyle={{ ...popupSurface(), minWidth: 160 }}
        backdropStyle={popupBackdrop()}
      >
        {props.children}
      </BaseContextMenu>
    );
  }

  const state = createOpenState({
    open: props.open,
    onOpenChange: props.onOpenChange,
  });
  const trigger = createTriggerSlot();

  return (
    <ContextMenuContext.Provider value={{ ...state, trigger, disabled: props.disabled }}>
      {props.children}
    </ContextMenuContext.Provider>
  );
}

export function ContextMenuTrigger(props: { children?: JSX.Element }) {
  const ctx = useContextMenu();
  ctx.trigger.set(() => props.children ?? <View />);
  return <View style={{ width: 0, height: 0 }} />;
}

export function ContextMenuContent(props: { children?: JSX.Element }) {
  const ctx = useContextMenu();
  const triggerAccessor = ctx.trigger.get();
  return (
    <BaseContextMenu
      open={ctx.open()}
      disabled={ctx.disabled}
      trigger={(triggerAccessor?.() as JSX.Element) ?? <View />}
      onOpenChange={(event) => ctx.setOpen(event.open)}
      offset={4}
      popupStyle={{ ...popupSurface(), minWidth: 160 }}
      backdropStyle={popupBackdrop()}
    >
      {props.children}
    </BaseContextMenu>
  );
}
