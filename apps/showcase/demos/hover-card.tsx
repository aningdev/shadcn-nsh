import { alpha, colors, finish, focusRing, mono, rounded, toneColor } from "@shadcn-nsh/theme";
// Hover card: the official gallery's scene (`references/nsh/examples/gallery/demos/HoverCardDemo.tsx`).
// Mentions, link previews, live quotes, delays, and a card the app pins open. The card's surface is
// `popoverLook` on a `PopIn`. The trigger is one of the scene's own views, handed to
// `HoverCardTrigger` as its element: `nsh/base` puts the hover, focus and open state on it, so a
// mention stays a link with its own `onPress`, `hoverStyle` and `testID`.
import {
  Check,
  CircleCheck,
  Clock,
  Code,
  ExternalLink,
  Globe,
  Hand,
  MapPin,
  Plus,
  ScrollText,
  type IconNode,
} from "lucide";
import type { JSX } from "nsh";
import { signal, Text, View } from "nsh";
import type { OpenChangeReason } from "nsh/base";

import { Avatar } from "@/packages/ui/avatar";
import { Badge } from "@/packages/ui/badge";
import { Button } from "@/packages/ui/button";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/packages/ui/hover-card";
import { Icon } from "@/packages/ui/lib/icons";
import type { PopupSide } from "@/packages/ui/lib/popup";
import { Stat } from "@/packages/ui/stat";
import { Switch } from "@/packages/ui/switch";

import { Caption, DemoCard, DemoPage } from "../kit";
import { Choices, createEvents, hint, pointer } from "./overlays-shared";

const exit = {
  popupClass: "transition-opacity duration-150 ease-in motion-reduce:transition-none",
  popupEndingClass: "opacity-0",
};
const small = pointer ? 12 : 13;
const body = pointer ? 13 : 15;

type Person = {
  handle: string;
  name: string;
  role: string;
  bio: string;
  city: string;
  time: string;
  projects: string;
  reviews: string;
  followers: number;
  away?: boolean;
};

const people: Record<string, Person> = {
  mira: {
    handle: "mira",
    name: "Mira Chen",
    role: "Design lead · Platform",
    bio: "Shapes the components teams build on. Ask about motion and type.",
    city: "Shanghai",
    time: "16:42",
    projects: "12",
    reviews: "248",
    followers: 1204,
  },
  ravi: {
    handle: "ravi",
    name: "Ravi Patel",
    role: "Staff engineer · Runtime",
    bio: "Keeps the engine thread under a millisecond, and writes the benchmarks that say so.",
    city: "Bengaluru",
    time: "14:12",
    projects: "31",
    reviews: "1,092",
    followers: 3870,
  },
  lena: {
    handle: "lena",
    name: "Lena Okafor",
    role: "Product manager · Trading",
    bio: "Owns the order ticket and everything that can go wrong in it.",
    city: "Lagos",
    time: "09:42",
    projects: "7",
    reviews: "96",
    followers: 512,
    away: true,
  },
};

type Site = {
  href: string;
  domain: string;
  title: string;
  summary: string;
  icon: IconNode;
  read: string;
};

const sites: Record<string, Site> = {
  taffy: {
    href: "https://github.com/DioxusLabs/taffy",
    domain: "github.com",
    title: "taffy: a flexbox, grid and block layout library",
    summary:
      "A high-performance UI layout library written in Rust, with CSS Block, Flexbox and Grid.",
    icon: Code,
    read: "2.3k stars",
  },
  quickjs: {
    href: "https://bellard.org/quickjs/",
    domain: "bellard.org",
    title: "QuickJS JavaScript Engine",
    summary: "A small and embeddable JavaScript engine supporting the ES2023 specification.",
    icon: Globe,
    read: "Fabrice Bellard",
  },
  wgsl: {
    href: "https://www.w3.org/TR/WGSL/",
    domain: "w3.org",
    title: "WebGPU Shading Language",
    summary:
      "The shader language of WebGPU: types, expressions, statements and the built-in functions.",
    icon: ScrollText,
    read: "W3C Draft",
  },
};

type Quote = {
  symbol: string;
  name: string;
  price: number;
  open: number;
  volume: string;
  cap: string;
  pe: string;
};

