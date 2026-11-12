import { mount, platform, signal, Text, View } from "nsh";

import {
  Combobox,
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
} from "../../../packages/ui";

function popupChrome() {
  const p = listboxPopup();
  if (platform.desktop) {
    return `popup|${p.padding}|none`;
  }
  return `sheet|${p.borderTopLeftRadius}|${p.borderTopRightRadius}|${p.maxHeight}|${p.paddingHorizontal}|${p.paddingBottom}`;
}

function App() {
  const fruit = signal<string | null>(null);
  const one = signal<string[]>([]);
  const tags = signal<string[]>([]);
  const frameworkOpen = signal(false);
  const tagsOpen = signal(false);
  const selectLook = pickerLook({ open: () => false });
  const comboLook = comboboxLook(() => frameworkOpen());
  const rowH = platform.desktop ? 30 : 44;
  return (
    <View style={{ gap: 8, padding: 12 }}>
      <Select value={fruit()} onChange={({ value }) => fruit.set(value)}>
        <SelectTrigger>
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
        <ComboboxTrigger testID="framework" />
        <ComboboxContent accessibilityLabel="Framework">
          <ComboboxItem value="react">React</ComboboxItem>
          <ComboboxItem value="vue">Vue</ComboboxItem>
        </ComboboxContent>
      </Combobox>
      <Text>combo={one().join(",")}</Text>
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
      <Text>desktop={String(platform.desktop)}</Text>
      <Text>
        select-size={selectLook.style.height}|{selectLook.style.minWidth ?? 0}|{rowH}
      </Text>
      <Text>
        combo-size={comboLook.style.height ?? comboLook.style.minHeight}|{rowH}
      </Text>
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
