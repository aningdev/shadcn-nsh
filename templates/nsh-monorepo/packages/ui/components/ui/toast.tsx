import { colors, radius } from "@shadcn-nsh/theme";
import type { JSX, StyleProp, TextStyle, ViewStyle } from "nsh";
import { Overlay, safeArea, signal, Text, View } from "nsh";
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

export { ToastManager };
export type { Anchor, ToastEntry, ToastMotion, ToastOptions, ToastTransitionStatus };

/**
 * Theme layer on `nsh/base` Toast. All base props + style hooks pass through;
 * consumer styles shallow-merge over defaults. Optional `title` / `description`
 * render default text chrome when `children` is omitted (sonner / gallery-shaped).
 */
export type ToastProps = Omit<BaseToastProps, "children"> & {
  children?: JSX.Element;
  /** Convenience title when `children` is omitted. */
  title?: string;
  /** Convenience description when `children` is omitted. */
  description?: string;
};

/**
 * Theme layer on `nsh/base` ToastStack. All base props + style hooks pass
 * through; consumer styles shallow-merge over stack chrome (`gap` / padding /
 * maxWidth).
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
  /** Overlay host `class` (concatenated). */
  class?: string | null;
  /** Overlay host style; merged over edge / safe-area chrome. */
  style?: StyleProp<ViewStyle>;
  /** ToastStack `class` (concatenated). */
  stackClass?: string | null;
  /** ToastStack style; merged over stack chrome. */
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

/** Card chrome for a toast item — aligned with gallery raised toast. */
function toastChrome(): ViewStyle {
  return {
    padding: 12,
    borderRadius: radius.control,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    gap: 4,
    minWidth: 240,
  };
}

function toastMotionClass(): string {
  return "transition-all duration-200 ease-out";
}

function titleChrome(): TextStyle {
  return { fontSize: 14, fontWeight: "600", color: colors.foreground };
}

function descriptionChrome(): TextStyle {
  return { fontSize: 13, color: colors.mutedForeground };
}

/** Stack width / gap — app places the Overlay; stack owns item layout chrome. */
function stackChrome(): ViewStyle {
  return {
    gap: 8,
    padding: 12,
    maxWidth: 360,
    width: 340,
  };
}

function overlayChrome(placement: Anchor): ViewStyle {
  const left = placement.toLowerCase().includes("left");
  const center = placement.toLowerCase().includes("center");
  const bottom = placement.toLowerCase().includes("bottom");
  return {
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    padding: 12,
    paddingTop: safeArea().top + 12,
    paddingBottom: safeArea().bottom + 12,
    alignItems: left ? "flex-start" : center ? "center" : "flex-end",
    justifyContent: bottom ? "flex-end" : "flex-start",
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

export function Toast(props: ToastProps) {
  const {
    class: className,
    style,
    hoverStyle,
    activeStyle,
    focusStyle,
    disabledStyle,
    startingClass,
    endingClass,
    swipingClass,
    accessibilityLabel,
    title,
    description,
    children,
    ...rest
  } = props;

  const label = accessibilityLabel ?? ([title, description].filter(Boolean).join(". ") || null);

  return (
    <BaseToast
      {...rest}
      accessibilityLabel={label}
      class={mergeClass(toastMotionClass(), className)}
      style={mergeStyle(toastChrome(), style)}
      hoverStyle={mergeStyle(undefined, hoverStyle)}
      activeStyle={mergeStyle(undefined, activeStyle)}
      focusStyle={mergeStyle(undefined, focusStyle)}
      disabledStyle={mergeStyle(undefined, disabledStyle)}
      startingClass={mergeClass("opacity-0 translate-y-4", startingClass)}
      endingClass={mergeClass("opacity-0 scale-95", endingClass)}
      swipingClass={mergeClass("transition-none", swipingClass)}
    >
      {children ?? (
        <View style={{ gap: 2 }}>
          {title ? <Text style={titleChrome()}>{title}</Text> : null}
          {description ? <Text style={descriptionChrome()}>{description}</Text> : null}
        </View>
      )}
    </BaseToast>
  );
}

export function ToastStack(props: ToastStackProps) {
  const {
    class: className,
    style,
    hoverStyle,
    activeStyle,
    focusStyle,
    disabledStyle,
    placement,
    children,
    ...rest
  } = props;

  return (
    <BaseToastStack
      {...rest}
      placement={placement ?? "topRight"}
      class={mergeClass(undefined, className)}
      style={mergeStyle(stackChrome(), style)}
      hoverStyle={mergeStyle(undefined, hoverStyle)}
      activeStyle={mergeStyle(undefined, activeStyle)}
      focusStyle={mergeStyle(undefined, focusStyle)}
      disabledStyle={mergeStyle(undefined, disabledStyle)}
    >
      {children}
    </BaseToastStack>
  );
}

export function Toaster(props: ToasterProps) {
  ensureTick();
  const {
    placement = "topRight",
    motion,
    closeOnEscape,
    class: className,
    style,
    stackClass,
    stackStyle,
    stackHoverStyle,
    stackActiveStyle,
    stackFocusStyle,
    stackDisabledStyle,
    onExpandedChange,
    onCancel,
  } = props;

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
      class={mergeClass(undefined, className)}
      style={mergeStyle(mergeStyle(overlayChrome(placement), { pointerEvents: "box-none" }), style)}
    >
      <ToastStack
        placement={placement}
        motion={motion}
        closeOnEscape={closeOnEscape}
        class={stackClass ?? undefined}
        style={stackStyle}
        hoverStyle={stackHoverStyle}
        activeStyle={stackActiveStyle}
        focusStyle={stackFocusStyle}
        disabledStyle={stackDisabledStyle}
        onExpandedChange={({ expanded: open }) => {
          expanded.set(open);
          onExpandedChange?.({ expanded: open });
        }}
        onCancel={() => {
          if (onCancel) onCancel();
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
