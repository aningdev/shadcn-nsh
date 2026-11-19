import "./apply-palette";
import { colors } from "@shadcn-nsh/theme";
// A settings app on a navigation stack: a list of rows on the first page, a second page whose rows
// push a third, and the header that follows — the back button while there is a page below, the
// page's title, and a trailing action. The platform's own back works too (Escape / Alt+Left / the
// mouse's back button / the browser's back on a desktop, the swipe on a phone), and every page's
// footer says how deep the stack is, read from `createNavStack`'s routes.
//
// The header is drawn on the desktops and the web only: iOS and Android show their system header,
// with the same `title` and `headerRight`.
import {
  Bell,
  ChevronRight,
  Contrast,
  Eye,
  Languages,
  Palette,
  RefreshCw,
  SlidersHorizontal,
  Waves,
  type IconNode,
} from "lucide";
import type { JSX } from "nsh";
import { mount, Scroll, signal, Text, View } from "nsh";

import { Button } from "@/packages/ui/button";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemSeparator,
  ItemTitle,
  itemLook,
} from "@/packages/ui/item";
import { Icon } from "@/packages/ui/lib/icons";
import { density, sectionSurface } from "@/packages/ui/lib/surface";
import { createNavStack, NavPage, NavStack } from "@/packages/ui/nav-stack";
import { Pressable } from "@/packages/ui/pressable";
import { Switch } from "@/packages/ui/switch";

/** The pages: the settings' list, one group of it, and the appearance it opens. */
type Route = { id: "settings" } | { id: "general" } | { id: "appearance" };

const nav = createNavStack<Route>([{ id: "settings" }]);

const notifications = signal(true);
const autoUpdate = signal(false);
const reduceMotion = signal(false);
const reduceTransparency = signal(false);
const increaseContrast = signal(false);
const languages = ["English", "Français", "日本語"];
const language = signal(languages[0]);

/** A row of a settings list: an icon, a name, a line under it, and a control or a chevron. */
function Row(props: {
  icon: IconNode;
  title: string;
  detail?: string;
  /** The control at the row's end; a row that takes a press draws a chevron when none is given. */
  trailing?: JSX.Element;
  /** What a press on the row does. Without one the row is not pressable: its control is. */
  onPress?: () => void;
}) {
  const row = (
    <Item size="sm">
      <ItemMedia variant="icon">
        <Icon icon={props.icon} size={16} tint={colors.mutedForeground} />
      </ItemMedia>
      <ItemContent>
        <ItemTitle>{props.title}</ItemTitle>
        <If when={props.detail}>
          <ItemDescription>{props.detail}</ItemDescription>
        </If>
      </ItemContent>
      <ItemActions>
        <If when={props.trailing}>{props.trailing}</If>
        <If when={props.onPress && !props.trailing}>
          <Icon icon={ChevronRight} size={16} tint={colors.faint} />
        </If>
      </ItemActions>
    </Item>
  );
  return props.onPress ? (
    <Pressable onPress={props.onPress} accessibilityLabel={props.title}>
      {row}
    </Pressable>
  ) : (
    row
  );
}

/** A group of rows on a card, as a settings app lists them. */
function List(props: { children: JSX.Element }) {
  return (
    <View style={[sectionSurface(), { padding: 4 }]}>
      <ItemGroup style={{ gap: 0 }}>{props.children}</ItemGroup>
    </View>
  );
}

/** What separates two rows of a list, inset past the icon so the rows read as one block. */
function Divider() {
  return <ItemSeparator style={{ marginVertical: 0, marginHorizontal: 12 }} />;
}

/** A page's content: the rows, scrolling when they do not fit, and the line the stack is read in. */
function Body(props: { children: JSX.Element }) {
  return (
    <View style={{ flex: 1 }}>
      <Scroll style={{ flex: 1 }} contentStyle={{ padding: density.pad, gap: density.gap }}>
        {props.children}
      </Scroll>
      <View style={{ paddingHorizontal: density.pad, paddingBottom: 10 }}>
        <Text style={{ fontSize: density.note, color: colors.mutedForeground }}>
          {() => {
            const routes = nav.routes();
            return `Stack depth ${routes.length} · ${routes.map((route) => route.id).join(" / ")}`;
          }}
        </Text>
      </View>
    </View>
  );
}

/** The first page: the list everything else hangs off. */
function SettingsPage() {
  return (
    <NavPage title="Settings">
      <Body>
        <List>
          <Row
            icon={SlidersHorizontal}
            title="General"
            detail="Language, appearance, motion"
            onPress={() => nav.push({ id: "general" })}
          />
          <Divider />
          <Row
            icon={Bell}
            title="Notifications"
            detail="Banners and sounds"
            trailing={
              <Switch
                checked={notifications()}
                onChange={({ checked }) => notifications.set(checked)}
              />
            }
          />
          <Divider />
          <Row
            icon={RefreshCw}
            title="Auto-update"
            detail="Install updates in the background"
            trailing={
              <Switch checked={autoUpdate()} onChange={({ checked }) => autoUpdate.set(checked)} />
            }
          />
        </List>
        <Text style={{ fontSize: density.note, color: colors.mutedForeground }}>
          The first page has no back button: there is nothing under it.
        </Text>
      </Body>
    </NavPage>
  );
}

/** The second page: it pushes the third, and its trailing action puts the group back as it was. */
function GeneralPage() {
  const reset = () => {
    language.set(languages[0]);
    reduceMotion.set(false);
  };
  return (
    <NavPage
      title="General"
      headerRight={
        <Button variant="ghost" size="sm" onPress={reset}>
          Reset
        </Button>
      }
    >
      <Body>
        <List>
          <Row
            icon={Palette}
            title="Appearance"
            detail="Motion, contrast, transparency"
            onPress={() => nav.push({ id: "appearance" })}
          />
          <Divider />
          <Row
            icon={Languages}
            title="Language"
            detail="Press to choose the next one"
            trailing={<Text style={itemLook().description}>{language()}</Text>}
            onPress={() => {
              const next = (languages.indexOf(language()) + 1) % languages.length;
              language.set(languages[next]);
            }}
          />
          <Divider />
          <Row
            icon={Waves}
            title="Reduce motion"
            detail="Fade instead of sliding"
            trailing={
              <Switch
                checked={reduceMotion()}
                onChange={({ checked }) => reduceMotion.set(checked)}
              />
            }
          />
        </List>
      </Body>
    </NavPage>
  );
}

/** The third page: switches, and a way back to the bottom of the stack in one step. */
function AppearancePage() {
  return (
    <NavPage title="Appearance">
      <Body>
        <List>
          <Row
            icon={Contrast}
            title="Reduce transparency"
            detail="A solid fill under the header"
            trailing={
              <Switch
                checked={reduceTransparency()}
                onChange={({ checked }) => reduceTransparency.set(checked)}
              />
            }
          />
          <Divider />
          <Row
            icon={Eye}
            title="Increase contrast"
            detail="Hairlines a step darker"
            trailing={
              <Switch
                checked={increaseContrast()}
                onChange={({ checked }) => increaseContrast.set(checked)}
              />
            }
          />
        </List>
        <Button
          variant="secondary"
          onPress={() => nav.popToRoot()}
          style={{ alignSelf: "flex-start" }}
        >
          Back to Settings
        </Button>
      </Body>
    </NavPage>
  );
}

function App() {
  return (
    <NavStack state={nav}>
      {(route) =>
        route.id === "settings" ? (
          <SettingsPage />
        ) : route.id === "general" ? (
          <GeneralPage />
        ) : (
          <AppearancePage />
        )
      }
    </NavStack>
  );
}

mount(App);