const quotes: Record<string, Quote> = {
  AAPL: {
    symbol: "AAPL",
    name: "Apple Inc.",
    price: 227.52,
    open: 224.1,
    volume: "48.2M",
    cap: "3.46T",
    pe: "34.6",
  },
  NVDA: {
    symbol: "NVDA",
    name: "NVIDIA Corp.",
    price: 138.85,
    open: 141.97,
    volume: "212.7M",
    cap: "3.41T",
    pe: "65.2",
  },
  TSLA: {
    symbol: "TSLA",
    name: "Tesla, Inc.",
    price: 251.44,
    open: 245.3,
    volume: "96.4M",
    cap: "803B",
    pe: "70.1",
  },
};

const grouped = (n: number) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
const steps = [0.6, -0.3, 0.9, -0.5, 0.2, -0.8, 0.4, 0.7, -0.2, -0.6];

function words(sentence: string) {
  return (
    <Each of={sentence.split(" ")} key="index">
      {(word) => <Text style={{ fontSize: body, color: colors.foreground }}>{word()}</Text>}
    </Each>
  );
}

function history(symbol: string, open: number, last: number, n = 28): number[] {
  let seed = 7;
  for (let index = 0; index < symbol.length; index++) seed = seed * 31 + symbol.charCodeAt(index);
  const rand = () => (seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648 - 0.5;
  const out = [open];
  for (let i = 1; i < n - 1; i++)
    out.push(out[i - 1]! + rand() * open * 0.012 + ((last - open) / n) * 0.9);
  out.push(last);
  return out;
}

export function HoverCardDemo() {
  const { log, Events } = createEvents(
    hint("Tap a mention, a link or a ticker", "Rest the pointer on a mention, a link or a ticker"),
  );
  const changed =
    (name: string) =>
    ({ open, reason }: { open: boolean; reason: OpenChangeReason }) =>
      log(`${name} ${open ? "opened" : "closed"} · ${reason}`);

  return (
    <DemoPage title="HoverCard">
      <Thread log={log} changed={changed} />
      <Links log={log} changed={changed} />
      <Tickers changed={changed} />
      <Delays changed={changed} />
      <Pinned changed={changed} />
      <Events />
    </DemoPage>
  );
}

function Mention(props: {
  person: Person;
  side?: PopupSide;
  log: (line: string) => void;
  changed: (name: string) => (event: { open: boolean; reason: OpenChangeReason }) => void;
}) {
  const { log, changed } = props;
  const following = signal(false);
  const side = () => props.side ?? "bottom";
  const person = props.person;
  return (
    <HoverCard onOpenChange={changed(`@${person.handle}`)}>
      <HoverCardTrigger>
        <View
          testID={`mention-${person.handle}`}
          role="link"
          accessibilityLabel={`@${person.name}`}
          onPress={() => log(`onPress /people/${person.handle}`)}
          hoverStyle={{ backgroundColor: alpha(colors.brand, 0.12) }}
          focusVisibleStyle={focusRing(1)}
          style={{
            borderRadius: 4,
            paddingHorizontal: 2,
            marginHorizontal: -3,
            borderWidth: 1,
            borderColor: "transparent",
          }}
        >
          <Text style={{ fontSize: body, fontWeight: "500", color: colors.brand }}>
            @{person.name}
          </Text>
        </View>
      </HoverCardTrigger>
      <HoverCardContent
        {...exit}
        placement={side()}
        align="start"
        offset={6}
        margin={8}
        width={pointer ? 280 : 300}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <View>
            <Avatar name={person.name} style={{ width: 44, height: 44 }} />
            <View
              style={{
                position: "absolute",
                right: -1,
                bottom: -1,
                width: 12,
                height: 12,
                borderRadius: 6,
                borderWidth: 2,
                borderColor: colors.card,
                backgroundColor: person.away ? colors.warn : colors.up,
              }}
            />
          </View>
          <View style={{ flex: 1, gap: 2 }}>
            <Text
              style={{ fontSize: pointer ? 15 : 17, fontWeight: "600", color: colors.foreground }}
            >
              {person.name}
            </Text>
            <Text style={{ fontSize: small, color: colors.mutedForeground }}>{person.role}</Text>
          </View>
          <If when={following()}>
            <Badge tone="accent">Following</Badge>
          </If>
        </View>
        <Text style={{ fontSize: body, lineHeight: pointer ? 18 : 21, color: colors.foreground }}>
          {person.bio}
        </Text>
        <View style={{ flexDirection: "row", gap: 14, flexWrap: "wrap" }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
            <Icon icon={MapPin} size={13} tint={colors.faint} />
            <Text style={{ fontSize: 12, color: colors.mutedForeground }}>{person.city}</Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
            <Icon icon={Clock} size={13} tint={colors.faint} />
            <Text style={{ fontSize: 12, color: colors.mutedForeground }}>
              {person.away ? `Away · ${person.time} local` : `${person.time} local time`}
            </Text>
          </View>
        </View>
        <View style={{ flexDirection: "row" }}>
          <Stat label="Projects" value={person.projects} width="33%" />
          <Stat label="Reviews" value={person.reviews} width="33%" />
          <Stat
            label="Followers"
            value={grouped(person.followers + (following() ? 1 : 0))}
            width="33%"
          />
        </View>
        <View style={{ flexDirection: "row", gap: 8 }}>
          <Button
            style={{ flex: 1 }}
            variant={following() ? "secondary" : "default"}
            onPress={() => {
              following.set(!following());
              log(`${following() ? "followed" : "unfollowed"} ${person.name}`);
            }}
          >
            <>
              <Icon
                icon={following() ? Check : Plus}
                size={14}
                tint={following() ? colors.foreground : colors.primaryForeground}
              />
              <Text>{following() ? "Following" : "Follow"}</Text>
            </>
          </Button>
          <Button
            style={{ flex: 1 }}
            variant="secondary"
            onPress={() => log(`message to ${person.name}`)}
          >
            Message
          </Button>
        </View>
      </HoverCardContent>
    </HoverCard>
  );
}

function Comment(props: { author: string; when: string; children: JSX.Element }) {
  return (
    <View style={{ flexDirection: "row", gap: 10 }}>
      <Avatar name={props.author} style={{ width: pointer ? 26 : 32, height: pointer ? 26 : 32 }} />
      <View style={{ flex: 1, gap: 3 }}>
        <View style={{ flexDirection: "row", alignItems: "baseline", gap: 6 }}>
          <Text style={{ fontSize: body, fontWeight: "600", color: colors.foreground }}>
            {props.author}
          </Text>
          <Text style={{ fontSize: 11.5, color: colors.faint }}>{props.when}</Text>
        </View>
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            alignItems: "center",
            columnGap: 4,
            rowGap: 2,
          }}
        >
          {props.children}
        </View>
      </View>
    </View>
  );
}

