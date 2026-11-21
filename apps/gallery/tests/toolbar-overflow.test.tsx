import { expect, open, test } from "nsh/test";

test("ToolbarOverflow folds units by measured width at two widths, labels folded groups, and keeps tools live", async () => {
  const app = await open("./toolbar-overflow.fixture.tsx", { platform: "macos" });
  await app.wait(100);
  // At 520 pt everything fits and the overflow trigger stays hidden.
  expect(app.count("label:More tools")).toBe(0);
  expect(app.count("label:Align left")).toBe(1);
  expect(app.count("label:Underline")).toBe(1);
  expect(app.count("label:Redo")).toBe(1);

  // At 260 pt Alignment (priority 2, fold="unit") leaves whole; Underline (priority 1) folds too.
  await app.press("text:Width 260");
  await app.wait(100);
  expect(app.count("label:More tools")).toBe(1);
  expect(app.count("label:Align left")).toBe(0);
  expect(app.count("label:Align center")).toBe(0);
  expect(app.count("label:Align right")).toBe(0);
  expect(app.count("label:Bold")).toBe(1);
  expect(app.count("label:Undo")).toBe(1);

  // At 180 pt Redo (priority 3) folds too; Undo and Bold stay visible.
  await app.press("text:Width 180");
  await app.wait(100);
  expect(app.count("label:Redo")).toBe(0);
  expect(app.count("label:Underline")).toBe(0);
  expect(app.count("label:Undo")).toBe(1);
  expect(app.count("label:Bold")).toBe(1);

  // Open "⋯": folded groups appear in bar order with their labels, and activating a folded item works.
  await app.press("label:More tools");
  await app.waitFor("text:Underline");
  expect(app.shows("History")).toBe(true);
  expect(app.shows("Marks")).toBe(true);
  expect(app.shows("Alignment")).toBe(true);
  await app.press("text:Underline");
  await app.waitFor("underline on");

  // Re-open "⋯" and choose a folded alignment radio item.
  await app.press("label:More tools");
  await app.waitFor("text:Align center");
  await app.press("text:Align center");
  await app.waitFor("align center");
});

test("ToolbarOverflow keeps one Tab stop and reaches folded tools from the keyboard", async () => {
  const app = await open("./toolbar-overflow.fixture.tsx", { platform: "macos" });
  await app.press("text:Width 260");
  await app.wait(100);
  // 4 width buttons -> 5th Tab lands on the overflowing toolbar (Undo).
  for (let i = 0; i < 5; i++) {
    await app.keyboard.press("tab");
  }
  await app.keyboard.press("space");
  await app.waitFor("undo 1");
  // ArrowRight past Redo and Bold reaches "⋯", and Space opens the overflow menu.
  await app.keyboard.press("right");
  await app.keyboard.press("right");
  await app.keyboard.press("right");
  await app.keyboard.press("space");
  await app.waitFor("text:Alignment");
  await app.keyboard.press("escape");
  await app.waitFor("text:Alignment", { state: "gone" });
  // Next Tab leaves the bar to "After overflow" in one step.
  await app.keyboard.press("tab");
  await app.keyboard.press("space");
  await app.wait(50);
  expect(app.shows("undo 2")).toBe(false);
});

test("ToolbarOverflow does not block folding when an item never lays out (risk 5)", async () => {
  const app = await open("./toolbar-overflow.fixture.tsx", { platform: "macos" });
  await app.wait(100);
  // Fold tool (priority 0) folds into "Guard more" even though Ghost tool never laid out.
  expect(app.count("label:Guard more")).toBe(1);
  expect(app.count("label:Keep tool")).toBe(1);
  expect(app.count("label:Fold tool")).toBe(0);
  await app.press("label:Guard more");
  await app.waitFor("text:Fold me first");
  expect(app.shows("Never laid out")).toBe(false);
});

test("ToolbarOverflow keeps a single Tab stop on ⋯ after the sole tool folds (risk 1 caveat)", async () => {
  const app = await open("./toolbar-overflow.fixture.tsx", { platform: "macos" });
  await app.wait(100);
  await app.press("text:Shrink solo");
  await app.wait(100);
  expect(app.count("label:Solo tool")).toBe(0);
  expect(app.count("label:Solo more")).toBe(1);
  // Note: nsh/base's Button/Toggle do not expose onFocus/onBlur and roving.rs:250-258 clears
  // focus on unmount instead of moving it to "⋯", so Tabbing to the bar lands on "⋯" directly.
  // Stops: 4 width buttons + Overflowing bar (5) + After overflow (6) + Guard bar (7) + Solo bar (8).
  for (let i = 0; i < 8; i++) {
    await app.keyboard.press("tab");
  }
  await app.keyboard.press("space");
  await app.waitFor("text:Solo item");
});
