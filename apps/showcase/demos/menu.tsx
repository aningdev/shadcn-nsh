import { alpha, colors, isDark, terminal } from "@shadcn-nsh/theme";
// Menu: the official gallery's scene (`references/nsh/examples/gallery/demos/Menus.tsx`).
// The rows, marks, popup and labels are this library's, and so are its `MenuTrigger`,
// `MenuSubTrigger` and `MenuButton`; the trigger is one of the scene's own chips or rows, which
// `nsh/base` makes the pressable without a wrapper. (The system menu's content is
// the app's own: a string child would be drawn as a button.) iOS `SegmentedControl` is not a part of
// the library.
import {
  ClipboardPaste,
  Clock,
  Copy,
  Download,
  Ellipsis,
  ExternalLink,
  File,
  FilePlus,
  FileText,
  FolderInput,
  Image,
  Layers,
  ListFilter,
  MapPin,
  Maximize2,
  Moon,
  PanelTop,
  Plus,
  Redo2,
  RefreshCw,
  Scissors,
  Search,
  Share2,
  Star,
  Sun,
  Trash2,
  Undo2,
  type IconNode,
} from "lucide";
import type { JSX } from "nsh";
import { keymap, LayoutAnimation, platform, reduceMotion, signal, Text, token, View } from "nsh";
import { ContextMenu, type OpenChangeReason, Toolbar } from "nsh/base";
import { SegmentedControl } from "nsh/mobile";

import { Button } from "@/packages/ui/button";
import { Kbd } from "@/packages/ui/kbd";
import { Icon } from "@/packages/ui/lib/icons";
import {
  Menu,
  MenuButton,
  MenuCheckboxItem,
  MenuContent,
  MenuItem,
  MenuLabel,
  menuItemGlyph,
  menuItemLabel,
  menuIsPopup,
  MenuRadioItem,
  MenuSeparator,
  MenuShortcut,
  MenuTrigger,
  menuHighlight,
  MenuSub,
  MenuSubContent,
  MenuSubTrigger,
  menuPopup,
} from "@/packages/ui/menu";
import { TooltipContent } from "@/packages/ui/tooltip";

import { Caption, DemoPage } from "../kit";
import { setAppearance } from "../theme";
import {
  Chip,
  Choices,
  createToaster,
  pointer,
  placementWords,
  SceneCard,
  type ToastContent,
} from "./overlays-shared";

const ZONES = [
  "UTC−10 Honolulu",
  "UTC−8 Los Angeles",
  "UTC−7 Denver",
  "UTC−6 Chicago",
  "UTC−5 New York",
  "UTC−3 São Paulo",
  "UTC±0 London",
  "UTC+1 Berlin",
  "UTC+2 Cairo",
  "UTC+3 Moscow",
  "UTC+4 Dubai",
  "UTC+5:30 Mumbai",
  "UTC+7 Bangkok",
  "UTC+8 Hong Kong",
  "UTC+8 Shanghai",
  "UTC+8 Singapore",
  "UTC+9 Tokyo",
  "UTC+9 Seoul",
  "UTC+10 Sydney",
  "UTC+12 Auckland",
];

type ListedFile = { id: number; name: string; starred: boolean };

type SortBy = "Name" | "Date modified" | "Size";
type Zoom = "Small" | "Medium" | "Large";
const SORTS: SortBy[] = ["Name", "Date modified", "Size"];
const ZOOMS: Zoom[] = ["Small", "Medium", "Large"];

const PROJECT = [
  { name: "main.rs", days: 1, kb: 4.2 },
  { name: "Cargo.toml", days: 9, kb: 0.6 },
  { name: "README.md", days: 3, kb: 2.1 },
  { name: "lib.rs", days: 0, kb: 12.8 },
];
const sorted = (by: SortBy) =>
  [...PROJECT].sort((a, b) =>
    by === "Name"
      ? a.name.localeCompare(b.name)
      : by === "Date modified"
        ? a.days - b.days
        : b.kb - a.kb,
  );

const LINES = [0.62, 0.38, 0.84, 0.7, 0.26, 0.55, 0.9, 0.44];

