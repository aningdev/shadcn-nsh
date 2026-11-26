// Collapsing header: the official gallery's scene
// (`references/nsh/examples/gallery/demos/CollapsingHeader.tsx`), drawn with the library's
// `CollapsingHeader`: the header collapses to a bar as the page scrolls, the picture moves at half
// speed, the title shrinks into the bar, and week headings stick just under the bar. The header
// owns the page's scroll, so the root fills the shell.
import { alpha, colors } from "@shadcn-nsh/theme";
import { createAnimatedValue, List, platform, Scroll, Text, View } from "nsh";

import {
  CollapsingHeader,
  collapsingHeaderLook,
  CollapsingHeaderBackdrop,
  CollapsingHeaderBar,
  CollapsingHeaderDescription,
  CollapsingHeaderTitle,
} from "@/packages/ui/collapsing-header";
import { density } from "@/packages/ui/lib/surface";

/** In a terminal everything is whole rows: the heights, the rows and the headings. */
const terminal = platform.idiom === "terminal";
/** How tall the header is open, and the bar it collapses to. */
const OPEN = terminal ? 64 : platform.desktop ? 168 : 220;
const BAR = terminal ? 32 : platform.desktop ? 44 : 56;
/** The bar as the header draws it (whole rows in a terminal): where the week headings stick. */
const bar = collapsingHeaderLook().heights(OPEN, BAR).bar;
/** The rows' height, the headings' and the gutter. */
const ROW = terminal ? 16 : platform.desktop ? 36 : 52;
const HEADING = terminal ? 16 : platform.desktop ? 28 : 34;
const GUTTER = terminal ? 8 : platform.desktop ? 24 : 16;

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
  return (
    <Scroll
      testID="page"
      scrollValue={scroll}
      style={{ flex: 1, backgroundColor: colors.background }}
    >
      <CollapsingHeader testID="header" scroll={scroll} expandedHeight={OPEN} collapsedHeight={BAR}>
        <CollapsingHeaderBackdrop>
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
        </CollapsingHeaderBackdrop>
        <CollapsingHeaderDescription>160 entries, by week</CollapsingHeaderDescription>
        <CollapsingHeaderBar>
          <CollapsingHeaderTitle>Recent</CollapsingHeaderTitle>
        </CollapsingHeaderBar>
      </CollapsingHeader>
      <List
        viewport="parent"
        each={rows}
        estimatedItemSize={ROW}
        stickyHeaderIndices={weeks}
        stickyHeaderOffset={bar}
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
                backgroundColor: colors.muted,
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
