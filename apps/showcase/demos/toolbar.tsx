// Toolbar: the official gallery's scene (`references/nsh/examples/gallery/demos/ToolbarDemo.tsx`)
// with this library's parts. `nsh/base`'s Toolbar owns the keyboard and the semantics of a bar of
// controls: one Tab stop whose arrow keys (along its `axis`) move between the Buttons, Toggles and
// Links inside it, its `ToolbarGroup`s and `ToggleGroup`s included; screen readers hear a toolbar,
// its groups by name. What each control does and how it all looks are the library's and the app's:
// the toggles' shared look (`toggleLook`: bare tools that take the on fill when pressed, a press
// that sinks), a thumb that springs to the tool chosen; none of the motion with reduced motion.
import {
  alpha,
  animate,
  chart,
  colors,
  finish,
  focusRing,
  hovered,
  motion,
  terminal,
  TERMINAL_GAP,
} from "@shadcn-nsh/theme";
import {
  Bold,
  Check,
  Copy,
  Download,
  Hand,
  Heading2,
  Italic,
  Link as LinkIcon,
  MessageCircle,
  Pause,
  Pencil,
  Pilcrow,
  Play,
  Share2,
  Strikethrough,
  TextQuote,
  Type,
  Underline,
  Undo2,
  Redo2,
  X,
  type IconNode,
} from "lucide";
import {
  Canvas,
  cleanup,
  createAnimatedValue,
  Easing,
  effect,
  Image,
  type JSX,
  keymap,
  Path2D,
  platform,
  reduceMotion,
  signal,
  Text,
  View,
  type ViewStyle,
} from "nsh";
import {
  Button as BaseButton,
  MenuItem as BaseMenuItem,
  Link as BaseLink,
  Slider,
  Toggle,
} from "nsh/base";

import { Badge } from "@/packages/ui/badge";
import { RoundButton } from "@/packages/ui/button";
import { Input } from "@/packages/ui/input";
import { Icon } from "@/packages/ui/lib/icons";
import { MenuMark, menuIndicator } from "@/packages/ui/lib/popup";
import { toolbarTrack } from "@/packages/ui/lib/tool";
import { Menu, MenuContent, MenuTrigger } from "@/packages/ui/menu";
import { menuItemLook, menuPopup } from "@/packages/ui/menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/packages/ui/popover";
import { sliderFill, sliderLook } from "@/packages/ui/slider";
import {
  toggleGlyph,
  toggleLabel,
  toggleLook,
  toggleSizes,
  type ToggleLookOptions,
} from "@/packages/ui/toggle";
import {
  Toolbar,
  ToolbarGroup,
  ToolbarButton,
  ToolbarOverflow,
  ToolbarSeparator,
  toolbarRule,
} from "@/packages/ui/toolbar";

import { DemoPage } from "../kit";
import { Card, LastEvent, Tip } from "./actions-shared";
import { CaptionRow, LabeledToggle } from "./navigation-shared";

const pointer = platform.idiom === "desktop";

/** A whole number below `n`: a shuffle is random by nature, and nothing about it is reactive. */
const below = (n: number) => Math.floor(Math.random() * n);

/** A tool is a toggle: the library's size table is the bar's, so the scenes measure nothing themselves. */
const TOOL = toggleSizes.default;

/** The gap between a toolbar's tools: two columns in a terminal, where each tool is its label. */
const GAP = terminal ? TERMINAL_GAP : 2;

/** The fades of a tool's parts (a caret that turns, a zoomed preview); nothing moves with reduced motion. */
const transition = (): ViewStyle => ({
  transitionProperty: "background-color, border-color, box-shadow, transform, opacity",
  transitionDuration: reduceMotion() ? 0 : 140,
  transitionTimingFunction: "ease-out",
});

/** The inset track a horizontal toolbar sits in, as wide as its card. */
const track = (): ViewStyle => ({ ...toolbarTrack(), alignSelf: "stretch" });

/** A hairline between runs of a toolbar's items. */
function Rule(props: { vertical?: boolean }) {
  return <ToolbarSeparator style={toolbarRule(props.vertical)} />;
}

