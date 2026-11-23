import { describe, expect, test } from "bun:test";

import type { Choice, Field, Group, Handle, Selection, Track } from "@shadcn-nsh/theme";

import { choiceLook, fieldLook, groupLook, handleLook, selectionLook, trackLook } from "./look";

/** A dimension's values, read off a record that fails the typecheck when one is missing or extra. */
const values = <T extends string>(record: Record<T, true>): T[] => Object.keys(record) as T[];

const selections = values<Selection>({ pill: true, underline: true, bar: true });
const fields = values<Field>({ box: true, underline: true, "box-underline": true });
const choices = values<Choice>({ well: true, outline: true, inset: true });
const tracks = values<Track>({ sunk: true, tint: true, hairline: true });
const handles = values<Handle>({ circle: true, bar: true, ring: true });
const groups = values<Group>({ track: true, cells: true });

describe("selectionLook", () => {
  test("draws every value it takes", () => {
    expect(selections.map((value) => selectionLook(value).form)).toEqual(selections);
  });

  test("a pill is a capsule that fills the whole item", () => {
    expect(selectionLook("pill")).toMatchObject({
      span: "item",
      edges: "all",
      corners: "all",
      thickness: null,
      radius: "pill",
      fill: { kind: "finish", role: "raised" },
    });
  });

  test("underline and bar are one line, unlike in span and corners", () => {
    expect(selectionLook("underline")).toMatchObject({
      span: "label",
      edges: "bottom",
      corners: "top",
    });
    expect(selectionLook("bar")).toMatchObject({
      span: "item",
      edges: "bottom",
      corners: "all",
    });
    expect(selectionLook("underline").thickness).toBe(selectionLook("bar").thickness);
  });

  test("a line is the form's own 3 points, in the accent, rounded by half its thickness", () => {
    for (const value of ["underline", "bar"] as const) {
      const look = selectionLook(value);
      expect(look.thickness).toBe(3);
      expect(look.radius).toBe("half-thickness");
      expect(look.fill).toEqual({ kind: "colour", role: "brand" });
    }
  });
});

describe("fieldLook", () => {
  test("draws every value it takes", () => {
    expect(fields.map((value) => fieldLook(value).form)).toEqual(fields);
  });

  test("every frame is one control stroke round the control's corner", () => {
    for (const value of fields) {
      const look = fieldLook(value);
      expect(look.width).toBe("stroke.control");
      expect(look.radius).toBe("shape.control");
    }
  });

  test("a box is four input edges, an underline the bottom alone", () => {
    expect(fieldLook("box")).toMatchObject({
      edges: "all",
      corners: "all",
      side: { kind: "colour", role: "input" },
      bottom: { kind: "colour", role: "input" },
    });
    expect(fieldLook("underline")).toMatchObject({
      edges: "bottom",
      corners: "top",
      side: null,
      bottom: { kind: "colour", role: "mutedForeground" },
    });
  });

  test("box-underline is WinUI's: a bordered box whose bottom edge is the input's", () => {
    expect(fieldLook("box-underline")).toMatchObject({
      edges: "all",
      corners: "all",
      side: { kind: "colour", role: "border" },
      bottom: { kind: "colour", role: "input" },
    });
  });
});

describe("choiceLook", () => {
  test("draws every value it takes", () => {
    expect(choices.map((value) => choiceLook(value).form)).toEqual(choices);
  });

  test("every choice states the box the recipe gives it and takes its dot from the control's", () => {
    for (const value of choices) {
      const look = choiceLook(value);
      expect(look.dot).toBe("size.control.dot");
    }
    expect(choiceLook("well").size).toEqual({ pointer: 16, touch: 22 });
    expect(choiceLook("outline").size).toEqual({ pointer: 20, touch: 20 });
    expect(choiceLook("inset").size).toEqual({ pointer: 20, touch: 20 });
  });

  test("a well is a sunk face that turns the accent, inside one control stroke", () => {
    expect(choiceLook("well")).toMatchObject({
      face: { kind: "finish", role: "inset" },
      checked: { kind: "finish", role: "accent" },
      edge: { width: "stroke.control", fill: { kind: "colour", role: "input" } },
      corner: { pointer: 5, touch: 7 },
      target: null,
    });
  });

  test("M3's outline is a 2 px stroke with an empty well and a 40 dp state layer", () => {
    expect(choiceLook("outline")).toMatchObject({
      face: null,
      checked: null,
      edge: { width: 2, fill: { kind: "colour", role: "mutedForeground" } },
      corner: { pointer: 2, touch: 2 },
      target: "size.target",
    });
  });

  test("WinUI's inset is a flat track face with a 1 px edge, filled with the accent", () => {
    expect(choiceLook("inset")).toMatchObject({
      face: { kind: "colour", role: "track" },
      checked: { kind: "finish", role: "accent" },
      edge: { width: 1, fill: { kind: "colour", role: "input" } },
      corner: { pointer: 4, touch: 4 },
      target: null,
    });
  });

  test("only WinUI's inset grows the dot under a pointer and shrinks it while pressed", () => {
    expect(choiceLook("inset").dotHover).toBe(14);
    expect(choiceLook("inset").dotPressed).toBe(10);
    for (const value of ["well", "outline"] as const) {
      expect(choiceLook(value).dotHover).toBeNull();
      expect(choiceLook(value).dotPressed).toBeNull();
    }
  });

  test("only the outlined form asks for a hit target past its box", () => {
    expect(choices.filter((value) => choiceLook(value).target !== null)).toEqual(["outline"]);
  });
});

