// A trace: the steps an agent took, one line each — a reasoning, a tool call, a source — and a line
// that opens onto what it did. This library's own: drawn on `nsh`'s View and Text (the open and
// close is `nsh/base`'s Collapsible, as `collapsible.tsx`), so there is no port region. Yours to
// change.
import { colors, dimmed, focusRing, font, rounded, shape, terminal } from "@shadcn-nsh/theme";
import { ChevronRight } from "lucide";
import type { JSX, StyleProp, TextProps, TextStyle, ViewProps, ViewStyle } from "nsh";
import { context, platform, reduceMotion, signal, split, Text, View } from "nsh";
import {
  Collapsible as BaseCollapsible,
  type CollapsibleProps as BaseCollapsibleProps,
} from "nsh/base";

import type { CollapsibleOpenChangeReason, CollapsibleProps } from "./collapsible";
import { AsText } from "./lib/as-text";
import { Icon } from "./lib/icons";
import { createOpenState, createSlot, type OpenState, type Slot } from "./lib/open-state";
import { Spinner } from "./spinner";

/** A line's state: `running` spins its icon and pulses its title, `pending` is dimmed, `error` takes the destructive role. */
export type TraceStatus = "running" | "pending" | "error";

/** A color fade that stands still with reduced motion. */
const fade = "transition-colors duration-150 motion-reduce:transition-none";

/** The side of the icon slot, in points: shadcn's `size-4`. */
const ICON = 16;

/** The side of the spinner in the icon slot: a step smaller than the icon's box. */
const SPINNER = 14;

/** A trace's parts as the styles and classes they wear: spread each one onto the part that matches its name. */
export interface TraceLook {
  /** The column (`Trace`). */
  readonly root: ViewStyle;
  /** A line (`TraceLine`): a row as wide as its content, dimmed while `pending`. */
  line(status: TraceStatus | undefined): ViewStyle;
  /** A line's class: the `group` its text follows when the pointer is on a pressable line. */
  readonly lineClass: string;
  /** A pressable line's hover and keyboard focus. */
  readonly focusVisible: ViewStyle;
  /** The icon's box (`TraceIcon`). */
  readonly icon: ViewStyle;
  /** A title's type (`TraceTitle`). */
  readonly title: TextStyle;
  /** A title's color classes: muted, the text color under the pointer, destructive when it failed, pulsing while it runs. */
  titleClass(status: TraceStatus | undefined): string;
  /** A description's type (`TraceDescription`): numbers do not jump as they count. */
  readonly description: TextStyle;
  /** The column of a collapsible line and its content (`TraceCollapsible`). */
  readonly collapsible: ViewStyle;
  /** The pressable row of a collapsible line (`TraceCollapsibleTrigger`): its line, then a chevron. */
  readonly trigger: ViewStyle;
  /** The chevron's turn: along the row, a quarter turn as it opens. */
  chevron(open: boolean): ViewStyle;
  /** The panel (`TraceCollapsibleContent`): under the line, muted. */
  readonly content: ViewStyle;
  /** The type of a string child of the panel. */
  readonly contentText: TextStyle;
}

/**
 * A trace's look, after shadcn/ui's: lines of the theme's `body` type in the muted ink, a gap of
 * 8 points between icon, title and description; a pressable line takes the text color under the
 * pointer and the theme's focus ring with the keyboard on it; `error` is destructive, `pending`
 * at 60 % opacity.
 */
export function traceLook(): TraceLook {
  return {
    get root(): ViewStyle {
      return { flexDirection: "column", alignItems: "stretch", minWidth: 0, width: "100%" };
    },
    line: (status) => ({
      flexDirection: "row",
      alignItems: "center",
      alignSelf: "flex-start",
      columnGap: 8,
      minWidth: 0,
      maxWidth: "100%",
      minHeight: platform.desktop ? 28 : 36,
      opacity: status === "pending" ? 0.6 : 1,
    }),
    get lineClass(): string {
      return `group ${fade}`;
    },
    get focusVisible(): ViewStyle {
      return focusRing(2);
    },
    get icon(): ViewStyle {
      return {
        width: terminal ? undefined : ICON,
        height: terminal ? undefined : ICON,
        flexShrink: 0,
        alignItems: "center",
        justifyContent: "center",
        pointerEvents: "none",
      };
    },
    get title(): TextStyle {
      return {
        flexShrink: 1,
        minWidth: 0,
        fontSize: font.size("body"),
        lineHeight: font.line("body"),
        fontWeight: font.weight("body"),
        numberOfLines: 1,
      };
    },
    titleClass: (status) =>
      [
        status === "error"
          ? "text-destructive"
          : "text-muted-foreground group-hover:text-foreground",
        fade,
        status === "running" ? "animate-pulse motion-reduce:animate-none" : "",
      ]
        .filter(Boolean)
        .join(" "),
    get description(): TextStyle {
      return {
        flexShrink: 0,
        fontSize: font.size("body"),
        lineHeight: font.line("body"),
        fontWeight: font.weight("body"),
        fontVariant: ["tabular-nums"],
        color: colors.faint,
      };
    },
    get collapsible(): ViewStyle {
      return { flexDirection: "column", alignItems: "stretch", minWidth: 0, width: "100%" };
    },
    get trigger(): ViewStyle {
      return {
        flexDirection: "row",
        alignItems: "center",
        alignSelf: "flex-start",
        columnGap: 8,
        minWidth: 0,
        maxWidth: "100%",
        ...rounded(shape.control),
      };
    },
    chevron: (open) => ({
      transform: open ? "rotate(90deg)" : "rotate(0deg)",
      transitionProperty: "transform",
      transitionDuration: reduceMotion() ? 0 : 150,
      transitionTimingFunction: "ease-out",
    }),
    get content(): ViewStyle {
      return { flexDirection: "column", alignItems: "stretch", minWidth: 0, paddingTop: 4 };
    },
    get contentText(): TextStyle {
      return {
        userSelect: "text",
        fontSize: font.size("body"),
        lineHeight: font.line("body"),
        fontWeight: font.weight("body"),
        color: colors.mutedForeground,
      };
    },
  };
}

