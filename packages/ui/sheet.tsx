// Source: examples/nsh-gallery-ui/look/overlay.ts @ 64ab8a1d (baseline), see NOTICE.
import { colors, disabledOpacity, focusRing, modalSurface, popupBackdrop } from "@shadcn-nsh/theme";
import type { JSX, StyleProp, TextStyle, ViewStyle } from "nsh";
import { context, keyboardFrame, safeArea, split, Text, View, windowSize } from "nsh";
import {
  Sheet as BaseSheet,
  type OpenChangeReason,
  type Placement,
  type SheetProps as BaseSheetProps,
} from "nsh/base";

import { Button, type ButtonVariant } from "./button";
import { isPointer } from "./lib/density";
import { createOpenState, type OpenState } from "./lib/open-state";

/**
 * Composition root for `nsh/base` Sheet. Open state only: `side` and the
 * `closeOn*` flags live on {@link SheetContent}.
 */
export type SheetProps = {
  open?: boolean | null;
  defaultOpen?: boolean;
  children?: JSX.Element;
  onOpenChange?: (event: { open: boolean; reason: OpenChangeReason }) => void;
  onOpen?: () => void;
  onClose?: () => void;
  onCancel?: () => void;
};

/**
 * Theme layer on `nsh/base` Sheet as `SheetContent`. All base props and style
 * hooks pass through. Open and lifecycle events come from the {@link Sheet}
 * context. `side` defaults to `"bottom"` (base); shadcn defaults to `"right"`.
 */
export type SheetContentProps = Omit<
  BaseSheetProps,
  "open" | "defaultOpen" | "onOpenChange" | "onOpen" | "onClose" | "onCancel" | "children"
> & {
  children?: JSX.Element;
};

/** Opens the sheet. String children render as a Button; otherwise a pressable View. */
export type SheetTriggerProps = {
  children?: string | JSX.Element;
  disabled?: boolean;
  class?: string | null;
  style?: StyleProp<ViewStyle>;
};

/** Closes the sheet (shadcn `SheetClose`). */
export type SheetCloseProps = {
  children?: string | JSX.Element;
  variant?: ButtonVariant;
  disabled?: boolean;
  class?: string | null;
  style?: StyleProp<ViewStyle>;
};

/** App chrome around title and description (not an `nsh/base` part). */
export type SheetHeaderProps = {
  children?: JSX.Element;
  class?: string | null;
  style?: StyleProp<ViewStyle>;
};

/** App footer row (shadcn `SheetFooter`; not an `nsh/base` part). */
export type SheetFooterProps = {
  children?: JSX.Element;
  class?: string | null;
  style?: StyleProp<ViewStyle>;
};

/** App title text (shadcn `SheetTitle`; not an `nsh/base` part). */
export type SheetTitleProps = {
  children?: string | JSX.Element;
  class?: string | null;
  style?: StyleProp<TextStyle | ViewStyle>;
};

/** App description text (shadcn `SheetDescription`; not an `nsh/base` part). */
export type SheetDescriptionProps = {
  children?: string | JSX.Element;
  class?: string | null;
  style?: StyleProp<TextStyle | ViewStyle>;
};

type SheetContextValue = OpenState & {
  onOpen?: () => void;
  onClose?: () => void;
  onCancel?: () => void;
};

const SheetContext = context<SheetContextValue | null>(null);

function useSheet() {
  const ctx = SheetContext();
  if (!ctx) throw new Error("Sheet parts must be used within <Sheet>");
  return ctx;
}

/** Wrapper defaults, then consumer — consumer wins per key (StyleProp list L→R). */
function mergeStyle<T extends ViewStyle | TextStyle>(
  base?: StyleProp<T> | null,
  consumer?: StyleProp<T> | null,
): StyleProp<T> | undefined {
  if (base == null && consumer == null) return undefined;
  if (base == null) return consumer ?? undefined;
  if (consumer == null) return base ?? undefined;
  return [base, consumer];
}

/**
 * Fill, edge and shadow from `modalSurface`. The dialog's uniform radius and
 * padding are not copied: each edge sets its own.
 */
function modalChrome(): ViewStyle {
  const surface = modalSurface();
  return {
    backgroundColor: surface.backgroundColor,
    borderColor: surface.borderColor,
    boxShadow: surface.boxShadow,
    borderCurve: "continuous",
  };
}

/**
 * The panel at one edge. Bottom and top span the width the base already
 * anchors (no `width` / `height` of our own: a percentage fights those
 * anchors). A side drawer is a fixed width on purpose, at most 360 and 48
 * short of a narrow window. The grabber is a 36×5 pill, not a text box.
 */
