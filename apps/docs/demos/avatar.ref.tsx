// The reference of `avatar.tsx`: the same scene with the identity look spread on `nsh/base`'s
// Avatar, the way the official example (`references/nsh/website/demos/el-avatar.tsx`) writes it.
// It differs from the component page only in the parts it names.
import { colors, toneColor } from "@shadcn-nsh/theme";
import type { JSX } from "nsh";
import { mount, signal, Text, View } from "nsh";
import { Avatar, AvatarGroup } from "nsh/base";

import { AVATAR_BROKEN, avatarIdentity } from "@/packages/ui/avatar";
import { Button } from "@/packages/ui/button";
import { listRow, RowLabel, sectionSurface } from "@/packages/ui/lib/surface";

import { DemoPage } from "./kit";
import { desktop, Log, Panel, Segmented, Split } from "./stage";

type Presence = "online" | "away" | "busy";

const PRESENCE: Presence[] = ["online", "away", "busy"];

const dotColor = (p: Presence) =>
  p === "online" ? toneColor("up") : p === "away" ? toneColor("warn") : toneColor("danger");

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
  const surface = () => colors.surface;
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

function App() {
  const presence = signal<Presence[]>(["online", "busy", "away"]);
  const members = signal(8);
  const limit = signal(3);
  const events = signal<string[]>([]);
  const log = (line: string) => events.set([line, ...events()].slice(0, 5));
  const side = desktop ? 36 : 44;
  const more = () => Math.max(0, members() - limit());
  const surface = () => colors.surface;
  const next = (i: number) => {
    const value = PRESENCE[(PRESENCE.indexOf(presence()[i]) + 1) % PRESENCE.length];
    presence.set(presence().map((p, j) => (j === i ? value : p)));
    log(`${TEAM[i]}: ${value}`);
  };
  return (
    <DemoPage title="Avatar">
      <Text style={{ color: colors.muted }}>
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
                <Person name={name} side={side}>
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
          <View style={{ height: 1, backgroundColor: colors.line }} />
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <AvatarGroup
              limit={limit()}
              accessibilityLabel={`${members()} members`}
              class="flex-row items-center"
              overflowClass="items-center justify-center rounded-full"
              overflowStyle={{
                backgroundColor: colors.raised,
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
                    color: colors.muted,
                    fontVariant: ["tabular-nums"],
                  }}
                >
                  {`+${more()}`}
                </Text>
              }
            >
              {MEMBERS.slice(0, members()).map((name, i) => (
                <View style={{ marginLeft: i === 0 ? 0 : -side / 4 }}>
                  <Person name={name} side={side} ring />
                </View>
              ))}
            </AvatarGroup>
            <Text style={{ fontSize: 12, color: colors.muted }}>{`${members()} members`}</Text>
          </View>
          <View style={{ height: 1, backgroundColor: colors.line }} />
          <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 12 }}>
            <Person
              name="Barbara Liskov"
              src={AVATAR_BROKEN}
              label=""
              delay={300}
              side={desktop ? 28 : 32}
              onStatus={(status) => log(`Barbara Liskov: ${status}`)}
            />
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={{ fontSize: 12, color: colors.muted }}>
                <Text style={{ fontWeight: "600", color: colors.text }}>Barbara Liskov</Text>
                {"  40m · her picture failed to load"}
              </Text>
              <Text style={{ fontSize: desktop ? 13 : 15, color: colors.text }}>
                Same as before within a millisecond.
              </Text>
            </View>
          </View>
        </View>
      </Split>
    </DemoPage>
  );
}

mount(App);
