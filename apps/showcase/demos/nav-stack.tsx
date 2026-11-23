import {
  animate,
  colors,
  finish,
  header,
  motion,
  rounded,
  tints,
  toneColor,
  type Tone,
  shape,
} from "@shadcn-nsh/theme";
// NavStack: the official gallery's scene (`references/nsh/examples/gallery/demos/Navigation.tsx`)
// with this library's parts — the safe area it renders in, a page pushed for every header
// option (a large title, a transparent or custom header, native bar buttons, no swipe back,
// unsaved changes asked about first), the modal presentations over the page, a stack whose
// address follows it, and the back button heard before it pops.
//
// The gallery pushes these pages on its own root stack, which covers the whole window; the
// showcase's shell hands a demo one screen and no route to push on, so the scene owns a stack of
// its own that fills the screen it was given. The pages, their headers and the modals over them
// are the gallery's, one for one.
import {
  ArrowDown,
  ArrowLeft,
  Bell,
  Check,
  ChevronDown,
  ChevronRight,
  Circle,
  Clapperboard,
  Component,
  List,
  Palette,
  Smartphone,
  Sparkles,
  Star,
  SlidersHorizontal,
  TextCursorInput,
  Trash,
  Type,
  type IconNode,
} from "lucide";
import type { JSX, ViewStyle } from "nsh";
import {
  createAnimatedValue,
  effect,
  List as RowList,
  platform,
  safeAreaInsets,
  Scroll,
  signal,
  Text,
  UrlScheme,
  View,
} from "nsh";
import { AlertDialog as NshAlertDialog, type SheetDetent } from "nsh/base";
import { BackHandler } from "nsh/mobile";

import { Badge } from "@/packages/ui/badge";
import { Button } from "@/packages/ui/button";
import { Dialog, DialogContent } from "@/packages/ui/dialog";
import { Input } from "@/packages/ui/input";
import { Icon } from "@/packages/ui/lib/icons";
import { sectionSurface } from "@/packages/ui/lib/surface";
import { createNavStack, NavPage, NavStack } from "@/packages/ui/nav-stack";
import { Pressable } from "@/packages/ui/pressable";
import { Stat } from "@/packages/ui/stat";

import { hint, LabeledToggle, PageBar } from "./navigation-shared";

/** The device's tiers the scenes name: a pointer's compact one, a touch screen's roomier one. */
const pointer = platform.desktop;

/** A card of the scene's index: a head (an icon, a title, a subtitle, a trailing slot) over the
 * flat surface, flush where rows fill it. */
