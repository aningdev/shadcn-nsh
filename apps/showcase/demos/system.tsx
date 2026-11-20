import fs from "fs/promises";
import process from "process";

import { colors, finish, isDark, tints, type Tone, toneColor } from "@shadcn-nsh/theme";
import {
  Bell,
  Check,
  ClipboardPaste,
  Copy,
  FileText,
  Link2,
  List,
  Mail,
  Share2,
  Sparkles,
  Star,
  Text as TextIcon,
} from "lucide";
// nsh's environment and system surfaces: the window, its insets and keyboard, a dialog's status
// bar, the system's alerts and share sheet, frames and timers, the app's shortcuts, a context menu
// and the network. The scenes follow the official gallery's System demo.
import {
  createAnimatedValue,
  Easing,
  fontScale,
  fpsEnabled,
  horizontalSizeClass,
  keyboardFrame,
  keymap,
  platform,
  resource,
  safeArea,
  setFpsEnabled,
  Share,
  signal,
  Text,
  verticalSizeClass,
  View,
  windowSize,
  type ShareResult,
  type ViewRef,
} from "nsh";
import { cleanup } from "nsh";
import { AlertDialog, type AlertDialogAction, Dialog, type StatusBarForeground } from "nsh/base";
import { Menu } from "nsh/desktop";

import { Badge } from "@/packages/ui/badge";
import { Button } from "@/packages/ui/button";
import { iconImage } from "@/packages/ui/lib/icons";
import { Progress } from "@/packages/ui/progress";
import { Segmented, SegmentedItem, SegmentedList } from "@/packages/ui/segmented";
import { Stat } from "@/packages/ui/stat";
import { Switch } from "@/packages/ui/switch";
import { toast, Toaster } from "@/packages/ui/toast";

import { DemoPage } from "../kit";
import { ActionRow, Caption, Card, Figure, Legend, Note, Row, monoText } from "./platform-shared";

/** The window drawn to scale, with the safe area insets shaded. */
function SafeAreaDiagram() {
  const width = 76;
  const scale = () => width / Math.max(1, windowSize().width);
  const height = () => Math.round(windowSize().height * scale());
  const band = (pt: number) => Math.max(0, Math.round(pt * scale()));
  return (
    <View
      style={{
        width,
        height: height(),
        borderRadius: 14,
        borderCurve: "continuous",
        borderWidth: 1.5,
        borderColor: colors.border,
        backgroundColor: colors.inset,
        backgroundImage: finish.card.backgroundImage,
        overflow: "hidden",
      }}
    >
      <View style={{ height: band(safeArea().top), backgroundColor: tints.info }} />
      <View
        style={{
          flex: 1,
          margin: 6,
          borderRadius: 6,
          borderWidth: 1,
          borderColor: colors.line,
          borderStyle: "dashed",
        }}
      />
      <View style={{ height: band(keyboardFrame().height), backgroundColor: tints.warn }} />
      <View style={{ height: band(safeArea().bottom), backgroundColor: tints.info }} />
    </View>
  );
}

function Environment() {
  const insets = () => [
    { label: "Top", value: safeArea().top },
    { label: "Right", value: safeArea().right },
    { label: "Bottom", value: safeArea().bottom },
    { label: "Left", value: safeArea().left },
  ];
  return (
    <Card
      title="Environment"
      subtitle="Follows the window, insets and keyboard"
      right={<Badge tone="up">Live</Badge>}
    >
      <View style={{ flexDirection: "row", gap: 16, alignItems: "center" }}>
        <SafeAreaDiagram />
        <View style={{ flex: 1, gap: 2 }}>
          <Text style={{ fontSize: 12, color: colors.mutedForeground }}>Window</Text>
          <Figure
            value={`${Math.round(windowSize().width)} × ${Math.round(windowSize().height)}`}
            unit="pt"
          />
        </View>
      </View>
      <View style={{ height: 1, backgroundColor: colors.line }} />
      <View style={{ flexDirection: "row", gap: 12 }}>
        <Stat
          label="Keyboard"
          value={String(Math.round(keyboardFrame().height))}
          unit="pt"
          tone={keyboardFrame().height > 0 ? "warn" : undefined}
          width="50%"
        />
        <Stat label="Font scale" value={`${fontScale().toFixed(2)}×`} width="50%" />
      </View>
      <Caption label="Size classes" note="Resize or rotate the window" />
      <View style={{ flexDirection: "row", gap: 12 }}>
        <Stat label="Horizontal" value={capitalized(horizontalSizeClass())} width="50%" />
        <Stat label="Vertical" value={capitalized(verticalSizeClass())} width="50%" />
      </View>
      <Caption label="Safe area insets" note="pt" />
      <View style={{ flexDirection: "row", gap: 8 }}>
        <Each of={insets()}>
          {(inset) => (
            <Stat label={inset().label} value={String(Math.round(inset().value))} width="25%" />
          )}
        </Each>
      </View>
      <View style={{ height: 1, backgroundColor: colors.line }} />
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
        <Legend color={tints.info} label="Safe area" />
        <Legend color={tints.warn} label="Keyboard" />
        <View style={{ flex: 1 }} />
        <Badge variant="outline" tone={isDark() ? "info" : "warn"}>
          {isDark() ? "Dark scheme" : "Light scheme"}
        </Badge>
      </View>
    </Card>
  );
}