function Thread(props: {
  log: (line: string) => void;
  changed: (name: string) => (event: { open: boolean; reason: OpenChangeReason }) => void;
}) {
  const { log, changed } = props;
  return (
    <DemoCard
      title="Mentions in a thread"
      subtitle={hint(
        "Tap a name: who it is, and what to do next",
        "Rest on a name, then move into the card: it stays",
      )}
    >
      <View style={{ gap: 14 }}>
        <Comment author="Floyd Wang" when="10 min">
          <>
            {words("Motion review is tomorrow,")}
            <Mention person={people.mira} log={log} changed={changed} />
            {words("has the specs.")}
          </>
        </Comment>
        <Comment author="Mira Chen" when="6 min">
          <>
            {words("Thanks! Frame budget looks fine per")}
            <Mention person={people.ravi} log={log} changed={changed} />
            {words("— ship it.")}
          </>
        </Comment>
        <Comment author="Ravi Patel" when="just now">
          <>
            <Mention person={people.lena} side="top" log={log} changed={changed} />
            {words("the order ticket uses the same card.")}
          </>
        </Comment>
      </View>
      <Caption>
        {hint("A tap outside closes it", "Leave for 300 ms, or press Escape, to close")}
      </Caption>
    </DemoCard>
  );
}

function Preview(props: {
  site: Site;
  label: string;
  log: (line: string) => void;
  changed: (name: string) => (event: { open: boolean; reason: OpenChangeReason }) => void;
}) {
  const { log, changed } = props;
  const site = props.site;
  return (
    <HoverCard onOpenChange={changed(site.domain)}>
      <HoverCardTrigger>
        <View
          role="link"
          accessibilityLabel={props.label}
          onPress={() => log(`onPress ${site.href}`)}
          hoverStyle={{ borderBottomColor: colors.brand }}
          focusVisibleStyle={focusRing(1)}
          style={{ borderBottomWidth: 1, borderBottomColor: alpha(colors.brand, 0.35) }}
        >
          <Text style={{ fontSize: body, color: colors.brand }}>{props.label}</Text>
        </View>
      </HoverCardTrigger>
      <HoverCardContent
        {...exit}
        placement="top"
        offset={8}
        margin={8}
        openDelay={400}
        width={pointer ? 300 : 310}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <View
            style={{
              width: 32,
              height: 32,
              ...rounded(8),
              borderWidth: 1,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: colors.raised,
              ...finish.raised,
            }}
          >
            <Icon icon={site.icon} size={16} tint={colors.foreground} />
          </View>
          <View style={{ flex: 1, gap: 1 }}>
            <Text style={{ fontSize: small, fontWeight: "500", color: colors.foreground }}>
              {site.domain}
            </Text>
            <Text style={{ fontSize: 11.5, color: colors.faint }}>{site.read}</Text>
          </View>
          <Icon icon={ExternalLink} size={13} tint={colors.faint} />
        </View>
        <View style={{ gap: 4 }}>
          <Text style={{ fontSize: body, fontWeight: "600", color: colors.foreground }}>
            {site.title}
          </Text>
          <Text
            style={{
              fontSize: small,
              lineHeight: pointer ? 17 : 19,
              color: colors.mutedForeground,
            }}
          >
            {site.summary}
          </Text>
        </View>
      </HoverCardContent>
    </HoverCard>
  );
}

