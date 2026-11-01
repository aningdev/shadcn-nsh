import { colors, radius } from "@shadcn-nsh/theme";
import type { JSX } from "nsh";
import { context, Text, View } from "nsh";
import { Dialog as BaseDialog } from "nsh/base";

import { Button } from "./button";
import { createOpenState, type OpenState } from "./lib/open-state";
import { popupBackdrop } from "./lib/popup-surface";

type DialogContextValue = OpenState & {
  animation?: "slide" | "fade" | "none";
  onOpen?: () => void;
  onClose?: () => void;
  onCancel?: () => void;
};

const DialogContext = context<DialogContextValue | null>(null);

function useDialog() {
  const ctx = DialogContext();
  if (!ctx) throw new Error("Dialog parts must be used within <Dialog>");
  return ctx;
}

export function Dialog(props: {
  open?: boolean;
  defaultOpen?: boolean;
  animation?: "slide" | "fade" | "none";
  children?: JSX.Element;
  onOpen?: () => void;
  onClose?: () => void;
  onCancel?: () => void;
  onOpenChange?: (event: { open: boolean; reason: string }) => void;
}) {
  const state = createOpenState({
    open: props.open,
    defaultOpen: props.defaultOpen,
    onOpenChange: props.onOpenChange,
  });

  return (
    <DialogContext.Provider
      value={{
        ...state,
        animation: props.animation,
        onOpen: props.onOpen,
        onClose: props.onClose,
        onCancel: props.onCancel,
      }}
    >
      {props.children}
    </DialogContext.Provider>
  );
}

/** Opens the dialog. String children render as a Button; otherwise wrap a pressable View. */
export function DialogTrigger(props: { children?: string | JSX.Element; disabled?: boolean }) {
  const ctx = useDialog();
  const open = () => ctx.setOpen(true);

  if (typeof props.children === "string") {
    return (
      <Button disabled={props.disabled} onPress={open}>
        {props.children}
      </Button>
    );
  }

  return (
    <View onPress={props.disabled ? undefined : open} style={{ opacity: props.disabled ? 0.5 : 1 }}>
      {props.children}
    </View>
  );
}

export function DialogClose(props: {
  children?: string;
  variant?: "default" | "secondary" | "outline" | "destructive" | "ghost";
}) {
  const ctx = useDialog();
  return (
    <Button
      variant={props.variant ?? "outline"}
      onPress={() => {
        ctx.setOpen(false);
        ctx.onCancel?.();
      }}
    >
      {props.children ?? "Close"}
    </Button>
  );
}

export function DialogContent(props: { children?: JSX.Element }) {
  const ctx = useDialog();
  return (
    <BaseDialog
      open={ctx.open()}
      animation={ctx.animation ?? "fade"}
      onOpen={ctx.onOpen}
      onClose={ctx.onClose}
      onCancel={() => {
        ctx.setOpen(false);
        ctx.onCancel?.();
      }}
      onOpenChange={(event) => {
        ctx.setOpen(event.open, event.reason);
      }}
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

export function DialogHeader(props: { children?: JSX.Element }) {
  return <View style={{ gap: 6 }}>{props.children}</View>;
}

export function DialogFooter(props: { children?: JSX.Element }) {
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "flex-end",
        flexWrap: "wrap",
        gap: 8,
        marginTop: 4,
      }}
    >
      {props.children}
    </View>
  );
}

export function DialogTitle(props: { children?: string }) {
  return (
    <Text style={{ fontSize: 16, fontWeight: "600", color: colors.foreground }}>
      {props.children}
    </Text>
  );
}

export function DialogDescription(props: { children?: string }) {
  return <Text style={{ fontSize: 13, color: colors.mutedForeground }}>{props.children}</Text>;
}
