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
//
// Two more pages carry a Gallery example: a library whose large title folds into the bar as the
// list scrolls (drawn here, since `headerLargeTitle` is the iOS header's), and a draft whose back
// press asks before it leaves (`popOnBack` + `onBackPress` + an alert).
import {
  Bell,
  BookOpen,
  Check,
  ChevronLeft,
  ChevronRight,
  Contrast,
  Eye,
  Languages,
  Palette,
  Pencil,
  RefreshCw,
  SlidersHorizontal,
  Waves,
  type IconNode,
} from "lucide";
import type { JSX } from "nsh";
import { mount, Scroll, signal, Text, View } from "nsh";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/packages/ui/alert-dialog";
import { Button, IconButton } from "@/packages/ui/button";
import { Input } from "@/packages/ui/input";
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
import { createNavStack, NavPage, NavStack, navPageLook } from "@/packages/ui/nav-stack";
import { Pressable } from "@/packages/ui/pressable";
import { Switch } from "@/packages/ui/switch";

/** The pages: the settings' list, the pages it opens, and the two the examples draw. */
type Route =
  | { id: "settings" }
  | { id: "general" }
  | { id: "appearance" }
  | { id: "large" }
  | { id: "draft" };

const nav = createNavStack<Route>([{ id: "settings" }]);

const notifications = signal(true);
const autoUpdate = signal(false);
const reduceMotion = signal(false);
const reduceTransparency = signal(false);
const increaseContrast = signal(false);
const languages = ["English", "Français", "日本語"];
const language = signal(languages[0]);

/** The draft page's text, and whether the alert that guards it is up. */
const draft = signal("Add a keyboard shortcut for quick settings.");
const ask = signal(false);
const published = signal(false);

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
            icon={BookOpen}
            title="Library"
            detail="A large title that folds into the bar"
            onPress={() => nav.push({ id: "large" })}
          />
          <Divider />
          <Row
            icon={Pencil}
            title="A draft"
            detail="Back asks before discarding it"
            onPress={() => nav.push({ id: "draft" })}
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

/** The books the library page lists: enough rows to scroll the title away. */
const BOOKS = [
  { title: "The Long Way", author: "Ada Ferrer" },
  { title: "Notes on Light", author: "Ines Okafor" },
  { title: "A Quiet Signal", author: "Tomas Lind" },
  { title: "Paper Machines", author: "Ruth Calloway" },
  { title: "The Glass Coast", author: "Mina Sato" },
  { title: "Every Other Tuesday", author: "Jonas Weaver" },
  { title: "Field Notes", author: "Priya Raman" },
  { title: "A Room of Maps", author: "Elliot Vance" },
  { title: "The Slow Web", author: "Nadia Brandt" },
  { title: "Small Hours", author: "Owen Pike" },
  { title: "Tidal", author: "Sofia Marchetti" },
  { title: "The Cartographer's Dog", author: "Lena Fischer" },
  { title: "After the Rain", author: "Marcus Bell" },
  { title: "A Wider View", author: "Hana Ito" },
  { title: "The Memory Orchard", author: "Caleb Stone" },
  { title: "Open Ledger", author: "Imani Cole" },
  { title: "The Last Tram", author: "Viktor Salo" },
  { title: "Borrowed Weather", author: "June Ellery" },
  { title: "North of Here", author: "Peter Nakamura" },
  { title: "A Kind of Archive", author: "Leila Haddad" },
  { title: "The Understory", author: "Rosa Delgado" },
  { title: "Pages from a Blue Year", author: "Simon Achterberg" },
  { title: "The Quiet Engine", author: "Maeve Sullivan" },
  { title: "A Little Further", author: "Theo Marsh" },
];

/** The bar over the library: the back button, and the small title once the large one scrolls away. */
function LargeHeader(props: { offset: () => number }) {
  const look = navPageLook();
  return (
    <View style={look.header()}>
      <IconButton accessibilityLabel="Back" onPress={() => nav.pop()}>
        <Icon icon={ChevronLeft} size={look.backGlyph().size} tint={look.backGlyph().tint} />
      </IconButton>
      <Text style={look.title()}>{() => (props.offset() > 40 ? "Library" : "")}</Text>
    </View>
  );
}

