// Diff view: `diffViewStyles`, `DiffHunkActions`, and the `DiffView` that wears them.
// Derived from NSH examples/nsh-gallery-ui (Apache-2.0, © Longbridge); modified. See NOTICE.

import { alpha, colors, isDark, terminal, toneColor, type Tone } from "@shadcn-nsh/theme";
import { Check, Undo2, type IconNode } from "lucide";
import { split, Text, View } from "nsh";
import {
  Button,
  type DiffViewProps as BaseDiffViewProps,
  type DiffViewStyles,
  DiffView as BaseDiffView,
} from "nsh/base";

import { buttonGlyph, buttonLabel, buttonLook, type ButtonVariant } from "./button";
import { Icon } from "./lib/icons";
import { type Live, read } from "./lib/utils";

/** How much of a tone a solid tint carries: 10 % over a light base, 16 % over a dark one, where the
 * same mix would read fainter. */
const SOLID_TINT = { light: 10, dark: 16 } as const;

/** A tone's tint as `toneTint` shows it on `base` (default the card), but
 * opaque: for what overlaps, such as stacked avatars or the actions over a
 * changed line, where a translucent tint would let what is under it show
 * through. */
const solidTint = (tone: Tone, base: string = colors.card) =>
  tone === "neutral"
    ? colors.raised
    : `color-mix(in srgb, ${toneColor(tone)} ${isDark() ? SOLID_TINT.dark : SOLID_TINT.light}%, ${base})`;

/** One action on a diff's change: a chip 20 points high, its label 11
 * points in the interface's font (the diff's text is monospaced), or only
 * its icon, 20 points square. */
function HunkAction(props: {
  variant: ButtonVariant;
  label: string;
  icon: IconNode;
  index: number;
  iconOnly?: boolean;
  onPress: () => void;
}) {
  const look = buttonLook(props.variant, {
    size: "sm",
    style: () =>
      terminal
        ? undefined
        : { height: 20, minWidth: 20, borderRadius: 5, paddingHorizontal: props.iconOnly ? 0 : 6 },
  });
  return (
    <Button
      onPress={props.onPress}
      accessibilityLabel={`${props.label} change ${props.index + 1}`}
      {...look}
    >
      {props.iconOnly && !terminal ? (
        <Icon {...buttonGlyph(props.variant, { size: "sm" })} icon={props.icon} size={11} />
      ) : (
        <Text
          class="font-sans"
          style={{
            ...buttonLabel(props.variant, { size: "sm" }),
            // No type role has this size: a diff header's compact label is 11.
            fontSize: terminal ? undefined : 11,
          }}
        >
          {props.label}
        </Text>
      )}
    </Button>
  );
}

/** What a `DiffView` keeps free at the right of its rows, where its actions on a change sit. */
const diffPad = 8;

/**
 * A `DiffView`'s colors of change in the theme's tones (its `styles`): added lines on the up
 * tint, deleted on the down tint, both opaque on the card so what lies over them (the actions
 * on a change) matches them; the words changed within a line take a stronger tint of the tone.
 */
export function diffViewStyles() {
  return {
    get lineAdded() {
      return { backgroundColor: solidTint("up") };
    },
    get lineDeleted() {
      return { backgroundColor: solidTint("down") };
    },
    get wordAdded() {
      return { backgroundColor: alpha(colors.up, 0.28) };
    },
    get wordDeleted() {
      return { backgroundColor: alpha(colors.destructive, 0.28) };
    },
    // The classic `+` and `−` beside the numbers.
    get indicatorAdded() {
      return { color: colors.up };
    },
    get indicatorDeleted() {
      return { color: colors.destructive };
    },
  };
}

/**
 * The tone of the row a change's actions sit on (`DiffHunkActions`'s `tone`): split, the change's
 * first row on the new side, an added line unless the change only deletes (a filler there, on the
 * card); unified, its first line, a deleted one unless it only adds.
 */
export function diffHunkTone(
  hunk: { oldLines: number; newLines: number },
  layout: "split" | "unified",
): "up" | "down" | undefined {
  if (layout === "unified") return hunk.oldLines > 0 ? "down" : "up";
  return hunk.newLines > 0 ? "up" : undefined;
}

/**
 * A `DiffView`'s actions on a change (what `renderHunkActions` returns):
 * Revert, secondary, and Keep, the primary citrus, as compact chips over
 * the end of the change's first row, so they cover as little code as they
 * can (gpui-component's diff); `iconOnly`, for a narrow view, shows their
 * icons (undo, check), named for screen readers ("Revert change 2").
 */
export function DiffHunkActions(props: {
  index: number;
  iconOnly?: boolean;
  /** The tone of the row it sits on (`diffHunkTone` says which), usual `up` / `down`; a function is read where the backing is drawn. */
  tone?: Live<Tone>;
  onRevert: () => void;
  onKeep: () => void;
}) {
  // On a backing of the row's own color (`tone`: the change's first row, an
  // added or a deleted line as `diffViewStyles` tints them; the card's
  // otherwise) that fades in from the left, so the code they cover ends in a
  // fade instead of a cut glyph, and nothing shows between the chips or
  // after them: it reaches the row's right edge, past the 8 points the view
  // keeps free there.
  const backing = () => {
    const tone = read(props.tone);
    return tone ? solidTint(tone) : colors.card;
  };
  return (
    <View
      style={
        terminal
          ? { flexDirection: "row", gap: 4 }
          : {
              flexDirection: "row",
              gap: 4,
              // physical: `nsh/base`'s DiffView anchors the actions at the row's right and keeps its free room
              // there, and the fade below is a 90deg gradient; both would need the base to mirror first.
              paddingLeft: 16,
              paddingRight: 4 + diffPad,
              marginRight: -diffPad,
              backgroundImage: `linear-gradient(90deg, ${alpha(backing(), 0)} 0%, ${backing()} 12px)`,
            }
      }
    >
      <HunkAction
        variant="secondary"
        label="Revert"
        icon={Undo2}
        index={props.index}
        iconOnly={props.iconOnly}
        onPress={props.onRevert}
      />
      <HunkAction
        variant="default"
        label="Keep"
        icon={Check}
        index={props.index}
        iconOnly={props.iconOnly}
        onPress={props.onKeep}
      />
    </View>
  );
}

function mergeStyles(base: DiffViewStyles, consumer?: DiffViewStyles | null): DiffViewStyles {
  if (consumer == null) return base;
  // Each part is read where the view reads it, never here: spreading the look's getters would
  // capture the colors of the appearance the page first drew in.
  const merged: DiffViewStyles = {};
  for (const part of Object.keys(base) as (keyof DiffViewStyles)[]) {
    Object.defineProperty(merged, part, {
      enumerable: true,
      get: () => consumer[part] ?? base[part],
    });
  }
  return merged;
}

/** Theme layer on `nsh/base` DiffView. Diffing stays in base. */
export type DiffViewProps = BaseDiffViewProps;

/** Two texts, or a patch. Pass `styles` to override `diffViewStyles`. */
export function DiffView(props: DiffViewProps) {
  const [, rest] = split(props, ["styles", "class", "style"]);
  // The look is made in the JSX, not in the body: its getters then read the theme where the
  // view reads them, so a page that starts in light and switches to dark draws the dark tints.
  return (
    <BaseDiffView
      {...rest}
      class={props.class}
      style={props.style}
      styles={mergeStyles(diffViewStyles(), props.styles)}
    />
  );
}

/** The styles of a diff's parts, from `nsh/base`. */
export type { DiffViewStyles };