function SectionCard(props: {
  icon?: IconNode;
  title: string;
  subtitle?: string;
  /** A quiet line at the head's trailing edge (the API the card shows). */
  note?: string;
  right?: JSX.Element;
  flush?: boolean;
  children: JSX.Element;
}) {
  return (
    <View style={{ gap: 8 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
        <If when={props.icon}>
          <Icon icon={props.icon!} size={16} tint={colors.faint} />
        </If>
        <View style={{ flex: 1, minWidth: 0, gap: 1 }}>
          <Text style={{ fontSize: 15, fontWeight: "600", color: colors.foreground }}>
            {props.title}
          </Text>
          <If when={props.subtitle}>
            <Text style={{ fontSize: 13, color: colors.mutedForeground }}>{props.subtitle}</Text>
          </If>
        </View>
        <If when={props.note}>
          <Text style={{ fontSize: 12, color: colors.faint, fontVariant: ["tabular-nums"] }}>
            {props.note}
          </Text>
        </If>
        {props.right}
      </View>
      <View
        style={[
          sectionSurface(),
          { overflow: "hidden" },
          props.flush ? null : { padding: 14, gap: 12 },
        ]}
      >
        {props.children}
      </View>
    </View>
  );
}

/** The safe-area insets where it renders, one figure per edge. */
function Insets() {
  const edges = ["top", "bottom", "left", "right"] as const;
  const insets = safeAreaInsets();
  return (
    <View style={{ flexDirection: "row" }}>
      <Each of={edges}>
        {(edge) => (
          <Stat
            width="25%"
            label={edge()[0].toUpperCase() + edge().slice(1)}
            value={`${Math.round(insets()[edge()])} pt`}
          />
        )}
      </Each>
    </View>
  );
}

/** A large figure with a tinted note after it ("38 presses, caught"). */
function Figure(props: { value: string; unit?: string; note?: string; tone?: Tone }) {
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

/** A row that opens a screen: an icon, a title, the API it shows, a chevron; a hairline above all
 * but the first, the theme's hover fill. */
function LinkRow(props: {
  icon: IconNode;
  title: string;
  note: string;
  first?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityLabel={props.title}
      onPress={props.onPress}
      style={
        {
          minHeight: 44 + (pointer ? 8 : 12),
          flexDirection: "row",
          alignItems: "center",
          gap: 12,
          paddingHorizontal: 14,
          paddingVertical: 6,
        } satisfies ViewStyle
      }
    >
      <View
        style={{
          position: "absolute",
          top: 0,
          left: 46,
          right: 0,
          height: 1,
          backgroundColor: colors.line,
          ...(props.first ? { display: "none" } : {}),
        }}
      />
      <Icon icon={props.icon} size={16} tint={colors.mutedForeground} />
      <View style={{ flex: 1, gap: 1 }}>
        <Text style={{ fontSize: 13, fontWeight: "500", color: colors.foreground }}>
          {props.title}
        </Text>
        <Text style={{ numberOfLines: 1, fontSize: 12, color: colors.faint }}>{props.note}</Text>
      </View>
      <Icon icon={ChevronRight} size={12} tint={colors.faint} />
    </Pressable>
  );
}

/** A pull to refresh that takes a second, and how many it has done. */
interface Refresh {
  refreshing: () => boolean;
  count: () => number;
  start: () => void;
}

function createRefresh(): Refresh {
  const refreshing = signal(false);
  const count = signal(0);
  const start = () => {
    refreshing.set(true);
    setTimeout(() => {
      count.update((n) => n + 1);
      refreshing.set(false);
    }, 1000);
  };
  return { refreshing, count, start };
}

/** Fades and lifts content in once mounted; `index` staggers siblings. */
function Appear(props: { index?: number; children: JSX.Element }) {
  const t = createAnimatedValue(0);
  void t.timing(1, {
    duration: motion.enter.duration,
    easing: motion.enter.timingFunction,
    delay: Math.min(8, props.index ?? 0) * 40,
  });
  return (
    <View
      style={{
        opacity: t,
        transform: [{ translateY: t.interpolate({ inputRange: [0, 1], outputRange: [14, 0] }) }],
      }}
    >
      {props.children}
    </View>
  );
}

/** The body of a pushed page: what it shows, then where its safe area is; pulled down, it
 * refreshes. */
function Page(props: { intro: string; refresh?: Refresh; children?: JSX.Element }) {
  return (
    <Scroll
      style={{ flex: 1, backgroundColor: colors.background }}
      refreshing={props.refresh?.refreshing()}
      onRefresh={props.refresh?.start}
    >
      <View style={{ padding: 16, paddingBottom: 40, gap: 16 }}>
        <Appear>
          <Text
            style={{
              fontSize: 15,
              lineHeight: 21,
              color: colors.mutedForeground,
              paddingHorizontal: 4,
            }}
          >
            {props.intro}
          </Text>
        </Appear>
        <Appear index={1}>
          <SectionCard title="Safe area" note="safeAreaInsets()">
            <Insets />
          </SectionCard>
        </Appear>
        <Appear index={2}>
          <View style={{ gap: 16 }}>{props.children}</View>
        </Appear>
      </View>
    </Scroll>
  );
}

/** Padding by the insets of the root the view renders in, on every edge. */
const safeAreaPadding = {
  paddingTop: "env(safe-area-inset-top)",
  paddingRight: "env(safe-area-inset-right)",
  paddingBottom: "env(safe-area-inset-bottom)",
  paddingLeft: "env(safe-area-inset-left)",
} as const;

const largeTitleIntro = (refresh: Refresh) =>
  `iOS: the title shrinks into the bar as the content scrolls. Pull down to refresh${
    refresh.count() ? ` (refreshed ${refresh.count()}×)` : ""
  }.`;

/** A row of the large title pages: its number and where it starts. */
function OffsetRow(props: { n: number; inset?: number }) {
  return (
    <View
      style={{
        height: 48,
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: props.inset ?? 10,
        borderTopWidth: props.n === 1 ? 0 : 1,
        borderTopColor: colors.line,
      }}
    >
      <Text style={{ flex: 1, fontSize: 15, color: colors.foreground }}>{`Row ${props.n}`}</Text>
      <Text
        style={{ fontSize: 13, color: colors.faint, fontVariant: ["tabular-nums"] }}
      >{`${props.n * 48} pt`}</Text>
    </View>
  );
}

function LargeTitle(_props: { pop: () => void }) {
  const refresh = createRefresh();
  return (
    <NavPage
      title="Large title"
      headerStyle={header.headerStyle}
      headerLargeTitle
      headerTransparent
      header={(page) => <PageBar page={page} title="Large title" />}
    >
      <Page intro={largeTitleIntro(refresh)} refresh={refresh}>
        <View
          style={{
            ...rounded(shape.container),
            backgroundColor: colors.card,
            borderWidth: 1,
            borderColor: colors.border,
            overflow: "hidden",
          }}
        >
          <Each of={Array.from({ length: 20 }, (_, i) => i + 1)}>
            {(i) => <OffsetRow n={i()} />}
          </Each>
        </View>
      </Page>
    </NavPage>
  );
}

/** A large title over a virtualized list, refreshed by a pull. */
function LargeTitleList(_props: { pop: () => void }) {
  const refresh = createRefresh();
  const rows = Array.from({ length: 200 }, (_, i) => i + 1);
  return (
    <NavPage
      title="Large title list"
      headerStyle={header.headerStyle}
      headerLargeTitle
      headerTransparent
      header={(page) => <PageBar page={page} title="Large title list" />}
    >
      <RowList
        each={rows}
        estimatedItemSize={48}
        style={{ flex: 1, backgroundColor: colors.background }}
        contentStyle={{ paddingBottom: 40 }}
        refreshing={refresh.refreshing()}
        onRefresh={refresh.start}
        header={
          <Text
            style={{
              fontSize: 15,
              lineHeight: 21,
              color: colors.mutedForeground,
              paddingHorizontal: 20,
              paddingTop: 16,
              paddingBottom: 12,
            }}
          >
            {largeTitleIntro(refresh)}
          </Text>
        }
      >
        {(i) => <OffsetRow n={i()} inset={20} />}
      </RowList>
    </NavPage>
  );
}

function Transparent(_props: { pop: () => void }) {
  return (
    <NavPage
      title="Transparent"
      headerTransparent
      headerStyle={{ tintColor: colors.foreground, color: colors.foreground }}
      header={(page) => (
        <PageBar page={page} title="Transparent" transparent tint={colors.foreground} />
      )}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: colors.background,
          overflow: "hidden",
          padding: 16,
          paddingBottom: 56,
          justifyContent: "flex-end",
          gap: 16,
        }}
      >
        <View
          style={{
            position: "absolute",
            top: -90,
            right: -70,
            width: 320,
            height: 320,
            borderRadius: 160,
            backgroundColor: tints.brand,
          }}
        />
        <View
          style={{
            position: "absolute",
            top: 150,
            left: -110,
            width: 260,
            height: 260,
            borderRadius: 130,
            backgroundColor: tints.info,
          }}
        />
        <Appear>
          <View style={{ gap: 12 }}>
            <View style={{ flexDirection: "row" }}>
              <Badge tone="accent">headerTransparent</Badge>
            </View>
            <Text
              style={{
                fontSize: 30,
                fontWeight: "700",
                letterSpacing: -0.5,
                color: colors.foreground,
              }}
            >
              Content under the header
            </Text>
            <Text style={{ fontSize: 15, lineHeight: 21, color: colors.mutedForeground }}>
              The circles start at the top of the screen; the bar and its back button float over
              them.
            </Text>
          </View>
        </Appear>
        <Appear index={1}>
          <View style={{ padding: 14, gap: 12 }}>
            <Insets />
          </View>
        </Appear>
      </View>
    </NavPage>
  );
}

function CustomHeader(props: { pop: () => void }) {
  const likes = signal(0);
  // Each call makes the elements anew: the system header (phones) and the app's (desktops, the
  // web) each mount their own.
  const left = () => (
    <Text
      onPress={props.pop}
      hitSlop={10}
      style={{ color: colors.primaryForeground, fontSize: 17, fontWeight: "500" }}
    >
      Close
    </Text>
  );
  const center = () => (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 7 }}>
      <View
        style={{
          width: 10,
          height: 10,
          borderRadius: 5,
          backgroundColor: colors.primaryForeground,
        }}
      />
      <Text style={{ color: colors.primaryForeground, fontSize: 17, fontWeight: "700" }}>
        Custom title
      </Text>
    </View>
  );
  const right = () => (
    <View
      onPress={() => likes.set(likes() + 1)}
      hitSlop={10}
      style={{ flexDirection: "row", alignItems: "center", gap: 5 }}
    >
      <Icon icon={Star} size={18} tint={colors.primaryForeground} />
      <Text
        style={{
          color: colors.primaryForeground,
          fontSize: 17,
          fontWeight: "600",
          fontVariant: ["tabular-nums"],
        }}
      >
        {likes()}
      </Text>
    </View>
  );
  return (
    <NavPage
      title="Custom"
      headerStyle={{
        tintColor: colors.primaryForeground,
        backgroundColor: colors.primary,
        color: colors.primaryForeground,
      }}
      headerBackVisible={false}
      headerLeft={left()}
      headerTitle={center()}
      headerRight={right()}
      header={(page) => (
        <PageBar
          page={page}
          title="Custom"
          background={colors.primary}
          tint={colors.primaryForeground}
          left={left()}
          center={center()}
          right={right()}
        />
      )}
    >
      <Page intro="The header's items are views: the star on the right counts presses and re-renders the header.">
        <SectionCard title="Header" note="headerRight">
          <Figure value={String(likes())} unit={likes() === 1 ? "star" : "stars"} />
        </SectionCard>
      </Page>
    </NavPage>
  );
}

