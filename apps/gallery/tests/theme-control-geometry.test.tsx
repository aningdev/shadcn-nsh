import { expect, open, test } from "nsh/test";

const find = (texts: string[], prefix: string) =>
  texts.find((t) => t.startsWith(prefix))?.slice(prefix.length);

/**
 * Control dimensions (`control()`, read by the per-component looks: `checkbox`, `switch`,
 * `slider`, `radio`, `progress`, `spinner`, `calendar`) update reactively on `selectTheme`. Tabs
 * draw one form, the same under every theme.
 */
test("control dimensions and component looks follow the active theme", async () => {
  const app = await open("./theme-control-geometry.fixture.tsx", {
    platform: "macos",
    colorScheme: "light",
  });

  const assertBase = () => {
    const sw = find(app.texts(), "switch=") ?? "";
    expect(sw.startsWith("36x20|1|16|checked:translate-x-[16px]")).toBe(true);
    expect(find(app.texts(), "slider=")).toContain(
      "h-[6px] rounded-full|h-[20px] justify-center px-[7px]",
    );
    expect(find(app.texts(), "slider=")).toContain("|true|rounded-full");
    expect(find(app.texts(), "slider=")?.endsWith("|true|false|false")).toBe(true);
    expect(find(app.texts(), "checkbox=")).toBe("1|false|false");
    expect(find(app.texts(), "progress=")).toBe("6/solid/true");
    expect(find(app.texts(), "tabs=")).toBe("0/1");
    expect(find(app.texts(), "tabs-indicator=")).toBe("2");
    expect(find(app.texts(), "grabber=")).toBe("36x5");
    expect(find(app.texts(), "calendar=")).toBe("28");
  };

  // Default pointer geometry ("base")
  assertBase();
  expect(find(app.texts(), "edge=")).toBe(
    "1|0 0 0 1px red|0 0 0 1px red, 0 1px 2px black|none|inset 0 0 0 1px red",
  );

  // Material Design 3 ("material")
  await app.press("text:Material");
  expect(app.texts()).toContain("theme:material");
  // The desktop tier is one step below M3's touch numbers (ADR 0003): 40x24, the knob 16 → 20 → 22.
  expect(find(app.texts(), "switch=")).toBe(
    "40x24|1|16|checked:translate-x-[16px] checked:scale-[1.25] active:scale-[1.375]",
  );
  // Material's slider keeps the library's round knob on its tinted track (#367, a downgrade
  // recorded in docs/specs/native-themes.md): the circle's 6-point rail and 20-point band.
  expect(find(app.texts(), "slider=")).toContain(
    "h-[6px] rounded-full|h-[20px] justify-center px-[7px]",
  );
  expect(find(app.texts(), "slider=")).toContain("|false|rounded-full");
  expect(find(app.texts(), "slider=")?.endsWith("|false|true|false")).toBe(true);
  expect(find(app.texts(), "checkbox=")).toBe("2|true|false");
  expect(find(app.texts(), "progress=")).toBe("4/solid/false");
  expect(find(app.texts(), "tabs=")).toBe("0/1");
  expect(find(app.texts(), "tabs-indicator=")).toBe("2");
  expect(find(app.texts(), "grabber=")).toBe("36x5");
  expect(find(app.texts(), "calendar=")).toBe("32");

  // WinUI 3 ("winui")
  await app.press("text:WinUI");
  expect(app.texts()).toContain("theme:winui");
  expect(find(app.texts(), "switch=")).toBe(
    "40x20|1|12|checked:translate-x-[20px] hover:scale-[1.1667] active:scale-x-[1.4167] active:scale-y-[1.1667] active:translate-x-[1.5px] checked:active:translate-x-[18.5px]",
  );
  expect(find(app.texts(), "slider=")).toContain(
    "h-[4px] rounded-full|h-[32px] justify-center px-[9px]",
  );
  expect(find(app.texts(), "slider=")).toContain("|false|w-[16px] h-[16px]");
  expect(find(app.texts(), "slider=")?.endsWith("|false|false|true")).toBe(true);
  expect(find(app.texts(), "checkbox=")).toBe("1|false|true");
  expect(find(app.texts(), "progress=")).toBe("3/gradient/false");
  expect(find(app.texts(), "tabs=")).toBe("0/1");
  expect(find(app.texts(), "tabs-indicator=")).toBe("2");
  expect(find(app.texts(), "grabber=")).toBe("36x5");
  expect(find(app.texts(), "calendar=")).toBe("32");

  // Revert to the build-time theme ("base")
  await app.press("text:NSH Gallery");
  expect(app.texts()).toContain("theme:build-time");
  assertBase();
});
