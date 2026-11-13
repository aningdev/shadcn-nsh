// The reference of `avatar.tsx`: the same scene with the identity look spread on `nsh/base`'s
// Avatar, the way the official example (`references/nsh/website/demos/el-avatar.tsx`) writes it.
// It differs from the component page only in the parts it names.
import type { JSX } from "nsh";
import { Image, mount, signal, Text, View } from "nsh";
import { Avatar, AvatarGroup } from "nsh/base";

import { AVATAR_BROKEN, avatarIdentity, avatarPortrait } from "@/packages/ui/avatar";
import { Button } from "@/packages/ui/button";
import { listRow, RowLabel, sectionSurface } from "@/packages/ui/lib/surface";

import { DemoPage } from "./kit";
import { desktop, Log, Panel, Segmented, Split, ui } from "./stage";

type Presence = "online" | "away" | "busy";

const PRESENCE: Presence[] = ["online", "away", "busy"];

const dotColor = (p: Presence) =>
  p === "online" ? ui().up : p === "away" ? ui().warn : ui().danger;

const TEAM = ["Jason Lee", "Sunli", "Floyd Wang"];

const MEMBERS = [
  "Jason Lee",
  "Sunli",
  "Floyd Wang",
  "Alan Turing",
  "Edsger Dijkstra",
  "Barbara Liskov",
  "Donald Knuth",
  "Frances Allen",
  "Radia Perlman",
  "Ken Thompson",
];

/** A person: initials on their own hue, the picture (none here) round over them, an optional ring. */
function Person(props: {
  name: string;
  side: number;
  src?: string;
  label?: string;
  ring?: boolean;
  delay?: number;
  onStatus?: (status: string) => void;
  children?: JSX.Element;
}) {
  // Read in the JSX, so the identity colors follow the appearance.
  const id = () => avatarIdentity(props.name);
  const surface = () => ui().card.backgroundColor;
  return (
    <Avatar
      name={props.name}
      src={props.src}
      accessibilityLabel={props.label}
      fallbackDelay={props.delay ?? 300}
      onStatusChange={({ status }) => props.onStatus?.(status)}
      style={{
        width: props.side,
        height: props.side,
        ...(props.ring
          ? {
              borderRadius: props.side / 2,
              borderWidth: 2,
              borderColor: surface(),
              backgroundColor: surface(),
            }
          : {}),
      }}
      imageClass="rounded-full overflow-hidden"
      fallbackClass={`rounded-full overflow-hidden items-center justify-center font-semibold text-[${id().foreground}]`}
      fallbackStyle={{
        backgroundColor: id().background,
        borderWidth: 1,
        borderColor: id().border,
      }}
    >
      {props.children}
    </Avatar>
  );
}

/**
 * The portraits, fetched once at load: an avatar that draws an image already in the cache paints
 * it in the frame that places it, and two runs draw the same edge pixels (an image that arrives
 * later leaves its rounded clip drawn a hair differently).
 */
const PORTRAITS = [
  ...new Set(
    [...TEAM, ...MEMBERS]
      .map((name) => avatarPortrait(name))
      .filter((src): src is string => src !== undefined),
  ),
];

/**
 * Whether the portraits are in the cache (they are fetched once, when the page loads). A portrait
 * that fails is not a page that never draws: the avatar keeps its initials, and the page still
 * marks itself ready.
 */
const warmed = signal(false);
Promise.allSettled(PORTRAITS.map((src) => Image.prefetch(src))).then(() => warmed.set(true));

