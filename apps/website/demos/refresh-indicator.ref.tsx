import { ArrowDown } from "lucide";
// The reference of `refresh-indicator.tsx`: the same page, the look spread on `nsh`'s own View
// instead of worn by the component. The render check requires the two to draw the same pixels.
import { createAnimatedValue, mount, Scroll, signal, Text, View } from "nsh";

import { Button } from "@/packages/ui/button";
import { Item, ItemContent, ItemGroup, ItemTitle } from "@/packages/ui/item";
import { Icon } from "@/packages/ui/lib/icons";
import { insetSurface, sectionSurface } from "@/packages/ui/lib/surface";
import { refreshIndicatorLook, REFRESH_INDICATOR_HEIGHT } from "@/packages/ui/refresh-indicator";
import { Spinner } from "@/packages/ui/spinner";

import { DemoCard, DemoPage, DemoSection } from "./kit";
import { desktop, Segmented, ui } from "./stage";

const look = refreshIndicatorLook();

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
          <View style={look.root(REFRESH_INDICATOR_HEIGHT)}>
            <View style={look.chip(pull, REFRESH_INDICATOR_HEIGHT)}>
              <View style={look.arrow(pull, REFRESH_INDICATOR_HEIGHT, refreshing())}>
                <Icon icon={ArrowDown} size={look.glyph()} tint={look.tint()} />
              </View>
              <If when={refreshing()}>
                <View style={look.ring()}>
                  <Spinner size={look.glyph()} tint={look.tint()} />
                </View>
              </If>
            </View>
          </View>
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
                <View style={look.root(REFRESH_INDICATOR_HEIGHT)}>
                  <View style={look.chip(pull, REFRESH_INDICATOR_HEIGHT)}>
                    <View style={look.arrow(pull, REFRESH_INDICATOR_HEIGHT, step().refreshing)}>
                      <Icon icon={ArrowDown} size={look.glyph()} tint={look.tint()} />
                    </View>
                    <If when={step().refreshing}>
                      <View style={look.ring()}>
                        <Spinner size={look.glyph()} tint={look.tint()} />
                      </View>
                    </If>
                  </View>
                </View>
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
