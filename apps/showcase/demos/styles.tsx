// Styles: the official gallery's scene (`references/nsh/examples/gallery/demos/Styles.tsx`) with
// this library's theme. Every specimen stands on a stage so one style at a time reads: corners
// (circular and continuous, per corner), a progressive blur that layers `backdropFilter` under
// masks, borders per side in each style, shadows that glow rather than darken, clipping and
// stacking order, 3D transforms with two faces, numerals, and a right-to-left layout.
import { alpha, colors, finish, isDark, mono, radius, tints } from "@shadcn-nsh/theme";
import {
  Animated,
  cleanup,
  createAnimatedValue,
  Easing,
  Image,
  List,
  type JSX,
  platform,
  Scroll,
  signal,
  Text,
  type TextStyle,
  View,
  type ViewStyle,
} from "nsh";

import { Badge } from "@/packages/ui/badge";
import { Button } from "@/packages/ui/button";
import { Segmented, SegmentedItem, SegmentedList } from "@/packages/ui/segmented";

import { DemoPage } from "../kit";
import { Card } from "./actions-shared";
import { CaptionRow, hint, LabeledToggle } from "./navigation-shared";

/** The stage every specimen stands on: the card's light, without its drop shadow. */
const stage = (): ViewStyle => ({
  height: 104,
  alignItems: "center",
  justifyContent: "center",
  borderRadius: radius.control,
  borderCurve: "continuous",
  backgroundColor: colors.inset,
  borderWidth: 1,
  borderColor: colors.line,
  backgroundImage: finish.card.backgroundImage,
  boxShadow: isDark() ? "inset 0 1px 0 rgba(255,255,255,0.05)" : "inset 0 1px 0 #ffffff",
});

/** A specimen box: a raised surface the styles are tried on. */
const box = (): ViewStyle => ({
  width: 112,
  height: 76,
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: colors.raised,
});

function Label(props: { children: string; color?: string }) {
  return (
    <Text style={{ fontSize: 13, fontWeight: "600", color: props.color ?? colors.foreground }}>
      {props.children}
    </Text>
  );
}

/**
 * One cell of a two-column grid: the specimen on a stage, a label, the style it shows (`code`,
 * monospaced) and a plain note.
 */
function Tile(props: {
  label: string;
  code?: string;
  note?: string;
  onPress?: () => void;
  children: JSX.Element;
}) {
  return (
    <View style={{ flexBasis: "40%", flexGrow: 1, gap: 8 }}>
      <View onPress={props.onPress} style={stage()}>
        {props.children}
      </View>
      <View style={{ gap: 3, paddingHorizontal: 2 }}>
        <Text style={{ fontSize: 13, fontWeight: "500", color: colors.foreground }}>
          {props.label}
        </Text>
        <If when={props.code}>
          <Text
            style={{
              numberOfLines: 1,
              fontSize: 12,
              color: colors.mutedForeground,
              fontFamily: mono(),
            }}
          >
            {props.code}
          </Text>
        </If>
        <If when={props.note}>
          <Text
            style={{
              numberOfLines: 1,
              fontSize: 12,
              color: colors.faint,
              fontVariant: ["tabular-nums"],
            }}
          >
            {props.note}
          </Text>
        </If>
      </View>
    </View>
  );
}

/** Two columns of specimens, wrapping. */
function Grid(props: { children: JSX.Element }) {
  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", columnGap: 12, rowGap: 16 }}>
      {props.children}
    </View>
  );
}

