// The Platform batch's shared bits (its files alone): the gallery's card with a trailing slot, a
// figure, a caption, a row, a legend, an icon tile, the action row its scenes are made of, and one
// toast host (#85: the library has no `toast()` API yet).
// They are rebuilt here rather than reused from another batch's shared file, so this batch owns
// what it draws. Colors come from the theme only, never a literal.
import { alpha, colors, mono, toneColor, type Tone } from "@shadcn-nsh/theme";
import { ChevronRight, type IconNode } from "lucide";
import type { JSX, TextStyle } from "nsh";
import { cleanup, Overlay, signal, Text, View } from "nsh";

import { Icon } from "@/packages/ui/lib/icons";
import { density, sectionSurface } from "@/packages/ui/lib/surface";
import { Toast } from "@/packages/ui/toast";

/** A card of the gallery's shape: a title and a quieter subtitle, a slot on the trailing edge of
 * the head (a badge, a control), then the scene. `kit`'s `DemoCard` has no trailing slot. */
export function Card(props: {
  title: string;
  subtitle?: string;
  /** The head's trailing edge. */
  right?: JSX.Element;
  children: JSX.Element;
}) {
  return (
    <View style={[sectionSurface({ padded: true }), { gap: density.gap + 4 }]}>
      <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 12 }}>
        <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
          <Text style={{ fontSize: 15, fontWeight: "600", color: colors.foreground }}>
            {props.title}
          </Text>
          <If when={props.subtitle}>
            <Text style={{ fontSize: 13, color: colors.mutedForeground }}>{props.subtitle}</Text>
          </If>
        </View>
        {props.right}
      </View>
      {props.children}
    </View>
  );
}

/** A figure the eye lands on: a large tabular value, an optional unit, a quieter note under it. */
export function Figure(props: {
  value: string;
  unit?: string;
  note?: string;
  /** The value's and the note's tone; the text's colors by default. */
  tone?: Tone;
}) {
  const tint = () => (props.tone ? toneColor(props.tone) : colors.foreground);
  return (
    <View style={{ gap: 2 }}>
      <View style={{ flexDirection: "row", alignItems: "baseline", gap: 5 }}>
        <Text
          style={{
            fontSize: 32,
            fontWeight: "600",
            fontVariant: ["tabular-nums"],
            color: tint(),
          }}
        >
          {props.value}
        </Text>
        <If when={props.unit}>
          <Text style={{ fontSize: 17, color: colors.mutedForeground }}>{props.unit}</Text>
        </If>
      </View>
      <If when={props.note}>
        <Text style={{ fontSize: 12, color: props.tone ? tint() : colors.faint }}>
          {props.note}
        </Text>
      </If>
    </View>
  );
}

/** A caption: a muted line with a quieter note on the trailing edge. */
export function Caption(props: { label: string; note?: string }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 8, minHeight: 16 }}>
      <Text style={{ flex: 1, fontSize: 13, color: colors.mutedForeground }}>{props.label}</Text>
      <If when={props.note}>
        <Text style={{ fontSize: 12, color: colors.faint, fontVariant: ["tabular-nums"] }}>
          {props.note}
        </Text>
      </If>
    </View>
  );
}

/** A row of a list: a hairline above it unless it is the first, a roomy tap target. */
export function Row(props: { first?: boolean; children: JSX.Element }) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        minHeight: density.row,
        paddingVertical: 8,
        borderTopWidth: props.first ? 0 : 1,
        borderTopColor: colors.line,
      }}
    >
      {props.children}
    </View>
  );
}

/** A legend mark: a small colored square with a word beside it. */
export function Legend(props: { color: string; label: string }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
      <View style={{ width: 9, height: 9, borderRadius: 3, backgroundColor: props.color }} />
      <Text style={{ fontSize: 13, color: colors.mutedForeground }}>{props.label}</Text>
    </View>
  );
}

/** A glyph in a tinted tile, the row's leading mark. */
export function IconTile(props: { icon: IconNode; tint: string; size?: number }) {
  const size = props.size ?? 34;
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: Math.round(size * 0.28),
        borderCurve: "continuous",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: alpha(props.tint, 0.14),
      }}
    >
      <Icon icon={props.icon} size={Math.round(size * 0.48)} tint={props.tint} />
    </View>
  );
}

