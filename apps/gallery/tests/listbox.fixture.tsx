import { mount, platform, signal, Text, View } from "nsh";

import {
  ComboToggle,
  Combobox,
  OptionRow,
  Picker,
  Select,
  comboboxLook,
  listboxPopup,
  pickerLook,
} from "../../../packages/ui";

const FRUITS = [
  { value: "apple", title: "Apple pie" },
  { value: "banana", title: "Banana", disabled: true },
  { value: "cherry", title: "Cherry" },
];
const FRAMES = [
  { value: "react", title: "React" },
  { value: "vue", title: "Vue" },
];
const TAGS = [
  { value: "red", title: "Red" },
  { value: "blue", title: "Blue" },
];

const titleOf = (items: { value: string; title: string }[], value: string | null) =>
  items.find((i) => i.value === value)?.title;

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
  const fruitOpen = signal(false);
  const frameworkOpen = signal(false);
  const tagsOpen = signal(false);
  const selectLook = pickerLook({ open: () => fruitOpen() });
  const comboLook = comboboxLook(() => frameworkOpen());
  const rowH = platform.desktop ? 30 : 44;
  return (
    <View style={{ gap: 8, padding: 12 }}>
      <Select
        items={FRUITS}
        accessibilityLabel="Fruit"
        value={fruit()}
        onChange={({ value }) => fruit.set(value)}
        trigger={
          <Picker
            title={titleOf(FRUITS, fruit()) ?? "Fruit"}
            placeholder={fruit() === null}
            open={fruitOpen()}
          />
        }
        renderItem={(item) => <OptionRow item={item} />}
      />
      <Text>value={fruit() ?? ""}</Text>
      <Combobox
        items={FRAMES}
        accessibilityLabel="Framework"
        value={one()}
        onChange={({ value }) => one.set(value)}
        triggerButton={<ComboToggle id="framework" open={frameworkOpen()} />}
        renderItem={(item) => <OptionRow item={item} />}
      />
      <Text>combo={one().join(",")}</Text>
      <Combobox
        multiple
        items={TAGS}
        value={tags()}
        onChange={({ value }) => tags.set(value)}
        triggerButton={<ComboToggle id="tags" open={tagsOpen()} />}
        renderItem={(item) => <OptionRow item={item} />}
      />
      <Text>tags={tags().join("+")}</Text>
      <Text>desktop={String(platform.desktop)}</Text>
      <Text>
        select-size={selectLook.style.height}|{selectLook.style.minWidth ?? 0}|{rowH}
      </Text>
      <Text>
        combo-size={comboLook.style.height ?? comboLook.style.minHeight}|{rowH}
      </Text>
      <Text>popup={popupChrome()}</Text>
      <Select
        items={[{ value: "apple", title: "Apple pie" }]}
        value="apple"
        trigger={<Picker title="Apple pie" open={false} placeholder={false} />}
        renderItem={(item) => <OptionRow item={item} />}
      />
    </View>
  );
}

mount(() => <App />);