/** What the parts of a line read from it. */
interface TraceLineState {
  readonly status: TraceStatus | undefined;
}

const TraceLineContext = context<TraceLineState>({ status: undefined });

/** What a collapsible line's parts share: the open state, the trigger's slot, and the status its line reports. */
type TraceCollapsibleState = OpenState & {
  trigger: Slot<JSX.Element>;
  status: { (): TraceStatus | undefined; set(next: TraceStatus | undefined): void };
};

const TraceCollapsibleContext = context<TraceCollapsibleState | null>(null);

/** The column the steps stand in. */
export type TraceProps = ViewProps;

/**
 * A trace, after shadcn/ui's: a column of lines — `TraceLine`s, or `TraceCollapsible`s for the
 * ones that open onto what they did. Lines are as wide as their content.
 */
export function Trace(props: TraceProps) {
  const [, rest] = split(props, ["style"]);
  return (
    <View {...rest} style={[traceLook().root, props.style ?? null]}>
      {props.children}
    </View>
  );
}

/** One step of a trace. */
export type TraceLineProps = ViewProps & {
  /** `running` spins the icon and pulses the title, `pending` dims the line, `error` takes the destructive role. Default none: a step that is done. */
  status?: TraceStatus;
  /** A line that is not a `TraceCollapsibleTrigger` becomes a pressable with this. */
  onPress?: () => void;
  hoverStyle?: StyleProp<ViewStyle>;
  accessibilityLabel?: string | null;
};

/**
 * One step: a `TraceIcon`, a `TraceTitle` and a `TraceDescription`, in a row. Inside a
 * `TraceCollapsibleTrigger` the trigger presses; with `onPress` the line itself does, and takes
 * the text color under the pointer.
 */
export function TraceLine(props: TraceLineProps) {
  const [, rest] = split(props, ["status", "onPress", "style", "accessibilityLabel"]);
  const collapsible = TraceCollapsibleContext();
  // The trigger's chevron follows the line's state.
  if (collapsible) collapsible.status.set(props.status);
  const state: TraceLineState = {
    get status() {
      return props.status;
    },
  };
  const press = () => props.onPress;
  return (
    <TraceLineContext.Provider value={state}>
      <View
        {...rest}
        accessible={props.onPress ? true : undefined}
        role={props.onPress ? "button" : undefined}
        accessibilityLabel={props.accessibilityLabel ?? undefined}
        accessibilityState={props.status === "running" ? { busy: true } : undefined}
        class={traceLook().lineClass}
        onPress={press()}
        style={[traceLook().line(props.status), props.style ?? null]}
        focusVisibleStyle={props.onPress ? traceLook().focusVisible : undefined}
      >
        {props.children}
      </View>
    </TraceLineContext.Provider>
  );
}

/** The icon slot of a line. */
export type TraceIconProps = ViewProps;

/**
 * The icon slot of a line: its children, 16 points square — an `Icon` tinted in the muted ink
 * (`destructive` for an `error` line). While the line is `running` it shows a `Spinner` instead.
 */
export function TraceIcon(props: TraceIconProps) {
  const [, rest] = split(props, ["style"]);
  const line = TraceLineContext();
  return (
    <View {...rest} style={[traceLook().icon, props.style ?? null]}>
      {line.status === "running" ? (
        <Spinner size={SPINNER} tint={colors.mutedForeground} />
      ) : (
        props.children
      )}
    </View>
  );
}

/** What a line says it is doing or did. */
export type TraceTitleProps = TextProps;

/** What a line says it is doing or did: one line, cut with an ellipsis; it pulses while the line is `running`. */
export function TraceTitle(props: TraceTitleProps) {
  const [, rest] = split(props, ["style", "class"]);
  const line = TraceLineContext();
  return (
    <Text
      {...rest}
      class={
        props.class
          ? `${traceLook().titleClass(line.status)} ${props.class}`
          : traceLook().titleClass(line.status)
      }
      style={[traceLook().title, props.style ?? null]}
    >
      {props.children}
    </Text>
  );
}