/** A tappable row with an icon tile, a title, a detail and a chevron. */
export function ActionRow(props: {
  first?: boolean;
  icon: IconNode;
  tint: string;
  title: string;
  detail: string;
  onPress: () => void;
}) {
  return (
    <View
      focusable
      accessibilityLabel={props.title}
      onPress={props.onPress}
      hoverStyle={{ backgroundColor: alpha(colors.foreground, 0.04) }}
      activeStyle={{ backgroundColor: alpha(colors.foreground, 0.08) }}
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        minHeight: density.row,
        paddingVertical: 6,
        paddingHorizontal: 8,
        marginHorizontal: -8,
        borderRadius: 8,
        borderTopWidth: props.first ? 0 : 1,
        borderTopColor: colors.line,
      }}
    >
      <IconTile icon={props.icon} tint={props.tint} />
      <View style={{ flex: 1, minWidth: 0, gap: 1, paddingVertical: 4 }}>
        <Text style={{ fontSize: 15, color: colors.foreground }}>{props.title}</Text>
        <Text style={{ fontSize: 12, color: colors.mutedForeground }}>{props.detail}</Text>
      </View>
      <Icon icon={ChevronRight} size={14} tint={colors.faint} />
    </View>
  );
}

/** What a scene last reported, in one line: the hint until something happens. */
export function Result(props: {
  label: string;
  value: { text: string; tone: Tone } | null;
  empty?: string;
}) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 10, minHeight: 24 }}>
      <Text style={{ flex: 1, fontSize: 13, color: colors.mutedForeground }}>{props.label}</Text>
      <If
        when={props.value}
        else={
          <Text style={{ fontSize: 13, color: colors.faint }}>{props.empty ?? "None yet"}</Text>
        }
      >
        <Text style={{ fontSize: 13, color: colors.foreground }}>{props.value?.text}</Text>
      </If>
    </View>
  );
}

/** The small print under a scene: where its data lives, what the platform needs. */
export function Note(props: { children: string }) {
  return <Text style={{ fontSize: 12, color: colors.faint }}>{props.children}</Text>;
}

/** A mono run's style, in the given size and ink. */
export function monoText(size = 12, color: string = colors.foreground): TextStyle {
  return { fontSize: size, fontFamily: mono(), color, fontVariant: ["tabular-nums"] };
}

/** `1 char` / `N chars`, as the gallery counts. */
export function count(n: number, word: string): string {
  return `${n} ${word}${n === 1 ? "" : "s"}`;
}

/**
 * A toast host for one demo, until the library has `toast()` (#85): `toast(title, description)`
 * shows one at the bottom for four seconds, `Toaster` is the stack. The library's `Toast` is the
 * banner; nothing in it raises, updates or stacks them.
 */
export function createToaster() {
  const content = signal<{ title: string; description: string } | null>(null);
  let timer: ReturnType<typeof setTimeout> | undefined;
  const dismiss = () => {
    if (timer !== undefined) clearTimeout(timer);
    timer = undefined;
    content.set(null);
  };
  const toast = (title: string, description: string) => {
    dismiss();
    content.set({ title, description });
    timer = setTimeout(dismiss, 4000);
  };
  cleanup(dismiss);
  function Toaster() {
    return (
      <Overlay
        style={{
          pointerEvents: "box-none",
          alignItems: "center",
          justifyContent: "flex-end",
          padding: 20,
        }}
      >
        <If when={content()}>
          <Toast
            title={content()?.title}
            description={content()?.description}
            accessibilityLabel={`${content()?.title}. ${content()?.description}`}
            onDismissRequest={dismiss}
            class="transition-all duration-200 ease-out"
            startingClass="opacity-0 translate-y-4"
            endingClass="opacity-0 scale-95"
          />
        </If>
      </Overlay>
    );
  }
  return { toast, Toaster };
}

/** A lucide icon as an SVG `data:` URL, for what takes an image rather than a view: a native menu
 * item's `icon`, which draws it in the menu's text color (`currentColor`). The library keeps
 * this conversion private (`lib/icons`), so the gallery's `lucideSvg` is rebuilt here. */
export function lucideSvg(icon: IconNode): string {
  const body = icon
    .map(
      ([tag, attrs]) =>
        `<${tag} ${Object.entries(attrs)
          .filter(([, value]) => value != null)
          .map(([name, value]) => `${name}="${String(value)}"`)
          .join(" ")}/>`,
    )
    .join("");
  return `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`,
  )}`;
}
