// A thin horizontal meter with an optional marker. Ported from NSH's examples/nsh-gallery-ui (Apache-2.0, © Longbridge; see NOTICE).
// Its region is filled by `bun run port:vendor`: change it upstream, or in `port-map.json`.
import { colors, terminal, TERMINAL_ROW, toneColor, type Tone } from "@shadcn-nsh/theme";
import { View } from "nsh";

import { progressFill, progressGlide, progressRail, progressRemaining } from "./progress";

// @port index.tsx
/** A horizontal meter with an optional marker (a limit), `value` from 0
 * to 1: a progress bar's rail and fill (`look/meter.ts`), the fill gliding
 * to each new value; half a row in the terminal, so its fill is a solid bar
 * rather than a rule. */
export function Meter(props: { value: number; tone?: Tone; marker?: number }) {
  return (
    // The marker stands past the rail, which clips its fill: they sit side
    // by side in a view of the rail's height.
    <View style={{ height: terminal ? TERMINAL_ROW / 2 : 6 }}>
      {terminal ? (
        <View style={{ height: TERMINAL_ROW / 2, backgroundColor: colors.track }}>
          <View
            style={{
              width: `${Math.max(0, Math.min(1, props.value)) * 100}%`,
              height: TERMINAL_ROW / 2,
              backgroundColor:
                props.tone && props.tone !== "accent" ? toneColor(props.tone) : colors.accentFill,
            }}
          />
        </View>
      ) : (
        <View style={progressRail(6)}>
          <View
            class={progressGlide}
            style={{
              ...progressFill(6, props.tone),
              translate: progressRemaining(props.value * 100),
            }}
          />
        </View>
      )}
      <If when={props.marker !== undefined}>
        <View
          style={{
            position: "absolute",
            left: `${(props.marker ?? 0) * 100}%`,
            top: -4,
            width: 2,
            height: 12,
            borderRadius: 1,
            backgroundColor: colors.text,
          }}
        />
      </If>
    </View>
  );
}
// @port end
