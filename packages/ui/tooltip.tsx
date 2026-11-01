import { colors, radius } from "@shadcn-nsh/theme";
import type { JSX, Placement } from "nsh";
import { context, Text, View } from "nsh";
import { Tooltip as BaseTooltip } from "nsh/base";

import { Button } from "./button";
import {
  createOpenState,
  createTriggerSlot,
  type OpenState,
  type TriggerSlot,
} from "./lib/open-state";

type TooltipContextValue = OpenState & {
  trigger: TriggerSlot;
  content: TriggerSlot;
  placement?: Placement;
  delay?: number;
  disabled?: boolean;
};

const TooltipContext = context<TooltipContextValue | null>(null);

function bubbleStyle() {
  return {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.control,
    backgroundColor: colors.foreground,
  };
}

function Bubble(props: {
  open?: boolean | null;
  defaultOpen?: boolean;
  placement?: Placement;
  delay?: number;
  disabled?: boolean;
  children?: JSX.Element;
  onOpenChange?: (event: { open: boolean; reason: string }) => void;
}) {
  return (
    <BaseTooltip
      open={props.open}
      defaultOpen={props.defaultOpen}
      placement={props.placement ?? "top"}
      delay={props.delay}
      disabled={props.disabled}
      offset={6}
      onOpenChange={props.onOpenChange as never}
      style={bubbleStyle()}
    >
      {props.children}
    </BaseTooltip>
  );
}

/**
 * Composition root (Trigger + Content) **or** string-label bubble for `tooltip={…}` hosts.
 *
 * ```tsx
 * // Host prop (bubble)
 * <Button tooltip={<Tooltip>Add item</Tooltip>} />
 *
 * // Composition
 * <Tooltip>
 *   <TooltipTrigger>Hint</TooltipTrigger>
 *   <TooltipContent>Details</TooltipContent>
 * </Tooltip>
 * ```
 */
export function Tooltip(props: {
  open?: boolean | null;
  defaultOpen?: boolean;
  placement?: Placement;
  delay?: number;
  disabled?: boolean;
  children?: string | JSX.Element;
  onOpenChange?: (event: { open: boolean; reason: string }) => void;
}) {
  if (typeof props.children === "string") {
    return (
      <Bubble
        open={props.open}
        defaultOpen={props.defaultOpen}
        placement={props.placement}
        delay={props.delay}
        disabled={props.disabled}
        onOpenChange={props.onOpenChange}
      >
        <Text style={{ fontSize: 12, color: colors.background }}>{props.children}</Text>
      </Bubble>
    );
  }

  const state = createOpenState({
    open: props.open,
    defaultOpen: props.defaultOpen,
    onOpenChange: props.onOpenChange,
  });

  return (
    <TooltipContext.Provider
      value={{
        ...state,
        trigger: createTriggerSlot(),
        content: createTriggerSlot(),
        placement: props.placement,
        delay: props.delay,
        disabled: props.disabled,
      }}
    >
      <View style={{ gap: 0 }}>
        {props.children}
        <TooltipAnchor />
      </View>
    </TooltipContext.Provider>
  );
}

function TooltipAnchor() {
  const ctx = TooltipContext();
  if (!ctx) return <View style={{ width: 0, height: 0 }} />;
  const triggerAccessor = ctx.trigger.get();
  const contentAccessor = ctx.content.get();
  // No Trigger registered → treat as legacy bubble with element children already rendered above.
  if (!triggerAccessor) return <View style={{ width: 0, height: 0 }} />;

  const bubble = (
    <Bubble
      open={ctx.open()}
      placement={ctx.placement}
      delay={ctx.delay}
      disabled={ctx.disabled}
      onOpenChange={(event) => ctx.setOpen(event.open)}
    >
      {(contentAccessor?.() as JSX.Element) ?? (
        <Text style={{ fontSize: 12, color: colors.background }} />
      )}
    </Bubble>
  );

  return (
    <View tooltip={bubble} style={{ alignSelf: "flex-start" }}>
      {(triggerAccessor() as JSX.Element) ?? <View />}
    </View>
  );
}

export function TooltipTrigger(props: { children?: string | JSX.Element; disabled?: boolean }) {
  const ctx = TooltipContext();
  if (!ctx) throw new Error("TooltipTrigger must be used within <Tooltip>");
  ctx.trigger.set(() => {
    if (typeof props.children === "string") {
      return <Button disabled={props.disabled || ctx.disabled}>{props.children}</Button>;
    }
    return props.children ?? <View />;
  });
  return <View style={{ width: 0, height: 0 }} />;
}

export function TooltipContent(props: {
  children?: string | JSX.Element;
  /** When used alone as `tooltip={…}`, renders the bubble directly. */
  open?: boolean | null;
  placement?: Placement;
  delay?: number;
  disabled?: boolean;
}) {
  const ctx = TooltipContext();
  if (!ctx) {
    return (
      <Bubble
        open={props.open}
        placement={props.placement}
        delay={props.delay}
        disabled={props.disabled}
      >
        {typeof props.children === "string" ? (
          <Text style={{ fontSize: 12, color: colors.background }}>{props.children}</Text>
        ) : (
          props.children
        )}
      </Bubble>
    );
  }

  ctx.content.set(() => {
    if (typeof props.children === "string") {
      return <Text style={{ fontSize: 12, color: colors.background }}>{props.children}</Text>;
    }
    return props.children ?? <Text style={{ fontSize: 12, color: colors.background }} />;
  });
  return <View style={{ width: 0, height: 0 }} />;
}

export function TooltipProvider(props: { children?: JSX.Element; delay?: number }) {
  return props.children ?? <View />;
}
