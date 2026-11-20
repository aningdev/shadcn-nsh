// A refresh indicator's scenes: a list that reloads when it is pulled (or when Reload is pressed),
// with the system's spinner or the chip, and the chip at four pulls. A headless run cannot pull, so
// the second scene fixes `pull` to show what the pull draws.
import { createAnimatedValue, mount, Scroll, signal, Text, View } from "nsh";

import { Button } from "@/packages/ui/button";
import { Item, ItemContent, ItemGroup, ItemTitle } from "@/packages/ui/item";
import { insetSurface, sectionSurface } from "@/packages/ui/lib/surface";
import { RefreshIndicator, REFRESH_INDICATOR_HEIGHT } from "@/packages/ui/refresh-indicator";

import { DemoCard, DemoPage, DemoSection } from "./kit";
import { desktop, Segmented, ui } from "./stage";

const ROWS = [
  "Inbox",
  "Drafts",
  "Sent",
  "Archive",
  "Spam",
  "Trash",
  "Starred",
  "Snoozed",
  "Labels",
];

/** A reload that takes a second: `refreshing` is the app's, the indicator only draws it. */
function Reload() {
  const refreshing = signal(false);
  const reloaded = signal(0);
  const kind = signal<"System spinner" | "RefreshIndicator">("RefreshIndicator");
  const pull = createAnimatedValue(0);
  const refresh = () => {
    if (refreshing()) return;
    refreshing.set(true);
    setTimeout(() => {
      reloaded.set(reloaded() + 1);
      refreshing.set(false);
    }, 1500);
  };
  const custom = () => kind() === "RefreshIndicator";
  return (
    <View style={{ gap: 12 }}>
      <View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 8 }}>
        <Segmented
          options={["System spinner", "RefreshIndicator"] as const}
          value={kind()}
          onChange={(next) => kind.set(next)}
        />
        <Button variant="secondary" size="sm" disabled={refreshing()} onPress={refresh}>
          Reload
        </Button>
        <Text style={{ color: ui().muted, fontSize: 13 }}>{`reloaded ${reloaded()} times`}</Text>
      </View>
      <Text style={{ color: ui().muted }}>
        {desktop
          ? "Pull the list down with a trackpad, or press Reload"
          : "Pull the list down, or press Reload"}
      </Text>
      <View style={{ height: 280, ...sectionSurface(), overflow: "hidden" }}>
        <Scroll
          style={{ flex: 1 }}
          refreshing={refreshing()}
          onRefresh={refresh}
          pullValue={pull}
          refreshIndicator={custom() ? { height: REFRESH_INDICATOR_HEIGHT } : undefined}
        >
          <ItemGroup>
            <Each of={ROWS}>
              {(row) => (
                <Item size="sm">
                  <ItemContent>
                    <ItemTitle>{row()}</ItemTitle>
                  </ItemContent>
                </Item>
              )}
            </Each>
          </ItemGroup>
        </Scroll>
        <If when={custom()}>
          <RefreshIndicator pull={pull} refreshing={refreshing()} />
        </If>
      </View>
    </View>
  );
}

/** The chip at four pulls: just begun, halfway, at the height where it refreshes, and refreshing. */
const STEPS = [
  { label: "Just begun", pull: 24, refreshing: false },
  { label: "Halfway", pull: 36, refreshing: false },
  { label: "Release to refresh", pull: 72, refreshing: false },
  { label: "Refreshing", pull: 72, refreshing: true },
] as const;

function Steps() {
  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
      <Each of={STEPS}>
        {(step) => {
          const pull = createAnimatedValue(step().pull);
          return (
            <View style={{ alignItems: "center", gap: 6 }}>
              <View style={{ width: 120, height: 72, ...insetSurface() }}>
                <RefreshIndicator pull={pull} refreshing={step().refreshing} />
              </View>
              <Text style={{ color: ui().muted, fontSize: 12 }}>{step().label}</Text>
            </View>
          );
        }}
      </Each>
    </View>
  );
}

function App() {
  return (
    <DemoPage title="RefreshIndicator">
      <DemoCard>
        <DemoSection title="Pull to refresh" axis="block">
          <Reload />
        </DemoSection>
        <DemoSection title="At each pull" axis="block">
          <Steps />
        </DemoSection>
      </DemoCard>
    </DemoPage>
  );
}

mount(App);
