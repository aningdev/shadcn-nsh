// Collapsing header: the official gallery's scene
// (`references/nsh/examples/gallery/demos/CollapsingHeader.tsx`). The header sticks with a
// negative top and collapses to a bar as the page scrolls; the picture moves at half speed,
// the title shrinks into the bar, and week headings stick just under the bar. The scroll link
// is `nsh`'s (`scrollValue`, `interpolate`). The header owns the page's scroll, so the root
// fills the shell.
import { alpha, colors, finish } from "@shadcn-nsh/theme";
import { createAnimatedValue, List, platform, Scroll, Text, View } from "nsh";

import { density } from "@/packages/ui/lib/surface";

/** In a terminal everything is whole rows: the picture's rings are left out. */
const terminal = platform.idiom === "terminal";
/** How tall the header is open, and the bar it collapses to. */
const OPEN = terminal ? 64 : platform.desktop ? 168 : 220;
const BAR = terminal ? 32 : platform.desktop ? 44 : 56;
/** The rows' height, the headings' and the gutter. */
const ROW = terminal ? 16 : platform.desktop ? 36 : 52;
const HEADING = terminal ? 16 : platform.desktop ? 28 : 34;
const GUTTER = terminal ? 8 : platform.desktop ? 24 : 16;
/** How far the page scrolls while the header collapses. */
const RANGE = OPEN - BAR;

type Row = { week: number } | { title: string; detail: string };

const rows: Row[] = [];
for (let week = 1; week <= 20; week++) {
  rows.push({ week });
  for (let i = 1; i <= 8; i++) {
    rows.push({ title: `Entry ${week}.${i}`, detail: `${(week * 7 + i * 3) % 60} min` });
  }
}
const weeks = rows.flatMap((row, i) => ("week" in row ? [i] : []));

/** A header that collapses to a bar as the page scrolls, week headings sticking below it. */
export function CollapsingHeaderDemo() {
  const scroll = createAnimatedValue(0);
  // 0 open, 1 collapsed.
  const collapsed = scroll.interpolate({ inputRange: [0, RANGE], outputRange: [0, 1] });
  return (
    <Scroll
      testID="page"
      scrollValue={scroll}
      style={{ flex: 1, backgroundColor: colors.background }}
    >
      <View
        testID="header"
        style={{
          position: "sticky",
          top: -RANGE,
          height: OPEN,
          overflow: "hidden",
          backgroundColor: colors.primary,
          ...finish.light,
          borderBottomWidth: 1,
        }}
      >
        <If when={!terminal}>
          <View
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: OPEN,
              transformOrigin: "center bottom",
              translate: [
                0,
                scroll.interpolate({ inputRange: [0, RANGE], outputRange: [0, RANGE / 2] }),
              ],
              scale: scroll.interpolate({ inputRange: [-OPEN, 0], outputRange: [2, 1] }),
            }}
          >
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
                    borderColor: alpha(colors.primaryForeground, 0.1 - n() * 0.015),
                  }}
                />
              )}
            </Each>
          </View>
        </If>
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: colors.primary,
            opacity: collapsed,
          }}
        />
        <Text
          style={{
            position: "absolute",
            left: GUTTER,
            bottom: BAR - 2,
            color: alpha(colors.primaryForeground, 0.62),
            fontSize: density.note,
            fontWeight: "500",
            opacity: collapsed.interpolate({ inputRange: [0, 0.5], outputRange: [1, 0] }),
          }}
        >
          160 entries, by week
        </Text>
        <View
          style={{
            position: "absolute",
            left: GUTTER,
            right: GUTTER,
            bottom: 0,
            height: BAR,
            justifyContent: "center",
          }}
        >
          <Text
            style={{
              alignSelf: "flex-start",
              color: colors.primaryForeground,
              fontSize: platform.desktop ? 26 : 30,
              fontWeight: "700",
              letterSpacing: -0.4,
              transformOrigin: "left center",
              scale: collapsed.interpolate({
                inputRange: [0, 1],
                outputRange: [1, platform.desktop ? 0.58 : 0.62],
              }),
            }}
          >
            Recent
          </Text>
        </View>
      </View>
      <List
        viewport="parent"
        each={rows}
        estimatedItemSize={ROW}
        stickyHeaderIndices={weeks}
        stickyHeaderOffset={BAR}
      >
        {(row) => (
          <If
            when={"week" in row()}
            else={
              <View
                style={{
                  height: ROW,
                  flexDirection: "row",
                  alignItems: "center",
                  paddingHorizontal: GUTTER,
                  borderBottomWidth: 1,
                  borderBottomColor: colors.line,
                }}
              >
                <Text style={{ flex: 1, fontSize: density.body, color: colors.foreground }}>
                  {(row() as { title: string }).title}
                </Text>
                <Text
                  style={{
                    fontSize: density.note,
                    color: colors.mutedForeground,
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
                height: HEADING,
                justifyContent: "center",
                paddingHorizontal: GUTTER,
                backgroundColor: colors.inset,
                borderBottomWidth: 1,
                borderBottomColor: colors.line,
              }}
            >
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: "600",
                  letterSpacing: 0.6,
                  textTransform: "uppercase",
                  color: colors.mutedForeground,
                }}
              >
                Week {(row() as { week: number }).week}
              </Text>
            </View>
          </If>
        )}
      </List>
      <View
        testID="footer"
        style={{
          alignItems: "center",
          gap: 6,
          paddingTop: 32,
          paddingBottom: 48,
          paddingHorizontal: 16,
        }}
      >
        <Text style={{ fontSize: 15, fontWeight: "600", color: colors.foreground }}>
          That's all 160 entries
        </Text>
        <Text style={{ fontSize: 13, color: colors.mutedForeground, textAlign: "center" }}>
          A footer after the list: the list keeps only the rows near the screen, at its full length
          in the page.
        </Text>
      </View>
    </Scroll>
  );
}
