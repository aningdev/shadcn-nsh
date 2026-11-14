// A link: the look (`linkLook` and its companions) and the `Link` that wears it.
// From NSH's examples/nsh-gallery-ui (Apache-2.0, © Longbridge; see NOTICE): yours to change.
import { alpha, colors, focusRing } from "@shadcn-nsh/theme";
import type { JSX, ViewStyle } from "nsh";
import { platform, split, Text, token, View } from "nsh";
import { Link as BaseLink, type LinkProps as BaseLinkProps } from "nsh/base";

import { Icon } from "./lib/icons";

// @port look/nav.tsx
const pointer = platform.desktop;

// Link -------------------------------------------------------------------

/** A link's text size: the body's, 13 points with a pointer, 15 on a touch screen. */
export const linkSize = pointer ? 13 : 15;

/** The color fades and the underline's bar slides; both stand still with reduced motion. */
const tint = "transition-colors duration-200 motion-reduce:transition-none";

const slide = "transition-transform duration-300 ease-out motion-reduce:transition-none";

/** What a link is, for its color (`linkColor`). */
export interface LinkState {
  disabled?: boolean;
  /** The page it names is the one shown. */
  current?: boolean;
  /** The app has opened it before. */
  visited?: boolean;
  /** A quiet link (a footer's): the muted text color, no static underline. */
  quiet?: boolean;
}

/** A link's color: the accent; violet once visited; the text color for the
 * current page; muted when quiet; faint while disabled. */
export function linkColor(o?: LinkState): string {
  return o?.disabled
    ? colors.faint
    : o?.current
      ? colors.text
      : o?.visited
        ? token("violet")
        : o?.quiet
          ? colors.muted
          : colors.accent;
}

/** A `Link`'s own look (spread it): a row of its text and icon, the
 * `group` they follow, dimmed while pressed, the keyboard's focus ring
 * around it; `inline` on a paragraph's baseline, else as wide as its text. */
export function linkLook(o?: { inline?: boolean }) {
  return {
    class: `group flex-row items-center gap-1 rounded-sm active:opacity-60 ${tint} ${o?.inline ? "align-text-bottom" : "self-start"}`,
    get focusVisibleStyle(): ViewStyle {
      return focusRing(2);
    },
  };
}

/**
 * A link's text (the child of a `Link` in `linkLook`): `label` in `color`
 * (`linkColor`), medium weight, semibold on the current page; a faint
 * hairline under it (none when quiet or disabled) and a 1.5-point bar of
 * its color over that, growing from the left under the pointer and always
 * there on the current page; `icon` an arrow to a site outside the app,
 * which nudges out of its box under the pointer.
 */
export function LinkText(
  props: LinkState & { label: string; color: string; size?: number; icon?: boolean },
) {
  const size = () => props.size ?? linkSize;
  return (
    <>
      <View>
        <Text
          class={tint}
          style={{
            fontSize: size(),
            fontWeight: props.current ? "600" : "500",
            color: props.color,
          }}
        >
          {props.label}
        </Text>
        <If when={!props.quiet && !props.disabled}>
          <View
            class={`absolute right-0 bottom-0 left-0 h-px ${tint}`}
            style={{ backgroundColor: alpha(props.color, 0.35) }}
          />
        </If>
        <If when={!props.disabled}>
          <View
            class={`absolute right-0 bottom-0 left-0 h-[1.5px] origin-left rounded-full ${slide} ${props.current ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"}`}
            style={{ backgroundColor: props.color }}
          />
        </If>
      </View>
      <If when={props.icon}>
        <View class={`${slide} group-hover:translate-x-0.5 group-hover:-translate-y-0.5`}>
          <Icon name="external" size={Math.round(size() * 0.85)} tint={props.color} />
        </View>
      </If>
    </>
  );
}
// @port end

/**
 * `nsh/base`'s Link in the look of `linkLook` with `LinkText` for a string child.
 * Every base prop passes through; style props go over the look's.
 */
export type LinkProps = Omit<BaseLinkProps, "children"> & {
  /** A quiet footer's link: muted, no static underline. */
  quiet?: boolean;
  /** The page it names is the one shown. */
  current?: boolean;
  /** The app has opened it before (violet). */
  visited?: boolean;
  /** Inline on a paragraph's baseline. */
  inline?: boolean;
  /** External arrow after the label. */
  icon?: boolean;
  /** A string is the label; anything else is drawn as given. */
  children?: string | JSX.Element;
};

/** A text link with the shared underline / bar motion. */
export function Link(props: LinkProps) {
  const [, rest] = split(props, [
    "quiet",
    "current",
    "visited",
    "inline",
    "icon",
    "children",
    "class",
    "style",
    "focusVisibleStyle",
  ]);
  // Read where used, so the look follows the props and the appearance (light / dark).
  const look = () => linkLook({ inline: props.inline });
  const state = (): LinkState => ({
    disabled: !!props.disabled,
    current: props.current,
    visited: props.visited,
    quiet: props.quiet,
  });
  return (
    <BaseLink
      {...rest}
      class={props.class ? `${look().class} ${props.class}` : look().class}
      style={props.style}
      focusVisibleStyle={[look().focusVisibleStyle, props.focusVisibleStyle ?? null]}
    >
      {typeof props.children === "string" ? (
        <LinkText
          label={props.children}
          color={linkColor(state())}
          disabled={!!props.disabled}
          current={props.current}
          quiet={props.quiet}
          icon={props.icon}
        />
      ) : (
        props.children
      )}
    </BaseLink>
  );
}
