// `Tray` of nsh/desktop: the app's icon in the system tray with a tooltip, a click and a menu. A
// click opens a panel next to the icon, placed from the frame the click reports (macOS, Windows);
// where the system reports no frame (Linux), it brings the showcase forward.
import { alpha, colors, finish } from "@shadcn-nsh/theme";
import { Star } from "lucide";
import { cleanup, effect, type Bounds, type Point, type Size, signal, Text, View } from "nsh";
import {
  currentWindow,
  displays,
  isAvailable,
  Tray,
  type TrayClickEvent,
  Window,
  windowState,
} from "nsh/desktop";

import { Button } from "@/packages/ui/button";
import { ItemMedia } from "@/packages/ui/item";
import { Icon } from "@/packages/ui/lib/icons";
import { PopIn } from "@/packages/ui/lib/popup";
import { Status } from "@/packages/ui/status";
import { Switch } from "@/packages/ui/switch";

import star from "../assets/star.svg";
import { DemoPage } from "../kit";
import { Caption, Card, Note, Row } from "./platform-shared";

/**
 * The tray panel's size, in points: its rows (the header's 36, the setting's 31, the button's 28,
 * 12 apart) 14 in from a 1-point edge.
 */
const PANEL: Size = { width: 288, height: 2 * (1 + 14) + 36 + 12 + 31 + 12 + 28 };

/** The clock, read through a function so no press calls it directly. */
function clock(): number {
  return Date.now();
}
/** The room between the icon and the panel. */
const GAP = 6;

/** `Tray.set`: the icon, its tooltip, a click and a menu; the panel the click opens. */
export function TrayDemo() {
  // The window this demo shows in, kept for the menu's handler.
  const main = currentWindow();
  const shown = signal(false);
  const last = signal("Nothing yet");
  const muted = signal(false);
  /** The icon's frame the last click reported, as text. */
  const frame = signal<string | null>(null);
  /** Where the panel is, while it is open. */
  const panel = signal<Placement | null>(null);
  // When the panel last closed as the focus left it: a click on the icon that took the focus
  // (Windows' taskbar) leaves it closed.
  const closedAt = signal(0);
  const toggleMute = () => {
    muted.set(!muted());
    showTray();
    last.set(muted() ? "Muted" : "Sound on");
  };
  const clicked = ({ bounds }: TrayClickEvent) => {
    frame.set(bounds ? describe(bounds) : null);
    if (!bounds) {
      main.focus();
      last.set("Clicked the icon");
      return;
    }
    if (panel()) {
      panel.set(null);
      return;
    }
    if (clock() - closedAt() < 400) return;
    panel.set(atIcon(bounds, PANEL));
    last.set("Opened the panel");
  };
  const showTray = () => {
    shown.set(true);
    Tray.set({
      icon: star,
      tooltip: "shadcn-nsh showcase",
      onClick: clicked,
      menu: [
        { label: "Open showcase", onSelect: () => (main.focus(), last.set("Chose Open showcase")) },
        { label: "Mute", checked: muted(), onSelect: toggleMute },
        { type: "separator" },
        {
          label: "More",
          submenu: [{ label: "About", onSelect: () => last.set("Chose About") }],
        },
        { label: "Remove icon", onSelect: () => hideTray() },
      ],
    });
  };
  const hideTray = () => {
    shown.set(false);
    panel.set(null);
    Tray.set(null);
  };
  cleanup(() => Tray.set(null));
  return (
    <DemoPage title="Tray">
      <Card
        title="Tray icon"
        subtitle={isAvailable ? "Click it, or open its menu" : "Desktops only"}
      >
        <Row first>
          <Button disabled={!isAvailable} onPress={showTray}>
            {shown() ? "Update" : "Show icon"}
          </Button>
          <Button variant="ghost" disabled={!isAvailable} onPress={hideTray}>
            Remove
          </Button>
        </Row>
        <Caption label={last()} note={frame() ?? undefined} />
        <Note>
          The icon sits in the system tray, outside the window; the panel opens next to it and
          closes when the focus leaves it.
        </Note>
        {/* Opened by a click on the icon, next to it; it closes with this page. */}
        <Window
          id="tray-panel"
          kind="popup"
          transparent
          open={panel() !== null}
          onOpenChange={({ open, reason }) => {
            if (!open) {
              panel.set(null);
              if (reason === "blur") closedAt.set(clock());
            }
          }}
          defaultSize={PANEL}
          // As tall as its rows: taller with a larger text size.
          sizeToContent="height"
          defaultPosition={panel()?.at ?? "center"}
        >
          <TrayPanel
            below={panel()?.below ?? true}
            bottom={panel()?.bottom ?? null}
            muted={muted()}
            onMute={toggleMute}
            onOpen={() => {
              panel.set(null);
              main.focus();
              last.set("Chose Open showcase");
            }}
          />
        </Window>
      </Card>
    </DemoPage>
  );
}

