import { expect, open, test } from "nsh/test";

const find = (texts: string[], prefix: string) =>
  texts.find((t) => t.startsWith(prefix))?.slice(prefix.length);

test("finish colors come from the shadow tokens and follow the appearance", async () => {
  const light = await open("./theme.fixture.tsx", { colorScheme: "light" });
  const dark = await open("./theme.fixture.tsx", { colorScheme: "dark" });
  for (const prefix of ["raised=", "menu="]) {
    const a = find(light.texts(), prefix);
    const b = find(dark.texts(), prefix);
    expect(a).toBeTruthy();
    expect(a).not.toContain("undefined");
    expect(a).not.toBe(b);
  }
});

test("text and muted are stable color tokens", async () => {
  const app = await open("./theme.fixture.tsx");
  expect(find(app.texts(), "text=")).toMatch(/^#[0-9a-f]{6,8}$/i);
  expect(find(app.texts(), "muted=")).toMatch(/^#[0-9a-f]{6,8}$/i);
});
