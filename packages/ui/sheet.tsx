import { colors, disabledOpacity, overlayShadow, popupBackdrop, radius } from "@shadcn-nsh/theme";
import type { JSX, StyleProp, TextStyle, ViewStyle } from "nsh";
import { context, Text, View } from "nsh";
import {
  Sheet as BaseSheet,
  type OpenChangeReason,
  type Placement,
  type SheetProps as BaseSheetProps,
} from "nsh/base";

import { Button, type ButtonVariant } from "./button";
import { createOpenState, type OpenState } from "./lib/open-state";

/**
 * Composition root (shadcn `Sheet`): holds open state for Trigger / Content.
 * Panel look and base props live on {@link SheetContent}.
 */
export type SheetProps = {
  open?: boolean | null;
  defaultOpen?: boolean;
  /** Default edge for {@link SheetContent} when Content omits `side` (base default `"bottom"`). */
  side?: Placement;
  /** Default swipe-to-dismiss for Content when omitted. */
  closeOnSwipe?: boolean;
  children?: JSX.Element;
  onOpenChange?: (event: { open: boolean; reason: OpenChangeReason }) => void;
  onOpen?: () => void;
  onClose?: () => void;
  onCancel?: () => void;
};

/**
 * Theme layer on `nsh/base` Sheet as shadcn `SheetContent`. All base props +
 * style hooks pass through; consumer styles shallow-merge over defaults.
 * Open / lifecycle events are owned by the {@link Sheet} context.
 * `side` defaults to `"bottom"` (nsh/base); shadcn `bases/base` defaults to `"right"`.
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

/** App chrome around title / description (not an `nsh/base` part). */
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
  side?: Placement;
  closeOnSwipe?: boolean;
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

