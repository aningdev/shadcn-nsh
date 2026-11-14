// A labeled figure for grids. From NSH's examples/nsh-gallery-ui (Apache-2.0, © Longbridge; see NOTICE): yours to change.
import { colors, terminal, toneColor, type Tone } from "@shadcn-nsh/theme";
import { Text, View } from "nsh";

// @port index.tsx
/** A label above a value, for grids of figures; on one row in the terminal,
 * the value right-aligned. `truncate` keeps a value that may run long (a
 * display's name) on its one line, ending in an ellipsis. */
export function Stat(props: {
  label: string;
  value: string;
  tone?: Tone;
  width?: `${number}%`;
  truncate?: boolean;
}) {
  // The label above its value in the terminal too: two rows, so stats set
  // side by side keep apart and each value stays under its label.
  return (
    <View
      style={terminal ? { width: props.width } : { width: props.width, gap: 3, paddingVertical: 4 }}
    >
      <Text style={{ fontSize: 12, color: colors.muted }}>{props.label}</Text>
      <Text
        style={{
          fontSize: 15,
          color: props.tone ? toneColor(props.tone) : colors.text,
          fontVariant: ["tabular-nums"],
          numberOfLines: props.truncate ? 1 : undefined,
          paddingRight: props.truncate && !terminal ? 8 : undefined,
        }}
      >
        {props.value}
      </Text>
    </View>
  );
}
// @port end
