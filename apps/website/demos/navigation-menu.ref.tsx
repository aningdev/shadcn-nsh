// The reference of `navigation-menu.tsx`: the same scene with the bar's, the triggers' and the
// links' looks (`navigationMenuLook`, `navigationMenuTriggerLook`, `navigationMenuLinkLook`) spread
// on views and `nsh/base` Links, and each panel a `nsh/base` Popover on the menu surface
// (`popupSurface`, `PopIn`). It differs from the component page only in the parts it names.
import { ChevronDown } from "lucide";
import type { JSX } from "nsh";
import { mount, signal, Text, View } from "nsh";
import { Link, Popover } from "nsh/base";

import { Icon } from "@/packages/ui/lib/icons";
import { PopIn } from "@/packages/ui/lib/popup";
import { insetSurface } from "@/packages/ui/lib/surface";
import {
  navigationMenuLinkLook,
  navigationMenuLook,
  navigationMenuTriggerLook,
} from "@/packages/ui/navigation-menu";

import { DemoPage } from "./kit";
import { desktop, Log, Panel as StatePanel, Split, ui, wide } from "./stage";

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

const START = [
  {
    title: "Introduction",
    hint: "Re-usable components you copy into your app and own.",
  },
  { title: "Installation", hint: "How to add a component and what it needs." },
  { title: "Typography", hint: "Styles for headings, paragraphs and the rest." },
];

/** A trigger: the look's box, its name and its chevron. */
function Trigger(props: { name: string; open: () => boolean; disabled?: boolean }) {
  const look = navigationMenuTriggerLook({ open: props.open });
  return (
    <View
      accessible
      role="button"
      disabled={props.disabled}
      accessibilityState={{ disabled: props.disabled }}
      style={look.style}
      hoverStyle={look.hoverStyle}
      activeStyle={look.activeStyle}
      focusVisibleStyle={look.focusVisibleStyle}
      disabledStyle={look.disabledStyle}
    >
      <Text style={look.text}>{props.name}</Text>
      <View
        style={look.chevron}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      >
        <Icon icon={ChevronDown} size={look.chevronIcon.size} tint={look.chevronIcon.tint} />
      </View>
    </View>
  );
}

/** One item: the item's box, the popup's trigger and its panel. */
function Item(props: {
  value: string;
  open: () => string | null;
  onOpenChange: (value: string | null, reason: string) => void;
  trigger: JSX.Element;
  width: number;
  children: JSX.Element;
}) {
  return (
    <View style={navigationMenuLook().item}>
      <Popover
        open={props.open() === props.value}
        trigger={props.trigger}
        placement="bottom"
        align="start"
        offset={6}
        onOpenChange={({ open, reason }) => props.onOpenChange(open ? props.value : null, reason)}
      >
        {() => (
          <PopIn side="bottom" style={{ ...navigationMenuLook().panel, width: props.width }}>
            <View>{props.children}</View>
          </PopIn>
        )}
      </Popover>
    </View>
  );
}

/** A link of a panel: the look's row, a name and, under it, what it is for. */
function PanelLink(props: { title: string; hint?: string; active?: boolean; onPress: () => void }) {
  const look = () =>
    navigationMenuLinkLook({ active: () => !!props.active, disabled: () => false });
  return (
    <Link
      onPress={props.onPress}
      current={props.active}
      accessibilityLabel={props.title}
      style={look().style}
      hoverStyle={look().hoverStyle ?? null}
      activeStyle={look().activeStyle ?? null}
      focusVisibleStyle={look().focusVisibleStyle}
      disabledStyle={look().disabledStyle}
    >
      <Text style={look().text}>{props.title}</Text>
      <If when={props.hint}>
        <Text style={look().hint}>{props.hint}</Text>
      </If>
    </Link>
  );
}

/** The current page in the bar: a link wearing the trigger's box. */
function BarLink(props: { name: string; onPress: () => void }) {
  const look = () => navigationMenuLinkLook({ active: () => true, disabled: () => false });
  const bar = navigationMenuTriggerLook();
  return (
    <Link
      onPress={props.onPress}
      current
      accessibilityLabel={props.name}
      style={[look().style, bar.style]}
      hoverStyle={[look().hoverStyle, bar.hoverStyle]}
      activeStyle={[look().activeStyle, bar.activeStyle]}
      focusVisibleStyle={[look().focusVisibleStyle, bar.focusVisibleStyle]}
      disabledStyle={[look().disabledStyle, bar.disabledStyle]}
    >
      <Text style={look().text}>{props.name}</Text>
    </Link>
  );
}

function App() {
  const open = signal<string | null>(null);
  const picked = signal("—");
  const events = signal<string[]>([]);
  const note = (line: string) => events.set([line, ...events()].slice(0, 6));
  const changed = (value: string | null, reason: string) => {
    open.set(value);
    note(`${value ?? "closed"} · ${reason}`);
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
            <StatePanel title="open">
              <Text style={{ fontSize: 13, color: ui().text }}>{open() ?? "closed"}</Text>
            </StatePanel>
            <StatePanel title="pressed">
              <Text style={{ fontSize: 13, color: ui().text }}>{picked()}</Text>
            </StatePanel>
            <Log title="onValueChange / onPress" lines={events()} minHeight={120} />
          </>
        }
      >
        <View style={{ gap: 16 }}>
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
            <View
              role="navigation"
              accessibilityLabel="Navigation"
              style={navigationMenuLook().root}
            >
              <View role="list" style={navigationMenuLook().list}>
                <Item
                  value="getting-started"
                  open={open}
                  onOpenChange={changed}
                  trigger={
                    <Trigger name="Getting started" open={() => open() === "getting-started"} />
                  }
                  width={wide() ? 480 : 320}
                >
                  <View style={{ flexDirection: wide() ? "row" : "column", gap: 4 }}>
                    <Link
                      onPress={() => press("Acme UI")}
                      style={{
                        ...navigationMenuLinkLook().style,
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
                    </Link>
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
                </Item>

                <Item
                  value="components"
                  open={open}
                  onOpenChange={changed}
                  trigger={<Trigger name="Components" open={() => open() === "components"} />}
                  width={wide() ? 560 : 320}
                >
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
                </Item>

                {/* A narrow window holds two triggers: the last two items would wrap onto a second
                    row, under the panel the first one opens. */}
                <If when={wide()}>
                  <View style={navigationMenuLook().item}>
                    <BarLink name="Docs" onPress={() => press("Docs")} />
                  </View>
                  <Item
                    value="changelog"
                    open={open}
                    onOpenChange={changed}
                    trigger={
                      <Trigger name="Changelog" open={() => open() === "changelog"} disabled />
                    }
                    width={240}
                  >
                    <PanelLink
                      title="0.5.1"
                      hint="A page that is not written yet."
                      onPress={() => press("0.5.1")}
                    />
                  </Item>
                </If>
              </View>
            </View>
          </View>

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