function App() {
  // The render check waits for `images-ready`: every portrait it can show loaded (or failed).
  const settled = signal(0);
  const portraits = (names: string[]) => names.filter((name) => avatarPortrait(name) !== undefined);
  const images = () => portraits(TEAM).length + portraits(MEMBERS.slice(0, members())).length + 1;
  const ready = () => settled() >= images();
  // A load or a failure settles a picture; "loading" does not.
  const settledBy = (status: string) => {
    if (status === "loaded" || status === "error") settled.update((n) => n + 1);
  };
  const presence = signal<Presence[]>(["online", "busy", "away"]);
  const members = signal(8);
  const limit = signal(3);
  const events = signal<string[]>([]);
  const log = (line: string) => events.set([line, ...events()].slice(0, 5));
  const side = desktop ? 36 : 44;
  const more = () => Math.max(0, members() - limit());
  const surface = () => ui().card.backgroundColor;
  const next = (i: number) => {
    const value = PRESENCE[(PRESENCE.indexOf(presence()[i]) + 1) % PRESENCE.length];
    presence.set(presence().map((p, j) => (j === i ? value : p)));
    log(`${TEAM[i]}: ${value}`);
  };
  return (
    <DemoPage title="Avatar">
      <Text style={{ color: ui().muted }}>
        {desktop
          ? "Click a member to change their presence"
          : "Tap a member to change their presence"}
      </Text>

      <Split
        gap={14}
        inspector={
          <>
            <Panel title="AvatarGroup · limit">
              <Segmented
                options={[2, 3, 4]}
                value={limit()}
                onChange={(value) => (limit.set(value), log(`limit ${value}`))}
              />
              <View style={{ flexDirection: "row", gap: 8, marginTop: 6 }}>
                <Button
                  variant="secondary"
                  disabled={members() >= MEMBERS.length}
                  onPress={() => (
                    members.set(Math.min(MEMBERS.length, members() + 1)),
                    log(`members ${members()}`)
                  )}
                >
                  Add
                </Button>
                <Button
                  variant="ghost"
                  disabled={members() <= 1}
                  onPress={() => (
                    members.set(Math.max(1, members() - 1)),
                    log(`members ${members()}`)
                  )}
                >
                  Remove
                </Button>
              </View>
            </Panel>
            <Log title="events" lines={events()} minHeight={110} />
          </>
        }
      >
        <View style={{ ...sectionSurface({ padded: true }), gap: 14 }}>
          <View>
            {TEAM.map((name, i) => (
              <View
                role="button"
                accessibilityLabel={`${name}, ${presence()[i]}`}
                onPress={() => next(i)}
                {...listRow({ first: i === 0 })}
              >
                <Person
                  name={name}
                  side={side}
                  src={warmed() ? avatarPortrait(name) : undefined}
                  onStatus={settledBy}
                >
                  <View
                    class="transition-colors duration-200 motion-reduce:transition-none"
                    style={{
                      position: "absolute",
                      right: -1,
                      bottom: -1,
                      width: 11,
                      height: 11,
                      borderRadius: 6,
                      borderWidth: 2,
                      borderColor: surface(),
                      backgroundColor: dotColor(presence()[i]),
                    }}
                  />
                </Person>
                <RowLabel label={name} detail={presence()[i]} strong />
              </View>
            ))}
          </View>
          <View style={{ height: 1, backgroundColor: ui().line }} />
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <AvatarGroup
              limit={limit()}
              accessibilityLabel={`${members()} members`}
              class="flex-row items-center"
              overflowClass="items-center justify-center rounded-full"
              overflowStyle={{
                backgroundColor: ui().raised.backgroundColor,
                width: side,
                height: side,
                marginLeft: -side / 4,
                borderWidth: 2,
                borderColor: surface(),
              }}
              overflowAccessibilityLabel={`${more()} more people`}
              overflow={
                <Text
                  style={{
                    fontSize: side / 3.2,
                    fontWeight: "600",
                    color: ui().muted,
                    fontVariant: ["tabular-nums"],
                  }}
                >
                  {`+${more()}`}
                </Text>
              }
            >
              {MEMBERS.slice(0, members()).map((name, i) => (
                <View style={{ marginLeft: i === 0 ? 0 : -side / 4 }}>
                  <Person
                    name={name}
                    side={side}
                    ring
                    src={warmed() ? avatarPortrait(name) : undefined}
                    onStatus={settledBy}
                  />
                </View>
              ))}
            </AvatarGroup>
            <Text style={{ fontSize: 12, color: ui().muted }}>{`${members()} members`}</Text>
          </View>
          <View style={{ height: 1, backgroundColor: ui().line }} />
          <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 12 }}>
            <Person
              name="Barbara Liskov"
              src={AVATAR_BROKEN}
              label=""
              delay={300}
              side={desktop ? 28 : 32}
              onStatus={(status) => {
                settledBy(status);
                log(`Barbara Liskov: ${status}`);
              }}
            />
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={{ fontSize: 12, color: ui().muted }}>
                <Text style={{ fontWeight: "600", color: ui().text }}>Barbara Liskov</Text>
                {"  40m · her picture failed to load"}
              </Text>
              <Text style={{ fontSize: desktop ? 13 : 15, color: ui().text }}>
                Same as before within a millisecond.
              </Text>
            </View>
          </View>
        </View>
      </Split>
      {/* The render check's cue: every portrait has loaded (or failed), so two runs draw the same. */}
      {() =>
        ready() ? (
          <View testID="images-ready" style={{ position: "absolute", width: 1, height: 1 }} />
        ) : null
      }
    </DemoPage>
  );
}

mount(App);
