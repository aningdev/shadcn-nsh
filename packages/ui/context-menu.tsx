import type { JSX } from "nsh";
import { ContextMenu as BaseContextMenu } from "nsh/base";

import { popupBackdrop, popupSurface } from "./lib/popup-surface";

export {
  DropdownMenuItem as ContextMenuItem,
  DropdownMenuSeparator as ContextMenuSeparator,
  DropdownMenuSub as ContextMenuSub,
} from "./dropdown-menu";

export function ContextMenu(props: {
  open?: boolean | null;
  disabled?: boolean;
  trigger?: JSX.Element;
  children?: JSX.Element;
  onOpenChange?: (event: { open: boolean; reason: string }) => void;
}) {
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
