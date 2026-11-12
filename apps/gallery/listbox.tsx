import { mount, signal } from "nsh";
import { Window } from "nsh/desktop";

// Family 4: select and combobox — representative states with the port API.
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxTrigger,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../packages/ui";
import { Page, Panel, Row } from "./demo-kit";

Window.get("main")?.setBounds({ size: { width: 680, height: 900 }, animated: false });

mount(() => {
  const fruit = signal<string | null>("apple");
  const fruitOpen = signal(true);
  const tags = signal<string[]>(["react", "vue"]);
  const comboOpen = signal(false);
  const pickOpen = signal(true);

  return (
    <Page>
      <Panel title="Select">
        <Row label="value">
          <Select
            value={fruit()}
            open={fruitOpen()}
            onChange={({ value }) => fruit.set(value)}
            onOpenChange={({ open }) => fruitOpen.set(open)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Fruit" />
            </SelectTrigger>
            <SelectContent accessibilityLabel="Fruit">
              <SelectItem value="apple">Apple</SelectItem>
              <SelectItem value="banana" disabled>
                Banana
              </SelectItem>
              <SelectItem value="cherry">Cherry</SelectItem>
            </SelectContent>
          </Select>
        </Row>
        <Row label="placeholder">
          <Select value={null} open={pickOpen()} onOpenChange={({ open }) => pickOpen.set(open)}>
            <SelectTrigger>
              <SelectValue placeholder="Fruit" />
            </SelectTrigger>
            <SelectContent accessibilityLabel="Fruit">
              <SelectItem value="apple">Apple</SelectItem>
              <SelectItem value="banana" disabled>
                Banana
              </SelectItem>
              <SelectItem value="cherry">Cherry</SelectItem>
            </SelectContent>
          </Select>
        </Row>
      </Panel>
      <Panel title="Combobox">
        <Row label="multiple">
          <Combobox
            multiple
            value={tags()}
            open={comboOpen()}
            placeholder="Framework"
            onChange={({ value }) => tags.set(value)}
            onOpenChange={({ open }) => comboOpen.set(open)}
          >
            <ComboboxTrigger />
            <ComboboxContent accessibilityLabel="Framework">
              <ComboboxItem value="react">React</ComboboxItem>
              <ComboboxItem value="vue">Vue</ComboboxItem>
              <ComboboxItem value="svelte" disabled>
                Svelte
              </ComboboxItem>
              <ComboboxEmpty>No matches</ComboboxEmpty>
            </ComboboxContent>
          </Combobox>
        </Row>
      </Panel>
    </Page>
  );
});