/** A row with an icon, a label and a note. A checkable row is `MarkItem`. */
function Item(props: {
  label: string;
  icon?: IconNode;
  onSelect?: () => void;
  shortcut?: string;
  note?: string;
  disabled?: boolean;
  danger?: boolean;
}) {
  const variant = () => (props.danger ? "destructive" : "default");
  return (
    <MenuItem onSelect={props.onSelect} disabled={props.disabled} variant={variant()} closeOnSelect>
      <>
        <If when={props.icon}>
          <Icon icon={props.icon!} {...menuItemGlyph({ variant: variant() })} />
        </If>
        <Text style={menuItemLabel({ variant: variant() })}>{props.label}</Text>
        <If when={props.shortcut ?? props.note}>
          <MenuShortcut>{props.shortcut ?? props.note}</MenuShortcut>
        </If>
      </>
    </MenuItem>
  );
}

/** A check (a setting) or a dot (one choice). `keepOpen` leaves the menu up. */
function MarkItem(props: {
  label: string;
  checked: boolean;
  radio?: boolean;
  keepOpen?: boolean;
  shortcut?: string;
  onSelect?: () => void;
}) {
  const body = (
    <>
      <Text style={menuItemLabel()}>{props.label}</Text>
      <If when={props.shortcut}>
        <MenuShortcut>{props.shortcut}</MenuShortcut>
      </If>
    </>
  );
  return (
    <If
      when={props.radio}
      else={
        <MenuCheckboxItem
          checked={props.checked}
          closeOnSelect={!props.keepOpen}
          onSelect={props.onSelect}
        >
          {body}
        </MenuCheckboxItem>
      }
    >
      <MenuRadioItem
        checked={props.checked}
        closeOnSelect={!props.keepOpen}
        onSelect={props.onSelect}
      >
        {body}
      </MenuRadioItem>
    </If>
  );
}

/** The row that opens a submenu, and the row a sheet shows to come back (`MenuSub`'s parts). */
function SubmenuOf(props: {
  label: string;
  icon?: IconNode;
  children: JSX.Element;
  disabled?: boolean;
}) {
  return (
    <MenuSub disabled={props.disabled}>
      <MenuSubTrigger
        lead={props.icon ? <Icon icon={props.icon} {...menuItemGlyph()} /> : undefined}
      >
        {props.label}
      </MenuSubTrigger>
      <MenuSubContent offset={4}>{props.children}</MenuSubContent>
    </MenuSub>
  );
}

/** A window the View menu arranges. */
function Preview(props: { sidebar: boolean; minimap: boolean; sort: SortBy; zoom: Zoom }) {
  const line = () => ({ Small: 4, Medium: 6, Large: 8 })[props.zoom];
  return (
    <View
      style={{
        flexDirection: "row",
        height: 128,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: colors.line,
        overflow: "hidden",
        backgroundColor: colors.card,
      }}
    >
      <View
        accessibilityLabel="Sidebar"
        style={{
          width: props.sidebar ? 104 : 0,
          opacity: props.sidebar ? 1 : 0,
          overflow: "hidden",
          backgroundColor: alpha(colors.foreground, 0.035),
          borderRightWidth: props.sidebar ? 1 : 0,
          borderColor: colors.line,
          paddingTop: 8,
        }}
      >
        <Each of={sorted(props.sort)} key={(file) => file.name}>
          {(file, i) => (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 5,
                height: 22,
                paddingHorizontal: 8,
                backgroundColor: i() === 0 ? alpha(colors.brand, 0.12) : "transparent",
              }}
            >
              <Icon icon={FileText} size={11} tint={i() === 0 ? colors.brand : colors.faint} />
              <Text
                style={{
                  numberOfLines: 1,
                  fontSize: 11,
                  fontFamily: "monospace",
                  color: i() === 0 ? colors.foreground : colors.mutedForeground,
                }}
              >
                {file().name}
              </Text>
            </View>
          )}
        </Each>
      </View>
      <View style={{ flex: 1, padding: 10, gap: line() * 0.75 }}>
        <Each of={LINES}>
          {(width, i) => (
            <View
              style={{
                width: `${Math.round(width() * 100)}%`,
                height: line(),
                borderRadius: line() / 2,
                backgroundColor:
                  i() % 3 === 0 ? alpha(colors.brand, 0.55) : alpha(colors.foreground, 0.16),
              }}
            />
          )}
        </Each>
      </View>
      <View
        accessibilityLabel="Minimap"
        style={{
          width: props.minimap ? 34 : 0,
          opacity: props.minimap ? 1 : 0,
          overflow: "hidden",
          borderLeftWidth: props.minimap ? 1 : 0,
          borderColor: colors.line,
          paddingVertical: 8,
          paddingHorizontal: 5,
          gap: 2,
        }}
      >
        <View
          style={{
            position: "absolute",
            left: 2,
            right: 2,
            top: 6,
            height: 36,
            borderRadius: 3,
            backgroundColor: alpha(colors.foreground, 0.07),
          }}
        />
        <Each of={[...LINES, ...LINES]}>
          {(width) => (
            <View
              style={{
                width: `${Math.round(width() * 100)}%`,
                height: 2,
                borderRadius: 1,
                backgroundColor: alpha(colors.foreground, 0.22),
              }}
            />
          )}
        </Each>
      </View>
    </View>
  );
}

