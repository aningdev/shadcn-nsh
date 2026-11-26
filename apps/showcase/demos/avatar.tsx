import { alpha, colors, focusRing, hovered } from "@shadcn-nsh/theme";
import { Trash2 } from "lucide";
// Avatar: the official gallery's scene (`references/nsh/examples/gallery/demos/AvatarDemo.tsx`).
// The picture, the initials and the identity colors are this library's `Avatar`. A stacked row
// is `AvatarGroup`, the overflow count `AvatarGroupCount`, and the presence mark `AvatarBadge`.
// A team row is the library's `Pressable`: `Button` is a filled control, not a list row.
import type { JSX } from "nsh";
import { reduceMotion, signal, Text, View } from "nsh";

import { avatarPortrait, AVATAR_BROKEN } from "@/apps/website/demos/avatar-data";
import { photoUrl } from "@/apps/website/demos/photos";
import {
  Avatar,
  AvatarBadge,
  AvatarGroup,
  AvatarGroupCount,
  avatarIdentity,
} from "@/packages/ui/avatar";
import { Badge } from "@/packages/ui/badge";
import { Button as UiButton } from "@/packages/ui/button";
import { Pressable } from "@/packages/ui/pressable";

import { DemoPage } from "../kit";
import { Choices, pointer, SceneCard } from "./overlays-shared";

/** Floyd Wang's portrait is the night launch; everyone else a maintainer uses their GitHub picture. */
const portrait = (name: string) =>
  name === "Floyd Wang" ? photoUrl("moon", "360x360") : avatarPortrait(name);

const said: Record<string, string> = {
  idle: "Nothing to load",
  loading: "Loading",
  loaded: "Loaded",
  error: "Failed",
};
const say = (status: string) => said[status] ?? status;

type Presence = "online" | "away" | "busy" | "offline";
const PRESENCE: Presence[] = ["online", "away", "busy", "offline"];
const presenceColor = (presence: Presence) =>
  presence === "online"
    ? colors.up
    : presence === "away"
      ? colors.warn
      : presence === "busy"
        ? colors.destructive
        : colors.faint;

const fade = (ms: number) => (reduceMotion() ? "" : `transition-opacity duration-${ms} ease-out`);

function Person(props: {
  name?: string;
  side: number;
  src?: string;
  label?: string;
  ring?: boolean;
  delay?: number;
  fadeIn?: boolean;
  fallback?: JSX.Element;
  onStatus?: (status: string) => void;
  children?: JSX.Element;
}) {
  const id = () => (props.name ? avatarIdentity(props.name) : null);
  const round = "rounded-full overflow-hidden";
  return (
    <View
      style={{
        width: props.side,
        height: props.side,
        flexShrink: 0,
        ...(props.ring
          ? { borderRadius: props.side / 2, padding: 2, backgroundColor: colors.card }
          : {}),
      }}
    >
      <Avatar
        src={props.src}
        name={props.name}
        accessibilityLabel={props.label}
        fallbackDelay={props.delay}
        onStatusChange={({ status }) => props.onStatus?.(status)}
        style={{ flex: 1 }}
        imageClass={`${round} border border-foreground/10 bg-muted ${props.fadeIn ? fade(300) : ""}`}
        fallbackClass={`${round} items-center justify-center font-semibold text-[${Math.round(props.side / 2.8)}px]${id() ? ` text-[${id()!.foreground}]` : ""}`}
        fallback={props.fallback}
      >
        {props.children}
      </Avatar>
    </View>
  );
}

function UserGlyph(props: { size: number; tint: string }) {
  const s = () => props.size;
  return (
    <View style={{ width: s(), height: s(), alignItems: "center" }}>
      <View
        style={{
          width: s() * 0.42,
          height: s() * 0.42,
          borderRadius: s(),
          borderWidth: 1.75,
          borderColor: props.tint,
          marginTop: s() * 0.06,
        }}
      />
      <View
        style={{
          width: s() * 0.72,
          height: s() * 0.34,
          marginTop: s() * 0.08,
          borderTopLeftRadius: s(),
          borderTopRightRadius: s(),
          borderWidth: 1.75,
          borderBottomWidth: 0,
          borderColor: props.tint,
        }}
      />
    </View>
  );
}

