import { selectTheme } from "@shadcn-nsh/theme";
import { mount, signal, Text, View } from "nsh";

import appleTheme from "../../../packages/theme/themes/apple/index";
import {
  Button,
  DatePicker,
  DatePickerContent,
  DatePickerTrigger,
  pickerLook,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../packages/ui";

const PALETTES = [
  { value: "default", label: "Default" },
  { value: "apple", label: "Apple" },
];

function App() {
  const palette = signal<string | null>("default");
  const pickedDate = signal<string | null>(null);
  const fruit = signal<string | null>(null);
  const due = signal<string | null>(null);
  const selectHeight = () => pickerLook().style.height;

  const choose = (val: string | null) => {
    palette.set(val);
    if (val === "apple") {
      void Promise.resolve().then(() => selectTheme(appleTheme));
    } else {
      selectTheme(null);
    }
  };

  return (
    <View style={{ gap: 8, padding: 12 }}>
      <Text>{`line=${selectHeight()}`}</Text>
      <Button onPress={() => selectTheme(appleTheme)}>Apply Apple</Button>
      <Button onPress={() => selectTheme(null)}>Apply Default</Button>

      <Select value={palette()} onChange={({ value }) => choose(value)}>
        <SelectTrigger>
          <SelectValue placeholder="Theme" />
        </SelectTrigger>
        <SelectContent accessibilityLabel="Theme picker">
          <Each of={PALETTES}>
            {(entry) => <SelectItem value={entry().value}>{entry().label}</SelectItem>}
          </Each>
        </SelectContent>
      </Select>

      <DatePicker
        value={pickedDate()}
        onChange={({ value }) => {
          pickedDate.set(typeof value === "string" ? value : null);
          void Promise.resolve().then(() => selectTheme(appleTheme));
        }}
      >
        <DatePickerTrigger accessibilityLabel="Switch via date" style={{ width: 200 }} />
        <DatePickerContent accessibilityLabel="Switch via date" />
      </DatePicker>

      <Select value={fruit()} onChange={({ value }) => fruit.set(value)}>
        <SelectTrigger testID="fruit" accessibilityLabel="Fruit" style={{ width: 200 }}>
          <SelectValue placeholder="Pick fruit" />
        </SelectTrigger>
        <SelectContent accessibilityLabel="Fruit">
          <SelectItem value="newest">Newest</SelectItem>
          <SelectItem value="oldest">Oldest</SelectItem>
        </SelectContent>
      </Select>

      <DatePicker
        value={due()}
        onChange={({ value }) => due.set(typeof value === "string" ? value : null)}
      >
        <DatePickerTrigger testID="due" accessibilityLabel="Due date" style={{ width: 200 }} />
        <DatePickerContent accessibilityLabel="Due date" />
      </DatePicker>
    </View>
  );
}

mount(App);
