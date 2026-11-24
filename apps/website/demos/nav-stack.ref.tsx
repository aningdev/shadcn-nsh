import "./apply-palette";
import { colors } from "@shadcn-nsh/theme";
// The reference of `nav-stack.tsx`: the same settings app as `nsh/base` writes it — its `NavStack`
// and `NavPage`, and the page's header drawn by hand from `navPageLook()`'s words. The render check
// requires the two to draw the same pixels.
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
import { NavPage as BaseNavPage, NavStack as BaseNavStack, createNavStack } from "nsh/base";

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
import { navPageLook, navStackLook } from "@/packages/ui/nav-stack";
import { Pressable } from "@/packages/ui/pressable";
import { Switch } from "@/packages/ui/switch";

/** The pages: the settings' list, one group of it, and the appearance it opens. */
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

/** The header the desktops and the web draw, spread from `navPageLook()` on plain views. */
function PageHeader(props: {
  title: string;
  right?: JSX.Element;
  /** The page below this one, when there is one: the back button's press. */
  back?: () => void;
  /** Whether it has one: a page below the one shown. */
  above: () => boolean;
  /** Whether the small title is in the bar: off with the large title in view, on once it has scrolled away. */
  reveal?: () => boolean;
}) {
  const look = navPageLook();
  return (
    <View style={look.header()}>
      <If when={props.above()}>
        <IconButton accessibilityLabel="Back" onPress={() => props.back?.()}>
          <Icon icon={ChevronLeft} size={look.backGlyph().size} tint={look.backGlyph().tint} />
        </IconButton>
      </If>
      <Text style={look.title()}>{() => (props.reveal && !props.reveal() ? "" : props.title)}</Text>
      <If when={props.right}>{props.right}</If>
    </View>
  );
}

/** The first page: the list everything else hangs off. */
function SettingsPage() {
  return (
    <BaseNavPage
      title="Settings"
      style={navPageLook().page()}
      header={<PageHeader title="Settings" above={() => nav.routes().length > 1} />}
    >
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
    </BaseNavPage>
  );
}

/** The second page: it pushes the third, and its trailing action puts the group back as it was. */
function GeneralPage() {
  const reset = () => {
    language.set(languages[0]);
    reduceMotion.set(false);
  };
  // The trailing action twice over: the system header's item and the drawn header's slot. An
  // element mounts once, so the second place needs an element of its own.
  const right = () => (
    <Button variant="ghost" size="sm" onPress={reset}>
      Reset
    </Button>
  );
  return (
    <BaseNavPage
      title="General"
      headerRight={right()}
      style={navPageLook().page()}
      header={
        <PageHeader
          title="General"
          right={right()}
          back={() => nav.pop()}
          above={() => nav.routes().length > 1}
        />
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
    </BaseNavPage>
  );
}

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

/** The library page: the large title in the scroll, the small one shown in the bar once it passes. */
function LargePage() {
  const offset = signal(0);
  const selected = signal(BOOKS[0].title);
  return (
    <BaseNavPage
      title="Library"
      style={navPageLook().page()}
      header={
        <PageHeader
          title="Library"
          back={() => nav.pop()}
          above={() => nav.routes().length > 1}
          reveal={() => offset() > 40}
        />
      }
    >
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
    </BaseNavPage>
  );
}

/** The draft page: `popOnBack` takes its guard from the text, `onBackPress` asks. */
function DraftPage() {
  return (
    <BaseNavPage
      title="A draft"
      style={navPageLook().page()}
      header={
        <PageHeader
          title="A draft"
          back={() => (draft().length > 0 ? ask.set(true) : nav.pop())}
          above={() => nav.routes().length > 1}
        />
      }
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
    </BaseNavPage>
  );
}

/** The third page: switches, and a way back to the bottom of the stack in one step. */
function AppearancePage() {
  return (
    <BaseNavPage
      title="Appearance"
      style={navPageLook().page()}
      header={
        <PageHeader
          title="Appearance"
          back={() => nav.pop()}
          above={() => nav.routes().length > 1}
        />
      }
    >
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
    </BaseNavPage>
  );
}

function App() {
  return (
    <View style={{ flex: 1 }}>
      <BaseNavStack state={nav} style={navStackLook().root()}>
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
      </BaseNavStack>
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
