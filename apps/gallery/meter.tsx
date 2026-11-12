import { Text, View, mount } from "nsh";
import { AvatarGroup } from "nsh/base";

// Family 8: progress, slider, avatar, table — every state that fits on a 390-wide page.
import { colors } from "../../packages/theme";
import {
  Avatar,
  Progress,
  Slider,
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "../../packages/ui";
import { Page, Panel, Row } from "./demo-kit";

const track = { width: 180 };

function Bars(props: { label: string; value?: number; indeterminate?: boolean }) {
  return (
    <Row label={props.label}>
      <Progress
        style={track}
        value={props.value}
        indeterminate={props.indeterminate}
        accessibilityLabel={props.label}
      />
    </Row>
  );
}

mount(() => (
  <Page>
    <Panel title="Progress">
      <Bars label="empty" value={0} />
      <Bars label="half" value={56} />
      <Bars label="done" value={100} />
      <Bars label="busy" indeterminate />
    </Panel>
    <Panel title="Slider">
      <Row label="level">
        <Slider style={track} value={64} accessibilityLabel="Level">
          <Text style={{ width: 36, fontSize: 12, color: colors.muted, textAlign: "right" }}>
            64%
          </Text>
        </Slider>
      </Row>
      <Row label="range">
        <Slider style={track} value={[24, 76]} accessibilityLabel="Range" />
      </Row>
      <Row label="locked">
        <Slider style={track} value={72} disabled accessibilityLabel="Locked" />
      </Row>
    </Panel>
    <Panel title="Avatar">
      <Row label="people">
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <Avatar name="Ada Lovelace" />
          <Avatar name="Grace Hopper" />
          <Avatar name="Alan Turing" />
          <Avatar />
        </View>
      </Row>
      <Row label="stack">
        <AvatarGroup limit={3} total={8} accessibilityLabel="8 members" overflow={<Text>+5</Text>}>
          <Avatar name="Ada Lovelace" />
          <Avatar name="Grace Hopper" style={{ marginLeft: -8 }} />
          <Avatar name="Alan Turing" style={{ marginLeft: -8 }} />
          <Avatar name="Edsger Dijkstra" style={{ marginLeft: -8 }} />
        </AvatarGroup>
      </Row>
    </Panel>
    <Panel title="Table">
      <Table accessibilityLabel="Recent invoices">
        <TableHeader>
          <TableRow>
            <TableHead>Invoice</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>INV001</TableCell>
            <TableCell>Paid</TableCell>
            <TableCell>$250</TableCell>
          </TableRow>
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell>Total</TableCell>
            <TableCell />
            <TableCell>$250</TableCell>
          </TableRow>
        </TableFooter>
        <TableCaption>Invoices for March.</TableCaption>
      </Table>
    </Panel>
  </Page>
));
