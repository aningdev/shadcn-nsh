// A sheet: the look (`sheetPanel`, `sheetGrabber`) and the parts that wear it.
// Derived from NSH examples/nsh-gallery-ui (Apache-2.0, © Longbridge); modified. See NOTICE.

import { alpha, colors, cornerCurve, shape, stroke } from "@shadcn-nsh/theme";
import type { JSX, StyleProp, ViewStyle } from "nsh";
import { context, keyboardFrame, safeArea, split, windowSize } from "nsh";
import {
  Sheet as BaseSheet,
  type OpenChangeReason,
  type SheetProps as BaseSheetProps,
} from "nsh/base";

import { Action, type ButtonVariant } from "./button";
import { createOpenState, type OpenState } from "./lib/open-state";
import { backdrop } from "./lib/popup";

/** The edge of the screen a sheet comes from. */
export type SheetSide = "bottom" | "top" | "left" | "right";

/**
 * A sheet's panel (`nsh/base`'s `Sheet`'s `popupStyle`): the card's
 * surface with the border's edge. At the bottom (or the top) it spans the
 * width, its two inner corners on the card's radius, 16 points of padding at
 * its sides and its rows 14 apart, kept above the home indicator (the sheet
 * itself stands above the keyboard), and never taller than the screen
 * below the status bar; put `sheetGrabber` first in a bottom one. At the
 * left or the right it is the full height, at most 360 points wide (48
 * short of a narrow window), its inner corners on the card's radius, 20
 * points of padding inside the safe area.
 */
export function sheetPanel(side: SheetSide): ViewStyle {
  const surface: ViewStyle = { backgroundColor: colors.card, borderColor: colors.border };
  if (side === "bottom" || side === "top") {
    const bottom = side === "bottom";
    return {
      ...surface,
      borderWidth: stroke.hairline,
      ...(bottom
        ? {
            borderBottomWidth: 0,
            borderTopLeftRadius: shape.modal,
            borderTopRightRadius: shape.modal,
            paddingTop: 8,
          }
        : {
            borderTopWidth: 0,
            borderBottomLeftRadius: shape.modal,
            borderBottomRightRadius: shape.modal,
            paddingTop: safeArea().top + 16,
            paddingBottom: 20,
          }),
      ...cornerCurve,
      // A bottom sheet stands above the keyboard while a field has it (`Sheet` lifts it by the keyboard past the home
      // indicator): its room is what the keyboard leaves.
      maxHeight:
        windowSize().height -
        (bottom
          ? safeArea().top + Math.max(0, keyboardFrame().height - safeArea().bottom)
          : safeArea().bottom) -
        24,
      paddingHorizontal: 16,
      // Above the home indicator, which is behind the keyboard while it is up.
      ...(bottom ? { paddingBottom: safeArea().bottom + 16 } : {}),
      gap: 14,
    };
  }
  return {
    ...surface,
    width: Math.min(360, windowSize().width - 48),
    paddingHorizontal: 20,
    paddingTop: safeArea().top + 16,
    paddingBottom: safeArea().bottom + 16,
    gap: 16,
    ...cornerCurve,
    // physical: `side` is the window edge the sheet stands on, so its inner edge (the border and the corners) is physical too.
    ...(side === "right"
      ? {
          borderLeftWidth: stroke.hairline,
          borderTopLeftRadius: shape.modal,
          borderBottomLeftRadius: shape.modal,
        }
      : {
          borderRightWidth: stroke.hairline,
          borderTopRightRadius: shape.modal,
          borderBottomRightRadius: shape.modal,
        }),
  };
}

/** The grabber's geometry: one 36×5 pill in every theme, the platforms' common size (M3's drag
 * handle is 32×4; theme contract v2 keeps one grabber rather than a per-theme table). */
const GRABBER_WIDTH = 36;
const GRABBER_HEIGHT = 5;

/** The grabber at the top of a bottom sheet (its `grabberStyle`): a pill centered at the top
 * edge in the muted ink the theme already dims with (`colors.mutedForeground` at 40%), so it
 * reads on the card and on whatever a sheet is dragged over. It is the sheet's own handle — the
 * one `nsh/base` lets a press and a screen reader drag between detents — not a picture of one, so
 * a sheet never shows two. */