/** A large title in the content, and a bar title that appears as it scrolls under the bar. */
function LargePage() {
  const offset = signal(0);
  const selected = signal(BOOKS[0].title);
  return (
    <NavPage title="Library" header={() => <LargeHeader offset={offset} />}>
      <View style={{ flex: 1 }}>
        <Scroll
          style={{ flex: 1 }}
          contentStyle={{ padding: density.pad, gap: density.gap }}
          onScroll={(event) => {
            const next = Math.round(event.offset.y);
            if (next !== offset()) offset.set(next);
          }}
        >
          <View style={{ gap: 2, paddingTop: 2, paddingBottom: 4 }}>
            <Text style={{ fontSize: 34, fontWeight: "700", color: colors.foreground }}>
              Library
            </Text>
            <Text style={{ fontSize: 13, color: colors.mutedForeground }}>
              24 titles · synced today
            </Text>
          </View>
          <List>
            {BOOKS.map((book, index) => (
              <>
                {index > 0 ? <Divider /> : null}
                <Row
                  icon={BookOpen}
                  title={book.title}
                  detail={book.author}
                  trailing={
                    selected() === book.title ? (
                      <Icon icon={Check} size={16} tint={colors.brand} />
                    ) : undefined
                  }
                  onPress={() => selected.set(book.title)}
                />
              </>
            ))}
          </List>
          <Text style={{ fontSize: density.note, color: colors.mutedForeground }}>
            Scroll the list and the large title folds into the bar: the bar's title appears once the
            large one has passed 40 points.
          </Text>
        </Scroll>
        <View style={{ paddingHorizontal: density.pad, paddingBottom: 10 }}>
          <Text style={{ fontSize: density.note, color: colors.mutedForeground }}>
            {() => `Scrolled ${offset()} pt · selected ${selected()}`}
          </Text>
        </View>
      </View>
    </NavPage>
  );
}

/** A draft page whose back press is guarded while there is text to lose. */
function DraftPage() {
  return (
    <NavPage
      title="A draft"
      popOnBack={draft().length === 0}
      onBackPress={() => {
        if (draft().length > 0) ask.set(true);
      }}
    >
      <Body>
        <List>
          <View style={{ padding: 12, gap: 10 }}>
            <Text style={{ fontSize: 13, fontWeight: "600", color: colors.foreground }}>
              Release notes
            </Text>
            <Input
              multiline
              grow
              value={draft()}
              onChange={({ value }) => {
                draft.set(value);
                published.set(false);
              }}
              placeholder="What changed?"
              accessibilityLabel="Release notes"
            />
            <Text style={{ fontSize: density.note, color: colors.mutedForeground }}>
              {() =>
                published()
                  ? "Published — back leaves without asking."
                  : `${draft().length} characters would be lost: back asks first.`
              }
            </Text>
          </View>
        </List>
        <Button
          variant="default"
          disabled={draft().length === 0 || published()}
          onPress={() => published.set(true)}
          style={{ alignSelf: "flex-start" }}
        >
          Publish
        </Button>
        <Text style={{ fontSize: density.note, color: colors.mutedForeground }}>
          Press Back, Escape, Alt+Left or the mouse's back button while the draft has text: the page
          asks first, from `popOnBack` and `onBackPress`.
        </Text>
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
    <View style={{ flex: 1 }}>
      <NavStack state={nav}>
        {(route) =>
          route.id === "settings" ? (
            <SettingsPage />
          ) : route.id === "general" ? (
            <GeneralPage />
          ) : route.id === "appearance" ? (
            <AppearancePage />
          ) : route.id === "large" ? (
            <LargePage />
          ) : (
            <DraftPage />
          )
        }
      </NavStack>
      <AlertDialog
        open={ask()}
        onOpenChange={({ open }) => ask.set(open)}
        onAction={({ action }) => {
          ask.set(false);
          if (action === "discard") {
            draft.set("");
            nav.pop();
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard your changes?</AlertDialogTitle>
            <AlertDialogDescription>
              The release notes are not published. Leaving now discards them.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction id="keep" role="cancel">
              Keep editing
            </AlertDialogAction>
            <AlertDialogAction id="discard" role="destructive">
              Discard
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </View>
  );
}

mount(App);
