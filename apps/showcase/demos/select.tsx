import { colors, toneColor, type Tone } from "@shadcn-nsh/theme";
// Select: the official gallery's four scenes (`references/nsh/examples/gallery/demos/Controls.tsx`,
// `Choices`, `Downloads`, `Shipping`, `Issue`) with this library's parts — a sort order, fonts in
// sections with search, countries by region with flags, and a status whose dot follows it beside a
// team that is required.
import { ArrowDown, Archive, Check, File, FileText, Film, Folder } from "lucide";
import type { JSX } from "nsh";
import { computed, platform, signal, Text, View } from "nsh";

import { Button } from "@/packages/ui/button";
import { Icon } from "@/packages/ui/lib/icons";
import { ListboxEmpty, ListboxHeader, listboxSearch, OptionRow } from "@/packages/ui/lib/listbox";
import { controlSize, narrowWindow, RowLabel } from "@/packages/ui/lib/surface";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
} from "@/packages/ui/select";

import { Caption, DemoCard, DemoPage } from "../kit";

const SORTS = [
  { value: "newest", title: "Newest first" },
  { value: "oldest", title: "Oldest first" },
  { value: "name", title: "Name" },
  { value: "size", title: "Size" },
  { value: "kind", title: "Kind" },
];

const FONTS = [
  { value: "helvetica", title: "Helvetica", group: "Sans serif" },
  { value: "inter", title: "Inter", group: "Sans serif" },
  { value: "roboto", title: "Roboto", group: "Sans serif" },
  { value: "source-sans", title: "Source Sans", group: "Sans serif" },
  { value: "georgia", title: "Georgia", group: "Serif" },
  { value: "merriweather", title: "Merriweather", group: "Serif" },
  { value: "playfair", title: "Playfair Display", group: "Serif", disabled: true },
  { value: "times", title: "Times New Roman", group: "Serif" },
  { value: "fira-code", title: "Fira Code", group: "Monospace" },
  { value: "jetbrains-mono", title: "JetBrains Mono", group: "Monospace" },
  { value: "menlo", title: "Menlo", group: "Monospace" },
  { value: "sf-mono", title: "SF Mono", group: "Monospace" },
];

const LANGUAGES = [
  { value: "en", title: "English" },
  { value: "de", title: "Deutsch" },
];

const DOWNLOADS: { name: string; kind: string; mb: number; days: number; icon: typeof File }[] = [
  { name: "Quarterly report.pdf", kind: "PDF", mb: 2.4, days: 3, icon: File },
  { name: "Lisbon, 48 photos", kind: "Folder", mb: 212, days: 1, icon: Folder },
  { name: "Interview.mov", kind: "Movie", mb: 1240, days: 6, icon: Film },
  { name: "Brand assets.zip", kind: "Archive", mb: 86, days: 12, icon: Archive },
  { name: "Notes.md", kind: "Text", mb: 0.02, days: 0, icon: FileText },
];
type DownloadSort = "name" | "added" | "size" | "kind";
const DOWNLOAD_SORTS: { value: DownloadSort; title: string; down: boolean }[] = [
  { value: "name", title: "Name", down: false },
  { value: "added", title: "Date added", down: true },
  { value: "size", title: "Size", down: true },
  { value: "kind", title: "Kind", down: false },
];
const fileSize = (mb: number) =>
  mb >= 1000
    ? `${(mb / 1000).toFixed(1)} GB`
    : mb >= 1
      ? `${Math.round(mb)} MB`
      : `${Math.round(mb * 1000)} KB`;
const ago = (days: number) =>
  days === 0 ? "Today" : days === 1 ? "Yesterday" : `${days} days ago`;