/** `compact` / `regular` with a capital. */
function capitalized(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function StatusBarCard() {
  const picked = signal<StatusBarForeground | null>(null);
  const foreground = () => picked() ?? (isDark() ? "light" : "dark");
  const barHidden = signal(false);
  const open = signal(false);
  // A dark surface and a light one, whichever appearance is on: the two
  // backdrops the preview offers, both from the theme.
  const darkSurface = () => (isDark() ? colors.background : colors.foreground);
  const lightSurface = () => (isDark() ? colors.foreground : colors.background);
  // The preview's background and its ink: the ones the foreground is for.
  const backdrop = () =>
    foreground() === "light"
      ? darkSurface()
      : foreground() === "dark"
        ? lightSurface()
        : colors.background;
  const ink = () =>
    foreground() === "light"
      ? lightSurface()
      : foreground() === "dark"
        ? darkSurface()
        : colors.foreground;
  return (
    <Card title="Status bar" subtitle="A dialog's statusBar: over the page's while it is open">
      <Segmented
        value={foreground()}
        onValueChange={(value) => picked.set(value as StatusBarForeground)}
      >
        <SegmentedList accessibilityLabel="Status bar foreground">
          <SegmentedItem value="light">Light</SegmentedItem>
          <SegmentedItem value="dark">Dark</SegmentedItem>
          <SegmentedItem value="auto">Auto</SegmentedItem>
        </SegmentedList>
      </Segmented>
      <Row>
        <View style={{ flex: 1, gap: 2 }}>
          <Text style={{ fontSize: 15, color: colors.foreground }}>Hidden</Text>
          <Text
            style={monoText(12, colors.mutedForeground)}
          >{`foreground: "${foreground()}"`}</Text>
        </View>
        <Switch
          checked={barHidden()}
          onChange={({ checked }) => barHidden.set(checked)}
          accessibilityLabel="Hide the status bar"
        />
      </Row>
      <Button onPress={() => open.set(true)}>Preview</Button>
      <Dialog
        open={open()}
        animation="fade"
        statusBar={{ foreground: foreground(), hidden: barHidden(), animated: true }}
        onOpenChange={({ open: next }) => open.set(next)}
        style={{ flex: 1 }}
      >
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            gap: 16,
            backgroundColor: backdrop(),
          }}
        >
          <Text style={monoText(13, ink())}>
            {`statusBar: { foreground: "${foreground()}", hidden: ${barHidden()} }`}
          </Text>
          <Button variant="secondary" onPress={() => open.set(false)}>
            Close
          </Button>
        </View>
      </Dialog>
    </Card>
  );
}

/** What the gallery shows for the action `AlertDialog.show` reported: its label (none: dismissed). */
function labelOf(actions: AlertDialogAction[], id?: string | null): string {
  return actions.find((action) => action.id === id)?.label ?? "dismissed";
}