/** A custom title longer than the bar: it shrinks and clamps between the back button and the
 * trailing item, which stay on the bar. */
function LongTitle(_props: { pop: () => void }) {
  const title = "A session title long enough to need more than one phone's width";
  const center = () => (
    <View style={{ flex: 1, flexDirection: "row", alignItems: "center", gap: 8 }}>
      <Text
        style={{
          numberOfLines: 1,
          flex: 1,
          minWidth: 0,
          fontSize: 17,
          fontWeight: "600",
          color: colors.foreground,
        }}
      >
        {title}
      </Text>
      <Icon icon={ChevronDown} size={18} tint={colors.mutedForeground} />
    </View>
  );
  const right = () => (
    <Text hitSlop={10} style={{ color: colors.brand, fontSize: 17, fontWeight: "500" }}>
      Edit
    </Text>
  );
  return (
    <NavPage
      title="Long title"
      headerTitle={center()}
      headerRight={right()}
      header={(page) => (
        <PageBar page={page} title="Long title" center={center()} right={right()} />
      )}
    >
      <Page intro="The title view takes the room between the bar's items: a long title clamps to one line, and the chevron and Edit stay visible.">
        <SectionCard title="Header" note="headerTitle">
          <Text style={{ color: colors.mutedForeground }}>{title}</Text>
        </SectionCard>
      </Page>
    </NavPage>
  );
}

