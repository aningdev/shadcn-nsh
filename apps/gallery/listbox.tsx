import { mount, signal } from "nsh";
import { Window } from "nsh/desktop";

// Family 4: select and combobox — representative states with the port API.
import { ComboToggle, Combobox, ListboxEmpty, OptionRow, Picker, Select } from "../../packages/ui";
import { Page, Panel, Row } from "./demo-kit";

Window.get("main")?.setBounds({ size: { width: 680, height: 900 }, animated: false });

const FRUITS = [
  { value: "apple", title: "Apple" },
  { value: "banana", title: "Banana", disabled: true },
  { value: "cherry", title: "Cherry" },
];
const FRAMES = [
  { value: "react", title: "React" },
  { value: "vue", title: "Vue" },
  { value: "svelte", title: "Svelte", disabled: true },
];

const titleOf = (items: typeof FRUITS, value: string | null) =>
  items.find((i) => i.value === value)?.title;

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
            items={FRUITS}
            value={fruit()}
            open={fruitOpen()}
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
        </Row>
        <Row label="placeholder">
          <Select
            items={FRUITS}
            open={pickOpen()}
            trigger={<Picker title="Fruit" placeholder open={pickOpen()} />}
            renderItem={(item) => <OptionRow item={item} />}
          />
        </Row>
      </Panel>
      <Panel title="Combobox">
        <Row label="multiple">
          <Combobox
            multiple
            items={FRAMES}
            value={tags()}
            open={comboOpen()}
            filled={tags().length > 0}
            placeholder="Framework"
            onChange={({ value }) => tags.set(value)}
            triggerButton={<ComboToggle open={comboOpen()} />}
            renderItem={(item) => <OptionRow item={item} />}
            empty={<ListboxEmpty label="No matches" />}
          />
        </Row>
      </Panel>
    </Page>
  );
});
