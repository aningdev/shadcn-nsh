import { expect, open, test } from "nsh/test";

const find = (texts: string[], prefix: string) =>
  texts.find((t) => t.startsWith(prefix))?.slice(prefix.length);

/**
 * Switch, slider, checkbox and radio-group read per-theme control geometry and `sliderTrack`
 * color role from `@shadcn-nsh/theme`, updating reactively on `selectTheme`.
 */
test("control geometry getters and sliderTrack follow the active theme", async () => {
  const app = await open("./theme-control-geometry.fixture.tsx", {
    platform: "macos",
    colorScheme: "light",
  });

  // Default pointer geometry
  expect(find(app.texts(), "switch=")).toBe("28x16|1/1|12/12|none");
  expect(find(app.texts(), "slider=")).toBe("6/20|14x14|circle|true|true|false|false");
  expect(find(app.texts(), "checkbox=")).toBe("1|0|well|false");
  expect(find(app.texts(), "radio=")).toBe("16|6|1|0|well|fill|false|none");
  expect(find(app.texts(), "progress=")).toBe("6/6|track|bar|true|6/solid");
  expect(find(app.texts(), "spinner=")).toBe("1.5/8|true|0.25");
  expect(find(app.texts(), "tabs=")).toBe("8|tab|pill|0/1");
  expect(find(app.texts(), "calendar=")).toBe("32/1|control|quiet|fill|32");
  expect(find(app.texts(), "edge=")).toBe(
    "1|0 0 0 1px red|0 0 0 1px red, 0 1px 2px black|none|inset 0 0 0 1px red",
  );

  // Material Design 3
  await app.press("text:Material");
  expect(app.texts()).toContain("theme:material");
  expect(find(app.texts(), "switch=")).toBe("52x32|2/0|16/24|expand");
  expect(find(app.texts(), "slider=")).toBe("16/44|4x44|bar|false|false|true|false");
  expect(find(app.texts(), "checkbox=")).toBe("2|40|outline|true");
  expect(find(app.texts(), "radio=")).toBe("20|10|2|40|outline|ring|true|none");
  expect(find(app.texts(), "progress=")).toBe("4/4|slider-track|bar|false|4/solid");
  expect(find(app.texts(), "spinner=")).toBe("1.5/10|false|0.25");
  expect(find(app.texts(), "tabs=")).toBe("8|label|top|8/3");
  expect(find(app.texts(), "calendar=")).toBe("40/1|pill|outline|fill|40");

  // WinUI 3
  await app.press("text:WinUI");
  expect(app.texts()).toContain("theme:winui");
  expect(find(app.texts(), "switch=")).toBe("40x20|1/0|12/12|stretch");
  expect(find(app.texts(), "slider=")).toBe("4/32|18x18|ring|false|false|false|true");
  expect(find(app.texts(), "checkbox=")).toBe("1|0|inset|false");
  expect(find(app.texts(), "radio=")).toBe("20|12|1|0|inset|fill|false|scale");
  expect(find(app.texts(), "progress=")).toBe("3/1|slider-track|hairline|false|3/gradient");
  expect(find(app.texts(), "spinner=")).toBe("1.5/8|false|0.25");
  expect(find(app.texts(), "tabs=")).toBe("8|tab|pill|0/1.5");
  expect(find(app.texts(), "calendar=")).toBe("40/2|pill|fill|outline|40");

  // Revert to build-time default
  await app.press("text:Default");
  expect(app.texts()).toContain("theme:build-time");
  expect(find(app.texts(), "switch=")).toBe("28x16|1/1|12/12|none");
  expect(find(app.texts(), "slider=")).toBe("6/20|14x14|circle|true|true|false|false");
  expect(find(app.texts(), "checkbox=")).toBe("1|0|well|false");
  expect(find(app.texts(), "radio=")).toBe("16|6|1|0|well|fill|false|none");
  expect(find(app.texts(), "progress=")).toBe("6/6|track|bar|true|6/solid");
  expect(find(app.texts(), "spinner=")).toBe("1.5/8|true|0.25");
  expect(find(app.texts(), "tabs=")).toBe("8|tab|pill|0/1");
  expect(find(app.texts(), "calendar=")).toBe("32/1|control|quiet|fill|32");
});