function Links(props: {
  log: (line: string) => void;
  changed: (name: string) => (event: { open: boolean; reason: OpenChangeReason }) => void;
}) {
  const { log, changed } = props;
  return (
    <DemoCard title="A link preview" subtitle="The page behind a link; a press still opens it">
      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          alignItems: "center",
          columnGap: 4,
          rowGap: 4,
        }}
      >
        {words("Layout runs on")}
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Preview site={sites.taffy!} label="Taffy" log={log} changed={changed} />
          <Text style={{ fontSize: body, color: colors.foreground }}>,</Text>
        </View>
        {words("scripts on")}
        <Preview site={sites.quickjs!} label="QuickJS" log={log} changed={changed} />
        {words("and shaders are written in")}
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Preview site={sites.wgsl!} label="WGSL" log={log} changed={changed} />
          <Text style={{ fontSize: body, color: colors.foreground }}>.</Text>
        </View>
      </View>
      <Caption>Opened after 400 ms here, above the link</Caption>
    </DemoCard>
  );
}

function Ticker(props: {
  quote: Quote;
  changed: (name: string) => (event: { open: boolean; reason: OpenChangeReason }) => void;
}) {
  const { changed } = props;
  const quote = props.quote;
  const price = signal(quote.price);
  const closes = signal(history(quote.symbol, quote.open, quote.price));
  const flash = signal<"up" | "down" | null>(null);
  const timer = signal<ReturnType<typeof setInterval> | undefined>(undefined);
  const step = signal(0);
  const change = () => price() - quote.open;
  const tone = () => (change() >= 0 ? "up" : "down");
  const tick = () => {
    const index = step();
    step.set(index + 1);
    const next = Math.max(1, price() + steps[index % steps.length]! * quote.price * 0.001);
    flash.set(next >= price() ? "up" : "down");
    price.set(Math.round(next * 100) / 100);
    closes.set([...closes().slice(1), price()]);
  };
  const lo = () => Math.min(...closes());
  const hi = () => Math.max(...closes());
  return (
    <HoverCard
      onOpenChange={changed(`$${quote.symbol}`)}
      onOpen={() => {
        timer.set(setInterval(tick, 900));
      }}
      onClose={() => {
        const id = timer();
        if (id !== undefined) clearInterval(id);
        flash.set(null);
      }}
    >
      <HoverCardTrigger>
        <View
          testID={`ticker-${quote.symbol}`}
          focusable
          accessibilityLabel={`${quote.symbol} ${price().toFixed(2)}`}
          hoverStyle={{ backgroundColor: alpha(toneColor(tone()), 0.16) }}
          focusVisibleStyle={focusRing(1)}
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 6,
            paddingHorizontal: 8,
            height: pointer ? 26 : 32,
            borderRadius: 13,
            borderWidth: 1,
            borderColor: alpha(toneColor(tone()), 0.25),
            backgroundColor: alpha(toneColor(tone()), 0.08),
          }}
        >
          <Text
            style={{
              fontSize: small,
              fontWeight: "600",
              fontFamily: mono(),
              color: colors.foreground,
            }}
          >
            {`$${quote.symbol}`}
          </Text>
          <Text
            style={{ fontSize: small, fontVariant: ["tabular-nums"], color: toneColor(tone()) }}
          >
            {`${change() >= 0 ? "▲" : "▼"} ${Math.abs((change() / quote.open) * 100).toFixed(2)}%`}
          </Text>
        </View>
      </HoverCardTrigger>
      <HoverCardContent {...exit} offset={6} margin={8} width={pointer ? 260 : 290}>
        <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
          <View style={{ flex: 1, gap: 2 }}>
            <Text
              style={{ fontSize: pointer ? 15 : 17, fontWeight: "600", color: colors.foreground }}
            >
              {quote.symbol}
            </Text>
            <Text style={{ fontSize: small, color: colors.mutedForeground }}>{quote.name}</Text>
          </View>
          <Badge tone="up" variant="outline">
            Live
          </Badge>
        </View>
        <View style={{ flexDirection: "row", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>
          <View
            style={{
              borderRadius: 5,
              paddingHorizontal: 3,
              backgroundColor: flash() ? alpha(toneColor(flash()!), 0.18) : "transparent",
            }}
          >
            <Text
              style={{
                fontSize: 26,
                fontWeight: "600",
                fontVariant: ["tabular-nums"],
                color: colors.foreground,
              }}
            >
              {price().toFixed(2)}
            </Text>
          </View>
          <Text style={{ fontSize: body, fontVariant: ["tabular-nums"], color: toneColor(tone()) }}>
            {`${change() >= 0 ? "+" : ""}${change().toFixed(2)} (${((change() / quote.open) * 100).toFixed(2)}%)`}
          </Text>
        </View>
        <View style={{ height: 44, flexDirection: "row", alignItems: "flex-end", gap: 2 }}>
          <Each of={closes()}>
            {(close, index) => (
              <View
                style={{
                  flex: 1,
                  height: 6 + ((close() - lo()) / Math.max(0.01, hi() - lo())) * 38,
                  borderRadius: 1.5,
                  backgroundColor:
                    index() === closes().length - 1
                      ? toneColor(tone())
                      : alpha(toneColor(tone()), 0.35),
                }}
              />
            )}
          </Each>
        </View>
        <View style={{ flexDirection: "row" }}>
          <Stat label="Open" value={quote.open.toFixed(2)} width="33%" />
          <Stat label="Volume" value={quote.volume} width="33%" />
          <Stat label="Mkt cap" value={quote.cap} width="33%" />
        </View>
      </HoverCardContent>
    </HoverCard>
  );
}

