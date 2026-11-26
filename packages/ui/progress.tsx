// A progress: the look (`progressLook` and its companions) and the `Progress` that wears it.
// Derived from NSH examples/nsh-gallery-ui (Apache-2.0, © Longbridge); modified. See NOTICE.

import {
  animate,
  colors,
  control,
  fillStyle,
  follow,
  motion,
  stroke,
  type Tone,
  toneColor,
} from "@shadcn-nsh/theme";
import type { AnimatedValue, JSX, TextStyle, ViewProps, ViewStyle } from "nsh";
import {
  cleanup,
  context,
  createAnimatedValue,
  Easing,
  effect,
  reduceMotion,
  signal,
  split,
  Text,
  View,
} from "nsh";
import { Progress as BaseProgress, type ProgressProps as BaseProgressProps } from "nsh/base";

import { CheckboxMark } from "./checkbox";
import { controlSize } from "./lib/surface";
import { joinClass, type Live, read } from "./lib/utils";

/**
 * A determinate fill's classes: the whole track's width, slid back by what
 * is left to do (`progressRemaining`), so a new value glides there on
 * gpui-kit's 180 ms `easing_move` curve (and a new tone fades in); the track
 * clips it. At once with reduced motion.
 */
export const progressGlide =
  "w-full transition duration-180 ease-[cubic-bezier(0.2,0,0,1)] motion-reduce:transition-none";

/** A determinate fill's `translate` for `value` percent (0 to 100). */
export const progressRemaining = (value: number) => `${Math.max(0, Math.min(100, value)) - 100}% 0`;

/** The `progress` recipe's rail height (points), unless a caller states one. */
const progressHeight = (): number => control("progress").height;

/** A bar's rail, `height` points tall (default the `progress` recipe's height): the groove the theme
 * states — its face, its edge and its shade — so the recipe settles the rail's look instead of a
 * per-theme table. */
export function progressRail(height?: number): ViewStyle {
  const h = height ?? progressHeight();
  const pr = control("progress");
  return {
    height: h,
    borderRadius: h / 2,
    overflow: "hidden",
    backgroundColor: pr.grooveColor,
    ...(pr.grooveShadow === undefined ? {} : { boxShadow: pr.grooveShadow }),
  };
}

/** A bar's fill, `height` points tall (default the theme's `progress.height` slot): the `fill`
 * finish's gradient (the run a slider's range draws too), or a tone's color (`up` for done,
 * `warn`, `destructive`; `accent` is the run). Neither has an edge, so a tone's bar and the run
 * read as one kind of bar. */
export function progressFill(height?: number, tone?: Tone): ViewStyle {
  const h = height ?? progressHeight();
  const fill = tone && tone !== "accent" ? { backgroundColor: toneColor(tone) } : fillStyle();
  return { height: h, borderRadius: h / 2, ...fill };
}

/** Where a limit stands on a bar `value` percent along it (0 to 100): a 2-point hairline in the
 * page's ink, standing past a `height`-point rail on both sides. The rail clips its fill, so the
 * hairline is a view of its own on the bar's frame: the rail comes first in the bar's row, a
 * label after it. */
export function progressMarker(value: number, height?: number): ViewStyle {
  const h = height ?? progressHeight();
  return {
    position: "absolute",
    // physical: the fill is a full-width bar slid by a translate, which keeps the physical left; the
    // marker reads against that fill rather than the reading direction.
    left: `${Math.max(0, Math.min(100, value))}%`,
    top: -4,
    width: 2,
    height: h + 6,
    borderRadius: 1,
    backgroundColor: colors.foreground,
  };
}

/** An indeterminate bar's sweep (`progressSweep()`), for `progressLook`'s `sweep`. */
export interface ProgressSweep {
  /** Spread on the `Progress` (its `onLayout`): its width is the track's,
   * so keep its padding on a view around it. */
  onLayout: (event: { bounds: { size: { width: number } } }) => void;
  /** Where the sweep is, 0 to 1, times `travel`. */
  readonly sweep: AnimatedValue;
  /** Two thirds of the track: how far the third that sweeps crosses. */
  readonly travel: AnimatedValue;
}

/**
 * The sweep of indeterminate bars: a third of the track crossing it and
 * back every 800 ms, eased in and out, looped natively, so no JS runs per
 * crossing; it rests in the middle with reduced motion. Make one in a
 * component (it stops with it) and pass it to the `progressLook` of every
 * bar that may be indeterminate; spread its `onLayout` on one of them.
 */
