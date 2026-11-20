// Patterns: the official gallery's scene (`references/nsh/examples/gallery/demos/Components.tsx`,
// the gallery's "Components") with this library's parts — press feedback drawn natively, a sheet a
// pressed row opens, a layout animation between tree changes, an input accessory over the iOS
// keyboard, a view that keeps clear of the keyboard, a dialog's platform options, and the
// platform itself read from the app.
import {
  colors,
  finish,
  mono,
  tints,
  toneColor,
  toneTint,
  type Tone,
  shape,
} from "@shadcn-nsh/theme";
import {
  announce,
  type InputRef,
  type JSX,
  LayoutAnimation,
  locale,
  pixelRatio,
  platform,
  reduceMotion,
  screenReaderEnabled,
  setAccessibilityFocus,
  signal,
  Text,
  View,
  type ViewRef,
} from "nsh";
import { InputAccessoryView } from "nsh/mobile";

import { Badge } from "@/packages/ui/badge";
import { Button } from "@/packages/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/packages/ui/dialog";
import { Input } from "@/packages/ui/input";
import { listRow, RowDivider, RowLabel } from "@/packages/ui/lib/surface";
import { Segmented, SegmentedItem, SegmentedList } from "@/packages/ui/segmented";
import { Sheet, SheetContent, SheetClose } from "@/packages/ui/sheet";

import { DemoPage } from "../kit";
import { Card } from "./actions-shared";
import { CaptionRow, hint, LabeledToggle } from "./navigation-shared";

// One device pixel, in points (reading it in a binding follows the screen).
const hairline = () => 1 / pixelRatio();

/** A cell of a row of equal widths. */
function Cell(props: { children: JSX.Element }) {
  return <View style={{ flex: 1 }}>{props.children}</View>;
}

const presets = [
  { value: "spring", label: "Spring" },
  { value: "easeInEaseOut", label: "Ease" },
  { value: "linear", label: "Linear" },
] as const;

const tileTones: Tone[] = ["accent", "info", "warn", "up", "destructive"];

const behaviors = [
  { value: "padding", label: "padding" },
  { value: "height", label: "height" },
] as const;

const behaviorNote = {
  padding:
    "padding-bottom: env(keyboard-inset-height). The tinted background stays under the keyboard.",
  height:
    "margin-bottom: env(keyboard-inset-height). The view shrinks: its background ends at the keyboard.",
} as const;

/** A tile to press, with the prop it shows. */
function Tile(props: { title: string; note: string; children?: JSX.Element }) {
  return (
    <View
      style={{
        minHeight: 60,
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        paddingHorizontal: 12,
        paddingVertical: 8,
      }}
    >
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={{ fontSize: 15, color: colors.foreground }}>{props.title}</Text>
        <Text style={{ fontSize: 12, color: colors.faint, fontFamily: mono() }}>{props.note}</Text>
      </View>
      {props.children}
    </View>
  );
}

/** The frame of a tile that can be pressed: the raised surface without its gradient. */
const tile = () => ({
  borderRadius: shape.control,
  borderCurve: "continuous" as const,
  borderWidth: 1,
  borderColor: colors.border,
  backgroundColor: colors.card,
  boxShadow: finish.raised.boxShadow,
});

/**
 * Patterns: press feedback, a sheet, layout animation, an input accessory, keyboard avoidance,
 * a dialog's options, and the platform's own values.
 */
function PressFeedback() {
  const pressed = signal("None yet");
  const disabled = signal(false);
  return (
    <Card
      title="Press feedback"
      subtitle={hint(
        "Drawn natively while the finger is down",
        "Drawn natively while the button is down",
      )}
    >
      <View
        style={tile()}
        activeStyle={{ opacity: 0.4 }}
        onPress={() => pressed.set("Fading tile")}
      >
        <Tile title="Fades while pressed" note="activeStyle={{ opacity: 0.4 }}" />
      </View>
      <View
        style={tile()}
        activeStyle={{ backgroundColor: colors.raised }}
        onPress={() => pressed.set("Underlay tile")}
      >
        <Tile title="Lights up while pressed" note="activeStyle={{ backgroundColor }}" />
      </View>
      <View
        style={tile()}
        disabled={disabled()}
        activeStyle={{ backgroundColor: tints.destructive }}
        class="disabled:opacity-50"
        onPress={() => pressed.set("Enabled tile")}
      >
        <Tile
          title={disabled() ? "Takes no presses" : "Enabled"}
          note="disabled + disabled:opacity-50"
        >
          <Badge tone={disabled() ? "neutral" : "up"}>{disabled() ? "Off" : "On"}</Badge>
        </Tile>
      </View>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: platform.idiom === "terminal" ? 24 : 12,
        }}
      >
        <View style={{ flex: 1 }}>
          <CaptionRow label="Last pressed" note={pressed()} />
        </View>
        <LabeledToggle
          label="Disable the third tile"
          value={disabled()}
          onChange={(v) => disabled.set(v)}
        />
      </View>
    </Card>
  );
}

