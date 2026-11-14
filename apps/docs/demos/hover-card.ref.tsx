// The reference of `hover-card.tsx`: the same scene with the card's surface (`popoverLook`) on a
// `PopIn` inside `nsh/base`'s HoverCard, the way the official example
// (`references/nsh/website/demos/el-hover-card.tsx`) writes it. It differs from the component
// page only in the parts it names.
import { alpha, colors, focusRing } from "@shadcn-nsh/theme";
import type { JSX } from "nsh";
import { mount, signal, Text, View } from "nsh";
import { HoverCard, type OpenChangeReason } from "nsh/base";

import { avatarIdentity } from "@/packages/ui/avatar";
import { Button } from "@/packages/ui/button";
import { Icon } from "@/packages/ui/lib/icons";
import { PopIn } from "@/packages/ui/lib/popup";
import { popoverLook } from "@/packages/ui/popover";

import { DemoPage } from "./kit";
import { desktop, Log, Segmented, Split, wide } from "./stage";

type Placement = "top" | "bottom" | "left" | "right";

/** A mention's or a link's trigger: a run of text the pointer rests on. */
const linkText = () => ({
  fontSize: 15,
  color: colors.accent,
});

function App() {
  const openDelay = signal(600);
  const closeDelay = signal(300);
  const placement = signal<Placement>("bottom");
  const following = signal(false);
  const price = signal(227.52);
  const events = signal<string[]>([]);
  let timer: ReturnType<typeof setInterval> | undefined;
  const log = (name: string) => (event: { open: boolean; reason: OpenChangeReason }) =>
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
    s.split(" ").map((word) => <Text style={{ fontSize: 15, color: colors.text }}>{word}</Text>);
  /** A card's popup: the surface `popoverLook` gives it, coming in from the trigger's side. */
  const surface = (width: number) => popoverLook({ width });

  // A mention: the person's card, with a button that works because the pointer can move into it.
  const mention = (): JSX.Element => (
    <HoverCard
      {...shared()}
      onOpenChange={log("@ada")}
      trigger={
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
          hoverStyle={{ backgroundColor: alpha(colors.accent, 0.14) }}
        >
          <Text style={{ fontSize: 15, fontWeight: "600", color: colors.accent }}>@ada</Text>
        </View>
      }
    >
      {() => (
        <PopIn side={placement()} style={surface(260)}>
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
              <Text style={{ fontSize: 15, fontWeight: "600", color: colors.text }}>
                Ada Lovelace
              </Text>
              <Text style={{ fontSize: 12, color: colors.muted }}>Analyst · Engines</Text>
            </View>
          </View>
          <Text style={{ fontSize: 13, lineHeight: 18, color: colors.text }}>
            Writes the first programs for the Analytical Engine.
          </Text>
          <Button
            variant={following() ? "secondary" : "default"}
            onPress={() => following.set(!following())}
          >
            {following() ? "Following" : "Follow"}
          </Button>
        </PopIn>
      )}
    </HoverCard>
  );

  // A link with a preview of the page behind it.
  const preview = (): JSX.Element => (
    <HoverCard
      {...shared()}
      onOpenChange={log("taffy")}
      trigger={
        <View
          role="link"
          focusVisibleStyle={focusRing(1)}
          style={{ borderBottomWidth: 1, borderBottomColor: alpha(colors.accent, 0.4) }}
        >
          <Text style={linkText()}>Taffy</Text>
        </View>
      }
    >
      {() => (
        <PopIn side={placement()} style={surface(280)}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <View
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                backgroundColor: colors.raised,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon name="code" size={16} tint={colors.text} />
            </View>
            <View style={{ flex: 1, gap: 1 }}>
              <Text style={{ fontSize: 12, fontWeight: "500", color: colors.text }}>
                github.com
              </Text>
              <Text style={{ fontSize: 11.5, color: colors.faint }}>DioxusLabs/taffy</Text>
            </View>
          </View>
          <View style={{ gap: 4 }}>
            <Text style={{ fontSize: 14, fontWeight: "600", color: colors.text }}>
              taffy: flexbox, grid and block layout
            </Text>
            <Text style={{ fontSize: 12, color: colors.muted }}>
              A high-performance UI layout library written in Rust.
            </Text>
          </View>
        </PopIn>
      )}
    </HoverCard>
  );

  // A ticker whose quote ticks while its card is open.
  const ticker = (): JSX.Element => (
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
      trigger={
        <View
          focusable
          focusVisibleStyle={focusRing(1)}
          style={{
            paddingHorizontal: 8,
            height: 26,
            borderRadius: 13,
            justifyContent: "center",
            borderWidth: 1,
            borderColor: alpha(colors.up, 0.3),
            backgroundColor: alpha(colors.up, 0.1),
          }}
        >
          <Text style={{ fontSize: 13, fontWeight: "600", color: colors.up }}>$AAPL ▲</Text>
        </View>
      }
    >
      {() => (
        <PopIn side={placement()} style={surface(220)}>
          <Text style={{ fontSize: 12, color: colors.muted }}>Apple Inc. · live</Text>
          <Text
            style={{
              fontSize: 26,
              fontWeight: "600",
              color: colors.text,
              fontVariant: ["tabular-nums"],
            }}
          >
            {price().toFixed(2)}
          </Text>
          <Text
            style={{
              fontSize: 13,
              color: price() >= 224.1 ? colors.up : colors.down,
              fontVariant: ["tabular-nums"],
            }}
          >
            {price() >= 224.1 ? "+" : ""}
            {(price() - 224.1).toFixed(2)} today
          </Text>
        </PopIn>
      )}
    </HoverCard>
  );

  return (
    <DemoPage title="Hover Card">
      <Text style={{ color: colors.muted }}>
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
