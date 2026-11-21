// Tailwind: the official gallery's scene (`references/nsh/examples/gallery/demos/Tailwind.tsx`)
// drawn from class strings alone — theme tokens switch with the appearance by themselves, the depth
// is arbitrary shadows, everything else is stock Tailwind resolved natively.
import {
  Box,
  Circle,
  Component,
  Image as ImageGlyph,
  Layers,
  LayoutGrid,
  List,
  Palette,
  Sparkles,
  Type,
  Wand2,
  Wind,
  type IconNode,
} from "lucide";
import { Image, type JSX, platform, signal, Text, View } from "nsh";
import { Input } from "nsh/base";

import { Icon } from "@/packages/ui/lib/icons";

import { DemoPage } from "../kit";

const photo = "https://pbs.twimg.com/media/HS6UGjvXkAAyHtp?format=jpg&name=small";

/** A card: an icon tile, a title and the classes it shows, over a darker inset. */
function Card(props: { icon: IconNode; title: string; subtitle: string; children: JSX.Element }) {
  return (
    <View class="border-border bg-card rounded-2xl border p-[5px] shadow-sm">
      <View class="flex-row items-center gap-3 px-[11px] pt-[11px] pb-3">
        <View class="border-border bg-raised size-10 items-center justify-center rounded-xl border">
          <Icon icon={props.icon} size={20} tint="muted" />
        </View>
        <View class="flex-1 gap-0.5">
          <Text class="text-foreground text-[17px] font-semibold">{props.title}</Text>
          <Text
            class="text-muted-foreground font-mono text-xs leading-4"
            style={{ numberOfLines: 2 }}
          >
            {props.subtitle}
          </Text>
        </View>
      </View>
      <View class="border-line bg-inset gap-3 rounded-xl border p-3.5">{props.children}</View>
    </View>
  );
}

function Label(props: { children: string }) {
  return (
    <Text class="text-muted-foreground text-center text-xs tabular-nums">{props.children}</Text>
  );
}

/** A gradient hero lit by a citrus glow, with a big tabular figure and two badges. */
function Hero(props: { count: number }) {
  return (
    <View class="border-border from-card via-card to-inset overflow-hidden rounded-2xl border bg-linear-to-br p-5 shadow-[0_6px_20px_rgba(16,20,30,0.08)]">
      <View class="from-brand-fill/20 absolute -top-24 -right-20 size-72 rounded-full bg-radial to-transparent to-70%" />
      <View class="flex-row flex-wrap items-center gap-2">
        <View class="bg-raised ring-line h-[26px] flex-row items-center gap-1.5 rounded-full px-2.5 ring-1 ring-inset">
          <View class="size-2 items-center justify-center">
            <View class="bg-brand-fill absolute size-2 animate-ping rounded-full" />
            <View class="bg-brand-fill size-1.5 rounded-full" />
          </View>
          <Text class="text-foreground text-xs font-medium">Resolved natively</Text>
        </View>
        <View class="bg-raised h-[26px] justify-center rounded-full px-2.5">
          <Text class="text-foreground font-mono text-xs">dark:</Text>
        </View>
      </View>
      <Text class="text-muted-foreground mt-6 text-[13px]">This screen, styled with classes</Text>
      <Text class="text-foreground text-5xl font-semibold tracking-tight tabular-nums">
        {String(props.count)}
        <Text class="text-muted-foreground text-[17px] font-normal tracking-normal"> cards</Text>
      </Text>
      <Text class="text-muted-foreground mt-2 font-mono text-xs">
        bg-linear-to-br · bg-radial · shadow-[…]
      </Text>
    </View>
  );
}

