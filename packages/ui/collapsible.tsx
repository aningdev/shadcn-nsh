// Source: examples/nsh-gallery-ui/look/disclosure.tsx @ 64ab8a1d (baseline), see NOTICE.
import { colors, disabledOpacity, focusRing } from "@shadcn-nsh/theme";
import type { JSX, StyleProp, ViewStyle } from "nsh";
import { context, split, Text, View } from "nsh";
import {
  Collapsible as BaseCollapsible,
  type CollapsibleProps as BaseCollapsibleProps,
} from "nsh/base";

import { isPointer } from "./lib/density";
import { createOpenState, createSlot, type OpenState, type Slot } from "./lib/open-state";
import { pressSink } from "./lib/press";

/**
 * Composition root for `nsh/base` Collapsible: open state + trigger slot.
 * Base has no open events; `defaultOpen` / `onOpenChange` are composition-only.
 */
export type CollapsibleProps = {
  open?: boolean | null;
  /** Uncontrolled initial open (composition — not on base). */
  defaultOpen?: boolean;
  children?: JSX.Element;
  /** Open change (composition-only). */
  onOpenChange?: (event: { open: boolean }) => void;
};

/**
 * Theme layer on `nsh/base` Collapsible as shadcn `CollapsibleContent`.
 * `children` become base `content`. `reveal` defaults on.
 */
export type CollapsibleContentProps = Omit<
  BaseCollapsibleProps,
  "open" | "content" | "children"
> & {
  children?: JSX.Element;
};

/**
 * Toggles open. A disclosure row (`role="button"`), not a Button — popup
 * buttons are a different recipe. String children are the title; the chevron
 * is always drawn at the trailing edge.
 */
export type CollapsibleTriggerProps = {
  children?: string | JSX.Element;
  disabled?: boolean;
  class?: string | null;
  style?: StyleProp<ViewStyle>;
  hoverStyle?: StyleProp<ViewStyle>;
  activeStyle?: StyleProp<ViewStyle>;
  focusStyle?: StyleProp<ViewStyle>;
  disabledStyle?: StyleProp<ViewStyle>;
  accessibilityLabel?: string | null;
};

type CollapsibleContextValue = OpenState & {
  trigger: Slot;
};

const CollapsibleContext = context<CollapsibleContextValue | null>(null);

function useCollapsible() {
  const ctx = CollapsibleContext();
  if (!ctx) throw new Error("Collapsible parts must be used within <Collapsible>");
  return ctx;
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

/** Row metrics from gallery `listRow`. */
function rowChrome() {
  const pointer = isPointer();
  const sink = pressSink(0.97, "background-color");
  return {
    icon: pointer ? 12 : 16,
    row: {
      flexDirection: "row",
      alignItems: "center",
      alignSelf: "stretch",
      minHeight: pointer ? 40 : 44,
      gap: pointer ? 10 : 12,
      paddingVertical: pointer ? 6 : 8,
      paddingHorizontal: 8,
      borderRadius: 8,
      ...sink.transition,
    } satisfies ViewStyle,
    hover: { backgroundColor: colors.accent } satisfies ViewStyle,
    active: sink.activeStyle,
    focus: focusRing(),
    label: {
      flexGrow: 1,
      flexShrink: 1,
      fontSize: 14,
      fontWeight: "500" as const,
      color: colors.foreground,
    },
  };
}

/** Content under the trigger. Padding is the content's, so it collapses while closed. */
function panelChrome(): ViewStyle {
  return { paddingBottom: isPointer() ? 12 : 14, gap: 6 };
}

/**
 * Points along the row, in a lane as wide as its stroke (half the icon), and
 * turns down while open.
 */
function CollapsibleChevron(props: { open: boolean; size: number }) {
  const mark = props.size * 0.42;
  return (
    <View
      class="transition-transform duration-150 motion-reduce:transition-none"
      style={{
        width: props.size / 2,
        height: props.size,
        alignItems: "center",
        justifyContent: "center",
        rotate: props.open ? "90deg" : "0deg",
      }}
    >
      <View
        style={{
          width: mark,
          height: mark,
          borderTopWidth: 1.5,
          borderRightWidth: 1.5,
          borderColor: colors.mutedForeground,
          transform: [{ rotate: "45deg" }],
        }}
      />
    </View>
  );
}

/** Composition root: owns the open state the parts below read. `props` is the options bag. */
export function Collapsible(props: CollapsibleProps) {
  const state = createOpenState(props);
  const trigger = createSlot();
  return (
    <CollapsibleContext.Provider value={{ ...state, trigger }}>
      {props.children}
    </CollapsibleContext.Provider>
  );
}

/** Registers the row. Rendered later by {@link CollapsibleContent}, as the base trigger child. */
export function CollapsibleTrigger(props: CollapsibleTriggerProps) {
  const ctx = useCollapsible();
  ctx.trigger.set(() => {
    const chrome = rowChrome();
    const children = props.children;
    const disabled = !!props.disabled;
    return (
      <View
        role="button"
        accessibilityLabel={
          props.accessibilityLabel != null
            ? props.accessibilityLabel
            : typeof children === "string"
              ? children
              : undefined
        }
        accessibilityState={{ expanded: ctx.open(), disabled }}
        class={props.class ?? undefined}
        onPress={disabled ? undefined : () => ctx.setOpen(!ctx.open())}
        style={mergeStyle(
          { ...chrome.row, ...(disabled ? { opacity: disabledOpacity() } : null) },
          props.style,
        )}
        hoverStyle={mergeStyle(disabled ? null : chrome.hover, props.hoverStyle)}
        activeStyle={mergeStyle(chrome.active, props.activeStyle)}
        focusStyle={mergeStyle(chrome.focus, props.focusStyle)}
        disabledStyle={mergeStyle({ opacity: disabledOpacity() }, props.disabledStyle)}
      >
        {typeof children === "string" ? (
          <Text style={chrome.label}>{children}</Text>
        ) : (
          <View style={{ flexGrow: 1, flexShrink: 1 }}>{children}</View>
        )}
        <CollapsibleChevron open={ctx.open()} size={chrome.icon} />
      </View>
    );
  });
  return <View style={{ width: 0, height: 0 }} />;
}

/** The region. `reveal` defaults on; the trigger registered above is the child. */
export function CollapsibleContent(props: CollapsibleContentProps) {
  const ctx = useCollapsible();
  const trigger = ctx.trigger.get();
  const [, rest] = split(props, ["style", "children", "reveal"]);
  return (
    <BaseCollapsible
      {...rest}
      open={ctx.open()}
      reveal={props.reveal ?? true}
      style={mergeStyle({ alignItems: "stretch" }, props.style)}
      content={<View style={panelChrome()}>{props.children}</View>}
    >
      {(trigger?.() as JSX.Element) ?? <View />}
    </BaseCollapsible>
  );
}
