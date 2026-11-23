// An avatar: the identity ring (`avatarIdentity`, `avatarHue`) and the `Avatar` that wears it.
// Derived from NSH examples/nsh-gallery-ui (Apache-2.0, © Longbridge); modified. See NOTICE.

import { colors, isDark, font, stroke } from "@shadcn-nsh/theme";
import { computed, split, Text, token, View } from "nsh";
import type { TextProps, ViewProps, ViewStyle } from "nsh";
import {
  Avatar as BaseAvatar,
  AvatarGroup as BaseAvatarGroup,
  type AvatarGroupProps as BaseAvatarGroupProps,
  type AvatarProps as BaseAvatarProps,
} from "nsh/base";

import { joinClass } from "./lib/utils";

/** The hues of the identity ring: twelve, evenly spaced. */
const HUES = 12;

/** FNV-1a of `text`: a stable hash, so a name keeps its hue. */
function hash(text: string): number {
  let h = 2166136261;
  for (const c of text) {
    h ^= c.codePointAt(0) ?? 0;
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** The hue of `name` on the ring, in degrees. */
export const avatarHue = (name: string) => (hash(name) % HUES) * (360 / HUES);

/** `#rrggbb` of an OkLCH color (clipped to sRGB), so it fits an arbitrary
 * Tailwind class (`text-[#…]`) as well as a style. */
function oklch(l: number, c: number, h: number): string {
  const r = (h * Math.PI) / 180;
  const a = c * Math.cos(r);
  const b = c * Math.sin(r);
  const l3 = (l + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m3 = (l - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s3 = (l - 0.0894841775 * a - 1.291485548 * b) ** 3;
  const channel = (x: number) => {
    const v = Math.min(1, Math.max(0, x));
    const encoded = v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055;
    return Math.round(encoded * 255)
      .toString(16)
      .padStart(2, "0");
  };
  return (
    "#" +
    channel(4.0767416621 * l3 - 3.3077115913 * m3 + 0.2309699292 * s3) +
    channel(-1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193965 * s3) +
    channel(-0.0041960863 * l3 - 0.7034186147 * m3 + 1.707614701 * s3)
  );
}

/**
 * The colors a fallback with `name`'s initials draws itself in, as
 * `gpui-component`'s avatar picks them: twelve OkLCH hues at one lightness
 * and chroma, so every avatar has one visual weight and its initials hold
 * WCAG AA on every hue, in light and dark appearance.
 */
export function avatarIdentity(name: string) {
  const h = avatarHue(name);
  return isDark()
    ? {
        background: oklch(0.3, 0.05, h),
        foreground: oklch(0.82, 0.11, h),
        border: oklch(0.36, 0.06, h),
      }
    : {
        background: oklch(0.97, 0.032, h),
        foreground: oklch(0.5, 0.145, h),
        border: oklch(0.89, 0.05, h),
      };
}

/**
 * `nsh/base`'s Avatar with identity colors for a named fallback. Every base prop passes through.
 * `name` drives initials and hue via `avatarIdentity`; `src` is the picture, if there is one.
 */
export type AvatarProps = BaseAvatarProps;

/** An avatar: picture or named initials on the identity ring. */
export function Avatar(props: AvatarProps) {
  const [, rest] = split(props, ["style", "fallbackStyle", "fallbackClass", "imageClass"]);
  // One identity per name and appearance, for the class and the style below: `avatarIdentity` runs a
  // hash and three OkLCH conversions, and the two bindings that ask for it ask at the same time.
  // Owned by this avatar, so it goes when the avatar does, and it follows the name and the
  // appearance (light / dark).
  const identity = computed(() => (props.name ? avatarIdentity(props.name) : null));
  const ringClass = () => {
    const ring = identity();
    return ring
      ? `rounded-full overflow-hidden items-center justify-center font-semibold text-[${ring.foreground}]`
      : undefined;
  };
  const ringStyle = (): ViewStyle | null => {
    const ring = identity();
    return ring
      ? { backgroundColor: ring.background, borderWidth: stroke.hairline, borderColor: ring.border }
      : null;
  };
  return (
    <BaseAvatar
      {...rest}
      style={props.style}
      imageClass={props.imageClass ?? "rounded-full overflow-hidden"}
      fallbackClass={props.fallbackClass ?? ringClass()}
      fallbackStyle={[ringStyle(), props.fallbackStyle ?? null]}
    />
  );
}

/** Every prop of `nsh/base` AvatarGroup: `limit`, `total` and the overflow's name stay there. */
export type AvatarGroupProps = BaseAvatarGroupProps;

/**
 * A row of avatars that shows the first `limit` and stands for the rest, after shadcn/ui's
 * `AvatarGroup`. The overlap is `-space-x-2`; an app's `class` follows it. The overflow part is
 * a ringed circle (`overflow` is its content, usually `AvatarGroupCount`); `overflowStyle` goes
 * over that ring.
 */
export function AvatarGroup(props: AvatarGroupProps) {
  const [, rest] = split(props, ["class", "overflowClass", "overflowStyle", "children"]);
  return (
    <BaseAvatarGroup
      {...rest}
      class={joinClass("flex-row items-center -space-x-2", props.class)}
      overflowClass={joinClass(
        "relative shrink-0 items-center justify-center rounded-full",
        props.overflowClass,
      )}
      overflowStyle={[
        {
          borderWidth: 2,
          borderColor: colors.background,
          backgroundColor: token("muted"),
        },
        props.overflowStyle ?? null,
      ]}
    >
      {props.children}
    </BaseAvatarGroup>
  );
}

/** The count's props: a text's. */
export type AvatarGroupCountProps = TextProps;

/** The people the group does not show ("+3"), drawn inside `AvatarGroup`'s overflow part. */
export function AvatarGroupCount(props: AvatarGroupCountProps) {
  const [, rest] = split(props, ["style", "children"]);
  return (
    <Text
      {...rest}
      style={[
        {
          // No type role has this size: an avatar's count is 12 in both tiers.
          fontSize: 12,
          fontWeight: font.weight("title"),
          color: colors.mutedForeground,
          fontVariant: ["tabular-nums"],
        },
        props.style ?? null,
      ]}
    >
      {props.children}
    </Text>
  );
}

/** The badge's props: a view's. Put it inside `Avatar`; the avatar does not clip it. */
export type AvatarBadgeProps = ViewProps;

/**
 * A presence mark on an avatar's end-bottom corner, after shadcn/ui's `AvatarBadge`: a small
 * circle ringed in the page's background. Pass `style.backgroundColor` for the presence color.
 * It is not a status: say the presence in the avatar's `accessibilityLabel`.
 */
export function AvatarBadge(props: AvatarBadgeProps) {
  const [, rest] = split(props, ["style", "children"]);
  return (
    <View
      {...rest}
      style={[
        {
          position: "absolute",
          end: 0,
          bottom: 0,
          width: 10,
          height: 10,
          borderRadius: 5,
          borderWidth: 2,
          borderColor: colors.background,
          backgroundColor: colors.primary,
        },
        props.style ?? null,
      ]}
    >
      {props.children}
    </View>
  );
}
