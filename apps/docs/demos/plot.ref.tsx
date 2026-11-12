import { colors } from "@shadcn-nsh/theme";
import { mount, signal, Text, View } from "nsh";
import { Area, Grid, Line, Plot, PlotAxis } from "nsh/base/plot";

import {
  Legend,
  plotAxisText,
  plotBaseline,
  plotCrossLine,
  plotDotClass,
  plotGrid,
  plotHoverDot,
  plotWash,
  seriesColor,
} from "@/packages/ui/plot";

import { DemoCard, DemoPage, DemoSection } from "./kit";

const ROWS = Array.from({ length: 10 }, (_, minute) => ({
  minute,
  price: 42 + minute + (minute % 3),
}));

function App() {
  const row = signal(ROWS.length - 1);

  return (
    <DemoPage title="Plot">
      <DemoCard>
        <DemoSection title="Legend">
          <View style={{ flexDirection: "row", gap: 16 }}>
            <Legend color={seriesColor(0)} label="Revenue" value="42%" />
            <Legend color={seriesColor(1)} label="Costs" />
          </View>
        </DemoSection>
        <DemoSection title="Line">
          <View style={{ width: 320, gap: 8 }}>
            <View
              style={{
                height: 180,
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: 8,
                padding: 8,
              }}
            >
              <Plot
                data={ROWS}
                y="price"
                yScale={{ type: "linear", domain: [40, 55] }}
                {...plotCrossLine()}
                dotClass={plotDotClass}
                onHoverChange={({ index }) => row.set(index ?? ROWS.length - 1)}
              >
                <Grid style={plotGrid()} />
                <Grid style={plotBaseline()} />
                <Area backgroundStyle={plotWash(seriesColor(0))} style={{ fill: "transparent" }} />
                <Line
                  style={{ stroke: seriesColor(0), strokeWidth: 2 }}
                  hoverDotStyle={plotHoverDot(seriesColor(0))}
                />
                <PlotAxis
                  placement="right"
                  tickValues={[40, 48, 55]}
                  format={(v) => String(v)}
                  labelStyle={plotAxisText()}
                />
              </Plot>
            </View>
            <Text
              style={{ fontSize: 12, color: colors.muted }}
            >{`Price: ${ROWS[row()].price}`}</Text>
          </View>
        </DemoSection>
      </DemoCard>
    </DemoPage>
  );
}

mount(App);
