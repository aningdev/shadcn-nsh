// Toggle: the official gallery's scene (`references/nsh/examples/gallery/demos/ToggleDemo.tsx`) with
// this library's parts — a text formatting toolbar (any number of marks, exactly one alignment),
// a view switcher whose thumb springs between grid and list, a favorite star that pops and throws
// a ring, the sizes and looks, and a group the app locks. `nsh/base`'s Toggle owns the pressed
// state screen readers hear and the focus; `ToggleGroup` makes one Tab stop of them and the arrow
// keys move within it. Which toggles are on is the app's.
import {
  alpha,
  animate,
  colors,
  surface,
  focusRing,
  hovered,
  motion,
  rounded,
  shape,
  terminal,
} from "@shadcn-nsh/theme";
import {
  Bell,
  Blocks,
  Bold,
  FileText,
  FolderInput,
  Images,
  Italic,
  List,
  Link as LinkIcon,
  MessageCircle,
  Pencil,
  ScrollText,
  Star,
  Strikethrough,
  Table,
  Underline,
  type IconNode,
} from "lucide";
import {
  Canvas,
  createAnimatedValue,
  Easing,
  effect,
  type JSX,
  LayoutAnimation,
  Path2D,
  platform,
  reduceMotion,
  signal,
  Text,
  View,
  type ViewStyle,
} from "nsh";

import { Badge } from "@/packages/ui/badge";
import { Icon } from "@/packages/ui/lib/icons";
import {
  Toggle,
  ToggleGroup,
  toggleGlyph,
  toggleLabel,
  toggleLook,
  type ToggleLookOptions,
  type ToggleSize,
} from "@/packages/ui/toggle";
import { toolbarRule } from "@/packages/ui/toolbar";

import { DemoPage } from "../kit";
import { Card, LastEvent } from "./actions-shared";
import { CaptionRow, LabeledToggle } from "./navigation-shared";

const pointer = platform.desktop;

/** The fades and the sink of the view switcher's segments; nothing moves with reduced motion. */
const transition = (): ViewStyle => ({
  transitionProperty: "background-color, border-color, box-shadow, transform, opacity",
  transitionDuration: reduceMotion() ? 0 : 140,
  transitionTimingFunction: "ease-out",
});

/**
 * What a toggle shows: a Lucide icon, a glyph drawn here, and a label after it. A terminal draws
 * no icons: an icon-only toggle shows `short` there (its label when unset), as text.
 */
type Content = {
  icon?: IconNode;
  glyph?: (tint: string, size: number) => JSX.Element;
  text?: string;
  short?: string;
};

/**
 * A toolbar toggle in the shared look (`toggleLook`): bare (`default`) or on a field's edge
 * (`outline`) while off, `surface("accent").style` while pressed; the pointer's hover and the focus ring as
 * every control's. Its label is what screen readers say and, with a pointer, its tooltip.
 */
function Tool(
  props: Content & {
    label: string;
    pressed: boolean;
    onChange: (pressed: boolean) => void;
    disabled?: boolean;
    size?: ToggleSize;
    variant?: "default" | "outline";
  },
) {
  const text = () => props.text ?? (terminal ? (props.short ?? props.label) : undefined);
  const look: ToggleLookOptions = {
    size: () => props.size,
    variant: props.variant,
    text: !!props.text,
    disabled: () => props.disabled,
  };
  const pressed = () => props.pressed;
  const glyph = toggleGlyph(pressed, look);
  return (
    <View tooltip={props.text ? undefined : props.label}>
      <Toggle
        pressed={props.pressed}
        disabled={props.disabled}
        accessibilityLabel={props.label}
        onChange={({ pressed: on }) => props.onChange(on)}
        {...toggleLook(look)}
      >
        <If when={!terminal && props.icon}>
          <Icon icon={props.icon!} {...glyph} />
        </If>
        <If when={!terminal && props.glyph}>{props.glyph!(glyph.tint, glyph.size)}</If>
        <If when={text()}>
          <Text style={toggleLabel(pressed, look)}>{text()}</Text>
        </If>
      </Toggle>
    </View>
  );
}

