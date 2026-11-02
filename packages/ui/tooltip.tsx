import { colors, radius } from "@shadcn-nsh/theme";
import type { JSX, StyleProp, TextStyle, ViewStyle } from "nsh";
import { context, Text, View } from "nsh";
import {
  Tooltip as BaseTooltip,
  type OpenChangeReason,
  type TooltipProps as BaseTooltipProps,
} from "nsh/base";

import { Button } from "./button";
import {
  createOpenState,
  createTriggerSlot,
  type OpenState,
  type TriggerSlot,
} from "./lib/open-state";

/**
 * Composition root (shadcn `Tooltip`) **or** string-label bubble for host
 * `tooltip={…}`. Prefer composition; string / standalone Content still mount a
 * single `nsh/base` Tooltip with full base prop + style-hook pass-through.
 */
export type TooltipProps = Omit<BaseTooltipProps, "children"> & {
  children?: string | JSX.Element;
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
  trigger: TriggerSlot;
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

function bridgeOpenChange(
  onOpenChange?: (open: boolean, reason: OpenChangeReason) => void,
): ((event: { open: boolean; reason: string }) => void) | undefined {
  if (!onOpenChange) return undefined;
  return (event) => onOpenChange(event.open, event.reason as OpenChangeReason);
}

function wrapLabel(children?: string | JSX.Element) {
  if (typeof children === "string") {
    return <Text style={labelChrome()}>{children}</Text>;
  }
  return children ?? <Text style={labelChrome()} />;
}

function renderBaseTooltip(props: BaseTooltipProps) {
  const {
    class: className,
    style,
    hoverStyle,
    activeStyle,
    focusStyle,
    disabledStyle,
    placement = "top",
    align = "center",
    offset = 4,
    children,
    ...rest
  } = props;

  return (
    <BaseTooltip
      {...rest}
      placement={placement}
      align={align}
      offset={offset}
      class={mergeClass(undefined, className)}
      style={mergeStyle(bubbleChrome(), style)}
      hoverStyle={mergeStyle(undefined, hoverStyle)}
      activeStyle={mergeStyle(undefined, activeStyle)}
      focusStyle={mergeStyle(undefined, focusStyle)}
      disabledStyle={mergeStyle(undefined, disabledStyle)}
    >
      {children}
    </BaseTooltip>
  );
}

/**
 * Composition root (Trigger + Content) **or** string-label bubble for `tooltip={…}` hosts.
 *
 * ```tsx
 * // Host prop (bubble)
 * <View tooltip={<Tooltip>Add item</Tooltip>} />
 *
 * // Composition
 * <Tooltip>
 *   <TooltipTrigger>Hint</TooltipTrigger>
 *   <TooltipContent>Details</TooltipContent>
 * </Tooltip>
 * ```
 */
export function Tooltip(props: TooltipProps) {
  const {
    open,
    defaultOpen,
    children,
    onOpenChange,
    onOpen,
    onClose,
    placement,
    align,
    offset,
    margin,
    delay,
    disabled,
    ...rest
  } = props;

  if (typeof children === "string") {
    return renderBaseTooltip({
      ...rest,
      open,
      defaultOpen,
      placement,
      align,
      offset,
      margin,
      delay,
      disabled,
      onOpenChange,
      onOpen,
      onClose,
      children: wrapLabel(children),
    });
  }

  const state = createOpenState({
    open,
    defaultOpen,
    onOpenChange: bridgeOpenChange(onOpenChange),
  });

  return (
    <TooltipContext.Provider
      value={{
        ...state,
        trigger: createTriggerSlot(),
        content: createContentSlot(),
        placement,
        align,
        offset,
        margin,
        delay,
        disabled,
        onOpen,
        onClose,
      }}
    >
      <View style={{ gap: 0 }}>
        {children}
        <TooltipAnchor />
      </View>
    </TooltipContext.Provider>
  );
}

function TooltipAnchor() {
  const ctx = TooltipContext();
  if (!ctx) return <View style={{ width: 0, height: 0 }} />;
  const triggerAccessor = ctx.trigger.get();
  const contentProps = ctx.content.get();
  // No Trigger registered → treat as legacy bubble with element children already rendered above.
  if (!triggerAccessor) return <View style={{ width: 0, height: 0 }} />;

  const {
    children,
    class: className,
    style,
    hoverStyle,
    activeStyle,
    focusStyle,
    disabledStyle,
    placement,
    align,
    offset,
    margin,
    delay,
    disabled,
    onOpenChange,
    onOpen,
    onClose,
    ...rest
  } = contentProps ?? {};

  const providerDelay = TooltipDelayContext();

  const bubble = renderBaseTooltip({
    ...rest,
    open: ctx.open(),
    placement: placement ?? ctx.placement ?? "top",
    align: align ?? ctx.align ?? "center",
    offset: offset ?? ctx.offset ?? 4,
    margin: margin ?? ctx.margin,
    delay: delay ?? ctx.delay ?? providerDelay,
    disabled: disabled ?? ctx.disabled,
    onOpenChange: (next, reason) => {
      ctx.setOpen(next, reason);
      onOpenChange?.(next, reason);
    },
    onOpen: onOpen ?? ctx.onOpen,
    onClose: onClose ?? ctx.onClose,
    class: className,
    style,
    hoverStyle,
    activeStyle,
    focusStyle,
    disabledStyle,
    children: wrapLabel(children),
  });

  return (
    <View tooltip={bubble} style={{ alignSelf: "flex-start" }}>
      {(triggerAccessor() as JSX.Element) ?? <View />}
    </View>
  );
}

export function TooltipTrigger(props: TooltipTriggerProps) {
  const ctx = useTooltip();
  const { children, disabled, class: className, style } = props;
  const blocked = disabled || ctx.disabled;

  ctx.trigger.set(() => {
    if (typeof children === "string") {
      return <Button disabled={blocked}>{children}</Button>;
    }
    return (
      <View
        class={mergeClass(undefined, className)}
        style={mergeStyle({ opacity: blocked ? 0.5 : 1 }, style)}
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
    const {
      children,
      class: className,
      style,
      hoverStyle,
      activeStyle,
      focusStyle,
      disabledStyle,
      placement = "top",
      align = "center",
      offset = 4,
      delay,
      ...rest
    } = props;

    return renderBaseTooltip({
      ...rest,
      placement,
      align,
      offset,
      delay: delay ?? providerDelay,
      class: className,
      style,
      hoverStyle,
      activeStyle,
      focusStyle,
      disabledStyle,
      children: wrapLabel(children),
    });
  }

  ctx.content.set(props);
  return <View style={{ width: 0, height: 0 }} />;
}

export function TooltipProvider(props: TooltipProviderProps) {
  const { children, delay, class: className, style } = props;
  return (
    <TooltipDelayContext.Provider value={delay}>
      <View class={mergeClass(undefined, className)} style={mergeStyle(undefined, style)}>
        {children}
      </View>
    </TooltipDelayContext.Provider>
  );
}
