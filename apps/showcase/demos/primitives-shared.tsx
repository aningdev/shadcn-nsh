import { colors, mono, type Tone, toneColor } from "@shadcn-nsh/theme";
// Shared pieces of the primitive demos (Text, Image, Scroll, List, WebView, Video): the gallery's
// small readouts — a figure, a meter, an API line — and the settings row its scroll and list demos
// put under a control. They are demo chrome, not components: the library's own parts do the work.
import { Text, View } from "nsh";

import { Progress } from "@/packages/ui/progress";
import { Segmented, SegmentedItem, SegmentedList } from "@/packages/ui/segmented";
import { Switch } from "@/packages/ui/switch";

/** A figure: the value large, its unit quieter beside it, an optional note under both. */
export function Figure(props: { value: string; unit?: string; note?: string; tone?: Tone }) {
  return (
    <View style={{ gap: 2 }}>
      <View style={{ flexDirection: "row", alignItems: "baseline", gap: 4 }}>
        <Text
          style={{
            fontSize: 32,
            fontWeight: "600",
            color: colors.foreground,
            fontVariant: ["tabular-nums"],
          }}
        >
          {props.value}
        </Text>
        <If when={props.unit !== undefined}>
          <Text style={{ fontSize: 17, color: colors.mutedForeground }}>{props.unit}</Text>
        </If>
      </View>
      <If when={props.note !== undefined}>
        <Text
          style={{
            fontSize: 15,
            color: props.tone ? toneColor(props.tone) : colors.mutedForeground,
          }}
        >
          {props.note}
        </Text>
      </If>
    </View>
  );
}

/** A meter: the bar under a figure, `value` from 0 to 1. */
export function Meter(props: { value: number; tone?: Tone }) {
  return <Progress value={props.value * 100} tone={props.tone ?? "accent"} />;
}

/** The APIs a section shows, as code. */
export function Api(props: { names: string }) {
  return (
    <Text style={{ fontSize: 12, color: colors.faint, fontFamily: mono() }}>{props.names}</Text>
  );
}

/** An option of a `Choice`: the value alone, or the value with a longer label. */
export type ChoiceOption<T extends string> = T | { value: T; label: string };

const valueOf = <T extends string>(option: ChoiceOption<T>): T =>
  typeof option === "string" ? option : option.value;

const labelOf = <T extends string>(option: ChoiceOption<T>): string =>
  typeof option === "string" ? option : option.label;

/** A segmented control of plain options (the gallery's `options` + `Segmented`). */
export function Choice<T extends string>(props: {
  options: readonly ChoiceOption<T>[];
  value: T;
  onChange: (value: T) => void;
  fill?: boolean;
}) {
  return (
    <Segmented value={props.value} onValueChange={(v) => props.onChange(v as T)}>
      <SegmentedList fill={props.fill}>
        <Each of={props.options}>
          {(option) => <SegmentedItem value={valueOf(option())}>{labelOf(option())}</SegmentedItem>}
        </Each>
      </SegmentedList>
    </Segmented>
  );
}

/** A switch row: what it does, the prop behind it, an optional note, and the switch. */
export function SwitchRow(props: {
  label: string;
  code?: string;
  note?: string;
  value: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 12, minHeight: 48 }}>
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={{ fontSize: 15, color: colors.foreground }}>{props.label}</Text>
        <If when={props.code !== undefined}>
          <Text style={{ fontSize: 12, color: colors.faint, fontFamily: mono() }}>
            {props.code}
          </Text>
        </If>
        <If when={props.note !== undefined}>
          <Text style={{ fontSize: 13, color: colors.faint }}>{props.note}</Text>
        </If>
      </View>
      <Switch
        accessibilityLabel={props.label}
        checked={props.value}
        onChange={(event) => props.onChange(event.checked)}
      />
    </View>
  );
}
