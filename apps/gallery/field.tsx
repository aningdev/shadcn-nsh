// Family 3: input, number input, one-time code — every state the field well has.
import { colors } from "@shadcn-nsh/theme";
import { Input, NumberInput, OtpInput } from "@shadcn-nsh/ui";
import { Text, View, mount } from "nsh";

import { Flow, Page, Panel, Row } from "./demo-kit";

/** The row's remainder, so every text field shares one width instead of hugging its text. */
const fill = { flex: 1 };

/**
 * Label above the control. Six cells are 36 wide with 8 between them (256 altogether);
 * beside the row's 84-point label a 390-wide page has about 222 left, so they clip.
 */
function Stack(props: { label: string; children: unknown }) {
  return (
    <View style={{ gap: 6 }}>
      <Text style={{ fontSize: 12, color: colors.mutedForeground }}>{props.label}</Text>
      {props.children as never}
    </View>
  );
}

mount(() => (
  <Page>
    <Panel title="Input">
      <Row label="default">
        <Input style={fill} placeholder="Your name" />
      </Row>
      <Row label="value">
        <Input style={fill} value="Ada Lovelace" />
      </Row>
      <Row label="focus">
        <Input style={fill} value="Focused" autoFocus />
      </Row>
      <Row label="invalid">
        <Input style={fill} value="Not an email" invalid />
      </Row>
      <Row label="readonly">
        <Input style={fill} value="Read only" readonly />
      </Row>
      <Row label="disabled">
        <Input style={fill} value="Disabled" disabled />
      </Row>
      <Row label="multiline">
        <Input
          style={fill}
          multiline
          value={"Notes stay on their own lines,\nand this one is the second."}
        />
      </Row>
    </Panel>
    <Panel title="Number">
      <Row label="pair">
        <NumberInput value={3} min={0} max={9} />
      </Row>
      <Row label="split">
        <Flow>
          <NumberInput value={3} min={0} max={9} controlsRight={false} />
        </Flow>
      </Row>
      <Row label="invalid">
        <NumberInput value={3} invalid />
      </Row>
      <Row label="readonly">
        <NumberInput value={3} readonly />
      </Row>
      <Row label="disabled">
        <NumberInput value={3} disabled />
      </Row>
    </Panel>
    <Panel title="One-time code">
      <Stack label="empty">
        <OtpInput length={6} />
      </Stack>
      <Stack label="partial">
        <OtpInput length={6} value="12" />
      </Stack>
      <Stack label="filled">
        <OtpInput length={6} value="123456" />
      </Stack>
      <Stack label="invalid">
        <OtpInput length={6} value="12" invalid />
      </Stack>
      <Stack label="masked">
        <OtpInput length={4} value="12" masked />
      </Stack>
      <Stack label="groups">
        <OtpInput length={6} groups={2} value="123" />
      </Stack>
      <Stack label="disabled">
        <OtpInput length={4} value="12" disabled />
      </Stack>
    </Panel>
  </Page>
));