/** Trailing iOS bar buttons with a native menu; other platforms keep the `headerRight` views. */
function NativeBarButtons(_props: { pop: () => void }) {
  const filter = signal<"all" | "open" | "done">("all");
  const log = signal("Tap Edit, Filter or +");
  const editing = signal(false);
  const right = () => (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
      <Text
        onPress={() => {
          editing.set(!editing());
          log.set(editing() ? "Editing" : "Edit");
        }}
        hitSlop={10}
        style={{ color: colors.brand, fontSize: 17, fontWeight: "500" }}
      >
        {editing() ? "Done" : "Edit"}
      </Text>
      <Text
        onPress={() => log.set(`Filter: ${filter()}`)}
        hitSlop={10}
        style={{ color: colors.brand, fontSize: 17, fontWeight: "500" }}
      >
        Filter
      </Text>
      <Text
        onPress={() => log.set("Add")}
        hitSlop={10}
        style={{ color: colors.brand, fontSize: 22, fontWeight: "400" }}
      >
        +
      </Text>
    </View>
  );
  return (
    <NavPage
      title="Bar buttons"
      headerStyle={header.headerStyle}
      headerRight={right()}
      header={(page) => <PageBar page={page} title="Bar buttons" right={right()} />}
      ios={{
        headerRightItems: [
          {
            key: "edit",
            label: editing() ? "Done" : "Edit",
            onPress: () => {
              editing.set(!editing());
              log.set(editing() ? "Editing" : "Edit");
            },
          },
          {
            key: "filter",
            label: "Filter",
            menu: [
              {
                label: "All",
                checked: filter() === "all",
                onSelect: () => {
                  filter.set("all");
                  log.set("Filter: all");
                },
              },
              {
                label: "Open",
                checked: filter() === "open",
                onSelect: () => {
                  filter.set("open");
                  log.set("Filter: open");
                },
              },
              {
                label: "Done",
                checked: filter() === "done",
                onSelect: () => {
                  filter.set("done");
                  log.set("Filter: done");
                },
              },
              {
                label: "Danger",
                inline: true,
                submenu: [
                  {
                    label: "Clear filters",
                    destructive: true,
                    symbol: "trash",
                    onSelect: () => {
                      filter.set("all");
                      log.set("Filters cleared");
                    },
                  },
                ],
              },
            ],
          },
          {
            key: "add",
            systemItem: "add",
            label: "Add",
            onPress: () => log.set("Add"),
          },
        ],
      }}
    >
      <Page
        intro={hint(
          "iOS: Edit, Filter (a native menu with a check mark) and + share one Liquid Glass group on iOS 26. Android and the desktops show the same actions as headerRight views.",
          "The trailing actions are views here; on iOS they are UIKit bar buttons with a native Filter menu.",
        )}
      >
        <SectionCard title="Last action" note="onPress / onSelect">
          <Figure value={log()} />
        </SectionCard>
        <SectionCard title="Filter" note="checked menu item">
          <View style={{ flexDirection: "row" }}>
            <Stat
              width="33%"
              label="All"
              value={filter() === "all" ? "On" : "—"}
              tone={filter() === "all" ? "up" : "neutral"}
            />
            <Stat
              width="33%"
              label="Open"
              value={filter() === "open" ? "On" : "—"}
              tone={filter() === "open" ? "up" : "neutral"}
            />
            <Stat
              width="34%"
              label="Done"
              value={filter() === "done" ? "On" : "—"}
              tone={filter() === "done" ? "up" : "neutral"}
            />
          </View>
        </SectionCard>
      </Page>
    </NavPage>
  );
}

function Locked(_props: { pop: () => void }) {
  return (
    <NavPage
      title="No swipe back"
      headerStyle={header.headerStyle}
      popOnSwipe={false}
      header={(page) => <PageBar page={page} title="No swipe back" />}
    >
      <Page
        intro={hint(
          "The back gesture is off on this screen: no swipe on iOS, no predictive animation on Android. The back buttons still work.",
          "The back gesture is off on this screen (touch screens only). The back button, Escape and Alt+Left still work.",
        )}
      >
        <SectionCard title="Leaving" note="popOnSwipe={false}">
          <View style={{ flexDirection: "row" }}>
            <Stat width="50%" label="Swipe / predictive" value="Off" tone="destructive" />
            <Stat width="50%" label="Back buttons" value="On" tone="up" />
          </View>
        </SectionCard>
      </Page>
    </NavPage>
  );
}

/** `popOnBack={false}`: leaving with unsaved text asks first. */
function Unsaved(props: { pop: () => void }) {
  const text = signal("");
  const focused = signal(false);
  // The platform's box, awaited: `show` resolves with the chosen action's id, so the page acts on
  // the answer in one place. `AlertDialog`'s parts declare the same box under a root of the page's
  // own, for an alert that is part of what the page draws.
  const confirm = () => {
    void NshAlertDialog.show({
      title: "Discard your changes?",
      description: "Your draft will be lost. This cannot be undone.",
      actions: [
        { id: "keep", label: "Keep editing", role: "cancel" },
        { id: "discard", label: "Discard", role: "destructive" },
      ],
    }).then(({ action }) => {
      if (action === "discard") props.pop();
    });
  };
  return (
    <NavPage
      title="Unsaved changes"
      headerStyle={header.headerStyle}
      popOnBack={text().length === 0}
      onBackPress={confirm}
      header={(page) => (
        <PageBar
          page={page}
          title="Unsaved changes"
          onBack={() => (text().length > 0 ? confirm() : props.pop())}
        />
      )}
    >
      <Page
        intro={hint(
          "Type something, then go back (header button, swipe, Android back): the screen asks first.",
          "Type something, then go back (header button, Escape, Alt+Left, the mouse's back button): the screen asks first.",
        )}
      >
        <SectionCard
          title="Draft"
          subtitle="popOnBack + onBackPress"
          right={
            <Badge tone={text().length > 0 ? "warn" : "neutral"}>
              {text().length > 0 ? "Guarded" : "Empty"}
            </Badge>
          }
        >
          <Input
            value={text()}
            onChange={({ value }) => text.set(value)}
            onFocus={() => focused.set(true)}
            onBlur={() => focused.set(false)}
            accessibilityLabel="A draft"
            placeholder="A draft"
            style={{
              height: 48,
              paddingHorizontal: 14,
              fontSize: 15,
              color: colors.foreground,
              backgroundColor: colors.field,
              borderWidth: 1,
              borderColor: focused() ? colors.brand : colors.input,
              ...rounded(shape.control),
              ...finish.field,
            }}
          />
          <Text style={{ fontSize: 13, color: colors.mutedForeground }}>
            {text().length > 0
              ? `${text().length} characters would be lost: back asks first`
              : "Nothing to lose: back pops"}
          </Text>
        </SectionCard>
      </Page>
    </NavPage>
  );
}

function Faded(_props: { pop: () => void }) {
  return (
    <NavPage
      title="Fade"
      headerStyle={header.headerStyle}
      animation="fade"
      header={(page) => <PageBar page={page} title="Fade" />}
    >
      <Page intro="This screen faded in, and fades out." />
    </NavPage>
  );
}

