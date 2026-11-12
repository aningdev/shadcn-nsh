import { mount, signal } from "nsh";

import { Checkbox } from "@/packages/ui/checkbox";
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
          {...listRow({ first: true })}
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
          {...listRow({ start: controlSize.control + controlSize.gap })}
        >
          <RowDivider show />
          <RowLabel label={items[0].label} detail={items[0].detail} />
        </Checkbox>
        <Checkbox
          checked={selected().includes("documents")}
          onChange={({ checked }) => toggle("documents", checked)}
          {...listRow({ start: controlSize.control + controlSize.gap })}
        >
          <RowDivider show />
          <RowLabel label={items[1].label} detail={items[1].detail} />
        </Checkbox>
        <Checkbox
          checked={selected().includes("messages")}
          onChange={({ checked }) => toggle("messages", checked)}
          {...listRow({ start: controlSize.control + controlSize.gap })}
        >
          <RowDivider show />
          <RowLabel label={items[2].label} detail={items[2].detail} />
        </Checkbox>
      </DemoCard>

      <DemoCard>
        <DemoSection title="Scale">
          <Checkbox scale={0.8} checked>
            Small
          </Checkbox>
          <Checkbox checked={alone()} onChange={({ checked }) => alone.set(checked)}>
            Regular
          </Checkbox>
          <Checkbox scale={1.25} checked>
            Large
          </Checkbox>
        </DemoSection>
        <DemoSection title="Round">
          <Checkbox round checked>
            Round
          </Checkbox>
          <Checkbox round>Off</Checkbox>
        </DemoSection>
        <DemoSection title="States">
          <Checkbox checked>Checked</Checkbox>
          <Checkbox indeterminate>Indeterminate</Checkbox>
          <Checkbox>Off</Checkbox>
          <Checkbox checked disabled>
            Disabled
          </Checkbox>
          <Checkbox disabled>Disabled</Checkbox>
        </DemoSection>
      </DemoCard>
    </DemoPage>
  );
}

mount(App);
