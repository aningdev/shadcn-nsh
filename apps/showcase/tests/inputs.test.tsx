// Every Inputs demo draws and answers: each is opened from the sidebar, its first card's title is
// waited for, and its main interaction is exercised once — so a demo that throws, one left in
// `notBuilt`, or a control that stopped reporting fails here rather than in a screenshot. The
// last two tests open the same demos as a phone does, and in the other appearance and palette.
import { expect, open, test } from "nsh/test";

/** A desktop window: the sidebar column and the chosen demo beside it. */
const wide = { platform: "macos", width: 1024, height: 700 } as const;
/** A phone: the index, demos pushed onto its stack. */
// A 320-point phone: the narrowest the demos' pages claim to fit.
const phone = { platform: "ios", width: 320, height: 640 } as const;

type App = Awaited<ReturnType<typeof open>>;

/** The day a demo's deadline starts on: two days from today, as its trigger writes it (`Nov 22`). */
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const today = new Date();
const due = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2);
const dueTitle = `${MONTHS[due.getMonth()]} ${due.getDate()}`;

/** Every demo of the group with a text only it draws: the sidebar name and the page's first mark. */
const TOURS: [name: string, marker: string][] = [
  ["Input", "Account"],
  ["NumberInput", "Number input"],
  ["OtpInput", "Verify"],
  ["Checkbox", "Filter"],
  ["Radio", "Plans"],
  ["Slider", "Levels"],
  ["Select", "Sort by"],
  ["Combobox", "Topics"],
  ["DatePicker", "Deadline"],
  ["ColorPicker", "Fill"],
  ["EmojiPicker", "Composer"],
];

/** Opens a demo by its sidebar entry and waits for `marker`, a text only that demo draws. */
async function show(app: App, name: string, marker: string) {
  await app.press(`label:${name}`);
  await app.waitFor(`text:${marker}`);
}

test("Input: typing checks the field as it goes", async () => {
  const app = await open("../App.tsx", wide);
  await app.setColorScheme("light");
  await show(app, "Input", "Account");
  await app.type("label:Name", "Ada");
  await app.type("label:E-mail", "ada@");
  await app.waitFor("text:That address needs an @ and a domain");
});

test("NumberInput: a locked quantity takes no steps", async () => {
  const app = await open("../App.tsx", wide);
  await app.setColorScheme("light");
  await show(app, "NumberInput", "Number input");
  await app.press("text:Lock seats");
  await app.waitFor("text:Seats: locked");
  expect(app.texts()).toContain("Unlock seats");
});

test("OtpInput: six digits verify the code", async () => {
  const app = await open("../App.tsx", wide);
  await app.setColorScheme("light");
  await show(app, "OtpInput", "Verify");
  await app.type("label:Verification code, 6 digits", "246810");
  await app.waitFor("text:Verified");
});

test("Checkbox: “Select all” takes the whole filter", async () => {
  const app = await open("../App.tsx", wide);
  await app.setColorScheme("light");
  await show(app, "Checkbox", "Filter");
  await app.press("text:Select all");
  await app.waitFor("text:Select all: true");
  expect(app.texts()).toContain("4 of 4");
});

test("Radio: a plan is chosen and priced", async () => {
  const app = await open("../App.tsx", wide);
  await app.setColorScheme("light");
  await show(app, "Radio", "Plans");
  await app.press("text:Team");
  await app.waitFor("text:$12 / mo");
});

test("Slider: the mute button takes the volume away", async () => {
  const app = await open("../App.tsx", wide);
  await app.setColorScheme("light");
  await show(app, "Slider", "Levels");
  await app.press("text:Mute");
  await app.waitFor("text:Volume: muted");
  expect(app.texts()).toContain("Unmute");
});

test("Select: a sort order is chosen from the list", async () => {
  const app = await open("../App.tsx", wide);
  await app.setColorScheme("light");
  await show(app, "Select", "Sort by");
  await app.press("text:Newest first");
  await app.press("text:Oldest first");
  await app.wait(150);
  expect(app.texts()).toContain("Oldest first");
});

test("Combobox: a chosen topic comes off, another goes on", async () => {
  const app = await open("../App.tsx", wide);
  await app.setColorScheme("light");
  await show(app, "Combobox", "Topics");
  // The card starts with Layout and iOS chosen (as upstream's does).
  // The field's press. Headless delivers it. On macOS the field editor takes
  // the click, so the same press does not open the list on `--target macos`.
  await app.press("label:Topics");
  await app.waitFor("role:option[Layout]");
  await app.press("role:option[Layout]");
  await app.waitFor("text:Topics: iOS");
  await app.press("role:option[Animation]");
  await app.waitFor("text:Topics: iOS, Animation");
});

test("DatePicker: a preset fills the deadline", async () => {
  const app = await open("../App.tsx", wide);
  await app.setColorScheme("light");
  await show(app, "DatePicker", "Deadline");
  // The trigger's own title: a date picker's trigger takes no test id (a gap), so its text opens it.
  await app.press(`text:${dueTitle}`);
  await app.press("text:Tomorrow");
  await app.waitFor("text:Due tomorrow");
  // The same demo's time slots: a free time becomes the booking.
  await app.press("role:radio[09:30]");
  await app.waitFor("text:Book at 09:30");
  await app.press("text:Book at 09:30");
  await app.wait(200);
  expect(app.texts().some((t) => t.startsWith("Booked:"))).toBe(true);
});

test("ColorPicker: the area hands over a color", async () => {
  const app = await open("../App.tsx", wide);
  await app.setColorScheme("light");
  await show(app, "ColorPicker", "Fill");
  expect(app.texts()).toContain("#6366f1");
  // A press on the area takes its point's color: the field's own note reports it.
  await app.press("label:Fill color saturation and brightness");
  await app.wait(300);
  expect(app.texts().some((text) => text.startsWith("Fill color: #"))).toBe(true);
  expect(app.texts()).not.toContain("#6366f1");
});

test("EmojiPicker: a recent emoji lands in the message", async () => {
  const app = await open("../App.tsx", wide);
  await app.setColorScheme("light");
  await show(app, "EmojiPicker", "Composer");
  await app.press("label:Add an emoji");
  await app.waitFor("id:emoji-panel");
  await app.press("id:emoji-panel >> text:🎉");
  await app.waitFor("text:Inserted 🎉");
});

test("a phone pushes the Inputs demos onto its stack", async () => {
  const app = await open("../App.tsx", phone);
  await app.setColorScheme("light");
  for (const [name, marker] of TOURS) {
    await show(app, name, marker);
    await app.back();
    await app.waitFor("text:ACTIONS");
  }
});

test("every Inputs demo draws in the dark and the shadcn palette", async () => {
  const app = await open("../App.tsx", wide);
  await app.setColorScheme("dark");
  await app.press("text:NSH Gallery");
  await app.press("text:shadcn/ui");
  await app.wait(300);
  for (const [name, marker] of TOURS) {
    await app.press(`label:${name}`);
    await app.waitFor(`text:${marker}`);
    expect(app.texts()).not.toContain("Not built yet");
  }
});
