// The official checkbox scene (`references/nsh/website/demos/el-checkbox.tsx`) with this library's
// parts: "Back up everything" checks all three items (a dash while some are), each item is its own
// row, and a disabled setting stands on its own; the inspector says what is checked and the log
// keeps the last three changes. A second card lists the sizes, the round box and the states, every
// one of them a row with its label beside the box.
import type { JSX } from "nsh";
import { mount, signal, Text, View } from "nsh";

import { Checkbox } from "@/packages/ui/checkbox";
import {
  controlSize,
  listRow,
  RowDivider,
  RowLabel,
  sectionSurface,
} from "@/packages/ui/lib/surface";

import { DemoCard, DemoPage, DemoSection } from "./kit";
import { desktop, Log, Panel, Split, ui } from "./stage";
const items = [
  { id: "photos", label: "Photos", detail: "2,418 items · 6.1 GB" },
  { id: "documents", label: "Documents", detail: "312 files · 840 MB" },
  { id: "messages", label: "Messages", detail: "Attachments included · 1.2 GB" },
];
/** A checkbox on a row of its own, its label beside the box. */
function Row(props: { label: string; detail?: string; first?: boolean; children: JSX.Element }) {
  return (
    <View style={listRow({ first: props.first }).style}>
      {props.children}
      <RowLabel label={props.label} detail={props.detail} />
    </View>
  );
}
function App() {
  const selected = signal<string[]>(["photos"]);
  const events = signal<string[]>([]);
  const log = (e: string) => events.set([e, ...events()].slice(0, 3));
  const all = () => selected().length === items.length;
  const some = () => selected().length > 0 && !all();
  const toggle = (id: string, checked: boolean) =>
    selected.set(checked ? [...selected(), id] : selected().filter((x) => x !== id));
  return (
    <DemoPage title="Checkbox">
      <Text style={{ color: ui().muted }}>
        {desktop
          ? "Click a row, or Tab to a checkbox and press Space"
          : "Tap a row: the label toggles it too"}
      </Text>
      <Split
        gap={14}
        inspector={
          <>
            <Panel title="checked · indeterminate">
              <Text style={{ fontSize: 13, color: ui().text }}>
                {`Back up everything: ${all() ? "checked" : some() ? "indeterminate" : "unchecked"} · [${selected().join(", ")}]`}
              </Text>
            </Panel>
            <Log title="onChange({ checked })" lines={events()} minHeight={92} />
          </>
        }
      >
        <View style={sectionSurface({ padded: true })}>
          <Checkbox
            checked={all()}
            indeterminate={some()}
            onChange={({ checked }) => {
              selected.set(checked ? items.map((i) => i.id) : []);
              log(`Back up everything → ${checked}`);
            }}
            {...listRow({ first: true })}
          >
            <RowLabel
              label="Back up everything"
              detail={`${selected().length} of ${items.length} selected`}
              strong
            />
          </Checkbox>
          {items.map((item) => (
            <Checkbox
              checked={selected().includes(item.id)}
              onChange={({ checked }) => {
                toggle(item.id, checked);
                log(`${item.label} → ${checked}`);
              }}
              // One level under "Back up everything": the boxes line up with its label.
              {...listRow({ start: controlSize.control + controlSize.gap })}
            >
              <RowDivider show />
              <RowLabel label={item.label} detail={item.detail} />
            </Checkbox>
          ))}
        </View>
        <View style={sectionSurface({ padded: true })}>
          <Checkbox checked disabled {...listRow({ first: true, disabled: true })}>
            <RowLabel label="System settings" detail="Always backed up" />
          </Checkbox>
        </View>
      </Split>
      <DemoCard>
        <DemoSection title="Scale">
          <Row label="Small">
            <Checkbox scale={0.8} checked />
          </Row>
          <Row label="Regular">
            <Checkbox checked />
          </Row>
          <Row label="Large">
            <Checkbox scale={1.25} checked />
          </Row>
        </DemoSection>
        <DemoSection title="Round">
          <Row label="Round">
            <Checkbox round checked />
          </Row>
          <Row label="Off">
            <Checkbox round />
          </Row>
        </DemoSection>
        <DemoSection title="States">
          <Row label="Checked">
            <Checkbox checked />
          </Row>
          <Row label="Indeterminate">
            <Checkbox indeterminate />
          </Row>
          <Row label="Off">
            <Checkbox />
          </Row>
          <Row label="Disabled">
            <Checkbox checked disabled />
          </Row>
          <Row label="Disabled">
            <Checkbox disabled />
          </Row>
        </DemoSection>
      </DemoCard>
    </DemoPage>
  );
}
mount(App);