export function progressSweep(): ProgressSweep {
  const sweep = createAnimatedValue(0);
  const travel = createAnimatedValue(0);
  effect(() => {
    if (reduceMotion()) sweep.set(0.5);
    else
      sweep.keyframes([0, 1], {
        duration: 800,
        // CSS's `ease-in-out`.
        easing: Easing.bezier(0.42, 0, 0.58, 1),
        iterations: "infinite",
        direction: "alternate",
      });
  });
  cleanup(() => void sweep.stop());
  return {
    onLayout: ({ bounds }) => travel.set((bounds.size.width * 2) / 3),
    sweep,
    travel,
  };
}

/** Options of `progressLook`. */
export interface ProgressLookOptions {
  /** The rail's and the fill's height, default the `track` recipe's progress height (6, 4 or 3). */
  height?: number;
  /** The fill's tone: the citrus run by default, `up` once done. */
  tone?: Live<Tone | undefined>;
  /** The bar has no value yet (pass the same to the `Progress`'s `indeterminate`). */
  indeterminate?: Live<boolean | undefined>;
  /** The sweep an indeterminate bar's third follows. */
  sweep?: ProgressSweep;
}

/**
 * A `Progress`'s parts (spread them: `<Progress value={v()} {...progressLook(() => v())}>`):
 * the rail (`progressRail`), and a fill (`progressFill`) that glides to each
 * new value (`progressGlide`), or, indeterminate, a third of the track
 * following `sweep`.
 */
export function progressLook(value: Live<number>, o?: ProgressLookOptions) {
  const height = () => o?.height ?? progressHeight();
  const indeterminate = () => !!read(o?.indeterminate);
  return {
    get trackStyle(): ViewStyle {
      return progressRail(height());
    },
    get indicatorClass(): string {
      return indeterminate() ? "w-1/3" : progressGlide;
    },
    get indicatorStyle(): ViewStyle {
      const fill = progressFill(height(), read(o?.tone));
      if (!indeterminate()) return { ...fill, translate: progressRemaining(read(value) ?? 0) };
      return o?.sweep
        ? { ...fill, transform: [{ translateX: o.sweep.sweep.mul(o.sweep.travel) }] }
        : { ...fill, translate: "100% 0" };
    },
  };
}

/**
 * `nsh/base`'s Progress with `progressLook`. Every base prop passes through; track / indicator
 * styles go over the look's.
 */
export type ProgressProps = BaseProgressProps & {
  /** Rail and fill height (default the `track` recipe's progress height: 6, 4 or 3). */
  height?: number;
  /** Fill tone; default citrus run. A function is read where the fill is drawn. */
  tone?: Live<Tone>;
  /** Shared sweep for indeterminate bars. */
  sweep?: ProgressSweep;
  /** Where a limit stands, `value` percent along the bar (0 to 100, clamped): a hairline crossing
   * the rail and standing past it (`progressMarker`). It sits on the bar's frame, so the rail comes
   * first in the bar's row and a label after it (`children`); left out, there is no marker. */
  marker?: number;
};

/** A progress bar on the shared rail: a track, a fill, and where a limit stands. */
export function Progress(props: ProgressProps) {
  const [, rest] = split(props, [
    "height",
    "tone",
    "sweep",
    "value",
    "indeterminate",
    "trackStyle",
    "indicatorClass",
    "indicatorStyle",
    "onLayout",
    "marker",
    "children",
  ]);
  const look = progressLook(() => props.value ?? 0, {
    height: props.height,
    tone: () => read(props.tone),
    indeterminate: () => props.indeterminate,
    sweep: props.sweep,
  });
  return (
    <ProgressContext.Provider value={{ height: () => props.height ?? progressHeight() }}>
      <BaseProgress
        {...rest}
        value={props.value}
        indeterminate={props.indeterminate}
        onLayout={props.onLayout ?? props.sweep?.onLayout}
        trackStyle={[look.trackStyle, props.trackStyle ?? null]}
        indicatorClass={props.indicatorClass ?? look.indicatorClass}
        indicatorStyle={[look.indicatorStyle, props.indicatorStyle ?? null]}
      >
        <If when={props.marker !== undefined}>
          <View style={progressMarker(props.marker ?? 0, props.height)} />
        </If>
        {props.children}
      </BaseProgress>
    </ProgressContext.Provider>
  );
}

