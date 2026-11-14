// Diff view: `diffViewStyles`, `DiffHunkActions`, and the `DiffView` that wears them.
// From NSH's examples/nsh-gallery-ui (Apache-2.0, © Longbridge; see NOTICE): yours to change.
import { alpha, colors, solidTint, terminal } from "@shadcn-nsh/theme";
import { split, Text, View } from "nsh";
import {
  Button,
  type DiffViewProps as BaseDiffViewProps,
  type DiffViewStyles,
  DiffView as BaseDiffView,
} from "nsh/base";

import { buttonGlyph, buttonLabel, buttonLook, type ButtonKind } from "./button";
import { Icon, type IconName } from "./lib/icons";

// @port look/workspace.tsx
/** One action on a diff's change: a chip 20 points high, its label 11
 * points in the interface's font (the diff's text is monospaced), or only
 * its icon, 20 points square. */
function HunkAction(props: {
  kind: ButtonKind;
  label: string;
  icon: IconName;
  index: number;
  iconOnly?: boolean;
  onPress: () => void;
}) {
  const look = buttonLook(props.kind, {
    size: "small",
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
        <Icon {...buttonGlyph(props.kind, { size: "small" })} name={props.icon} size={11} />
      ) : (
        <Text
          class="font-sans"
          style={{
            ...buttonLabel(props.kind, { size: "small" }),
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
const DIFF_PAD = 8;

/**
 * A `DiffView`'s colors of change in the theme's tones (its `styles`): added lines on the up tint, deleted on
 * the down tint, both opaque on the card so what lies over them (the actions on a change) matches them, and the words
 * changed within a line a stronger tint of the same tone.
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
      return { backgroundColor: alpha(colors.down, 0.28) };
    },
    // The classic `+` and `−` beside the numbers.
    get indicatorAdded() {
      return { color: colors.up };
    },
    get indicatorDeleted() {
      return { color: colors.down };
    },
  };
}

/**
 * The tone of the row a change's actions sit on (`DiffHunkActions`'s `tone`): split, the change's first row on the new
 * side, an added line unless the change only deletes (a filler there, on the card); unified, its first line, a deleted
 * one unless it only adds.
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
  tone?: "up" | "down";
  onRevert: () => void;
  onKeep: () => void;
}) {
  // On a backing of the row's own color (`tone`: the change's first row, an
  // added or a deleted line as `diffViewStyles` tints them; the card's
  // otherwise) that fades in from the left, so the code they cover ends in a
  // fade instead of a cut glyph, and nothing shows between the chips or
  // after them: it reaches the row's right edge, past the 8 points the view
  // keeps free there.
  const backing = () => (props.tone ? solidTint(props.tone) : colors.surface);
  return (
    <View
      style={
        terminal
          ? { flexDirection: "row", gap: 4 }
          : {
              flexDirection: "row",
              gap: 4,
              paddingLeft: 16,
              paddingRight: 4 + DIFF_PAD,
              marginRight: -DIFF_PAD,
              backgroundImage: `linear-gradient(90deg, ${alpha(backing(), 0)} 0%, ${backing()} 12px)`,
            }
      }
    >
      <HunkAction
        kind="secondary"
        label="Revert"
        icon="undo"
        index={props.index}
        iconOnly={props.iconOnly}
        onPress={props.onRevert}
      />
      <HunkAction
        kind="primary"
        label="Keep"
        icon="check"
        index={props.index}
        iconOnly={props.iconOnly}
        onPress={props.onKeep}
      />
    </View>
  );
}
// @port end

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
