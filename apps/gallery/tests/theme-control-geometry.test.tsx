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
  expect(find(app.texts(), "slider=")).toBe("6/20|14x14|0|circle|true|true|false|false");
  expect(find(app.texts(), "checkbox=")).toBe("1|0|well|false");
  expect(find(app.texts(), "radio=")).toBe("16|6|1|0|well|fill|false|none");

  // Material Design 3
  await app.press("text:Material");
  expect(app.texts()).toContain("theme:material");
  expect(find(app.texts(), "switch=")).toBe("52x32|2/0|16/24|expand");
  expect(find(app.texts(), "slider=")).toBe("16/44|4x44|6|bar|false|false|true|false");
  expect(find(app.texts(), "checkbox=")).toBe("2|40|outline|true");
  expect(find(app.texts(), "radio=")).toBe("20|10|2|40|outline|ring|true|none");

  // WinUI 3
  await app.press("text:WinUI");
  expect(app.texts()).toContain("theme:winui");
  expect(find(app.texts(), "switch=")).toBe("40x20|1/0|12/12|stretch");
  expect(find(app.texts(), "slider=")).toBe("4/32|18x18|0|ring|false|false|false|true");
  expect(find(app.texts(), "checkbox=")).toBe("1|0|inset|false");
  expect(find(app.texts(), "radio=")).toBe("20|12|1|0|inset|fill|false|scale");

  // Revert to build-time default
  await app.press("text:Default");
  expect(app.texts()).toContain("theme:build-time");
  expect(find(app.texts(), "switch=")).toBe("28x16|1/1|12/12|none");
  expect(find(app.texts(), "slider=")).toBe("6/20|14x14|0|circle|true|true|false|false");
  expect(find(app.texts(), "checkbox=")).toBe("1|0|well|false");
  expect(find(app.texts(), "radio=")).toBe("16|6|1|0|well|fill|false|none");
});
