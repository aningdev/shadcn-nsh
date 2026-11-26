import { colors, currentTheme, selectTheme, type AppTheme } from "@shadcn-nsh/theme";
import { colorScheme, mount, signal, Text, View } from "nsh";

import { shadcn } from "../../../packages/theme/themes/shadcn/index";
import { Button, buttonLook, sliderFill, sliderLook } from "../../../packages/ui";

/** The raised look a button wears: the component's own getter, read where the page renders it. */
const raised = () => buttonLook("secondary").style;

/** How far a pressed raised button sinks, as the page reads it out: the scale in its own
 * `activeStyle`, or `1` for a theme whose controls stand still under the finger. */
const sink = (): number => {
  const transform = buttonLook("secondary").activeStyle?.transform;
  for (const entry of Array.isArray(transform) ? transform : []) {
    const scale = (entry as { scale?: number }).scale;
    if (typeof scale === "number") return scale;
  }
  return 1;
};

/** A slider's run, as the page reads it out: the gradient it lays (its stops, with the aliases
 * already named), or the color under it when a theme states no gradient. */
const run = () => {
  const fill = sliderFill(0, 1);
  if (typeof fill.backgroundImage === "string") return fill.backgroundImage;
  return typeof fill.backgroundColor === "string" ? fill.backgroundColor : "none";
};

/** A slider's rail, as the page reads it out: its edge and its shade, joined where the theme
 * gives each, or `"none"` when the rail is flat. */
const rail = () => {
  const shadow = sliderLook().indicatorStyle.boxShadow;
  if (shadow === undefined) return "none";
  return typeof shadow === "string" ? shadow : "layers";
};

/** A style value as the page reads it out: the string it is, or its JSON. */
const shown = (value: unknown) => (typeof value === "string" ? value : JSON.stringify(value));

/** A theme NSH cannot read (a color that is none), on the neutral theme's surfaces. */
const broken: AppTheme = {
  ...shadcn,
  id: "broken",
  label: "broken",
  theme: {
    name: "broken",
    cssVars: {
      theme: shadcn.theme.cssVars.theme,
      light: { primary: "#zz" },
      dark: { primary: "#zz" },
    },
  },
};

function App() {
  const failure = signal("none");
  const switched = (theme: AppTheme | null) => {
    try {
      selectTheme(theme);
      failure.set("none");
    } catch (error) {
      failure.set(error instanceof TypeError ? "TypeError" : String(error));
    }
  };
  return (
    <View>
      <Text testID="fill">{`fill:${shown(raised().backgroundColor ?? "none")}`}</Text>
      <Text testID="shadow">{`shadow:${shown(raised().boxShadow ?? "none")}`}</Text>
      <Text testID="radius">{`radius:${shown(raised().borderRadius ?? "none")}`}</Text>
      <Text testID="sink">{`sink:${sink()}`}</Text>
      <Text testID="run">{`run:${run()}`}</Text>
      <Text testID="rail">{`rail:${rail()}`}</Text>
      <Text testID="theme">{`theme:${currentTheme() ?? "build-time"}`}</Text>
      <Text testID="failure">{`failure:${failure()}`}</Text>
      <Text testID="appearance">{`appearance:${colorScheme()}`}</Text>
      <Text testID="ink" style={{ color: colors.foreground }}>
        Ink
      </Text>
      <Button onPress={() => switched(shadcn)}>Shadcn</Button>
      <Button onPress={() => switched(null)}>Build-time</Button>
      <Button onPress={() => switched(broken)}>Broken</Button>
    </View>
  );
}

mount(App);