/** A grid of figures, each with a tinted note. */
function Stats() {
  const stats = [
    {
      label: "Swatches",
      value: String(palette.length * shades.length),
      note: `${palette.length} hues × ${shades.length} shades`,
      tone: "text-brand",
    },
    {
      label: "Gradients",
      value: "4",
      note: "Linear, radial, conic",
      tone: "text-up",
    },
    {
      label: "Animations",
      value: "4",
      note: "Spin, ping, pulse, bounce",
      tone: "text-info",
    },
    {
      label: "Unknown classes",
      value: "0",
      note: "Checked at build",
      tone: "text-warn",
    },
  ];
  const legend = ["bg-brand-fill", "bg-up", "bg-info", "bg-warn"];
  return (
    <Card icon={LayoutGrid} title="Stat grid" subtitle="grid grid-cols-2 gap-2">
      <View class="grid grid-cols-2 gap-2">
        <Each of={stats}>
          {(s) => (
            <View class="border-line bg-card gap-1 rounded-[10px] border p-3 shadow-sm">
              <Text class="text-muted-foreground text-xs">{s().label}</Text>
              <Text class="text-foreground text-[26px] font-semibold tracking-tight tabular-nums">
                {s().value}
              </Text>
              <Text class={`text-xs tabular-nums ${s().tone}`} style={{ numberOfLines: 1 }}>
                {s().note}
              </Text>
            </View>
          )}
        </Each>
      </View>
      <View class="flex-row flex-wrap gap-x-4 gap-y-2">
        <Each of={["Palette", "Gradients", "Motion", "Checks"]}>
          {(name, i) => (
            <View class="flex-row items-center gap-1.5">
              <View class={`size-2.5 rounded-[3px] ${legend[i()]}`} />
              <Text class="text-muted-foreground text-[13px]">{name()}</Text>
            </View>
          )}
        </Each>
      </View>
    </Card>
  );
}

/** Buttons: press states without JS, transitions, `disabled:`. */
function Buttons() {
  const count = signal(0);
  const busy = signal(false);
  return (
    <Card icon={Component} title="Buttons" subtitle="active: hover: transition disabled:">
      <View
        onPress={() => count.set(count() + 1)}
        role="button"
        class="border-brand-edge bg-primary h-11 flex-row items-center justify-center rounded-[10px] border transition duration-150 active:scale-[0.97] active:opacity-90"
      >
        <Text class="text-primary-foreground text-[15px] font-semibold">{`Pressed ${count()}×`}</Text>
      </View>
      <View class="flex-row gap-2">
        <View
          onPress={() => count.set(0)}
          role="button"
          class="border-border bg-raised h-11 flex-1 items-center justify-center rounded-[10px] border transition active:scale-95 active:opacity-80"
        >
          <Text class="text-foreground text-[15px] font-semibold">Reset</Text>
        </View>
        <View
          onPress={() => busy.set(!busy())}
          disabled={busy()}
          role="button"
          class="border-brand-edge bg-primary h-11 flex-1 items-center justify-center rounded-[10px] border transition hover:opacity-90 active:scale-95 disabled:opacity-50"
        >
          <Text class="text-primary-foreground text-[15px] font-semibold">
            {busy() ? "Disabled" : "Disable me"}
          </Text>
        </View>
      </View>
      <View
        onPress={() => busy.set(false)}
        role="button"
        class="active:bg-raised min-h-11 justify-center self-start rounded-lg px-1"
      >
        <Text class="text-brand text-sm underline decoration-dotted underline-offset-4">
          Enable again
        </Text>
      </View>
    </Card>
  );
}

