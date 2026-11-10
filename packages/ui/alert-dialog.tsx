// Source: examples/nsh-gallery-ui/look/overlay.ts @ 64ab8a1d (baseline), see NOTICE.
import { colors, disabledOpacity, focusRing, modalSurface, popupBackdrop } from "@shadcn-nsh/theme";
import type { JSX, StyleProp, TextStyle, ViewStyle } from "nsh";
import { context, signal, split, Text, View } from "nsh";
import {
  type AlertDialogRole,
  Dialog as BaseDialog,
  type DialogChangeReason,
  type DialogProps as BaseDialogProps,
} from "nsh/base";

import { Button, type ButtonVariant } from "./button";
import { isPointer } from "./lib/density";
import { createOpenState, type OpenState } from "./lib/open-state";

/**
 * Composition root for a confirmation card. Open state only: the card's
 * `animation` and `closeOn*` flags live on {@link AlertDialogContent}.
 * Choosing an action reports its `id` (`onAction`); dismissing reports `null`.
 */
export type AlertDialogProps = {
  open?: boolean | null;
  defaultOpen?: boolean;
  children?: JSX.Element;
  onOpenChange?: (event: { open: boolean; reason: DialogChangeReason }) => void;
  onOpen?: () => void;
  onClose?: () => void;
  onCancel?: () => void;
  /** The chosen action `id`, or `null` when the card closed without one. */
  onAction?: (event: { action: string | null }) => void;
};

/**
 * Theme layer on `nsh/base` Dialog as `AlertDialogContent`. Store `AlertDialog.show`
 * is the platform alert and has no style hooks, so the card is a Dialog.
 * Defaults: `animation` `"fade"`, and `closeOnEscape` / `closeOnBackdropPress` /
 * `closeOnSwipe` false (an alert waits for an action; Dialog leaves those on).
 */
export type AlertDialogContentProps = Omit<
  BaseDialogProps,
  "open" | "onOpenChange" | "onOpen" | "onClose" | "onCancel" | "children"
> & {
  children?: JSX.Element;
};

/** Opens the alert. String children render as a Button; otherwise a pressable View. */
export type AlertDialogTriggerProps = {
  children?: string | JSX.Element;
  disabled?: boolean;
  class?: string | null;
  style?: StyleProp<ViewStyle>;
};

/**
 * One action. `id` is what `onAction` reports (the app's name, not the label).
 * `role` picks the button: `destructive`, `cancel` (outline), or `default`.
 */
export type AlertDialogActionProps = {
  id: string;
  role?: AlertDialogRole;
  children?: string | JSX.Element;
  disabled?: boolean;
  class?: string | null;
  style?: StyleProp<ViewStyle>;
};

/** App chrome around title and description (not an `nsh/base` part). */
export type AlertDialogHeaderProps = {
  children?: JSX.Element;
  class?: string | null;
  style?: StyleProp<ViewStyle>;
};

/** App footer row (not an `nsh/base` part). Actions stay in the order given. */
export type AlertDialogFooterProps = {
  children?: JSX.Element;
  class?: string | null;
  style?: StyleProp<ViewStyle>;
};

/** App title text (not an `nsh/base` part). */
export type AlertDialogTitleProps = {
  children?: string | JSX.Element;
  class?: string | null;
  style?: StyleProp<TextStyle | ViewStyle>;
};

/** App description text (not an `nsh/base` part). */
export type AlertDialogDescriptionProps = {
  children?: string | JSX.Element;
  class?: string | null;
  style?: StyleProp<TextStyle | ViewStyle>;
};

type AlertDialogContextValue = OpenState & {
  onOpen?: () => void;
  onClose?: () => void;
  onCancel?: () => void;
  choose: (id: string) => void;
  dismiss: () => void;
};

const AlertDialogContext = context<AlertDialogContextValue | null>(null);

