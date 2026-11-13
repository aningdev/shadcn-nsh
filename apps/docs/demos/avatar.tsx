// The official avatar scene (`references/nsh/website/demos/el-avatar.tsx`) with this library's
// parts: a team whose presence a press cycles, the members in a row under a limit, a picture that
// failed to load, and what the app heard beside them. The portraits are GitHub's (`avatarPortrait`),
// so the page marks itself `images-ready` once all of them have loaded or failed, and the render
// check waits for that before the screenshot: a run draws the same faces every time.
import { Image, mount, signal, Text, View } from "nsh";
import { AvatarGroup } from "nsh/base";

import { AVATAR_BROKEN, Avatar, avatarPortrait } from "@/packages/ui/avatar";
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

/** Whether the portraits are in the cache (they are fetched once, when the page loads). */
const warmed = signal(false);
Promise.all(PORTRAITS.map((src) => Image.prefetch(src))).then(() => warmed.set(true));

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
                <Avatar
                  name={name}
                  src={warmed() ? avatarPortrait(name) : undefined}
                  fallbackDelay={300}
                  onStatusChange={({ status }) => settledBy(status)}
                  style={{ width: side, height: side }}
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
                </Avatar>
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
                  <Avatar
                    name={name}
                    src={warmed() ? avatarPortrait(name) : undefined}
                    fallbackDelay={300}
                    onStatusChange={({ status }) => settledBy(status)}
                    style={{
                      width: side,
                      height: side,
                      borderRadius: side / 2,
                      borderWidth: 2,
                      borderColor: surface(),
                      backgroundColor: surface(),
                    }}
                  />
                </View>
              ))}
            </AvatarGroup>
            <Text style={{ fontSize: 12, color: ui().muted }}>{`${members()} members`}</Text>
          </View>
          <View style={{ height: 1, backgroundColor: ui().line }} />
          <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 12 }}>
            <Avatar
              name="Barbara Liskov"
              src={AVATAR_BROKEN}
              accessibilityLabel=""
              fallbackDelay={300}
              onStatusChange={({ status }) => {
                settledBy(status);
                log(`Barbara Liskov: ${status}`);
              }}
              style={{ width: desktop ? 28 : 32, height: desktop ? 28 : 32 }}
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