const TEAM: { name: string; role: string; presence: Presence }[] = [
  { name: "Jason Lee", role: "Design & Platforms", presence: "online" },
  { name: "Sunli", role: "Runtime & VM", presence: "busy" },
  { name: "Floyd Wang", role: "Components", presence: "online" },
  { name: "Alan Turing", role: "Research", presence: "away" },
  { name: "Edsger Dijkstra", role: "Reviews", presence: "offline" },
];

const MEMBERS = [
  "Jason Lee",
  "Sunli",
  "Floyd Wang",
  "Alan Turing",
  "Edsger Dijkstra",
  "Barbara Liskov",
  "Donald Knuth",
  "Frances Allen",
  "Margaret Hamilton",
  "Claude Shannon",
  "Radia Perlman",
  "Ken Thompson",
];

/** Avatars: a team, a stack, a thread, a profile, pictures that fail, and a delayed fallback. */
const row = pointer ? 32 : 40;
const body = pointer ? 13 : 15;
const note = pointer ? 12 : 13;

function clock() {
  return Date.now();
}

export function AvatarDemo() {
  const last = signal("—");

  return (
    <DemoPage title="Avatar">
      <Team last={last} />
      <Stacked last={last} />
      <Thread />
      <Profile last={last} />
      <States last={last} />
      <Delay last={last} />
      <Last last={last} />
    </DemoPage>
  );
}

function Team(props: { last: { (): string; set: (value: string) => void } }) {
  const { last } = props;
  const presence = signal<Presence[]>(TEAM.map((member) => member.presence));
  const online = () => presence().filter((item) => item === "online").length;
  return (
    <SceneCard
      title="Team"
      subtitle="Presence dots; press one to change theirs"
      right={<Badge tone="up">{`${online()} online`}</Badge>}
    >
      <View>
        <Each of={TEAM}>
          {(member, i) => {
            const current = () => presence()[i()];
            return (
              <Pressable
                onPress={() => {
                  const next = PRESENCE[(PRESENCE.indexOf(current()) + 1) % PRESENCE.length]!;
                  presence.set(presence().map((value, j) => (j === i() ? next : value)));
                  last.set(`${member().name}: ${next}`);
                }}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 12,
                  minHeight: pointer ? 44 : 60,
                  paddingHorizontal: 8,
                  marginHorizontal: -8,
                  borderRadius: 8,
                  borderTopWidth: i() === 0 ? 0 : 1,
                  borderTopColor: colors.line,
                }}
                hoverStyle={hovered()}
                activeStyle={{ backgroundColor: alpha(colors.foreground, 0.08) }}
                focusVisibleStyle={focusRing()}
              >
                <Person
                  name={member().name}
                  side={row}
                  src={portrait(member().name)}
                  label={`${member().name}, ${current()}`}
                >
                  <AvatarBadge
                    class={reduceMotion() ? "" : "transition-colors duration-200"}
                    style={{
                      width: Math.max(8, Math.round(row / 4)),
                      height: Math.max(8, Math.round(row / 4)),
                      borderRadius: Math.max(8, Math.round(row / 4)) / 2,
                      borderColor: current() === "offline" ? colors.faint : colors.card,
                      backgroundColor:
                        current() === "offline" ? colors.card : presenceColor(current()),
                    }}
                  />
                </Person>
                <View style={{ flex: 1, gap: 2 }}>
                  <Text style={{ fontSize: body, fontWeight: "500", color: colors.foreground }}>
                    {member().name}
                  </Text>
                  <Text style={{ fontSize: note, color: colors.mutedForeground }}>
                    {member().role}
                  </Text>
                </View>
                <Text style={{ fontSize: note, color: presenceColor(current()) }}>{current()}</Text>
              </Pressable>
            );
          }}
        </Each>
      </View>
    </SceneCard>
  );
}

