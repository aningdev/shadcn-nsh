// An alert dialog: confirmation card on Dialog with `dialogCard` / `dialogTitle` / `dialogText`.
// The look lives in `dialog.tsx` (from look/overlay.ts); this file is the shell only.
import type { JSX, StyleProp, TextStyle, ViewStyle } from "nsh";
import { context, platform, signal, split, Text, View } from "nsh";
import {
  type AlertDialogRole,
  Dialog as BaseDialog,
  type DialogChangeReason,
  type DialogProps as BaseDialogProps,
} from "nsh/base";

import { Button, type ButtonVariant } from "./button";
import { dialogCard, dialogText, dialogTitle } from "./dialog";
import { createOpenState, type OpenState } from "./lib/open-state";
import { backdrop } from "./lib/overlay";

const pointer = platform.desktop;

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
  "open" | "onOpenChange" | "onOpen" | "onClose" | "onCancel"
> & {
  /** The card's width; default 360 with a pointer, 320 on a touch screen. */
  width?: number;
};

/** Opens the alert. String children render as a Button; otherwise a pressable View. */
export type AlertDialogTriggerProps = {
  children?: string | JSX.Element;
  /** The button's variant, for a string child (default `secondary`). */
  variant?: ButtonVariant;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

/**
 * One action. `id` is what `onAction` reports (the app's name, not the label).
 * `role` picks the button: `destructive` → danger, `cancel` → secondary, else primary.
 */
export type AlertDialogActionProps = {
  id: string;
  role?: AlertDialogRole;
  children?: string | JSX.Element;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

/** App chrome around title and description (not an `nsh/base` part). */
export type AlertDialogHeaderProps = {
  children?: JSX.Element;
  style?: StyleProp<ViewStyle>;
};

/** App footer row (not an `nsh/base` part). Actions stay in the order given. */
export type AlertDialogFooterProps = {
  children?: JSX.Element;
  style?: StyleProp<ViewStyle>;
};

/** App title text (not an `nsh/base` part). */
export type AlertDialogTitleProps = {
  children?: string | JSX.Element;
  style?: StyleProp<TextStyle>;
};

/** App description text (not an `nsh/base` part). */
export type AlertDialogDescriptionProps = {
  children?: string | JSX.Element;
  style?: StyleProp<TextStyle>;
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

function actionVariant(role?: AlertDialogRole | null): ButtonVariant {
  if (role === "destructive") return "destructive";
  if (role === "cancel") return "secondary";
  return "default";
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

/** A button of the card, or its trigger: a `Button` for a string, else a pressable view. */
function Action(props: AlertDialogTriggerProps & { onPress: () => void; variant?: ButtonVariant }) {
  if (typeof props.children === "string") {
    return (
      <Button
        variant={props.variant ?? "secondary"}
        disabled={props.disabled}
        style={props.style}
        onPress={props.onPress}
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
      onPress={props.disabled ? undefined : props.onPress}
      style={props.style}
    >
      {props.children}
    </View>
  );
}

/** Opens the alert. */
export function AlertDialogTrigger(props: AlertDialogTriggerProps) {
  const ctx = useAlertDialog();
  return (
    <Action {...props} onPress={() => ctx.setOpen(true)}>
      {props.children}
    </Action>
  );
}

/** The card, over the theme's scrim. An alert waits for an action by default. */
export function AlertDialogContent(props: AlertDialogContentProps) {
  const ctx = useAlertDialog();
  const [, rest] = split(props, [
    "width",
    "children",
    "style",
    "backdropStyle",
    "animation",
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
      backdropStyle={[backdrop(), props.backdropStyle ?? null]}
      style={[dialogCard(props.width ?? (pointer ? 360 : 320)), props.style ?? null]}
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
        onPress={props.disabled ? undefined : choose}
        style={props.style}
      >
        {props.children}
      </View>
    );
  }
  return (
    <Button
      disabled={props.disabled}
      variant={actionVariant(props.role)}
      style={props.style}
      onPress={choose}
    >
      {props.children ?? "OK"}
    </Button>
  );
}

/** The header block of the card. */
export function AlertDialogHeader(props: AlertDialogHeaderProps) {
  return <View style={[{ gap: 4 }, props.style ?? null]}>{props.children}</View>;
}

/**
 * The row of the card's actions, laid out as upstream's dialog demo lays them: 8 points apart,
 * at the trailing edge with a pointer.
 */
export function AlertDialogFooter(props: AlertDialogFooterProps) {
  return (
    <View
      style={[
        {
          flexDirection: "row",
          gap: 8,
          paddingTop: 4,
          justifyContent: pointer ? "flex-end" : undefined,
          flexWrap: "wrap",
        },
        props.style ?? null,
      ]}
    >
      {props.children}
    </View>
  );
}

/** The card's title; a string takes `dialogTitle`'s type. */
export function AlertDialogTitle(props: AlertDialogTitleProps) {
  if (typeof props.children !== "string") return props.children;
  return <Text style={[dialogTitle(), props.style ?? null]}>{props.children}</Text>;
}

/** The card's description; a string takes `dialogText`'s type. */
export function AlertDialogDescription(props: AlertDialogDescriptionProps) {
  if (typeof props.children !== "string") return props.children;
  return <Text style={[dialogText(), props.style ?? null]}>{props.children}</Text>;
}
