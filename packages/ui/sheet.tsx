import { colors, radius } from "@shadcn-nsh/theme";
import type { JSX, Placement } from "nsh";
import { context, Text, View } from "nsh";
import { Sheet as BaseSheet } from "nsh/base";

import { Button } from "./button";
import { createOpenState, type OpenState } from "./lib/open-state";
import { popupBackdrop } from "./lib/popup-surface";

type SheetContextValue = OpenState & {
  side?: Placement;
  closeOnSwipe?: boolean;
  onOpen?: () => void;
  onClose?: () => void;
};

const SheetContext = context<SheetContextValue | null>(null);

function useSheet() {
  const ctx = SheetContext();
  if (!ctx) throw new Error("Sheet parts must be used within <Sheet>");
  return ctx;
}

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
  const state = createOpenState({
    open: props.open,
    defaultOpen: props.defaultOpen,
    onOpenChange: props.onOpenChange,
  });

  return (
    <SheetContext.Provider
      value={{
        ...state,
        side: props.side,
        closeOnSwipe: props.closeOnSwipe,
        onOpen: props.onOpen,
        onClose: props.onClose,
      }}
    >
      {props.children}
    </SheetContext.Provider>
  );
}

export function SheetTrigger(props: { children?: string | JSX.Element; disabled?: boolean }) {
  const ctx = useSheet();
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

export function SheetClose(props: {
  children?: string;
  variant?: "default" | "secondary" | "outline" | "destructive" | "ghost";
}) {
  const ctx = useSheet();
  return (
    <Button variant={props.variant ?? "outline"} onPress={() => ctx.setOpen(false)}>
      {props.children ?? "Close"}
    </Button>
  );
}

export function SheetContent(props: { side?: Placement; children?: JSX.Element }) {
  const ctx = useSheet();
  const side = props.side ?? ctx.side ?? "bottom";
  const radiusEdge = radius.control * 2;

  return (
    <BaseSheet
      open={ctx.open()}
      side={side}
      closeOnSwipe={ctx.closeOnSwipe}
      onOpenChange={(event) => ctx.setOpen(event.open, event.reason)}
      onOpen={ctx.onOpen}
      onClose={ctx.onClose}
      backdropStyle={popupBackdrop()}
      popupStyle={{
        backgroundColor: colors.card,
        borderTopLeftRadius: side === "bottom" ? radiusEdge : 0,
        borderTopRightRadius: side === "bottom" ? radiusEdge : 0,
        borderBottomLeftRadius: side === "top" ? radiusEdge : 0,
        borderBottomRightRadius: side === "top" ? radiusEdge : 0,
        padding: 16,
        minHeight: 160,
      }}
    >
      {props.children}
    </BaseSheet>
  );
}

export function SheetHeader(props: { children?: JSX.Element }) {
  return <View style={{ gap: 6, marginBottom: 8 }}>{props.children}</View>;
}

export function SheetFooter(props: { children?: JSX.Element }) {
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "flex-end",
        flexWrap: "wrap",
        gap: 8,
        marginTop: 12,
      }}
    >
      {props.children}
    </View>
  );
}

export function SheetTitle(props: { children?: string }) {
  return (
    <Text style={{ fontSize: 16, fontWeight: "600", color: colors.foreground }}>
      {props.children}
    </Text>
  );
}

export function SheetDescription(props: { children?: string }) {
  return <Text style={{ fontSize: 13, color: colors.mutedForeground }}>{props.children}</Text>;
}