function PressableSheet() {
  const open = signal(false);
  return (
    <Card title="Sheet" subtitle="A Tailwind active: variant opens it">
      <View
        onPress={() => open.set(true)}
        role="button"
        accessibilityLabel="Open a sheet"
        style={{ boxShadow: finish.accent.boxShadow }}
        class="bg-primary focus-visible:outline-ring h-12 flex-row items-center justify-center gap-2 rounded-[12px] transition focus-visible:outline-2 active:scale-[0.97] active:opacity-85 motion-reduce:transition-none"
      >
        <Text style={{ fontSize: 15, fontWeight: "600", color: colors.primaryForeground }}>
          Open a sheet
        </Text>
      </View>
      <CaptionRow label="Scales and dims while pressed" note="active:scale-[0.97]" />
      <Sheet open={open()} onOpenChange={({ open: next }) => open.set(next)}>
        <SheetContent side="bottom" popupStyle={{ gap: 16 }}>
          <View style={{ gap: 8 }}>
            <View style={{ flexDirection: "row" }}>
              <Badge tone="accent">Sheet</Badge>
            </View>
            <Text
              style={{
                fontSize: 28,
                fontWeight: "700",
                letterSpacing: -0.5,
                color: colors.foreground,
              }}
            >
              A sheet
            </Text>
            <Text style={{ fontSize: 15, lineHeight: 21, color: colors.mutedForeground }}>
              {hint(
                "Tap outside it or press back (Android) to close.",
                "Press Escape or click outside it to close.",
              )}
            </Text>
          </View>
          <SheetClose>Close</SheetClose>
        </SheetContent>
      </Sheet>
    </Card>
  );
}

function LayoutAnimations() {
  const items = signal([1, 2, 3]);
  const preset = signal<(typeof presets)[number]["value"]>("spring");
  const nextId = () => Math.max(0, ...items()) + 1;
  const animate = (change: () => void) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets[preset()]);
    change();
  };
  return (
    <Card
      title="Layout animation"
      subtitle="configureNext, then change the tree"
      right={<Badge>{`${items().length}`}</Badge>}
    >
      <Segmented
        value={preset()}
        onValueChange={(p) => preset.set(p as "spring" | "easeInEaseOut" | "linear")}
      >
        <SegmentedList size="sm" fill>
          <Each of={presets}>
            {(p) => <SegmentedItem value={p().value}>{p().label}</SegmentedItem>}
          </Each>
        </SegmentedList>
      </Segmented>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, minHeight: 56 }}>
        <Each of={items()}>
          {(n) => (
            <View
              style={{
                width: 56,
                height: 56,
                borderRadius: 14,
                borderCurve: "continuous",
                backgroundColor: toneTint(tileTones[n() % tileTones.length]),
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text
                style={{
                  fontSize: 17,
                  fontWeight: "600",
                  fontVariant: ["tabular-nums"],
                  color: toneColor(tileTones[n() % tileTones.length]),
                }}
              >
                {n()}
              </Text>
            </View>
          )}
        </Each>
      </View>
      <View style={{ flexDirection: "row", gap: 8 }}>
        <Cell>
          <Button size="sm" onPress={() => animate(() => items.set([nextId(), ...items()]))}>
            Add
          </Button>
        </Cell>
        <Cell>
          <Button
            size="sm"
            variant="secondary"
            onPress={() => animate(() => items.set([...items()].sort(() => Math.random() - 0.5)))}
          >
            Shuffle
          </Button>
        </Cell>
        <Cell>
          <Button
            size="sm"
            variant="secondary"
            disabled={items().length === 0}
            onPress={() => animate(() => items.set(items().slice(1)))}
          >
            Remove
          </Button>
        </Cell>
      </View>
    </Card>
  );
}

