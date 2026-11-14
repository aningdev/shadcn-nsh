// The official hover card scene (`references/nsh/website/demos/el-hover-card.tsx`) with this
// library's parts: a mention, a link preview and a ticker in running text, each with a card on
// its side whose delays and side the inspector sets, and the last six lifecycle lines.
import { alpha, focusRing } from "@shadcn-nsh/theme";
import { Code } from "lucide";
import { mount, signal, Text, View } from "nsh";

import { avatarIdentity } from "@/packages/ui/avatar";
import { Button } from "@/packages/ui/button";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/packages/ui/hover-card";
import { Icon } from "@/packages/ui/lib/icons";

import { DemoPage } from "./kit";
import { desktop, Log, Segmented, Split, ui, wide } from "./stage";

type Placement = "top" | "bottom" | "left" | "right";

/** A mention's or a link's trigger: a run of text the pointer rests on. */
const linkText = () => ({
  fontSize: 15,
  color: ui().accent,
});

function App() {
  const openDelay = signal(600);
  const closeDelay = signal(300);
  const placement = signal<Placement>("bottom");
  const following = signal(false);
  const price = signal(227.52);
  const events = signal<string[]>([]);
  let timer: ReturnType<typeof setInterval> | undefined;
  const log = (name: string) => (event: { open: boolean; reason: string }) =>
    events.set(
      [`${name} ${event.open ? "opened" : "closed"} · ${event.reason}`, ...events()].slice(0, 6),
    );
  const ada = avatarIdentity("Ada Lovelace");
  const shared = () => ({
    openDelay: openDelay(),
    closeDelay: closeDelay(),
    placement: placement(),
    offset: 8,
    margin: 12,
  });
  /** Running text in a wrapping row: one piece per word, so a line breaks between words. */
  const words = (s: string) =>
    s.split(" ").map((word) => <Text style={{ fontSize: 15, color: ui().text }}>{word}</Text>);

  // A mention: the person's card, with a button that works because the pointer can move into it.
  const mention = () => (
    <HoverCard {...shared()} onOpenChange={log("@ada")}>
      <HoverCardTrigger>
        <View
          role="link"
          focusVisibleStyle={focusRing(1)}
          style={{
            borderRadius: 4,
            borderWidth: 1,
            borderColor: "transparent",
            paddingHorizontal: 2,
            marginHorizontal: -3,
          }}
          hoverStyle={{ backgroundColor: alpha(ui().accent, 0.14) }}
        >
          <Text style={{ fontSize: 15, fontWeight: "600", color: ui().accent }}>@ada</Text>
        </View>
      </HoverCardTrigger>
      <HoverCardContent width={260}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              borderWidth: 1,
              borderColor: ada.border,
              backgroundColor: ada.background,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ fontSize: 15, fontWeight: "600", color: ada.foreground }}>AL</Text>
          </View>
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={{ fontSize: 15, fontWeight: "600", color: ui().text }}>Ada Lovelace</Text>
            <Text style={{ fontSize: 12, color: ui().muted }}>Analyst · Engines</Text>
          </View>
        </View>
        <Text style={{ fontSize: 13, lineHeight: 18, color: ui().text }}>
          Writes the first programs for the Analytical Engine.
        </Text>
        <Button
          variant={following() ? "secondary" : "default"}
          onPress={() => following.set(!following())}
        >
          {following() ? "Following" : "Follow"}
        </Button>
      </HoverCardContent>
    </HoverCard>
  );

  // A link with a preview of the page behind it.
  const preview = () => (
    <HoverCard {...shared()} onOpenChange={log("taffy")}>
      <HoverCardTrigger>
        <View
          role="link"
          focusVisibleStyle={focusRing(1)}
          style={{ borderBottomWidth: 1, borderBottomColor: alpha(ui().accent, 0.4) }}
        >
          <Text style={linkText()}>Taffy</Text>
        </View>
      </HoverCardTrigger>
      <HoverCardContent width={280}>
        {/* The site's mark on a raised tile and its domain, then the page. */}
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <View
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              backgroundColor: ui().raised.backgroundColor,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon icon={Code} size={16} tint={ui().text} />
          </View>
          <View style={{ flex: 1, gap: 1 }}>
            <Text style={{ fontSize: 12, fontWeight: "500", color: ui().text }}>github.com</Text>
            <Text style={{ fontSize: 11.5, color: ui().faint }}>DioxusLabs/taffy</Text>
          </View>
        </View>
        <View style={{ gap: 4 }}>
          <Text style={{ fontSize: 14, fontWeight: "600", color: ui().text }}>
            taffy: flexbox, grid and block layout
          </Text>
          <Text style={{ fontSize: 12, color: ui().muted }}>
            A high-performance UI layout library written in Rust.
          </Text>
        </View>
      </HoverCardContent>
    </HoverCard>
  );

  // A ticker whose quote ticks while its card is open.
  const ticker = () => (
    <HoverCard
      {...shared()}
      onOpenChange={log("$AAPL")}
      onOpen={() => {
        timer = setInterval(
          () => price.set(Math.round((price() + (Math.random() - 0.48) * 0.6) * 100) / 100),
          900,
        );
      }}
      onClose={() => clearInterval(timer)}
    >
      <HoverCardTrigger>
        <View
          focusable
          focusVisibleStyle={focusRing(1)}
          style={{
            paddingHorizontal: 8,
            height: 26,
            borderRadius: 13,
            justifyContent: "center",
            borderWidth: 1,
            borderColor: alpha(ui().up, 0.3),
            backgroundColor: alpha(ui().up, 0.1),
          }}
        >
          <Text style={{ fontSize: 13, fontWeight: "600", color: ui().up }}>$AAPL ▲</Text>
        </View>
      </HoverCardTrigger>
      <HoverCardContent width={220}>
        <Text style={{ fontSize: 12, color: ui().muted }}>Apple Inc. · live</Text>
        <Text
          style={{
            fontSize: 26,
            fontWeight: "600",
            color: ui().text,
            fontVariant: ["tabular-nums"],
          }}
        >
          {price().toFixed(2)}
        </Text>
        <Text
          style={{
            fontSize: 13,
            color: price() >= 224.1 ? ui().up : ui().down,
            fontVariant: ["tabular-nums"],
          }}
        >
          {price() >= 224.1 ? "+" : ""}
          {(price() - 224.1).toFixed(2)} today
        </Text>
      </HoverCardContent>
    </HoverCard>
  );

  return (
    <DemoPage title="Hover Card">
      <Text style={{ color: ui().muted }}>
        {desktop
          ? "Rest the pointer on a mention, a link or a ticker, then move into the card"
          : "Tap a mention, a link or a ticker; tap outside to close"}
      </Text>

      <Split
        gap={14}
        inspector={
          <>
            <Segmented
              label="openDelay"
              options={[0, 300, 600, 1200] as number[]}
              value={openDelay()}
              onChange={(value) => openDelay.set(value)}
            />
            <Segmented
              label="closeDelay"
              options={[0, 300, 1000] as number[]}
              value={closeDelay()}
              onChange={(value) => closeDelay.set(value)}
            />
            <Segmented
              label="placement"
              options={["top", "bottom", "left", "right"] as Placement[]}
              value={placement()}
              onChange={(value) => placement.set(value)}
            />
            <Log title="onOpenChange({ open, reason })" lines={events()} minHeight={110} />
          </>
        }
      >
        <View style={{ gap: 18, alignItems: "flex-start", minHeight: wide() ? undefined : 220 }}>
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              alignItems: "center",
              columnGap: 4,
              rowGap: 6,
            }}
          >
            {words("Ask")}
            {mention()}
            {words("about the layout engine,")}
            {/* The period stays with the link. */}
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              {preview()}
              {words(".")}
            </View>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            {words("Today:")}
            {ticker()}
          </View>
        </View>
      </Split>
    </DemoPage>
  );
}

mount(App);
