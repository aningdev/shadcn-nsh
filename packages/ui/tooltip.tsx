import { colors, disabledOpacity, radius } from "@shadcn-nsh/theme";
import type { JSX, StyleProp, TextStyle, ViewStyle } from "nsh";
import { context, split, Text, View } from "nsh";
import {
  Tooltip as BaseTooltip,
  type OpenChangeReason,
  type TooltipProps as BaseTooltipProps,
} from "nsh/base";

import { Button } from "./button";
import { createOpenState, createSlot, type OpenState, type Slot } from "./lib/open-state";

/**
 * Composition root for `nsh/base` Tooltip: Trigger + Content only.
 *
 * Only the props the root actually honors are listed: the bubble's look,
 * `class` / `style` and the entrance/exit hooks live on {@link TooltipContent}
 * (the root has no surface of its own). `nsh/base`'s full prop set stays
 * available on Content and on standalone `tooltip={…}` use.
 */
export type TooltipProps = {
  open?: boolean | null;
  defaultOpen?: boolean;
  placement?: BaseTooltipProps["placement"];
  align?: BaseTooltipProps["align"];
  offset?: number;
  margin?: number;
  delay?: number;
  disabled?: boolean;
  children?: JSX.Element;
  onOpenChange?: (event: { open: boolean; reason: OpenChangeReason }) => void;
  onOpen?: () => void;
  onClose?: () => void;
};

/**
 * Theme layer on `nsh/base` Tooltip as shadcn `TooltipContent`. All base props
 * + style hooks pass through; consumer styles shallow-merge over defaults.
 * Open / lifecycle events are owned by the {@link Tooltip} context when used
 * in composition (standalone Content still accepts them). Defaults mirror
 * shadcn `bases/base` (`placement`/`side` top, `align` center, `offset`/
 * `sideOffset` 4).
 */
export type TooltipContentProps = Omit<BaseTooltipProps, "children"> & {
  children?: string | JSX.Element;
};

/** Hosts the element the pointer rests on. String children render as a Button. */
export type TooltipTriggerProps = {
  children?: string | JSX.Element;
  disabled?: boolean;
  class?: string | null;
  style?: StyleProp<ViewStyle>;
};

/** Optional delay default for nested tooltips (shadcn `TooltipProvider`). */
export type TooltipProviderProps = {
  children?: JSX.Element;
  delay?: number;
  class?: string | null;
  style?: StyleProp<ViewStyle>;
};

type ContentSlot = {
  get: () => TooltipContentProps | undefined;
  set: (props: TooltipContentProps) => void;
};

type TooltipContextValue = OpenState & {
  trigger: Slot;
  content: ContentSlot;
  placement?: BaseTooltipProps["placement"];
  align?: BaseTooltipProps["align"];
  offset?: number;
  margin?: number;
  delay?: number;
  disabled?: boolean;
  onOpen?: () => void;
  onClose?: () => void;
};

const TooltipContext = context<TooltipContextValue | null>(null);
const TooltipDelayContext = context<number | undefined>(undefined);

function useTooltip() {
  const ctx = TooltipContext();
  if (!ctx) throw new Error("Tooltip parts must be used within <Tooltip>");
  return ctx;
}

