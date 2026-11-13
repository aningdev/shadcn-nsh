// The reference of `select.tsx`: the same scene as upstream writes it, the listbox look
// (`listboxProps`, `Picker`, `OptionRow`) spread on `nsh/base`'s Select. The render check requires
// the two to draw the same pixels.
import { colors } from "@shadcn-nsh/theme";
import type { JSX } from "nsh";
import { mount, signal, Text, View } from "nsh";
import { Button, Select, Switch } from "nsh/base";

import { buttonLabel, buttonLook } from "@/packages/ui/button";
import { listRow, RowLabel, sectionSurface } from "@/packages/ui/lib/surface";
import {
  clearButtonLook,
  ListboxEmpty,
  ListboxHeader,
  listboxProps,
  listboxSearch,
  OptionRow,
  Picker,
} from "@/packages/ui/select";
import { switchLook } from "@/packages/ui/switch";

import { DemoPage } from "./kit";
import { desktop, Log, Panel, Split } from "./stage";

const LANGUAGES = [
  { value: "en", title: "English" },
  { value: "de", title: "Deutsch" },
  { value: "es", title: "Español" },
  { value: "fr", title: "Français" },
  { value: "it", title: "Italiano" },
  { value: "nl", title: "Nederlands" },
  { value: "pl", title: "Polski" },
  { value: "pt", title: "Português" },
  { value: "sv", title: "Svenska" },
  { value: "tr", title: "Türkçe" },
  { value: "ja", title: "日本語" },
  { value: "ko", title: "한국어" },
  { value: "zh", title: "中文" },
];

const REGIONS = [
  { value: "us-east-1", title: "US East (Virginia)", group: "Americas" },
  { value: "us-west-2", title: "US West (Oregon)", group: "Americas" },
  { value: "ca-central-1", title: "Canada (Montréal)", group: "Americas" },
  { value: "sa-east-1", title: "South America (São Paulo)", group: "Americas" },
  { value: "eu-west-1", title: "Europe (Ireland)", group: "Europe" },
  { value: "eu-central-1", title: "Europe (Frankfurt)", group: "Europe" },
  { value: "eu-north-1", title: "Europe (Stockholm)", group: "Europe" },
  { value: "ap-northeast-1", title: "Asia Pacific (Tokyo)", group: "Asia Pacific" },
  { value: "ap-northeast-2", title: "Asia Pacific (Seoul)", group: "Asia Pacific", disabled: true },
  { value: "ap-southeast-1", title: "Asia Pacific (Singapore)", group: "Asia Pacific" },
  { value: "ap-east-1", title: "Asia Pacific (Hong Kong)", group: "Asia Pacific" },
  { value: "ap-southeast-2", title: "Asia Pacific (Sydney)", group: "Asia Pacific" },
];

const titleOf = (items: { value: string; title: string }[], value: string | null) =>
  items.find((i) => i.value === value)?.title;

/** A trigger's width: set with a pointer, the field's on a touch screen. */
const trigger = desktop ? { width: 260 } : undefined;

/** A label over its control, a quieter line under the label. */
function Field(props: { label: string; detail: string; children: JSX.Element }) {
  return (
    <View style={{ gap: 8 }}>
      <View style={{ gap: 2 }}>
        <Text style={{ fontSize: 13, fontWeight: "500", color: colors.text }}>{props.label}</Text>
        <Text style={{ fontSize: 12, color: colors.muted }}>{props.detail}</Text>
      </View>
      {props.children}
    </View>
  );
}