const kindIcon = (name: string): IconNode => {
  const ext = name.slice(name.lastIndexOf(".") + 1).toLowerCase();
  return ext === "pdf"
    ? FileText
    : ext === "jpg" || ext === "png"
      ? Image
      : ext === "key"
        ? Layers
        : File;
};

/**
 * Menus of `nsh/base` in the library's look: a menu bar, row menus, placement, a long
 * scrolling menu, a menu a shortcut opens, and the system's own menu where the platform has one.
 */
export function MenuDemo() {
  const events = signal<string[]>([]);
  const log = (what: string) => events.set([what, ...events()].slice(0, 6));
  const shown = signal<string | null>(null);
  const isOpen = (menu: string) => shown() === menu;
  const changed =
    (menu: string) =>
    ({ open, reason }: { open: boolean; reason: OpenChangeReason }) => {
      if (open) shown.set(menu);
      else if (shown() === menu) shown.set(null);
      log(`${menu} ${open ? "opened" : "closed"} · ${reason}`);
    };
  const { toast, updateToast, Toaster } = createToaster();

  return (
    <DemoPage title="Menu">
      <MenuBar log={log} changed={changed} isOpen={isOpen} />
      <Rows log={log} changed={changed} isOpen={isOpen} />
      <Placement log={log} changed={changed} isOpen={isOpen} />
      <LongList changed={changed} isOpen={isOpen} />
      <Commands log={log} toast={toast} updateToast={updateToast} />
      <SystemMenu log={log} changed={changed} isOpen={isOpen} />
      <Events events={events} />
      <Toaster />
    </DemoPage>
  );
}