const COUNTRIES: {
  value: string;
  title: string;
  flag: string;
  dial: string;
  group: string;
  days: string;
  currency: string;
  disabled?: boolean;
}[] = [
  {
    value: "hk",
    title: "Hong Kong",
    flag: "🇭🇰",
    dial: "+852",
    group: "Asia",
    days: "1–2 days",
    currency: "HKD",
  },
  {
    value: "jp",
    title: "Japan",
    flag: "🇯🇵",
    dial: "+81",
    group: "Asia",
    days: "2–3 days",
    currency: "JPY",
  },
  {
    value: "sg",
    title: "Singapore",
    flag: "🇸🇬",
    dial: "+65",
    group: "Asia",
    days: "2–4 days",
    currency: "SGD",
  },
  {
    value: "kr",
    title: "South Korea",
    flag: "🇰🇷",
    dial: "+82",
    group: "Asia",
    days: "3–4 days",
    currency: "KRW",
  },
  {
    value: "fr",
    title: "France",
    flag: "🇫🇷",
    dial: "+33",
    group: "Europe",
    days: "4–6 days",
    currency: "EUR",
  },
  {
    value: "de",
    title: "Germany",
    flag: "🇩🇪",
    dial: "+49",
    group: "Europe",
    days: "4–6 days",
    currency: "EUR",
  },
  {
    value: "pt",
    title: "Portugal",
    flag: "🇵🇹",
    dial: "+351",
    group: "Europe",
    days: "5–7 days",
    currency: "EUR",
  },
  {
    value: "gb",
    title: "United Kingdom",
    flag: "🇬🇧",
    dial: "+44",
    group: "Europe",
    days: "4–5 days",
    currency: "GBP",
  },
  {
    value: "br",
    title: "Brazil",
    flag: "🇧🇷",
    dial: "+55",
    group: "Americas",
    days: "—",
    currency: "BRL",
    disabled: true,
  },
  {
    value: "ca",
    title: "Canada",
    flag: "🇨🇦",
    dial: "+1",
    group: "Americas",
    days: "3–5 days",
    currency: "CAD",
  },
  {
    value: "mx",
    title: "Mexico",
    flag: "🇲🇽",
    dial: "+52",
    group: "Americas",
    days: "6–8 days",
    currency: "MXN",
  },
  {
    value: "us",
    title: "United States",
    flag: "🇺🇸",
    dial: "+1",
    group: "Americas",
    days: "3–5 days",
    currency: "USD",
  },
];

const STATUSES: { value: string; title: string; tone: Tone | "faint" }[] = [
  { value: "backlog", title: "Backlog", tone: "faint" },
  { value: "todo", title: "To do", tone: "neutral" },
  { value: "progress", title: "In progress", tone: "warn" },
  { value: "review", title: "In review", tone: "info" },
  { value: "done", title: "Done", tone: "up" },
  { value: "canceled", title: "Canceled", tone: "destructive" },
];
const statusColor = (value: string | null) => {
  const tone = STATUSES.find((s) => s.value === value)?.tone ?? "faint";
  return tone === "faint" ? colors.faint : toneColor(tone);
};

const TEAMS = [
  { value: "design", title: "Design" },
  { value: "platform", title: "Platform" },
  { value: "mobile", title: "Mobile" },
  { value: "web", title: "Web" },
  { value: "docs", title: "Docs" },
];

const titleOf = (items: { value: string; title: string }[], value: string | null) =>
  items.find((i) => i.value === value)?.title ?? "None";

/** The list widths: a fixed one with a pointer, the field's room on a phone. */
const controlWidth = () => (narrowWindow() ? 168 : 200);

/** A label and its control on one line, a hairline between the rows. */
function Row(props: { label: string; detail: string; first?: boolean; children: JSX.Element }) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        paddingVertical: 10,
        borderTopWidth: props.first ? 0 : 1,
        borderColor: colors.line,
      }}
    >
      <RowLabel label={props.label} detail={props.detail} />
      {props.children}
    </View>
  );
}

/** A status's dot: its tone's color, faint for no status. */
function Dot(props: { color: string }) {
  return (
    <View
      style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: props.color, marginLeft: 2 }}
    />
  );
}

/** A country's flag. */
function Flag(props: { country: (typeof COUNTRIES)[number] }) {
  return <Text style={{ fontSize: platform.desktop ? 15 : 18 }}>{props.country.flag}</Text>;
}

