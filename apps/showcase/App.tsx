import { colors, radius, rounded } from "@shadcn-nsh/theme";
// The showcase's shell, after the official NSH Gallery (`references/nsh/examples/gallery/App.tsx`):
// a desktop gets a sidebar of the demos grouped by what each is for, beside the chosen demo under
// a page header (its group, its name, one line of what it shows); a phone gets the index as one
// list, and a press pushes the demo onto a nav stack. A search field filters the sidebar.
//
// The parts are this library's (`packages/ui`) and the colors the theme's, never a literal; the
// palette and the appearance are chosen in the app (`theme.ts`) and switch live. What is not here:
// sounds, and the Gallery's own demo-adapter layer (`Stage`, `Split`, …), which belongs to the docs
// demos alone.
import { ChevronRight, Palette } from "lucide";
import { computed, mount, platform, Scroll, signal, Text, View, windowSize } from "nsh";

import { PALETTES } from "@/apps/website/demos/palettes";
import { IconButton } from "@/packages/ui/button";
import { Input } from "@/packages/ui/input";
import { Icon } from "@/packages/ui/lib/icons";
import { createNavStack, NavPage, NavStack } from "@/packages/ui/nav-stack";
import {
  Popover,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/packages/ui/popover";
import { Pressable } from "@/packages/ui/pressable";
import { Segmented, SegmentedItem, SegmentedList } from "@/packages/ui/segmented";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/packages/ui/select";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  sidebarMenuButtonLook,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/packages/ui/sidebar";

import { actions } from "./groups/actions";
import { data } from "./groups/data";
import { documents } from "./groups/documents";
import { type DemoEntry } from "./groups/entry";
import { inputs } from "./groups/inputs";
import { navigation } from "./groups/navigation";
import { overlays } from "./groups/overlays";
import { appearance, choosePalette, palette, setAppearance, type Appearance } from "./theme";

/** The demos by what each is for: the official gallery's purposes, minus what this library has no
 * component for (RichEditor, SplitView). */
const groups: { title: string; demos: DemoEntry[] }[] = [
  { title: "Actions", demos: actions },
  { title: "Inputs", demos: inputs },
  { title: "Navigation", demos: navigation },
  { title: "Overlays", demos: overlays },
  { title: "Data", demos: data },
  { title: "Documents and workspaces", demos: documents },
];

/** A route of the phone's stack: the index, or a demo pushed over it. */
type Route = { name: "home" } | { name: "demo"; demo: DemoEntry };

/** The phone's stack: the index at its bottom, a demo pushed onto it. */
const nav = createNavStack<Route>([{ name: "home" }]);

/** Whether the window takes the desktop layout: a sidebar of the demos and the chosen one beside
 * it. Desktops and the web from 700 pt wide, other platforms from 900 — the phone layout below. */
const desktop = computed(() => windowSize().width >= (platform.desktop ? 700 : 900));

/** The demo the desktop layout shows. */
const selected = signal<DemoEntry>(groups[0].demos[0]);

/** Shows a demo in the desktop layout. */
const select = (demo: DemoEntry) => selected.set(demo);

/** What the sidebar's search field holds. */
const query = signal("");

/** The groups and demos whose name or group matches the search, groups left empty dropped. */
const found = computed(() => {
  const q = query().trim().toLowerCase();
  if (!q) return groups;
  return groups
    .map((group) => ({
      title: group.title,
      demos: group.title.toLowerCase().includes(q)
        ? group.demos
        : group.demos.filter((demo) => demo.name.toLowerCase().includes(q)),
    }))
    .filter((group) => group.demos.length > 0);
});

/** The group a demo is listed under. */
const groupOf = (demo: DemoEntry) =>
  groups.find((group) => group.demos.some((entry) => entry.name === demo.name))?.title ??
  "Showcase";

/**
 * The theme controls, shared by the sidebar's footer and the phone's menu: the palette of
 * `palettes.ts` (the one list the docs site offers too) and the appearance.
 */
function ThemeControls(props: { stacked?: boolean }) {
  const choose = (value: string | null) => {
    const chosen = PALETTES.find((p) => p.id === value);
    if (chosen) choosePalette(chosen.id);
  };
  const selector = (
    <Select value={palette()} onChange={({ value }) => choose(value)}>
      <SelectTrigger icon={Palette}>
        <SelectValue placeholder="NSH Gallery" />
      </SelectTrigger>
      <SelectContent style={props.stacked ? { width: 220 } : { width: 150 }}>
        <Each of={PALETTES}>
          {(entry) => <SelectItem value={entry().id}>{entry().label}</SelectItem>}
        </Each>
      </SelectContent>
    </Select>
  );
  const appearanceControl = (
    <Segmented
      value={appearance()}
      onValueChange={(next) =>
        setAppearance((next === "light" || next === "dark" ? next : "system") as Appearance)
      }
    >
      <SegmentedList size="sm" fill>
        <SegmentedItem value="system">System</SegmentedItem>
        <SegmentedItem value="light">Light</SegmentedItem>
        <SegmentedItem value="dark">Dark</SegmentedItem>
      </SegmentedList>
    </Segmented>
  );
  return (
    <View style={{ gap: 10 }}>
      {selector}
      {appearanceControl}
    </View>
  );
}

/** The phone's theme control: one button in the index header, the controls in its popover. */
function ThemeMenu() {
  const open = signal(false);
  return (
    <Popover open={open()} onOpenChange={({ open: next }) => open.set(next)}>
      <PopoverTrigger>
        <IconButton accessibilityLabel="Theme settings" onPress={() => open.set(!open())}>
          <Icon icon={Palette} size={17} tint={colors.foreground} />
        </IconButton>
      </PopoverTrigger>
      <PopoverContent placement="bottom" offset={8} margin={12} width={240}>
        <PopoverHeader>
          <PopoverTitle>Theme</PopoverTitle>
        </PopoverHeader>
        <ThemeControls stacked />
      </PopoverContent>
    </Popover>
  );
}

/** A demo row of the sidebar: its icon, its name, the chosen fill under the one shown. */
function SidebarRow(props: { demo: DemoEntry }) {
  const sidebar = useSidebar();
  const look = sidebarMenuButtonLook({
    open: () => sidebar.open,
    collapsible: () => "icon" as const,
    size: () => "default" as const,
    active: () => selected().name === props.demo.name,
  });
  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        isActive={selected().name === props.demo.name}
        tooltip={props.demo.name}
        accessibilityLabel={props.demo.name}
        onPress={() => select(props.demo)}
      >
        <Icon icon={props.demo.icon} size={look.glyph.size} tint={look.glyph.tint} />
        <Text style={look.label}>{props.demo.name}</Text>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

/** The desktop layout's sidebar: the app's name and the search, the demos by group, the theme. */
function SidebarColumn() {
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" tooltip="Showcase">
              <View
                style={{
                  width: 30,
                  height: 30,
                  alignItems: "center",
                  justifyContent: "center",
                  ...rounded(radius.control),
                  backgroundColor: colors.inset,
                }}
              >
                <Icon icon={Palette} size={15} tint={colors.mutedForeground} />
              </View>
              <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
                <Text style={{ fontSize: 13, fontWeight: "600", color: colors.foreground }}>
                  Showcase
                </Text>
                <Text style={{ fontSize: 11, color: colors.mutedForeground }}>
                  shadcn-nsh · NSH's gallery
                </Text>
              </View>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <Input
          value={query()}
          onChange={({ value }) => query.set(value)}
          placeholder="Search demos"
          accessibilityLabel="Search demos"
        />
      </SidebarHeader>
      <SidebarContent>
        <Each of={found()}>
          {(group) => (
            <SidebarGroup>
              <SidebarGroupLabel>{group().title}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <Each of={group().demos}>{(demo) => <SidebarRow demo={demo()} />}</Each>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )}
        </Each>
        <If when={found().length === 0}>
          <Text
            style={{
              fontSize: 12,
              color: colors.mutedForeground,
              paddingHorizontal: 16,
              paddingTop: 8,
            }}
          >
            {`No demo matches “${query().trim()}”`}
          </Text>
        </If>
      </SidebarContent>
      <SidebarFooter>
        <ThemeControls />
      </SidebarFooter>
    </Sidebar>
  );
}

/** The chosen demo under its page header: where it is (its group and its name) and one line of
 * what it shows. The sidebar's trigger shows while the column is hidden. */
function DemoPane() {
  const entry = () => selected();
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View
        style={{
          height: 44,
          flexShrink: 0,
          flexDirection: "row",
          alignItems: "center",
          gap: 8,
          paddingHorizontal: 12,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        }}
      >
        <SidebarTrigger />
        <Text style={{ fontSize: 13, color: colors.mutedForeground }}>{groupOf(entry())}</Text>
        <Icon icon={ChevronRight} size={12} tint={colors.faint} />
        <Text style={{ fontSize: 13, fontWeight: "600", color: colors.foreground, flexShrink: 0 }}>
          {entry().name}
        </Text>
        <Text
          style={{
            flex: 1,
            minWidth: 0,
            numberOfLines: 1,
            fontSize: 13,
            color: colors.mutedForeground,
          }}
        >
          {entry().detail}
        </Text>
      </View>
      <View style={{ flex: 1 }}>
        {(() => {
          const Screen = entry().screen;
          return <Screen />;
        })()}
      </View>
    </View>
  );
}

