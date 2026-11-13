// The demo adapter the official examples are written against (stage, inspector, split, panel,
// log, segmented, desktop, wide): ported from NSH's examples/nsh-gallery-ui (Apache-2.0,
// © Longbridge; see NOTICE). The region below is filled by `bun run port:vendor`: change it
// upstream, or in `port-map.json`, not here.
//
// Demos only: it is not a component, has no registry entry, and never goes into `packages/ui`.
// Its appearance is this library's theme (`@shadcn-nsh/theme`, `packages/ui/lib/surface`).
import { alpha as tint, colors, radius } from "@shadcn-nsh/theme";
import type { JSX as __JSX } from "nsh";
import { Text as __Text, View as __View } from "nsh";
import { platform as __platform, windowSize as __windowSize } from "nsh";

import { insetSurface } from "@/packages/ui/lib/surface";
import { Segmented as SegmentedRoot, SegmentedItem, SegmentedList } from "@/packages/ui/segmented";

// @port demo.ts
/** A pointer and a keyboard: desktop density and copy ("Click", "Tab to it
 * and press Space"); touch density and copy ("Tap") otherwise. */
export const desktop = __platform.desktop;

/** A window wide enough for the desktop layout (the site's Desktop frame is
 * the documentation column's width, about 720 points). */
export const wide = () => __windowSize().width >= 700;

/** Wide enough to put a `Split`'s inspector beside its stage rather than
 * under it: in the site's Desktop frame the subject keeps the whole width. */
const sideBySide = () => __windowSize().width >= 900;

/** The subject in a wide window: a quiet bordered stage (the theme's card
 * corners, a whisper of the text color) that takes the room and centers its
 * content, at most `width` across (440). */
export function Stage(props: { children?: __JSX.Element; width?: number; gap?: number }) {
  return __View({
    get style() {
      return {
        flex: 1,
        minWidth: 0,
        borderRadius: radius.card,
        borderWidth: 1,
        borderColor: ui().line,
        backgroundColor: tint(ui().text, 0.02),
        padding: 24,
        alignItems: "center" as const,
        justifyContent: "center" as const,
      };
    },
    get children() {
      return __View({
        get style() {
          return { width: "100%" as const, maxWidth: props.width ?? 440, gap: props.gap ?? 14 };
        },
        get children() {
          return props.children;
        },
      });
    },
  });
}

/** The column beside a stage: the subject's state, its event log and the
 * options that tune it. */
export function Inspector(props: { children?: __JSX.Element }) {
  return __View({
    style: { width: 300, gap: 12 },
    get children() {
      return props.children;
    },
  });
}

/** The subject and its inspector: a stage beside an inspector column in a
 * wide window, one column `gap` apart otherwise (`grow`: the column fills
 * the page's height). A window crossing the width changes only the styles:
 * the subject and the inspector stay the same views, so they keep their
 * state (a component's own, and what the app heard from it). */
export function Split(props: {
  children?: __JSX.Element;
  inspector?: __JSX.Element;
  gap?: number;
  width?: number;
  grow?: boolean;
}) {
  const gap = () => props.gap ?? 14;
  // Stacked, the subject keeps its own height and the inspector takes what
  // is left of a growing column, as when they were the column's own items.
  const narrow = () => ({ gap: gap() });
  return __View({
    get style() {
      return sideBySide()
        ? { flex: 1, flexDirection: "row" as const, gap: 16 }
        : { flex: props.grow ? 1 : undefined, gap: gap() };
    },
    get children() {
      return [
        // The stage: a bordered frame centering the subject, side by side.
        __View({
          get style() {
            return sideBySide()
              ? {
                  flex: 1,
                  minWidth: 0,
                  borderRadius: radius.card,
                  borderWidth: 1,
                  borderColor: ui().line,
                  backgroundColor: tint(ui().text, 0.02),
                  padding: 24,
                  alignItems: "center" as const,
                  justifyContent: "center" as const,
                }
              : narrow();
          },
          get children() {
            return __View({
              get style() {
                return sideBySide()
                  ? { width: "100%" as const, maxWidth: props.width ?? 440, gap: gap() }
                  : narrow();
              },
              get children() {
                return props.children;
              },
            });
          },
        }),
        // The inspector: a column beside the stage, under it otherwise.
        __View({
          get style() {
            return sideBySide()
              ? { width: 300, gap: 12 }
              : { flex: props.grow ? 1 : undefined, gap: gap() };
          },
          get children() {
            return props.inspector;
          },
        }),
      ];
    },
  });
}

/** A recessed panel of state under a small title, a well
 * (`insetSurface`) in the page (`grow`: it takes the column's free height). */
export function Panel(props: {
  title: string;
  children?: __JSX.Element;
  minHeight?: number;
  grow?: boolean;
}) {
  const title = __Text({
    get style() {
      return { fontSize: 12, color: ui().muted };
    },
    get children() {
      return props.title;
    },
  });
  return __View({
    get style() {
      return {
        ...insetSurface(),
        padding: 12,
        gap: 4,
        minHeight: props.minHeight,
        flex: props.grow ? 1 : undefined,
      };
    },
    get children() {
      return [title, props.children];
    },
  });
}

/** An event log, newest first: the newest line in the text color, older
 * ones faint. Beside a stage it takes the inspector's free height. */
export function Log(props: { title: string; lines: string[]; minHeight?: number; grow?: boolean }) {
  return Panel({
    get title() {
      return props.title;
    },
    get minHeight() {
      return props.minHeight;
    },
    get grow() {
      return props.grow ?? sideBySide();
    },
    get children() {
      return props.lines.map((line, i) =>
        __Text({
          get style() {
            return { fontSize: 12, color: i === 0 ? ui().text : ui().faint };
          },
          children: line,
        }),
      );
    },
  });
}

/** A labelled demo option row using the shared segmented control. */
export function Segmented<T extends string | number>(props: {
  label?: string;
  options: readonly T[];
  value: T;
  onChange: (value: T) => void;
}) {
  return __View({
    style: { gap: 6 },
    get children() {
      return [
        props.label
          ? __Text({ style: { fontSize: 12, color: ui().muted }, children: props.label })
          : null,
        GallerySegmented({
          get options() {
            return props.options.map((value) => ({ value: String(value), label: String(value) }));
          },
          get value() {
            return String(props.value);
          },
          onChange: (value) =>
            props.onChange(props.options.find((option) => String(option) === value)!),
          size: desktop ? "small" : "regular",
        }),
      ];
    },
  });
}
// @port end

/**
 * The gallery's palette under the names its demos read (`ui()` in
 * `references/nsh/examples/nsh-gallery-ui/palette.ts`), as far as the adapter uses them: this
 * library's theme roles, read where they are drawn.
 */
const ui = () => ({
  page: colors.background,
  text: colors.text,
  muted: colors.muted,
  faint: colors.faint,
  line: colors.line,
});

/**
 * The gallery's `Segmented` (one object of options and a value) over this library's parts:
 * `Segmented` holds the value, `SegmentedList` is the track, `SegmentedItem` each option.
 */
function GallerySegmented(props: {
  options: readonly { value: string; label: string; count?: number }[];
  value: string;
  onChange: (value: string) => void;
  size?: "small" | "regular";
  fill?: boolean;
}) {
  return (
    <SegmentedRoot value={props.value} onValueChange={props.onChange}>
      <SegmentedList size={props.size} fill={props.fill}>
        {props.options.map((option) => (
          <SegmentedItem value={option.value} count={option.count}>
            {option.label}
          </SegmentedItem>
        ))}
      </SegmentedList>
    </SegmentedRoot>
  );
}