export function SelectDemo() {
  const last = signal("—");
  const sort = signal<string | null>("newest");
  const font = signal<string | null>("inter");
  const sortOpen = signal(false);
  const fontOpen = signal(false);

  const order = signal<DownloadSort>("added");
  const down = signal(true);
  const sortDownloadsOpen = signal(false);
  const way = () => {
    const s = order();
    if (s === "added") return down() ? "newest first" : "oldest first";
    if (s === "size") return down() ? "largest first" : "smallest first";
    return down() ? "Z to A" : "A to Z";
  };
  const sorted = computed(() => {
    const s = order();
    const by = (a: (typeof DOWNLOADS)[number], b: (typeof DOWNLOADS)[number]) =>
      s === "name"
        ? a.name.localeCompare(b.name)
        : s === "kind"
          ? a.kind.localeCompare(b.kind) || a.name.localeCompare(b.name)
          : s === "size"
            ? a.mb - b.mb
            : b.days - a.days;
    const out = DOWNLOADS.slice().sort(by);
    return down() ? out.reverse() : out;
  });
  const trailing = (f: (typeof DOWNLOADS)[number]) =>
    order() === "size" ? fileSize(f.mb) : order() === "kind" ? f.kind : ago(f.days);
  const detail = (f: (typeof DOWNLOADS)[number]) =>
    order() === "size"
      ? `${f.kind} · ${ago(f.days)}`
      : order() === "kind"
        ? `${fileSize(f.mb)} · ${ago(f.days)}`
        : `${f.kind} · ${fileSize(f.mb)}`;

  const country = signal<string | null>("jp");
  const countryOpen = signal(false);
  const chosen = () => COUNTRIES.find((c) => c.value === country())!;

  const status = signal<string | null>("progress");
  const team = signal<string | null>(null);
  const statusOpen = signal(false);
  const teamOpen = signal(false);
  const tried = signal(false);
  const filed = signal(0);
  const missing = () => tried() && team() === null;

  return (
    <DemoPage title="Select" note={() => last()}>
      <DemoCard title="Select" subtitle="A choice from a list: the app owns the value">
        <View>
          <Row
            first
            label="Sort by"
            detail={platform.desktop ? "A letter jumps to an order" : "Five orders in a sheet"}
          >
            <Select
              value={sort()}
              onChange={({ value }) => {
                sort.set(value);
                last.set(`Sort by: ${titleOf(SORTS, value)}`);
              }}
              onOpenChange={({ open }) => sortOpen.set(open)}
            >
              <SelectTrigger style={{ width: controlWidth() }} />
              <SelectContent accessibilityLabel="Sort by">
                <Each of={SORTS}>
                  {(item) => <SelectItem value={item().value}>{item().title}</SelectItem>}
                </Each>
              </SelectContent>
            </Select>
          </Row>
          <Row label="Font" detail="Searched, in sections">
            <Select
              value={font()}
              cleanable
              onChange={({ value }) => {
                font.set(value);
                last.set(value === null ? "Font: cleared" : `Font: ${titleOf(FONTS, value)}`);
              }}
              onOpenChange={({ open }) => fontOpen.set(open)}
            >
              <SelectTrigger style={{ width: controlWidth() }} />
              <SelectContent
                accessibilityLabel="Font"
                searchable
                searchPlaceholder="Search fonts"
                searchAccessibilityLabel="Search fonts"
                minWidth={260}
                empty={<ListboxEmpty label="No font matches" />}
                clearButtonAccessibilityLabel="Clear the font"
                renderItem={(item) => (
                  <OptionRow item={item} note={item.disabled ? "Not installed" : undefined} />
                )}
                renderGroup={(group) => <ListboxHeader group={group} />}
                {...listboxSearch()}
              >
                <Each of={["Sans serif", "Serif", "Monospace"]}>
                  {(group) => (
                    <SelectGroup>
                      <SelectLabel>{group()}</SelectLabel>
                      <Each of={FONTS.filter((f) => f.group === group())}>
                        {(item) => (
                          <SelectItem value={item().value} disabled={item().disabled}>
                            {item().title}
                          </SelectItem>
                        )}
                      </Each>
                    </SelectGroup>
                  )}
                </Each>
              </SelectContent>
            </Select>
          </Row>
          <Row label="Language" detail="Set by your organization">
            <Select value="en" disabled>
              <SelectTrigger style={{ width: controlWidth() }} />
              <SelectContent accessibilityLabel="Language">
                <Each of={LANGUAGES}>
                  {(item) => <SelectItem value={item().value}>{item().title}</SelectItem>}
                </Each>
              </SelectContent>
            </Select>
          </Row>
        </View>
        <Caption>{`The font reads ${titleOf(FONTS, font())}${font() === null ? "" : " in every style"}`}</Caption>
      </DemoCard>

      <DemoCard title="In a list header" subtitle="A sort menu over the rows it orders">
        <View
          style={{
            flexDirection: narrowWindow() ? "column" : "row",
            alignItems: narrowWindow() ? "stretch" : "center",
            gap: narrowWindow() ? 8 : 4,
            paddingBottom: 10,
            borderBottomWidth: 1,
            borderColor: colors.line,
          }}
        >
          <Text
            style={{
              flex: 1,
              fontSize: 11,
              fontWeight: "600",
              letterSpacing: 0.6,
              color: colors.faint,
            }}
          >
            {`DOWNLOADS · ${DOWNLOADS.length}`}
          </Text>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 4,
              justifyContent: "flex-end",
            }}
          >
            <Text style={{ fontSize: controlSize.detail, color: colors.mutedForeground }}>
              Sort by
            </Text>
            <Select
              value={order()}
              onChange={({ value }) => {
                const next = DOWNLOAD_SORTS.find((s) => s.value === value);
                if (next) {
                  order.set(next.value);
                  down.set(next.down);
                  last.set(`Downloads: ${next.title}, ${way()}`);
                }
              }}
              onOpenChange={({ open }) => sortDownloadsOpen.set(open)}
            >
              <SelectTrigger variant="outline" style={{ width: 180 }} />
              <SelectContent accessibilityLabel="Sort downloads" minWidth={180}>
                <Each of={DOWNLOAD_SORTS}>
                  {(item) => <SelectItem value={item().value}>{item().title}</SelectItem>}
                </Each>
              </SelectContent>
            </Select>
            <Button
              variant="ghost"
              size="sm"
              onPress={() => {
                down.set(!down());
                last.set(`Downloads: ${titleOf(DOWNLOAD_SORTS, order())}, ${way()}`);
              }}
              style={{ width: platform.desktop ? 26 : 34, height: platform.desktop ? 26 : 34 }}
            >
              <View
                class="transition-transform duration-200 motion-reduce:transition-none"
                style={{ transform: [{ rotate: down() ? "0deg" : "180deg" }] }}
              >
                <Icon
                  icon={ArrowDown}
                  size={platform.desktop ? 14 : 16}
                  tint={colors.mutedForeground}
                />
              </View>
            </Button>
          </View>
        </View>
        <View>
          <Each of={sorted()} key="index">
            {(f, i) => (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 8,
                  paddingVertical: 4,
                  borderTopWidth: i() === 0 ? 0 : 1,
                  borderColor: colors.line,
                }}
              >
                <Icon
                  icon={f().icon}
                  size={platform.desktop ? 26 : 32}
                  tint={colors.mutedForeground}
                />
                <RowLabel label={f().name} detail={detail(f())} />
                <Text
                  style={{
                    fontSize: controlSize.detail,
                    color: colors.foreground,
                    fontVariant: ["tabular-nums"],
                  }}
                >
                  {trailing(f())}
                </Text>
              </View>
            )}
          </Each>
        </View>
      </DemoCard>

      <DemoCard title="Countries by region" subtitle="Flags and calling codes; search narrows">
        <Row first label="Country" detail="Where your order goes">
          <Select
            value={country()}
            onChange={({ value }) => {
              country.set(value);
              last.set(`Country: ${titleOf(COUNTRIES, value)}`);
            }}
            onOpenChange={({ open }) => countryOpen.set(open)}
          >
            <SelectTrigger style={{ width: controlWidth() }} lead={<Flag country={chosen()} />} />
            <SelectContent
              accessibilityLabel="Country"
              searchable
              searchPlaceholder="Search countries"
              searchAccessibilityLabel="Search countries"
              minWidth={260}
              empty={<ListboxEmpty label="We do not ship there" />}
              renderItem={(item) => (
                <OptionRow
                  item={item}
                  lead={<Flag country={COUNTRIES.find((c) => c.value === item.value)!} />}
                  note={
                    item.disabled ? "Not yet" : COUNTRIES.find((c) => c.value === item.value)!.dial
                  }
                />
              )}
              renderGroup={(group) => <ListboxHeader group={group} />}
              {...listboxSearch()}
            >
              <Each of={["Asia", "Europe", "Americas"]}>
                {(group) => (
                  <SelectGroup>
                    <SelectLabel>{group()}</SelectLabel>
                    <Each of={COUNTRIES.filter((c) => c.group === group())}>
                      {(item) => (
                        <SelectItem value={item().value} disabled={item().disabled}>
                          {item().title}
                        </SelectItem>
                      )}
                    </Each>
                  </SelectGroup>
                )}
              </Each>
            </SelectContent>
          </Select>
        </Row>
        <View
          style={{
            flexDirection: "row",
            paddingTop: 10,
            borderTopWidth: 1,
            borderColor: colors.line,
          }}
        >
          <Each
            of={[
              { label: "Arrives in", value: chosen().days },
              { label: "Prices in", value: chosen().currency },
              { label: "Calling code", value: chosen().dial },
            ]}
            key="index"
          >
            {(fact, i) => (
              <View
                style={{
                  flex: 1,
                  gap: 2,
                  paddingLeft: i() === 0 ? 0 : 8,
                  borderLeftWidth: i() === 0 ? 0 : 1,
                  borderColor: colors.line,
                }}
              >
                <Text style={{ fontSize: controlSize.detail, color: colors.mutedForeground }}>
                  {fact().label}
                </Text>
                <Text
                  style={{
                    fontSize: controlSize.label,
                    fontWeight: "500",
                    color: colors.foreground,
                    fontVariant: ["tabular-nums"],
                  }}
                >
                  {fact().value}
                </Text>
              </View>
            )}
          </Each>
        </View>
      </DemoCard>

      <DemoCard
        title="Status and validation"
        subtitle="Colored statuses, a required team, a locked one"
      >
        <View>
          <Row first label="Status" detail="Its dot follows the choice">
            <Select
              value={status()}
              onChange={({ value }) => {
                status.set(value);
                last.set(`Status: ${titleOf(STATUSES, value)}`);
              }}
              onOpenChange={({ open }) => statusOpen.set(open)}
            >
              <SelectTrigger
                style={{ width: controlWidth() }}
                lead={<Dot color={statusColor(status())} />}
              />
              <SelectContent
                accessibilityLabel="Status"
                minWidth={180}
                renderItem={(item) => (
                  <OptionRow item={item} lead={<Dot color={statusColor(item.value)} />} />
                )}
              >
                <Each of={STATUSES}>
                  {(item) => <SelectItem value={item().value}>{item().title}</SelectItem>}
                </Each>
              </SelectContent>
            </Select>
          </Row>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
              paddingVertical: 10,
              borderTopWidth: 1,
              borderColor: colors.line,
            }}
          >
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={{ fontSize: controlSize.label, color: colors.foreground }}>Team</Text>
              <Text
                style={{
                  fontSize: controlSize.detail,
                  color: missing() ? toneColor("destructive") : colors.mutedForeground,
                }}
              >
                {missing() ? "Choose a team to file the issue" : "Required: who picks it up"}
              </Text>
            </View>
            <Select
              value={team()}
              placeholder="Choose a team"
              onChange={({ value }) => {
                team.set(value);
                last.set(`Team: ${titleOf(TEAMS, value)}`);
              }}
              onOpenChange={({ open }) => teamOpen.set(open)}
            >
              <SelectTrigger style={{ width: controlWidth() }} invalid={missing()} />
              <SelectContent accessibilityLabel="Team" minWidth={180}>
                <Each of={TEAMS}>
                  {(item) => <SelectItem value={item().value}>{item().title}</SelectItem>}
                </Each>
              </SelectContent>
            </Select>
          </View>
          <Row label="Priority" detail="Set by the triage bot">
            <Select value="high" disabled>
              <SelectTrigger style={{ width: controlWidth() }} />
              <SelectContent accessibilityLabel="Priority">
                <SelectItem value="urgent">Urgent</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </Row>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 10 }}>
          <Button
            onPress={() => {
              if (team() === null) {
                tried.set(true);
                last.set("Issue: a team is required");
                return;
              }
              filed.set(filed() + 1);
              last.set(`Issue filed: ${titleOf(STATUSES, status())}, ${titleOf(TEAMS, team())}`);
            }}
          >
            File issue
          </Button>
          {filed() > 0 ? (
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              <Icon icon={Check} size={14} tint={toneColor("up")} />
              <Text
                style={{
                  fontSize: controlSize.detail,
                  color: colors.mutedForeground,
                  fontVariant: ["tabular-nums"],
                }}
              >
                {`Filed as NSH-${611 + filed()}`}
              </Text>
            </View>
          ) : null}
        </View>
      </DemoCard>
    </DemoPage>
  );
}