function Stacked(props: { last: { (): string; set: (value: string) => void } }) {
  const { last } = props;
  const count = signal(9);
  const limit = signal("4");
  const shown = () => Number(limit());
  const side = pointer ? 32 : 40;
  const people = () => MEMBERS.slice(0, count());
  const more = () => Math.max(0, count() - shown());
  return (
    <SceneCard
      title="Stacked group"
      subtitle="The first few overlap; a count for the rest"
      right={<Badge>{`${count()} members`}</Badge>}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
        <AvatarGroup
          limit={shown()}
          accessibilityLabel={`${count()} members`}
          overflowClass={reduceMotion() ? "" : "transition-colors duration-200"}
          overflowStyle={{
            width: side,
            height: side,
            borderColor: colors.card,
            backgroundColor: colors.raised,
          }}
          overflowAccessibilityLabel={`${more()} more people`}
          overflow={
            <AvatarGroupCount style={{ fontSize: side / 3.2 }}>{`+${more()}`}</AvatarGroupCount>
          }
        >
          <Each of={people()}>
            {(name) => <Person name={name()} side={side} ring src={portrait(name())} />}
          </Each>
        </AvatarGroup>
        <Text style={{ flex: 1, fontSize: note, color: colors.mutedForeground }}>
          {more() > 0 ? `and ${more()} more` : "everyone shown"}
        </Text>
      </View>
      <Choices
        label="Shown"
        value={limit()}
        onChange={(value) => {
          limit.set(value);
          last.set(`Limit: ${value}`);
        }}
        options={[
          { value: "3", label: "3 shown" },
          { value: "4", label: "4 shown" },
          { value: "5", label: "5 shown" },
        ]}
      />
      <View style={{ flexDirection: "row", gap: 8 }}>
        <UiButton
          size="sm"
          disabled={count() >= MEMBERS.length}
          accessibilityLabel="Add member"
          onPress={() => {
            count.set(count() + 1);
            last.set(`Members: ${count()}`);
          }}
        >
          Add member
        </UiButton>
        <UiButton
          size="sm"
          variant="ghost"
          disabled={count() <= 1}
          accessibilityLabel="Remove"
          onPress={() => {
            count.set(count() - 1);
            last.set(`Members: ${count()}`);
          }}
        >
          Remove
        </UiButton>
      </View>
      <View style={{ flexDirection: "row", alignItems: "baseline", gap: 8 }}>
        <Text style={{ flex: 1, fontSize: body, color: colors.mutedForeground }}>
          Viewers of a long list: only the three shown are made
        </Text>
        <Text style={{ fontSize: note, color: colors.faint, fontVariant: ["tabular-nums"] }}>
          1,284 viewers
        </Text>
      </View>
      <AvatarGroup
        limit={3}
        total={1284}
        accessibilityLabel="1,284 viewers"
        overflowClass="px-2"
        overflowStyle={{
          height: 28,
          borderColor: colors.card,
          backgroundColor: colors.raised,
        }}
        overflowAccessibilityLabel="1,281 more viewers"
        overflow={<AvatarGroupCount style={{ fontSize: 11 }}>+1.3k</AvatarGroupCount>}
      >
        <Each of={["Jason Lee", "Sunli", "Floyd Wang"]}>
          {(name) => <Person name={name()} side={28} ring src={portrait(name())} label="" />}
        </Each>
      </AvatarGroup>
    </SceneCard>
  );
}

