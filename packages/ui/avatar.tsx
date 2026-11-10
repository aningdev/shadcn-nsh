// Source: examples/nsh-gallery-ui/avatar.ts @ 64ab8a1d (baseline), see NOTICE.
import { colors, finish } from "@shadcn-nsh/theme";
import type { StyleProp, ViewStyle } from "nsh";
import { computed, split, Text, View } from "nsh";
import {
  Avatar as BaseAvatar,
  AvatarGroup as BaseAvatarGroup,
  type AvatarGroupProps as BaseAvatarGroupProps,
  type AvatarProps as BaseAvatarProps,
} from "nsh/base";

import { isPointer } from "./lib/density";

/**
 * Theme layer on `nsh/base` Avatar: a round picture, initials on `muted`, or a
 * placeholder. `size` and `ring` are this wrapper's. Every base prop passes through.
 */
export type AvatarProps = BaseAvatarProps & {
  /** Square side, in points. Default 32 with a pointer, 40 on a touch screen. */
  size?: number;
  /** A ring of the card surface around the picture, for a stack. The picture is inset by 2. */
  ring?: boolean;
};

/**
 * Theme layer on `nsh/base` AvatarGroup: the first `limit` avatars and an overflow chip.
 * `size` sizes the chip and should match the avatars. Overlap is the caller's margin.
 */
export type AvatarGroupProps = BaseAvatarGroupProps & {
  /** Overflow chip side, in points. Default matches `Avatar`. */
  size?: number;
};

/** The picture fades in once it has loaded. `motion-reduce` drops the fade. */
export const avatarPictureClass =
  "rounded-full overflow-hidden transition-opacity duration-300 motion-reduce:transition-none";

/**
 * The fallback's colors. One neutral chip for every name: `muted` fill, `foreground`
 * initials, `border` edge. The reference's per-name hues are a second palette.
 */
function fallbackTone() {
  return {
    background: colors.muted,
    foreground: colors.foreground,
    border: colors.border,
  };
}

/** First letters of the first two words, or the first two letters of one word. */
function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return (parts[0]![0]! + parts[1]![0]!).toUpperCase();
}

/** Default side: 32 with a pointer, 40 on a touch screen. */
function defaultSide(): number {
  return isPointer() ? 32 : 40;
}

/** Wrapper default, then consumer: both set, both apply. */
function mergeClass(base: string, consumer?: string | null): string {
  return consumer ? `${base} ${consumer}` : base;
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

/** Someone without a name: a small figure, not a letter. */
function EmptyGlyph(props: { size: number }) {
  const s = () => props.size;
  return (
    <View style={{ width: s(), height: s(), alignItems: "center" }}>
      <View
        style={{
          width: s() * 0.42,
          height: s() * 0.42,
          borderRadius: s(),
          borderWidth: 1.75,
          borderStyle: "solid",
          borderColor: colors.mutedForeground,
          marginTop: s() * 0.06,
        }}
      />
      <View
        style={{
          width: s() * 0.72,
          height: s() * 0.34,
          marginTop: s() * 0.08,
          borderTopLeftRadius: s(),
          borderTopRightRadius: s(),
          borderWidth: 1.75,
          borderBottomWidth: 0,
          borderStyle: "solid",
          borderColor: colors.mutedForeground,
        }}
      />
    </View>
  );
}

/**
 * The avatar's side and the fallback's type size and colors. `size` overrides the
 * density step. Call it where `size` is read.
 */
export function avatarVariants(options?: {
  /** Square side. Default 32 with a pointer, 40 on a touch screen. */
  size?: number | null;
}) {
  const side = options?.size ?? defaultSide();
  const id = fallbackTone();
  return {
    side,
    fontSize: Math.round(side / 2.8),
    color: id.foreground,
    backgroundColor: id.background,
    borderColor: id.border,
  };
}

/** A round picture, or initials on `muted`. Children (a badge) are not clipped. */
export function Avatar(props: AvatarProps) {
  // Props are read where used (never destructured) so `size` / `name` / `src` follow signals.
  const [, rest] = split(props, [
    "class",
    "style",
    "size",
    "ring",
    "imageClass",
    "imageStyle",
    "fallbackClass",
    "fallbackStyle",
    "fallback",
    "fallbackDelay",
    "children",
  ]);

  const current = computed(() => avatarVariants({ size: props.size }));
  const outer = () => current().side;
  const inner = () => (props.ring ? outer() - 4 : outer());
  const id = () => ({
    backgroundColor: current().backgroundColor,
    borderColor: current().borderColor,
    color: current().color,
  });

  const fallback = () => {
    if (props.fallback) return props.fallback;
    const name = props.name?.trim();
    if (!name) return <EmptyGlyph size={inner() * 0.5} />;
    return (
      <Text style={{ fontSize: Math.round(inner() / 2.8), fontWeight: "600", color: id().color }}>
        {initials(name)}
      </Text>
    );
  };

  const picture = (): ViewStyle => ({
    borderRadius: inner() / 2,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: id().backgroundColor,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: id().borderColor,
  });

  // The ring is its own box so a dot drawn over the picture is not clipped, and so
  // `ring` can change after mount. The picture itself stays round either way.
  return (
    <View
      style={mergeStyle(
        {
          width: outer(),
          height: outer(),
          borderRadius: props.ring ? outer() / 2 : 0,
          padding: props.ring ? 2 : 0,
          backgroundColor: props.ring ? colors.card : "transparent",
          alignItems: "center",
          justifyContent: "center",
        },
        props.style,
      )}
    >
      <BaseAvatar
        {...rest}
        fallbackDelay={props.fallbackDelay ?? 300}
        class={props.class ?? undefined}
        style={{ width: inner(), height: inner(), overflow: "visible" }}
        imageClass={mergeClass(avatarPictureClass, props.imageClass)}
        imageStyle={mergeStyle({ width: "100%", height: "100%" }, props.imageStyle)}
        fallbackClass={mergeClass("items-center justify-center", props.fallbackClass)}
        fallbackStyle={mergeStyle(picture(), props.fallbackStyle)}
        fallback={fallback()}
      >
        {props.children}
      </BaseAvatar>
    </View>
  );
}

/** The first few avatars and a chip for the rest. Give each avatar the same `size`. */
export function AvatarGroup(props: AvatarGroupProps) {
  const [, rest] = split(props, [
    "class",
    "style",
    "size",
    "overflowClass",
    "overflowStyle",
    "overflow",
    "limit",
    "total",
  ]);

  const side = () => props.size ?? defaultSide();
  const more = () => {
    if (props.total == null) return null;
    return Math.max(0, props.total - (props.limit ?? 3));
  };

  return (
    <BaseAvatarGroup
      {...rest}
      limit={props.limit}
      total={props.total}
      class={mergeClass("flex-row items-center", props.class)}
      style={props.style}
      overflowClass={mergeClass("items-center justify-center", props.overflowClass)}
      overflowStyle={mergeStyle(
        {
          width: side(),
          height: side(),
          borderRadius: side() / 2,
          marginLeft: -side() / 4,
          borderWidth: 2,
          borderStyle: "solid",
          borderColor: colors.card,
          backgroundColor: colors.card,
          boxShadow: finish.control.rest,
          alignItems: "center",
          justifyContent: "center",
        },
        props.overflowStyle,
      )}
      overflow={
        props.overflow ?? (
          <Text
            style={{
              fontSize: Math.round(side() / 3.2),
              fontWeight: "600",
              color: colors.mutedForeground,
              fontVariant: ["tabular-nums"],
            }}
          >
            {more() == null ? "…" : `+${more()}`}
          </Text>
        )
      }
    />
  );
}
