// A stat: a small muted label over a value, for grids of figures.
// Derived from NSH examples/nsh-gallery-ui (Apache-2.0, © Longbridge); modified. See NOTICE.

import { colors, terminal, toneColor, type Tone } from "@shadcn-nsh/theme";
import { context, split, Text, View } from "nsh";
import type { ViewProps } from "nsh";

import { type Live, read } from "./lib/utils";

/** Whether a `Stat` is inside a `StatGroup` (it then shares the row). */
const StatGroupContext = context(false);

/** The figure's type: a small muted label over a value a step larger, so the value leads. */
const type = { label: 12, value: 15 };

/** A figure: its label, its value and the quieter lines around them. */
export type StatProps = {
  label: string;
  value: string;
  /** A unit drawn smaller, beside the value (`ms`, `%`). */
  unit?: string;
  /** A quieter line under the value. */
  note?: string;
  /** The value's tone: the text's color by default; a function is read where the figure is drawn. */
  tone?: Live<Tone>;
  width?: `${number}%`;
  truncate?: boolean;
};

/** A label above a value, for grids of figures; on one row in the terminal,
 * the value right-aligned. `truncate` keeps a value that may run long (a
 * display's name) on its one line, ending in an ellipsis. */
export function Stat(props: StatProps) {
  const grouped = StatGroupContext();
  // The color is read where the value is drawn, so a function follows a value the app changes.
  const valueColor = () => {
    const tone = read(props.tone);
    return tone ? toneColor(tone) : colors.foreground;
  };
  // The label above its value in the terminal too: two rows, so stats set
  // side by side keep apart and each value stays under its label. Inside a
  // `StatGroup`, a stat with no `width` shares the row.
  return (
    <View
      style={
        terminal
          ? { width: props.width }
          : {
              width: props.width,
              gap: 3,
              paddingVertical: 4,
              ...(grouped && props.width == null
                ? { flexGrow: 1, flexBasis: 108, minWidth: 0 }
                : {}),
            }
      }
    >
      <Text style={{ fontSize: type.label, color: colors.mutedForeground }}>{props.label}</Text>
      <View style={{ flexDirection: "row", alignItems: "baseline", gap: 4 }}>
        <Text
          style={{
            fontSize: type.value,
            color: valueColor(),
            fontVariant: ["tabular-nums"],
            numberOfLines: props.truncate ? 1 : undefined,
            paddingEnd: props.truncate && !terminal ? 8 : undefined,
          }}
        >
          {props.value}
        </Text>
        <If when={props.unit}>
          <Text style={{ fontSize: type.label, color: colors.mutedForeground }}>{props.unit}</Text>
        </If>
      </View>
      <If when={props.note}>
        <Text style={{ fontSize: type.label, color: colors.mutedForeground }}>{props.note}</Text>
      </If>
    </View>
  );
}

/** A row of stats: a view's props. The hairline above a chart's figures is the app's class. */
export type StatGroupProps = ViewProps;

/** Several stats on one wrapping row, 12 points apart. A `Stat` inside it shares the row. */
export function StatGroup(props: StatGroupProps) {
  const [, rest] = split(props, ["style", "children"]);
  return (
    <StatGroupContext.Provider value={true}>
      <View
        {...rest}
        style={[{ flexDirection: "row", flexWrap: "wrap", gap: 12 }, props.style ?? null]}
      >
        {props.children}
      </View>
    </StatGroupContext.Provider>
  );
}