function Tickers(props: {
  changed: (name: string) => (event: { open: boolean; reason: OpenChangeReason }) => void;
}) {
  const { changed } = props;
  return (
    <DemoCard
      title="A stock ticker"
      subtitle="A live quote behind each symbol, ticking only while open"
    >
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        <Ticker quote={quotes.AAPL!} changed={changed} />
        <Ticker quote={quotes.NVDA!} changed={changed} />
        <Ticker quote={quotes.TSLA!} changed={changed} />
      </View>
      <Caption>
        {hint("Tap a symbol", "Tab to a symbol: the keyboard focus opens its card too")}
      </Caption>
    </DemoCard>
  );
}

function Delays(props: {
  changed: (name: string) => (event: { open: boolean; reason: OpenChangeReason }) => void;
}) {
  const { changed } = props;
  const open = signal("600");
  const close = signal("300");
  const side = signal<PopupSide>("bottom");
  return (
    <DemoCard
      title="Delays and placement"
      subtitle="A wait before opening, and time to reach the card"
    >
      <View style={{ gap: 12 }}>
        <View style={{ gap: 4 }}>
          <Text style={{ fontSize: 12, color: colors.foreground }}>Open delay (ms)</Text>
          <Choices
            label="Open delay"
            value={open()}
            onChange={(value) => open.set(value)}
            options={["0", "300", "600", "1200"].map((value) => ({ value, label: value }))}
          />
        </View>
        <View style={{ gap: 4 }}>
          <Text style={{ fontSize: 12, color: colors.foreground }}>Close delay (ms)</Text>
          <Choices
            label="Close delay"
            value={close()}
            onChange={(value) => close.set(value)}
            options={["0", "300", "1000"].map((value) => ({ value, label: value }))}
          />
        </View>
        <View style={{ gap: 4 }}>
          <Text style={{ fontSize: 12, color: colors.foreground }}>Side</Text>
          <Choices
            label="Side"
            value={side()}
            onChange={(value) => side.set(value as PopupSide)}
            options={[
              { value: "top", label: "Top" },
              { value: "bottom", label: "Bottom" },
              { value: "left", label: "Left" },
              { value: "right", label: "Right" },
            ]}
          />
        </View>
      </View>
      <View style={{ alignItems: "center", paddingVertical: pointer ? 36 : 24 }}>
        <HoverCard onOpenChange={changed("delays")}>
          <HoverCardTrigger>
            <View
              focusable
              accessibilityLabel={pointer ? "Rest here" : "Tap here"}
              hoverStyle={{ backgroundColor: alpha(colors.foreground, 0.06) }}
              focusVisibleStyle={focusRing(1)}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
                paddingHorizontal: 12,
                height: pointer ? 28 : 40,
                ...rounded(8),
                borderWidth: 1,
                borderStyle: "dashed",
                borderColor: colors.border,
              }}
            >
              <Icon icon={Hand} size={14} tint={colors.mutedForeground} />
              <Text style={{ fontSize: body, color: colors.foreground }}>
                {pointer ? "Rest here" : "Tap here"}
              </Text>
            </View>
          </HoverCardTrigger>
          <HoverCardContent
            {...exit}
            openDelay={Number(open())}
            closeDelay={Number(close())}
            placement={side()}
            offset={8}
            margin={8}
            compact
            width={220}
          >
            <Text style={{ fontSize: 13, fontWeight: "600", color: colors.foreground }}>
              {`${open()} ms in · ${close()} ms out`}
            </Text>
            <Text style={{ fontSize: 12, color: colors.mutedForeground }}>
              {`Placed ${side()}; it flips where there is no room.`}
            </Text>
          </HoverCardContent>
        </HoverCard>
      </View>
    </DemoCard>
  );
}