function Instant(_props: { pop: () => void }) {
  return (
    <NavPage
      title="No animation"
      headerStyle={header.headerStyle}
      animation="none"
      header={(page) => <PageBar page={page} title="No animation" />}
    >
      <Page intro="Shown without a transition, and removed without one." />
    </NavPage>
  );
}

function Headerless(props: { pop: () => void }) {
  return (
    <NavPage headerVisible={false}>
      <View style={{ flex: 1, backgroundColor: colors.background, ...safeAreaPadding }}>
        <View style={{ flex: 1, padding: 16, gap: 16 }}>
          <Appear>
            <View style={{ gap: 8, paddingHorizontal: 4, paddingTop: 12 }}>
              <View style={{ flexDirection: "row" }}>
                <Badge tone="accent">{"headerVisible={false}"}</Badge>
              </View>
              <Text
                style={{
                  fontSize: 30,
                  fontWeight: "700",
                  letterSpacing: -0.5,
                  color: colors.foreground,
                }}
              >
                No header
              </Text>
              <Text style={{ fontSize: 15, lineHeight: 21, color: colors.mutedForeground }}>
                The screen owns the whole surface; padding of env(safe-area-inset-*) keeps it clear
                of the status bar and the home indicator.
              </Text>
            </View>
          </Appear>
          <Appear index={1}>
            <View style={{ padding: 14, gap: 12 }}>
              <Insets />
            </View>
          </Appear>
          <View style={{ flex: 1 }} />
          <Button onPress={props.pop}>Back</Button>
        </View>
      </View>
    </NavPage>
  );
}

function Deep(props: {
  depth: number;
  push: (page: () => JSX.Element) => void;
  pop: () => void;
  toRoot: () => void;
}) {
  return (
    <NavPage
      title={`Level ${props.depth}`}
      headerStyle={header.headerStyle}
      header={(page) => <PageBar page={page} title={`Level ${props.depth}`} />}
    >
      <Page intro="Every push is a native screen; popToRoot() unwinds them all at once.">
        <SectionCard title={`Level ${props.depth}`} subtitle={`${props.depth} deep in the stack`}>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
            <Each of={Array.from({ length: props.depth }, (_, i) => i + 1)}>
              {(level) => (
                <View
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    alignItems: "center",
                    justifyContent: "center",
                    borderWidth: level() === props.depth ? 0 : 1,
                    borderColor: colors.border,
                    backgroundColor: level() === props.depth ? colors.primary : colors.raised,
                    ...(level() === props.depth ? finish.accent : finish.raised),
                  }}
                >
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: "600",
                      fontVariant: ["tabular-nums"],
                      color:
                        level() === props.depth ? colors.primaryForeground : colors.mutedForeground,
                    }}
                  >
                    {level()}
                  </Text>
                </View>
              )}
            </Each>
          </View>
          <View style={{ flexDirection: "row", gap: 8 }}>
            <Button
              style={{ flex: 1 }}
              onPress={() =>
                props.push(() => (
                  <Deep
                    depth={props.depth + 1}
                    push={props.push}
                    pop={props.pop}
                    toRoot={props.toRoot}
                  />
                ))
              }
            >
              Deeper
            </Button>
            <Button style={{ flex: 1 }} variant="secondary" onPress={props.toRoot}>
              To the index
            </Button>
          </View>
        </SectionCard>
      </Page>
    </NavPage>
  );
}

type Sheet =
  | "fullScreen"
  | "pageSheet"
  | "stacked"
  | "formSheet"
  | "fade"
  | "dialog"
  | "kept"
  | null;

const modals: { key: Exclude<Sheet, null>; title: string; note: string; icon: IconNode }[] = [
  { key: "fullScreen", title: "Full screen", note: "Slides up", icon: Smartphone },
  {
    key: "pageSheet",
    title: "Page sheet",
    note: hint("iOS sheet", "A tall centered card"),
    icon: Component,
  },
  {
    key: "stacked",
    title: "Half-height sheet",
    note: platform.os === "ios" ? "iOS detents, pages inside" : "Pages inside",
    icon: List,
  },
  {
    key: "formSheet",
    title: "Form sheet",
    note: hint("iOS, centered", "A smaller centered card"),
    icon: TextCursorInput,
  },
  { key: "fade", title: "Fade", note: "Fades in", icon: Sparkles },
  { key: "dialog", title: "Card dialog", note: "Over the page", icon: Bell },
  {
    key: "kept",
    title: "Kept open",
    note: hint("No swipe to close", "Escape does not close"),
    icon: ArrowDown,
  },
];

/** A modal's content: what it is, its safe area, a close button. */
function ModalBody(props: { title: string; note: string; body: string; onClose: () => void }) {
  return (
    <View style={{ flex: 1, backgroundColor: colors.background, ...safeAreaPadding }}>
      <View style={{ flex: 1, padding: 16, gap: 16 }}>
        <View style={{ gap: 8, paddingHorizontal: 4, paddingTop: 8 }}>
          <View style={{ flexDirection: "row" }}>
            <Badge tone="accent">{props.note}</Badge>
          </View>
          <Text
            style={{
              fontSize: 28,
              fontWeight: "700",
              letterSpacing: -0.5,
              color: colors.foreground,
            }}
          >
            {props.title}
          </Text>
          <Text style={{ fontSize: 15, lineHeight: 21, color: colors.mutedForeground }}>
            {props.body}
          </Text>
        </View>
        <SectionCard title="Safe area" note="the modal's">
          <Insets />
        </SectionCard>
        <View style={{ flex: 1 }} />
        <Button onPress={props.onClose}>Close</Button>
      </View>
    </View>
  );
}