type Align = "left" | "center" | "right" | "justify";

/** An alignment in words, for the caption. */
const ALIGNED: Record<Align, string> = {
  left: "left aligned",
  center: "centered",
  right: "right aligned",
  justify: "justified",
};

/** Four lines of a paragraph, set as `align` sets them, on Lucide's grid and pen. */
function AlignGlyph(props: { align: Align; tint: string; size: number }) {
  return (
    <Canvas
      style={{ pointerEvents: "none", width: props.size, height: props.size }}
      draw={(cx, { width }) => {
        cx.scale(width / 24, width / 24);
        cx.strokeStyle = props.tint;
        cx.lineWidth = 2;
        cx.lineCap = "round";
        [16, 10, 14, 8].forEach((w, i) => {
          const len = props.align === "justify" ? 16 : w;
          const x =
            props.align === "center" ? 12 - len / 2 : props.align === "right" ? 20 - len : 4;
          cx.beginPath();
          cx.moveTo(x, 6 + i * 4);
          cx.lineTo(x + len, 6 + i * 4);
          cx.stroke();
        });
      }}
    />
  );
}

/** Four tiles, a grid's glyph, on Lucide's grid and pen. */
function GridGlyph(props: { tint: string; size: number }) {
  return (
    <Canvas
      style={{ pointerEvents: "none", width: props.size, height: props.size }}
      draw={(cx, { width }) => {
        cx.scale(width / 24, width / 24);
        cx.strokeStyle = props.tint;
        cx.lineWidth = 2;
        cx.lineJoin = "round";
        for (const [x, y] of [
          [3, 3],
          [14, 3],
          [3, 14],
          [14, 14],
        ]) {
          cx.beginPath();
          cx.roundRect(x, y, 7, 7, 1.5);
          cx.stroke();
        }
      }}
    />
  );
}

const STAR = new Path2D(
  "M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z",
);

/** Lucide's star: outlined, or filled with the accent. */
function StarGlyph(props: { filled: boolean; size: number }) {
  return (
    <Canvas
      style={{ pointerEvents: "none", width: props.size, height: props.size }}
      draw={(cx, { width }) => {
        cx.scale(width / 24, width / 24);
        cx.lineWidth = 2;
        cx.lineJoin = "round";
        cx.strokeStyle = props.filled ? colors.brand : colors.mutedForeground;
        if (props.filled) {
          cx.fillStyle = colors.brand;
          cx.fill(STAR);
        }
        cx.stroke(STAR);
      }}
    />
  );
}

const MARKS: { value: string; icon: IconNode; label: string; short?: string }[] = [
  { value: "bold", icon: Bold, label: "Bold" },
  { value: "italic", icon: Italic, label: "Italic" },
  { value: "underline", icon: Underline, label: "Underline" },
  { value: "strike", icon: Strikethrough, label: "Strikethrough", short: "Strike" },
];
const ALIGNS: { value: Align; label: string; short?: string }[] = [
  { value: "left", label: "Align left", short: "Left" },
  { value: "center", label: "Align center", short: "Center" },
  { value: "right", label: "Align right", short: "Right" },
  { value: "justify", label: "Justify" },
];

/** The files the view switcher shows, each with the icon of its kind. */
const FILES: { name: string; kind: string; size: string; icon: IconNode }[] = [
  { name: "Roadmap", kind: "Board", size: "24 cards", icon: Blocks },
  { name: "Q3 report", kind: "PDF", size: "2.4 MB", icon: FileText },
  { name: "Launch", kind: "Deck", size: "18 slides", icon: Images },
  { name: "Brand kit", kind: "Folder", size: "36 files", icon: FolderInput },
  { name: "Interviews", kind: "Notes", size: "9 pages", icon: ScrollText },
  { name: "Budget", kind: "Sheet", size: "4 tabs", icon: Table },
];

