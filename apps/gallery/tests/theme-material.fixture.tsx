import { defineTheme, motion, selectTheme, surface } from "@shadcn-nsh/theme";
import { mount, signal, Text, View } from "nsh";

import apple from "../../../packages/theme/themes/apple/index";
import material from "../../../packages/theme/themes/material/index";
import nshGallery from "../../../packages/theme/themes/nsh-gallery/index";
import solidGlass from "../../../packages/theme/themes/solid-glass/index";
import winui from "../../../packages/theme/themes/winui/index";
import { Button, ThemedSurface, ThemeTransition } from "../../../packages/ui";

/** A temporary theme whose surfaces ask for the platform's own materials, and for an elevation. */
const glassy = defineTheme({
  extends: nshGallery.spec,
  id: "glassy",
  label: "Glassy",
  surfaces: {
    glass: { light: { material: "glass" }, dark: { material: "acrylic" } },
    overlay: { light: { material: "glass", elevation: 6 }, dark: { material: null } },
    raised: { light: { material: "acrylic" }, dark: { material: null } },
  },
});

const keys = (style: object) =>
  Object.keys(style)
    .filter((key) => key.startsWith("glass"))
    .join(",");

const shown = signal("base");

const effectLine = () => {
  const effect = surface("glass").effect;
  if (!effect) return "none";
  return [
    `i=${effect.uniforms.intensity}`,
    `off=${effect.maxSampleOffset}`,
    `shade=${effect.source.includes("fn shade(uv: vec2f) -> vec4f")}`,
    `bd=${effect.source.includes("sample_backdrop")}`,
    `ct=${effect.source.includes("sample_content")}`,
  ].join(";");
};

const switchLine = () => {
  const sw = motion.themeSwitch;
  const shader =
    sw.shader &&
    sw.shader.includes("fn shade(uv: vec2f) -> vec4f") &&
    sw.shader.includes("nsh.progress") &&
    sw.shader.includes("sample_from") &&
    sw.shader.includes("sample_to")
      ? "shader"
      : "none";
  return `${sw.kind}:${shader}`;
};

const useTheme = (id: string, theme: Parameters<typeof selectTheme>[0]) => {
  shown.set(id);
  selectTheme(theme);
};

function App() {
  return (
    <View>
      <Text>{`glass=${keys(surface("glass").style)}`}</Text>
      <Text>{`glassEffect=${surface("glass").style.glassEffect ?? "none"}`}</Text>
      <Text>{`tint=${surface("glass").style.glassTintColor ?? "none"}`}</Text>
      <Text>{`menu=${keys(surface("overlay").style)}`}</Text>
      <Text>{`menuEffect=${surface("overlay").style.glassEffect ?? "none"}`}</Text>
      <Text>{`glassProps=${JSON.stringify(surface("glass").platformProps)}`}</Text>
      <Text>{`menuProps=${JSON.stringify(surface("overlay").platformProps)}`}</Text>
      <Text>{`raisedProps=${JSON.stringify(surface("raised").platformProps)}`}</Text>
      <Text>{`card=${keys(surface("card").style)}|${JSON.stringify(surface("card").platformProps)}`}</Text>
      {/* The view a component draws: the props on the view, the glass keys in its style. */}
      <View {...surface("overlay").platformProps} style={{ ...surface("overlay").style }}>
        <Text>panel</Text>
      </View>
      <Text>{`fx=${effectLine()}`}</Text>
      <Text>{`sw=${switchLine()}`}</Text>
      <Text>live</Text>
      <ThemedSurface role="glass">
        <Text>inside-glass</Text>
      </ThemedSurface>
      <ThemeTransition value={shown()} />
      <Button onPress={() => selectTheme(glassy)}>Glassy</Button>
      <Button onPress={() => useTheme("apple", apple)}>Apple</Button>
      <Button onPress={() => useTheme("winui", winui)}>WinUI</Button>
      <Button onPress={() => useTheme("solid-glass", solidGlass)}>Solid Glass</Button>
      <Button onPress={() => useTheme("material", material)}>Material</Button>
      <Button onPress={() => useTheme("base", null)}>Build-time</Button>
    </View>
  );
}

mount(App);
