// The reference of `drawer.tsx`. `drawerGrabber`, `drawerHeader` and `drawerFooter` are private
// to the component, so this page draws the component itself. The two pages match because they are the same composition.
import { mount, signal, Text, View } from "nsh";

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/packages/ui/drawer";
import { Input } from "@/packages/ui/input";

import { DemoPage } from "./kit";
import { desktop, Log, Panel, Split, ui } from "./stage";

/** Where the photo goes: a row per destination, and who it reaches. */
const DESTINATIONS = [
  { name: "Messages", detail: "2 people" },
  { name: "Mail", detail: "your own address" },
];

function App() {
  const which = signal("closed");
  const events = signal<string[]>([]);
  const log = (line: string) => events.set([line, ...events()].slice(0, 6));
  const changed = (name: string) => (event: { open: boolean; reason: string }) => {
    which.set(event.open ? name : "closed");
    log(`${name} · ${event.open ? "opened" : "closed"} · ${event.reason}`);
  };

  return (
    <DemoPage title="Drawer">
      <Text style={{ color: ui().muted }}>
        {desktop
          ? "Open Share; drag its top edge down past a third of its height, or click the scrim"
          : "Open Share; drag it down past a third of its height, tap the scrim or press back"}
      </Text>

      <Split
        gap={14}
        inspector={
          <>
            <Panel title="open">
              <Text style={{ fontSize: 13, color: ui().text }}>{which()}</Text>
            </Panel>
            <Log
              title="onOpenChange({ open, reason }) · onCancel"
              lines={events()}
              minHeight={130}
            />
          </>
        }
      >
        {/* One wrapper per drawer: its panel is a child of its trigger's box, so the row's gap
            falls between the triggers and not beside a closed panel. */}
        <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
          <View>
            <Drawer onOpenChange={changed("Share")} onCancel={() => log("Share · onCancel")}>
              <DrawerTrigger variant="default">Share…</DrawerTrigger>
              <DrawerContent>
                <DrawerHeader>
                  <DrawerTitle>Share this photo</DrawerTitle>
                  <DrawerDescription>
                    Anyone with the link can view it, and the photo leaves the app now.
                  </DrawerDescription>
                </DrawerHeader>
                <View style={{ gap: 8 }}>
                  {DESTINATIONS.map((to) => (
                    <DrawerClose onPress={() => log(`shared · ${to.name}`)}>
                      {`${to.name} — ${to.detail}`}
                    </DrawerClose>
                  ))}
                </View>
                <DrawerFooter>
                  <DrawerClose variant="default" onPress={() => log("copied the link")}>
                    Copy link
                  </DrawerClose>
                  <DrawerClose>Cancel</DrawerClose>
                </DrawerFooter>
              </DrawerContent>
            </Drawer>
          </View>

          <View>
            <Drawer onOpenChange={changed("Rename")} onCancel={() => log("Rename · onCancel")}>
              <DrawerTrigger>Rename…</DrawerTrigger>
              <DrawerContent side="right">
                <DrawerHeader>
                  <DrawerTitle>Rename the photo</DrawerTitle>
                  <DrawerDescription>
                    {`A name is what the list shows and what screen readers say.`}
                  </DrawerDescription>
                </DrawerHeader>
                <Input defaultValue="Harbour at dusk" accessibilityLabel="Photo name" />
                <DrawerFooter>
                  <DrawerClose variant="default" onPress={() => log("renamed")}>
                    Save
                  </DrawerClose>
                  <DrawerClose>Cancel</DrawerClose>
                </DrawerFooter>
              </DrawerContent>
            </Drawer>
          </View>
        </View>
      </Split>
    </DemoPage>
  );
}

mount(App);