/** The desktop layout: a sidebar of the demos and the chosen one beside it. */
function Desktop() {
  return (
    <SidebarProvider>
      <SidebarColumn />
      <SidebarInset>
        <DemoPane />
      </SidebarInset>
    </SidebarProvider>
  );
}

/** A demo row of the phone's index: its icon, its name, one line of what it shows. */
function IndexRow(props: { demo: DemoEntry; first: boolean }) {
  return (
    <Pressable
      accessibilityLabel={props.demo.name}
      onPress={() => nav.push({ name: "demo", demo: props.demo })}
    >
      <View
        style={{
          minHeight: 60,
          flexDirection: "row",
          alignItems: "center",
          gap: 14,
          paddingHorizontal: 16,
        }}
      >
        <If when={!props.first}>
          <View
            style={{
              position: "absolute",
              top: 0,
              left: 60,
              right: 0,
              height: 1,
              backgroundColor: colors.line,
            }}
          />
        </If>
        <View
          style={{
            width: 30,
            height: 30,
            alignItems: "center",
            justifyContent: "center",
            ...rounded(radius.control),
            backgroundColor: colors.inset,
          }}
        >
          <Icon icon={props.demo.icon} size={15} tint={colors.mutedForeground} />
        </View>
        <View style={{ flex: 1, gap: 1 }}>
          <Text style={{ fontSize: 16, fontWeight: "500", color: colors.foreground }}>
            {props.demo.name}
          </Text>
          <Text style={{ numberOfLines: 1, fontSize: 13, color: colors.mutedForeground }}>
            {props.demo.detail}
          </Text>
        </View>
        <Icon icon={ChevronRight} size={14} tint={colors.faint} />
      </View>
    </Pressable>
  );
}