/** Cards: a group press row, tinted badges, an inner ring. */
function Cards() {
  const badges = [
    "bg-up/15 text-up",
    "bg-info/15 text-info",
    "bg-warn/15 text-warn",
    "border border-destructive text-destructive",
  ];
  return (
    <Card icon={Layers} title="Cards and badges" subtitle="group-active: ring-inset shadow-*">
      <View class="group from-card to-inset ring-line flex-row items-center gap-3 rounded-xl bg-linear-to-b p-3 shadow-md ring-1 transition-transform duration-200 ring-inset active:scale-[0.98]">
        <Image src={photo} class="size-12 rounded-[10px]" />
        <View class="flex-1 gap-0.5">
          <Text class="text-foreground text-base font-semibold">Group press</Text>
          <Text class="text-muted-foreground group-active:text-brand text-[13px]">
            Press the card: this line changes color
          </Text>
        </View>
        <Text class="text-faint text-2xl transition-transform group-active:translate-x-1">›</Text>
      </View>
      <View class="flex-row flex-wrap gap-2">
        <Each of={["Filled", "Live", "Pending", "Outline"]}>
          {(name, i) => (
            <View class={`h-[26px] justify-center rounded-full px-2.5 ${badges[i()]}`}>
              <Text class="text-xs font-medium">{name()}</Text>
            </View>
          )}
        </Each>
      </View>
    </Card>
  );
}

function Layout() {
  return (
    <Card icon={Box} title="Flex, grid, breakpoints" subtitle="flex-[2] col-span-2 row-span-2 sm:">
      <View class="flex-row gap-2">
        <View class="bg-info/20 h-10 flex-1 rounded-lg" />
        <View class="bg-info/50 h-10 flex-[2] rounded-lg" />
        <View class="bg-info size-10 rounded-lg" />
      </View>
      <View class="grid grid-cols-3 gap-2">
        <View class="border-brand-edge bg-brand/15 col-span-2 h-12 items-center justify-center rounded-lg border">
          <Text class="text-brand font-mono text-xs">col-span-2</Text>
        </View>
        <View class="bg-brand/25 h-12 rounded-lg" />
        <View class="bg-brand/35 h-12 rounded-lg" />
        <View class="bg-brand row-span-2 items-center justify-center rounded-lg">
          <Text class="text-on-brand font-mono text-[11px]">row-span-2</Text>
        </View>
        <View class="bg-brand/45 h-12 rounded-lg" />
        <View class="bg-brand/55 h-12 rounded-lg" />
        <View class="bg-brand/70 h-12 rounded-lg" />
      </View>
      <View class="flex-col gap-2 sm:flex-row">
        <View class="bg-warn/30 h-8 flex-1 rounded-lg" />
        <View class="bg-warn/60 h-8 flex-1 rounded-lg" />
      </View>
      <Label>The last row is a column on phones and a row from 640 pt up (sm:).</Label>
    </Card>
  );
}

const palette = ["red", "orange", "amber", "emerald", "sky", "indigo", "pink", "zinc"];
const shades = ["100", "300", "500", "700", "900"];

/**
 * The one card that has to name Tailwind's own palette: a swatch is a hue and a shade, which no
 * theme role stands for. Every other card here takes its colors from the theme's tokens.
 */
function Colors() {
  return (
    <Card icon={Palette} title="Palette" subtitle="bg-{color}-{shade}">
      <View class="gap-1.5">
        <Each of={palette}>
          {(name) => (
            <View class="flex-row items-center gap-1.5">
              <Text class="text-muted-foreground w-16 text-xs">{name()}</Text>
              <Each of={shades}>
                {(shade) => <View class={`h-6 flex-1 rounded-md bg-${name()}-${shade()}`} />}
              </Each>
            </View>
          )}
        </Each>
      </View>
    </Card>
  );
}

function Shadows() {
  const sizes = ["shadow-sm", "shadow-md", "shadow-lg", "shadow-xl", "shadow-2xl"];
  return (
    <Card icon={Sparkles} title="Shadows, rings, outlines" subtitle="shadow-* ring-* outline-*">
      <View class="flex-row justify-between px-1 py-2">
        <Each of={sizes}>
          {(s) => (
            <View class="items-center gap-2">
              <View class={`bg-raised size-12 rounded-xl ${s()}`} />
              <Label>{s().slice(7)}</Label>
            </View>
          )}
        </Each>
      </View>
      <View class="flex-row justify-between px-1 pb-1">
        <View class="items-center gap-2">
          <View class="bg-inset ring-line size-12 rounded-xl ring-1 inset-shadow-sm ring-inset" />
          <Label>Inset</Label>
        </View>
        <View class="items-center gap-2">
          <View class="bg-raised ring-info ring-offset-card size-12 rounded-xl ring-2 ring-offset-2" />
          <Label>Ring</Label>
        </View>
        <View class="items-center gap-2">
          <View class="bg-raised outline-destructive size-12 rounded-full outline-2 outline-offset-2 outline-dashed" />
          <Label>Outline</Label>
        </View>
        <View class="items-center gap-2">
          <View class="bg-up shadow-up/50 size-12 rounded-xl shadow-lg" />
          <Label>Glow</Label>
        </View>
      </View>
    </Card>
  );
}