function Dialogs() {
  const answer = signal<{ text: string; tone: Tone } | null>(null);
  // The answer pops in each time it changes.
  const pop = createAnimatedValue(1);
  const show = (text: string, tone: Tone = "neutral") => {
    answer.set({ text, tone });
    pop.set(0.85);
    void pop.spring(1, { stiffness: 380, damping: 18 });
  };
  const answerRow = (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        paddingHorizontal: 11,
        paddingTop: 12,
        paddingBottom: 11,
        minHeight: 44,
      }}
    >
      <Text style={{ flex: 1, fontSize: 13, color: colors.mutedForeground }}>Answer</Text>
      <If
        when={answer()}
        else={<Text style={{ fontSize: 13, color: colors.faint }}>None yet</Text>}
      >
        <View style={{ scale: pop }}>
          <Badge tone={answer()?.tone}>{answer()?.text ?? ""}</Badge>
        </View>
      </If>
    </View>
  );
  return (
    <Card title="Alerts and sheets" subtitle="AlertDialog · Toast">
      <ActionRow
        first
        icon={Check}
        tint={colors.up}
        title="Alert"
        detail="One button"
        onPress={() => {
          void AlertDialog.show({
            title: "Saved",
            description: "Your changes were saved.",
            actions: [{ label: "OK", id: "ok" }],
          }).then(() => show("OK", "up"));
        }}
      />
      <ActionRow
        icon={Bell}
        tint={colors.destructive}
        title="Confirm"
        detail="Cancel and destructive buttons"
        onPress={() => {
          const actions: AlertDialogAction[] = [
            { label: "Cancel", role: "cancel", id: "cancel" },
            { label: "Delete", role: "destructive", id: "delete" },
          ];
          void AlertDialog.show({
            title: "Delete the photo?",
            description: "This cannot be undone.",
            actions,
            closeOnEscape: true,
            closeOnBackdropPress: true,
          }).then(({ action }) =>
            show(labelOf(actions, action), action === "delete" ? "destructive" : "neutral"),
          );
        }}
      />
      <ActionRow
        icon={Star}
        tint={colors.info}
        title="Three buttons"
        detail="Shows the label of the action pressed"
        onPress={() => {
          const actions: AlertDialogAction[] = [
            { label: "Later", id: "later" },
            { label: "Never", role: "cancel", id: "never" },
            { label: "Install", id: "install" },
          ];
          void AlertDialog.show({
            title: "Update available",
            description: "Install it now?",
            actions,
          }).then(({ action }) =>
            show(labelOf(actions, action), action === "install" ? "info" : "neutral"),
          );
        }}
      />
      <ActionRow
        icon={List}
        tint={colors.brand}
        title="Action sheet"
        detail="Title, cancel and destructive options"
        onPress={() => {
          const actions: AlertDialogAction[] = [
            { label: "Cancel", role: "cancel", id: "cancel" },
            { label: "Copy link", id: "copy" },
            { label: "Save", id: "save" },
            { label: "Delete", role: "destructive", id: "delete" },
          ];
          void AlertDialog.show({
            title: "Share the photo",
            presentation: "actionSheet",
            actions,
          }).then(({ action }) =>
            show(labelOf(actions, action), action === "delete" ? "destructive" : "accent"),
          );
        }}
      />
      <ActionRow
        icon={Sparkles}
        tint={colors.warn}
        title="Toast"
        detail="nsh/base's Toast, every platform"
        onPress={() =>
          toast("Hello from a toast", {
            description: "nsh/base's ToastManager, styled by the library",
          })
        }
      />
      {answerRow}
    </Card>
  );
}

/** A share's target as people know it: Apple's activity types end in its name. */
function targetName(target: string): string {
  const apple = "com.apple.UIKit.activity.";
  return target.startsWith(apple) ? target.slice(apple.length) : target;
}

const TRIP = {
  title: "Weekend in Kyoto",
  text: "Our plan for the weekend: temples in the morning, the market at noon.",
  url: "https://example.com/trips/kyoto",
};