/** The phone's index: the demos by group, a card of rows per group. */
function Index() {
  return (
    <NavPage title="Showcase" headerRight={<ThemeMenu />}>
      <Scroll style={{ flex: 1, backgroundColor: colors.background }}>
        <View style={{ paddingTop: 12, paddingBottom: 40, gap: 24 }}>
          <Each of={found()}>
            {(group) => (
              <View style={{ gap: 8 }}>
                <View
                  style={{ flexDirection: "row", alignItems: "baseline", paddingHorizontal: 20 }}
                >
                  <Text
                    style={{
                      flex: 1,
                      fontSize: 13,
                      fontWeight: "600",
                      color: colors.mutedForeground,
                      letterSpacing: 0.3,
                    }}
                  >
                    {group().title.toUpperCase()}
                  </Text>
                  <Text
                    style={{ fontSize: 13, color: colors.faint, fontVariant: ["tabular-nums"] }}
                  >
                    {group().demos.length}
                  </Text>
                </View>
                <View
                  style={{
                    marginHorizontal: 16,
                    backgroundColor: colors.card,
                    borderWidth: 1,
                    borderColor: colors.border,
                    overflow: "hidden",
                    ...rounded(radius.card),
                  }}
                >
                  <Each of={group().demos}>
                    {(demo, i) => <IndexRow demo={demo()} first={i() === 0} />}
                  </Each>
                </View>
              </View>
            )}
          </Each>
          <If when={found().length === 0}>
            <Text style={{ paddingHorizontal: 20, fontSize: 13, color: colors.mutedForeground }}>
              {`No demo matches “${query().trim()}”`}
            </Text>
          </If>
        </View>
      </Scroll>
    </NavPage>
  );
}

/** A demo pushed on the phone's stack: its name on the header, its screen below. */
function DemoScreen(props: { demo: DemoEntry }) {
  const Screen = props.demo.screen;
  return (
    <NavPage title={props.demo.name}>
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <Screen />
      </View>
    </NavPage>
  );
}

/** The phone layout: the index, demos pushed over it. */
function Phone() {
  return (
    <NavStack state={nav}>
      {(route) => (route.name === "home" ? <Index /> : <DemoScreen demo={route.demo} />)}
    </NavStack>
  );
}

function App() {
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <If when={desktop()} else={<Phone />}>
        <Desktop />
      </If>
    </View>
  );
}

mount(App);