function App() {
  const language = signal<string | null>("en");
  const outline = signal<string | null>("de");
  const region = signal<string | null>(null);
  const languageOpen = signal(false);
  const regionOpen = signal(false);
  const locked = signal(false);
  const events = signal<string[]>([]);
  const log = (line: string) => events.set([line, ...events()].slice(0, 8));
  const opened =
    (name: string, set: (next: boolean) => void) =>
    ({ open, reason }: { open: boolean; reason: string }) => {
      set(open);
      log(`${name} ${open ? "opened" : "closed"} · ${reason}`);
    };

  return (
    <DemoPage title="Select">
      <Text style={{ color: colors.muted }}>
        {desktop
          ? "Click a select, or Tab to it and press Down; type a letter to jump"
          : "Tap a select to choose from a sheet"}
      </Text>

      <Split
        gap={14}
        inspector={
          <>
            <Panel title="value">
              <Text style={{ fontSize: 13, color: colors.text, fontVariant: ["tabular-nums"] }}>
                {`language ${language() ?? "null"}`}
              </Text>
              <Text style={{ fontSize: 13, color: colors.text, fontVariant: ["tabular-nums"] }}>
                {`region ${region() ?? "null"}`}
              </Text>
              <Button
                disabled={region() === null}
                onPress={() => {
                  region.set(null);
                  log("Region cleared");
                }}
                {...buttonLook("secondary", {
                  size: "small",
                  disabled: () => region() === null,
                  style: { marginTop: 6 },
                })}
              >
                <Text
                  style={buttonLabel("secondary", {
                    size: "small",
                    disabled: () => region() === null,
                  })}
                >
                  Clear region
                </Text>
              </Button>
              <Switch
                checked={locked()}
                onChange={({ checked }) => locked.set(checked)}
                {...listRow({ first: true, style: { flexDirection: "row-reverse", marginTop: 4 } })}
                {...switchLook(() => locked())}
              >
                <RowLabel label="Region disabled" />
              </Switch>
            </Panel>
            <Log title="onChange · onOpenChange" lines={events()} minHeight={120} />
          </>
        }
      >
        <View style={{ ...sectionSurface({ padded: true }), gap: 20 }}>
          <Field
            label="Language"
            detail={
              desktop
                ? "Typing a letter on the trigger chooses by title"
                : "Thirteen languages in a sheet"
            }
          >
            <Select
              items={LANGUAGES}
              value={language()}
              onChange={({ value: next }) => {
                language.set(next);
                log(`Language → ${titleOf(LANGUAGES, next)}`);
              }}
              onOpenChange={opened("Language", (next) => languageOpen.set(next))}
              placeholder="Choose a language"
              accessibilityLabel="Language"
              {...listboxProps()}
              trigger={
                <Picker
                  title={titleOf(LANGUAGES, language()) ?? "Choose a language"}
                  placeholder={language() === null}
                  open={languageOpen()}
                  kind="field"
                  style={trigger}
                />
              }
              renderItem={(item) => <OptionRow item={item} />}
            />
          </Field>
          <Field label="Region" detail="Search by name; one region is at capacity">
            <Select
              items={REGIONS}
              value={region()}
              disabled={locked()}
              cleanable
              onChange={({ value: next }) => {
                region.set(next);
                log(next === null ? "Region cleared" : `Region → ${titleOf(REGIONS, next)}`);
              }}
              onOpenChange={opened("Region", (next) => regionOpen.set(next))}
              placeholder="Choose a region"
              accessibilityLabel="Region"
              searchable
              searchPlaceholder="Search regions"
              searchAccessibilityLabel="Search regions"
              empty={<ListboxEmpty label="No region matches" />}
              clearButtonAccessibilityLabel="Clear the region"
              renderItem={(item) => (
                <OptionRow item={item} note={item.disabled ? "At capacity" : item.value} />
              )}
              renderGroup={(group) => <ListboxHeader group={group} />}
              style={trigger}
              {...listboxSearch()}
              {...clearButtonLook({ over: true })}
              {...listboxProps({ minWidth: 340 })}
              trigger={
                <Picker
                  title={titleOf(REGIONS, region()) ?? "Choose a region"}
                  placeholder={region() === null}
                  open={regionOpen()}
                  disabled={locked()}
                  clearable
                  kind="field"
                  style={trigger}
                />
              }
            />
          </Field>
          <Field label="Language, outline" detail="The same list on an outline trigger">
            <Select
              items={LANGUAGES}
              value={outline()}
              onChange={({ value: next }) => {
                outline.set(next);
                log(`Outline → ${titleOf(LANGUAGES, next)}`);
              }}
              placeholder="Choose a language"
              accessibilityLabel="Language, outline"
              {...listboxProps()}
              trigger={
                <Picker
                  title={titleOf(LANGUAGES, outline()) ?? "Choose a language"}
                  placeholder={outline() === null}
                  open={false}
                  kind="outline"
                  style={trigger}
                />
              }
              renderItem={(item) => <OptionRow item={item} />}
            />
          </Field>
        </View>
      </Split>
    </DemoPage>
  );
}

mount(App);
