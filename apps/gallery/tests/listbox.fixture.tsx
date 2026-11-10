import {
  Combobox,
  ComboboxContent,
  ComboboxItem,
  ComboboxTrigger,
  ComboboxValue,
  comboboxVariants,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  selectPopupChrome,
  selectVariants,
} from "@shadcn-nsh/ui";
import { mount, platform, signal, Text, View } from "nsh";

function App() {
  const fruit = signal<string | null>(null);
  const one = signal<string[]>([]);
  const tags = signal<string[]>([]);
  const select = selectVariants();
  const combo = comboboxVariants();
  return (
    <View style={{ gap: 8, padding: 12 }}>
      <Select accessibilityLabel="Fruit" value={fruit()} onChange={({ value }) => fruit.set(value)}>
        <SelectTrigger testID="fruit">
          <SelectValue placeholder="Fruit" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="apple">Apple</SelectItem>
          <SelectItem value="banana" disabled>
            Banana
          </SelectItem>
          <SelectItem value="cherry">Cherry</SelectItem>
        </SelectContent>
      </Select>
      <Text>value={fruit() ?? ""}</Text>
      <Combobox
        accessibilityLabel="Framework"
        value={one()}
        onChange={({ value }) => one.set(value)}
      >
        <ComboboxTrigger testID="framework">
          <ComboboxValue placeholder="Framework" />
        </ComboboxTrigger>
        <ComboboxContent>
          <ComboboxItem value="react">React</ComboboxItem>
          <ComboboxItem value="vue">Vue</ComboboxItem>
        </ComboboxContent>
      </Combobox>
      <Text>combo={one().join(",")}</Text>
      <Combobox multiple value={tags()} onChange={({ value }) => tags.set(value)}>
        <ComboboxTrigger testID="tags">
          <ComboboxValue placeholder="Tags" />
        </ComboboxTrigger>
        <ComboboxContent>
          <ComboboxItem value="red">Red</ComboboxItem>
          <ComboboxItem value="blue">Blue</ComboboxItem>
        </ComboboxContent>
      </Combobox>
      <Text>tags={tags().join("+")}</Text>
      <Text>desktop={String(platform.desktop)}</Text>
      <Text>
        select-size={select.style.minHeight}|{select.style.minWidth ?? 0}|{select.rowMinHeight}
      </Text>
      <Text>
        combo-size={combo.style.minHeight}|{combo.rowMinHeight}
      </Text>
      <Text>popup={selectPopupChrome()}</Text>
      <Select value="apple">
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="apple">Apple pie</SelectItem>
        </SelectContent>
      </Select>
    </View>
  );
}

mount(() => <App />);