function useAlertDialog() {
  const ctx = AlertDialogContext();
  if (!ctx) throw new Error("AlertDialog parts must be used within <AlertDialog>");
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
 * The confirmation card. Width is 90% of the window and at most 400: a short
 * decision, not a hug of its title, and not a sheet stretched across a wide
 * desktop. Title 17 / 20 and text 13 / 15 follow the pointer.
 */
function look() {
  const pointer = isPointer();
  return {
    card: {
      ...modalSurface(),
      width: "90%",
      maxWidth: 400,
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

function actionVariant(role?: AlertDialogRole | null): ButtonVariant {
  if (role === "destructive") return "destructive";
  if (role === "cancel") return "outline";
  return "default";
}

/** The alert card, the same style {@link AlertDialogContent} puts on the popup. */
export function alertDialogCardStyle(): ViewStyle {
  return look().card;
}

/** The alert title's type. */
export function alertDialogTitleStyle(): TextStyle {
  return look().title;
}

/** The alert description's type. */
export function alertDialogBodyStyle(): TextStyle {
  return look().body;
}

/** Composition root: owns the open state and which action was chosen. */
export function AlertDialog(props: AlertDialogProps) {
  const state = createOpenState<DialogChangeReason>(props);
  const reported = signal(false);
  const report = (action: string | null) => {
    if (reported()) return;
    reported.set(true);
    props.onAction?.({ action });
  };
  return (
    <AlertDialogContext.Provider
      value={{
        open: state.open,
        setOpen: (next, reason) => {
          if (next) reported.set(false);
          state.setOpen(next, reason);
        },
        get onOpen() {
          return props.onOpen;
        },
        get onClose() {
          return props.onClose;
        },
        get onCancel() {
          return props.onCancel;
        },
        choose: (id) => {
          report(id);
          state.setOpen(false);
        },
        dismiss: () => {
          report(null);
        },
      }}
    >
      {props.children}
    </AlertDialogContext.Provider>
  );
}

/** Opens the alert; a string child renders a `Button`. */
export function AlertDialogTrigger(props: AlertDialogTriggerProps) {
  const ctx = useAlertDialog();
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

/** The card. Motion stays on base (`animation`). A user dismiss reports `action: null`. */
export function AlertDialogContent(props: AlertDialogContentProps) {
  const ctx = useAlertDialog();
  const chrome = look();
  const [, rest] = split(props, [
    "children",
    "style",
    "backdropStyle",
    "animation",
    "class",
    "backdropClass",
    "closeOnEscape",
    "closeOnBackdropPress",
    "closeOnSwipe",
  ]);
  return (
    <BaseDialog
      {...rest}
      open={ctx.open()}
      animation={props.animation ?? "fade"}
      closeOnEscape={props.closeOnEscape ?? false}
      closeOnBackdropPress={props.closeOnBackdropPress ?? false}
      closeOnSwipe={props.closeOnSwipe ?? false}
      onOpenChange={({ open, reason }) => {
        ctx.setOpen(open, reason);
        if (!open) ctx.dismiss();
      }}
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

/** Closes the alert and reports `id`. A string child renders a `Button` colored by `role`. */
export function AlertDialogAction(props: AlertDialogActionProps) {
  const ctx = useAlertDialog();
  const choose = () => {
    if (!props.disabled) ctx.choose(props.id);
  };
  if (typeof props.children !== "string" && props.children != null) {
    return (
      <View
        accessible
        role="button"
        accessibilityState={{ disabled: props.disabled }}
        class={props.class ?? undefined}
        focusStyle={focusRing()}
        onPress={props.disabled ? undefined : choose}
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
      variant={actionVariant(props.role)}
      class={props.class ?? undefined}
      style={props.style}
      onPress={choose}
    >
      {props.children ?? "OK"}
    </Button>
  );
}

/** The header block of the card. */
export function AlertDialogHeader(props: AlertDialogHeaderProps) {
  return (
    <View class={props.class ?? undefined} style={mergeStyle(look().header, props.style)}>
      {props.children}
    </View>
  );
}

/** The footer row of the card. */
export function AlertDialogFooter(props: AlertDialogFooterProps) {
  return (
    <View class={props.class ?? undefined} style={mergeStyle(look().footer, props.style)}>
      {props.children}
    </View>
  );
}

/** The card's title; a string child gets the alert type. */
export function AlertDialogTitle(props: AlertDialogTitleProps) {
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
      style={mergeStyle(look().title, props.style as StyleProp<TextStyle>)}
    >
      {props.children}
    </Text>
  );
}

/** The card's description; a string child gets the alert type. */
export function AlertDialogDescription(props: AlertDialogDescriptionProps) {
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