function Gradients() {
  const kinds = [
    ["bg-linear-to-r from-info to-brand", "Linear"],
    ["bg-linear-45 from-destructive via-brand to-info", "45°"],
    ["bg-radial from-warn to-destructive", "Radial"],
    ["bg-conic from-brand via-up to-brand", "Conic"],
  ];
  return (
    <Card icon={Wand2} title="Gradients" subtitle="bg-linear-* bg-radial bg-conic">
      <View class="flex-row justify-between">
        <Each of={kinds}>
          {(k) => (
            <View class="items-center gap-2">
              <View class={`size-16 rounded-2xl ${k()[0]}`} />
              <Label>{k()[1]}</Label>
            </View>
          )}
        </Each>
      </View>
    </Card>
  );
}

function Typography() {
  return (
    <Card icon={Type} title="Typography" subtitle="font-* tracking-* decoration-* line-clamp-*">
      <Text class="text-foreground text-3xl font-black tracking-tight">Display</Text>
      <Text class="text-foreground text-lg font-light">Light, large and relaxed</Text>
      <Text class="text-muted-foreground font-serif text-lg italic">Serif italic</Text>
      <Text class="text-muted-foreground font-mono text-sm tabular-nums">font-mono 0123456789</Text>
      <View class="flex-row flex-wrap gap-x-4 gap-y-1">
        <Text class="decoration-destructive text-[15px] underline decoration-wavy">wavy</Text>
        <Text class="decoration-info text-[15px] underline decoration-double">double</Text>
        <Text class="text-[15px] underline decoration-dashed decoration-2">dashed</Text>
        <Text class="decoration-faint text-[15px] line-through">struck</Text>
        <Text class="text-brand text-xs font-semibold tracking-widest uppercase">caps</Text>
      </View>
      <Text class="text-muted-foreground truncate text-[13px]">
        truncate: a single line that is far too long to fit in the card cut with an ellipsis
      </Text>
      <Text class="text-muted-foreground line-clamp-2 text-[13px] leading-relaxed">
        line-clamp-2: Text is laid out once on the engine thread and drawn on the main thread;
        classes reach it through the same style path as everything else, so the third line of this
        paragraph never shows.
      </Text>
      <Text class="bg-info self-start rounded-md px-2 text-xl font-bold text-white shadow-sm">
        text-shadow
      </Text>
    </Card>
  );
}

function Effects() {
  return (
    <Card
      icon={ImageGlyph}
      title="Filters and blur"
      subtitle="grayscale sepia blur backdrop-blur mix-blend"
    >
      <View class="flex-row justify-between">
        <Each of={["", "grayscale", "sepia", "blur-sm", "brightness-50"]}>
          {(f) => (
            <View class="items-center gap-1.5">
              <Image src={photo} class={`size-14 rounded-xl ${f()}`} />
              <Label>{f() || "None"}</Label>
            </View>
          )}
        </Each>
      </View>
      <View class="h-32 overflow-hidden rounded-xl">
        <Image src={photo} class="absolute inset-0 size-full" />
        <View class="absolute inset-x-3 bottom-3 rounded-lg border border-white/10 bg-black/40 px-3 py-2 backdrop-blur-md">
          <Text class="text-[13px] font-semibold text-white">backdrop-blur-md bg-black/40</Text>
        </View>
        <View class="bg-warn absolute top-3 right-3 size-10 rounded-full mix-blend-multiply" />
      </View>
    </Card>
  );
}