function Pinned(props: {
  changed: (name: string) => (event: { open: boolean; reason: OpenChangeReason }) => void;
}) {
  const { changed } = props;
  const open = signal(false);
  const pinned = signal(false);
  return (
    <DemoCard title="Controlled" subtitle="The app owns open: pinned, it stays">
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <HoverCard
          open={open() || pinned()}
          onOpenChange={(event) => {
            changed("pinned")(event);
            if (!pinned()) open.set(event.open);
          }}
        >
          <HoverCardTrigger>
            <View
              focusable
              accessibilityLabel="Build #4182"
              focusVisibleStyle={focusRing(1)}
              style={{ flexDirection: "row", alignItems: "center", gap: 8, borderRadius: 8 }}
            >
              <Avatar
                name="Ravi Patel"
                style={{ width: pointer ? 28 : 34, height: pointer ? 28 : 34 }}
              />
              <Text style={{ fontSize: body, color: colors.foreground }}>Build #4182</Text>
            </View>
          </HoverCardTrigger>
          <HoverCardContent
            {...exit}
            placement="right"
            offset={8}
            margin={8}
            width={pointer ? 220 : 240}
          >
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <Icon icon={CircleCheck} size={16} tint={colors.up} />
              <Text style={{ fontSize: body, fontWeight: "600", color: colors.foreground }}>
                Passed in 4m 12s
              </Text>
            </View>
            <Text style={{ fontSize: small, color: colors.mutedForeground }}>
              842 tests · 3 platforms · started by Ravi Patel
            </Text>
            <If when={pinned()}>
              <Badge tone="accent">Pinned</Badge>
            </If>
          </HoverCardContent>
        </HoverCard>
        <View style={{ flex: 1 }} />
        <Text style={{ fontSize: small, color: colors.foreground }}>Pin open</Text>
        <Switch
          accessibilityLabel="Pin open"
          checked={pinned()}
          onChange={({ checked }) => pinned.set(checked)}
        />
      </View>
      <Caption>
        {pinned()
          ? "Pinned: onOpenChange still reports, the app keeps it open"
          : "Pin it, then move away"}
      </Caption>
    </DemoCard>
  );
}
