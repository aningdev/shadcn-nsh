// The Canvas, Shader and Photos scenes share the gallery's multi-column page, its section card
// with a trailing action, and its small caption, figure and legend pieces. The showcase shell has
// no such layout; these belong to the scenes, not to a component or the shared kit.
import {
  colors,
  terminal,
  TERMINAL_COLUMN,
  TERMINAL_ROW,
  toneColor,
  type Tone,
} from "@shadcn-nsh/theme";
import type { JSX } from "nsh";
import { Scroll, Text, View } from "nsh";

import { density, sectionSurface } from "@/packages/ui/lib/surface";

import { Appear, desktop, paneWidth } from "./apps-shared";

/** The gallery's photographs: one set for every demo, so a session downloads few images. */
const PHOTOS = {
  arc: "HUgxtn0WYAAHEl8",
  booster: "HTpJzwHWMAAIOgb",
  dragon: "HTiUp_2WsAAwokS",
  transporter: "HTbXRu9XcAEKwGr",
  rays: "HS7_82eXsAAa-Hx",
  sunrise: "HS8AAMSWwAEg-aG",
  day: "HS8AFH2WsAASxLk",
  silver: "HS6UGjvXkAAyHtp",
  rollout: "HS6UIKjWcAAIFCz",
  liftoff: "HR4knefbgAAKXHH",
  moon: "HQ6i3NMW0AAA-TS",
  fairing: "HQ6j_THXoAAGLRX",
} as const;

export type PhotoName = keyof typeof PHOTOS;
export type PhotoSize = "360x360" | "small" | "900x900" | "medium" | "large" | "4096x4096";

export const photoNames = Object.keys(PHOTOS) as PhotoName[];

export function photoUrl(name: PhotoName, size: PhotoSize = "medium") {
  return `https://pbs.twimg.com/media/${PHOTOS[name]}?format=jpg&name=${size}`;
}

/** How many columns at least `min` points wide fit the pane, with `gap` between them. */
export function columnsFor(min: number, max: number, gap = 20) {
  return Math.max(1, Math.min(max, Math.floor((paneWidth() - 64 + gap) / (min + gap))));
}

/** A multi-column page: one column on a phone, the cards dealt into columns on a desktop. */
export function ScenePage(props: {
  /** The page's one-line explanation; a phone shows it, a desktop's toolbar does. */
  detail: string;
  max: number;
  min?: number;
  gap?: number;
  cards: (() => JSX.Element)[];
}) {
  const min = props.min ?? 360;
  const gap = props.gap ?? 20;
  return (
    <Scroll testID="page" style={{ flex: 1, backgroundColor: colors.background }}>
      <If
        when={desktop()}
        else={
          <View
            style={
              terminal
                ? {
                    paddingHorizontal: TERMINAL_COLUMN,
                    paddingVertical: TERMINAL_ROW,
                    gap: TERMINAL_ROW,
                  }
                : { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 40, gap: 28 }
            }
          >
            {/* The phone's header is the demo's name; the page opens on what it shows. */}
            <View style={{ paddingHorizontal: terminal ? 0 : 4 }}>
              <Text
                style={{
                  fontSize: terminal ? density.body : 15,
                  lineHeight: terminal ? undefined : 21,
                  color: colors.mutedForeground,
                }}
              >
                {props.detail}
              </Text>
            </View>
            <Each of={props.cards}>{(card) => <Appear index={0}>{card()}</Appear>}</Each>
          </View>
        }
      >
        {(() => {
          const count = columnsFor(min, props.max, gap);
          // The cards are made once here; resizing only deals the same elements into new columns.
          const made = props.cards.map((card, index) => {
            const cardElement = <Appear index={index}>{card()}</Appear>;
            return { cardElement, index };
          });
          return (
            <View
              style={{
                width: "100%",
                // One column reads as a document, at most a comfortable line's width.
                maxWidth: count === 1 ? 880 : count * 540 + 64,
                paddingHorizontal: 32,
                paddingTop: 24,
                paddingBottom: 48,
                gap: 24,
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "flex-start", gap }}>
                <Each of={Array.from({ length: count }, (_, column) => column)}>
                  {(column) => (
                    <View style={{ flex: 1, minWidth: 0, gap: 24 }}>
                      {made.map(({ cardElement, index }) =>
                        index % count === column() ? cardElement : null,
                      )}
                    </View>
                  )}
                </Each>
              </View>
            </View>
          );
        })()}
      </If>
    </Scroll>
  );
}

/** A section: its title and note above a padded surface, with an optional trailing control. */
export function SceneCard(props: {
  title: string;
  subtitle?: string;
  action?: JSX.Element;
  children: JSX.Element;
}) {
  return (
    <View style={{ gap: 8 }}>
      <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 8, paddingHorizontal: 2 }}>
        <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
          <Text style={{ fontSize: density.title, fontWeight: "600", color: colors.foreground }}>
            {props.title}
          </Text>
          <If when={props.subtitle}>
            <Text style={{ fontSize: density.note, color: colors.mutedForeground }}>
              {props.subtitle}
            </Text>
          </If>
        </View>
        {props.action}
      </View>
      <View
        style={{
          ...sectionSurface(),
          overflow: "hidden",
          flexDirection: "column",
          gap: density.gap,
          padding: density.pad,
        }}
      >
        {props.children}
      </View>
    </View>
  );
}

/** A label on the left and a quieter note on the right. */
export function Caption(props: { label: string; note?: string }) {
  return (
    <View
      style={{ flexDirection: "row", alignItems: "baseline", gap: terminal ? TERMINAL_COLUMN : 8 }}
    >
      <Text style={{ flex: 1, fontSize: density.body, color: colors.mutedForeground }}>
        {props.label}
      </Text>
      <If when={props.note}>
        <Text
          style={{
            fontSize: density.note,
            color: colors.faint,
            fontVariant: ["tabular-nums"],
          }}
        >
          {props.note}
        </Text>
      </If>
    </View>
  );
}

/** A large figure with a unit and a toned note after it. */
export function Figure(props: { value: string; unit?: string; note?: string; tone?: Tone }) {
  return (
    <Text
      style={{
        fontSize: 32,
        fontWeight: "600",
        color: colors.foreground,
        fontVariant: ["tabular-nums"],
        letterSpacing: -0.5,
      }}
    >
      {props.value}
      <If when={props.unit}>
        <Text style={{ fontSize: 17, fontWeight: "400", color: colors.mutedForeground }}>
          {` ${props.unit}`}
        </Text>
      </If>
      <If when={props.note}>
        <Text style={{ fontSize: 15, fontWeight: "500", color: toneColor(props.tone ?? "accent") }}>
          {` ${props.note}`}
        </Text>
      </If>
    </Text>
  );
}

/** A colored square and a label, for the chart legends (the square alone is gone in the terminal). */
export function Legend(props: { color: string; label: string }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
      <If when={!terminal}>
        <View style={{ width: 9, height: 9, borderRadius: 2.5, backgroundColor: props.color }} />
      </If>
      <Text style={{ fontSize: 13, color: colors.mutedForeground }}>{props.label}</Text>
    </View>
  );
}
