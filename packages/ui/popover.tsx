import type { JSX } from "nsh";
import { Popover as BasePopover } from "nsh/base";

import { popupSurface } from "./lib/popup-surface";

export function Popover(props: {
  open?: boolean | null;
  defaultOpen?: boolean;
  trigger?: JSX.Element;
  children?: JSX.Element;
  onOpenChange?: (event: { open: boolean; reason: string }) => void;
  onOpen?: () => void;
  onClose?: () => void;
}) {
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