function createContentSlot(): ContentSlot {
  let props: TooltipContentProps | undefined;
  return {
    get: () => props,
    set: (next) => {
      props = next;
    },
  };
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

/** Bubble chrome — aligned with shadcn `cn-tooltip-content` (fg fill / bg text). */
function bubbleChrome(): ViewStyle {
  return {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.control,
    backgroundColor: colors.foreground,
    maxWidth: 288,
  };
}

function labelChrome(): TextStyle {
  return { fontSize: 12, color: colors.background };
}

function wrapLabel(children?: string | JSX.Element) {
  if (typeof children === "string") {
    return <Text style={labelChrome()}>{children}</Text>;
  }
  return children ?? <Text style={labelChrome()} />;
}

/** The themed bubble over `nsh/base` Tooltip; shared by composition and standalone use. */
function TooltipBubble(props: BaseTooltipProps) {
  // Only what this part defaults is split off; class, hover/active/focus/disabled styles pass through.
  const [, rest] = split(props, [
    "children",
    "style",
    "placement",
    "align",
    "offset",
    "startingStyle",
    "endingStyle",
  ]);

  // tooltip.md: a 100 ms fade. Either hook of a phase set by the consumer owns that
  // phase (`null` turns it off); the classes left in `rest` pass through.
  const motion = {
    style: {
      transitionProperty: "opacity",
      transitionDuration: 100,
      transitionTimingFunction: "ease-out",
    },
    startingStyle: { opacity: 0 },
    endingStyle: { opacity: 0 },
  } satisfies Record<"style" | "startingStyle" | "endingStyle", ViewStyle>;
  const defaultStarting = () =>
    props.startingClass === undefined && props.startingStyle === undefined;
  const defaultEnding = () => props.endingClass === undefined && props.endingStyle === undefined;

  return (
    <BaseTooltip
      {...rest}
      placement={props.placement ?? "top"}
      align={props.align ?? "center"}
      offset={props.offset ?? 4}
      style={mergeStyle({ ...bubbleChrome(), ...motion.style }, props.style)}
      startingStyle={defaultStarting() ? motion.startingStyle : props.startingStyle}
      endingStyle={defaultEnding() ? motion.endingStyle : props.endingStyle}
    >
      {props.children}
    </BaseTooltip>
  );
}

/**
 * Composition root (Trigger + Content). For host `tooltip={…}`, use
 * {@link TooltipContent} standalone.
 */
export function Tooltip(props: TooltipProps) {
  const state = createOpenState<OpenChangeReason>(props);

  return (
    <TooltipContext.Provider
      value={{
        ...state,
        trigger: createSlot(),
        content: createContentSlot(),
        get placement() {
          return props.placement;
        },
        get align() {
          return props.align;
        },
        get offset() {
          return props.offset;
        },
        get margin() {
          return props.margin;
        },
        get delay() {
          return props.delay;
        },
        get disabled() {
          return props.disabled;
        },
        get onOpen() {
          return props.onOpen;
        },
        get onClose() {
          return props.onClose;
        },
      }}
    >
      <View style={{ gap: 0 }}>
        {props.children}
        {/* After Trigger / Content have filled their slots. */}
        {() => <TooltipAnchor />}
      </View>
    </TooltipContext.Provider>
  );
}

function TooltipAnchor() {
  const ctx = TooltipContext();
  if (!ctx) return <View style={{ width: 0, height: 0 }} />;
  const triggerAccessor = ctx.trigger.get();
  const content: TooltipContentProps = ctx.content.get() ?? {};
  if (!triggerAccessor) return <View style={{ width: 0, height: 0 }} />;

  // Owned here: what falls back to the root / provider, the open state wiring and the label.
  const [, rest] = split(content, [
    "children",
    "placement",
    "align",
    "offset",
    "margin",
    "delay",
    "disabled",
    "onOpenChange",
    "onOpen",
    "onClose",
  ]);

  const providerDelay = TooltipDelayContext();

  const bubble = (
    <TooltipBubble
      {...rest}
      open={ctx.open()}
      placement={content.placement ?? ctx.placement ?? "top"}
      align={content.align ?? ctx.align ?? "center"}
      offset={content.offset ?? ctx.offset ?? 4}
      margin={content.margin ?? ctx.margin}
      delay={content.delay ?? ctx.delay ?? providerDelay}
      disabled={content.disabled ?? ctx.disabled}
      onOpenChange={(event) => {
        ctx.setOpen(event.open, event.reason);
        content.onOpenChange?.(event);
      }}
      onOpen={content.onOpen ?? ctx.onOpen}
      onClose={content.onClose ?? ctx.onClose}
    >
      {wrapLabel(content.children)}
    </TooltipBubble>
  );

  return (
    <View tooltip={bubble} style={{ alignSelf: "flex-start" }}>
      {(triggerAccessor() as JSX.Element) ?? <View />}
    </View>
  );
}

export function TooltipTrigger(props: TooltipTriggerProps) {
  const ctx = useTooltip();
  const blocked = () => props.disabled || ctx.disabled;

  ctx.trigger.set(() => {
    const children = props.children;
    if (typeof children === "string") {
      return (
        <Button disabled={blocked()} class={props.class ?? undefined} style={props.style}>
          {children}
        </Button>
      );
    }
    return (
      <View
        class={props.class ?? undefined}
        style={mergeStyle({ opacity: disabledOpacity(blocked()) }, props.style)}
      >
        {children ?? <View />}
      </View>
    );
  });
  return <View style={{ width: 0, height: 0 }} />;
}

export function TooltipContent(props: TooltipContentProps) {
  const ctx = TooltipContext();
  const providerDelay = TooltipDelayContext();

  if (!ctx) {
    // Standalone: use as host `tooltip={<TooltipContent>…</TooltipContent>}`.
    const [, rest] = split(props, ["children", "delay"]);
    return (
      <TooltipBubble {...rest} delay={props.delay ?? providerDelay}>
        {wrapLabel(props.children)}
      </TooltipBubble>
    );
  }

  ctx.content.set(props);
  return <View style={{ width: 0, height: 0 }} />;
}

export function TooltipProvider(props: TooltipProviderProps) {
  return (
    <TooltipDelayContext.Provider value={props.delay}>
      <View class={props.class ?? undefined} style={props.style}>
        {props.children}
      </View>
    </TooltipDelayContext.Provider>
  );
}
