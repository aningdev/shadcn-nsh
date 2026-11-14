import { mount, platform, reduceMotion, signal, Text, View } from "nsh";
import { AvatarGroup, Button as BaseButton } from "nsh/base";

import {
  Avatar,
  Progress,
  Slider,
  Table,
  TableBody,
  TableCell,
  TableRow,
  progressLook,
  progressRail,
  progressSweep,
} from "../../../packages/ui";

function App() {
  const sent = signal(10);
  const busy = signal(false);
  const level = signal(10);
  const locked = signal(false);
  const who = signal("Ada Lovelace");
  const picked = signal("");
  const sweep = progressSweep();
  const bar = () => progressLook(() => sent(), { indeterminate: () => busy(), sweep });
  const place = () => {
    const translate = bar().indicatorStyle.translate;
    return typeof translate === "string" ? translate : "sweep";
  };
  const pointer = platform.desktop;
  const thumb = pointer ? 14 : 20;
  const railH = pointer ? 6 : 8;
  const band = pointer ? 20 : 44;
  const run = pointer ? 128 : 144;
  return (
    <View>
      <Progress
        testID="bar"
        style={{ width: 200 }}
        value={sent()}
        indeterminate={busy()}
        sweep={sweep}
        accessibilityLabel="Upload"
      />
      <Text>{`sent=${sent()}`}</Text>
      <Text>{`glide=${bar().indicatorClass}`}</Text>
      <Text>{`at=${place()}`}</Text>
      <BaseButton onPress={() => sent.set(35)}>
        <Text>Add</Text>
      </BaseButton>
      <BaseButton onPress={() => busy.set(true)}>
        <Text>Busy</Text>
      </BaseButton>

      <Slider
        testID="level"
        style={{ width: 200 }}
        value={level()}
        onChange={(e) => level.set(typeof e.value === "number" ? e.value : e.value[0])}
        accessibilityLabel="Level"
      />
      <Slider
        testID="shown"
        style={{ width: 200 }}
        value={level()}
        onChange={(e) => level.set(typeof e.value === "number" ? e.value : e.value[0])}
        accessibilityLabel="Shown level"
        showValue
      />
      <BaseButton onPress={() => level.set(35)}>
        <Text>Bump</Text>
      </BaseButton>
      <Text>{`level=${level()}`}</Text>
      <Slider testID="locked" value={20} disabled={locked()} accessibilityLabel="Locked" />
      <BaseButton onPress={() => locked.set(true)}>
        <Text>Lock</Text>
      </BaseButton>

      <Avatar name={who()} />
      <Text>{`who=${who()}`}</Text>
      <BaseButton onPress={() => who.set("Grace Hopper")}>
        <Text>Rename</Text>
      </BaseButton>
      <AvatarGroup limit={2} total={6} accessibilityLabel="6 people" overflow={<Text>+4</Text>}>
        <Avatar name="A" />
        <Avatar name="B" />
        <Avatar name="C" />
      </AvatarGroup>

      <Table accessibilityLabel="Invoices">
        <TableBody>
          <TableRow selected={picked() === "INV1"}>
            <TableCell>INV1</TableCell>
            <TableCell>Paid</TableCell>
          </TableRow>
        </TableBody>
      </Table>
      <Text>{`picked=${picked()}`}</Text>
      <BaseButton onPress={() => picked.set("INV1")}>
        <Text>Select</Text>
      </BaseButton>

      <Text>{`desktop=${platform.desktop}`}</Text>
      <Text>{`motion=${reduceMotion()}`}</Text>
      <Text>{`thumb=${thumb}|${railH}|${band}|${run}`}</Text>
      <Text>{`avatar=${pointer ? "32|11" : "40|14"}`}</Text>
      <Text>{`rail=${progressRail().height}`}</Text>
    </View>
  );
}

mount(App);