/**
 * Toggle and ToggleGroup: a text toolbar (marks any number, the alignment exactly one), a
 * segmented view switcher, a favorite star that pops, the sizes and looks, and a group the app
 * disables.
 */
/** The toolbar a toolbar row sits in: an inset track around its toggles. */
const track = (): ViewStyle => ({ alignSelf: "flex-start" });

/** What the demo's cards report last: one line, above the fold of the demo. */
const last = signal("—");

function Formatting() {
  const marks = signal<string[]>(["bold"]);
  const align = signal<Align>("left");
  const has = (m: string) => marks().includes(m);
  const decoration = () =>
    has("underline") && has("strike")
      ? "underline line-through"
      : has("underline")
        ? "underline"
        : has("strike")
          ? "line-through"
          : "none";
  return (
    <Card title="Text formatting" subtitle="Marks any number at once; the alignment exactly one">
      <ToggleGroup style={track()}>
        <Each of={MARKS}>
          {(m) => (
            <Tool
              icon={m().icon}
              label={m().label}
              short={m().short}
              pressed={has(m().value)}
              onChange={(on) => {
                marks.set(on ? [...marks(), m().value] : marks().filter((v) => v !== m().value));
                last.set(`${m().label}: ${on ? "on" : "off"}`);
              }}
            />
          )}
        </Each>
        <View style={toolbarRule()} />
        <Each of={ALIGNS}>
          {(a) => (
            <Tool
              glyph={(tint, size) => <AlignGlyph align={a().value} tint={tint} size={size} />}
              label={a().label}
              short={a().short}
              pressed={align() === a().value}
              onChange={(on) => {
                // Exactly one: the pressed one stays pressed.
                if (on) align.set(a().value);
                last.set(on ? `Align: ${a().value}` : `Align: ${a().value} (stays)`);
              }}
            />
          )}
        </Each>
      </ToggleGroup>
      <View
        style={{
          padding: 12,
          borderRadius: 8,
          backgroundColor: colors.muted,
          borderWidth: 1,
          borderColor: colors.line,
        }}
      >
        <Text
          style={{
            fontSize: pointer ? 14 : 16,
            lineHeight: pointer ? 21 : 24,
            color: colors.foreground,
            fontWeight: has("bold") ? "700" : "400",
            fontStyle: has("italic") ? "italic" : "normal",
            textDecorationLine: decoration(),
            textAlign: align(),
          }}
        >
          The quick brown fox jumps over the lazy dog, then naps in the sun until the evening breeze
          comes in.
        </Text>
      </View>
      <CaptionRow
        label={pointer ? "Tab in, then ← → and Space" : "Press a mark, then an alignment"}
        note={`${marks().length === 1 ? "1 mark" : `${marks().length} marks`}, ${ALIGNED[align()]}`}
      />
    </Card>
  );
}

