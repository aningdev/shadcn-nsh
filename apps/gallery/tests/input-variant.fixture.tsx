import { colors } from "@shadcn-nsh/theme";
import { mount, Text } from "nsh";

import { inputLook } from "../../../packages/ui";

// What the look draws, as words: the ghost field's fill and edge, the ring both keep, and the
// default field's fill and edge, so a test can hold the two apart. `—` is absent.
const said = (value: number | undefined) => value ?? "—";
const ghost = inputLook({ variant: "ghost" });
const plain = inputLook();
const line = (name: string, look: ReturnType<typeof inputLook>) =>
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
    </>
  );
}

mount(App);