// Glyphs the gallery's Lucide subset lacks, drawn on Lucide's 24-point grid and pen.
const GLYPHS = {
  "skip-back": [
    "M17.971 4.285A2 2 0 0 1 21 6v12a2 2 0 0 1-3.029 1.715l-9.997-5.998a2 2 0 0 1-.003-3.432z",
    "M3 20V4",
  ],
  "skip-forward": [
    "M21 4v16",
    "M6.029 4.285A2 2 0 0 0 3 6v12a2 2 0 0 0 3.029 1.715l9.997-5.998a2 2 0 0 0 .003-3.432z",
  ],
  shuffle: [
    "m18 14 4 4-4 4",
    "m18 2 4 4-4 4",
    "M2 18h1.973a4 4 0 0 0 3.3-1.7l5.454-8.6a4 4 0 0 1 3.3-1.7H22",
    "M2 6h1.972a4 4 0 0 1 3.6 2.2",
    "M22 18h-6.041a4 4 0 0 1-3.3-1.8l-.359-.45",
  ],
  repeat: [
    "m17 2 4 4-4 4",
    "M3 11v-1a4 4 0 0 1 4-4h14",
    "m7 22-4-4 4-4",
    "M21 13v1a4 4 0 0 1-4 4H3",
  ],
  "repeat-1": [
    "m17 2 4 4-4 4",
    "M3 11v-1a4 4 0 0 1 4-4h14",
    "m7 22-4-4 4-4",
    "M21 13v1a4 4 0 0 1-4 4H3",
    "M11 10h1v4",
  ],
  "volume-2": [
    "M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z",
    "M16 9a5 5 0 0 1 0 6",
    "M19.364 18.364a9 9 0 0 0 0-12.728",
  ],
  "volume-x": [
    "M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z",
    "m22 9-6 6",
    "m16 9 6 6",
  ],
  pointer: [
    "M4.037 4.688a.495.495 0 0 1 .651-.651l16 6.5a.5.5 0 0 1-.063.947l-6.124 1.58a2 2 0 0 0-1.438 1.435l-1.579 6.126a.5.5 0 0 1-.947.063z",
  ],
  square: ["M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"],
  eraser: [
    "m7 21-4.3-4.3c-1-1-1-2.5 0-3.4l9.6-9.6c1-1 2.5-1 3.4 0l5.6 5.6c1 1 1 2.5 0 3.4L13 21",
    "M22 21H7",
    "m5 11 9 9",
  ],
  "zoom-in": ["M11 3a8 8 0 1 1 0 16 8 8 0 0 1 0-16z", "m21 21-4.3-4.3", "M11 8v6", "M8 11h6"],
  "zoom-out": ["M11 3a8 8 0 1 1 0 16 8 8 0 0 1 0-16z", "m21 21-4.3-4.3", "M8 11h6"],
} as const;
type GlyphName = keyof typeof GLYPHS;
const PATHS = Object.fromEntries(
  Object.entries(GLYPHS).map(([name, ds]) => [name, ds.map((d) => new Path2D(d))]),
) as Record<GlyphName, Path2D[]>;

/** A drawn glyph. */
function Glyph(props: { name: GlyphName; size?: number; tint: string }) {
  const side = () => props.size ?? TOOL.icon;
  return (
    <Canvas
      style={{ pointerEvents: "none", width: side(), height: side() }}
      draw={(cx, { width }) => {
        cx.scale(width / 24, width / 24);
        cx.strokeStyle = props.tint;
        cx.lineWidth = 2;
        cx.lineCap = "round";
        cx.lineJoin = "round";
        for (const p of PATHS[props.name]) cx.stroke(p);
      }}
    />
  );
}

type IconPart = { icon?: IconNode; glyph?: GlyphName };

/**
 * A tool's icon, or its glyph. A terminal draws no icons: there it is the tool's `short` label
 * (its `label` when unset), as text.
 */
function ToolIcon(
  props: IconPart & { tint: string; size?: number; label: string; short?: string },
) {
  if (terminal) {
    return (
      <Text style={{ fontSize: TOOL.text, color: props.tint }}>{props.short ?? props.label}</Text>
    );
  }
  return (
    <>
      <If when={props.icon}>
        <Icon icon={props.icon!} size={props.size ?? TOOL.icon} tint={props.tint} />
      </If>
      <If when={props.glyph}>
        <Glyph name={props.glyph!} size={props.size} tint={props.tint} />
      </If>
    </>
  );
}

/**
 * A command of a toolbar: a `Button`, its label what screen readers say and, with a pointer, its
 * tooltip. It wears the tools' look (`toggleLook`), `on` showing it as a running mode does.
 */
function Command(
  props: IconPart & {
    label: string;
    short?: string;
    text?: string;
    shortcut?: string;
    disabled?: boolean;
    on?: boolean;
    onPress: () => void;
  },
) {
  const look = toggleLook({
    on: () => !!props.on,
    text: !!props.text,
    disabled: () => props.disabled,
  });
  return (
    <BaseButton
      accessibilityLabel={props.label}
      disabled={props.disabled}
      tooltip={<Tip label={props.label} shortcut={props.shortcut} />}
      onPress={props.onPress}
      {...look}
    >
      <If when={!(terminal && props.text)}>
        <ToolIcon
          icon={props.icon}
          glyph={props.glyph}
          label={props.label}
          short={props.short}
          tint={props.on ? colors.foreground : colors.mutedForeground}
        />
      </If>
      <If when={props.text}>
        <Text style={{ fontSize: TOOL.text, fontWeight: "500", color: colors.foreground }}>
          {props.text}
        </Text>
      </If>
    </BaseButton>
  );
}

/**
 * A popup's trigger in a toolbar: the view the `Menu` or `Popover` gives its presses, focus and
 * `expanded` state (the arrows reach it, Space and Return open it), so one of the toolbar's
 * items. It keeps its own name and tooltip: the library's trigger parts take an element and let
 * `nsh/base` merge its behavior into it, with no wrapper.
 */