/** Circular and continuous corners side by side, at the same radius. */
function Corners() {
  const shapes: { label: string; style: () => ViewStyle }[] = [
    {
      label: "Circular",
      style: () => ({ width: 60, height: 60, borderRadius: 20, backgroundColor: colors.info }),
    },
    {
      label: "Continuous",
      style: () => ({
        width: 60,
        height: 60,
        borderRadius: 20,
        borderCurve: "continuous",
        backgroundColor: colors.info,
      }),
    },
    {
      label: "One corner",
      style: () => ({
        width: 60,
        height: 60,
        borderRadius: 20,
        borderCurve: "continuous",
        borderWidth: 2.5,
        borderColor: colors.brand,
        borderTopLeftRadius: 4,
      }),
    },
    {
      label: "Pill",
      style: () => ({
        width: 60,
        height: 28,
        borderRadius: 14,
        borderCurve: "continuous",
        backgroundColor: colors.up,
      }),
    },
  ];
  return (
    <Card title="Corners" subtitle="borderRadius · borderCurve · per corner">
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <Each of={shapes}>
          {(shape) => (
            <View style={{ alignItems: "center", gap: 10 }}>
              <View style={{ height: 64, justifyContent: "center" }}>
                <View style={shape().style()} />
              </View>
              <Text style={{ fontSize: 12, color: colors.mutedForeground }}>{shape().label}</Text>
            </View>
          )}
        </Each>
      </View>
      <CaptionRow label="Continuous corners ease into the edges" note="Radius 20 pt" />
      <Grid>
        <Tile label="Top corners" code="borderTop*Radius" note="28 pt">
          <View
            style={{
              ...box(),
              borderTopLeftRadius: 28,
              borderTopRightRadius: 28,
              borderWidth: 1.5,
              borderColor: colors.brand,
            }}
          >
            <Label color={colors.brand}>28 pt</Label>
          </View>
        </Tile>
        <Tile label="Mixed radii" note="44 · 6 · 28 · 0 pt, clockwise">
          <View
            style={{
              ...box(),
              backgroundColor: tints.info,
              borderTopLeftRadius: 44,
              borderTopRightRadius: 6,
              borderBottomRightRadius: 28,
              borderWidth: 2,
              borderColor: colors.info,
            }}
          >
            <Label color={colors.info}>Mixed</Label>
          </View>
        </Tile>
      </Grid>
    </Card>
  );
}

/** A blur growing toward the bottom: layers of `backdropFilter`, each masked in further along. */
function ProgressiveBlur() {
  const layers = [1.5, 3, 6, 12, 24];
  return (
    <Card title="Progressive blur" subtitle="backdropFilter · maskImage">
      <View
        style={{
          height: 160,
          borderRadius: radius.control,
          borderCurve: "continuous",
          overflow: "hidden",
          backgroundColor: colors.inset,
        }}
      >
        <Each of={Array.from({ length: 8 }, (_, i) => i)}>
          {(i) => (
            <View
              style={{
                height: 20,
                paddingLeft: 12,
                justifyContent: "center",
                backgroundColor: i() % 2 ? colors.info : colors.inset,
              }}
            >
              <Text
                style={{ fontSize: 12, color: i() % 2 ? colors.background : colors.foreground }}
              >
                The quick brown fox {i()}
              </Text>
            </View>
          )}
        </Each>
        <View
          style={{
            pointerEvents: "none",
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            height: 120,
          }}
        >
          <Each of={layers}>
            {(r, i) => (
              <View
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  top: 0,
                  bottom: 0,
                  backdropFilter: `blur(${r()}px)`,
                  maskImage: `linear-gradient(to bottom, transparent ${(i() / layers.length) * 100}%, black ${((i() + 1) / layers.length) * 100}%)`,
                }}
              />
            )}
          </Each>
        </View>
      </View>
    </Card>
  );
}

function Borders() {
  return (
    <Card title="Borders" subtitle="per side · dashed · dotted">
      <Grid>
        <Tile label="Per-side borders" note="6 · 2 · 4 · 1 pt, clockwise">
          <View
            style={{
              ...box(),
              borderTopWidth: 6,
              borderTopColor: colors.destructive,
              borderRightWidth: 2,
              borderRightColor: colors.up,
              borderBottomWidth: 4,
              borderBottomColor: colors.info,
              borderLeftWidth: 1,
              borderLeftColor: colors.warn,
            }}
          />
        </Tile>
        <Tile label="Dashed / dotted" code="borderStyle">
          <View style={{ gap: 8 }}>
            <View
              style={{
                width: 112,
                height: 28,
                borderRadius: 8,
                borderWidth: 1.5,
                borderColor: colors.info,
                borderStyle: "dashed",
              }}
            />
            <View
              style={{
                width: 112,
                height: 28,
                borderRadius: 8,
                borderWidth: 3,
                borderColor: colors.warn,
                borderStyle: "dotted",
              }}
            />
          </View>
        </Tile>
        <Tile label="Single-side dashes" code="border-t · border-l · border-dashed">
          <View style={{ width: 112, height: 76, gap: 12 }}>
            <View class="h-px w-full border-t border-dashed" style={{ borderColor: colors.info }} />
            <View class="flex-1 border-l-2 border-dashed" style={{ borderColor: colors.info }} />
          </View>
        </Tile>
        <Tile label="Unequal sides" note="4 · 2 · 3 · 1 pt, clockwise">
          <View
            style={{
              ...box(),
              borderRadius: 16,
              borderStyle: "dashed",
              borderColor: colors.info,
              borderTopWidth: 4,
              borderRightWidth: 2,
              borderBottomWidth: 3,
              borderLeftWidth: 1,
            }}
          />
        </Tile>
        <Tile label="Single-side dots" code="border-b-4 · border-dotted">
          <View class="border-b-4 border-dotted" style={{ ...box(), borderColor: colors.warn }} />
        </Tile>
        <Tile label="Colored dashes" note="One color per side">
          <View
            style={{
              ...box(),
              borderRadius: 16,
              borderWidth: 3,
              borderStyle: "dashed",
              borderTopColor: colors.destructive,
              borderRightColor: colors.up,
              borderBottomColor: colors.info,
              borderLeftColor: colors.warn,
            }}
          />
        </Tile>
      </Grid>
    </Card>
  );
}