function look(side: Placement) {
  const pointer = isPointer();
  const chrome = modalChrome();
  const horizontal = side === "bottom" || side === "top";
  const bottom = side === "bottom";
  const panel: ViewStyle = horizontal
    ? {
        ...chrome,
        borderWidth: 1,
        ...(bottom
          ? {
              borderBottomWidth: 0,
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              paddingTop: 8,
            }
          : {
              borderTopWidth: 0,
              borderBottomLeftRadius: 20,
              borderBottomRightRadius: 20,
              paddingTop: safeArea().top + 16,
              paddingBottom: 20,
            }),
        maxHeight: windowSize().height - (bottom ? safeArea().top : safeArea().bottom) - 24,
        paddingHorizontal: 16,
        ...(bottom
          ? { paddingBottom: Math.max(safeArea().bottom, keyboardFrame().height) + 16 }
          : {}),
        gap: 14,
      }
    : {
        ...chrome,
        width: Math.min(360, windowSize().width - 48),
        paddingHorizontal: 20,
        paddingTop: safeArea().top + 16,
        paddingBottom: safeArea().bottom + 16,
        gap: 16,
        ...(side === "right"
          ? { borderLeftWidth: 1, borderTopLeftRadius: 16, borderBottomLeftRadius: 16 }
          : { borderRightWidth: 1, borderTopRightRadius: 16, borderBottomRightRadius: 16 }),
      };
  return {
    panel,
    grabber: {
      width: 36,
      height: 5,
      borderRadius: 3,
      alignSelf: "center",
      backgroundColor: colors.muted,
    } satisfies ViewStyle,
    header: { gap: 4 } satisfies ViewStyle,
    footer: {
      flexDirection: "row",
      justifyContent: "flex-end",
      flexWrap: "wrap",
      gap: 8,
    } satisfies ViewStyle,
    title: {
      fontSize: pointer ? 17 : 20,
      fontWeight: "600",
      color: colors.foreground,
    } satisfies TextStyle,
    body: {
      fontSize: pointer ? 13 : 15,
      lineHeight: pointer ? 19 : 21,
      color: colors.mutedForeground,
    } satisfies TextStyle,
  };
}

/** The sheet panel at `side`, the same style {@link SheetContent} puts on the popup. */
export function sheetPanelStyle(side: Placement = "bottom"): ViewStyle {
  return look(side).panel;
}

/** The grabber a bottom sheet draws first. */
export function sheetGrabberStyle(): ViewStyle {
  return look("bottom").grabber;
}

/** Composition root: owns the open state the parts below read. */
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

/** Opens the sheet; a string child renders a `Button`. */
export function SheetTrigger(props: SheetTriggerProps) {
  const ctx = useSheet();
  const open = () => {
    if (!props.disabled) ctx.setOpen(true);
  };
  if (typeof props.children === "string") {
    return (
      <Button
        disabled={props.disabled}
        class={props.class ?? undefined}
        style={props.style}
        onPress={open}
      >
        {props.children}
      </Button>
    );
  }
  return (
    <View
      accessible
      role="button"
      accessibilityState={{ disabled: props.disabled }}
      class={props.class ?? undefined}
      focusStyle={focusRing()}
      onPress={props.disabled ? undefined : open}
      style={props.disabled ? mergeStyle({ opacity: disabledOpacity() }, props.style) : props.style}
    >
      {props.children}
    </View>
  );
}

/** Closes the sheet; a string child renders a `Button` (outline unless `variant` is set). */
export function SheetClose(props: SheetCloseProps) {
  const ctx = useSheet();
  const close = () => {
    if (!props.disabled) ctx.setOpen(false);
  };
  if (typeof props.children !== "string" && props.children != null) {
    return (
      <View
        accessible
        role="button"
        accessibilityState={{ disabled: props.disabled }}
        class={props.class ?? undefined}
        focusStyle={focusRing()}
        onPress={props.disabled ? undefined : close}
        style={
          props.disabled ? mergeStyle({ opacity: disabledOpacity() }, props.style) : props.style
        }
      >
        {props.children}
      </View>
    );
  }
  return (
    <Button
      disabled={props.disabled}
      variant={props.variant ?? "outline"}
      class={props.class ?? undefined}
      style={props.style}
      onPress={close}
    >
      {props.children ?? "Close"}
    </Button>
  );
}

/** The panel at `side`, with the backdrop dimmed. A bottom sheet leads with the grabber. */
export function SheetContent(props: SheetContentProps) {
  const ctx = useSheet();
  const side = props.side ?? "bottom";
  const chrome = look(side);
  const [, rest] = split(props, ["children", "side", "popupStyle", "backdropStyle"]);
  return (
    <BaseSheet
      {...rest}
      open={ctx.open()}
      side={side}
      onOpenChange={({ open, reason }) => ctx.setOpen(open, reason)}
      onOpen={ctx.onOpen}
      onClose={ctx.onClose}
      onCancel={ctx.onCancel}
      popupStyle={mergeStyle(chrome.panel, props.popupStyle)}
      backdropStyle={mergeStyle(popupBackdrop(), props.backdropStyle)}
    >
      {side === "bottom" ? <View style={chrome.grabber} /> : null}
      {props.children}
    </BaseSheet>
  );
}

/** The header block of the panel. */
export function SheetHeader(props: SheetHeaderProps) {
  return (
    <View class={props.class ?? undefined} style={mergeStyle(look("bottom").header, props.style)}>
      {props.children}
    </View>
  );
}

/** The footer row of the panel. */
export function SheetFooter(props: SheetFooterProps) {
  return (
    <View class={props.class ?? undefined} style={mergeStyle(look("bottom").footer, props.style)}>
      {props.children}
    </View>
  );
}

/** The panel's title; a string child gets the sheet type. */
export function SheetTitle(props: SheetTitleProps) {
  if (typeof props.children !== "string" && props.children != null) {
    return (
      <View class={props.class ?? undefined} style={props.style as StyleProp<ViewStyle>}>
        {props.children}
      </View>
    );
  }
  return (
    <Text
      class={props.class ?? undefined}
      style={mergeStyle(look("bottom").title, props.style as StyleProp<TextStyle>)}
    >
      {props.children}
    </Text>
  );
}

/** The panel's description; a string child gets the sheet type. */
export function SheetDescription(props: SheetDescriptionProps) {
  if (typeof props.children !== "string" && props.children != null) {
    return (
      <View class={props.class ?? undefined} style={props.style as StyleProp<ViewStyle>}>
        {props.children}
      </View>
    );
  }
  return (
    <Text
      class={props.class ?? undefined}
      style={mergeStyle(look("bottom").body, props.style as StyleProp<TextStyle>)}
    >
      {props.children}
    </Text>
  );
}