function Views() {
  const view = signal<"grid" | "list">("grid");
  const seg = pointer ? 32 : 40;
  const inset = 2;
  const channel = () => surface("channel").style;
  const plate = () => surface("plate").style;
  const borderW = (s: ViewStyle) =>
    s.borderColor === undefined || s.borderColor === "transparent" ? 0 : 1;
  const x = createAnimatedValue(0);
  effect(() => {
    const to = view() === "grid" ? 0 : seg;
    void animate(x, to, motion.slow);
  });
  const choose = (next: "grid" | "list", on: boolean) => {
    if (!on || next === view()) return;
    if (!reduceMotion()) LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);
    view.set(next);
    last.set(`View: ${next}`);
  };
  const segment = (value: "grid" | "list", label: string, glyph: (tint: string) => JSX.Element) => (
    <Toggle
      pressed={view() === value}
      accessibilityLabel={label}
      onChange={({ pressed }) => choose(value, pressed)}
      style={{
        minWidth: 0,
        width: terminal ? undefined : seg,
        height: terminal ? undefined : seg - 2 * inset,
        paddingHorizontal: 0,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "transparent",
        borderWidth: 0,
        borderColor: "transparent",
        boxShadow: "none",
        ...rounded(shape.control, inset),
        ...transition(),
      }}
      pressedStyle={{
        backgroundColor: "transparent",
        borderColor: "transparent",
        boxShadow: "none",
      }}
      hoverStyle={view() === value ? undefined : hovered()}
      activeStyle={{ transform: [{ scale: 0.9 }] }}
      focusVisibleStyle={focusRing(1)}
    >
      {glyph(view() === value ? colors.foreground : colors.mutedForeground)}
    </Toggle>
  );
  const grid = () => view() === "grid";
  /** A file: a tile in the grid, a row in the list. */
  const tile = (f: () => (typeof FILES)[number], i: () => number) => (
    <View
      style={
        grid()
          ? {
              flexGrow: 1,
              flexBasis: "28%",
              height: pointer ? 76 : 88,
              padding: 10,
              gap: 4,
              borderRadius: 10,
              borderWidth: 1,
              borderColor: colors.line,
              backgroundColor: colors.muted,
              justifyContent: "flex-end",
            }
          : {
              flexDirection: "row",
              alignItems: "center",
              gap: 10,
              height: pointer ? 36 : 48,
              borderTopWidth: i() === 0 ? 0 : 1,
              borderTopColor: colors.line,
            }
      }
    >
      <View
        style={{
          display: terminal ? "none" : "flex",
          ...(grid() ? { position: "absolute", top: 10, left: 10 } : {}),
        }}
      >
        <Icon icon={f().icon} size={grid() ? 18 : 16} tint={colors.mutedForeground} />
      </View>
      <Text
        style={{
          flex: grid() ? undefined : 1,
          fontSize: pointer ? 13 : 15,
          fontWeight: "500",
          color: colors.foreground,
          numberOfLines: 1,
        }}
      >
        {f().name}
      </Text>
      <Text
        style={{
          fontSize: pointer ? 11 : 12,
          color: colors.faint,
          fontVariant: ["tabular-nums"],
        }}
      >
        {grid() ? f().kind : `${f().kind} · ${f().size}`}
      </Text>
    </View>
  );
  return (
    <Card
      title="View switcher"
      subtitle="The thumb springs to the one shown"
      right={<Badge>{`${FILES.length} items`}</Badge>}
    >
      <ToggleGroup
        inset={false}
        style={{
          flexDirection: "row",
          alignSelf: "flex-start",
          gap: 0,
          padding: inset,
          ...rounded(shape.control),
          ...channel(),
          borderWidth: borderW(channel()),
        }}
      >
        {/* The thumb, in points: a terminal's Cells show the selected toggle as its own band instead. */}
        <If when={!terminal}>
          <View
            style={{
              pointerEvents: "none",
              position: "absolute",
              top: inset,
              bottom: inset,
              left: inset,
              width: seg,
              ...rounded(shape.control, inset),
              borderWidth: borderW(plate()),
              borderColor: "transparent",
              ...plate(),
              transform: [{ translateX: x }],
            }}
          />
        </If>
        {segment("grid", "Grid view", (tint) => (
          <GridGlyph tint={tint} size={pointer ? 15 : 17} />
        ))}
        {segment("list", "List view", (tint) => (
          <Icon icon={List} size={pointer ? 15 : 17} tint={tint} />
        ))}
      </ToggleGroup>
      <View
        style={{
          flexDirection: grid() ? "row" : "column",
          flexWrap: grid() ? "wrap" : "nowrap",
          gap: grid() ? (terminal ? 24 : 8) : 0,
        }}
      >
        <Each of={FILES}>{(f, i) => tile(f, i)}</Each>
      </View>
    </Card>
  );
}

