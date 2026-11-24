// The Actions and Styling batch's shared bits (its files alone): a card whose head takes a
// trailing control, the one-line event log the official scenes end on, a tooltip with a
// shortcut, and the glyph table the tool demos draw from Lucide's grid. Colors come from the
// theme only, never a literal.
import { colors } from "@shadcn-nsh/theme";
import type { JSX } from "nsh";
import { Text, View } from "nsh";

import {
  Card as UiCard,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/packages/ui/card";
import { TooltipContent } from "@/packages/ui/tooltip";
import { tooltipNote, tooltipText } from "@/packages/ui/tooltip";

/**
 * A card of the gallery's shape: a title and a quieter subtitle, a slot on the trailing edge of
 * the head (a switch, a badge, a button), then the scene. `kit`'s `DemoCard` has no trailing
 * slot, and these scenes all put something there.
 */
export function Card(props: {
  title: string;
  subtitle?: string;
  /** The head's trailing edge. */
  right?: JSX.Element;
  children: JSX.Element;
}) {
  return (
    <UiCard>
      <CardHeader>
        <CardTitle>{props.title}</CardTitle>
        <If when={props.subtitle}>
          <CardDescription>{props.subtitle}</CardDescription>
        </If>
        <If when={props.right}>
          <CardAction>{props.right}</CardAction>
        </If>
      </CardHeader>
      <CardContent>{props.children}</CardContent>
    </UiCard>
  );
}

/** What a scene last reported, in one line: the hint until something happens. */
export function LastEvent(props: { value: string | null; hint: string }) {
  return (
    <If
      when={props.value}
      else={<Text style={{ fontSize: 12, color: colors.faint }}>{props.hint}</Text>}
    >
      <Text style={{ fontSize: 12, fontFamily: "monospace", color: colors.foreground }}>
        {props.value}
      </Text>
    </If>
  );
}

/** A tooltip's bubble: the tool's name and, in the quieter color, its shortcut. */
export function Tip(props: { label: string; shortcut?: string }) {
  return (
    <TooltipContent>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
        <Text class={tooltipText}>{props.label}</Text>
        <If when={props.shortcut}>
          <Text style={tooltipNote()}>{props.shortcut}</Text>
        </If>
      </View>
    </TooltipContent>
  );
}

/** The log the scenes end on: the newest line first, the rest quieter, five at most. */
export function note(lines: string[], line: string): string[] {
  return [line, ...lines].slice(0, 5);
}