function ShareSheet() {
  const available = signal<boolean | null>(null);
  void Share.available().then(
    (yes) => available.set(yes),
    () => available.set(false),
  );
  const answer = signal<{ text: string; tone: Tone } | null>(null);
  const pop = createAnimatedValue(1);
  const show = (text: string, tone: Tone) => {
    answer.set({ text, tone });
    pop.set(0.85);
    void pop.spring(1, { stiffness: 380, damping: 18 });
  };
  // How the share ended, or why there was none: never "shared" for a share
  // the platform could not show.
  const report = async (share: () => Promise<ShareResult>, unavailable = "No share sheet here") => {
    try {
      const { action, target } = await share();
      if (action === "shared") show(target ? `Shared to ${targetName(target)}` : "Shared", "up");
      else show("Dismissed", "neutral");
    } catch (error) {
      const failure = error as Error & { code?: string };
      if (failure.code === "ERR_FEATURE_UNAVAILABLE_ON_PLATFORM") show(unavailable, "warn");
      else show(failure.message, "destructive");
    }
  };
  // The rows the sheet points at on an iPad and on macOS.
  const link = signal<ViewRef | null>(null);
  const note = signal<ViewRef | null>(null);
  const quote = signal<ViewRef | null>(null);
  return (
    <Card
      title="Share sheet"
      subtitle="Share.show · the system's own sheet"
      right={
        <If when={available() !== null}>
          <Badge tone={available() ? "up" : undefined}>
            {available() ? "Available" : "Not on this platform"}
          </Badge>
        </If>
      }
    >
      <View
        style={{
          borderRadius: 10,
          borderCurve: "continuous",
          backgroundColor: colors.inset,
          paddingHorizontal: 12,
        }}
      >
        <View
          ref={(ref) => {
            link.set(ref);
          }}
        >
          <ActionRow
            first
            icon={Link2}
            tint={colors.info}
            title="A link"
            detail={`${TRIP.title} · title, text and URL`}
            onPress={() => void report(() => Share.show({ ...TRIP, anchor: link() ?? undefined }))}
          />
        </View>
        <View
          ref={(ref) => {
            note.set(ref);
          }}
        >
          <ActionRow
            icon={FileText}
            tint={colors.brand}
            title="A file"
            detail="An itinerary written to the app's data directory"
            onPress={() =>
              void report(async () => {
                if (!process.dataDir) throw new Error("This host gives the app no data directory");
                const path = `${process.dataDir}/kyoto-itinerary.txt`;
                await fs.writeFile(
                  path,
                  `${TRIP.title}\n\nSaturday: Fushimi Inari, Nishiki Market\nSunday: Arashiyama\n`,
                );
                return Share.show({
                  title: TRIP.title,
                  files: [path],
                  anchor: note() ?? undefined,
                });
              }, "Files are not shared here")
            }
          />
        </View>
        <View
          ref={(ref) => {
            quote.set(ref);
          }}
        >
          <ActionRow
            icon={TextIcon}
            tint={colors.warn}
            title="Only text"
            detail="A line of text, no link"
            onPress={() =>
              void report(() => Share.show({ text: TRIP.text, anchor: quote() ?? undefined }))
            }
          />
        </View>
      </View>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 10,
          paddingHorizontal: 11,
          paddingTop: 12,
          paddingBottom: 11,
          minHeight: 44,
        }}
      >
        <Text style={{ flex: 1, fontSize: 13, color: colors.mutedForeground }}>Result</Text>
        <If
          when={answer()}
          else={<Text style={{ fontSize: 13, color: colors.faint }}>None yet</Text>}
        >
          <View style={{ scale: pop }}>
            <Badge tone={answer()?.tone}>{answer()?.text ?? ""}</Badge>
          </View>
        </If>
      </View>
    </Card>
  );
}

/** The clock, read through a function so no render pass calls it itself. */
function now(): number {
  return performance.now();
}

