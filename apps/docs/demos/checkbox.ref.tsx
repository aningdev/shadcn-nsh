// The reference of `checkbox.tsx`: the same scene as upstream writes it, `checkboxLook` and
// `CheckboxMark` spread on `nsh/base`'s Checkbox. The render check requires the two to draw the
// same pixels.
import { colors } from "@shadcn-nsh/theme";
import type { JSX } from "nsh";
import { mount, signal, Text, View } from "nsh";
import { Checkbox } from "nsh/base";

import { type CheckboxMarkKind, CheckboxMark, checkboxLook } from "@/packages/ui/checkbox";
import {
  controlSize,
  listRow,
  RowDivider,
  RowLabel,
  sectionSurface,
} from "@/packages/ui/lib/surface";

import { DemoCard, DemoPage, DemoSection } from "./kit";
import { desktop, Log, Panel, Split } from "./stage";

const items = [
  { id: "photos", label: "Photos", detail: "2,418 items · 6.1 GB" },
  { id: "documents", label: "Documents", detail: "312 files · 840 MB" },
  { id: "messages", label: "Messages", detail: "Attachments included · 1.2 GB" },
];

/** A checkbox in the shared box look, its mark drawn from the value. */
function Box(props: {
  mark: CheckboxMarkKind;
  scale?: number;
  round?: boolean;
  disabled?: boolean;
  children?: JSX.Element;
}) {
  return (
    <Checkbox
      class="group"
      checked={props.mark === "check"}
      indeterminate={props.mark === "dash"}
      disabled={props.disabled}
      {...checkboxLook({
        scale: props.scale,
        round: props.round,
        disabled: () => !!props.disabled,
      })}
      indicator={<CheckboxMark mark={props.mark} scale={props.scale} round={props.round} />}
    >
      {props.children}
    </Checkbox>
  );
}

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
      <Text style={{ color: colors.muted }}>
        {desktop
          ? "Click a row, or Tab to a checkbox and press Space"
          : "Tap a row: the label toggles it too"}
      </Text>

      <Split
        gap={14}
        inspector={
          <>
            <Panel title="checked · indeterminate">
              <Text style={{ fontSize: 13, color: colors.text }}>
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
            class="group"
            {...listRow({ first: true })}
            {...checkboxLook()}
            indicator={<CheckboxMark mark={all() ? "check" : some() ? "dash" : null} />}
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
              class="group"
              // One level under "Back up everything": the boxes line up with its label.
              {...listRow({ start: controlSize.control + controlSize.gap })}
              {...checkboxLook()}
              indicator={<CheckboxMark mark={selected().includes(item.id) ? "check" : null} />}
            >
              <RowDivider show />
              <RowLabel label={item.label} detail={item.detail} />
            </Checkbox>
          ))}
        </View>

        <View style={sectionSurface({ padded: true })}>
          <Checkbox
            checked
            disabled
            class="group"
            {...listRow({ first: true, disabled: true })}
            {...checkboxLook({ disabled: true })}
            indicator={<CheckboxMark mark="check" />}
          >
            <RowLabel label="System settings" detail="Always backed up" />
          </Checkbox>
        </View>
      </Split>

      <DemoCard>
        <DemoSection title="Scale">
          <Row label="Small">
            <Box mark="check" scale={0.8} />
          </Row>
          <Row label="Regular">
            <Box mark="check" />
          </Row>
          <Row label="Large">
            <Box mark="check" scale={1.25} />
          </Row>
        </DemoSection>
        <DemoSection title="Round">
          <Row label="Round">
            <Box mark="check" round />
          </Row>
          <Row label="Off">
            <Box mark={null} round />
          </Row>
        </DemoSection>
        <DemoSection title="States">
          <Row label="Checked">
            <Box mark="check" />
          </Row>
          <Row label="Indeterminate">
            <Box mark="dash" />
          </Row>
          <Row label="Off">
            <Box mark={null} />
          </Row>
          <Row label="Disabled">
            <Box mark="check" disabled />
          </Row>
          <Row label="Disabled">
            <Box mark={null} disabled />
          </Row>
        </DemoSection>
      </DemoCard>
    </DemoPage>
  );
}

mount(App);