/** The settings a page of the stacked sheet opens, with their choices. */
const sheetPages: { name: string; icon: IconNode; choices: string[] }[] = [
  { name: "Appearance", icon: Palette, choices: ["Automatic", "Light", "Dark"] },
  { name: "Notifications", icon: Bell, choices: ["Everything", "Mentions only", "Nothing"] },
  {
    name: "Sorting",
    icon: SlidersHorizontal,
    choices: ["Newest first", "Oldest first", "By name"],
  },
];

/** An iOS page sheet that opens at half the screen with the system's grabber and drags to full
 * height (`detents`, `detent`, `onDetentChange`), holding a stack whose pages come with the
 * header's back button. Elsewhere the dialog covers the window and the stack shows the app's
 * header. */
function StackedSheet(props: { open: boolean; onClose: () => void }) {
  const detent = signal<SheetDetent>("medium");
  const pages = createNavStack<string>(["Settings"]);
  const chosen = signal<Record<string, string>>({});
  const choice = (name: string) =>
    chosen()[name] ?? sheetPages.find((p) => p.name === name)?.choices[0] ?? "";
  const full = () => detent() === "large";
  // Only iOS's system sheet rests at detents: elsewhere it is full height.
  const detents = platform.os === "ios";
  // The next opening starts at half height, on the first page.
  const done = () => {
    detent.set("medium");
    pages.popToRoot();
    props.onClose();
  };
  return (
    <Dialog open={props.open} onOpenChange={({ open }) => !open && done()}>
      <DialogContent
        presentation="pageSheet"
        detents={["medium", "large"]}
        detent={detent()}
        onDetentChange={({ detent: next }) => detent.set(next)}
        grabber
        accessibilityLabel="Settings"
      >
        <NavStack state={pages} style={{ flex: 1 }}>
          {(route) => (
            <NavPage
              title={route}
              headerStyle={header.headerStyle}
              style={{ backgroundColor: colors.background }}
              header={(page) => <PageBar page={page} title={route} />}
            >
              {route === "Settings" ? (
                <Scroll style={{ flex: 1 }}>
                  <View style={{ padding: 16, gap: 16 }}>
                    {detents ? (
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                        <Badge tone="accent">{full() ? "Full height" : "Half height"}</Badge>
                        <Text style={{ flex: 1, fontSize: 13, color: colors.mutedForeground }}>
                          Drag the grabber, or scroll up, to change the height.
                        </Text>
                      </View>
                    ) : null}
                    <View
                      style={{
                        ...rounded(shape.container),
                        backgroundColor: colors.card,
                        borderWidth: 1,
                        borderColor: colors.border,
                        overflow: "hidden",
                      }}
                    >
                      <Each of={sheetPages}>
                        {(page, i) => (
                          <LinkRow
                            first={i() === 0}
                            icon={page().icon}
                            title={page().name}
                            note={choice(page().name)}
                            onPress={() => pages.push(page().name)}
                          />
                        )}
                      </Each>
                    </View>
                    <View style={{ flexDirection: "row", gap: 8 }}>
                      {detents ? (
                        <Button
                          style={{ flex: 1 }}
                          variant="secondary"
                          onPress={() => detent.set(full() ? "medium" : "large")}
                        >
                          {full() ? "Half height" : "Full height"}
                        </Button>
                      ) : null}
                      <Button style={{ flex: 1 }} onPress={done}>
                        Done
                      </Button>
                    </View>
                  </View>
                </Scroll>
              ) : (
                <Scroll style={{ flex: 1 }}>
                  <View style={{ padding: 16, gap: 16 }}>
                    <View
                      style={{
                        ...rounded(shape.container),
                        backgroundColor: colors.card,
                        borderWidth: 1,
                        borderColor: colors.border,
                        overflow: "hidden",
                      }}
                    >
                      <Each of={sheetPages.find((p) => p.name === route)?.choices ?? []}>
                        {(name, i) => (
                          <LinkRow
                            first={i() === 0}
                            icon={choice(route) === name() ? Check : Circle}
                            title={name()}
                            note={choice(route) === name() ? "Chosen" : ""}
                            onPress={() => {
                              chosen.set({ ...chosen(), [route]: name() });
                              pages.pop();
                            }}
                          />
                        )}
                      </Each>
                    </View>
                  </View>
                </Scroll>
              )}
            </NavPage>
          )}
        </NavStack>
      </DialogContent>
    </Dialog>
  );
}

/** A stack's pages and the app's address, the same code on every platform: the app maps its own
 * routes to an address (`#/messages/Invoice`), opens at `UrlScheme.url()`, gives each page its
 * address as the stack changes (`onChange` → `UrlScheme.setUrl`, the browser's back included,
 * which pops the stack) and hears links (`UrlScheme.on("open")`) and the moves the stack does not
 * account for (`UrlScheme.on("change")`). Only the web shows the address. */
