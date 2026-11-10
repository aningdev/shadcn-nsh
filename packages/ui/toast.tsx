// Source: examples/nsh-gallery-ui/look/overlay.ts @ 64ab8a1d (baseline), see NOTICE.
import { alpha, colors, finish, focusRing, hovered, radius } from "@shadcn-nsh/theme";
import type { JSX, StyleProp, TextStyle, ViewStyle } from "nsh";
import { Overlay, reduceMotion, safeArea, signal, split, Text, View } from "nsh";
import {
  Toast as BaseToast,
  ToastManager,
  ToastStack as BaseToastStack,
  type Anchor,
  type ToastEntry,
  type ToastMotion,
  type ToastOptions,
  type ToastProps as BaseToastProps,
  type ToastStackProps as BaseToastStackProps,
  type ToastTransitionStatus,
} from "nsh/base";

import { touchHitSlop } from "./lib/density";
import { pressSink } from "./lib/press";

/** Toast entrance class: 200 ms, dropped when motion is reduced. `motion-reduce` cancels it too. */
export function toastMotionClass(): string {
  const duration = reduceMotion() ? "" : "duration-200 ";
  return `transition-all ${duration}ease-out motion-reduce:transition-none`;
}

export { ToastManager };
export type { Anchor, ToastEntry, ToastMotion, ToastOptions, ToastTransitionStatus };

/**
 * Theme layer on `nsh/base` Toast. All base props and style hooks pass through.
 * Optional `title` / `description` render when `children` is omitted.
 */
export type ToastProps = Omit<BaseToastProps, "children"> & {
  children?: JSX.Element;
  /** Convenience title when `children` is omitted. */
  title?: string;
  /** Convenience description when `children` is omitted. */
  description?: string;
};

/** The toast's title; a string child gets the toast type. */
export type ToastTitleProps = {
  children?: string | JSX.Element;
  class?: string | null;
  style?: StyleProp<TextStyle | ViewStyle>;
};

/** The toast's description; a string child gets the quieter type. */
export type ToastDescriptionProps = {
  children?: string | JSX.Element;
  class?: string | null;
  style?: StyleProp<TextStyle | ViewStyle>;
};

/** The toast's close cross. Pressed, it sinks; reduced motion keeps the colour only. */
export type ToastCloseProps = {
  children?: JSX.Element;
  disabled?: boolean;
  class?: string | null;
  style?: StyleProp<ViewStyle>;
  hoverStyle?: StyleProp<ViewStyle>;
  activeStyle?: StyleProp<ViewStyle>;
  focusStyle?: StyleProp<ViewStyle>;
  accessibilityLabel?: string | null;
  onPress?: () => void;
};

/**
 * Theme layer on `nsh/base` ToastStack. All base props and style hooks pass through.
 */
export type ToastStackProps = Omit<BaseToastStackProps, "children"> & {
  children?: JSX.Element;
};

/**
 * Sonner-shaped host: mounts an Overlay + ToastStack wired to the default
 * {@link ToastManager}. Place once; call {@link toast} from anywhere.
 */
export type ToasterProps = {
  placement?: Anchor;
  motion?: ToastMotion;
  closeOnEscape?: boolean;
  /** Overlay host `class`. */
  class?: string | null;
  /** Overlay host style, merged over the edge and the safe area. */
  style?: StyleProp<ViewStyle>;
  /** ToastStack `class`. */
  stackClass?: string | null;
  /** ToastStack style, merged over the stack chrome. */
  stackStyle?: StyleProp<ViewStyle>;
  stackHoverStyle?: StyleProp<ViewStyle>;
  stackActiveStyle?: StyleProp<ViewStyle>;
  stackFocusStyle?: StyleProp<ViewStyle>;
  stackDisabledStyle?: StyleProp<ViewStyle>;
  onExpandedChange?: (event: { expanded: boolean }) => void;
  onCancel?: () => void;
};

type ToastContent = {
  title?: string;
  description?: string;
};