/** Shadows that read on a dark page: colored glows rather than black. */
function Shadows() {
  return (
    <Card title="Shadows and glow" subtitle="boxShadow · elevation · text shadow">
      <Grid>
        <Tile label="Glow" code="boxShadow" note="A colored shadow">
          <View
            style={{
              ...box(),
              borderRadius: 16,
              borderCurve: "continuous",
              backgroundColor: colors.primary,
              boxShadow: `0 6px 18px ${alpha(colors.primary, 0.55)}`,
            }}
          >
            <Label color={colors.primaryForeground}>Glow</Label>
          </View>
        </Tile>
        <Tile label="Offset shadow" code="boxShadow" note="4, 8 pt · blur 10">
          <View
            style={{
              ...box(),
              backgroundColor: tints.info,
              borderTopLeftRadius: 30,
              borderBottomRightRadius: 30,
              borderWidth: 1,
              borderColor: colors.info,
              boxShadow: `4px 8px 10px ${alpha(colors.info, 0.45)}`,
            }}
          >
            <Label color={colors.info}>Offset</Label>
          </View>
        </Tile>
        <Tile label="Image corners" note="Two radii and a shadow">
          <Image
            src="https://pbs.twimg.com/media/HS8AFH2WsAASxLk?format=jpg&name=small"
            style={{
              width: 112,
              height: 76,
              borderTopLeftRadius: 28,
              borderBottomRightRadius: 28,
              backgroundColor: colors.raised,
              boxShadow: isDark() ? "0 8px 12px rgb(0 0 0 / 0.6)" : "0 8px 12px rgb(0 0 0 / 0.22)",
            }}
          />
        </Tile>
        <Tile label="Text shadow" note="Shadow of the glyphs">
          <View style={{ ...box(), backgroundColor: "transparent" }}>
            <Text
              style={{
                fontSize: 24,
                fontWeight: "800",
                color: colors.foreground,
                letterSpacing: -0.5,
                textShadow: `0 0 8px ${alpha(colors.destructive, 0.9)}`,
              }}
            >
              Shadow
            </Text>
          </View>
        </Tile>
        <Tile label="Text corners" note="Radii on a Text">
          <Text
            style={{
              fontSize: 15,
              fontWeight: "600",
              color: colors.up,
              backgroundColor: tints.up,
              borderTopLeftRadius: 14,
              borderBottomRightRadius: 14,
              paddingHorizontal: 14,
              paddingVertical: 8,
            }}
          >
            Text corners
          </Text>
        </Tile>
        <Tile label="Elevation" code="elevation: 10" note="Android">
          <View
            android={{ elevation: 10 }}
            style={{
              ...box(),
              borderRadius: 16,
              backgroundColor: colors.raised,
              boxShadow: "0 6px 10px rgb(0 0 0 / 0.5)",
            }}
          >
            <Label>Elevation</Label>
          </View>
        </Tile>
      </Grid>
    </Card>
  );
}

