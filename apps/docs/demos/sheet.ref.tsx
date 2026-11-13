// The reference of `sheet.tsx`: the same scene with the panel's look (`sheetPanel`, `backdrop`)
// spread on `nsh/base`'s Sheet, the way the official example
// (`references/nsh/website/demos/el-sheet.tsx`) writes it. It differs from the component page
// only in the parts it names.
import { colors } from "@shadcn-nsh/theme";
import { mount, signal, Text, View } from "nsh";
import { Sheet } from "nsh/base";

import { Button } from "@/packages/ui/button";
import { backdrop } from "@/packages/ui/lib/overlay";
import { sheetPanel, type SheetSide } from "@/packages/ui/sheet";

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
        closeOnSwipe
        side={side()}
        popupStyle={sheetPanel(side())}
        backdropStyle={backdrop()}
        onOpenChange={({ open: next, reason }) => {
          open.set(next);
          log(`onOpenChange · ${next ? "opened" : "closed"} · ${reason}`);
        }}
        onCancel={() => log("onCancel")}
      >
        <If when={side() === "bottom"}>
          <View
            style={{
              width: 36,
              height: 5,
              borderRadius: 3,
              alignSelf: "center",
              backgroundColor: colors.raised,
            }}
          />
        </If>
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
          <Button
            variant="primary"
            onPress={() => {
              open.set(false);
              log("Done pressed");
            }}
          >
            Done
          </Button>
        </View>
      </Sheet>
    </DemoPage>
  );
}

mount(App);