const defaultManager = new ToastManager();
const visible = signal<ToastEntry[]>([]);
const expanded = signal(false);
let tickStarted = false;
let toastSeq = 0;
/** How many non-ending toasts `visible()` keeps for the default Toaster. */
const VISIBLE_LIMIT = 3;

function syncVisible() {
  visible.set(defaultManager.visible(VISIBLE_LIMIT));
}

function ensureTick() {
  if (tickStarted) return;
  tickStarted = true;
  setInterval(() => {
    if (defaultManager.advance(expanded()).changed) syncVisible();
  }, 50);
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
 * A raised row (card fill, control edge). The close cross is 24 points square
 * on purpose; a finger's hit slop brings it to 44. Enter and exit are toast.md's
 * 200 ms (16 points up, then 95%).
 */
function look() {
  return {
    root: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      paddingVertical: 12,
      paddingHorizontal: 14,
      borderRadius: radius.control,
      borderCurve: "continuous",
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
      boxShadow: finish.control.rest,
      minWidth: 200,
    } satisfies ViewStyle,
    // toast.md: 200 ms. A set `class` owns the whole class (a later duration does not override).
    motion: toastMotionClass(),
    enter: "opacity-0 translate-y-4",
    exit: "opacity-0 scale-95",
    title: { fontSize: 14, fontWeight: "600", color: colors.foreground } satisfies TextStyle,
    text: {
      fontSize: 13,
      color: colors.mutedForeground,
      fontVariant: ["tabular-nums"],
    } satisfies TextStyle,
    close: {
      minWidth: 24,
      minHeight: 24,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 12,
    } satisfies ViewStyle,
    stack: { gap: 8, padding: 12, minWidth: 280, maxWidth: 360 } satisfies ViewStyle,
  };
}

function closeActive(): ViewStyle {
  return {
    backgroundColor: alpha(colors.foreground, 0.1),
    ...pressSink(0.9, "background-color").activeStyle,
  };
}

/** The close cross's pressed style: the sink, or only the colour when motion is reduced. */
export function toastCloseActive(): ViewStyle {
  return closeActive();
}

function overlayChrome(placement: Anchor): ViewStyle {
  const name = placement.toLowerCase();
  const left = name.includes("left");
  const center = name.includes("center");
  const bottom = name.includes("bottom");
  return {
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    paddingHorizontal: 12,
    paddingTop: safeArea().top + 12,
    paddingBottom: safeArea().bottom + 12,
    alignItems: left ? "flex-start" : center ? "center" : "flex-end",
    justifyContent: bottom ? "flex-end" : "flex-start",
    pointerEvents: "box-none",
  };
}

/**
 * Imperative helper (sonner-shaped). Requires `<Toaster />` in the tree.
 * Returns the toast id (pass to `toast.dismiss`).
 */
export function toast(
  message: string,
  opts?: { id?: string; description?: string; timeout?: number | null },
) {
  ensureTick();
  const id = opts?.id ?? `toast-${++toastSeq}`;
  defaultManager.push(
    id,
    { title: message, description: opts?.description } satisfies ToastContent,
    { timeout: opts?.timeout ?? 4000 },
  );
  syncVisible();
  return id;
}

toast.dismiss = (id?: string) => {
  if (id) defaultManager.dismiss(id);
  else defaultManager.dismissAll();
  syncVisible();
};

/** The toast's title; a string child gets the semibold type. */
export function ToastTitle(props: ToastTitleProps) {
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

/** The toast's description; a string child gets the quieter type. */
export function ToastDescription(props: ToastDescriptionProps) {
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
      style={mergeStyle(look().text, props.style as StyleProp<TextStyle>)}
    >
      {props.children}
    </Text>
  );
}

/** The close cross. Stringless: pass `children` to replace the mark. */
export function ToastClose(props: ToastCloseProps) {
  const sink = pressSink(0.9, "background-color");
  return (
    <View
      accessible
      role="button"
      accessibilityLabel={props.accessibilityLabel ?? "Dismiss"}
      accessibilityState={{ disabled: props.disabled }}
      hitSlop={touchHitSlop(24)}
      class={props.class ?? undefined}
      onPress={props.disabled ? undefined : props.onPress}
      hoverStyle={mergeStyle(hovered(), props.hoverStyle)}
      activeStyle={mergeStyle(closeActive(), props.activeStyle)}
      focusStyle={mergeStyle(focusRing(), props.focusStyle)}
      style={mergeStyle({ ...look().close, ...sink.transition }, props.style)}
    >
      {props.children ?? (
        <Text style={{ fontSize: 16, lineHeight: 16, color: colors.mutedForeground }}>×</Text>
      )}
    </View>
  );
}

