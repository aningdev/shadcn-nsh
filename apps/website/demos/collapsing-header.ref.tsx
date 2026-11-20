// The reference of `collapsing-header.tsx`: the same page, the look spread on `nsh`'s own View and
// Text instead of worn by the component. The render check requires the two to draw the same pixels.
import { alpha, colors, stroke } from "@shadcn-nsh/theme";
import { createAnimatedValue, List, mount, Scroll, signal, Text, View } from "nsh";

import { Button } from "@/packages/ui/button";
import { collapsingHeaderLook } from "@/packages/ui/collapsing-header";
import { density, sectionSurface } from "@/packages/ui/lib/surface";

import { DemoCard, DemoPage, DemoSection } from "./kit";
import { desktop, ui } from "./stage";

const look = collapsingHeaderLook();

/** How tall the header is open and the bar it comes to: a phone's header, a desktop's toolbar. */
const OPEN = desktop ? 168 : 220;
const BAR = desktop ? 44 : 56;
/** The bar as the header draws it (whole rows in a terminal): where the page's headings stick. */
const heights = look.heights(OPEN, BAR);

type Row = { week: number } | { title: string; detail: string };

const rows: Row[] = [];
for (let week = 1; week <= 3; week++) {
  rows.push({ week });
  for (let entry = 1; entry <= 6; entry++) {
    rows.push({ title: `Entry ${week}.${entry}`, detail: `${(week * 7 + entry * 3) % 60} min` });
  }
}
const weeks = rows.flatMap((row, index) => ("week" in row ? [index] : []));

/** The week's page: the header, then the rows, sticking their headings under the bar. */
function Week() {
  const scroll = createAnimatedValue(0);
  const collapsed = scroll.interpolate({
    inputRange: [0, Math.max(1, heights.range)],
    outputRange: [0, 1],
  });
  return (
    <Scroll testID="page" scrollValue={scroll} style={{ flex: 1 }}>
      <View testID="header" style={look.root(heights)}>
        <View style={look.backdrop(scroll, heights)}>
          <Each of={[1, 2, 3, 4]}>
            {(n) => (
              <View
                style={{
                  position: "absolute",
                  right: -n() * 52,
                  top: -n() * 52 + 24,
                  width: n() * 104,
                  height: n() * 104,
                  borderRadius: n() * 52,
                  borderWidth: 1,
                  borderColor: alpha(look.ink(), 0.1 - n() * 0.015),
                }}
              />
            )}
          </Each>
        </View>
        <View style={look.cover(collapsed)} />
        <View style={look.description(collapsed, heights)}>
          <Text style={look.descriptionText()}>18 entries, by week</Text>
        </View>
        <View style={look.bar(heights)}>
          <Text class={look.titleClass} style={look.title(collapsed)}>
            Recent
          </Text>
        </View>
      </View>
      <List
        viewport="parent"
        each={rows}
        estimatedItemSize={density.row}
        stickyHeaderIndices={weeks}
        stickyHeaderOffset={heights.bar}
      >
        {(row) => (
          <If
            when={"week" in row()}
            else={
              <View
                style={{
                  height: density.row,
                  flexDirection: "row",
                  alignItems: "center",
                  paddingHorizontal: density.pad,
                  borderBottomWidth: 1,
                  borderBottomColor: ui().line,
                }}
              >
                <Text style={{ flex: 1, fontSize: density.body, color: ui().text }}>
                  {(row() as { title: string }).title}
                </Text>
                <Text
                  style={{
                    fontSize: density.note,
                    color: ui().muted,
                    fontVariant: ["tabular-nums"],
                  }}
                >
                  {(row() as { detail: string }).detail}
                </Text>
              </View>
            }
          >
            <View
              style={{
                height: density.row * 0.8,
                justifyContent: "center",
                paddingHorizontal: density.pad,
                backgroundColor: colors.card,
                borderBottomWidth: stroke.hairline,
                borderBottomColor: ui().border,
              }}
            >
              <Text
                style={{
                  fontSize: density.note,
                  fontWeight: "600",
                  letterSpacing: 0.6,
                  textTransform: "uppercase",
                  color: ui().muted,
                }}
              >
                Week {(row() as { week: number }).week}
              </Text>
            </View>
          </If>
        )}
      </List>
    </Scroll>
  );
}

/** The header with the page's action in the bar: it stays in reach as the header collapses. */
function Starred() {
  const scroll = createAnimatedValue(0);
  const starred = signal(false);
  const short = look.heights(desktop ? 132 : 168, BAR);
  const collapsed = scroll.interpolate({
    inputRange: [0, Math.max(1, short.range)],
    outputRange: [0, 1],
  });
  return (
    <View style={{ gap: 10 }}>
      <View style={{ height: 240, ...sectionSurface(), overflow: "hidden" }}>
        <Scroll testID="action-page" scrollValue={scroll} style={{ flex: 1 }}>
          <View testID="action-header" style={look.root(short)}>
            <View style={look.backdrop(scroll, short)}>
              <Each of={[1, 2, 3, 4]}>
                {(n) => (
                  <View
                    style={{
                      position: "absolute",
                      right: -n() * 52,
                      top: -n() * 52 + 24,
                      width: n() * 104,
                      height: n() * 104,
                      borderRadius: n() * 52,
                      borderWidth: 1,
                      borderColor: alpha(look.ink(), 0.1 - n() * 0.015),
                    }}
                  />
                )}
              </Each>
            </View>
            <View style={look.cover(collapsed)} />
            <View style={look.bar(short)}>
              <Text class={look.titleClass} style={look.title(collapsed)}>
                Inbox
              </Text>
              <Button
                size="sm"
                variant={starred() ? "default" : "secondary"}
                onPress={() => starred.set(!starred())}
              >
                {starred() ? "Starred" : "Star"}
              </Button>
            </View>
          </View>
          <View style={{ padding: density.pad, gap: 10 }}>
            <Each of={["Mira", "Noah", "Tess", "Ola", "Rune"]}>
              {(name) => (
                <View
                  style={{
                    height: density.row,
                    justifyContent: "center",
                    borderBottomWidth: 1,
                    borderBottomColor: ui().line,
                  }}
                >
                  <Text style={{ fontSize: density.body, color: ui().text }}>{name}</Text>
                </View>
              )}
            </Each>
          </View>
        </Scroll>
      </View>
      <Text style={{ fontSize: density.note, color: ui().muted }}>
        {starred() ? "Inbox is starred" : "Inbox is not starred"}
      </Text>
    </View>
  );
}

function App() {
  return (
    <DemoPage title="CollapsingHeader">
      <DemoCard>
        <DemoSection title="A page's header" axis="block">
          <View style={{ height: 340, ...sectionSurface(), overflow: "hidden" }}>
            <Week />
          </View>
        </DemoSection>
        <DemoSection title="An action in the bar" axis="block">
          <Starred />
        </DemoSection>
      </DemoCard>
    </DemoPage>
  );
}

mount(App);
