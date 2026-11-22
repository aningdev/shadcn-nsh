import { expect, open, test } from "nsh/test";

const find = (texts: string[], prefix: string) =>
  texts.find((t) => t.startsWith(prefix))?.slice(prefix.length);

/**
 * Control preset selection (`controls()`) and per-component preset tables (`checkbox`,
 * `switch`, `slider`, `radio`, `progress`, `spinner`, `tabs`, `calendar`) update reactively on `selectTheme`.
 */
test("controls() and component presets follow the active theme", async () => {
  const app = await open("./theme-control-geometry.fixture.tsx", {
    platform: "macos",
    colorScheme: "light",
  });

  const assertBase = () => {
    expect(find(app.texts(), "controls=")).toBe("base");
    const sw = find(app.texts(), "switch=") ?? "";
    expect(sw.startsWith("28x16|1|12|")).toBe(true);
    expect(find(app.texts(), "slider=")).toContain(
      "h-[6px] rounded-full|h-[20px] justify-center px-[7px]",
    );
    expect(find(app.texts(), "slider=")).toContain("|true|rounded-full");
    expect(find(app.texts(), "slider=")?.endsWith("|true|false|false")).toBe(true);
    expect(find(app.texts(), "checkbox=")).toBe("1|false|false");
    expect(find(app.texts(), "progress=")).toBe("6/solid/true");
    expect(find(app.texts(), "tabs=")).toBe("0/1");
    expect(find(app.texts(), "calendar=")).toBe("32");
  };

  // Default pointer geometry ("base")
  assertBase();
  expect(find(app.texts(), "edge=")).toBe(
    "1|0 0 0 1px red|0 0 0 1px red, 0 1px 2px black|none|inset 0 0 0 1px red",
  );

  // Material Design 3 ("material")
  await app.press("text:Material");
  expect(app.texts()).toContain("theme:material");
  expect(find(app.texts(), "controls=")).toBe("material");
  expect(find(app.texts(), "switch=")).toContain("52x32|2|undefined|w-[16px] h-[16px]");
  expect(find(app.texts(), "switch=")).toContain("active:w-[28px] active:h-[28px]");
  expect(find(app.texts(), "slider=")).toContain(
    "h-[16px] rounded-full|h-[44px] justify-center px-[2px]",
  );
  expect(find(app.texts(), "slider=")).toContain("|false|w-[4px] h-[44px] active:w-[2px]");
  expect(find(app.texts(), "slider=")?.endsWith("|false|true|false")).toBe(true);
  expect(find(app.texts(), "checkbox=")).toBe("2|true|false");
  expect(find(app.texts(), "progress=")).toBe("4/solid/false");
  expect(find(app.texts(), "tabs=")).toBe("8/3");
  expect(find(app.texts(), "calendar=")).toBe("40");

  // WinUI 3 ("winui")
  await app.press("text:WinUI");
  expect(app.texts()).toContain("theme:winui");
  expect(find(app.texts(), "controls=")).toBe("winui");
  expect(find(app.texts(), "switch=")).toContain("40x20|1|undefined|w-[12px] h-[12px]");
  expect(find(app.texts(), "switch=")).toContain("active:w-[17px] active:h-[14px]");
  expect(find(app.texts(), "slider=")).toContain(
    "h-[4px] rounded-full|h-[32px] justify-center px-[9px]",
  );
  expect(find(app.texts(), "slider=")).toContain("|false|w-[16px] h-[16px]");
  expect(find(app.texts(), "slider=")?.endsWith("|false|false|true")).toBe(true);
  expect(find(app.texts(), "checkbox=")).toBe("1|false|true");
  expect(find(app.texts(), "progress=")).toBe("3/gradient/false");
  expect(find(app.texts(), "tabs=")).toBe("0/1.5");
  expect(find(app.texts(), "calendar=")).toBe("40");

  // Revert to build-time default ("base")
  await app.press("text:Default");
  expect(app.texts()).toContain("theme:build-time");
  assertBase();
});