function Accessory() {
  const text = signal("");
  const input = signal<InputRef | null>(null);
  return (
    <Card
      title="Input accessory"
      subtitle="A bar over the iOS keyboard"
      right={<Badge tone="accent">nsh/mobile</Badge>}
    >
      <Input
        ref={(node) => input.set(node)}
        value={text()}
        onChange={({ value }) => text.set(value)}
        placeholder="Focus me"
        ios={{ inputAccessoryViewID: "counter" }}
        style={{ height: 48, paddingHorizontal: 14, fontSize: 15 }}
      />
      <CaptionRow
        label={
          platform.desktop
            ? "Desktops have no input accessories"
            : platform.os === "android"
              ? "Android has no input accessories"
              : "The bar counts what you type"
        }
        note='inputAccessoryViewID="counter"'
      />
      <InputAccessoryView nativeID="counter" style={{ backgroundColor: colors.card }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
            paddingHorizontal: 16,
            paddingVertical: 8,
            borderTopWidth: hairline(),
            borderTopColor: colors.border,
          }}
        >
          <Text
            style={{
              flex: 1,
              fontSize: 13,
              color: colors.mutedForeground,
              fontVariant: ["tabular-nums"],
            }}
          >
            {`${text().length} characters`}
          </Text>
          <Button size="sm" variant="secondary" onPress={() => text.set("")}>
            Clear
          </Button>
          <Button size="sm" onPress={() => input()?.blur()}>
            Done
          </Button>
        </View>
      </InputAccessoryView>
    </Card>
  );
}

function Avoiding() {
  const behavior = signal<"padding" | "height">("padding");
  const typed = signal("");
  return (
    <Card title="Keyboard avoidance" subtitle="Content outside scroll views">
      <Segmented value={behavior()} onValueChange={(b) => behavior.set(b as "padding" | "height")}>
        <SegmentedList size="sm" fill>
          <Each of={behaviors}>
            {(b) => <SegmentedItem value={b().value}>{b().label}</SegmentedItem>}
          </Each>
        </SegmentedList>
      </Segmented>
      <View
        style={{
          height: 200,
          borderRadius: shape.control,
          borderCurve: "continuous",
          overflow: "hidden",
          backgroundColor: tints.info,
          ...(behavior() === "padding"
            ? { paddingBottom: "env(keyboard-inset-height)" }
            : { marginBottom: "env(keyboard-inset-height)" }),
        }}
      >
        <View style={{ flex: 1, padding: 12, gap: 8, justifyContent: "space-between" }}>
          <Text style={{ fontSize: 13, lineHeight: 19, color: colors.foreground }}>
            {behaviorNote[behavior()]}
          </Text>
          <Input
            value={typed()}
            onChange={({ value }) => typed.set(value)}
            placeholder="Focus me"
            ios={{ inputAccessoryViewID: "counter" }}
            style={{ height: 48, paddingHorizontal: 14, fontSize: 15 }}
          />
        </View>
      </View>
      <CaptionRow
        label={`behavior="${behavior()}"`}
        note={platform.desktop ? "No keyboard on a desktop" : "Focus the field at the bottom"}
      />
    </Card>
  );
}