function StarToggle(props: {
  label: string;
  on: boolean;
  count: number;
  onChange: (on: boolean) => void;
}) {
  const side = pointer ? 18 : 22;
  const pop = createAnimatedValue(1);
  const ring = createAnimatedValue(1);
  return (
    <Toggle
      pressed={props.on}
      accessibilityLabel={props.label}
      onChange={({ pressed }) => {
        props.onChange(pressed);
        if (reduceMotion()) return;
        if (pressed) {
          pop.set(0.5);
          void pop.spring(1, { stiffness: 420, damping: 9 });
          ring.set(0);
          void ring.timing(1, { duration: 460, easing: Easing.out(Easing.cubic) });
        } else {
          pop.set(0.8);
          void animate(pop, 1, motion.default);
        }
      }}
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        height: terminal ? undefined : pointer ? 28 : 36,
        paddingHorizontal: 8,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "transparent",
        ...transition(),
      }}
      pressedStyle={{
        backgroundColor: alpha(colors.brand, 0.12),
        borderColor: alpha(colors.brand, 0.3),
      }}
      hoverStyle={props.on ? undefined : hovered()}
      focusVisibleStyle={focusRing(1)}
    >
      {/* A terminal's star is a glyph, filled when on. */}
      <If when={terminal}>
        <Text style={{ color: props.on ? colors.brand : colors.mutedForeground }}>
          {props.on ? "★" : "☆"}
        </Text>
      </If>
      <View
        style={{
          display: terminal ? "none" : "flex",
          width: side,
          height: side,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <View
          style={{
            pointerEvents: "none",
            position: "absolute",
            width: side,
            height: side,
            borderRadius: side / 2,
            borderWidth: 2,
            borderColor: colors.brand,
            opacity: ring.interpolate({ inputRange: [0, 1], outputRange: [0.8, 0] }),
            transform: [
              { scale: ring.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1.9] }) },
            ],
          }}
        />
        <View style={{ transform: [{ scale: pop }] }}>
          <StarGlyph filled={props.on} size={side} />
        </View>
      </View>
      <Text
        style={{
          fontSize: pointer ? 12 : 14,
          fontWeight: "500",
          color: props.on ? colors.foreground : colors.mutedForeground,
          fontVariant: ["tabular-nums"],
        }}
      >
        {props.count}
      </Text>
    </Toggle>
  );
}

function Favorites() {
  const items = [
    { name: "Q3 report", detail: "Finance · edited 2h ago", stars: 41 },
    { name: "Launch checklist", detail: "Product · edited yesterday", stars: 128 },
    { name: "Design review", detail: "Design · edited Monday", stars: 7 },
  ];
  const starred = signal<string[]>(["Launch checklist"]);
  return (
    <Card
      title="Favorite"
      subtitle="The star pops when it turns on"
      right={<Badge>{`${starred().length} starred`}</Badge>}
    >
      <View>
        <Each of={items}>
          {(item, i) => {
            const on = () => starred().includes(item().name);
            return (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 10,
                  minHeight: pointer ? 44 : 56,
                  borderTopWidth: i() === 0 ? 0 : 1,
                  borderTopColor: colors.line,
                }}
              >
                <View style={{ flex: 1, gap: 2 }}>
                  <Text style={{ fontSize: pointer ? 13 : 15, color: colors.foreground }}>
                    {item().name}
                  </Text>
                  <Text style={{ fontSize: pointer ? 12 : 13, color: colors.mutedForeground }}>
                    {item().detail}
                  </Text>
                </View>
                <StarToggle
                  label={`Star ${item().name}`}
                  on={on()}
                  count={item().stars + (on() ? 1 : 0)}
                  onChange={(next) => {
                    starred.set(
                      next
                        ? [...starred(), item().name]
                        : starred().filter((n) => n !== item().name),
                    );
                    last.set(`${item().name}: ${next ? "starred" : "unstarred"}`);
                  }}
                />
              </View>
            );
          }}
        </Each>
      </View>
    </Card>
  );
}

