// A navigation menu has no official example here, so this page is the library's own: a product
// site's header — a trigger holding a card and three described links, a trigger holding a grid of
// components, the current page as a plain link, and a trigger whose page is not written yet — with
// the open item and every change reported beside it. A narrow window keeps the first two: a
// wrapped second row would sit under the panel the first trigger opens.
import { mount, signal, Text, View } from "nsh";

import { insetSurface } from "@/packages/ui/lib/surface";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuLook,
  navigationMenuTriggerLook,
  NavigationMenuTrigger,
} from "@/packages/ui/navigation-menu";

import { DemoPage } from "./kit";
import { desktop, Log, Panel, Split, ui, wide } from "./stage";

/** The links of the components panel: a name and what it is for. */
const COMPONENTS = [
  {
    title: "Alert Dialog",
    hint: "A modal dialog that interrupts the user with important content.",
  },
  { title: "Hover Card", hint: "For sighted users to preview content behind a link." },
  { title: "Progress", hint: "Shows the progress of a task, usually a bar." },
  { title: "Scroll Area", hint: "Visually or semantically separates content." },
  { title: "Tabs", hint: "Layered sections of content, shown one at a time." },
  { title: "Tooltip", hint: "A popup that describes an element on hover or focus." },
];

/** The three links the "Getting started" panel introduces. */
const START = [
  {
    title: "Introduction",
    hint: "Re-usable components you copy into your app and own.",
  },
  { title: "Installation", hint: "How to add a component and what it needs." },
  { title: "Typography", hint: "Styles for headings, paragraphs and the rest." },
];

/** A link of a panel: a name and, under it, what it is for. */
function PanelLink(props: { title: string; hint?: string; onPress: () => void }) {
  const look = () => navigationMenuLook();
  return (
    <NavigationMenuLink onPress={props.onPress}>
      <Text style={look().linkText}>{props.title}</Text>
      <If when={props.hint}>
        <Text style={look().linkHint}>{props.hint}</Text>
      </If>
    </NavigationMenuLink>
  );
}

