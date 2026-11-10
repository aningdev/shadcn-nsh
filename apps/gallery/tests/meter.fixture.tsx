import {
  Avatar,
  AvatarGroup,
  avatarVariants,
  Progress,
  progressVariants,
  Slider,
  sliderVariants,
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@shadcn-nsh/ui";
import { mount, platform, reduceMotion, signal, Text, View } from "nsh";
import { Button as BaseButton } from "nsh/base";

function App() {
  const sent = signal(10);
  const busy = signal(false);
  const level = signal(10);
  const locked = signal(false);
  const who = signal("Ada Lovelace");
  const picked = signal("");
  const bar = () => progressVariants({ value: sent(), indeterminate: busy() });
  const place = () => {
    const translate = bar().indicatorStyle.translate;
    return typeof translate === "string" ? translate : "sweep";
  };
  const slider = sliderVariants();
  const avatar = avatarVariants();
  return (
    <View>
      <Progress
        testID="bar"
        style={{ width: 200 }}
        value={sent()}
        indeterminate={busy()}
        accessibilityLabel="Upload"
      >
        <Text>{`sent=${sent()}`}</Text>
      </Progress>
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
      <AvatarGroup limit={2} total={6} accessibilityLabel="6 people">
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
      <Text>{`thumb=${slider.metrics.thumb}|${slider.metrics.rail}|${slider.metrics.band}|${slider.metrics.run}`}</Text>
      <Text>{`avatar=${avatar.side}|${avatar.fontSize}`}</Text>
      <Text>{`rail=${progressVariants().trackStyle.height}`}</Text>
    </View>
  );
}

mount(App);