export function sheetGrabber(): ViewStyle {
  return {
    width: GRABBER_WIDTH,
    height: GRABBER_HEIGHT,
    borderRadius: Math.ceil(GRABBER_HEIGHT / 2),
    alignSelf: "center",
    backgroundColor: alpha(colors.mutedForeground, 0.4),
  };
}

/** The root: it owns whether the sheet is open, and nothing of how it looks. */
export type SheetProps = {
  /** Controlled; leave it out and the root keeps the state (`defaultOpen`). */
  open?: boolean | null;
  defaultOpen?: boolean;
  children?: JSX.Element;
  onOpenChange?: (event: { open: boolean; reason: SheetOpenChangeReason }) => void;
  onOpen?: () => void;
  onClose?: () => void;
  onCancel?: () => void;
};

/**
 * The panel. Every prop of `nsh/base`'s Sheet passes through but the ones the root owns;
 * `popupStyle` and `backdropStyle` go over the look's.
 */
export type SheetContentProps = Omit<
  BaseSheetProps,
  "open" | "onOpenChange" | "onOpen" | "onClose" | "onCancel"
> & {
  /** The edge it comes from (default `bottom`). */
  side?: SheetSide;
  children?: JSX.Element;
};

/** What opens the sheet: a string is a `Button`'s label, anything else a pressable of its own. */
export type SheetTriggerProps = {
  children?: string | JSX.Element;
  variant?: ButtonVariant;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

/** What closes the sheet: as `SheetTrigger`; `onPress` runs before it closes. */
export type SheetCloseProps = SheetTriggerProps & {
  onPress?: () => void;
};

type SheetContextValue = OpenState & Pick<SheetProps, "onOpen" | "onClose" | "onCancel">;

const SheetContext = context<SheetContextValue | null>(null);

function useSheet() {
  const ctx = SheetContext();
  if (!ctx) throw new Error("Sheet parts must be used within <Sheet>");
  return ctx;
}

/** The root of a sheet's parts. */
export function Sheet(props: SheetProps) {
  const state = createOpenState<OpenChangeReason>(props);
  return (
    <SheetContext.Provider
      value={{
        ...state,
        get onOpen() {
          return props.onOpen;
        },
        get onClose() {
          return props.onClose;
        },
        get onCancel() {
          return props.onCancel;
        },
      }}
    >
      {props.children}
    </SheetContext.Provider>
  );
}

/** Opens the sheet. */
export function SheetTrigger(props: SheetTriggerProps) {
  const ctx = useSheet();
  return <Action {...props} onPress={() => ctx.setOpen(true)} />;
}

/** Closes the sheet, after its own `onPress`. */
export function SheetClose(props: SheetCloseProps) {
  const ctx = useSheet();
  return (
    <Action
      {...props}
      onPress={() => {
        props.onPress?.();
        ctx.setOpen(false, "closePress");
      }}
    />
  );
}

/**
 * The panel that slides in from `side`, over the theme's scrim. A bottom one shows the grabber
 * `nsh/base` gives it (`grabber`, default on), in `sheetGrabber()`'s look; give `grabber={false}`
 * for a sheet the app drags by something of its own.
 */
export function SheetContent(props: SheetContentProps) {
  const ctx = useSheet();
  const [, rest] = split(props, ["side", "children", "popupStyle", "backdropStyle"]);
  const side = () => props.side ?? "bottom";
  return (
    <BaseSheet
      {...rest}
      side={side()}
      grabber={props.grabber ?? side() === "bottom"}
      grabberAccessibilityLabel={props.grabberAccessibilityLabel ?? "Sheet"}
      grabberStyle={[sheetGrabber(), props.grabberStyle ?? null]}
      open={ctx.open()}
      onOpenChange={({ open, reason }) => ctx.setOpen(open, reason)}
      onOpen={ctx.onOpen}
      onClose={ctx.onClose}
      onCancel={ctx.onCancel}
      backdropStyle={[backdrop(), props.backdropStyle ?? null]}
      popupStyle={[sheetPanel(side()), props.popupStyle ?? null]}
    >
      {props.children}
    </BaseSheet>
  );
}

/** Why a sheet closed (`onOpenChange`'s `reason`): `nsh/base`'s `OpenChangeReason`, under this part's name. */
export type SheetOpenChangeReason = OpenChangeReason;