function App() {
  const open = signal<string | null>(null);
  const picked = signal("—");
  const events = signal<string[]>([]);
  const note = (line: string) => events.set([line, ...events()].slice(0, 6));
  const changed = (event: { value: string | null; reason: string }) => {
    open.set(event.value);
    note(`${event.value ?? "closed"} · ${event.reason}`);
  };
  const press = (what: string) => {
    picked.set(what);
    note(`pressed ${what}`);
  };
  /** The components panel's columns: two in a wide window, one in a narrow one. */
  const columns = () => (wide() ? [COMPONENTS.slice(0, 3), COMPONENTS.slice(3)] : [COMPONENTS]);

  return (
    <DemoPage title="NavigationMenu">
      <Text style={{ color: ui().muted }}>
        {desktop
          ? "Rest on a trigger, or click it: its panel opens under the bar, one at a time"
          : "Tap a trigger: its panel opens under the bar, one at a time"}
      </Text>

      <Split
        gap={14}
        width={560}
        inspector={
          <>
            <Panel title="open">
              <Text style={{ fontSize: 13, color: ui().text }}>{open() ?? "closed"}</Text>
            </Panel>
            <Panel title="pressed">
              <Text style={{ fontSize: 13, color: ui().text }}>{picked()}</Text>
            </Panel>
            <Log title="onValueChange / onPress" lines={events()} minHeight={120} />
          </>
        }
      >
        <View style={{ gap: 16 }}>
          {/* The site's header: its name and the bar, over the page it navigates. */}
          <View
            style={{
              flexDirection: wide() ? "row" : "column",
              alignItems: wide() ? "center" : "stretch",
              justifyContent: "space-between",
              gap: wide() ? 16 : 8,
              paddingBottom: 12,
              borderBottomWidth: 1,
              borderBottomColor: ui().line,
            }}
          >
            <Text style={{ fontSize: 15, fontWeight: "700", color: ui().text }}>Acme UI</Text>
            <NavigationMenu value={open()} onValueChange={changed}>
              <NavigationMenuList>
                <NavigationMenuItem value="getting-started">
                  <NavigationMenuTrigger>Getting started</NavigationMenuTrigger>
                  <NavigationMenuContent width={wide() ? 480 : 320}>
                    <View style={{ flexDirection: wide() ? "row" : "column", gap: 4 }}>
                      {/* The card that leads the panel: the library itself. */}
                      <NavigationMenuLink
                        onPress={() => press("Acme UI")}
                        style={{
                          ...insetSurface(),
                          width: wide() ? 180 : undefined,
                          padding: 14,
                          gap: 6,
                          justifyContent: "flex-end",
                        }}
                      >
                        <Text style={{ fontSize: 15, fontWeight: "600", color: ui().text }}>
                          Acme UI
                        </Text>
                        <Text style={{ fontSize: 13, lineHeight: 17, color: ui().muted }}>
                          Beautifully designed components built with NSH.
                        </Text>
                      </NavigationMenuLink>
                      <View style={{ flex: 1, gap: 4 }}>
                        {START.map((item) => (
                          <PanelLink
                            title={item.title}
                            hint={item.hint}
                            onPress={() => press(item.title)}
                          />
                        ))}
                      </View>
                    </View>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                <NavigationMenuItem value="components">
                  <NavigationMenuTrigger>Components</NavigationMenuTrigger>
                  <NavigationMenuContent width={wide() ? 560 : 320}>
                    <View style={{ flexDirection: wide() ? "row" : "column", gap: 4 }}>
                      <Each of={columns()} key="index">
                        {(column) => (
                          <View style={{ flex: 1, gap: 4 }}>
                            <Each of={column()} key={(item) => item.title}>
                              {(item) => (
                                <PanelLink
                                  title={item().title}
                                  hint={item().hint}
                                  onPress={() => press(item().title)}
                                />
                              )}
                            </Each>
                          </View>
                        )}
                      </Each>
                    </View>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                {/* A narrow window holds two triggers: the last two items would wrap onto a second
                    row, under the panel the first one opens. */}
                <If when={wide()}>
                  <NavigationMenuItem>
                    {/* The page the app is on: a bar item that is a link, and the one it shows. */}
                    <NavigationMenuLink
                      active
                      onPress={() => press("Docs")}
                      style={navigationMenuTriggerLook().style}
                      hoverStyle={navigationMenuTriggerLook().hoverStyle ?? null}
                    >
                      Docs
                    </NavigationMenuLink>
                  </NavigationMenuItem>

                  <NavigationMenuItem value="changelog">
                    <NavigationMenuTrigger disabled>Changelog</NavigationMenuTrigger>
                    <NavigationMenuContent width={240}>
                      <PanelLink
                        title="0.5.1"
                        hint="A page that is not written yet."
                        onPress={() => press("0.5.1")}
                      />
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                </If>
              </NavigationMenuList>
            </NavigationMenu>
          </View>

          {/* The page the bar sits over, so a panel has something to open onto. */}
          <View style={{ gap: 6 }}>
            <Text style={{ fontSize: 17, fontWeight: "600", color: ui().text }}>
              Components you own
            </Text>
            <Text style={{ fontSize: 13, lineHeight: 19, color: ui().muted }}>
              Copy a component into your app and it is yours: the look, the states and the sizes are
              this library's, the behavior is NSH's.
            </Text>
          </View>
          <View style={{ flexDirection: "row", gap: 10 }}>
            {["Components", "Theming", "Examples"].map((name) => (
              <View style={{ ...insetSurface(), flex: 1, padding: 12, gap: 4 }}>
                <Text style={{ fontSize: 13, fontWeight: "500", color: ui().text }}>{name}</Text>
                <Text style={{ fontSize: 12, color: ui().muted }}>
                  A card of the page under the bar.
                </Text>
              </View>
            ))}
          </View>
        </View>
      </Split>
    </DemoPage>
  );
}

mount(App);
