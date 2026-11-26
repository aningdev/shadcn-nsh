import { selectTheme } from "@shadcn-nsh/theme";
import { mount, signal, Text, View } from "nsh";

import materialTheme from "../../../packages/theme/themes/material/index";
import {
  Button,
  DatePicker,
  DatePickerContent,
  DatePickerTrigger,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../packages/ui";
import { controlSize } from "../../../packages/ui/lib/surface";

const PALETTES = [
  { value: "nsh-gallery", label: "NSH Gallery" },
  { value: "material", label: "Material" },
];

function App() {
  const palette = signal<string | null>("nsh-gallery");
  const pickedDate = signal<string | null>(null);
  const fruit = signal<string | null>(null);
  const due = signal<string | null>(null);
  const selectHeight = () => controlSize.line;

  const choose = (val: string | null) => {
    palette.set(val);
    if (val === "material") {
      void Promise.resolve().then(() => selectTheme(materialTheme));
    } else {
      selectTheme(null);
    }
  };

  return (
    <View style={{ gap: 8, padding: 12 }}>
      <Text>{`height=${selectHeight()}`}</Text>
      <Button onPress={() => selectTheme(materialTheme)}>Apply Material</Button>
      <Button onPress={() => selectTheme(null)}>Apply NSH Gallery</Button>

      <Select value={palette()} onChange={({ value }) => choose(value)}>
        <SelectTrigger style={{ height: controlSize.line }}>
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
          void Promise.resolve().then(() => selectTheme(materialTheme));
        }}
      >
        <DatePickerTrigger
          accessibilityLabel="Switch via date"
          style={{ width: 200, height: controlSize.line }}
        />
        <DatePickerContent accessibilityLabel="Switch via date" />
      </DatePicker>

      <Select value={fruit()} onChange={({ value }) => fruit.set(value)}>
        <SelectTrigger
          testID="fruit"
          accessibilityLabel="Fruit"
          style={{ width: 200, height: controlSize.line }}
        >
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
        <DatePickerTrigger
          testID="due"
          accessibilityLabel="Due date"
          style={{ width: 200, height: controlSize.line }}
        />
        <DatePickerContent accessibilityLabel="Due date" />
      </DatePicker>
    </View>
  );
}

mount(App);
