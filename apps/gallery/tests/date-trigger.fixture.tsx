import { mount, signal, Text, View } from "nsh";

import { DatePicker, DatePickerContent, DatePickerTrigger } from "../../../packages/ui";

function App() {
  const due = signal("2031-06-10");
  const open = signal(false);
  return (
    <View style={{ gap: 8, padding: 12 }}>
      <DatePicker value={due()} open={open()} onOpenChange={({ open: next }) => open.set(next)}>
        <DatePickerTrigger testID="due-date" accessibilityLabel="Due date" />
        <DatePickerContent />
      </DatePicker>
      <Text>due={due()}</Text>
    </View>
  );
}

mount(App);
