import type { JSX, StyleProp, ViewStyle } from "nsh";
import { context, View } from "nsh";
import {
  Collapsible as BaseCollapsible,
  type CollapsibleProps as BaseCollapsibleProps,
} from "nsh/base";

import { Button } from "./button";
import {
  createOpenState,
  createTriggerSlot,
  type OpenState,
  type TriggerSlot,
} from "./lib/open-state";

/**
 * Composition root (shadcn `Collapsible`): holds open state for Trigger /
 * Content. Prefer composition; legacy `content` still mounts a single
 * `nsh/base` Collapsible with full base prop + style-hook pass-through.
 * Store CLI `nsh` 0.3.0 has no `reveal` (website docs may show it).
 */
export type CollapsibleProps = Omit<BaseCollapsibleProps, "children"> & {
  children?: JSX.Element;
  /** Uncontrolled initial open (composition / invented — not on base). */
  defaultOpen?: boolean;
  /**
   * Open change (composition / invented — base has no collapsible events).
   * Signature matches shadcn `bases/base` (`(open: boolean) => void`).
   */
  onOpenChange?: (open: boolean) => void;
};

/**
 * Theme layer on `nsh/base` Collapsible as shadcn `CollapsibleContent`.
 * All base props + style hooks pass through; consumer styles shallow-merge
 * over defaults. Open / trigger are owned by the {@link Collapsible} context
 * (or the legacy single-root). `children` become base `content`.
 */
export type CollapsibleContentProps = Omit<
  BaseCollapsibleProps,
  "open" | "content" | "children"
> & {
  children?: JSX.Element;
};

/** Toggles open. String children render as a Button; otherwise a pressable View. */
export type CollapsibleTriggerProps = {
  children?: string | JSX.Element;
  disabled?: boolean;
  class?: string | null;
  style?: StyleProp<ViewStyle>;
};

type CollapsibleContextValue = OpenState & {
  trigger: TriggerSlot;
};

const CollapsibleContext = context<CollapsibleContextValue | null>(null);

function useCollapsible() {
  const ctx = CollapsibleContext();
  if (!ctx) throw new Error("Collapsible parts must be used within <Collapsible>");
  return ctx;
}

/** Concatenate wrapper + consumer `class` when both are set. */
function mergeClass(base?: string | null, consumer?: string | null): string | undefined {
  if (base && consumer) return `${base} ${consumer}`;
  return consumer ?? base ?? undefined;
}

/** Wrapper defaults, then consumer — consumer wins per key (StyleProp list L→R). */
function mergeStyle(
  base?: StyleProp<ViewStyle> | null,
  consumer?: StyleProp<ViewStyle> | null,
): StyleProp<ViewStyle> | undefined {
  if (base == null && consumer == null) return undefined;
  if (base == null) return consumer ?? undefined;
  if (consumer == null) return base ?? undefined;
  return [base, consumer];
}

/** Region chrome — gap between trigger children and expanding content (nsh `gap-2`). */
function rootChrome(): ViewStyle {
  return {
    gap: 8,
    alignItems: "stretch",
  };
}

function bridgeOpenChange(
  onOpenChange?: (open: boolean) => void,
): ((event: { open: boolean; reason: string }) => void) | undefined {
  if (!onOpenChange) return undefined;
  return (event) => onOpenChange(event.open);
}

function renderBaseCollapsible(props: BaseCollapsibleProps) {
  const {
    class: className,
    style,
    hoverStyle,
    activeStyle,
    focusStyle,
    disabledStyle,
    ...rest
  } = props;

  return (
    <BaseCollapsible
      {...rest}
      class={mergeClass(undefined, className)}
      style={mergeStyle(rootChrome(), style)}
      hoverStyle={mergeStyle(undefined, hoverStyle)}
      activeStyle={mergeStyle(undefined, activeStyle)}
      focusStyle={mergeStyle(undefined, focusStyle)}
      disabledStyle={mergeStyle(undefined, disabledStyle)}
    />
  );
}

export function Collapsible(props: CollapsibleProps) {
  const { open, defaultOpen, content, children, onOpenChange, ...rest } = props;

  // Legacy: single-root with content prop and trigger children.
  if (content != null) {
    return renderBaseCollapsible({
      ...rest,
      open,
      content,
      children,
    });
  }

  const state = createOpenState({
    open,
    defaultOpen,
    onOpenChange: bridgeOpenChange(onOpenChange),
  });
  const triggerSlot = createTriggerSlot();

  return (
    <CollapsibleContext.Provider
      value={{
        ...state,
        trigger: triggerSlot,
      }}
    >
      {children}
    </CollapsibleContext.Provider>
  );
}

export function CollapsibleTrigger(props: CollapsibleTriggerProps) {
  const ctx = useCollapsible();
  const { children, disabled, class: className, style } = props;

  ctx.trigger.set(() => {
    if (typeof children === "string") {
      return (
        <Button disabled={disabled} onPress={() => ctx.setOpen(!ctx.open())}>
          {children}
        </Button>
      );
    }
    return (
      <View
        role="button"
        accessibilityState={{ expanded: ctx.open() }}
        class={mergeClass(undefined, className)}
        onPress={disabled ? undefined : () => ctx.setOpen(!ctx.open())}
        style={mergeStyle({ alignSelf: "flex-start", opacity: disabled ? 0.5 : 1 }, style)}
      >
        {children}
      </View>
    );
  });
  return <View style={{ width: 0, height: 0 }} />;
}

export function CollapsibleContent(props: CollapsibleContentProps) {
  const ctx = useCollapsible();
  const triggerAccessor = ctx.trigger.get();
  const {
    children,
    class: className,
    style,
    hoverStyle,
    activeStyle,
    focusStyle,
    disabledStyle,
    ...rest
  } = props;

  return renderBaseCollapsible({
    ...rest,
    open: ctx.open(),
    content: children ?? <View />,
    class: className,
    style,
    hoverStyle,
    activeStyle,
    focusStyle,
    disabledStyle,
    children: (triggerAccessor?.() as JSX.Element) ?? <View />,
  });
}
