// Source: examples/nsh-gallery-ui/look/overlay.ts @ 64ab8a1d (baseline), see NOTICE.
import { colors, disabledOpacity, focusRing, modalSurface, popupBackdrop } from "@shadcn-nsh/theme";
import type { JSX, StyleProp, TextStyle, ViewStyle } from "nsh";
import { context, split, Text, View } from "nsh";
import {
  Dialog as BaseDialog,
  type DialogChangeReason,
  type DialogProps as BaseDialogProps,
} from "nsh/base";

import { Button, type ButtonVariant } from "./button";
import { isPointer } from "./lib/density";
import { createOpenState, type OpenState } from "./lib/open-state";

/**
 * Composition root for `nsh/base` Dialog. Open state only: the card's
 * `animation`, `presentation` and `closeOn*` flags live on {@link DialogContent}.
 */
export type DialogProps = {
  open?: boolean | null;
  defaultOpen?: boolean;
  children?: JSX.Element;
  onOpenChange?: (event: { open: boolean; reason: DialogChangeReason }) => void;
  onOpen?: () => void;
  onClose?: () => void;
  onCancel?: () => void;
};

/**
 * Theme layer on `nsh/base` Dialog as `DialogContent`. All base props and style
 * hooks pass through. Open and lifecycle events come from the {@link Dialog}
 * context. Default `animation` is `"fade"` (a centered card); base defaults to `"slide"`.
 */
export type DialogContentProps = Omit<
  BaseDialogProps,
  "open" | "onOpenChange" | "onOpen" | "onClose" | "onCancel" | "children"
> & {
  children?: JSX.Element;
};

/** Opens the dialog. String children render as a Button; otherwise a pressable View. */
export type DialogTriggerProps = {
  children?: string | JSX.Element;
  disabled?: boolean;
  class?: string | null;
  style?: StyleProp<ViewStyle>;
};

/** Closes the dialog (shadcn `DialogClose`). */
export type DialogCloseProps = {
  children?: string | JSX.Element;
  variant?: ButtonVariant;
  disabled?: boolean;
  class?: string | null;
  style?: StyleProp<ViewStyle>;
};

/** App chrome around title and description (not an `nsh/base` part). */
export type DialogHeaderProps = {
  children?: JSX.Element;
  class?: string | null;
  style?: StyleProp<ViewStyle>;
};

/** App footer row (shadcn `DialogFooter`; not an `nsh/base` part). */
export type DialogFooterProps = {
  children?: JSX.Element;
  class?: string | null;
  style?: StyleProp<ViewStyle>;
};

/** App title text (shadcn `DialogTitle`; not an `nsh/base` part). */
export type DialogTitleProps = {
  children?: string | JSX.Element;
  class?: string | null;
  style?: StyleProp<TextStyle | ViewStyle>;
};

/** App description text (shadcn `DialogDescription`; not an `nsh/base` part). */
export type DialogDescriptionProps = {
  children?: string | JSX.Element;
  class?: string | null;
  style?: StyleProp<TextStyle | ViewStyle>;
};

type DialogContextValue = OpenState & {
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
 * The card, its type and its chrome. The card is 90% of the window on purpose
 * (a dialog is a card, not a hug of its title). Title 17 / 20 and text 13 / 15
 * follow the pointer.
 */
function look() {
  const pointer = isPointer();
  return {
    card: {
      ...modalSurface(),
      width: "90%",
      maxWidth: "90%",
      margin: "auto",
      gap: 12,
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

/** The dialog card, the same style {@link DialogContent} puts on the popup. */
export function dialogCardStyle(): ViewStyle {
  return look().card;
}

/** The dialog title's type. */
export function dialogTitleStyle(): TextStyle {
  return look().title;
}

/** The dialog description's type. */
export function dialogBodyStyle(): TextStyle {
  return look().body;
}

/** Composition root: owns the open state the parts below read. */
export function Dialog(props: DialogProps) {
  const state = createOpenState<DialogChangeReason>(props);
  return (
    <DialogContext.Provider
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
    </DialogContext.Provider>
  );
}

/** Opens the dialog; a string child renders a `Button`. */
export function DialogTrigger(props: DialogTriggerProps) {
  const ctx = useDialog();
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

/** Closes the dialog; a string child renders a `Button` (outline unless `variant` is set). */
export function DialogClose(props: DialogCloseProps) {
  const ctx = useDialog();
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

/** The card, with the backdrop dimmed. Motion stays on base (`animation`). */
export function DialogContent(props: DialogContentProps) {
  const ctx = useDialog();
  const chrome = look();
  const [, rest] = split(props, [
    "children",
    "style",
    "backdropStyle",
    "animation",
    "class",
    "backdropClass",
  ]);
  return (
    <BaseDialog
      {...rest}
      open={ctx.open()}
      animation={props.animation ?? "fade"}
      onOpenChange={({ open, reason }) => ctx.setOpen(open, reason)}
      onOpen={ctx.onOpen}
      onClose={ctx.onClose}
      onCancel={ctx.onCancel}
      class={props.class ?? undefined}
      style={mergeStyle(chrome.card, props.style)}
      backdropClass={props.backdropClass ?? undefined}
      backdropStyle={mergeStyle(popupBackdrop(), props.backdropStyle)}
    >
      {props.children}
    </BaseDialog>
  );
}

/** The header block of the card. */
export function DialogHeader(props: DialogHeaderProps) {
  return (
    <View class={props.class ?? undefined} style={mergeStyle(look().header, props.style)}>
      {props.children}
    </View>
  );
}

/** The footer row of the card. */
export function DialogFooter(props: DialogFooterProps) {
  return (
    <View class={props.class ?? undefined} style={mergeStyle(look().footer, props.style)}>
      {props.children}
    </View>
  );
}

/** The card's title; a string child gets the dialog type. */
export function DialogTitle(props: DialogTitleProps) {
  if (typeof props.children !== "string" && props.children != null) {
    return (
      <View class={props.class ?? undefined} style={props.style as StyleProp<ViewStyle>}>
        {props.children}
      </View>
    );
  }
  // Read in the JSX so a scheme change re-runs it. A helper outside the element does not.
  return (
    <Text
      class={props.class ?? undefined}
      style={mergeStyle(look().title, props.style as StyleProp<TextStyle>)}
    >
      {props.children}
    </Text>
  );
}

/** The card's description; a string child gets the dialog type. */
export function DialogDescription(props: DialogDescriptionProps) {
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
      style={mergeStyle(look().body, props.style as StyleProp<TextStyle>)}
    >
      {props.children}
    </Text>
  );
}