function Sizes() {
  const on = signal<string[]>(["regular", "outline-regular"]);
  const flip = (key: string, label: string, next: boolean) => {
    on.set(next ? [...on(), key] : on().filter((k) => k !== key));
    last.set(`${label}: ${next ? "on" : "off"}`);
  };
  // This library names its sizes `sm` / `default` / `lg`; the labels stay the gallery's.
  const sizes: { size: ToggleSize; caption: string }[] = [
    { size: "sm", caption: "Small" },
    { size: "default", caption: "Regular" },
    { size: "lg", caption: "Large" },
  ];
  return (
    <Card title="Sizes and looks" subtitle="Bare until pressed, or on a field's edge">
      <View style={{ flexDirection: "row", alignItems: "center", gap: terminal ? 24 : 8 }}>
        <Text style={{ width: 60, fontSize: pointer ? 12 : 13, color: colors.faint }}>Ghost</Text>
        <Each of={sizes}>
          {(s) => (
            <Tool
              icon={Star}
              size={s().size}
              short={s().caption}
              label={`${s().caption} star`}
              pressed={on().includes(s().size)}
              onChange={(next) => flip(s().size, `${s().caption} star`, next)}
            />
          )}
        </Each>
      </View>
      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          alignItems: "center",
          gap: terminal ? 24 : 8,
        }}
      >
        <Text style={{ width: 60, fontSize: pointer ? 12 : 13, color: colors.faint }}>Outline</Text>
        <Each of={sizes}>
          {(s) => (
            <Tool
              variant="outline"
              size={s().size}
              icon={Bell}
              text={s().caption}
              label={`${s().caption} alerts`}
              pressed={on().includes(`outline-${s().size}`)}
              onChange={(next) => flip(`outline-${s().size}`, `${s().caption} alerts`, next)}
            />
          )}
        </Each>
      </View>
    </Card>
  );
}

function Disabled() {
  const locked = signal(false);
  const on = signal<string[]>(["comments"]);
  const tools: { value: string; icon: IconNode; label: string }[] = [
    { value: "notify", icon: Bell, label: "Notify" },
    { value: "share", icon: LinkIcon, label: "Share link" },
    { value: "comments", icon: MessageCircle, label: "Comments" },
  ];
  return (
    <Card
      title="Disabled"
      subtitle="A locked group and a lone toggle"
      right={
        <LabeledToggle label="Lock toolbar" value={locked()} onChange={(v) => locked.set(v)} />
      }
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: terminal ? 24 : 12 }}>
        <ToggleGroup disabled={locked()} style={track()}>
          <Each of={tools}>
            {(t) => (
              <Tool
                icon={t().icon}
                label={t().label}
                pressed={on().includes(t().value)}
                onChange={(next) => {
                  on.set(next ? [...on(), t().value] : on().filter((v) => v !== t().value));
                  last.set(`${t().label}: ${next ? "on" : "off"}`);
                }}
              />
            )}
          </Each>
        </ToggleGroup>
        <Tool
          icon={Pencil}
          text="Edit"
          label="Edit (view only)"
          variant="outline"
          pressed={false}
          disabled
          onChange={() => {}}
        />
      </View>
      <CaptionRow
        label={
          locked()
            ? "Locked: no presses, no focus, dimmed for screen readers"
            : "Lock the toolbar: every toggle in it is disabled"
        }
      />
    </Card>
  );
}

function Last() {
  return (
    <Card title="Last event">
      <LastEvent value={last()} hint="Press a toggle" />
    </Card>
  );
}

export function ToggleDemo() {
  return (
    <DemoPage title="Toggle">
      <Formatting />
      <Views />
      <Favorites />
      <Sizes />
      <Disabled />
      <Last />
    </DemoPage>
  );
}