function MenuBar(props: {
  log: (line: string) => void;
  changed: (menu: string) => (event: { open: boolean; reason: OpenChangeReason }) => void;
  isOpen: (menu: string) => boolean;
}) {
  const { log, changed, isOpen } = props;
  const history = signal<string[]>([]);
  const undone = signal<string[]>([]);
  const sidebar = signal(true);
  const minimap = signal(false);
  const sort = signal<SortBy>("Name");
  const zoom = signal<Zoom>("Medium");
  const arrange = (change: () => void) => {
    if (!reduceMotion()) {
      LayoutAnimation.configureNext({
        duration: 240,
        update: { type: "spring", springDamping: 0.85 },
      });
    }
    change();
  };
  const recent = signal(["Budget.numbers", "Roadmap.md", "Trip photos"]);
  const act = (what: string) => {
    history.set([...history(), what]);
    undone.set([]);
    log(`chose ${what}`);
  };
  const undo = () => {
    const last = history().at(-1);
    if (!last) return;
    history.set(history().slice(0, -1));
    undone.set([...undone(), last]);
    log(`undid ${last}`);
  };
  const redo = () => {
    const last = undone().at(-1);
    if (!last) return;
    undone.set(undone().slice(0, -1));
    history.set([...history(), last]);
    log(`redid ${last}`);
  };
  keymap.bind({
    "mod+alt+n": () => act("New document"),
    "mod+alt+s": () => act("Save"),
    "mod+alt+z": undo,
    "mod+alt+b": () => arrange(() => sidebar.set(!sidebar())),
    "mod+alt+shift+z": redo,
  });
  const key = (binding: string) => (platform.desktop ? keymap.label(binding) : undefined);
  return (
    <SceneCard
      title="Menu bar"
      subtitle={
        platform.desktop
          ? "Hover across submenus; the shortcuts work too"
          : menuIsPopup()
            ? "Submenus open beside their items"
            : "Each menu a sheet; submenus take its place"
      }
    >
      <Toolbar
        accessibilityLabel="Menu bar"
        style={{ flexDirection: "row", gap: 2, marginLeft: pointer ? -10 : 0 }}
      >
        <Menu onOpenChange={changed("File")}>
          <MenuTrigger>
            <Chip bar label="File" open={isOpen("File")} />
          </MenuTrigger>
          <MenuContent offset={4} margin={8} {...menuPopup()}>
            <Item
              label="New document"
              icon={FilePlus}
              shortcut={key("mod+alt+n")}
              onSelect={() => act("New document")}
            />
            <Item label="New window" icon={PanelTop} onSelect={() => act("New window")} />
            <SubmenuOf label="Open recent" icon={Clock}>
              <Each of={recent()}>
                {(name) => <Item label={name()} onSelect={() => act(`Open ${name()}`)} />}
              </Each>
              <MenuSeparator />
              <Item
                label="Clear recent"
                disabled={recent().length === 0}
                onSelect={() => recent.set([])}
              />
            </SubmenuOf>
            <MenuSeparator />
            <Item
              label="Save"
              icon={Download}
              shortcut={key("mod+alt+s")}
              onSelect={() => act("Save")}
            />
            <SubmenuOf label="Export as" icon={Share2}>
              <Item label="PDF" onSelect={() => act("Export PDF")} />
              <SubmenuOf label="Image">
                <Item label="PNG" onSelect={() => act("Export PNG")} />
                <Item label="JPEG" onSelect={() => act("Export JPEG")} />
                <Item label="WebP" onSelect={() => act("Export WebP")} />
              </SubmenuOf>
              <SubmenuOf label="Web page" disabled>
                <Item label="HTML" />
              </SubmenuOf>
            </SubmenuOf>
            <MenuSeparator />
            <Item
              label="Delete document"
              icon={Trash2}
              danger
              onSelect={() => act("Delete document")}
            />
          </MenuContent>
        </Menu>
        <Menu onOpenChange={changed("Edit")}>
          <MenuTrigger>
            <Chip bar label="Edit" open={isOpen("Edit")} />
          </MenuTrigger>
          <MenuContent offset={4} margin={8} {...menuPopup()}>
            <Item
              label={history().length ? `Undo ${history().at(-1)}` : "Undo"}
              icon={Undo2}
              shortcut={key("mod+alt+z")}
              disabled={history().length === 0}
              onSelect={undo}
            />
            <Item
              label={undone().length ? `Redo ${undone().at(-1)}` : "Redo"}
              icon={Redo2}
              shortcut={key("mod+alt+shift+z")}
              disabled={undone().length === 0}
              onSelect={redo}
            />
            <MenuSeparator />
            <MenuLabel>Clipboard</MenuLabel>
            <Item label="Cut" icon={Scissors} onSelect={() => act("Cut")} />
            <Item label="Copy" icon={Copy} onSelect={() => act("Copy")} />
            <Item label="Paste" icon={ClipboardPaste} onSelect={() => act("Paste")} />
          </MenuContent>
        </Menu>
        <Menu onOpenChange={changed("View")}>
          <MenuTrigger>
            <Chip bar label="View" open={isOpen("View")} />
          </MenuTrigger>
          <MenuContent offset={4} margin={8} {...menuPopup()}>
            <MarkItem
              label="Show sidebar"
              checked={sidebar()}
              keepOpen
              shortcut={key("mod+alt+b")}
              onSelect={() => arrange(() => sidebar.set(!sidebar()))}
            />
            <MarkItem
              label="Show minimap"
              checked={minimap()}
              keepOpen
              onSelect={() => arrange(() => minimap.set(!minimap()))}
            />
            <MenuSeparator />
            <MenuLabel>Sort by</MenuLabel>
            <Each of={SORTS}>
              {(by) => (
                <MarkItem
                  label={by()}
                  radio
                  checked={sort() === by()}
                  onSelect={() => arrange(() => sort.set(by()))}
                />
              )}
            </Each>
            <MenuSeparator />
            <SubmenuOf label="Zoom" icon={Maximize2}>
              <Each of={ZOOMS}>
                {(size) => (
                  <MarkItem
                    label={size()}
                    radio
                    checked={zoom() === size()}
                    keepOpen
                    onSelect={() => arrange(() => zoom.set(size()))}
                  />
                )}
              </Each>
            </SubmenuOf>
          </MenuContent>
        </Menu>
      </Toolbar>
      <Preview sidebar={sidebar()} minimap={minimap()} sort={sort()} zoom={zoom()} />
      <Caption>
        {`Sidebar ${sidebar() ? "on" : "off"} · minimap ${minimap() ? "on" : "off"} · by ${sort()} · zoom ${zoom()}`}
      </Caption>
      <Caption>{history().length ? `Done: ${history().join(", ")}` : "Nothing done yet"}</Caption>
    </SceneCard>
  );
}