function Addressed() {
  const prefix = "#/messages/";
  const opened = (UrlScheme.url() ?? "").split("#")[1] ?? "";
  const start = `#${opened}`.startsWith(prefix)
    ? ["Inbox", decodeURIComponent(`#${opened}`.slice(prefix.length))]
    : ["Inbox"];
  const messages = createNavStack<string>(start);
  const changes = signal(0);
  const opens = signal(0);
  const address = signal(UrlScheme.url() ?? "");
  UrlScheme.on("open", ({ url }) => {
    opens.set(opens() + 1);
    address.set(url);
  });
  // A back or forward between entries of the same pages, or an address the user typed (the web):
  // the stack stays, the address shown follows.
  UrlScheme.on("change", ({ url }) => address.set(url));
  // The address without the app's part, then the open message's.
  const addressOf = (top: string) =>
    `${(UrlScheme.url() ?? "").split("#")[0]}${
      top === "Inbox" ? "" : prefix + encodeURIComponent(top)
    }`;
  // The app's part of an address: the same on the web (the page's address before it) and
  // elsewhere.
  const shown = (url: string) => (url.includes("#") ? `#${url.split("#")[1]}` : "");
  return (
    <View style={{ gap: 8 }}>
      <View
        style={{
          height: 200,
          ...rounded(shape.control),
          overflow: "hidden",
          borderWidth: 1,
          borderColor: colors.line,
        }}
      >
        <NavStack
          state={messages}
          style={{ flex: 1 }}
          onChange={({ routes }) => {
            changes.set(changes() + 1);
            UrlScheme.setUrl(addressOf(routes[routes.length - 1]!));
            address.set(UrlScheme.url() ?? "");
          }}
        >
          {(route) => (
            // The card's surface, not the system's page color, under each page.
            <NavPage
              header={
                <Text
                  style={{ padding: 12, fontSize: 15, fontWeight: "600", color: colors.foreground }}
                >
                  {route}
                </Text>
              }
              style={{ backgroundColor: colors.card }}
            >
              <View style={{ padding: 12, gap: 8 }}>
                {route === "Inbox" ? (
                  <Each of={["Welcome", "Invoice", "Travel"]}>
                    {(name) => (
                      <Button variant="secondary" onPress={() => messages.push(name())}>
                        {`Open ${name()}`}
                      </Button>
                    )}
                  </Each>
                ) : (
                  <Button variant="secondary" onPress={() => messages.pop()}>
                    Back to the inbox
                  </Button>
                )}
              </View>
            </NavPage>
          )}
        </NavStack>
      </View>
      <Text style={{ fontSize: 13, lineHeight: 18, color: colors.mutedForeground }}>
        {`${changes()} changes, ${opens()} opens: ${shown(address()) || "no address"}`}
      </Text>
    </View>
  );
}

/** A route of the scene's own stack: the index, or a page pushed over it. */
type Route = { name: "index" } | { name: "page"; page: () => JSX.Element };

/**
 * NavStack, as the official gallery draws it: the index of its cards, the pages pushed over it
 * (one per header option), and the modals over those — on a stack the scene owns, filling the
 * screen the shell gave it.
 */