function Motion() {
  return (
    <Card
      icon={Wind}
      title="Animations and transforms"
      subtitle="animate-* rotate-* skew-* scale-*"
    >
      <View class="flex-row items-center justify-between px-1 py-2">
        <View class="items-center gap-2.5">
          <View class="bg-brand size-8 animate-spin rounded-lg" />
          <Label>Spin</Label>
        </View>
        <View class="items-center gap-2.5">
          <View class="size-8 items-center justify-center">
            <View class="bg-info absolute size-4 animate-ping rounded-full" />
            <View class="bg-info size-4 rounded-full" />
          </View>
          <Label>Ping</Label>
        </View>
        <View class="items-center gap-2.5">
          <View class="bg-accent h-8 w-14 animate-pulse rounded-lg" />
          <Label>Pulse</Label>
        </View>
        <View class="items-center gap-2.5">
          <View class="bg-warn size-8 animate-bounce rounded-full" />
          <Label>Bounce</Label>
        </View>
        <View class="items-center gap-2.5">
          <View class="bg-up size-8 scale-90 rotate-12 skew-x-6 rounded-lg" />
          <Label>Transform</Label>
        </View>
      </View>
    </Card>
  );
}

function Lists() {
  return (
    <Card icon={List} title="Structural variants" subtitle="first: even: last: active:">
      <View class="border-line overflow-hidden rounded-xl border">
        <Each of={["Inbox", "Drafts", "Sent", "Archive", "Trash"]}>
          {(item) => (
            <View class="border-line even:bg-raised last:bg-destructive/10 last:text-destructive active:bg-brand/10 min-h-12 flex-row items-center justify-between border-t px-3.5 first:border-t-0">
              {/* `last:` is the row's: the label inherits its color. */}
              <Text class="text-foreground text-[15px]">{item()}</Text>
              <Text class="text-faint text-base">›</Text>
            </View>
          )}
        </Each>
      </View>
    </Card>
  );
}

function Inputs() {
  return (
    <Card icon={Circle} title="Inputs" subtitle="focus: placeholder: caret-*">
      <Input
        placeholder="Focus me"
        class="border-border bg-card text-foreground caret-brand focus:border-brand focus:ring-brand-fill/40 h-11 rounded-[10px] border px-3.5 text-[15px] focus:ring-2"
      />
      <Label>
        Focus adds a border and a ring; the placeholder and caret colors are classes too.
      </Label>
    </Card>
  );
}

// A terminal's cells draw no shadows or filters: those cards are left out there.
const sections: { title: string; draw: (count: () => number) => JSX.Element }[] = [
  { title: "Hero", draw: (count) => <Hero count={count()} /> },
  { title: "Stats", draw: () => <Stats /> },
  { title: "Buttons", draw: () => <Buttons /> },
  { title: "Cards", draw: () => <Cards /> },
  { title: "Layout", draw: () => <Layout /> },
  ...(platform.idiom === "terminal" ? [] : [{ title: "Shadows", draw: () => <Shadows /> }]),
  { title: "Gradients", draw: () => <Gradients /> },
  { title: "Typography", draw: () => <Typography /> },
  ...(platform.idiom === "terminal" ? [] : [{ title: "Effects", draw: () => <Effects /> }]),
  { title: "Motion", draw: () => <Motion /> },
  { title: "Lists", draw: () => <Lists /> },
  { title: "Inputs", draw: () => <Inputs /> },
  { title: "Colors", draw: () => <Colors /> },
];

export function TailwindDemo() {
  return (
    <DemoPage title="Tailwind" note={() => `${sections.length} cards, built from class strings`}>
      <Each of={sections}>{(section) => section().draw(() => sections.length)}</Each>
    </DemoPage>
  );
}
