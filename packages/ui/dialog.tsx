import { colors, radius } from "@shadcn-nsh/theme";
import type { JSX } from "nsh";
import { Dialog as BaseDialog } from "nsh/base";

import { popupBackdrop } from "./lib/popup-surface";

export function Dialog(props: {
  open?: boolean;
  animation?: "slide" | "fade" | "none";
  children?: JSX.Element;
  onOpen?: () => void;
  onClose?: () => void;
  onCancel?: () => void;
  onOpenChange?: (event: { open: boolean; reason: string }) => void;
}) {
  return (
    <BaseDialog
      open={props.open}
      animation={props.animation ?? "fade"}
      onOpen={props.onOpen}
      onClose={props.onClose}
      onCancel={props.onCancel}
      onOpenChange={props.onOpenChange as never}
      backdropStyle={popupBackdrop()}
      style={{
        width: "90%",
        maxWidth: 420,
        alignSelf: "center",
        marginTop: "20%",
        padding: 20,
        borderRadius: radius.control * 2,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.card,
        gap: 12,
      }}
    >
      {props.children}
    </BaseDialog>
  );
}
