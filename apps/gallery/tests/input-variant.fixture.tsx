import { colors } from "@shadcn-nsh/theme";
import { mount, Text } from "nsh";

import { fieldLook, Input } from "../../../packages/ui";

// What the shared field draws, as words: the ghost field's fill and edge, the ring both keep, and
// the default field's fill and edge, so a test can hold the two apart. `—` is absent. `Input`
// wears this look; the rendered fields are what the test reads for the fill.
const said = (value: number | undefined) => value ?? "—";
const ghost = fieldLook({ variant: "ghost" });
const plain = fieldLook();
const line = (name: string, look: ReturnType<typeof fieldLook>) =>
  [
    `${name} fill=${look.style.backgroundColor === "transparent" ? "—" : "yes"}`,
    `edge=${look.style.borderColor === "transparent" ? "—" : "yes"}`,
    `hover-edge=${look.hoverStyle?.borderColor === colors.faint ? "yes" : "—"}`,
    `focus-edge=${look.focusWithinStyle.borderColor === colors.brand ? "yes" : "—"}`,
    `focus-ring=${look.focusWithinStyle.outlineColor === colors.brand && look.focusWithinStyle.outlineWidth === 2 ? "yes" : "—"}`,
    `stride=${said(look.style.borderWidth)}`,
  ].join(" ");

function App() {
  return (
    <>
      <Text>{line("ghost", ghost)}</Text>
      <Text>{line("default", plain)}</Text>
      <Input variant="ghost" accessibilityLabel="Ghost field" />
      <Input accessibilityLabel="Plain field" />
    </>
  );
}

mount(App);