/** What the steps under a `Progress` read: the bar's height, to centre the marks on it. */
const ProgressStepsContext = context<{ join: () => number; count: () => number } | null>(null);
const ProgressContext = context<{ height: () => number } | null>(null);

/** Where a step stands: `done` (a check), `current` (a ring with a dot), `upcoming` (empty). */
export type ProgressStepState = "done" | "current" | "upcoming";

/** The room a step's label takes under its mark: one line of the label's size and the gap above. */
const stepLabelRoom = 22;

/** The widest a step's label gets. A middle label is centred under its mark; the first starts at its mark's outer edge, the last ends at its. */
const stepLabelWidth = 64;

/** A step's mark size: the page's control size (16 points with a pointer, 22 on a touch screen), the size of a radio's ring. */
export const progressStepSize = (): number => controlSize.control;

/** Where a step sits in its row: the ends keep their labels inside the bar's ends. */
export type ProgressStepPlace = "first" | "middle" | "last";

/** A `ProgressSteps`' and `ProgressStep`'s parts as the styles they wear (spread each one onto the part
 * that matches its name). `height` is the bar's. */
export interface ProgressStepsLook {
  /** The row of marks (`ProgressSteps`): over the bar's length, the first mark's middle at the bar's start and
   * the last's at its end, so it hangs half a mark past each end; centred on the bar; room under it for the
   * labels. Laid out left to right whatever the reading direction, as the bar fills. */
  steps(height: number): ViewStyle;
  /** One step (`ProgressStep`): a mark wide, its label hanging under it. */
  readonly step: ViewStyle;
  /** A step's mark (`ProgressStepMark`): a ring, sunk like a field; the current one's edge is the accent. */
  mark(state: ProgressStepState): ViewStyle;
  /** The dot inside the current step's ring. */
  readonly dot: ViewStyle;
  /** A step's label (`ProgressStep`'s text): a box centred under the mark, its `place` telling the
   * ends (the first starts at its mark's outer edge, the last ends at its) from a step between. */
  labelBox(place: ProgressStepPlace): ViewStyle;
  /** The label's type: the current step's in medium weight and the page's ink, the done ones in the ink,
   * the ones to come muted. */
  label(state: ProgressStepState): TextStyle;
}

/** The look of the steps on a bar. */
export function progressStepsLook(): ProgressStepsLook {
  const choiceW = control("choice");
  return {
    steps: (height: number): ViewStyle => ({
      alignSelf: "stretch",
      direction: "ltr",
      flexDirection: "row",
      justifyContent: "space-between",
      marginHorizontal: -progressStepSize() / 2,
      marginTop: -(progressStepSize() + height) / 2,
      paddingBottom: stepLabelRoom,
    }),
    get step(): ViewStyle {
      return { width: progressStepSize(), height: progressStepSize() };
    },
    mark: (state: ProgressStepState): ViewStyle => ({
      width: progressStepSize(),
      height: progressStepSize(),
      borderRadius: progressStepSize() / 2,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: stroke.control,
      // Sunk like a choice's well: the `choice` recipe's face, an edge in the colour the theme
      // gives it, and the shade its face hangs off.
      backgroundColor: choiceW.face ?? "transparent",
      backgroundImage: "none",
      borderColor: choiceW.edgeColor ?? "transparent",
      boxShadow: choiceW.shadeShadow,
      // The step's state is the app's (`done` / `current` / `upcoming`), not a press or hover `nsh`
      // draws, so it is read here rather than said in a state style.
      ...(state === "current" ? { borderColor: colors.brand } : {}),
    }),
    get dot(): ViewStyle {
      const size = control("choice").mark;
      return {
        position: "absolute",
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: colors.brand,
      };
    },
    labelBox: (place: ProgressStepPlace): ViewStyle => ({
      position: "absolute",
      top: progressStepSize() + 6,
      start:
        place === "first"
          ? 0
          : place === "last"
            ? progressStepSize() - stepLabelWidth
            : (progressStepSize() - stepLabelWidth) / 2,
      width: stepLabelWidth,
      alignItems: place === "first" ? "flex-start" : place === "last" ? "flex-end" : "center",
    }),
    label: (state: ProgressStepState): TextStyle => ({
      fontSize: controlSize.detail,
      fontWeight: state === "current" ? "600" : "400",
      color: state === "upcoming" ? colors.mutedForeground : colors.foreground,
    }),
  };
}

