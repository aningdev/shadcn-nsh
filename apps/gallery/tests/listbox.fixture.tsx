import { mount, platform, signal, Text, View } from "nsh";

import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxContent,
  ComboboxItem,
  ComboboxTrigger,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  comboboxLook,
  listboxPopup,
  pickerLook,
  sliderFill,
  sliderLook,
} from "../../../packages/ui";

/** A style edge as the fixture prints it: the percentage, or `native` when the fill leaves it unset. */
function edge(value: unknown): string {
  return typeof value === "string" ? value : "native";
}

function popupChrome() {
  const p = listboxPopup();
  if (platform.desktop) {
    return `popup|${p.padding}|none`;
  }
  return `sheet|${p.borderTopLeftRadius}|${p.borderTopRightRadius}|${p.maxHeight}|${p.paddingHorizontal}|${p.paddingBottom}`;
}

function App() {
  const fruit = signal<string | null>(null);
  const one = signal<string | null>(null);
  const tags = signal<string[]>([]);
  const tagged = signal<string[]>(["red"]);
  const locked = signal<string[]>(["blue"]);
  const frameworkOpen = signal(false);
  const tagsOpen = signal(false);
  const selectLook = pickerLook({ open: () => false });
  const comboLook = comboboxLook(() => frameworkOpen());
  const rowH = platform.desktop ? 30 : 44;
  return (
    <View style={{ gap: 8, padding: 12 }}>
      <Select value={fruit()} onChange={({ value }) => fruit.set(value)}>
        <SelectTrigger testID="fruit" accessibilityLabel="Fruit">
          <SelectValue placeholder="Fruit" />
        </SelectTrigger>
        <SelectContent accessibilityLabel="Fruit">
          <SelectItem value="apple">Apple pie</SelectItem>
          <SelectItem value="banana" disabled>
            Banana
          </SelectItem>
          <SelectItem value="cherry">Cherry</SelectItem>
        </SelectContent>
      </Select>
      <Text>value={fruit() ?? ""}</Text>
      <Combobox
        value={one()}
        onChange={({ value }) => one.set(value)}
        onOpenChange={({ open }) => frameworkOpen.set(open)}
      >
        <ComboboxTrigger testID="framework" accessibilityLabel="Show frameworks" />
        <ComboboxContent accessibilityLabel="Framework">
          <ComboboxItem value="react">React</ComboboxItem>
          <ComboboxItem value="vue">Vue</ComboboxItem>
        </ComboboxContent>
      </Combobox>
      <Text>combo={one() ?? ""}</Text>
      <Combobox
        multiple
        value={tags()}
        onChange={({ value }) => tags.set(value)}
        onOpenChange={({ open }) => tagsOpen.set(open)}
      >
        <ComboboxTrigger testID="tags" />
        <ComboboxContent>
          <ComboboxItem value="red">Red</ComboboxItem>
          <ComboboxItem value="blue">Blue</ComboboxItem>
        </ComboboxContent>
      </Combobox>
      <Text>tags={tags().join("+")}</Text>
      <Combobox multiple value={tagged()} onChange={({ value }) => tagged.set(value)}>
        <ComboboxChips />
        <ComboboxTrigger testID="tagged" />
        <ComboboxContent accessibilityLabel="Tagged">
          <ComboboxItem value="red">Red</ComboboxItem>
          <ComboboxItem value="blue">Blue</ComboboxItem>
        </ComboboxContent>
      </Combobox>
      <Text>chips={tagged().join("+")}</Text>
      <Combobox multiple defaultValue={["green"]}>
        <ComboboxChips />
        <ComboboxContent accessibilityLabel="Plain">
          <ComboboxItem value="green">Green</ComboboxItem>
          <ComboboxItem value="cyan">Cyan</ComboboxItem>
        </ComboboxContent>
      </Combobox>
      <Combobox multiple disabled value={locked()}>
        <ComboboxChips>
          {(value) => (
            <ComboboxChip value={value}>{value === "blue" ? "Blue" : value}</ComboboxChip>
          )}
        </ComboboxChips>
        <ComboboxContent accessibilityLabel="Locked">
          <ComboboxItem value="blue">Blue</ComboboxItem>
        </ComboboxContent>
      </Combobox>
      <Text>desktop={String(platform.desktop)}</Text>
      <Text>
        select-size={selectLook.style.height}|{selectLook.style.minWidth ?? 0}|{rowH}
      </Text>
      <Text>
        combo-size={comboLook.style.height ?? comboLook.style.minHeight}|{rowH}
      </Text>
      <View style={{ width: 96 }}>
        <Select value="apple">
          <SelectTrigger style={{ width: 96 }}>
            <SelectValue placeholder="Fruit" />
          </SelectTrigger>
          <SelectContent accessibilityLabel="Narrow fruit">
            <SelectItem value="apple">Narrow apple</SelectItem>
          </SelectContent>
        </Select>
      </View>
      <Combobox multiple value={["side"]}>
        <ComboboxChip value="side">Side</ComboboxChip>
        <ComboboxContent accessibilityLabel="Sibling">
          <ComboboxItem value="side">Side</ComboboxItem>
        </ComboboxContent>
      </Combobox>
      <Text>{`slider-fill=${edge(sliderFill(0.5, 0, true).bottom)}|${edge(sliderFill(0.5, 0, true).top)}|${edge(sliderFill(0, 0.4).left)}|${sliderLook({ vertical: true, value: true }).class ?? ""}`}</Text>
      <Text>popup={popupChrome()}</Text>
      <Select value="apple">
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="apple">Apple pie</SelectItem>
        </SelectContent>
      </Select>
      <Text>tags-state={tagsOpen() ? "open" : "closed"}</Text>
    </View>
  );
}

mount(() => <App />);