/** Clipping, stacking order and opacity, each one tap away. */
function Layers() {
  const clip = signal(true);
  const front = signal(0);
  const opacity = createAnimatedValue(0.45);
  const level = signal<"0.2" | "0.45" | "1">("0.45");
  const tones = [colors.destructive, colors.info, colors.up];
  return (
    <Card
      title="Clipping and layers"
      subtitle="overflow · zIndex · opacity"
      right={<LabeledToggle label="Clip" value={clip()} onChange={(v) => clip.set(v)} />}
    >
      <Grid>
        <Tile
          label={clip() ? "Clipped" : "Visible"}
          code={`overflow: ${clip() ? "hidden" : "visible"}`}
          note={hint("Tap to switch", "Click to switch")}
          onPress={() => clip.set(!clip())}
        >
          <View
            style={{
              ...box(),
              backgroundColor: tints.warn,
              borderRadius: 22,
              borderWidth: 1.5,
              borderColor: colors.warn,
              overflow: clip() ? "hidden" : "visible",
            }}
          >
            <View
              style={{
                position: "absolute",
                left: -26,
                top: -26,
                width: 72,
                height: 72,
                borderRadius: 36,
                backgroundColor: colors.destructive,
              }}
            />
            <Label color={colors.warn}>{hint("Tap", "Click")}</Label>
          </View>
        </Tile>
        <Tile
          label="Stacking order"
          code="zIndex"
          note={`Front: ${front() + 1} of 3 · tap`}
          onPress={() => front.set((front() + 1) % 3)}
        >
          <View style={{ width: 130, height: 84 }}>
            <Each of={tones}>
              {(tone, i) => (
                <View
                  style={{
                    position: "absolute",
                    left: 4 + i() * 28,
                    top: 2 + i() * 14,
                    width: 64,
                    height: 52,
                    borderRadius: 12,
                    borderCurve: "continuous",
                    backgroundColor: tone(),
                    borderWidth: front() === i() ? 2 : 0,
                    borderColor: colors.foreground,
                    zIndex: front() === i() ? 10 : 0,
                    boxShadow: isDark()
                      ? "0 3px 6px rgb(0 0 0 / 0.5)"
                      : "0 3px 6px rgb(0 0 0 / 0.18)",
                  }}
                />
              )}
            </Each>
          </View>
        </Tile>
      </Grid>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
        <View
          style={{
            width: 64,
            height: 64,
            borderRadius: 14,
            borderCurve: "continuous",
            backgroundColor: colors.info,
            opacity,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text
            style={{
              fontSize: 13,
              fontWeight: "700",
              color: colors.background,
              fontVariant: ["tabular-nums"],
            }}
          >
            {level()}
          </Text>
        </View>
        <View style={{ flex: 1, gap: 8 }}>
          <CaptionRow label="Opacity" note="Animated natively" />
          <Segmented
            value={level()}
            onValueChange={(v) => {
              level.set(v as "0.2" | "0.45" | "1");
              void opacity.timing(Number(v), { duration: 260, easing: Easing.out(Easing.cubic) });
            }}
          >
            <SegmentedList size="sm" fill>
              <SegmentedItem value="0.2">0.2</SegmentedItem>
              <SegmentedItem value="0.45">0.45</SegmentedItem>
              <SegmentedItem value="1">1</SegmentedItem>
            </SegmentedList>
          </Segmented>
        </View>
      </View>
    </Card>
  );
}

/** Two faces back to back: each hides while turned away. */
function FlipCard() {
  const angle = createAnimatedValue(0);
  const flipped = signal(false);
  const flip = () => {
    flipped.set(!flipped());
    void angle.spring(flipped() ? 180 : 0, { stiffness: 140, damping: 16 });
  };
  const face: ViewStyle = {
    position: "absolute",
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    borderRadius: radius.card,
    borderCurve: "continuous",
    borderWidth: 1,
    padding: 16,
    justifyContent: "space-between",
    backfaceVisibility: "hidden",
  };
  return (
    <View onPress={flip} accessibilityLabel="Flip the card" style={{ height: 132 }}>
      <View
        style={{
          ...face,
          backgroundColor: tints.info,
          borderColor: alpha(colors.info, 0.6),
          backgroundImage: finish.card.backgroundImage,
          boxShadow: finish.card.boxShadow,
          transform: [{ perspective: 800 }, { rotateY: angle }],
        }}
      >
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <Badge tone="info">front</Badge>
          <Text
            style={{ fontSize: 13, color: colors.mutedForeground, fontVariant: ["tabular-nums"] }}
          >
            0°
          </Text>
        </View>
        <View style={{ gap: 2 }}>
          <Text style={{ fontSize: 20, fontWeight: "600", color: colors.foreground }}>
            {hint("Tap to flip", "Click to flip")}
          </Text>
          <Text style={{ fontSize: 13, color: colors.mutedForeground }}>
            A spring turns it on the UI thread
          </Text>
        </View>
      </View>
      <View
        style={{
          ...face,
          backgroundColor: tints.brand,
          borderColor: alpha(colors.brand, 0.5),
          backgroundImage: finish.card.backgroundImage,
          boxShadow: finish.card.boxShadow,
          transform: [
            { perspective: 800 },
            { rotateY: angle.interpolate({ inputRange: [0, 180], outputRange: [180, 360] }) },
          ],
        }}
      >
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <Badge tone="accent">back</Badge>
          <Text
            style={{ fontSize: 13, color: colors.mutedForeground, fontVariant: ["tabular-nums"] }}
          >
            180°
          </Text>
        </View>
        <View style={{ gap: 2 }}>
          <Text style={{ fontSize: 20, fontWeight: "600", color: colors.foreground }}>
            backfaceVisibility
          </Text>
          <Text style={{ fontSize: 13, color: colors.mutedForeground }}>
            hidden: each face hides while turned away
          </Text>
        </View>
      </View>
    </View>
  );
}

function Transforms() {
  // A slow native sway, so the perspective reads as depth.
  const sway = createAnimatedValue(-30);
  const loop = Animated.loop(
    Animated.sequence([
      Animated.timing(sway, { toValue: 30, duration: 2200, easing: Easing.inOut(Easing.sin) }),
      Animated.timing(sway, { toValue: -30, duration: 2200, easing: Easing.inOut(Easing.sin) }),
    ]),
  );
  void loop.start();
  cleanup(() => loop.stop());
  return (
    <Card title="3D transforms" subtitle="perspective · rotateX/Y · skew · origin">
      <FlipCard />
      <Grid>
        <Tile label="Perspective" code="rotateY" note="Swaying, driven natively">
          <View
            style={{
              ...box(),
              borderRadius: 14,
              backgroundColor: tints.info,
              borderWidth: 1,
              borderColor: colors.info,
              transform: [{ perspective: 400 }, { rotateY: sway }],
            }}
          >
            <Label color={colors.info}>Y axis</Label>
          </View>
        </Tile>
        <Tile label="Tilt" code="rotateX(40deg)">
          <View
            style={{
              ...box(),
              borderRadius: 14,
              backgroundColor: tints.brand,
              borderWidth: 1,
              borderColor: colors.brand,
              transform: "perspective(400px) rotateX(40deg)",
            }}
          >
            <Label color={colors.brand}>X axis</Label>
          </View>
        </Tile>
        <Tile label="Skew" code="skewX(-12deg)" note="iOS">
          <View
            style={{
              ...box(),
              borderRadius: 10,
              backgroundColor: tints.warn,
              borderWidth: 1,
              borderColor: colors.warn,
              transform: "skewX(-12deg)",
            }}
          >
            <Label color={colors.warn}>Skew</Label>
          </View>
        </Tile>
        <Tile label="Origin" code="transformOrigin" note="Top left · rotated 30°">
          <View style={{ width: 112, height: 84 }}>
            <View
              style={{
                position: "absolute",
                left: 30,
                top: 14,
                width: 54,
                height: 54,
                borderRadius: 6,
                borderWidth: 1,
                borderColor: colors.faint,
                borderStyle: "dashed",
              }}
            />
            <View
              style={{
                position: "absolute",
                left: 30,
                top: 14,
                width: 54,
                height: 54,
                borderRadius: 6,
                backgroundColor: alpha(colors.destructive, 0.55),
                transformOrigin: "top left",
                transform: "rotate(30deg)",
              }}
            />
            <View
              style={{
                position: "absolute",
                left: 26,
                top: 10,
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: colors.foreground,
              }}
            />
          </View>
        </Tile>
      </Grid>
    </Card>
  );
}

function Numerals() {
  const figure = (): TextStyle => ({ fontSize: 22, color: colors.foreground, fontWeight: "500" });
  return (
    <Card title="Numerals" subtitle="fontVariant">
      <View style={{ flexDirection: "row", gap: 12 }}>
        <View style={{ flex: 1, gap: 4 }}>
          <Text style={{ fontSize: 12, color: colors.mutedForeground }}>Proportional</Text>
          <Text style={figure()}>1,111.11</Text>
          <Text style={figure()}>8,888.88</Text>
        </View>
        <View style={{ width: 1, backgroundColor: colors.line }} />
        <View style={{ flex: 1, gap: 4 }}>
          <Text style={{ fontSize: 12, color: colors.brand, fontFamily: mono() }}>
            tabular-nums
          </Text>
          <Text style={[figure(), { fontVariant: ["tabular-nums"] }]}>1,111.11</Text>
          <Text style={[figure(), { fontVariant: ["tabular-nums"] }]}>8,888.88</Text>
        </View>
      </View>
      <View style={{ height: 1, backgroundColor: colors.line }} />
      <CaptionRow label="Small Caps" note="small-caps" />
      <Text style={{ fontSize: 18, color: colors.foreground, fontVariant: ["small-caps"] }}>
        Small Caps, set as one
      </Text>
      <Text style={{ fontSize: 18, color: colors.foreground, fontVariant: ["oldstyle-nums"] }}>
        Oldstyle 1234567890
      </Text>
    </Card>
  );
}

/** Rows, `marginStart` and text under a right-to-left layout: the app's language decides it, and `direction` sets a view's own. */
function RightToLeft() {
  const rtl = signal(false);
  const tones = [colors.destructive, colors.info, colors.up];
  const chip: ViewStyle = {
    width: 40,
    height: 40,
    borderRadius: 10,
    borderCurve: "continuous",
    alignItems: "center",
    justifyContent: "center",
  };
  return (
    <Card
      title="Right to left"
      subtitle={rtl() ? "direction: rtl" : "direction: ltr"}
      right={
        <Button variant="secondary" size="sm" onPress={() => rtl.set(!rtl())}>
          Flip
        </Button>
      }
    >
      <View style={{ direction: rtl() ? "rtl" : "ltr", gap: 12 }}>
        <View style={{ flexDirection: "row", gap: 8 }}>
          <Each of={["1", "2", "3"]}>
            {(n, i) => (
              <View
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 10,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: tones[i()],
                  marginStart: i() === 0 ? 16 : 0,
                  borderTopStartRadius: 22,
                }}
              >
                <Text style={{ color: colors.background, fontWeight: "700", fontSize: 15 }}>
                  {n()}
                </Text>
              </View>
            )}
          </Each>
        </View>
        <Text style={{ fontSize: 15, lineHeight: 21, color: colors.foreground }}>
          Text aligns to the start side; the first box has marginStart 16 and a round top-start
          corner.
        </Text>
        <CaptionRow label="Horizontal scroll view" note="Scroll" />
        <Scroll horizontal scrollbar={false} style={{ height: 40 }}>
          <View style={{ flexDirection: "row", gap: 6 }}>
            <Each of={Array.from({ length: 12 }, (_, i) => i + 1)}>
              {(n) => (
                <View style={{ ...chip, backgroundColor: tints.info }}>
                  <Text
                    style={{
                      fontSize: 13,
                      color: colors.info,
                      fontVariant: ["tabular-nums"],
                    }}
                  >
                    {String(n())}
                  </Text>
                </View>
              )}
            </Each>
          </View>
        </Scroll>
        <CaptionRow label="Horizontal list" note="List" />
        <List
          each={Array.from({ length: 30 }, (_, i) => i + 1)}
          horizontal
          estimatedItemSize={46}
          scrollbar={false}
          style={{ height: 40 }}
        >
          {(n) => (
            <View style={{ ...chip, marginEnd: 6, backgroundColor: tints.brand }}>
              <Text style={{ fontSize: 13, color: colors.brand, fontVariant: ["tabular-nums"] }}>
                {String(n())}
              </Text>
            </View>
          )}
        </List>
        <View style={{ height: 1, backgroundColor: colors.line }} />
        <Text style={{ fontSize: 13, textAlign: "start", color: colors.mutedForeground }}>
          textAlign start (the right side right to left)
        </Text>
        <Text style={{ fontSize: 13, writingDirection: "rtl", color: colors.mutedForeground }}>
          مرحبا بالعالم — writingDirection rtl
        </Text>
      </View>
    </Card>
  );
}

/**
 * Styles: corners and their curves, a blur that grows toward the bottom, borders per side,
 * shadows that glow, clipping and stacking order, two-faced 3D cards, numerals, and a
 * right-to-left layout.
 */
export function StylesDemo() {
  // A terminal's cells draw no curves, shadows or depth: it shows the cards its cells hold
  // (borders, clipping and layers, numerals, the writing direction) and leaves the others out.
  const straight = platform.idiom === "terminal";
  return (
    <DemoPage title="Styles">
      <If when={!straight}>
        <Corners />
        <ProgressiveBlur />
      </If>
      <Borders />
      <If when={!straight}>
        <Shadows />
      </If>
      <Layers />
      <If when={!straight}>
        <Transforms />
      </If>
      <Numerals />
      <RightToLeft />
    </DemoPage>
  );
}
