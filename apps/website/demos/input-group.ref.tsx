// The reference of `input-group.tsx`: the same scene, the group's looks spread on `nsh/base`'s
// `Input` and on views, and `buttonLook` on a button. The render check requires the two to draw
// the same pixels.
import { AtSign, CircleX, FileText, MapPin, Plus, Search, Send, Sparkles, Square, X } from "lucide";
import type { JSX, ViewStyle } from "nsh";
import { cleanup, mount, signal, Text, View } from "nsh";
import { Button, Input, Popover } from "nsh/base";

import { Bubble, BubbleContent } from "@/packages/ui/bubble";
import {
  buttonGlyph,
  buttonLabel,
  buttonLook,
  buttonSizes,
  roundButtonGlyph,
  roundButtonLook,
  type ButtonSize,
} from "@/packages/ui/button";
import { grownFieldHeight } from "@/packages/ui/input";
import {
  inputGroupAddonLook,
  inputGroupControlLook,
  inputGroupLook,
  inputGroupTextLook,
  type InputGroupAddonAlign,
  type InputGroupButtonSize,
} from "@/packages/ui/input-group";
import { Icon } from "@/packages/ui/lib/icons";
import { PopIn } from "@/packages/ui/lib/popup";
import { sectionSurface } from "@/packages/ui/lib/surface";
import { Message, MessageAvatar, MessageContent } from "@/packages/ui/message";
import { popoverLook } from "@/packages/ui/popover";
import { Pressable } from "@/packages/ui/pressable";
import { Spinner } from "@/packages/ui/spinner";

import { DemoCard, DemoPage, DemoSection } from "./kit";
import { desktop, Log, Panel, Split, ui } from "./stage";

/** What the search field finds: a stub, as in an app that has the list in memory. */
const cities = [
  { name: "Lisbon", country: "Portugal", zone: "GMT+1" },
  { name: "London", country: "United Kingdom", zone: "GMT+1" },
  { name: "Los Angeles", country: "United States", zone: "GMT−7" },
  { name: "Berlin", country: "Germany", zone: "GMT+2" },
  { name: "Tokyo", country: "Japan", zone: "GMT+9" },
  { name: "Toronto", country: "Canada", zone: "GMT−4" },
];

/** Where the query sits inside a name, so the found letters can take the accent: before, hit, after. */
function slice(name: string, query: string): [string, string, string] {
  const at = query ? name.toLowerCase().indexOf(query.toLowerCase()) : -1;
  if (at < 0) return [name, "", ""];
  return [name.slice(0, at), name.slice(at, at + query.length), name.slice(at + query.length)];
}

/** What the assistant writes back, streamed the way a reply arrives. */
const REPLY = "Both stores have it. The crash rate is flat at 0.02 %, and the notes are live.";

type Turn = { id: number; mine: boolean; text: string };

/** A group's text (a unit, an icon): `inputGroupTextLook` spread. */
function GroupText(props: { children?: string | JSX.Element }) {
  const look = inputGroupTextLook();
  return (
    <View style={look.style}>
      {typeof props.children === "string" ? (
        <Text style={look.label}>{props.children}</Text>
      ) : (
        props.children
      )}
    </View>
  );
}

/** A group's addon: `inputGroupAddonLook`. A press on it puts the keys in the control, as the
 * shell's `InputGroupAddon` does. */
function GroupAddon(props: {
  align: InputGroupAddonAlign;
  onPress?: () => void;
  style?: ViewStyle;
  children?: JSX.Element;
}) {
  return (
    <View
      focusable={false}
      onPress={props.onPress}
      style={[inputGroupAddonLook(props.align), props.style ?? null]}
    >
      {props.children}
    </View>
  );
}

/**
 * A group's button: `buttonLook` on `nsh/base`'s Button, at the size the group gives it — `xs` and
 * `icon-xs` are a `sm` button (24 points with a pointer, 36 on a touch screen), `sm` and `icon-sm`
 * a `default` one (28 / 40), the `icon-*` ones a square of that height with no side padding.
 */