/** What a menu-bar app shows from its icon: its state, a setting and a way to its window. Above
 * the icon, its bottom edge stays at `bottom`. */
function TrayPanel(props: {
  below: boolean;
  bottom: number | null;
  muted: boolean;
  onMute: () => void;
  onOpen: () => void;
}) {
  const win = currentWindow();
  // The window takes its rows' height, taller with a larger text size: above the icon, it moves up
  // by as much.
  effect(() => {
    const bounds = windowState()?.bounds;
    if (!bounds || props.bottom === null) return;
    const y = props.bottom - bounds.size.height;
    if (Math.abs(bounds.origin.y - y) > 0.5) win.setBounds({ origin: { y } });
  });
  return (
    <PopIn
      side={props.below ? "bottom" : "top"}
      style={[
        finish.card,
        {
          padding: 14,
          gap: 12,
          borderRadius: 14,
          borderCurve: "continuous",
          borderWidth: 1,
          borderColor: colors.border,
        },
      ]}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
        <ItemMedia
          variant="icon"
          style={{
            width: 32,
            height: 32,
            borderRadius: 9,
            borderColor: "transparent",
            backgroundColor: alpha(colors.warn, 0.16),
          }}
        >
          <Icon icon={Star} size={16} tint={colors.warn} fill />
        </ItemMedia>
        <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
          <Text
            style={{ fontSize: 14, lineHeight: 18, fontWeight: "600", color: colors.foreground }}
          >
            shadcn-nsh showcase
          </Text>
          <Text style={{ fontSize: 12, lineHeight: 16, color: colors.mutedForeground }}>
            Opened from the tray
          </Text>
        </View>
        <Status label={props.muted ? "Muted" : "Sound on"} tone={props.muted ? "neutral" : "up"} />
      </View>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 12,
          borderTopWidth: 1,
          borderTopColor: colors.line,
          paddingTop: 12,
        }}
      >
        <Text style={{ flex: 1, fontSize: 13, lineHeight: 18, color: colors.foreground }}>
          Mute sounds
        </Text>
        <Switch
          checked={props.muted}
          onChange={() => props.onMute()}
          accessibilityLabel="Mute sounds"
        />
      </View>
      <Button onPress={props.onOpen}>Open showcase</Button>
    </PopIn>
  );
}

/** A frame as the caption shows it: its corner and size, in points. */
function describe(b: Bounds) {
  const n = (v: number) => Math.round(v);
  return `${n(b.origin.x)}, ${n(b.origin.y)} · ${n(b.size.width)} × ${n(b.size.height)}`;
}

/** Where the panel opens: its top left corner, the icon's side it is on, and above the icon, the
 * y its bottom edge keeps (`null` below it). */
type Placement = { at: Point; below: boolean; bottom: number | null };

/** Where a panel of `size` opens at the tray icon: centered on it, below it on a menu bar at the
 * top of its display, above it on a taskbar at the bottom, kept in the display's visible area. */
function atIcon(icon: Bounds, size: Size): Placement {
  const inside = (b: Bounds, p: Point) =>
    p.x >= b.origin.x &&
    p.x < b.origin.x + b.size.width &&
    p.y >= b.origin.y &&
    p.y < b.origin.y + b.size.height;
  const display = displays().find((d) => inside(d.bounds, icon.origin)) ?? displays()[0];
  if (!display) {
    return {
      at: { x: icon.origin.x, y: icon.origin.y + icon.size.height + GAP },
      below: true,
      bottom: null,
    };
  }
  const area = display.visibleBounds;
  const below = icon.origin.y < area.origin.y + area.size.height / 2;
  const x = icon.origin.x + (icon.size.width - size.width) / 2;
  const y = below ? icon.origin.y + icon.size.height + GAP : icon.origin.y - size.height - GAP;
  const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), max);
  const at = {
    x: clamp(x, area.origin.x, area.origin.x + area.size.width - size.width),
    y: clamp(y, area.origin.y, area.origin.y + area.size.height - size.height),
  };
  return { at, below, bottom: below ? null : at.y + size.height };
}
