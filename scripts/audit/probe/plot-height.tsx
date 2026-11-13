// The plot demo's chart with the one change `apps/docs/demos/plot.tsx` lacks: the Plot's height.
// The audit's experiment for the blank chart (see docs/specs/demo-audit.md). Not a demo.
import { colors } from "@shadcn-nsh/theme";
import { mount, View } from "nsh";

import {
  Area,
  Grid,
  Line,
  Plot,
  PlotAxis,
  plotAxisText,
  plotBaseline,
  plotGrid,
  plotWash,
  seriesColor,
} from "@/packages/ui/plot";

const ROWS = Array.from({ length: 10 }, (_, minute) => ({
  minute,
  price: 42 + minute + (minute % 3),
}));

function App() {
  return (
    <View style={{ flex: 1, backgroundColor: colors.background, padding: 20 }}>
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
          style={{ height: 162 }}
        >
          <Grid style={plotGrid()} />
          <Grid style={plotBaseline()} />
          <Area backgroundStyle={plotWash(seriesColor(0))} style={{ fill: "transparent" }} />
          <Line style={{ stroke: seriesColor(0), strokeWidth: 2 }} />
          <PlotAxis
            placement="right"
            tickValues={[40, 48, 55]}
            format={(v) => String(v)}
            labelStyle={plotAxisText()}
          />
        </Plot>
      </View>
    </View>
  );
}

mount(App);
