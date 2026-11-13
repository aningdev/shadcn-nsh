// The official sheet scene (`references/nsh/website/demos/el-sheet.tsx`) with this library's
// parts: one sheet opened from the four edges (a cross of buttons in a wide window, a column of
// them on a phone), and an inspector holding which edge and side it opened at, and the last six
// lifecycle lines.
import { colors } from "@shadcn-nsh/theme";
import { mount, signal, Text, View } from "nsh";

import { Button } from "@/packages/ui/button";
import { Sheet, SheetClose, SheetContent, type SheetSide } from "@/packages/ui/sheet";

import { DemoPage } from "./kit";
import { desktop, Log, Panel, Split, wide } from "./stage";

const SIDES: SheetSide[] = ["top", "left", "right", "bottom"];

function App() {
  const open = signal(false);
  const side = signal<SheetSide>("bottom");
  const events = signal<string[]>([]);
  const log = (line: string) => events.set([line, ...events()].slice(0, 6));
  const show = (s: SheetSide) => {
    side.set(s);
    open.set(true);
    log(`open · side ${s}`);
  };
  /** A button that opens the sheet at side `s`; the side it opened last shows as chosen. */
  const opener = (s: SheetSide) => (
    <Button
      variant="secondary"
      selected={s === side()}
      onPress={() => show(s)}
      style={wide() ? undefined : { alignSelf: "stretch" }}
    >
      {`side="${s}"`}
    </Button>
  );

  return (
    <DemoPage title="Sheet">
      <Text style={{ color: colors.muted }}>
        {desktop
          ? "Open a side; click the backdrop or press Escape to close it"
          : "Open a side; tap the backdrop or Android's back to close it"}
      </Text>

      <Split
        gap={14}
        inspector={
          <>
            <Panel title="open · side">
              <Text style={{ fontSize: 13, color: colors.text }}>
                {open() ? "open" : "closed"} · {side()}
              </Text>
            </Panel>
            <Log
              title="onOpenChange({ open, reason }) · onCancel"
              lines={events()}
              minHeight={130}
            />
          </>
        }
      >
        {/* Each button at the edge its sheet comes from. */}
        <If when={wide()}>
          <View style={{ width: 360, maxWidth: "100%", gap: 12 }}>
            <View style={{ alignItems: "center" }}>{opener("top")}</View>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              {opener("left")}
              {opener("right")}
            </View>
            <View style={{ alignItems: "center" }}>{opener("bottom")}</View>
          </View>
        </If>
        <If when={!wide()}>
          <View style={{ width: 240, gap: 8 }}>{SIDES.map((s) => opener(s))}</View>
        </If>
      </Split>

      <Sheet
        open={open()}
        onOpenChange={({ open: next, reason }) => {
          open.set(next);
          log(`onOpenChange · ${next ? "opened" : "closed"} · ${reason}`);
        }}
        onCancel={() => log("onCancel")}
      >
        <SheetContent side={side()} closeOnSwipe>
          <Text style={{ fontSize: desktop ? 16 : 18, fontWeight: "600", color: colors.text }}>
            Filters
          </Text>
          <Text
            style={{
              fontSize: desktop ? 13 : 15,
              lineHeight: desktop ? 19 : 21,
              color: colors.muted,
            }}
          >
            {`A panel at the ${side()} edge. `}
            {desktop
              ? "The backdrop and Escape close it."
              : "The backdrop and Android's back close it."}
          </Text>
          <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
            <SheetClose variant="primary" onPress={() => log("Done pressed")}>
              Done
            </SheetClose>
          </View>
        </SheetContent>
      </Sheet>
    </DemoPage>
  );
}

mount(App);