function GroupButton(props: {
  size: InputGroupButtonSize;
  variant?: "default" | "ghost";
  accessibilityLabel: string;
  disabled?: boolean;
  onPress?: () => void;
  children: JSX.Element;
}) {
  const scale: ButtonSize = props.size === "sm" || props.size === "icon-sm" ? "default" : "sm";
  const square = props.size.startsWith("icon");
  const variant = props.variant ?? "ghost";
  const options = { size: scale, disabled: () => !!props.disabled };
  return (
    <Button
      accessibilityLabel={props.accessibilityLabel}
      disabled={props.disabled}
      onPress={props.onPress}
      {...buttonLook(variant, {
        ...options,
        style: square ? { width: buttonSizes[scale].height, paddingHorizontal: 0 } : undefined,
      })}
    >
      {typeof props.children === "string" ? (
        <Text style={buttonLabel(variant, options)}>{props.children}</Text>
      ) : (
        props.children
      )}
    </Button>
  );
}

/**
 * A round button: `roundButtonLook` on `nsh/base`'s Button at the `sm` scale, its glyph from
 * `roundButtonGlyph`. `style` goes over the look's (the composer's plus turns with it).
 */
function Round(props: {
  variant?: "default" | "secondary";
  accessibilityLabel: string;
  disabled?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
  children: JSX.Element;
}) {
  const variant = props.variant ?? "default";
  const look = roundButtonLook(variant, { size: "sm", disabled: () => !!props.disabled });
  return (
    <Button
      accessibilityLabel={props.accessibilityLabel}
      disabled={props.disabled}
      onPress={props.onPress}
      {...look}
      style={[look.style, props.style ?? null]}
    >
      {props.children}
    </Button>
  );
}