/** Concatenate wrapper + consumer `class` when both are set. */
function mergeClass(base?: string | null, consumer?: string | null): string | undefined {
  if (base && consumer) return `${base} ${consumer}`;
  return consumer ?? base ?? undefined;
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

/** Panel chrome by edge — aligned with shadcn `cn-sheet-content` / data-side. */
function contentPopupChrome(side: Placement): ViewStyle {
  const radiusEdge = radius.control * 2;
  const base: ViewStyle = {
    backgroundColor: colors.card,
    padding: 16,
    gap: 6,
    ...overlayShadow(),
  };

  switch (side) {
    case "top":
      return {
        ...base,
        width: "100%",
        minHeight: 160,
        borderBottomLeftRadius: radiusEdge,
        borderBottomRightRadius: radiusEdge,
      };
    case "left":
      return {
        ...base,
        height: "100%",
        minWidth: 288,
        borderTopRightRadius: radiusEdge,
        borderBottomRightRadius: radiusEdge,
      };
    case "right":
      return {
        ...base,
        height: "100%",
        minWidth: 288,
        borderTopLeftRadius: radiusEdge,
        borderBottomLeftRadius: radiusEdge,
      };
    case "bottom":
    default:
      return {
        ...base,
        width: "100%",
        minHeight: 160,
        borderTopLeftRadius: radiusEdge,
        borderTopRightRadius: radiusEdge,
      };
  }
}

function headerChrome(): ViewStyle {
  return { gap: 6, marginBottom: 8 };
}

function footerChrome(): ViewStyle {
  return {
    flexDirection: "row",
    justifyContent: "flex-end",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 12,
  };
}

function titleChrome(): TextStyle {
  return { fontSize: 16, fontWeight: "600", color: colors.foreground };
}

function descriptionChrome(): TextStyle {
  return { fontSize: 13, color: colors.mutedForeground };
}

export function Sheet(props: SheetProps) {
  const {
    open,
    defaultOpen,
    side,
    closeOnSwipe,
    children,
    onOpenChange,
    onOpen,
    onClose,
    onCancel,
  } = props;

  const state = createOpenState<OpenChangeReason>({
    open,
    defaultOpen,
    onOpenChange,
  });

  return (
    <SheetContext.Provider
      value={{
        ...state,
        side,
        closeOnSwipe,
        onOpen,
        onClose,
        onCancel,
      }}
    >
      {children}
    </SheetContext.Provider>
  );
}

export function SheetTrigger(props: SheetTriggerProps) {
  const ctx = useSheet();
  const { children, disabled, class: className, style } = props;
  const open = () => ctx.setOpen(true);

  if (typeof children === "string") {
    return (
      <Button disabled={disabled} onPress={open}>
        {children}
      </Button>
    );
  }

  return (
    <View
      class={mergeClass(undefined, className)}
      onPress={disabled ? undefined : open}
      style={mergeStyle({ opacity: disabledOpacity(disabled) }, style)}
    >
      {children}
    </View>
  );
}

export function SheetClose(props: SheetCloseProps) {
  const ctx = useSheet();
  const { children, variant = "outline", disabled, class: className, style } = props;

  if (typeof children !== "string" && children != null) {
    return (
      <View
        class={mergeClass(undefined, className)}
        onPress={disabled ? undefined : () => ctx.setOpen(false)}
        style={mergeStyle({ opacity: disabledOpacity(disabled) }, style)}
      >
        {children}
      </View>
    );
  }

  return (
    <Button disabled={disabled} variant={variant} onPress={() => ctx.setOpen(false)}>
      {children ?? "Close"}
    </Button>
  );
}

export function SheetContent(props: SheetContentProps) {
  const ctx = useSheet();
  const {
    children,
    side: sideProp,
    closeOnSwipe: closeOnSwipeProp,
    class: className,
    style,
    hoverStyle,
    activeStyle,
    focusStyle,
    disabledStyle,
    popupClass,
    popupStyle,
    backdropClass,
    backdropStyle,
    ...rest
  } = props;

  const side = sideProp ?? ctx.side ?? "bottom";
  const closeOnSwipe = closeOnSwipeProp ?? ctx.closeOnSwipe;

  return (
    <BaseSheet
      {...rest}
      open={ctx.open()}
      side={side}
      closeOnSwipe={closeOnSwipe}
      onOpenChange={({ open, reason }) => ctx.setOpen(open, reason)}
      onOpen={ctx.onOpen}
      onClose={ctx.onClose}
      onCancel={ctx.onCancel}
      class={mergeClass(undefined, className)}
      style={mergeStyle(undefined, style)}
      hoverStyle={mergeStyle(undefined, hoverStyle)}
      activeStyle={mergeStyle(undefined, activeStyle)}
      focusStyle={mergeStyle(undefined, focusStyle)}
      disabledStyle={mergeStyle(undefined, disabledStyle)}
      popupClass={mergeClass(undefined, popupClass)}
      popupStyle={mergeStyle(contentPopupChrome(side), popupStyle)}
      backdropClass={mergeClass(undefined, backdropClass)}
      backdropStyle={mergeStyle(popupBackdrop(), backdropStyle)}
    >
      {children}
    </BaseSheet>
  );
}

export function SheetHeader(props: SheetHeaderProps) {
  const { children, class: className, style } = props;
  return (
    <View class={mergeClass(undefined, className)} style={mergeStyle(headerChrome(), style)}>
      {children}
    </View>
  );
}

export function SheetFooter(props: SheetFooterProps) {
  const { children, class: className, style } = props;
  return (
    <View class={mergeClass(undefined, className)} style={mergeStyle(footerChrome(), style)}>
      {children}
    </View>
  );
}

export function SheetTitle(props: SheetTitleProps) {
  const { children, class: className, style } = props;
  if (typeof children !== "string" && children != null) {
    return (
      <View
        class={mergeClass(undefined, className)}
        style={mergeStyle(undefined, style as StyleProp<ViewStyle> | null)}
      >
        {children}
      </View>
    );
  }
  return (
    <Text
      class={mergeClass(undefined, className)}
      style={mergeStyle(titleChrome(), style as StyleProp<TextStyle> | null)}
    >
      {children}
    </Text>
  );
}

export function SheetDescription(props: SheetDescriptionProps) {
  const { children, class: className, style } = props;
  if (typeof children !== "string" && children != null) {
    return (
      <View
        class={mergeClass(undefined, className)}
        style={mergeStyle(undefined, style as StyleProp<ViewStyle> | null)}
      >
        {children}
      </View>
    );
  }
  return (
    <Text
      class={mergeClass(undefined, className)}
      style={mergeStyle(descriptionChrome(), style as StyleProp<TextStyle> | null)}
    >
      {children}
    </Text>
  );
}
