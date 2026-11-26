import { colors } from "@shadcn-nsh/theme";
import { mount, signal, Text, type InputRef } from "nsh";

import { Button } from "../../../packages/ui";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  inputGroupControlLook,
  inputGroupLook,
  InputGroupText,
  InputGroupTextarea,
} from "../../../packages/ui";

// The group's look and the control's, as words a test can hold apart: the group draws the edge
// at rest, the focus edge and the ring while a control in it has the keys, and the radius the
// caller gives it; the control draws no fill, no edge and no ring of its own. `—` is absent.
const group = inputGroupLook({ style: { borderRadius: 22 } });
const control = inputGroupControlLook();
const said = (value: string | number | undefined) =>
  value === undefined || value === null ? "—" : `${value}`;
const frame = [
  `edge=${group.style.borderColor === colors.input ? "yes" : "—"}`,
  `focus-edge=${group.focusWithinStyle.borderColor === colors.brand ? "yes" : "—"}`,
  `focus-ring=${group.focusWithinStyle.outlineColor === colors.brand && group.focusWithinStyle.outlineWidth === 2 ? "yes" : "—"}`,
  `radius=${said(group.style.borderRadius)}`,
].join(" ");
const inside = [
  `fill=${control.style.backgroundColor === "transparent" ? "—" : "yes"}`,
  `edge=${said(control.style.borderWidth)}`,
  `ring=${said(control.style.outlineWidth)}`,
  `takes-the-room-left=${control.style.flex === 1 ? "yes" : "—"}`,
].join(" ");

// A group with a control that is off: flat on the quieter edge.
const off = inputGroupLook({ disabled: true });
const resting = inputGroupLook();

function App() {
  const query = signal("");
  const draft = signal("");
  // The app's own refs on the controls: a shortcut or a request focuses them from code.
  // eslint-disable-next-line no-unassigned-vars
  let search: InputRef | undefined;
  // eslint-disable-next-line no-unassigned-vars
  let composer: InputRef | undefined;
  return (
    <>
      <InputGroup style={{ borderRadius: 22 }}>
        <InputGroupAddon align="inline-start">
          <InputGroupText>Q</InputGroupText>
        </InputGroupAddon>
        <InputGroupInput
          ref={search}
          testID="search"
          value={query()}
          onChange={({ value }) => query.set(value)}
          placeholder="Search"
        />
        <InputGroupAddon align="inline-end">
          <InputGroupButton
            testID="clear"
            size="icon-xs"
            accessibilityLabel="Clear"
            onPress={() => query.set("")}
          >
            <Text>x</Text>
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
      <InputGroup>
        <InputGroupTextarea
          ref={composer}
          value={draft()}
          onChange={({ value }) => draft.set(value)}
          placeholder="Draft"
        />
      </InputGroup>
      <Button testID="find" onPress={() => search?.focus()}>
        Find
      </Button>
      <Button testID="compose" onPress={() => composer?.focus()}>
        Compose
      </Button>
      <Text>{`draft=${draft() || "—"}`}</Text>
      <Text>{`frame ${frame}`}</Text>
      <Text>{`inside ${inside}`}</Text>
      <Text>{`value=${query() || "—"}`}</Text>
      <Text>{`disabled-edge=${off.style.borderColor === colors.line ? "flat" : "rest"}`}</Text>
      <Text>{`resting-edge=${resting.style.borderColor === colors.input ? "rest" : "flat"}`}</Text>
    </>
  );
}

mount(App);
