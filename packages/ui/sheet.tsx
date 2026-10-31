import { colors, radius } from "@shadcn-nsh/theme";
import type { JSX, Placement } from "nsh";
import { Sheet as BaseSheet } from "nsh/base";

import { popupBackdrop } from "./lib/popup-surface";

export function Sheet(props: {
  open?: boolean | null;
  defaultOpen?: boolean;
  side?: Placement;
  closeOnSwipe?: boolean;
  children?: JSX.Element;
  onOpenChange?: (event: { open: boolean; reason: string }) => void;
  onOpen?: () => void;
  onClose?: () => void;
}) {
  return (
    <BaseSheet
      open={props.open}
      defaultOpen={props.defaultOpen}
      side={props.side ?? "bottom"}
      closeOnSwipe={props.closeOnSwipe}
      onOpenChange={props.onOpenChange as never}
      onOpen={props.onOpen}
      onClose={props.onClose}
      backdropStyle={popupBackdrop()}
      popupStyle={{
        backgroundColor: colors.card,
        borderTopLeftRadius: radius.control * 2,
        borderTopRightRadius: radius.control * 2,
        padding: 16,
        minHeight: 160,
      }}
    >
      {props.children}
    </BaseSheet>
  );
}
