// What the desktop scenes share (Windows, Keyboard, the block editor): the gallery's card with an
// icon in its header, and its caption row (a line of text with a monospaced note at the end).
// Neither is a component of the library: the card builds on the library's `Card` and `CardAction`.
import { colors, mono, shape } from "@shadcn-nsh/theme";
import type { IconNode } from "lucide";
import type { JSX, StyleProp, ViewStyle } from "nsh";
import { Text, View, windowSize } from "nsh";

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/packages/ui/card";
import { Icon } from "@/packages/ui/lib/icons";

/**
 * The gallery's card: an icon tile, a title and a subtitle, a `right` slot (a badge, a status),
 * then the content, built over the library's `Card`.
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
    <Card style={props.style}>
      <CardHeader>
        <View
          style={{
            gridColumnStart: 1,
            gridRowStart: 1,
            gridRowEnd: 3,
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
            minWidth: 0,
          }}
        >
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
              flexShrink: 0,
            }}
          >
            <Icon icon={props.icon} size={16} tint={colors.mutedForeground} />
          </View>
          <View style={{ flex: 1, minWidth: 0, gap: 1 }}>
            <CardTitle>{props.title}</CardTitle>
            <If when={props.subtitle != null}>
              <CardDescription style={{ numberOfLines: 2 }}>{props.subtitle ?? ""}</CardDescription>
            </If>
          </View>
        </View>
        <If when={props.right}>
          <CardAction style={{ alignSelf: "center" }}>{props.right}</CardAction>
        </If>
      </CardHeader>
      <If when={props.children}>
        <CardContent>{props.children}</CardContent>
      </If>
    </Card>
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
