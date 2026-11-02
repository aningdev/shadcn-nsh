import type { JSX, StyleProp, TextStyle, ViewStyle } from "nsh";
import { context, Text, View } from "nsh";
import {
  Dialog as BaseDialog,
  type DialogChangeReason,
  type DialogProps as BaseDialogProps,
} from "nsh/base";

import { createOpenState, type OpenState } from "../../lib/open-state";
import { popupBackdrop } from "../../lib/popup-surface";
import { colors, radius } from "../../lib/theme";
import { Button, type ButtonVariant } from "./button";

/**
 * Composition root (shadcn `Dialog`): holds open state for Trigger / Content.
 * Panel look and base props live on {@link DialogContent}.
 */
export type DialogProps = {
  open?: boolean | null;
  defaultOpen?: boolean;
  /** Default animation for {@link DialogContent} when Content omits `animation`. */
  animation?: "slide" | "fade" | "none";
  /** Default presentation for Content when omitted. */
  presentation?: BaseDialogProps["presentation"];
  /** Default Escape / back dismiss for Content when omitted. */
  closeOnEscape?: boolean;
  /** Default backdrop-press dismiss for Content when omitted. */
  closeOnBackdropPress?: boolean;
  /** Default swipe-to-dismiss for Content when omitted. */
  closeOnSwipe?: boolean;
  children?: JSX.Element;
  onOpenChange?: (open: boolean, reason: DialogChangeReason) => void;
  onOpen?: () => void;
  onClose?: () => void;
  onCancel?: () => void;
};

/**
 * Theme layer on `nsh/base` Dialog as shadcn `DialogContent`. All base props +
 * style hooks pass through; consumer styles shallow-merge over defaults.
 * Open / lifecycle events are owned by the {@link Dialog} context.
 * Wrapper default `animation` is `"fade"` (centered card); nsh/base defaults to `"slide"`.
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

/** App chrome around title / description (not an `nsh/base` part). */
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
  animation?: "slide" | "fade" | "none";
  presentation?: BaseDialogProps["presentation"];
  closeOnEscape?: boolean;
  closeOnBackdropPress?: boolean;
  closeOnSwipe?: boolean;
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

function bridgeOpenChange(
  onOpenChange?: (open: boolean, reason: DialogChangeReason) => void,
): ((event: { open: boolean; reason: string }) => void) | undefined {
  if (!onOpenChange) return undefined;
  return (event) => onOpenChange(event.open, event.reason as DialogChangeReason);
}

/** Centered card chrome — aligned with shadcn `cn-dialog-content` / max-w-lg padding. */
function contentPopupChrome(): ViewStyle {
  return {
    width: "90%",
    maxWidth: 512,
    alignSelf: "center",
    marginTop: "20%",
    padding: 24,
    gap: 16,
    borderRadius: radius.control * 2,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  };
}

function headerChrome(): ViewStyle {
  return { gap: 6 };
}

function footerChrome(): ViewStyle {
  return {
    flexDirection: "row",
    justifyContent: "flex-end",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 4,
  };
}

function titleChrome(): TextStyle {
  return { fontSize: 16, fontWeight: "600", color: colors.foreground };
}

function descriptionChrome(): TextStyle {
  return { fontSize: 13, color: colors.mutedForeground };
}

export function Dialog(props: DialogProps) {
  const {
    open,
    defaultOpen,
    animation,
    presentation,
    closeOnEscape,
    closeOnBackdropPress,
    closeOnSwipe,
    children,
    onOpenChange,
    onOpen,
    onClose,
    onCancel,
  } = props;

  const state = createOpenState({
    open,
    defaultOpen,
    onOpenChange: bridgeOpenChange(onOpenChange),
  });

  return (
    <DialogContext.Provider
      value={{
        ...state,
        animation,
        presentation,
        closeOnEscape,
        closeOnBackdropPress,
        closeOnSwipe,
        onOpen,
        onClose,
        onCancel,
      }}
    >
      {children}
    </DialogContext.Provider>
  );
}

export function DialogTrigger(props: DialogTriggerProps) {
  const ctx = useDialog();
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
      style={mergeStyle({ opacity: disabled ? 0.5 : 1 }, style)}
    >
      {children}
    </View>
  );
}

export function DialogClose(props: DialogCloseProps) {
  const ctx = useDialog();
  const { children, variant = "outline", disabled, class: className, style } = props;

  if (typeof children !== "string" && children != null) {
    return (
      <View
        class={mergeClass(undefined, className)}
        onPress={disabled ? undefined : () => ctx.setOpen(false)}
        style={mergeStyle({ opacity: disabled ? 0.5 : 1 }, style)}
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

export function DialogContent(props: DialogContentProps) {
  const ctx = useDialog();
  const {
    children,
    animation: animationProp,
    presentation: presentationProp,
    closeOnEscape: closeOnEscapeProp,
    closeOnBackdropPress: closeOnBackdropPressProp,
    closeOnSwipe: closeOnSwipeProp,
    class: className,
    style,
    backdropClass,
    backdropStyle,
    ...rest
  } = props;

  const animation = animationProp ?? ctx.animation ?? "fade";
  const presentation = presentationProp ?? ctx.presentation;
  const closeOnEscape = closeOnEscapeProp ?? ctx.closeOnEscape;
  const closeOnBackdropPress = closeOnBackdropPressProp ?? ctx.closeOnBackdropPress;
  const closeOnSwipe = closeOnSwipeProp ?? ctx.closeOnSwipe;

  return (
    <BaseDialog
      {...rest}
      open={ctx.open()}
      animation={animation}
      presentation={presentation}
      closeOnEscape={closeOnEscape}
      closeOnBackdropPress={closeOnBackdropPress}
      closeOnSwipe={closeOnSwipe}
      onOpenChange={(open, reason) => ctx.setOpen(open, reason)}
      onOpen={ctx.onOpen}
      onClose={ctx.onClose}
      onCancel={ctx.onCancel}
      class={mergeClass(undefined, className)}
      style={mergeStyle(contentPopupChrome(), style)}
      backdropClass={mergeClass(undefined, backdropClass)}
      backdropStyle={mergeStyle(popupBackdrop(), backdropStyle)}
    >
      {children}
    </BaseDialog>
  );
}

export function DialogHeader(props: DialogHeaderProps) {
  const { children, class: className, style } = props;
  return (
    <View class={mergeClass(undefined, className)} style={mergeStyle(headerChrome(), style)}>
      {children}
    </View>
  );
}

export function DialogFooter(props: DialogFooterProps) {
  const { children, class: className, style } = props;
  return (
    <View class={mergeClass(undefined, className)} style={mergeStyle(footerChrome(), style)}>
      {children}
    </View>
  );
}

export function DialogTitle(props: DialogTitleProps) {
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

export function DialogDescription(props: DialogDescriptionProps) {
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
