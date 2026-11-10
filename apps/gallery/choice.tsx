/* oxlint-disable react/jsx-no-undef -- <Each> is an NSH global */
// Family 2: toggle, toggle group, checkbox, radio group — every kind, size and state.
import { colors } from "@shadcn-nsh/theme";
import { Checkbox, RadioGroup, RadioGroupItem, Toggle, ToggleGroup } from "@shadcn-nsh/ui";
import { mount, Text } from "nsh";

import { Flow, Page, Panel, Row } from "./demo-kit";

const sizes = ["sm", "default", "lg"] as const;

function Label(props: { children: string }) {
  return <Text style={{ fontSize: 14, color: colors.foreground }}>{props.children}</Text>;
}

mount(() => (
  <Page>
    <Panel title="Toggle — text">
      <Row label="default">
        <Flow>
          <Toggle pressed={false}>Italic</Toggle>
          <Toggle pressed>Bold</Toggle>
          <Toggle pressed={false} disabled>
            Off
          </Toggle>
          <Toggle pressed disabled>
            On
          </Toggle>
        </Flow>
      </Row>
      <Row label="outline">
        <Flow>
          <Toggle variant="outline" pressed={false}>
            Italic
          </Toggle>
          <Toggle variant="outline" pressed>
            Bold
          </Toggle>
          <Toggle variant="outline" pressed={false} disabled>
            Off
          </Toggle>
        </Flow>
      </Row>
      <Row label="sizes">
        <Flow>
          <Each of={[...sizes]}>
            {(s) => (
              <Toggle variant="outline" size={s()} pressed>
                {s()}
              </Toggle>
            )}
          </Each>
        </Flow>
      </Row>
    </Panel>
    <Panel title="Toggle — icon and group">
      <Row label="icon">
        <Flow>
          <Toggle pressed={false}>
            <Text style={{ fontWeight: "700", color: colors.mutedForeground }}>B</Text>
          </Toggle>
          <Toggle pressed>
            <Text style={{ fontWeight: "700", color: colors.foreground }}>B</Text>
          </Toggle>
        </Flow>
      </Row>
      <Row label="group">
        <ToggleGroup>
          <Toggle pressed>Left</Toggle>
          <Toggle pressed={false}>Center</Toggle>
          <Toggle pressed={false}>Right</Toggle>
        </ToggleGroup>
      </Row>
    </Panel>
    <Panel title="Checkbox">
      <Row label="off / on">
        <Flow>
          <Checkbox checked={false}>
            <Label>Off</Label>
          </Checkbox>
          <Checkbox checked>
            <Label>On</Label>
          </Checkbox>
          <Checkbox indeterminate>
            <Label>Some</Label>
          </Checkbox>
        </Flow>
      </Row>
      <Row label="disabled">
        <Flow>
          <Checkbox checked={false} disabled>
            <Label>Off</Label>
          </Checkbox>
          <Checkbox checked disabled>
            <Label>On</Label>
          </Checkbox>
        </Flow>
      </Row>
    </Panel>
    <Panel title="Radio group">
      <Row label="options">
        <RadioGroup>
          <RadioGroupItem checked>
            <Label>Compact</Label>
          </RadioGroupItem>
          <RadioGroupItem checked={false}>
            <Label>Comfortable</Label>
          </RadioGroupItem>
          <RadioGroupItem checked={false} disabled>
            <Label>Disabled</Label>
          </RadioGroupItem>
        </RadioGroup>
      </Row>
    </Panel>
  </Page>
));