describe("trackLook", () => {
  test("draws every value it takes", () => {
    expect(tracks.map((value) => trackLook(value).form)).toEqual(tracks);
  });

  test("no track form draws an edge of its own", () => {
    for (const value of tracks) expect(trackLook(value).edge).toBeNull();
  });

  test("a sunk track is the track colour under the inset finish's shade", () => {
    expect(trackLook("sunk")).toMatchObject({
      groove: { fill: { kind: "colour", role: "track" }, shade: "inset" },
      progress: { height: 6, line: null },
      slider: { height: 6 },
      spinner: { groove: true, opacity: 0.25 },
    });
  });

  test("a tinted track is a brand band, the slider's 16 points M3's", () => {
    expect(trackLook("tint")).toMatchObject({
      groove: { fill: { kind: "tint", role: "brand" }, shade: null },
      progress: { height: 4, line: null },
      slider: { height: 16 },
      spinner: { groove: false, opacity: null },
    });
  });

  test("a hairline track is the line itself: progress over a 1-point rail", () => {
    expect(trackLook("hairline")).toMatchObject({
      groove: { fill: { kind: "colour", role: "input" }, shade: null },
      progress: { height: 3, line: 1 },
      slider: { height: 4 },
      spinner: { groove: false, opacity: null },
    });
  });

  test("only the sunk track seats a spinner", () => {
    expect(tracks.filter((value) => trackLook(value).spinner.groove)).toEqual(["sunk"]);
  });
});

describe("handleLook", () => {
  test("draws every value it takes", () => {
    expect(handles.map((value) => handleLook(value).form)).toEqual(handles);
  });

  test("a circle grows under a touch screen's press, and brightens on hover", () => {
    expect(handleLook("circle")).toMatchObject({
      rail: { pointer: 6, touch: 8 },
      band: { pointer: 20, touch: 32 },
      knob: { pointer: 14, touch: 20 },
      knobPressed: { pointer: 14, touch: 32 },
      verticalLength: { pointer: 128, touch: 144 },
      brightensOnHover: true,
    });
  });

  test("only the circle makes a switch's knob: the icon scale on the height scale", () => {
    expect(handleLook("circle")).toMatchObject({ switch: { knob: "icon.md", track: "height.md" } });
    expect(handles.filter((value) => handleLook(value).switch !== null)).toEqual(["circle"]);
  });

  test("M3's bar is a 4 × 44 knob on a 16-point rail, 2 wide while pressed", () => {
    expect(handleLook("bar")).toMatchObject({
      knob: { width: 4, height: 44 },
      knobPressedWidth: 2,
      rail: 16,
      band: 44,
      verticalLength: { pointer: 128, touch: 144 },
      endRadius: 2,
      brightensOnHover: false,
    });
  });

  test("WinUI's ring is an 18 px knob with a 12 px dot on a 4-point rail", () => {
    expect(handleLook("ring")).toMatchObject({
      knob: 18,
      dot: 12,
      knobHover: 14,
      knobPressed: 10,
      rail: 4,
      band: 32,
      verticalLength: { pointer: 128, touch: 144 },
      brightensOnHover: false,
    });
  });

  test("a vertical slider is as long on every form", () => {
    const lengths = handles.map((value) => JSON.stringify(handleLook(value).verticalLength));
    expect(new Set(lengths).size).toBe(1);
  });
});

describe("groupLook", () => {
  test("draws every value it takes", () => {
    expect(groups.map((value) => groupLook(value).form)).toEqual(groups);
  });

  test("a track's capsule covers the chosen item, on the control's corner", () => {
    expect(groupLook("track")).toMatchObject({
      span: "item",
      radius: "shape.control",
      fill: { kind: "finish", role: "raised" },
      height: "height.md",
    });
  });

  test("M3's cells are 40 high, padded 12, gapped 8, their check 18", () => {
    expect(groupLook("cells")).toMatchObject({
      height: 40,
      padding: 12,
      gap: 8,
      check: 18,
      corner: "pill",
      edge: { width: "stroke.hairline", fill: { kind: "colour", role: "border" } },
      selected: { kind: "tint", role: "brand" },
    });
  });
});

describe("the looks", () => {
  test("are pure: one call's object is not the next call's", () => {
    for (const value of selections) expect(selectionLook(value)).not.toBe(selectionLook(value));
    for (const value of fields) expect(fieldLook(value)).not.toBe(fieldLook(value));
    for (const value of choices) expect(choiceLook(value)).not.toBe(choiceLook(value));
    for (const value of tracks) expect(trackLook(value)).not.toBe(trackLook(value));
    for (const value of handles) expect(handleLook(value)).not.toBe(handleLook(value));
    for (const value of groups) expect(groupLook(value)).not.toBe(groupLook(value));
  });

  test("throw on a value the switch was not taught", () => {
    expect(() => selectionLook("capsule" as Selection)).toThrow(
      "no look for the dimension value capsule",
    );
  });
});
