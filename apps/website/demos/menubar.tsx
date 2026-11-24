// A menubar has no official example here, so this page is the library's own: a notes app's bar, its
// File menu open (the row, a submenu, a shortcut, the danger tone), its View menu's checkable and
// one-of-many rows, and an inspector holding what was chosen.
import { mount, signal, Text, View } from "nsh";

import { menuItemLabel, menuItemNote } from "@/packages/ui/menu";
import {
  Menubar,
  MenubarCheckboxItem,
  MenubarContent,
  MenubarGroup,
  MenubarItem,
  MenubarLabel,
  MenubarMenu,
  MenubarRadioItem,
  MenubarSeparator,
  MenubarShortcut,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
} from "@/packages/ui/menubar";

import { DemoPage } from "./kit";
import { desktop, Log, Panel, Split, ui } from "./stage";

/** What the notes app's bar offers: a document's, the window's, and the phone's one menu. */
const ZOOMS = ["100%", "125%", "150%"];
const RECENT = ["Harbour at dusk", "Rough ideas", "Trip to the lakes"];

function App() {
  const last = signal("—");
  const which = signal("closed");
  const events = signal<string[]>([]);
  const sidebar = signal(true);
  const ruler = signal(false);
  const zoom = signal("100%");
  const choose = (what: string) => last.set(what);
  const changed = (name: string) => (event: { open: boolean; reason: string }) => {
    which.set(event.open ? name : "closed");
    events.set(
      [`${name} · ${event.open ? "opened" : "closed"} · ${event.reason}`, ...events()].slice(0, 6),
    );
  };
  /** A row's label, its shortcut, and a line under the label when the row has a description. */
  const keyed = (
    label: string,
    keys: string,
    variant?: "default" | "destructive",
    detail?: string,
  ) => (
    <>
      {detail ? (
        <View style={{ flexGrow: 1, flexShrink: 1, gap: 2 }}>
          <Text style={menuItemLabel({ variant })}>{label}</Text>
          <Text style={menuItemNote()}>{detail}</Text>
        </View>
      ) : (
        <Text style={menuItemLabel({ variant })}>{label}</Text>
      )}
      <MenubarShortcut>{keys}</MenubarShortcut>
    </>
  );

  return (
    <DemoPage title="Menubar">
      <Text style={{ color: ui().muted }}>
        {desktop
          ? "Open File; the bar's triggers stay, the menu under the one that is open"
          : "Open File; hold a trigger, or tap it and then the row"}
      </Text>

      <Split
        gap={14}
        inspector={
          <>
            <Panel title="open">
              <Text style={{ fontSize: 13, color: ui().text }}>{which()}</Text>
            </Panel>
            <Panel title="chosen">
              <Text style={{ fontSize: 13, color: ui().text }}>{last()}</Text>
            </Panel>
            <Log title="onOpenChange({ open, reason })" lines={events()} minHeight={120} />
          </>
        }
      >
        <Menubar>
          <MenubarMenu onOpenChange={changed("File")}>
            <MenubarTrigger>File</MenubarTrigger>
            <MenubarContent>
              <MenubarLabel>Document</MenubarLabel>
              <MenubarItem onSelect={() => choose("New document")}>
                {keyed("New document", "⌘N")}
              </MenubarItem>
              <MenubarItem onSelect={() => choose("Open…")}>
                {keyed("Open…", "⌘O", undefined, "A note from your disk")}
              </MenubarItem>
              <MenubarSub>
                <MenubarSubTrigger>Open recent</MenubarSubTrigger>
                <MenubarSubContent>
                  {RECENT.map((name) => (
                    <MenubarItem onSelect={() => choose(name)}>{name}</MenubarItem>
                  ))}
                  <MenubarSeparator />
                  <MenubarItem onSelect={() => choose("Clear menu")}>Clear menu</MenubarItem>
                </MenubarSubContent>
              </MenubarSub>
              <MenubarSeparator />
              <MenubarItem variant="destructive" onSelect={() => choose("Move to Trash")}>
                {keyed("Move to Trash", "⌘⌫", "destructive")}
              </MenubarItem>
            </MenubarContent>
          </MenubarMenu>

          <MenubarMenu onOpenChange={changed("View")}>
            <MenubarTrigger>View</MenubarTrigger>
            <MenubarContent>
              <MenubarGroup>
                <MenubarCheckboxItem checked={sidebar()} onSelect={() => sidebar.set(!sidebar())}>
                  Show sidebar
                </MenubarCheckboxItem>
                <MenubarCheckboxItem checked={ruler()} onSelect={() => ruler.set(!ruler())}>
                  Show ruler
                </MenubarCheckboxItem>
              </MenubarGroup>
              <MenubarSeparator />
              <MenubarLabel>Zoom</MenubarLabel>
              {ZOOMS.map((step) => (
                <MenubarRadioItem checked={zoom() === step} onSelect={() => zoom.set(step)}>
                  {step}
                </MenubarRadioItem>
              ))}
              <MenubarSeparator />
              <MenubarItem onSelect={() => choose("Enter full screen")}>
                {keyed("Enter full screen", "⌃⌘F")}
              </MenubarItem>
            </MenubarContent>
          </MenubarMenu>

          <MenubarMenu onOpenChange={changed("Help")}>
            <MenubarTrigger disabled>Help</MenubarTrigger>
            <MenubarContent>
              <MenubarItem onSelect={() => choose("Notes help")}>Notes help</MenubarItem>
            </MenubarContent>
          </MenubarMenu>
        </Menubar>
      </Split>
    </DemoPage>
  );
}

mount(App);
