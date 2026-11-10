import { expect, open, test } from "nsh/test";

const find = (texts: string[], prefix: string) =>
  texts.find((t) => t.startsWith(prefix))?.slice(prefix.length);

test("disabled dims by one opacity", async () => {
  const app = await open("./theme.fixture.tsx");
  expect(find(app.texts(), "disabled=")).toBe("0.5|0.5|1");
});

test("finish colors come from the shadow tokens and follow the appearance", async () => {
  const light = await open("./theme.fixture.tsx", { colorScheme: "light" });
  const dark = await open("./theme.fixture.tsx", { colorScheme: "dark" });
  for (const prefix of ["rest=", "popup="]) {
    const a = find(light.texts(), prefix);
    const b = find(dark.texts(), prefix);
    expect(a).toBeTruthy();
    expect(a).not.toContain("undefined");
    expect(a).not.toBe(b);
  }
});

test("the backdrop is a color token", async () => {
  const app = await open("./theme.fixture.tsx");
  expect(find(app.texts(), "backdrop=")).toMatch(/^#[0-9a-f]{8}$/);
});
