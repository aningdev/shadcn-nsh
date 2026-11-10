// Source: examples/nsh-gallery-ui/look/disclosure.tsx @ 64ab8a1d (baseline), see NOTICE.
import { colors, disabledOpacity, focusRing } from "@shadcn-nsh/theme";
import type { JSX, StyleProp, ViewStyle } from "nsh";
import { computed, split, Text, View } from "nsh";
import {
  Accordion as BaseAccordion,
  AccordionHeader as BaseAccordionHeader,
  AccordionItem as BaseAccordionItem,
  AccordionPanel as BaseAccordionPanel,
  AccordionTrigger as BaseAccordionTrigger,
  type AccordionHeaderProps as BaseAccordionHeaderProps,
  type AccordionItemProps as BaseAccordionItemProps,
  type AccordionPanelProps as BaseAccordionPanelProps,
  type AccordionProps as BaseAccordionProps,
  type AccordionTriggerProps as BaseAccordionTriggerProps,
} from "nsh/base";

import { isPointer } from "./lib/density";
import { pressSink } from "./lib/press";

/** Theme layer on `nsh/base` Accordion. Every base prop passes through. */
export type AccordionProps = BaseAccordionProps;

/** One section. A hairline separates it from the next. */
export type AccordionItemProps = BaseAccordionItemProps;

/** The heading around {@link AccordionTrigger}. Base props pass through. */
export type AccordionHeaderProps = BaseAccordionHeaderProps;

/**
 * What expands the item. String children are the title; a trailing chevron is
 * always drawn (it turns with `group-aria-expanded` on this trigger).
 */
export type AccordionTriggerProps = Omit<BaseAccordionTriggerProps, "children"> & {
  children?: string | JSX.Element;
};

/**
 * The item's content. `reveal` defaults on (base defaults off). Padding sits
 * on an inner view: a revealed panel is zero-high while closed.
 */
export type AccordionPanelProps = BaseAccordionPanelProps;

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

/** Concatenate wrapper + consumer `class` when both are set. */
function mergeClass(base: string, consumer?: string | null): string {
  return consumer ? `${base} ${consumer}` : base;
}

/** Row metrics from gallery `listRow`. Hover is `colors.accent` (shadcn accent and the gallery list fill). */
function rowChrome() {
  const pointer = isPointer();
  const minHeight = pointer ? 40 : 44;
  const sink = pressSink(0.97, "background-color");
  return {
    icon: pointer ? 12 : 16,
    row: {
      minHeight,
      alignSelf: "stretch",
      flexDirection: "row",
      alignItems: "center",
      gap: pointer ? 10 : 12,
      paddingVertical: pointer ? 6 : 8,
      paddingHorizontal: 8,
      borderRadius: 8,
      ...sink.transition,
    } satisfies ViewStyle,
    hover: { backgroundColor: colors.accent } satisfies ViewStyle,
    active: sink.activeStyle,
    focus: focusRing(),
    disabled: { opacity: disabledOpacity() } satisfies ViewStyle,
    label: {
      flexGrow: 1,
      flexShrink: 1,
      fontSize: 14,
      fontWeight: "500" as const,
      color: colors.foreground,
    },
  };
}

/** Content under a trigger. Padding is the content's, so it collapses with the panel. */
function panelChrome(): ViewStyle {
  return { paddingBottom: isPointer() ? 12 : 14, gap: 6 };
}

/** Points down; `group-aria-expanded` on the trigger turns it up. */
function AccordionChevron(props: { size: number }) {
  const mark = props.size * 0.42;
  return (
    <View
      class="transition-transform duration-200 group-aria-expanded:rotate-180 motion-reduce:transition-none"
      style={{
        width: props.size,
        height: props.size,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <View
        style={{
          width: mark,
          height: mark,
          marginTop: -mark * 0.3,
          borderRightWidth: 1.5,
          borderBottomWidth: 1.5,
          borderColor: colors.mutedForeground,
          transform: [{ rotate: "45deg" }],
        }}
      />
    </View>
  );
}

/** The stack. Look lives on the items and triggers. */
export function Accordion(props: AccordionProps) {
  return <BaseAccordion {...props} />;
}

/** One section, with a bottom hairline. */
export function AccordionItem(props: AccordionItemProps) {
  const [, rest] = split(props, ["style"]);
  return (
    <BaseAccordionItem
      {...rest}
      style={mergeStyle(
        { alignSelf: "stretch", borderBottomWidth: 1, borderBottomColor: colors.border },
        props.style,
      )}
    />
  );
}

/** The heading. Level and the rest pass through. */
export function AccordionHeader(props: AccordionHeaderProps) {
  return <BaseAccordionHeader {...props} />;
}

/** Title and a chevron that turns as the item opens. */
export function AccordionTrigger(props: AccordionTriggerProps) {
  const [, rest] = split(props, [
    "children",
    "class",
    "style",
    "hoverStyle",
    "activeStyle",
    "focusStyle",
    "disabledStyle",
    "accessibilityLabel",
  ]);
  const chrome = computed(() => rowChrome());
  const title = () => {
    const children = props.children;
    if (typeof children === "string") return <Text style={chrome().label}>{children}</Text>;
    return <View style={{ flexGrow: 1, flexShrink: 1 }}>{children}</View>;
  };

  return (
    <BaseAccordionTrigger
      {...rest}
      class={mergeClass("group", props.class)}
      accessibilityLabel={
        props.accessibilityLabel !== undefined
          ? props.accessibilityLabel
          : typeof props.children === "string"
            ? props.children
            : undefined
      }
      style={mergeStyle(chrome().row, props.style)}
      hoverStyle={mergeStyle(chrome().hover, props.hoverStyle)}
      activeStyle={mergeStyle(chrome().active, props.activeStyle)}
      focusStyle={mergeStyle(chrome().focus, props.focusStyle)}
      disabledStyle={mergeStyle(chrome().disabled, props.disabledStyle)}
    >
      <View
        style={{ flexDirection: "row", alignItems: "center", flexGrow: 1, gap: chrome().row.gap }}
      >
        {title()}
        <AccordionChevron size={chrome().icon} />
      </View>
    </BaseAccordionTrigger>
  );
}

/** The open section. `reveal` defaults on; padding is inside the revealed view. */
export function AccordionPanel(props: AccordionPanelProps) {
  const [, rest] = split(props, ["style", "children", "reveal"]);
  return (
    <BaseAccordionPanel {...rest} reveal={props.reveal ?? true} style={props.style}>
      <View style={panelChrome()}>{props.children}</View>
    </BaseAccordionPanel>
  );
}