function App() {
  const query = signal("lo");
  const settled = signal("lo");
  const pending = signal(false);
  const amount = signal("");
  const message = signal("");
  const grown = signal(0);
  const note = signal("");
  const events = signal<string[]>([]);
  const log = (line: string) => events.set([line, ...events()].slice(0, 3));
  const say = (field: string, value: string) => log(`${field} “${value}”`);

  // A query settles 300 ms after the last key: what the field says at once, what it searches on
  // only once it stops changing.
  let wait: ReturnType<typeof setTimeout> | undefined;
  const search = (value: string) => {
    query.set(value);
    say("search", value);
    if (wait !== undefined) clearTimeout(wait);
    if (value.trim() === "") {
      pending.set(false);
      settled.set("");
      return;
    }
    pending.set(true);
    wait = setTimeout(() => {
      settled.set(value);
      pending.set(false);
    }, 300);
  };
  const clearSearch = () => {
    if (wait !== undefined) clearTimeout(wait);
    query.set("");
    settled.set("");
    pending.set(false);
    log("search cleared");
  };
  cleanup(() => {
    if (wait !== undefined) clearTimeout(wait);
  });
  const matches = () => {
    const q = settled().trim().toLowerCase();
    if (!q) return [];
    return cities
      .filter((c) => c.name.toLowerCase().includes(q) || c.country.toLowerCase().includes(q))
      .slice(0, 4);
  };

  // The conversation the composer writes into: one turn from the assistant, a short scripted reply.
  const thread = signal<Turn[]>([
    { id: 1, mine: false, text: "Pushed 2.4 to both stores. The release notes are in the draft." },
  ]);
  const replying = signal(false);
  const attaching = signal(false);
  let stream: ReturnType<typeof setInterval> | undefined;
  let ids = 2;
  const stop = () => {
    if (stream !== undefined) clearInterval(stream);
    stream = undefined;
    replying.set(false);
  };
  cleanup(stop);
  const send = () => {
    const text = message().trim();
    if (text === "" || replying()) return;
    const id = ids++;
    thread.update((t) => [...t.slice(-3), { id, mine: true, text }]);
    say("sent", text);
    message.set("");
    grown.set(0);
    replying.set(true);
    const reply = ids++;
    thread.update((t) => [...t.slice(-3), { id: reply, mine: false, text: "" }]);
    let shown = 0;
    stream = setInterval(() => {
      shown = Math.min(REPLY.length, shown + 2);
      thread.update((t) =>
        t.map((turn) => (turn.id === reply ? { ...turn, text: REPLY.slice(0, shown) } : turn)),
      );
      if (shown >= REPLY.length) {
        stop();
        log("reply done");
      }
    }, 28);
  };

  return (
    <DemoPage title="InputGroup">
      <Text style={{ color: ui().muted }}>
        {desktop
          ? "Click a field to type; Return sends a message and Shift-Return breaks its line"
          : "Tap a field, or the icon beside it, to type"}
      </Text>

      <Split
        width={360}
        gap={16}
        inspector={
          <>
            <Panel title="value">
              <Text style={{ fontSize: 13, color: ui().text }}>
                {`search ${query() ? `“${query()}”` : "—"}`}
              </Text>
              <Text style={{ fontSize: 13, color: ui().text }}>
                {`amount ${amount() ? `${amount()} USD` : "—"}`}
              </Text>
            </Panel>
            <Log title="events" lines={events()} minHeight={92} />
          </>
        }
      >
        <View style={{ gap: 14 }}>
          {/* Search: the magnifier before the control, the work after it — a spinner while the
              query settles, then the clear button — and the matches under the field. */}
          <View style={{ gap: 8 }}>
            <View {...inputGroupLook()}>
              <GroupAddon align="inline-start">
                <GroupText>
                  <Icon icon={Search} size={16} tint={ui().muted} />
                </GroupText>
              </GroupAddon>
              <Input
                value={query()}
                onChange={({ value }) => search(value)}
                placeholder="Search cities"
                accessibilityLabel="Search cities"
                returnKeyType="search"
                autoCapitalize="none"
                {...inputGroupControlLook()}
              />
              <GroupAddon align="inline-end">
                {pending() ? <Spinner size={desktop ? 12 : 15} tint={ui().faint} /> : null}
                {query().length > 0 ? (
                  <GroupButton
                    size="icon-xs"
                    accessibilityLabel="Clear the search"
                    onPress={clearSearch}
                  >
                    <Icon icon={CircleX} {...buttonGlyph("ghost", { size: "sm" })} />
                  </GroupButton>
                ) : null}
              </GroupAddon>
            </View>

            {settled().trim() ? (
              <View style={{ ...sectionSurface(), overflow: "hidden" }}>
                {matches().length > 0 ? (
                  <Each of={matches()}>
                    {(city, i) => {
                      const [before, hit, after] = slice(city().name, settled().trim());
                      return (
                        <Pressable
                          accessibilityLabel={`Search ${city().name}`}
                          onPress={() => {
                            search(city().name);
                            log(`picked ${city().name}`);
                          }}
                          style={{
                            borderTopWidth: i() === 0 ? 0 : 1,
                            borderTopColor: ui().line,
                          }}
                        >
                          <View
                            style={{
                              flexDirection: "row",
                              alignItems: "center",
                              gap: 8,
                              paddingHorizontal: 12,
                              paddingVertical: 8,
                            }}
                          >
                            <Icon icon={MapPin} size={14} tint={ui().faint} />
                            <Text style={{ flex: 1, minWidth: 0, fontSize: 13, color: ui().text }}>
                              {before}
                              <Text style={{ fontWeight: "700", color: ui().accent }}>{hit}</Text>
                              {after}
                              <Text style={{ color: ui().faint }}>{` · ${city().country}`}</Text>
                            </Text>
                            <Text
                              style={{
                                fontSize: 12,
                                color: ui().faint,
                                fontVariant: ["tabular-nums"],
                              }}
                            >
                              {city().zone}
                            </Text>
                          </View>
                        </Pressable>
                      );
                    }}
                  </Each>
                ) : (
                  <Text style={{ fontSize: 13, color: ui().muted, padding: 12 }}>
                    {`No city or country matches “${settled()}”.`}
                  </Text>
                )}
              </View>
            ) : (
              <Text style={{ fontSize: 12, color: ui().faint }}>
                {`Try “lon”, “tok” or “ber”.`}
              </Text>
            )}
          </View>

          <View {...inputGroupLook()}>
            <Input
              value={amount()}
              onChange={({ value }) => {
                amount.set(value);
                say("amount", value);
              }}
              placeholder="0.00"
              keyboardType="numbers-and-punctuation"
              accessibilityLabel="Amount"
              {...inputGroupControlLook()}
            />
            <GroupAddon align="inline-end">
              <GroupText>USD</GroupText>
            </GroupAddon>
          </View>

          <View style={{ gap: 10 }}>
            <Each of={thread()}>
              {(turn) => (
                <Message align={turn().mine ? "end" : "start"}>
                  <MessageAvatar name={turn().mine ? "You" : "Maya"} />
                  <MessageContent>
                    <Bubble variant={turn().mine ? "default" : "muted"}>
                      <BubbleContent>{turn().text || "…"}</BubbleContent>
                    </Bubble>
                  </MessageContent>
                </Message>
              )}
            </Each>

            <View {...inputGroupLook({ style: { borderRadius: 22, padding: 6 } })}>
              <Input
                multiline
                value={message()}
                onChange={({ value }) => {
                  message.set(value);
                  say("message", value);
                }}
                onContentSizeChange={({ size }) => grown.set(size.height)}
                style={
                  grown() > 0
                    ? {
                        ...inputGroupControlLook({ multiline: true }).style,
                        height: grownFieldHeight(grown(), 5),
                      }
                    : inputGroupControlLook({ multiline: true }).style
                }
                placeholder="Ask anything"
                accessibilityLabel="Message"
                submitBehavior={desktop ? "submit" : "newline"}
                onSubmit={send}
              />
              <GroupAddon
                align="block-end"
                style={{ paddingHorizontal: 0, paddingBottom: 0, gap: 8 }}
              >
                <Popover
                  open={attaching()}
                  placement="top"
                  offset={10}
                  onOpenChange={({ open }) => attaching.set(open)}
                  trigger={
                    <Button
                      accessibilityLabel="Add an attachment"
                      {...roundButtonLook("secondary", { size: "sm" })}
                      style={[
                        roundButtonLook("secondary", { size: "sm" }).style,
                        {
                          transform: attaching() ? "rotate(45deg)" : undefined,
                          transitionProperty: "transform",
                          transitionDuration: 200,
                          transitionTimingFunction: "ease-out",
                        },
                      ]}
                    >
                      <Icon icon={Plus} {...roundButtonGlyph("secondary", { size: "sm" })} />
                    </Button>
                  }
                >
                  {() => (
                    <PopIn side="top" style={popoverLook({ compact: true, width: 200 })}>
                      <Pressable
                        accessibilityLabel="Attach a file"
                        onPress={() => {
                          attaching.set(false);
                          log("attach: a file");
                        }}
                        style={{ flexDirection: "row", alignItems: "center", gap: 8, padding: 6 }}
                      >
                        <Icon icon={FileText} size={14} tint={ui().muted} />
                        <Text style={{ fontSize: 13, color: ui().text }}>Attach a file</Text>
                      </Pressable>
                      <Pressable
                        accessibilityLabel="Mention someone"
                        onPress={() => {
                          attaching.set(false);
                          log("attach: a mention");
                        }}
                        style={{ flexDirection: "row", alignItems: "center", gap: 8, padding: 6 }}
                      >
                        <Icon icon={AtSign} size={14} tint={ui().muted} />
                        <Text style={{ fontSize: 13, color: ui().text }}>Mention someone</Text>
                      </Pressable>
                    </PopIn>
                  )}
                </Popover>
                <View style={{ flex: 1 }} />
                <Text style={{ fontSize: 11, color: ui().faint }}>
                  {desktop
                    ? "Return sends · Shift-Return breaks the line"
                    : "Return breaks the line"}
                </Text>
                {replying() ? (
                  <Round
                    accessibilityLabel="Stop the reply"
                    onPress={() => {
                      stop();
                      log("reply stopped");
                    }}
                  >
                    <Icon icon={Square} {...roundButtonGlyph("default", { size: "sm" })} />
                  </Round>
                ) : (
                  <Round
                    accessibilityLabel="Send"
                    disabled={message().trim().length === 0}
                    onPress={send}
                  >
                    <Icon icon={Send} {...roundButtonGlyph("default", { size: "sm" })} />
                  </Round>
                )}
              </GroupAddon>
            </View>
          </View>

          <View {...inputGroupLook()}>
            <GroupAddon align="block-start">
              <Icon icon={Sparkles} size={14} tint={ui().muted} />
              <GroupText>Improve the wording</GroupText>
            </GroupAddon>
            <Input
              multiline
              value={note()}
              onChange={({ value }) => {
                note.set(value);
                say("note", value);
              }}
              placeholder="What changed?"
              accessibilityLabel="Release note"
              {...inputGroupControlLook({ multiline: true })}
            />
            <GroupAddon align="block-end">
              <GroupText>{`${note().length} / 200`}</GroupText>
            </GroupAddon>
          </View>
        </View>
      </Split>

      <DemoCard>
        <DemoSection title="States">
          <View {...inputGroupLook()}>
            <GroupAddon align="inline-start">
              <GroupText>@</GroupText>
            </GroupAddon>
            <Input placeholder="Handle" accessibilityLabel="Handle" {...inputGroupControlLook()} />
          </View>
          <View {...inputGroupLook({ invalid: true })}>
            <GroupAddon align="inline-start">
              <GroupText>@</GroupText>
            </GroupAddon>
            <Input
              value="ada@"
              accessibilityLabel="Handle, rejected"
              {...inputGroupControlLook()}
            />
          </View>
          {/* The look alone is flat on the quieter edge; the view is `disabled` as the shell's is, so
              what it holds is disabled with it and dims as one. */}
          <View {...inputGroupLook({ disabled: true })} disabled>
            <GroupAddon align="inline-start">
              <GroupText>@</GroupText>
            </GroupAddon>
            <Input
              value="ada"
              disabled
              accessibilityLabel="Handle, disabled"
              {...inputGroupControlLook()}
            />
          </View>
        </DemoSection>

        <DemoSection title="Button sizes">
          <View {...inputGroupLook()}>
            <Input
              placeholder="Filter the list"
              accessibilityLabel="Filter the list"
              {...inputGroupControlLook()}
            />
            <GroupAddon align="inline-end">
              <GroupButton size="xs" accessibilityLabel="Apply the filter">
                <Icon icon={Search} {...buttonGlyph("ghost", { size: "sm" })} />
              </GroupButton>
              <GroupButton size="sm" accessibilityLabel="Clear the filter">
                <Icon icon={X} {...buttonGlyph("ghost", { size: "default" })} />
              </GroupButton>
              <GroupButton size="icon-xs" accessibilityLabel="Copy the filter">
                <Icon icon={CircleX} {...buttonGlyph("ghost", { size: "sm" })} />
              </GroupButton>
              <GroupButton size="icon-sm" accessibilityLabel="Save the filter">
                <Icon icon={Send} {...buttonGlyph("ghost", { size: "default" })} />
              </GroupButton>
            </GroupAddon>
          </View>
        </DemoSection>
      </DemoCard>
    </DemoPage>
  );
}

mount(App);