function FramesAndTimers() {
  const fps = signal(0);
  const running = signal(false);
  const ticks = signal(0);
  // The beat dot flashes once per tick; the fade runs natively.
  const beat = createAnimatedValue(0);

  // Frames per second, counted with requestAnimationFrame. The count and the
  // frame it is counting in are signals, written after the render pass.
  const frame = signal(0);
  const frames = signal(0);
  const since = signal(0);
  const loop = (time: number) => {
    frames.set(frames() + 1);
    if (time - since() >= 1000) {
      fps.set(Math.round((frames() * 1000) / (time - since())));
      frames.set(0);
      since.set(time);
    }
    frame.set(requestAnimationFrame(loop));
  };
  const toggle = () => {
    if (running()) cancelAnimationFrame(frame());
    else {
      frames.set(0);
      since.set(now());
      frame.set(requestAnimationFrame(loop));
    }
    running.set(!running());
  };
  const timer = setInterval(() => {
    ticks.set(ticks() + 1);
    beat.set(1);
    void beat.timing(0, { duration: 700, easing: Easing.out(Easing.quad) });
  }, 1000);
  cleanup(() => {
    clearInterval(timer);
    cancelAnimationFrame(frame());
  });

  return (
    <Card title="Frames and timers" subtitle="requestAnimationFrame · setInterval">
      <View style={{ flexDirection: "row", gap: 12 }}>
        <View style={{ flex: 1, gap: 2 }}>
          <Text style={{ fontSize: 12, color: colors.mutedForeground }}>Frame rate</Text>
          <Figure
            value={running() ? String(fps()) : "–"}
            unit="fps"
            note={running() ? "live" : "stopped"}
            tone={running() ? "up" : "neutral"}
          />
        </View>
        <View style={{ width: 1, backgroundColor: colors.line }} />
        <View style={{ flex: 1, gap: 2 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <Text style={{ fontSize: 12, color: colors.mutedForeground }}>Interval ticks</Text>
            <View
              style={{
                width: 7,
                height: 7,
                borderRadius: 3.5,
                backgroundColor: colors.brand,
                opacity: beat.interpolate({ inputRange: [0, 1], outputRange: [0.25, 1] }),
                scale: beat.interpolate({ inputRange: [0, 1], outputRange: [1, 1.6] }),
              }}
            />
          </View>
          <Figure value={String(ticks())} note="every 1 s" tone="accent" />
        </View>
      </View>
      <View style={{ gap: 8 }}>
        <Caption
          label="Share of 120 fps"
          note={running() ? `${Math.round((fps() / 120) * 100)}%` : "–"}
        />
        <Progress height={8} tone="up" value={(running() ? fps() / 120 : 0) * 100} marker={50} />
      </View>
      <Button variant="secondary" onPress={toggle}>
        {running() ? "Stop counting frames" : "Count frames"}
      </Button>
      <Row>
        <View style={{ flex: 1, gap: 2 }}>
          <Text style={{ fontSize: 15, color: colors.foreground }}>Performance monitor</Text>
          <Text style={{ fontSize: 12, color: colors.mutedForeground }}>
            {platform.os === "macos"
              ? "Frame and commit costs, CPU and memory"
              : "Frame and commit costs in the log"}
          </Text>
        </View>
        <Switch
          checked={fpsEnabled()}
          onChange={({ checked }) => setFpsEnabled(checked)}
          accessibilityLabel="Performance monitor"
        />
      </Row>
    </Card>
  );
}

/** App-level shortcuts: bound while the demo shows (the component's own). */
function Shortcuts() {
  const count = signal(0);
  const on = signal(false);
  const last = signal("");
  keymap.bind({
    "mod+k": ({ keystroke }) => {
      count.set(count() + 1);
      last.set(keystroke);
    },
    "mod+shift+l": ({ keystroke }) => {
      on.set(!on());
      last.set(keystroke);
    },
  });
  keymap.bind(
    "mod+backspace",
    ({ keystroke }) => {
      count.set(0);
      last.set(keystroke);
    },
    { when: "notEditing" },
  );
  const keys: [string, string][] = [
    [keymap.label("mod+k"), "Counts"],
    [keymap.label("mod+shift+l"), "Switches the light"],
    [keymap.label("mod+backspace"), "Resets (not while typing)"],
  ];
  return (
    <Card title="Keyboard shortcuts" subtitle="nsh/keymap · desktop">
      <View>
        <Each of={keys}>
          {(key, i) => (
            <Row first={i() === 0}>
              <Text style={[monoText(14, colors.brand), { width: 120 }]}>{key()[0]}</Text>
              <Text style={{ flex: 1, fontSize: 15, color: colors.foreground }}>{key()[1]}</Text>
            </Row>
          )}
        </Each>
      </View>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <Badge tone={on() ? "up" : undefined}>{on() ? "Light on" : "Light off"}</Badge>
        <View style={{ flex: 1 }}>
          <Caption label={`Counted ${count()}`} note={last() || "–"} />
        </View>
      </View>
    </Card>
  );
}

/** A context menu on a right click (desktops: `Menu.popup`). */
function ContextMenu() {
  const chosen = signal("");
  const menu = () =>
    Menu.popup([
      { label: "Copy", icon: iconImage(Copy), onSelect: () => chosen.set("Copy") },
      { label: "Paste", icon: iconImage(ClipboardPaste), disabled: true },
      {
        label: "Share",
        icon: iconImage(Share2),
        submenu: [
          { label: "Mail", icon: iconImage(Mail), onSelect: () => chosen.set("Share > Mail") },
        ],
      },
    ]);
  return (
    <Card title="Context menu" subtitle="nsh/desktop · right click">
      <View
        testID="menu-target"
        onContextMenu={() => void menu()}
        style={{
          height: 72,
          borderRadius: 12,
          borderCurve: "continuous",
          borderWidth: 1,
          borderColor: colors.border,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text style={{ fontSize: 14, color: colors.mutedForeground }}>
          {chosen() ? `Chose ${chosen()}` : "Right-click here"}
        </Text>
      </View>
    </Card>
  );
}

type Post = { id: number; title: string };

function Network() {
  // Loads once asked, and again on each press after: a resource keeps the
  // posts while it loads again, and a failure next to them.
  const asked = signal(false);
  const result = resource(asked, async (_, { signal: abort }) => {
    const started = now();
    const response = await fetch("https://jsonplaceholder.typicode.com/posts?_limit=3", {
      signal: abort,
    });
    const posts: Post[] = (await response.json()) as Post[];
    return {
      posts,
      ok: response.ok,
      line: `HTTP ${response.status} · ${Math.round(now() - started)} ms`,
    };
  });
  const posts = () => result()?.posts ?? [];
  const status = (): { text: string; tone: Tone } | null => {
    if (result.loading()) return { text: "loading…", tone: "neutral" };
    if (result.error()) return { text: String(result.error()), tone: "destructive" };
    const done = result();
    return done ? { text: done.line, tone: done.ok ? "up" : "destructive" } : null;
  };
  const load = () => (asked() ? result.refetch() : asked.set(true));
  return (
    <Card title="Network and logs" subtitle="fetch() · console.log">
      <If
        when={posts().length > 0}
        else={<Caption label="Three posts from jsonplaceholder.typicode.com" />}
      >
        <View>
          <Each of={posts()}>
            {(post, i) => (
              <Row first={i() === 0}>
                <Text style={[monoText(13, colors.brand), { width: 28 }]}>{`#${post().id}`}</Text>
                <Text style={{ flex: 1, fontSize: 15, color: colors.foreground, numberOfLines: 1 }}>
                  {post().title}
                </Text>
              </Row>
            )}
          </Each>
        </View>
      </If>
      <If when={status()}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <View
            style={{
              width: 7,
              height: 7,
              borderRadius: 3.5,
              backgroundColor: toneColor(status()!.tone),
            }}
          />
          <Text
            style={{
              flex: 1,
              fontSize: 13,
              color: toneColor(status()!.tone),
              fontVariant: ["tabular-nums"],
              numberOfLines: 2,
            }}
          >
            {status()!.text}
          </Text>
        </View>
      </If>
      <View style={{ flexDirection: "row", gap: 8 }}>
        <View style={{ flex: 1 }}>
          <Button disabled={result.loading()} onPress={load}>
            {result.loading() ? "Loading…" : "fetch()"}
          </Button>
        </View>
        <View style={{ flex: 1 }}>
          <Button
            variant="secondary"
            onPress={() => console.log("hello from the showcase", { at: new Date().toISOString() })}
          >
            console.log
          </Button>
        </View>
      </View>
      <Note>console.log shows in the terminal of nsh run.</Note>
    </Card>
  );
}

/** `nsh`'s environment, the status bar, alerts, the share sheet, frames, shortcuts, a context
 * menu and the network. */
export function SystemDemo() {
  return (
    <DemoPage title="System">
      <Environment />
      <StatusBarCard />
      <Dialogs />
      <ShareSheet />
      <FramesAndTimers />
      <Shortcuts />
      <ContextMenu />
      <Network />
      <Toaster />
    </DemoPage>
  );
}
