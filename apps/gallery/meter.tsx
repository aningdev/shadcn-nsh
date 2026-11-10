// Family 8: progress, slider, avatar, table — every state that fits on a 390-wide page.
import { colors } from "@shadcn-nsh/theme";
import {
  Avatar,
  AvatarGroup,
  avatarVariants,
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
} from "@shadcn-nsh/ui";
import { Text, View, mount } from "nsh";

import { Page, Panel, Row } from "./demo-kit";

/** Fixed track, so a bar or a slider does not shrink to its thumb. */
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

mount(() => {
  const side = () => avatarVariants().side;
  return (
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
            <Text
              style={{ width: 36, fontSize: 12, color: colors.mutedForeground, textAlign: "right" }}
            >
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
        <Row label="bands">
          <View
            style={{
              width: 180,
              height: 56,
              flexDirection: "row",
              justifyContent: "space-around",
              alignItems: "center",
            }}
          >
            <Slider
              axis="vertical"
              style={{ height: 56 }}
              value={4}
              min={-12}
              max={12}
              accessibilityLabel="Bass"
            />
            <Slider
              axis="vertical"
              style={{ height: 56 }}
              value={0}
              min={-12}
              max={12}
              accessibilityLabel="Mid"
            />
            <Slider
              axis="vertical"
              style={{ height: 56 }}
              value={-6}
              min={-12}
              max={12}
              accessibilityLabel="Treble"
            />
          </View>
        </Row>
      </Panel>
      <Panel title="Avatar">
        <Row label="people">
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <Avatar name="Ada Lovelace" />
            <Avatar name="Grace Hopper" />
            <Avatar name="Alan Turing" />
            <Avatar />
            <Avatar name="Grace Hopper" src="data:image/png;base64,AAAA" />
          </View>
        </Row>
        <Row label="stack">
          <AvatarGroup limit={3} total={8} accessibilityLabel="8 members">
            <Avatar name="Ada Lovelace" ring />
            <Avatar name="Grace Hopper" ring style={{ marginLeft: -side() / 4 }} />
            <Avatar name="Alan Turing" ring style={{ marginLeft: -side() / 4 }} />
            <Avatar name="Edsger Dijkstra" ring style={{ marginLeft: -side() / 4 }} />
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
              <TableCell>INV1</TableCell>
              <TableCell>Paid</TableCell>
              <TableCell>$12</TableCell>
            </TableRow>
            <TableRow selected>
              <TableCell>INV2</TableCell>
              <TableCell>Hold</TableCell>
              <TableCell>$4</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>INV3</TableCell>
              <TableCell>Due</TableCell>
              <TableCell>$9</TableCell>
            </TableRow>
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell>Total</TableCell>
              <TableCell />
              <TableCell>$25</TableCell>
            </TableRow>
          </TableFooter>
          <TableCaption>Recent invoices.</TableCaption>
        </Table>
      </Panel>
    </Page>
  );
});
