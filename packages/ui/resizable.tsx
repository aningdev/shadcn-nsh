// Source: examples/nsh-gallery-ui/look/workspace.tsx @ 64ab8a1d (baseline), see NOTICE.
import { colors, focusRing } from "@shadcn-nsh/theme";
import type { StyleProp, ViewStyle } from "nsh";
import { computed, split } from "nsh";
import {
  ResizablePanel as BasePanel,
  ResizablePanelGroup as BaseGroup,
  type Axis,
  type ResizablePanelGroupProps as BaseGroupProps,
  type ResizablePanelProps as BasePanelProps,
} from "nsh/base";

/**
 * Theme layer on `nsh/base` ResizablePanelGroup. Handles are the group's:
 * this package paints the hairline and the thumb, it does not add a Handle part.
 */
export type ResizablePanelGroupProps = BaseGroupProps;

/** Theme layer on `nsh/base` ResizablePanel. The group owns the size along the axis. */
export type ResizablePanelProps = BasePanelProps;

/**
 * Live handle classes plus the grips a still shot can show.
 * Hover, drag and focus are the thumb the classes reveal; base has no per-state style prop.
 */
export type ResizableChrome = {
  /** Hairline on the boundary. Color stays on the class so `group-hover:` / `group-active:` can recolor it. */
  handleClass: string;
  /** Grip centered on that line. Same view across states, so the class can transition. */
  handleThumbClass: string;
  /** Panel surface. Muted stands in for the reference inset. */
  panel: ViewStyle;
  /** The 1-point line, for a sample. A fixed mark, not a text box. */
  line: ViewStyle;
  /** Thumb as hovered: short, faint. */
  hover: ViewStyle;
  /** Thumb while pressed or dragged: long, solid. */
  drag: ViewStyle;
  /** Thumb with the keyboard focus ring. */
  focus: ViewStyle;
};

/** Wrapper defaults, then consumer — consumer wins per key. */
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

/**
 * The reference thumb: hidden at rest, a short faint pill under the pointer,
 * a long solid one while pressed or dragged. `duration-150` is the reference
 * class. `group-focus:` covers the keyboard; base exposes no focus style.
 * A drag is a scale, so `motion-reduce` drops the transition.
 */
const THUMB =
  "h-11 w-[3px] rounded-full bg-muted-foreground opacity-0 scale-y-0 transition duration-150 ease-out motion-reduce:transition-none group-hover:opacity-40 group-hover:scale-y-[0.45] group-active:opacity-90 group-active:scale-y-100 group-focus:opacity-90 group-focus:scale-y-100";

/**
 * Hairline across a horizontal group, along a vertical one.
 * The 3×20 and 3×44 grips are the reference thumb's fixed mark, not a text box.
 */
function look(axis: Axis): ResizableChrome {
  const across = axis !== "vertical";
  const line = across ? "h-full w-px bg-border" : "h-px w-full bg-border";
  const grip = {
    width: 3,
    borderRadius: 999,
    backgroundColor: colors.mutedForeground,
  };
  return {
    handleClass: `${line} group-hover:bg-ring group-active:bg-primary group-focus:bg-ring`,
    handleThumbClass: THUMB,
    panel: {
      backgroundColor: colors.muted,
      padding: 8,
      overflow: "hidden",
    },
    line: across
      ? { width: 1, alignSelf: "stretch", backgroundColor: colors.border }
      : { height: 1, alignSelf: "stretch", backgroundColor: colors.border },
    hover: { ...grip, height: 20, opacity: 0.4 },
    drag: { ...grip, height: 44, opacity: 0.9 },
    focus: { ...grip, height: 44, opacity: 0.9, ...focusRing() },
  };
}

/** Handle and panel chrome for `axis` (default horizontal). Call it where the theme is read. */
export function resizableVariants(options?: {
  /** The group's axis. Default horizontal. */
  axis?: Axis | null;
}): ResizableChrome {
  return look(options?.axis ?? "horizontal");
}

/** Panels in a row or a column. Dragging a handle is the base's; this only paints it. */
export function ResizablePanelGroup(props: ResizablePanelGroupProps) {
  const [, rest] = split(props, [
    "class",
    "style",
    "handleClass",
    "handleStyle",
    "handleThumbClass",
    "handleThumbStyle",
    "handleAccessibilityLabel",
  ]);
  const chrome = computed(() => resizableVariants({ axis: props.axis ?? "horizontal" }));
  return (
    <BaseGroup
      {...rest}
      handleAccessibilityLabel={props.handleAccessibilityLabel ?? "Resize"}
      class={props.class}
      style={props.style}
      handleClass={mergeClass(chrome().handleClass, props.handleClass)}
      handleStyle={props.handleStyle}
      handleThumbClass={mergeClass(chrome().handleThumbClass, props.handleThumbClass)}
      handleThumbStyle={props.handleThumbStyle}
    />
  );
}

/** One panel. `visible={false}` is the collapsed state: it takes no space. */
export function ResizablePanel(props: ResizablePanelProps) {
  const [, rest] = split(props, ["class", "style"]);
  const chrome = computed(() => resizableVariants({ axis: "horizontal" }).panel);
  return <BasePanel {...rest} class={props.class} style={mergeStyle(chrome(), props.style)} />;
}