function Thread() {
  const comments = [
    {
      name: "Sunli",
      time: "2h",
      text: "The compiler change is in. Benchmarks look steady.",
      src: portrait("Sunli"),
      reply: false,
    },
    {
      name: "Alan Turing",
      time: "1h",
      text: "Did the cold start move? The last run was noisy.",
      src: AVATAR_BROKEN,
      reply: true,
    },
    {
      name: "Barbara Liskov",
      time: "40m",
      text: "Same as before within a millisecond.",
      src: undefined,
      reply: true,
    },
  ];
  return (
    <SceneCard
      title="Comment thread"
      subtitle="Pictures beside the names, decorative for screen readers"
    >
      <View style={{ gap: 14 }}>
        <Each of={comments}>
          {(comment) => (
            <View
              style={{
                flexDirection: "row",
                gap: 10,
                paddingLeft: comment().reply ? (pointer ? 28 : 34) : 0,
              }}
            >
              <Person name={comment().name} side={pointer ? 24 : 30} src={comment().src} label="" />
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={{ fontSize: note, color: colors.mutedForeground }}>
                  <Text style={{ fontWeight: "600", color: colors.foreground }}>
                    {comment().name}
                  </Text>
                  {`  ${comment().time}`}
                </Text>
                <Text style={{ fontSize: body, lineHeight: body * 1.45, color: colors.foreground }}>
                  {comment().text}
                </Text>
              </View>
            </View>
          )}
        </Each>
      </View>
    </SceneCard>
  );
}

function Profile(props: { last: { (): string; set: (value: string) => void } }) {
  const { last } = props;
  const pictures = ["Jason Lee", "Sunli", "Floyd Wang"];
  const picture = signal<number | null>(0);
  const status = signal("idle");
  const side = pointer ? 64 : 76;
  return (
    <SceneCard
      title="Profile header"
      subtitle="Fades in on a change; initials without one"
      right={status() === "loaded" ? <Badge tone="up">Loaded</Badge> : undefined}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
        <Person
          name="Jason Lee"
          side={side}
          ring
          fadeIn
          src={picture() === null ? undefined : portrait(pictures[picture()!]!)}
          onStatus={(next) => {
            status.set(next);
            last.set(`Profile picture: ${say(next).toLowerCase()}`);
          }}
        >
          <View
            style={{
              position: "absolute",
              right: 0,
              bottom: 0,
              paddingHorizontal: 6,
              height: 20,
              borderRadius: 10,
              justifyContent: "center",
              borderWidth: 2,
              borderColor: colors.card,
              backgroundColor: colors.brand,
            }}
          >
            <Text style={{ fontSize: 10, fontWeight: "700", color: colors.primaryForeground }}>
              PRO
            </Text>
          </View>
        </Person>
        <View style={{ flex: 1, gap: 3 }}>
          <Text
            style={{ fontSize: pointer ? 17 : 19, fontWeight: "600", color: colors.foreground }}
          >
            Jason Lee
          </Text>
          <Text style={{ fontSize: note, color: colors.mutedForeground }}>
            @huacnlee · Native Shell
          </Text>
          <Text style={{ fontSize: note, color: colors.faint }}>github.com/huacnlee</Text>
        </View>
      </View>
      <View style={{ flexDirection: "row", gap: 8 }}>
        <UiButton
          size="sm"
          accessibilityLabel="Change picture"
          onPress={() => {
            picture.set(((picture() ?? -1) + 1) % pictures.length);
            last.set("Profile picture: changed");
          }}
        >
          Change picture
        </UiButton>
        <UiButton
          size="sm"
          variant="ghost"
          disabled={picture() === null}
          accessibilityLabel="Remove picture"
          icon={Trash2}
          onPress={() => {
            picture.set(null);
            last.set("Profile picture: removed");
          }}
        >
          Remove picture
        </UiButton>
      </View>
    </SceneCard>
  );
}

