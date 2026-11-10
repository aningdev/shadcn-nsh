// Family 4: select and combobox — the list states, on pointer and as a touch sheet.
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxTrigger,
  ComboboxValue,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@shadcn-nsh/ui";
import type { JSX } from "nsh";
import { View, mount } from "nsh";
import { Window } from "nsh/desktop";

// The shot is the window, not the scroll. Tall enough for every open list under its trigger.
Window.setFrame({ size: { width: 680, height: 1960 }, animated: false });

import { Page, Panel, Row } from "./demo-kit";

function Fruit(props: { value: string; disabled?: boolean }) {
  return (
    <SelectItem value={props.value} disabled={props.disabled}>
      {props.value[0]?.toUpperCase() + props.value.slice(1)}
    </SelectItem>
  );
}

/** Room under a held-open trigger so the list stays below it and does not cover the row above. */
function OpenSlot(props: { height: number; children: JSX.Element }) {
  return <View style={{ minHeight: props.height }}>{props.children}</View>;
}

mount(() => (
  <Page>
    <Panel title="Select">
      <Row label="default">
        <Select placeholder="Fruit">
          <SelectTrigger>
            <SelectValue placeholder="Fruit" />
          </SelectTrigger>
          <SelectContent>
            <Fruit value="apple" />
            <Fruit value="banana" />
            <Fruit value="cherry" />
          </SelectContent>
        </Select>
      </Row>
      <Row label="groups">
        <Select value="lemon">
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Citrus</SelectLabel>
              <Fruit value="lemon" />
              <Fruit value="lime" />
            </SelectGroup>
            <SelectGroup>
              <SelectLabel>Stone fruit</SelectLabel>
              <Fruit value="peach" />
              <Fruit value="plum" />
            </SelectGroup>
          </SelectContent>
        </Select>
      </Row>
      <Row label="search">
        <Select searchable searchPlaceholder="Search fruit" value="apple">
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <Fruit value="apple" />
            <Fruit value="apricot" />
            <Fruit value="banana" />
          </SelectContent>
        </Select>
      </Row>
      <Row label="clearable">
        <Select cleanable value="apple">
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <Fruit value="apple" />
            <Fruit value="banana" />
          </SelectContent>
        </Select>
      </Row>
      <Row label="invalid">
        <Select invalid value="banana">
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <Fruit value="apple" />
            <Fruit value="banana" />
          </SelectContent>
        </Select>
      </Row>
      <Row label="disabled">
        <Select disabled value="apple">
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <Fruit value="apple" />
            <Fruit value="banana" disabled />
          </SelectContent>
        </Select>
      </Row>
      <Row label="long list">
        <Select placeholder="A long list">
          <SelectTrigger>
            <SelectValue placeholder="A long list" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="fig">Fig</SelectItem>
            <SelectItem value="grape">Grape</SelectItem>
            <SelectItem value="kiwi">Kiwi</SelectItem>
            <SelectItem value="lemon">Lemon</SelectItem>
            <SelectItem value="lime">Lime</SelectItem>
            <SelectItem value="mango">Mango</SelectItem>
            <SelectItem value="melon">Melon</SelectItem>
            <SelectItem value="peach">Peach</SelectItem>
            <SelectItem value="pear">Pear</SelectItem>
            <SelectItem value="plum">Plum</SelectItem>
            <SelectItem value="quince">Quince</SelectItem>
            <SelectItem value="date">Date</SelectItem>
          </SelectContent>
        </Select>
      </Row>
    </Panel>
    <Panel title="Select, open">
      <OpenSlot height={180}>
        <Row label="open">
          <Select open placeholder="Fruit">
            <SelectTrigger>
              <SelectValue placeholder="Fruit" />
            </SelectTrigger>
            <SelectContent>
              <Fruit value="apple" />
              <Fruit value="banana" disabled />
              <Fruit value="cherry" />
            </SelectContent>
          </Select>
        </Row>
      </OpenSlot>
    </Panel>
    <Panel title="Groups, search, empty">
      <OpenSlot height={300}>
        <Row label="groups">
          <Select open searchable searchPlaceholder="Search fruit" placeholder="Fruit">
            <SelectTrigger>
              <SelectValue placeholder="Fruit" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Citrus</SelectLabel>
                <Fruit value="lemon" />
                <Fruit value="lime" />
              </SelectGroup>
              <SelectGroup>
                <SelectLabel>Stone fruit</SelectLabel>
                <Fruit value="peach" />
                <Fruit value="plum" />
              </SelectGroup>
            </SelectContent>
          </Select>
        </Row>
      </OpenSlot>
      <OpenSlot height={160}>
        <Row label="empty">
          <Select open searchable searchPlaceholder="Search fruit" placeholder="Nothing">
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent />
          </Select>
        </Row>
      </OpenSlot>
    </Panel>
    <Panel title="Combobox">
      <Row label="single">
        <Combobox value={["react"]}>
          <ComboboxTrigger>
            <ComboboxValue placeholder="Framework" />
          </ComboboxTrigger>
          <ComboboxContent>
            <ComboboxEmpty>No matches</ComboboxEmpty>
            <ComboboxItem value="react">React</ComboboxItem>
            <ComboboxItem value="vue">Vue</ComboboxItem>
            <ComboboxItem value="svelte" disabled>
              Svelte
            </ComboboxItem>
          </ComboboxContent>
        </Combobox>
      </Row>
      <Row label="multiple">
        <Combobox multiple cleanable value={["react", "vue"]}>
          <ComboboxTrigger>
            <ComboboxValue placeholder="Tags" />
          </ComboboxTrigger>
          <ComboboxContent>
            <ComboboxItem value="react">React</ComboboxItem>
            <ComboboxItem value="vue">Vue</ComboboxItem>
            <ComboboxItem value="solid">Solid</ComboboxItem>
          </ComboboxContent>
        </Combobox>
      </Row>
      <Row label="invalid">
        <Combobox invalid placeholder="Pick one">
          <ComboboxTrigger>
            <ComboboxValue placeholder="Pick one" />
          </ComboboxTrigger>
          <ComboboxContent>
            <ComboboxItem value="react">React</ComboboxItem>
          </ComboboxContent>
        </Combobox>
      </Row>
      <Row label="disabled">
        <Combobox disabled value={["vue"]}>
          <ComboboxTrigger>
            <ComboboxValue placeholder="Framework" />
          </ComboboxTrigger>
          <ComboboxContent>
            <ComboboxItem value="vue">Vue</ComboboxItem>
          </ComboboxContent>
        </Combobox>
      </Row>
    </Panel>
    <Panel title="Combobox, open">
      <OpenSlot height={260}>
        <Row label="open">
          <Combobox open value={["react"]}>
            <ComboboxTrigger>
              <ComboboxValue placeholder="Framework" />
            </ComboboxTrigger>
            <ComboboxContent>
              <ComboboxEmpty>No matches</ComboboxEmpty>
              <ComboboxItem value="react">React</ComboboxItem>
              <ComboboxItem value="vue">Vue</ComboboxItem>
              <ComboboxItem value="svelte" disabled>
                Svelte
              </ComboboxItem>
            </ComboboxContent>
          </Combobox>
        </Row>
      </OpenSlot>
      <OpenSlot height={220}>
        <Row label="empty">
          <Combobox open query="zzz" placeholder="Framework">
            <ComboboxTrigger>
              <ComboboxValue placeholder="Framework" />
            </ComboboxTrigger>
            <ComboboxContent>
              <ComboboxEmpty>No matches</ComboboxEmpty>
              <ComboboxItem value="react">React</ComboboxItem>
              <ComboboxItem value="vue">Vue</ComboboxItem>
            </ComboboxContent>
          </Combobox>
        </Row>
      </OpenSlot>
    </Panel>
  </Page>
));