function Trigger(props: {
  label: string;
  open: boolean;
  wide?: boolean;
  tip: JSX.Element;
  children: JSX.Element;
}) {
  return (
    <View
      role="button"
      accessibilityLabel={props.label}
      tooltip={props.tip}
      {...toggleLook({ on: () => props.open, text: props.wide })}
    >
      {props.children}
    </View>
  );
}

/**
 * An on / off tool of a toolbar: a `Toggle`, the on fill while pressed; an icon, and a label after
 * it when `text` is set. Its label is what screen readers say and, with a pointer, its tooltip.
 */
function Mark(
  props: IconPart & {
    label: string;
    short?: string;
    text?: string;
    shortcut?: string;
    pressed: boolean;
    disabled?: boolean;
    onChange: (pressed: boolean) => void;
  },
) {
  const look: ToggleLookOptions = { text: !!props.text, disabled: () => props.disabled };
  const pressed = () => props.pressed;
  return (
    <Toggle
      pressed={props.pressed}
      disabled={props.disabled}
      accessibilityLabel={props.label}
      tooltip={<Tip label={props.label} shortcut={props.shortcut} />}
      onChange={({ pressed: on }) => props.onChange(on)}
      {...toggleLook(look)}
    >
      <If when={!(terminal && props.text)}>
        <ToolIcon
          icon={props.icon}
          glyph={props.glyph}
          label={props.label}
          short={props.short}
          tint={toggleGlyph(pressed, look).tint}
        />
      </If>
      <If when={props.text}>
        <Text style={toggleLabel(pressed, look)}>{props.text}</Text>
      </If>
    </Toggle>
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
type Block = "Paragraph" | "Heading" | "Quote";

/** Four lines of a paragraph, set as `align` sets them, on Lucide's grid and pen. */
function AlignGlyph(props: { align: Align; tint: string }) {
  return (
    <Canvas
      style={{ pointerEvents: "none", width: TOOL.icon, height: TOOL.icon }}
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

const MARKS: { value: string; icon: IconNode; label: string; short?: string; shortcut: string }[] =
  [
    { value: "bold", icon: Bold, label: "Bold", shortcut: keymap.label("mod+b") },
    { value: "italic", icon: Italic, label: "Italic", shortcut: keymap.label("mod+i") },
    { value: "underline", icon: Underline, label: "Underline", shortcut: keymap.label("mod+u") },
    {
      value: "strike",
      icon: Strikethrough,
      label: "Strikethrough",
      short: "Strike",
      shortcut: keymap.label("mod+shift+x"),
    },
  ];
const ALIGNS: { value: Align; label: string; short?: string }[] = [
  { value: "left", label: "Align left", short: "Left" },
  { value: "center", label: "Align center", short: "Center" },
  { value: "right", label: "Align right", short: "Right" },
  { value: "justify", label: "Justify" },
];
const BLOCKS: { value: Block; icon: IconNode }[] = [
  { value: "Paragraph", icon: Pilcrow },
  { value: "Heading", icon: Heading2 },
  { value: "Quote", icon: TextQuote },
];

/**
 * A row of a toolbar's menu; `checked` makes it one choice of a group (the block, the alignment),
 * its dot the app's mark, or with `check` an on / off tool folded into the menu (a mark), its
 * check the app's.
 */
function Item(props: {
  label: string;
  icon?: IconNode;
  onSelect: () => void;
  checked?: boolean;
  check?: boolean;
  disabled?: boolean;
}) {
  return (
    <BaseMenuItem
      onSelect={props.onSelect}
      disabled={props.disabled}
      checked={props.checked}
      role={
        props.checked === undefined ? undefined : props.check ? "menuitemcheckbox" : "menuitemradio"
      }
      indicatorClass={menuIndicator}
      indicator={
        props.checked === undefined ? undefined : (
          <MenuMark kind={props.check ? "check" : "dot"} size={TOOL.icon} tint={colors.brand} />
        )
      }
      {...menuItemLook()}
    >
      <If when={props.icon}>
        <Icon icon={props.icon!} size={TOOL.icon} tint={colors.mutedForeground} />
      </If>
      <Text style={{ flexGrow: 1, fontSize: pointer ? 13 : 16, color: colors.foreground }}>
        {props.label}
      </Text>
    </BaseMenuItem>
  );
}

const TRACKS = [
  {
    title: "Night Drive",
    artist: "Halcyon Arcade",
    length: 214,
    art: "https://pbs.twimg.com/media/HS6UIKjWcAAIFCz?format=jpg&name=360x360",
  },
  {
    title: "Paper Lanterns",
    artist: "Mira Sol",
    length: 187,
    art: "https://pbs.twimg.com/media/HS8AAMSWwAEg-aG?format=jpg&name=360x360",
  },
  {
    title: "Low Tide",
    artist: "The Quiet Fields",
    length: 243,
    art: "https://pbs.twimg.com/media/HUgxtn0WYAAHEl8?format=jpg&name=360x360",
  },
] as const;

/**
 * Toolbar, ToolbarGroup and ToolbarSeparator: a text editor's formatting bar (history, a block
 * menu, marks, an alignment that folds into the overflow menu on a narrow pane, a link popover),
 * a media player's transport, a vertical palette of tools, and a toolbar the app locks.
 */
function Formatting() {
  type State = { marks: string[]; align: Align; block: Block; link: string };
  const state = signal<State>({ marks: ["bold"], align: "left", block: "Paragraph", link: "" });
  const past = signal<State[]>([]);
  const future = signal<State[]>([]);
  const commit = (next: Partial<State>, what: string) => {
    past.set([...past(), state()].slice(-50));
    future.set([]);
    state.set({ ...state(), ...next });
    last.set(what);
  };
  const undo = () => {
    const prev = past().at(-1);
    if (!prev) return;
    future.set([state(), ...future()]);
    past.set(past().slice(0, -1));
    state.set(prev);
    last.set("Undo");
  };
  const redo = () => {
    const next = future()[0];
    if (!next) return;
    past.set([...past(), state()]);
    future.set(future().slice(1));
    state.set(next);
    last.set("Redo");
  };
  const has = (m: string) => state().marks.includes(m);
  const toggleMark = (m: { value: string; label: string }, on: boolean) =>
    commit(
      { marks: on ? [...state().marks, m.value] : state().marks.filter((v) => v !== m.value) },
      `${m.label}: ${on ? "on" : "off"}`,
    );
  const blockOpen = signal(false);
  const linkOpen = signal(false);
  const draft = signal("");
  const applyLink = () => {
    commit({ link: draft().trim() }, draft().trim() ? `Link: ${draft().trim()}` : "Link removed");
    linkOpen.set(false);
  };
  const decoration = () =>
    has("underline") && has("strike")
      ? "underline line-through"
      : has("underline")
        ? "underline"
        : has("strike")
          ? "line-through"
          : "none";
  const block = () => state().block;
  const linkTint = () => (state().link ? colors.brand : colors.mutedForeground);
  return (
    <Card
      title="Text formatting"
      subtitle="Marks, blocks, alignment: one Tab stop"
      right={<Badge>{`${past().length} edits`}</Badge>}
    >
      <Toolbar accessibilityLabel="Formatting" style={track()}>
        <ToolbarGroup accessibilityLabel="History" fold="none" style={{ gap: GAP }}>
          <ToolbarButton
            priority={4}
            menu={<Item label="Undo" icon={Undo2} disabled={past().length === 0} onSelect={undo} />}
          >
            <Command
              icon={Undo2}
              label="Undo"
              shortcut={keymap.label("mod+z")}
              disabled={past().length === 0}
              onPress={undo}
            />
          </ToolbarButton>
          <ToolbarButton
            priority={3}
            menu={
              <Item label="Redo" icon={Redo2} disabled={future().length === 0} onSelect={redo} />
            }
          >
            <Command
              icon={Redo2}
              label="Redo"
              shortcut={keymap.label("mod+shift+z")}
              disabled={future().length === 0}
              onPress={redo}
            />
          </ToolbarButton>
        </ToolbarGroup>
        <ToolbarButton foldable={false}>
          <Menu onOpenChange={({ open }) => blockOpen.set(open)}>
            <MenuTrigger>
              <Trigger
                label={`Block: ${block()}`}
                tip={<Tip label="Turn into" />}
                open={blockOpen()}
                wide
              >
                <Icon
                  icon={BLOCKS.find((b) => b.value === block())!.icon}
                  size={TOOL.icon}
                  tint={colors.foreground}
                />
                <If when={pointer || terminal}>
                  <Text style={{ fontSize: TOOL.text, color: colors.foreground }}>{block()}</Text>
                </If>
                <View
                  style={{
                    transform: [{ rotate: blockOpen() ? "180deg" : "0deg" }],
                    ...transition(),
                  }}
                >
                  <Text style={{ fontSize: 9, color: colors.faint }}>▾</Text>
                </View>
              </Trigger>
            </MenuTrigger>
            <MenuContent offset={6} margin={8} popupStyle={menuPopup({ minWidth: 190 }).popupStyle}>
              <Each of={BLOCKS}>
                {(b) => (
                  <Item
                    label={b().value}
                    icon={b().icon}
                    checked={block() === b().value}
                    onSelect={() => commit({ block: b().value }, `Block: ${b().value}`)}
                  />
                )}
              </Each>
            </MenuContent>
          </Menu>
        </ToolbarButton>
        <ToolbarGroup accessibilityLabel="Marks" fold="none" style={{ gap: GAP }}>
          <Each of={MARKS}>
            {(m) => (
              <ToolbarButton
                foldable={m().value !== "bold"}
                priority={m().value === "italic" ? 5 : m().value === "underline" ? 1 : 0}
                menu={
                  <Item
                    label={m().label}
                    icon={m().icon}
                    check
                    checked={has(m().value)}
                    onSelect={() => toggleMark(m(), !has(m().value))}
                  />
                }
              >
                <Mark
                  icon={m().icon}
                  label={m().label}
                  short={m().short}
                  shortcut={m().shortcut}
                  pressed={has(m().value)}
                  onChange={(on) => toggleMark(m(), on)}
                />
              </ToolbarButton>
            )}
          </Each>
        </ToolbarGroup>
        <ToolbarGroup accessibilityLabel="Alignment" priority={2} fold="unit" style={{ gap: GAP }}>
          <Each of={ALIGNS}>
            {(a) => (
              <ToolbarButton
                menu={
                  <Item
                    label={a().label}
                    checked={state().align === a().value}
                    onSelect={() => commit({ align: a().value }, `Align: ${a().value}`)}
                  />
                }
              >
                <Toggle
                  pressed={state().align === a().value}
                  accessibilityLabel={a().label}
                  tooltip={<Tip label={a().label} />}
                  onChange={({ pressed }) =>
                    pressed && commit({ align: a().value }, `Align: ${a().value}`)
                  }
                  {...toggleLook()}
                >
                  <If
                    when={terminal}
                    else={
                      <AlignGlyph
                        align={a().value}
                        tint={
                          state().align === a().value ? colors.foreground : colors.mutedForeground
                        }
                      />
                    }
                  >
                    <Text
                      style={{
                        fontSize: TOOL.text,
                        color:
                          state().align === a().value ? colors.foreground : colors.mutedForeground,
                      }}
                    >
                      {a().short ?? a().label}
                    </Text>
                  </If>
                </Toggle>
              </ToolbarButton>
            )}
          </Each>
        </ToolbarGroup>
        <ToolbarButton foldable={false}>
          <Popover
            open={linkOpen()}
            onOpenChange={({ open }) => {
              if (open) draft.set(state().link);
              linkOpen.set(open);
            }}
          >
            <PopoverTrigger>
              <Trigger
                label="Link"
                tip={<Tip label="Link" shortcut={keymap.label("mod+k")} />}
                open={linkOpen() || !!state().link}
              >
                <ToolIcon icon={LinkIcon} label="Link" tint={linkTint()} />
              </Trigger>
            </PopoverTrigger>
            {/* The popover's field and buttons are stops of their own, not the toolbar's items. */}
            <PopoverContent
              placement="bottom"
              align="start"
              offset={6}
              margin={8}
              width={pointer ? 280 : 320}
            >
              <Text
                style={{ fontSize: pointer ? 12 : 14, fontWeight: "600", color: colors.foreground }}
              >
                Link to
              </Text>
              <Input
                value={draft()}
                onChange={({ value }) => draft.set(value)}
                onSubmit={applyLink}
                placeholder="https://"
                keyboardType="url"
                autoCapitalize="none"
                accessibilityLabel="Link address"
                autoFocus
              />
              <View style={{ flexDirection: "row", justifyContent: "flex-end", gap: 6 }}>
                <Command
                  label="Remove link"
                  text="Remove"
                  disabled={!state().link}
                  onPress={() => {
                    draft.set("");
                    applyLink();
                  }}
                />
                <Command label="Apply link" text="Apply" on onPress={applyLink} />
              </View>
            </PopoverContent>
          </Popover>
        </ToolbarButton>
        <ToolbarOverflow
          accessibilityLabel="More formatting"
          tooltip={<Tip label="More" />}
          style={{ marginStart: "auto" }}
        >
          <Item
            label="Clear formatting"
            icon={X}
            disabled={state().marks.length === 0 && state().block === "Paragraph"}
            onSelect={() => commit({ marks: [], block: "Paragraph" }, "Clear formatting")}
          />
          <Item
            label="Copy as Markdown"
            icon={Copy}
            onSelect={() => last.set("Copied as Markdown")}
          />
        </ToolbarOverflow>
      </Toolbar>
      <View
        style={{
          padding: 12,
          borderRadius: 8,
          backgroundColor: colors.inset,
          borderWidth: 1,
          borderColor: colors.line,
          borderLeftWidth: block() === "Quote" ? 3 : 1,
          borderLeftColor: block() === "Quote" ? colors.brand : colors.line,
        }}
      >
        <Text
          style={{
            fontSize: block() === "Heading" ? (pointer ? 20 : 22) : pointer ? 14 : 16,
            lineHeight: block() === "Heading" ? (pointer ? 26 : 30) : pointer ? 21 : 24,
            color: block() === "Quote" ? colors.mutedForeground : colors.foreground,
            fontWeight: has("bold") || block() === "Heading" ? "700" : "400",
            fontStyle: has("italic") || block() === "Quote" ? "italic" : "normal",
            textDecorationLine: decoration(),
            textAlign: state().align,
          }}
        >
          The quick brown fox jumps over{" "}
          <Text
            style={{
              color: state().link ? colors.brand : undefined,
              textDecorationLine: state().link ? "underline" : decoration(),
            }}
          >
            the lazy dog
          </Text>
          , then naps in the sun until the evening breeze comes in.
        </Text>
      </View>
      <CaptionRow
        label={
          pointer
            ? "Tab in, ← → to move"
            : "Press a tool; what the bar has no room for folds into ⋯"
        }
        note={`${state().marks.length} ${state().marks.length === 1 ? "mark" : "marks"}, ${ALIGNED[state().align]}`}
      />
    </Card>
  );
}

function Player() {
  const index = signal(0);
  const playing = signal(false);
  const shuffle = signal(false);
  const repeat = signal<"off" | "all" | "one">("off");
  const muted = signal(false);
  const volume = signal(70);
  const elapsed = signal(0);
  // The bar moves natively from where it is to the end over what is left; JS only ticks the
  // clock once a second.
  const progress = createAnimatedValue(0);
  const track = () => TRACKS[index()];
  const timer = signal<ReturnType<typeof setInterval> | undefined>(undefined);
  const stop = () => {
    clearInterval(timer());
    timer.set(undefined);
    void progress.stop();
  };
  cleanup(stop);
  const run = () => {
    stop();
    const left = track().length - elapsed();
    progress.set(elapsed() / track().length);
    void progress.timing(1, { duration: left * 1000, easing: Easing.linear });
    timer.set(
      setInterval(() => {
        if (elapsed() + 1 >= track().length) return next(true);
        elapsed.set(elapsed() + 1);
      }, 1000),
    );
  };
  const load = (i: number) => {
    index.set((i + TRACKS.length) % TRACKS.length);
    elapsed.set(0);
    progress.set(0);
    if (playing()) run();
  };
  function next(ended = false) {
    if (ended && repeat() === "one") return load(index());
    if (ended && repeat() === "off" && index() === TRACKS.length - 1) {
      playing.set(false);
      stop();
      return;
    }
    load(shuffle() ? index() + 1 + below(TRACKS.length - 1) : index() + 1);
    last.set(`Next: ${track().title}`);
  }
  const previous = () => {
    // Past the first seconds, back to the start of the track.
    load(elapsed() > 3 ? index() : index() - 1);
    last.set(`Previous: ${track().title}`);
  };
  const play = () => {
    playing.set(!playing());
    if (playing()) run();
    else stop();
    last.set(playing() ? `Play: ${track().title}` : "Pause");
  };
  // The play button's icon pops as it swaps.
  const pop = createAnimatedValue(1);
  effect(() => {
    playing();
    if (reduceMotion()) return;
    pop.set(0.7);
    void animate(pop, 1, motion.default);
  });
  const time = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
  const cycle = () => {
    repeat.set(repeat() === "off" ? "all" : repeat() === "all" ? "one" : "off");
    last.set(`Repeat: ${repeat()}`);
  };
  const big = pointer ? 40 : 52;
  return (
    <Card title="Media player" subtitle="Buttons, toggles and a slider in one bar">
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
        {/* The cover: one of the gallery's photos, the raised fill under it while it loads. */}
        <Image
          src={track().art}
          style={{
            width: pointer ? 56 : 64,
            height: pointer ? 56 : 64,
            borderRadius: 10,
            borderCurve: "continuous",
            objectFit: "cover",
            backgroundColor: colors.raised,
          }}
        />
        <View style={{ flex: 1, gap: 2 }}>
          <Text
            style={{
              fontSize: pointer ? 14 : 16,
              fontWeight: "600",
              color: colors.foreground,
              numberOfLines: 1,
            }}
          >
            {track().title}
          </Text>
          <Text
            style={{
              fontSize: pointer ? 12 : 14,
              color: colors.mutedForeground,
              numberOfLines: 1,
            }}
          >
            {track().artist}
          </Text>
        </View>
        <Badge>{`${index() + 1} / ${TRACKS.length}`}</Badge>
      </View>
      <View style={{ gap: 4 }}>
        <View
          style={{
            height: 4,
            borderRadius: 2,
            overflow: "hidden",
            backgroundColor: colors.track,
          }}
        >
          <View
            style={{
              height: 4,
              width: "100%",
              borderRadius: 2,
              backgroundColor: colors.primary,
              transformOrigin: "left",
              transform: [{ scaleX: progress }],
            }}
          />
        </View>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <Text
            style={{ fontSize: 11, color: colors.mutedForeground, fontVariant: ["tabular-nums"] }}
          >
            {time(elapsed())}
          </Text>
          <Text
            style={{ fontSize: 11, color: colors.mutedForeground, fontVariant: ["tabular-nums"] }}
          >
            -{time(track().length - elapsed())}
          </Text>
        </View>
      </View>
      <Toolbar
        accessibilityLabel="Playback"
        style={{
          alignItems: "center",
          gap: terminal ? TERMINAL_GAP : pointer ? 4 : 8,
          flexWrap: "wrap",
        }}
      >
        <Mark
          glyph="shuffle"
          label="Shuffle"
          pressed={shuffle()}
          onChange={(on) => {
            shuffle.set(on);
            last.set(`Shuffle: ${on ? "on" : "off"}`);
          }}
        />
        <ToolbarGroup
          accessibilityLabel="Transport"
          style={{ alignItems: "center", gap: terminal ? TERMINAL_GAP : pointer ? 4 : 8 }}
        >
          <Command glyph="skip-back" label="Previous" onPress={previous} />
          <RoundButton
            accessibilityLabel={playing() ? "Pause" : "Play"}
            tooltip={<Tip label={playing() ? "Pause" : "Play"} shortcut="Space" />}
            onPress={play}
            side={big}
            style={terminal ? undefined : { ...transition() }}
          >
            <View style={{ transform: [{ scale: pop }] }}>
              <If
                when={playing()}
                else={
                  <ToolIcon
                    icon={Play}
                    label="Play"
                    size={pointer ? 18 : 22}
                    tint={colors.primaryForeground}
                  />
                }
              >
                <ToolIcon
                  icon={Pause}
                  label="Pause"
                  size={pointer ? 18 : 22}
                  tint={colors.primaryForeground}
                />
              </If>
            </View>
          </RoundButton>
          <Command glyph="skip-forward" label="Next" onPress={() => next()} />
        </ToolbarGroup>
        <Command
          glyph={repeat() === "one" ? "repeat-1" : "repeat"}
          label={`Repeat: ${repeat()}`}
          short="Repeat"
          on={repeat() !== "off"}
          onPress={cycle}
        />
        <View style={{ flex: 1 }} />
        <ToolbarGroup
          accessibilityLabel="Volume"
          style={{ alignItems: "center", gap: terminal ? TERMINAL_GAP : 6 }}
        >
          <Mark
            glyph={muted() || volume() === 0 ? "volume-x" : "volume-2"}
            label="Mute"
            pressed={muted()}
            onChange={(on) => {
              muted.set(on);
              last.set(on ? "Muted" : "Unmuted");
            }}
          />
          {/* A slider keeps its own arrow keys: it is a stop of its own, after the toolbar's. */}
          <Slider
            value={volume()}
            step={5}
            accessibilityLabel="Volume"
            disabled={muted()}
            onChange={({ value }) => volume.set(value as number)}
            onChangeEnd={({ value }) => last.set(`Volume: ${String(value)}`)}
            {...sliderLook()}
            rangeStyle={sliderFill(0, volume() / 100)}
            style={{ width: pointer ? 96 : 120 }}
          />
        </ToolbarGroup>
      </Toolbar>
    </Card>
  );
}

function Palette() {
  const TOOLS: {
    value: string;
    label: string;
    key: string;
    icon?: IconNode;
    glyph?: GlyphName;
    hint: string;
  }[] = [
    {
      value: "select",
      label: "Select",
      key: "V",
      glyph: "pointer",
      hint: "Click a shape to select it; drag to move it",
    },
    {
      value: "hand",
      label: "Hand",
      key: "H",
      icon: Hand,
      hint: "Drag the canvas to pan around it",
    },
    { value: "pen", label: "Pen", key: "P", icon: Pencil, hint: "Draw freehand strokes" },
    {
      value: "shape",
      label: "Rectangle",
      key: "R",
      glyph: "square",
      hint: "Drag out a rectangle",
    },
    { value: "text", label: "Text", key: "T", icon: Type, hint: "Click to place a text box" },
    {
      value: "eraser",
      label: "Eraser",
      key: "E",
      glyph: "eraser",
      hint: "Locked: the document is read-only for erasing",
    },
  ];
  const tool = signal("select");
  const zoom = signal(100);
  const at = () => TOOLS.findIndex((t) => t.value === tool());
  // The selection springs to the tool chosen.
  const step = TOOL.side + 2;
  const y = createAnimatedValue(0);
  effect(() => {
    const to = at() * step;
    void animate(y, to, motion.default);
  });
  const current = () => TOOLS[at()];
  return (
    <Card title="Tool palette" subtitle="A vertical toolbar: ↑ ↓ move, ← → are left alone">
      <View
        style={{ flexDirection: "row", gap: terminal ? TERMINAL_GAP : 12, alignItems: "stretch" }}
      >
        {/* A terminal's column of labels lines up at the start; the chosen one is its own band there. */}
        <Toolbar
          axis="vertical"
          accessibilityLabel="Tools"
          style={{ ...toolbarTrack({ vertical: true }), alignSelf: "flex-start", gap: 2 }}
        >
          <If when={!terminal}>
            <View
              style={{
                pointerEvents: "none",
                position: "absolute",
                top: 3,
                left: 3,
                width: TOOL.side,
                height: TOOL.side,
                borderRadius: TOOL.side / 4 + 1,
                borderWidth: 1,
                ...finish.accent,
                transform: [{ translateY: y }],
              }}
            />
          </If>
          <Each of={TOOLS}>
            {(t) => (
              <Toggle
                pressed={tool() === t().value}
                disabled={t().value === "eraser"}
                accessibilityLabel={t().label}
                tooltip={<Tip label={t().label} shortcut={t().key} />}
                onChange={({ pressed }) => {
                  if (!pressed) return;
                  tool.set(t().value);
                  last.set(`Tool: ${t().label}`);
                }}
                {...toggleLook({ disabled: () => t().value === "eraser" })}
                // The thumb shows the chosen tool (a terminal's band is the on fill); no hover over it.
                pressedStyle={terminal ? finish.accent : undefined}
                hoverStyle={tool() === t().value || t().value === "eraser" ? undefined : hovered()}
              >
                <ToolIcon
                  icon={t().icon}
                  glyph={t().glyph}
                  label={t().label}
                  tint={tool() === t().value ? colors.foreground : colors.mutedForeground}
                />
              </Toggle>
            )}
          </Each>
          <Rule vertical />
          <Command
            glyph="zoom-in"
            label="Zoom in"
            disabled={zoom() >= 200}
            onPress={() => {
              zoom.set(zoom() + 25);
              last.set(`Zoom: ${zoom()}%`);
            }}
          />
          <Command
            glyph="zoom-out"
            label="Zoom out"
            disabled={zoom() <= 50}
            onPress={() => {
              zoom.set(zoom() - 25);
              last.set(`Zoom: ${zoom()}%`);
            }}
          />
        </Toolbar>
        <View
          style={{
            flex: 1,
            minHeight: 200,
            borderRadius: 10,
            borderWidth: 1,
            borderColor: colors.line,
            backgroundColor: colors.inset,
            overflow: "hidden",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            padding: 12,
          }}
        >
          <View
            style={{
              transform: [{ scale: zoom() / 100 }],
              ...transition(),
              flexDirection: "row",
              gap: 8,
              alignItems: "flex-end",
            }}
          >
            <View
              style={{
                width: 44,
                height: 30,
                borderRadius: 6,
                backgroundColor: alpha(chart.chart1, 0.3),
                borderWidth: 1,
                borderColor: alpha(chart.chart1, 0.6),
              }}
            />
            <View
              style={{
                width: 28,
                height: 28,
                borderRadius: 14,
                backgroundColor: alpha(chart.chart3, 0.3),
                borderWidth: 1,
                borderColor: alpha(chart.chart3, 0.6),
              }}
            />
            <View
              style={{
                width: 36,
                height: 46,
                borderRadius: 6,
                backgroundColor: alpha(chart.chart2, 0.3),
                borderWidth: 1,
                borderColor: alpha(chart.chart2, 0.6),
              }}
            />
          </View>
          <Text
            style={{ fontSize: pointer ? 13 : 15, fontWeight: "600", color: colors.foreground }}
          >
            {current().label}
          </Text>
          <Text
            style={{
              fontSize: pointer ? 12 : 13,
              color: colors.mutedForeground,
              textAlign: "center",
            }}
          >
            {current().hint}
          </Text>
          <Text
            style={{ fontSize: 11, color: colors.mutedForeground, fontVariant: ["tabular-nums"] }}
          >
            {`${zoom()}%`}
          </Text>
        </View>
      </View>
    </Card>
  );
}

function Disabled() {
  const locked = signal(false);
  const approved = signal(false);
  const comments = signal(true);
  return (
    <Card
      title="Disabled"
      subtitle="Everything in it locks, link included"
      right={<LabeledToggle label="Lock" value={locked()} onChange={(v) => locked.set(v)} />}
    >
      <Toolbar
        accessibilityLabel="Review"
        disabled={locked()}
        style={{ ...track(), flexWrap: "wrap" }}
      >
        {/* Approved or not is on or off: a toggle, as the comments are. */}
        <Mark
          icon={Check}
          text="Approve"
          label="Approve"
          pressed={approved()}
          onChange={(on) => {
            approved.set(on);
            last.set(on ? "Approved" : "Approval withdrawn");
          }}
        />
        <Mark
          icon={MessageCircle}
          label="Show comments"
          short="Comments"
          pressed={comments()}
          onChange={(on) => {
            comments.set(on);
            last.set(`Comments: ${on ? "shown" : "hidden"}`);
          }}
        />
        <Rule />
        <ToolbarGroup accessibilityLabel="Share" disabled style={{ gap: GAP }}>
          <Command
            icon={Share2}
            label="Share (needs edit access)"
            short="Share"
            onPress={() => {}}
          />
          <Command
            icon={Download}
            label="Download (needs edit access)"
            short="Download"
            onPress={() => {}}
          />
        </ToolbarGroup>
        <View style={{ flex: 1 }} />
        <BaseLink
          href="https://nsh.dev/docs/review"
          openWith="app"
          style={{
            paddingHorizontal: 8,
            height: TOOL.side,
            justifyContent: "center",
            borderRadius: 6,
            borderWidth: 1,
            borderColor: "transparent",
            ...transition(),
          }}
          hoverStyle={hovered()}
          focusVisibleStyle={focusRing(1)}
          onOpen={({ href }) => last.set(`Open: ${href}`)}
        >
          <Text
            style={{ fontSize: TOOL.text, color: colors.brand, textDecorationLine: "underline" }}
          >
            Review guide
          </Text>
        </BaseLink>
      </Toolbar>
      <CaptionRow
        label={
          locked()
            ? "Locked: no presses, no Tab stop, dimmed for screen readers"
            : "The share group is disabled on its own; Tab skips it"
        }
      />
    </Card>
  );
}

function Last() {
  return (
    <Card title="Last event">
      <LastEvent value={last()} hint="Use a tool" />
    </Card>
  );
}

/** What the demo's cards report last: one line under the title. */
const last = signal("—");

export function ToolbarDemo() {
  return (
    <DemoPage title="Toolbar">
      <Formatting />
      <Player />
      <Palette />
      <Disabled />
      <Last />
    </DemoPage>
  );
}