export function NavStackDemo() {
  const nav = createNavStack<Route>([{ name: "index" }]);
  const sheet = signal<Sheet>(null);
  const intercept = signal(false);
  const backs = signal(0);
  const cancels = signal(0);
  const close = () => sheet.set(null);
  // A listener hears the button before the stack pops it; listening only while intercepting
  // keeps Android's back gesture previewing the pop.
  effect(() => {
    if (!intercept()) return;
    // Removed with the effect when it runs again.
    BackHandler.on("press", () => {
      backs.set(backs() + 1);
      return true;
    });
  });
  const push = (page: () => JSX.Element) => () => nav.push({ name: "page", page });
  const pop = () => nav.pop();
  const toRoot = () => nav.popToRoot();
  // The card dialog springs up from a little smaller each time it opens.
  const popIn = createAnimatedValue(0);
  effect(() => {
    if (sheet() !== "dialog") return;
    popIn.set(0);
    void animate(popIn, 1, motion.settle);
  });
  const current = () => modals.find((m) => m.key === sheet());
  const shown = () =>
    sheet() === "fullScreen" ||
    sheet() === "pageSheet" ||
    sheet() === "formSheet" ||
    sheet() === "fade";

  /** The index: the scene's cards. */
  function Index() {
    return (
      <NavPage headerVisible={false}>
        <Scroll style={{ flex: 1, backgroundColor: colors.background }}>
          <View
            style={{
              padding: 20,
              paddingBottom: 40,
              gap: 16,
              maxWidth: 880,
              width: "100%",
              alignSelf: "center",
            }}
          >
            <Text style={{ fontSize: 22, fontWeight: "700", color: colors.foreground }}>
              NavStack
            </Text>
            <SectionCard
              title="Native stack"
              subtitle="Headers, transitions, the safe area"
              right={
                <Badge tone="accent">
                  {hint("UIKit / View", platform.os === "linux" ? "GTK 4" : "Native views")}
                </Badge>
              }
            >
              <Insets />
            </SectionCard>

            <SectionCard title="Pages" subtitle="Page options, pushed with nav.push" flush>
              <LinkRow
                first
                icon={Type}
                title="Large title"
                note="headerLargeTitle"
                onPress={push(() => (
                  <LargeTitle pop={pop} />
                ))}
              />
              <LinkRow
                icon={List}
                title="Large title list"
                note="headerLargeTitle, List"
                onPress={push(() => (
                  <LargeTitleList pop={pop} />
                ))}
              />
              <LinkRow
                icon={Palette}
                title="Transparent header"
                note="headerTransparent"
                onPress={push(() => (
                  <Transparent pop={pop} />
                ))}
              />
              <LinkRow
                icon={Star}
                title="Custom header items"
                note="headerLeft / Title / Right"
                onPress={push(() => (
                  <CustomHeader pop={pop} />
                ))}
              />
              <LinkRow
                icon={Type}
                title="Long custom title"
                note="headerTitle, clamped"
                onPress={push(() => (
                  <LongTitle pop={pop} />
                ))}
              />
              <LinkRow
                icon={SlidersHorizontal}
                title="Native bar buttons"
                note="ios.headerRightItems"
                onPress={push(() => (
                  <NativeBarButtons pop={pop} />
                ))}
              />
              <LinkRow
                icon={Smartphone}
                title="No header"
                note="headerVisible={false}"
                onPress={push(() => (
                  <Headerless pop={pop} />
                ))}
              />
              <LinkRow
                icon={Sparkles}
                title="Fade in"
                note='animation="fade"'
                onPress={push(() => (
                  <Faded pop={pop} />
                ))}
              />
              <LinkRow
                icon={Clapperboard}
                title="No animation"
                note='animation="none"'
                onPress={push(() => (
                  <Instant pop={pop} />
                ))}
              />
              <LinkRow
                icon={ArrowLeft}
                title="No swipe back"
                note="popOnSwipe={false}"
                onPress={push(() => (
                  <Locked pop={pop} />
                ))}
              />
              <LinkRow
                icon={TextCursorInput}
                title="Unsaved changes"
                note="popOnBack + onBackPress"
                onPress={push(() => (
                  <Unsaved pop={pop} />
                ))}
              />
              <LinkRow
                icon={List}
                title="A deep stack"
                note="push / popToRoot"
                onPress={push(() => (
                  <Deep depth={1} push={push} pop={pop} toRoot={toRoot} />
                ))}
              />
            </SectionCard>

            <SectionCard title="Modals" subtitle="Presentation styles and transitions" flush>
              <Each of={modals}>
                {(m, i) => (
                  <LinkRow
                    first={i() === 0}
                    icon={m().icon}
                    title={m().title}
                    note={m().note}
                    onPress={() => sheet.set(m().key)}
                  />
                )}
              </Each>
            </SectionCard>

            <SectionCard title="Address" subtitle="onChange, UrlScheme.setUrl">
              <Addressed />
            </SectionCard>

            <SectionCard
              title="Back button"
              subtitle={hint("Android: BackHandler", "BackHandler: Escape, Alt+Left")}
              right={
                <LabeledToggle
                  label="Intercept"
                  value={intercept()}
                  onChange={(v) => intercept.set(v)}
                />
              }
            >
              <Figure
                value={String(backs())}
                unit={backs() === 1 ? "press" : "presses"}
                note={intercept() ? "caught" : "popped"}
                tone={intercept() ? "warn" : "accent"}
              />
              <Text style={{ fontSize: 13, lineHeight: 18, color: colors.mutedForeground }}>
                {intercept()
                  ? "The handler returns true: back presses stay on this screen."
                  : hint(
                      "Off: the back button pops this screen.",
                      "Off: Escape pops this screen, or the app's last screen does nothing.",
                    )}
              </Text>
            </SectionCard>
          </View>
        </Scroll>
      </NavPage>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <NavStack state={nav} style={{ flex: 1 }}>
        {(route) => (route.name === "index" ? <Index /> : route.page())}
      </NavStack>
      <Dialog open={shown()} onOpenChange={({ open }) => !open && close()}>
        <DialogContent
          presentation={
            sheet() === "pageSheet"
              ? "pageSheet"
              : sheet() === "formSheet"
                ? "formSheet"
                : "fullScreen"
          }
          animation={sheet() === "fade" ? "fade" : "slide"}
          accessibilityLabel={current()?.title ?? ""}
        >
          <ModalBody
            title={current()?.title ?? ""}
            note={String(sheet())}
            body={hint(
              "Close with the button, the back button (Android) or a swipe down (iOS sheets): it closes natively, then tells the app (onOpenChange).",
              sheet() === "pageSheet" || sheet() === "formSheet"
                ? "Close with the button, Escape or a click outside the card."
                : "Close with the button or Escape.",
            )}
            onClose={close}
          />
        </DialogContent>
      </Dialog>
      <StackedSheet open={sheet() === "stacked"} onClose={close} />
      <Dialog
        open={sheet() === "kept"}
        onCancel={() => cancels.set(cancels() + 1)}
        onOpenChange={({ open }) => !open && close()}
      >
        <DialogContent
          presentation="pageSheet"
          accessibilityLabel="Kept open"
          closeOnEscape={false}
          closeOnBackdropPress={false}
          closeOnSwipe={false}
        >
          <ModalBody
            title="Kept open"
            note="closeOn*={false}"
            body={`${hint(
              "Swiping it down (iOS) and back (Android)",
              "Escape and clicks outside",
            )} only call onCancel (${cancels()} so far): the button closes it.`}
            onClose={close}
          />
        </DialogContent>
      </Dialog>
      {/* A card in the middle of the window over the scrim: the backdrop, Escape and back close
          it. */}
      <Dialog open={sheet() === "dialog"} onOpenChange={({ open }) => !open && close()}>
        <DialogContent
          animation="fade"
          role="alertdialog"
          accessibilityLabel="Delete “Launch notes”?"
          accessibilityDescription="The note and its 14 comments go for everyone it is shared with. This cannot be undone."
          style={{
            margin: "auto",
            width: platform.desktop ? 360 : 340,
            maxWidth: "90%",
            opacity: popIn,
            transform: [
              { scale: popIn.interpolate({ inputRange: [0, 1], outputRange: [0.96, 1] }) },
            ],
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <View
              style={{
                width: 36,
                height: 36,
                borderRadius: 11,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: colors.raised,
                borderWidth: 1,
                borderColor: colors.border,
                ...finish.raised,
              }}
            >
              <Icon icon={Trash} size={18} tint={colors.destructive} />
            </View>
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={{ fontSize: 17, fontWeight: "600", color: colors.foreground }}>
                Delete “Launch notes”?
              </Text>
              <Text style={{ fontSize: 12, color: colors.faint }}>
                Edited 2 hours ago · 3 collaborators
              </Text>
            </View>
          </View>
          <Text style={{ fontSize: 13, lineHeight: 19, color: colors.mutedForeground }}>
            The note and its 14 comments go for everyone it is shared with. This cannot be undone.
          </Text>
          <View style={{ flexDirection: "row", justifyContent: "flex-end", gap: 8, paddingTop: 4 }}>
            <Button
              variant="secondary"
              style={platform.desktop ? undefined : { flex: 1 }}
              onPress={close}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              style={platform.desktop ? undefined : { flex: 1 }}
              onPress={close}
            >
              Delete
            </Button>
          </View>
        </DialogContent>
      </Dialog>
    </View>
  );
}