function States(props: { last: { (): string; set: (value: string) => void } }) {
  const { last } = props;
  const round = signal(0);
  const statuses = signal<Record<string, string>>({});
  const cases = [
    { key: "loads", title: "Loads", name: "Floyd Wang", src: portrait("Floyd Wang") },
    { key: "fails", title: "Fails", name: "Alan Turing", src: AVATAR_BROKEN },
    { key: "none", title: "No picture", name: "Donald Knuth", src: undefined },
    { key: "anon", title: "No name", name: undefined, src: undefined },
  ];
  const side = pointer ? 44 : 52;
  return (
    <SceneCard title="Loading and failing" subtitle="While loading, on failure, and without one">
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <Each of={cases}>
          {(item) => (
            <View style={{ alignItems: "center", gap: 6, flex: 1 }}>
              <Each of={[round()]}>
                {() => (
                  <Person
                    name={item().name}
                    side={side}
                    src={item().src}
                    label={item().name ?? "Guest"}
                    fallback={
                      item().name ? undefined : (
                        <UserGlyph size={side * 0.5} tint={colors.mutedForeground} />
                      )
                    }
                    onStatus={(next) => statuses.set({ ...statuses(), [item().key]: next })}
                  />
                )}
              </Each>
              <Text style={{ fontSize: note, fontWeight: "500", color: colors.foreground }}>
                {item().title}
              </Text>
              <Text style={{ fontSize: note - 1, color: colors.mutedForeground }}>
                {say(statuses()[item().key] ?? "idle")}
              </Text>
            </View>
          )}
        </Each>
      </View>
      <UiButton
        size="sm"
        accessibilityLabel="Load again"
        onPress={() => {
          statuses.set({});
          round.set(round() + 1);
          last.set("Loaded again");
        }}
      >
        Load again
      </UiButton>
    </SceneCard>
  );
}

function Delay(props: { last: { (): string; set: (value: string) => void } }) {
  const { last } = props;
  const round = signal(0);
  const loadedAt = signal<number | null>(null);
  const start = signal(clock());
  const delayed = (status: string) => {
    if (status === "loaded") loadedAt.set(clock() - start());
  };
  const verdict = () => {
    const at = loadedAt();
    if (at === null) return "Loading the pictures";
    return at < 400
      ? `In ${at} ms, inside the 400 ms: no fallback flashed`
      : `In ${at} ms: the fallback showed from 400 ms`;
  };
  const side = pointer ? 44 : 52;
  return (
    <SceneCard title="Without a flash" subtitle="The fallback waits 400 ms; the picture fades in">
      <View style={{ flexDirection: "row", gap: 24 }}>
        <Each of={[round()]}>
          {() => (
            <>
              <View style={{ alignItems: "center", gap: 6 }}>
                <Person name="Sunli" side={side} src={portrait("Sunli")} />
                <Text style={{ fontSize: note, color: colors.mutedForeground }}>No delay</Text>
              </View>
              <View style={{ alignItems: "center", gap: 6 }}>
                <Person
                  name="Sunli"
                  side={side}
                  src={portrait("Sunli")}
                  delay={400}
                  fadeIn
                  onStatus={delayed}
                />
                <Text style={{ fontSize: note, color: colors.mutedForeground }}>
                  400 ms, fades in
                </Text>
              </View>
            </>
          )}
        </Each>
      </View>
      <Text
        style={{ fontSize: note, color: colors.mutedForeground, fontVariant: ["tabular-nums"] }}
      >
        {verdict()}
      </Text>
      <UiButton
        size="sm"
        accessibilityLabel="Replay"
        onPress={() => {
          start.set(clock());
          loadedAt.set(null);
          round.set(round() + 1);
          last.set("Replay");
        }}
      >
        Replay
      </UiButton>
    </SceneCard>
  );
}

function Last(props: { last: { (): string; set: (value: string) => void } }) {
  const { last } = props;
  return (
    <SceneCard title="Last change">
      <View style={{ flexDirection: "row", alignItems: "baseline", gap: 8 }}>
        <Text style={{ flex: 1, fontSize: body, color: colors.mutedForeground }}>{last()}</Text>
        <Text style={{ fontSize: note, color: colors.faint }}>
          {pointer ? "Tab to a member, Space changes their presence" : "Tap a member"}
        </Text>
      </View>
    </SceneCard>
  );
}
