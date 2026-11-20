// What the desktop scenes share (Windows, Keyboard, the block editor): the gallery's card with an
// icon in its header, and its caption row (a line of text with a monospaced note at the end).
// Neither is a component of the library: the card's header is the scene's layout, drawn over the
// theme's roles and the library's `sectionSurface`.
import { colors, mono, shape } from "@shadcn-nsh/theme";
import type { IconNode } from "lucide";
import type { JSX, StyleProp, ViewStyle } from "nsh";
import { Text, View, windowSize } from "nsh";

import { Icon } from "@/packages/ui/lib/icons";
import { sectionSurface } from "@/packages/ui/lib/surface";

/**
 * The gallery's card: an icon tile, a title and a subtitle, a `right` slot (a badge, a status),
 * then the content. The library's `Card` has no header of its own, so the scene draws one.
 */
export function DeskCard(props: {
  icon: IconNode;
  title: string;
  subtitle?: string;
  right?: JSX.Element;
  children?: JSX.Element;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[{ ...sectionSurface({ padded: true }), gap: 14 }, props.style]}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
        <View
          style={{
            width: 30,
            height: 30,
            borderRadius: shape.control - 1,
            borderCurve: "continuous",
            borderWidth: 1,
            borderColor: colors.line,
            backgroundColor: colors.raised,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon icon={props.icon} size={16} tint={colors.mutedForeground} />
        </View>
        <View style={{ flex: 1, minWidth: 0, gap: 1 }}>
          <Text style={{ fontSize: 15, fontWeight: "600", color: colors.foreground }}>
            {props.title}
          </Text>
          <If when={props.subtitle != null}>
            <Text style={{ fontSize: 13, color: colors.mutedForeground, numberOfLines: 2 }}>
              {props.subtitle ?? ""}
            </Text>
          </If>
        </View>
        {props.right}
      </View>
      {props.children}
    </View>
  );
}

/**
 * A caption under a scene: a line in the muted color and a short note in the monospaced one, at
 * the end. Above a phone it wraps the note under the line.
 */
export function CaptionLine(props: { label: string; note?: string }) {
  const narrow = windowSize().width < 560;
  return (
    <View
      style={
        narrow
          ? { flexDirection: "column", alignItems: "flex-start", gap: 2 }
          : { flexDirection: "row", flexWrap: "wrap", alignItems: "baseline", gap: 6 }
      }
    >
      <Text
        style={{
          flex: 1,
          minWidth: 140,
          fontSize: 12,
          lineHeight: 17,
          color: colors.mutedForeground,
        }}
      >
        {props.label}
      </Text>
      <If when={props.note != null}>
        <Text style={{ fontSize: 11, color: colors.faint, fontFamily: mono() }}>
          {props.note ?? ""}
        </Text>
      </If>
    </View>
  );
}
