// The reference of `checkbox.tsx`: the look spread on `nsh/base`'s Checkbox, as upstream writes it.
import { mount, signal, Text } from "nsh";
import { Checkbox } from "nsh/base";

import { CheckboxMark, checkboxLook } from "@/packages/ui/checkbox";
import { controlSize, listRow, RowDivider, RowLabel } from "@/packages/ui/lib/surface";

import { DemoCard, DemoPage, DemoSection } from "./kit";

const items = [
  { id: "photos", label: "Photos", detail: "2,418 items · 6.1 GB" },
  { id: "documents", label: "Documents", detail: "312 files · 840 MB" },
  { id: "messages", label: "Messages", detail: "Attachments included · 1.2 GB" },
] as const;

function App() {
  const selected = signal<string[]>(["photos"]);
  const alone = signal(true);
  const all = () => selected().length === items.length;
  const some = () => selected().length > 0 && !all();
  const toggle = (id: string, checked: boolean) =>
    selected.set(checked ? [...selected(), id] : selected().filter((x) => x !== id));

  return (
    <DemoPage
      title="Checkbox"
      note={() => `${selected().length} of ${items.length} · alone ${String(alone())}`}
    >
      <DemoCard style={{ gap: 0 }}>
        <Checkbox
          checked={all()}
          indeterminate={some()}
          onChange={({ checked }) => selected.set(checked ? items.map((i) => i.id) : [])}
          class="group"
          {...listRow({ first: true })}
          {...checkboxLook()}
          indicator={<CheckboxMark mark={all() ? "check" : some() ? "dash" : null} />}
        >
          <RowLabel
            label="Back up everything"
            detail={`${selected().length} of ${items.length} selected`}
            strong
          />
        </Checkbox>
        <Checkbox
          checked={selected().includes("photos")}
          onChange={({ checked }) => toggle("photos", checked)}
          class="group"
          {...listRow({ start: controlSize.control + controlSize.gap })}
          {...checkboxLook()}
          indicator={<CheckboxMark mark={selected().includes("photos") ? "check" : null} />}
        >
          <RowDivider show />
          <RowLabel label={items[0].label} detail={items[0].detail} />
        </Checkbox>
        <Checkbox
          checked={selected().includes("documents")}
          onChange={({ checked }) => toggle("documents", checked)}
          class="group"
          {...listRow({ start: controlSize.control + controlSize.gap })}
          {...checkboxLook()}
          indicator={<CheckboxMark mark={selected().includes("documents") ? "check" : null} />}
        >
          <RowDivider show />
          <RowLabel label={items[1].label} detail={items[1].detail} />
        </Checkbox>
        <Checkbox
          checked={selected().includes("messages")}
          onChange={({ checked }) => toggle("messages", checked)}
          class="group"
          {...listRow({ start: controlSize.control + controlSize.gap })}
          {...checkboxLook()}
          indicator={<CheckboxMark mark={selected().includes("messages") ? "check" : null} />}
        >
          <RowDivider show />
          <RowLabel label={items[2].label} detail={items[2].detail} />
        </Checkbox>
      </DemoCard>

      <DemoCard>
        <DemoSection title="Scale">
          <Checkbox
            class="group"
            checked
            {...checkboxLook({ scale: 0.8 })}
            indicator={<CheckboxMark mark="check" scale={0.8} />}
          >
            <Text>Small</Text>
          </Checkbox>
          <Checkbox
            class="group"
            checked={alone()}
            onChange={({ checked }) => alone.set(checked)}
            {...checkboxLook()}
            indicator={<CheckboxMark mark={alone() ? "check" : null} />}
          >
            <Text>Regular</Text>
          </Checkbox>
          <Checkbox
            class="group"
            checked
            {...checkboxLook({ scale: 1.25 })}
            indicator={<CheckboxMark mark="check" scale={1.25} />}
          >
            <Text>Large</Text>
          </Checkbox>
        </DemoSection>
        <DemoSection title="Round">
          <Checkbox
            class="group"
            checked
            {...checkboxLook({ round: true })}
            indicator={<CheckboxMark mark="check" round />}
          >
            <Text>Round</Text>
          </Checkbox>
          <Checkbox
            class="group"
            {...checkboxLook({ round: true })}
            indicator={<CheckboxMark mark={null} round />}
          >
            <Text>Off</Text>
          </Checkbox>
        </DemoSection>
        <DemoSection title="States">
          <Checkbox
            class="group"
            checked
            {...checkboxLook()}
            indicator={<CheckboxMark mark="check" />}
          >
            <Text>Checked</Text>
          </Checkbox>
          <Checkbox
            class="group"
            indeterminate
            {...checkboxLook()}
            indicator={<CheckboxMark mark="dash" />}
          >
            <Text>Indeterminate</Text>
          </Checkbox>
          <Checkbox class="group" {...checkboxLook()} indicator={<CheckboxMark mark={null} />}>
            <Text>Off</Text>
          </Checkbox>
          <Checkbox
            class="group"
            checked
            disabled
            {...checkboxLook({ disabled: true })}
            indicator={<CheckboxMark mark="check" />}
          >
            <Text>Disabled</Text>
          </Checkbox>
          <Checkbox
            class="group"
            disabled
            {...checkboxLook({ disabled: true })}
            indicator={<CheckboxMark mark={null} />}
          >
            <Text>Disabled</Text>
          </Checkbox>
        </DemoSection>
      </DemoCard>
    </DemoPage>
  );
}

mount(App);