function ModalOptions() {
  const visible = signal(false);
  const translucent = signal(false);
  return (
    <Card
      title="Dialog options"
      subtitle="statusBarTranslucent, orientations"
      right={
        <LabeledToggle
          label="Translucent"
          value={translucent()}
          onChange={(v) => translucent.set(v)}
        />
      }
    >
      <Text style={{ fontSize: 14, lineHeight: 20, color: colors.mutedForeground }}>
        Android: translucent content reaches under the status bar. iOS: this dialog allows portrait
        and landscape.
      </Text>
      <CaptionRow label="statusBarTranslucent" note={String(translucent())} />
      <Button variant="secondary" size="sm" onPress={() => visible.set(true)}>
        Open the dialog
      </Button>
      <Dialog open={visible()} onOpenChange={({ open }) => visible.set(open)}>
        <DialogContent
          animation="slide"
          android={{ statusBarTranslucent: translucent() }}
          ios={{ supportedOrientations: ["portrait", "landscape"] }}
          style={{
            flex: 1,
            margin: 0,
            maxWidth: "100%",
            padding: 0,
            borderRadius: 0,
            borderWidth: 0,
          }}
        >
          <View
            style={{
              flex: 1,
              backgroundColor: colors.background,
              paddingTop: "calc(env(safe-area-inset-top) + 16px)",
              paddingRight: "calc(env(safe-area-inset-right) + 16px)",
              paddingBottom: "calc(env(safe-area-inset-bottom) + 16px)",
              paddingLeft: "calc(env(safe-area-inset-left) + 16px)",
              gap: 12,
            }}
          >
            <View style={{ flexDirection: "row", paddingTop: 8 }}>
              <Badge tone="accent">{translucent() ? "translucent" : "opaque bar"}</Badge>
            </View>
            <DialogTitle style={{ fontSize: 28, fontWeight: "700", letterSpacing: -0.5 }}>
              A dialog
            </DialogTitle>
            <Text style={{ fontSize: 15, lineHeight: 21, color: colors.mutedForeground }}>
              The background starts {translucent() ? "under" : "below"} the status bar on Android.
            </Text>
            <View style={{ flex: 1 }} />
            <Button onPress={() => visible.set(false)}>Close</Button>
          </View>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

function PlatformInfo() {
  const rows = (): [string, string][] => [
    ["platform.os", platform.os],
    ["platform.version", platform.version],
    [
      "platform.idiom / desktop / catalyst",
      `${platform.idiom} / ${platform.desktop} / ${platform.catalyst}`,
    ],
    [
      "platform.select",
      platform.select({
        ios: "ios branch",
        android: "android branch",
        default: "default branch",
      }) ?? "",
    ],
    ["pixelRatio()", String(pixelRatio())],
    ["10.3 on whole pixels", String(Math.round(10.3 * pixelRatio()) / pixelRatio())],
    ["screenReaderEnabled()", String(screenReaderEnabled())],
    ["reduceMotion()", String(reduceMotion())],
    ["locale()", locale()],
  ];
  const announced = signal(0);
  const target = signal<ViewRef | null>(null);
  return (
    <Card
      title="Platform"
      subtitle="platform, pixelRatio, announce"
      right={<Badge tone="accent">{platform.os}</Badge>}
    >
      <View>
        <Each of={rows()}>
          {(row, i) => (
            <View style={listRow({ first: i() === 0 }).style}>
              <RowDivider show={i() !== 0} />
              <RowLabel label={row()[0]} />
              <Text
                style={{
                  fontSize: 14,
                  color: colors.foreground,
                  fontVariant: ["tabular-nums"],
                  numberOfLines: 1,
                }}
              >
                {row()[1]}
              </Text>
            </View>
          )}
        </Each>
      </View>
      <View style={{ height: hairline(), backgroundColor: colors.brand }} />
      <CaptionRow
        label="The line above is one device pixel tall"
        note={`${hairline().toFixed(3)} pt`}
      />
      <View style={{ flexDirection: "row", gap: 8 }}>
        <Cell>
          <Button
            size="sm"
            onPress={() => {
              announced.set(announced() + 1);
              announce(`Announcement ${announced()}`);
            }}
          >
            Announce
          </Button>
        </Cell>
        <Cell>
          <Button
            size="sm"
            variant="secondary"
            onPress={() => {
              const node = target();
              if (node) setAccessibilityFocus(node);
            }}
          >
            Focus the note
          </Button>
        </Cell>
      </View>
      <Text
        ref={(node) => target.set(node)}
        style={{ fontSize: 13, lineHeight: 18, color: colors.faint }}
      >
        With VoiceOver or TalkBack on, the buttons above speak and move the reader here.
      </Text>
    </Card>
  );
}

/** What the demo's cards report last: one line under the title. */
const last = signal("—");

export function PatternsDemo() {
  /** Press feedback is native: opacity, an underlay, classes; `disabled` takes no presses. */
  /** A sheet a pressed row opens: the library's panel, its grabber and the card's surface. */
  /** A change of the tree inside `LayoutAnimation.configureNext`: the cells slide to their places. */
  /** A bar over the iOS keyboard, counting what the field holds. */
  /**
   * The keyboard's height kept clear: `padding` leaves the tinted background under the keyboard,
   * `height` (a margin) ends it there. The gallery pushes a page of its own for this; the
   * showcase's page is the shell's, so the frames stand inside the card's box.
   */
  /** A dialog's platform options: Android's translucent bar, iOS' orientations. */
  /** What the app can ask of the platform, and the one-pixel line it draws. */
  return (
    <DemoPage title="Patterns" note={() => `Last: ${last()}`}>
      <PressFeedback />
      <PressableSheet />
      <LayoutAnimations />
      <Accessory />
      <Avoiding />
      <ModalOptions />
      <PlatformInfo />
    </DemoPage>
  );
}