/** A step's mark: which step it draws (`state`), and every `nsh` View prop the mark takes. */
export type ProgressStepMarkProps = ViewProps & {
  /** Where the step stands: `done` (a check), `current` (a ring with a dot), `upcoming` (empty). */
  state: Live<ProgressStepState>;
};

/**
 * A step's mark: a ring sunk like a field, citrus with a check once `done` (the check grows in over
 * its own timing, as a checkbox's does), an accent edge and dot while `current`. Becoming current or done
 * pops the ring a little past its size and back; with reduced motion nothing moves. Every `nsh`
 * View prop passes through.
 */
export function ProgressStepMark(props: ProgressStepMarkProps) {
  const [, rest] = split(props, ["children", "class", "state", "style"]);
  const state = () => read(props.state) ?? "upcoming";
  const current = follow(() => (state() === "current" ? 1 : 0));
  const pop = createAnimatedValue(1);
  let shown = state();
  effect(() => {
    const next = state();
    if (next === shown) return;
    shown = next;
    if (reduceMotion()) return;
    pop.set(1.08);
    void animate(pop, 1, motion.default);
  });
  const look = progressStepsLook();
  return (
    <View
      {...rest}
      class={joinClass("transition-colors duration-150 motion-reduce:transition-none", props.class)}
      style={[look.mark(state()), { transform: [{ scale: pop }] }, props.style]}
    >
      <CheckboxMark mark={state() === "done" ? "check" : null} round />
      <View style={[look.dot, { opacity: current }]} />
    </View>
  );
}

/** The steps of a `Progress`, drawn over its bar. */
export type ProgressStepsProps = ViewProps;

/**
 * The step marks on a bar, a `ProgressStep` each, in the bar's frame (a child of `Progress`). The bar
 * runs from the first mark's middle to the last's, so the row hangs half a mark past each end
 * (`progressStepSize()`): give the `Progress` that room at its sides. The bar's `value` is the app's:
 * 0 at the first step, 100 at the last.
 */
export function ProgressSteps(props: ProgressStepsProps) {
  const [, rest] = split(props, ["children", "style"]);
  const height = () => ProgressContext()?.height() ?? progressHeight();
  // Each step takes its place in the row as it is made; the count tells which is last.
  const count = signal(0);
  const made = { count: 0 };
  const steps = {
    join: (): number => {
      const index = made.count++;
      count.set(made.count);
      return index;
    },
    count: (): number => count(),
  };
  return (
    <ProgressStepsContext.Provider value={steps}>
      <View
        role="list"
        {...rest}
        style={[progressStepsLook().steps(height()), props.style ?? null]}
      >
        {props.children}
      </View>
    </ProgressStepsContext.Provider>
  );
}

/** One step on a bar. */
export type ProgressStepProps = Omit<ViewProps, "children"> & {
  /** Where the step stands. Default `upcoming`. */
  state?: ProgressStepState;
  /** The step's label, under its mark. Its name for screen readers too, with its state. */
  children?: string | JSX.Element;
};

/**
 * A step: its mark, and a label under it when the child is a string. The label names it for screen
 * readers, followed by where it stands.
 */
export function ProgressStep(props: ProgressStepProps) {
  const [, rest] = split(props, ["state", "children", "style", "accessibilityLabel"]);
  const state = (): ProgressStepState => props.state ?? "upcoming";
  const look = progressStepsLook();
  const row = ProgressStepsContext();
  const index = row?.join() ?? 0;
  const place = (): ProgressStepPlace => {
    const n = row?.count() ?? 1;
    return index === 0 ? "first" : index === n - 1 ? "last" : "middle";
  };
  // Read once, here where the step is made (`Toggle` reads its children the same way): a string is
  // the label, and the kind of the children never changes.
  const kids = props.children;
  const label = typeof kids === "string" ? kids : undefined;
  return (
    <View
      role="group"
      accessibilityLabel={
        props.accessibilityLabel ?? (label === undefined ? undefined : `${label}, ${state()}`)
      }
      {...rest}
      style={[look.step, props.style ?? null]}
    >
      <ProgressStepMark state={state} />
      {label !== undefined ? (
        <View style={look.labelBox(place())}>
          <Text style={look.label(state())}>{label}</Text>
        </View>
      ) : (
        kids
      )}
    </View>
  );
}