/** A raised toast row. Enter and exit apply only while the consumer left that phase unset. */
export function Toast(props: ToastProps) {
  const [, rest] = split(props, [
    "children",
    "title",
    "description",
    "class",
    "style",
    "startingClass",
    "endingClass",
    "swipingClass",
    "accessibilityLabel",
  ]);
  const label =
    props.accessibilityLabel ??
    ([props.title, props.description].filter(Boolean).join(". ") || undefined);
  return (
    <BaseToast
      {...rest}
      accessibilityLabel={label}
      class={props.class === undefined ? look().motion : props.class}
      style={mergeStyle(look().root, props.style)}
      startingClass={props.startingClass === undefined ? look().enter : props.startingClass}
      endingClass={props.endingClass === undefined ? look().exit : props.endingClass}
      swipingClass={props.swipingClass === undefined ? "transition-none" : props.swipingClass}
    >
      {props.children ?? (
        <View style={{ flex: 1, flexDirection: "row", alignItems: "center", gap: 12 }}>
          <View style={{ flex: 1, gap: 2 }}>
            {props.title ? <ToastTitle>{props.title}</ToastTitle> : null}
            {props.description ? <ToastDescription>{props.description}</ToastDescription> : null}
          </View>
          {props.onDismissRequest ? (
            <ToastClose onPress={() => props.onDismissRequest?.()} />
          ) : null}
        </View>
      )}
    </BaseToast>
  );
}

/** The stack the toasts sit in. The app places it; this only sets its width and gap. */
export function ToastStack(props: ToastStackProps) {
  const [, rest] = split(props, ["style", "placement", "children"]);
  return (
    <BaseToastStack
      {...rest}
      placement={props.placement ?? "topRight"}
      style={mergeStyle(look().stack, props.style)}
    >
      {props.children}
    </BaseToastStack>
  );
}

/** The default stack, in an overlay inset by the safe area. */
export function Toaster(props: ToasterProps) {
  ensureTick();
  const placement = props.placement ?? "topRight";
  const dismissNewest = () => {
    const newest = visible()
      .filter((t) => t.status !== "ending")
      .at(-1);
    if (newest) {
      defaultManager.dismiss(newest.id);
      syncVisible();
    }
  };
  return (
    <Overlay
      class={props.class ?? undefined}
      style={mergeStyle(overlayChrome(placement), props.style)}
    >
      <ToastStack
        placement={placement}
        motion={props.motion}
        closeOnEscape={props.closeOnEscape}
        class={props.stackClass ?? undefined}
        style={props.stackStyle}
        hoverStyle={props.stackHoverStyle}
        activeStyle={props.stackActiveStyle}
        focusStyle={props.stackFocusStyle}
        disabledStyle={props.stackDisabledStyle}
        onExpandedChange={({ expanded: open }) => {
          expanded.set(open);
          props.onExpandedChange?.({ expanded: open });
        }}
        onCancel={() => {
          if (props.onCancel) props.onCancel();
          else dismissNewest();
        }}
      >
        {/* nsh global `<Each>` — keyed toast rows; function child, not `children=` prop */}
        {/* oxlint-disable-next-line react/jsx-no-undef */}
        <Each of={visible()} key={(t: ToastEntry) => t.id}>
          {(t) => {
            const content = () => t().value as ToastContent;
            return (
              <Toast
                transitionStatus={t().status}
                title={content().title}
                description={content().description}
                onDismissRequest={() => {
                  defaultManager.dismiss(t().id);
                  syncVisible();
                }}
              />
            );
          }}
        </Each>
      </ToastStack>
    </Overlay>
  );
}