/** A quieter note after the title: a duration, a count. */
export type TraceDescriptionProps = TextProps;

/** A quieter note after the title (`3 s`, `4 results`): it keeps its width, and its digits do not jump as they count. */
export function TraceDescription(props: TraceDescriptionProps) {
  const [, rest] = split(props, ["style"]);
  return (
    <Text {...rest} style={[traceLook().description, props.style ?? null]}>
      {props.children}
    </Text>
  );
}

/** The column of a line that opens onto its content. */
export type TraceCollapsibleProps = CollapsibleProps;

/**
 * A line and the content it opens onto: owns whether it is open (`open` with `onOpenChange`, or
 * `defaultOpen`). Put a `TraceCollapsibleTrigger` with the `TraceLine` first and a
 * `TraceCollapsibleContent` after it. The same contract as [`Collapsible`](./collapsible), on a
 * trigger of a line's look.
 */
export function TraceCollapsible(props: TraceCollapsibleProps) {
  const state = createOpenState<CollapsibleOpenChangeReason>(props);
  const status = signal<TraceStatus | undefined>(undefined);
  const value: TraceCollapsibleState = {
    ...state,
    trigger: createSlot<JSX.Element>(),
    status: Object.assign(() => status(), {
      set: (next: TraceStatus | undefined) => status.set(next),
    }),
  };
  return (
    <TraceCollapsibleContext.Provider value={value}>
      <View style={traceLook().collapsible}>{props.children}</View>
    </TraceCollapsibleContext.Provider>
  );
}

/** The row that opens a collapsible line. */
export type TraceCollapsibleTriggerProps = {
  /** A `TraceLine`; the trigger adds the chevron after it. */
  children?: JSX.Element;
  disabled?: boolean;
  class?: string | null;
  style?: StyleProp<ViewStyle>;
  hoverStyle?: StyleProp<ViewStyle>;
  activeStyle?: StyleProp<ViewStyle>;
  focusVisibleStyle?: StyleProp<ViewStyle>;
  disabledStyle?: StyleProp<ViewStyle>;
  accessibilityLabel?: string | null;
};

/** Opens and closes the content: a pressable row of its line and a trailing chevron that turns as it opens. */
export function TraceCollapsibleTrigger(props: TraceCollapsibleTriggerProps) {
  const ctx = TraceCollapsibleContext();
  if (!ctx) throw new Error("TraceCollapsibleTrigger must be used within <TraceCollapsible>");
  const disabled = Boolean(props.disabled);
  // Built once and handed to the content, which places it (as `CollapsibleTrigger` does).
  ctx.trigger.set(
    <View
      accessible
      role="button"
      accessibilityLabel={props.accessibilityLabel ?? undefined}
      accessibilityState={{ expanded: ctx.open(), disabled }}
      class={props.class ? `${traceLook().lineClass} ${props.class}` : traceLook().lineClass}
      onPress={disabled ? undefined : () => ctx.setOpen(!ctx.open())}
      style={[traceLook().trigger, props.style ?? null]}
      hoverStyle={props.hoverStyle}
      activeStyle={props.activeStyle}
      focusVisibleStyle={[traceLook().focusVisible, props.focusVisibleStyle ?? null]}
      disabledStyle={[{ opacity: dimmed.disabled }, props.disabledStyle ?? null]}
    >
      {props.children}
      <View style={[traceLook().icon, traceLook().chevron(ctx.open())]}>
        {terminal ? (
          <Text style={{ color: colors.mutedForeground }}>›</Text>
        ) : (
          <Icon
            icon={ChevronRight}
            size={ICON}
            tint={ctx.status() === "error" ? colors.destructive : colors.mutedForeground}
          />
        )}
      </View>
    </View>,
  );
  return null;
}

/** What a line opened onto. */
export type TraceCollapsibleContentProps = Omit<
  BaseCollapsibleProps,
  "open" | "content" | "children"
> & {
  /** A string is drawn as muted text; anything else as given. */
  children?: string | JSX.Element;
};

/** The panel under the line: it grows open and shut with the line. A string child is muted text. */
export function TraceCollapsibleContent(props: TraceCollapsibleContentProps) {
  const ctx = TraceCollapsibleContext();
  if (!ctx) throw new Error("TraceCollapsibleContent must be used within <TraceCollapsible>");
  const [, rest] = split(props, ["style", "children", "reveal"]);
  return (
    <BaseCollapsible
      {...rest}
      open={ctx.open()}
      reveal={props.reveal ?? true}
      style={[{ alignItems: "stretch" }, props.style ?? null]}
      content={
        <View style={traceLook().content}>
          <AsText style={traceLook().contentText}>{props.children}</AsText>
        </View>
      }
    >
      {ctx.trigger.get() ?? <View />}
    </BaseCollapsible>
  );
}