function Rows(props: {
  log: (line: string) => void;
  changed: (menu: string) => (event: { open: boolean; reason: OpenChangeReason }) => void;
  isOpen: (menu: string) => boolean;
}) {
  const { log, changed } = props;
  const next = signal(5);
  const files = signal<ListedFile[]>([
    { id: 1, name: "Invoice March.pdf", starred: false },
    { id: 2, name: "Holiday.jpg", starred: true },
    { id: 3, name: "Notes.txt", starred: false },
    { id: 4, name: "Slides.key", starred: false },
  ]);
  const update = (id: number, change: (file: ListedFile) => ListedFile) =>
    files.set(files().map((file) => (file.id === id ? change(file) : file)));
  const actions = (file: () => ListedFile) => (
    <>
      <Item label="Open" icon={ExternalLink} onSelect={() => log(`open ${file().name}`)} />
      <MarkItem
        label="Starred"
        checked={file().starred}
        onSelect={() => update(file().id, (row) => ({ ...row, starred: !row.starred }))}
      />
      <Item
        label="Duplicate"
        icon={Copy}
        onSelect={() => {
          const row = file();
          const at = files().findIndex((item) => item.id === row.id);
          const id = next();
          next.set(id + 1);
          const copy = {
            id,
            name: row.name.replace(/(\.[^.]+)?$/, " copy$1"),
            starred: false,
          };
          files.set([...files().slice(0, at + 1), copy, ...files().slice(at + 1)]);
        }}
      />
      <SubmenuOf label="Move to" icon={FolderInput}>
        <Item label="Documents" onSelect={() => log(`moved ${file().name} to Documents`)} />
        <Item label="Archive" onSelect={() => log(`moved ${file().name} to Archive`)} />
      </SubmenuOf>
      <MenuSeparator />
      <Item
        label="Delete"
        icon={Trash2}
        danger
        onSelect={() => files.set(files().filter((row) => row.id !== file().id))}
      />
    </>
  );
  return (
    <SceneCard
      title="On the rows of a list"
      subtitle={
        platform.desktop
          ? "Right click a row, or its ⋯ button"
          : "Hold a finger on a row, or press its ⋯"
      }
    >
      <If when={files().length > 0} else={<Caption>No files left</Caption>}>
        <View>
          <Each of={files()} key={(file) => file.id}>
            {(file, i) => (
              <ContextMenu
                margin={8}
                {...menuPopup()}
                onOpenChange={changed(file().name)}
                trigger={
                  <View
                    focusable
                    style={{
                      minHeight: pointer ? 44 : 52,
                      paddingVertical: 8,
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 12,
                      borderTopWidth: i() === 0 ? 0 : 1,
                      borderTopColor: colors.line,
                    }}
                  >
                    <Icon icon={kindIcon(file().name)} size={16} tint={colors.mutedForeground} />
                    <View
                      style={{
                        flex: 1,
                        minWidth: 0,
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      <Text
                        style={{
                          numberOfLines: 1,
                          flexShrink: 1,
                          fontSize: 14,
                          color: colors.foreground,
                        }}
                      >
                        {file().name}
                      </Text>
                      <If when={file().starred}>
                        <Icon icon={Star} size={12} tint={colors.brand} fill />
                      </If>
                    </View>
                    <Menu onOpenChange={changed(`${file().name} ⋯`)}>
                      <MenuTrigger>
                        <View
                          accessibilityLabel={`Actions for ${file().name}`}
                          tooltip={<TooltipContent>More actions</TooltipContent>}
                          hitSlop={8}
                          hoverStyle={menuHighlight()}
                          activeStyle={{ backgroundColor: alpha(colors.foreground, 0.1) }}
                          expandedStyle={{ backgroundColor: token("accent") }}
                          style={{
                            width: 28,
                            height: 28,
                            alignItems: "center",
                            justifyContent: "center",
                            borderRadius: 6,
                          }}
                        >
                          <If
                            when={terminal}
                            else={<Icon icon={Ellipsis} size={16} tint={colors.mutedForeground} />}
                          >
                            <Text style={{ color: colors.mutedForeground }}>⋯</Text>
                          </If>
                        </View>
                      </MenuTrigger>
                      <MenuContent align="end" offset={4} margin={8} {...menuPopup()}>
                        {actions(file)}
                      </MenuContent>
                    </Menu>
                  </View>
                }
              >
                {actions(file)}
              </ContextMenu>
            )}
          </Each>
        </View>
      </If>
    </SceneCard>
  );
}

function Placement(props: {
  log: (line: string) => void;
  changed: (menu: string) => (event: { open: boolean; reason: OpenChangeReason }) => void;
  isOpen: (menu: string) => boolean;
}) {
  const { log, changed, isOpen } = props;
  const placement = signal<"top" | "bottom" | "left" | "right">("bottom");
  const align = signal<"start" | "center" | "end">("start");
  return (
    <SceneCard
      title="Where it goes"
      subtitle={
        menuIsPopup()
          ? "The side and alignment; it flips where there is no room"
          : "Menus are sheets here: try a desktop"
      }
    >
      <Choices
        label="Side"
        value={placement()}
        onChange={(value) => placement.set(value as "top" | "bottom" | "left" | "right")}
        options={[
          { value: "top", label: "Top" },
          { value: "bottom", label: "Bottom" },
          { value: "left", label: "Left" },
          { value: "right", label: "Right" },
        ]}
      />
      <Choices
        label="Alignment"
        value={align()}
        onChange={(value) => align.set(value as "start" | "center" | "end")}
        options={[
          { value: "start", label: "Start" },
          { value: "center", label: "Center" },
          { value: "end", label: "End" },
        ]}
      />
      <View style={{ alignItems: "center", paddingVertical: 24 }}>
        <Menu onOpenChange={changed("Placed")}>
          <MenuTrigger>
            <Chip
              label={placementWords(placement(), align())}
              icon={terminal ? undefined : MapPin}
              open={isOpen("Placed")}
            />
          </MenuTrigger>
          <MenuContent
            placement={placement()}
            align={align()}
            offset={6}
            margin={8}
            {...menuPopup({
              get side() {
                return placement();
              },
            })}
          >
            <Item label="One" onSelect={() => log("chose One")} />
            <Item label="Two" onSelect={() => log("chose Two")} />
            <Item label="Three" onSelect={() => log("chose Three")} />
          </MenuContent>
        </Menu>
      </View>
    </SceneCard>
  );
}

function LongList(props: {
  changed: (menu: string) => (event: { open: boolean; reason: OpenChangeReason }) => void;
  isOpen: (menu: string) => boolean;
}) {
  const { changed, isOpen } = props;
  const zone = signal("UTC+8 Hong Kong");
  return (
    <SceneCard title="A long menu" subtitle="Twenty choices in a menu that scrolls">
      <Menu onOpenChange={changed("Time zone")}>
        <MenuTrigger>
          <Chip label={zone()} icon={terminal ? undefined : Search} open={isOpen("Time zone")} />
        </MenuTrigger>
        <MenuContent offset={4} margin={8} {...menuPopup()}>
          <Each of={ZONES}>
            {(zoneName) => (
              <MarkItem
                label={zoneName()}
                radio
                checked={zone() === zoneName()}
                onSelect={() => zone.set(zoneName())}
              />
            )}
          </Each>
        </MenuContent>
      </Menu>
    </SceneCard>
  );
}

function Commands(props: {
  log: (line: string) => void;
  toast: (content: ToastContent) => Promise<string | null>;
  updateToast: (id: string, change: Partial<ToastContent>) => boolean;
}) {
  const { log, toast, updateToast } = props;
  const open = signal(false);
  const sync = () => {
    log("ran Sync now");
    void toast({ id: "sync", kind: "loading", title: "Syncing…", duration: Infinity });
    setTimeout(
      () =>
        updateToast("sync", {
          kind: "success",
          title: "Up to date",
          description: "4 files synced",
          duration: 3000,
        }),
      1200,
    );
  };
  keymap.bind("mod+shift+p", () => open.set(!open()));
  return (
    <SceneCard
      title="Opened by the app"
      subtitle="A button or a shortcut opens it"
      right={platform.desktop ? <Kbd>{keymap.label("mod+shift+p")}</Kbd> : undefined}
    >
      <Menu
        open={open()}
        onOpenChange={({ open: next, reason }) => {
          open.set(next);
          log(`commands ${next ? "opened" : "closed"} · ${reason}`);
        }}
      >
        <MenuTrigger>
          <Chip label="Commands" icon={terminal ? undefined : Plus} open={open()} />
        </MenuTrigger>
        <MenuContent offset={4} margin={8} {...menuPopup()}>
          <MenuLabel>Commands</MenuLabel>
          <Item label="New note" icon={FilePlus} onSelect={() => log("ran New note")} />
          <Item
            label={isDark() ? "Light appearance" : "Dark appearance"}
            icon={isDark() ? Sun : Moon}
            onSelect={() => {
              setAppearance(isDark() ? "light" : "dark");
              log("ran Toggle theme");
            }}
          />
          <Item label="Sync now" icon={RefreshCw} onSelect={sync} />
        </MenuContent>
      </Menu>
      <Button variant="secondary" onPress={() => open.set(true)}>
        Open the commands
      </Button>
    </SceneCard>
  );
}

function SystemMenu(props: {
  log: (line: string) => void;
  changed: (menu: string) => (event: { open: boolean; reason: OpenChangeReason }) => void;
  isOpen: (menu: string) => boolean;
}) {
  const { log, changed, isOpen } = props;
  const sort = signal<"Name" | "Date" | "Size">("Date");
  const starred = signal(false);
  const folder = signal<"Documents" | "Archive">("Documents");
  const note = "Design review";
  const choose = (id: string) => {
    if (id === "star") starred.set(!starred());
    if (id.startsWith("move:")) folder.set(id.slice(5) as "Documents" | "Archive");
    log(`context menu · ${id}`);
  };
  const layout = signal(0);
  const layouts = ["List", "Grid", "Columns"] as const;
  const ios = platform.os === "ios";
  const menuOff = !ios && !platform.desktop;
  return (
    <SceneCard
      title="The system's menu"
      subtitle={
        ios
          ? "UIKit's menu and segmented control"
          : platform.desktop
            ? "The platform's menu at the pointer"
            : "Phones without a system menu use Menu"
      }
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
        <MenuButton
          testID="system-menu"
          accessibilityLabel="Arrange"
          title="Arrange"
          disabled={menuOff}
          items={[
            {
              id: "",
              label: "Sort by",
              inline: true,
              items: (["Name", "Date", "Size"] as const).map((by) => ({
                id: `sort:${by}`,
                label: by,
                checked: sort() === by,
              })),
            },
            { id: "share", label: "Share", icon: "square.and.arrow.up" },
            { id: "duplicate", label: "Duplicate", icon: "plus.square.on.square" },
            {
              id: "",
              label: "",
              inline: true,
              items: [{ id: "delete", label: "Delete", icon: "trash", destructive: true }],
            },
          ]}
          onSelect={({ id }) => {
            if (id.startsWith("sort:")) sort.set(id.slice(5) as "Name" | "Date" | "Size");
            log(`system menu · ${id}`);
          }}
        >
          <Chip label={`Sorted by ${sort()}`} icon={terminal ? undefined : ListFilter} />
        </MenuButton>
      </View>
      <ContextMenu
        margin={8}
        {...menuPopup()}
        title={`${note}.key`}
        items={[
          {
            id: "star",
            label: starred() ? "Unstar" : "Star",
            icon: starred() ? "star.slash" : "star",
          },
          { id: "share", label: "Share", icon: "square.and.arrow.up" },
          {
            id: "",
            label: "Move to",
            icon: "folder",
            items: (["Documents", "Archive"] as const).map((to) => ({
              id: `move:${to}`,
              label: to,
              checked: folder() === to,
            })),
          },
          {
            id: "",
            label: "",
            inline: true,
            items: [{ id: "delete", label: "Delete", icon: "trash", destructive: true }],
          },
        ]}
        onSelect={({ id }) => choose(id)}
        onOpenChange={changed(note)}
        trigger={
          <View
            focusable
            accessibilityLabel={`${note}, in ${folder()}`}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 12,
              padding: 12,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: colors.border,
              backgroundColor: isOpen(note) ? token("accent") : colors.raised,
            }}
          >
            <View
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: colors.inset,
              }}
            >
              <Icon icon={Layers} size={18} tint={colors.mutedForeground} />
            </View>
            <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                <Text
                  style={{
                    numberOfLines: 1,
                    flexShrink: 1,
                    fontSize: 14,
                    fontWeight: "600",
                    color: colors.foreground,
                  }}
                >
                  {note}
                </Text>
                <If when={starred()}>
                  <Icon icon={Star} size={12} tint={colors.brand} fill />
                </If>
              </View>
              <Text style={{ numberOfLines: 1, fontSize: 12, color: colors.mutedForeground }}>
                {`Keynote · ${folder()}`}
              </Text>
            </View>
          </View>
        }
      >
        <MarkItem label="Starred" checked={starred()} onSelect={() => choose("star")} />
        <Item label="Share" icon={Share2} onSelect={() => choose("share")} />
        <SubmenuOf label="Move to" icon={FolderInput}>
          <MarkItem
            label="Documents"
            radio
            checked={folder() === "Documents"}
            onSelect={() => choose("move:Documents")}
          />
          <MarkItem
            label="Archive"
            radio
            checked={folder() === "Archive"}
            onSelect={() => choose("move:Archive")}
          />
        </SubmenuOf>
        <MenuSeparator />
        <Item label="Delete" icon={Trash2} danger onSelect={() => choose("delete")} />
      </ContextMenu>
      <Caption>
        {ios
          ? "Hold the note: UIKit lifts it into its context menu"
          : platform.desktop
            ? "Right click the note"
            : "Hold the note"}
      </Caption>
      <If
        when={ios}
        else={
          <Choices
            label="Layout"
            value={String(layout())}
            onChange={(value) => layout.set(Number(value))}
            options={layouts.map((label, index) => ({ value: String(index), label }))}
          />
        }
      >
        <SegmentedControl
          testID="system-segments"
          items={layouts.map((title) => ({ title }))}
          selectedIndex={layout()}
          onChange={({ index }) => layout.set(index)}
        />
      </If>
      <Caption>{`${layouts[layout()]} · sorted by ${sort()}`}</Caption>
    </SceneCard>
  );
}

function Events(props: { events: () => string[] }) {
  const { events } = props;
  return (
    <SceneCard title="Events" subtitle="onOpenChange with its reason, and what was chosen">
      <If when={events().length > 0} else={<Caption>Open a menu</Caption>}>
        <View style={{ gap: 4 }}>
          <Each of={events()}>
            {(line, i) => (
              <Text
                style={{
                  fontSize: 12,
                  fontFamily: "monospace",
                  color: i() === 0 ? colors.foreground : colors.faint,
                }}
              >
                {line()}
              </Text>
            )}
          </Each>
        </View>
      </If>
    </SceneCard>
  );
}
