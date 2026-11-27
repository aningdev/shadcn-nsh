var e=`// The input group's scenes with this library's parts: a search field (a magnifier before the
// control, a spinner while the query settles, a clear button after it, the matches under it), an
// amount with its unit after it, a composer on a 22-point radius whose plus opens a menu and whose
// send turns to stop while the reply streams, and a note whose addons sit over and under it; a card
// shows the group's states and the sizes of its buttons. The inspector says what is typed and logs
// what happened.
import { AtSign, CircleX, FileText, MapPin, Plus, Search, Send, Sparkles, Square, X } from "lucide";
import { cleanup, mount, signal, Text, View } from "nsh";

import { Bubble, BubbleContent } from "@/packages/ui/bubble";
import { buttonGlyph, RoundButton, roundButtonGlyph } from "@/packages/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
  InputGroupTextarea,
} from "@/packages/ui/input-group";
import { grownFieldHeight } from "@/packages/ui/lib/field-look";
import { Icon } from "@/packages/ui/lib/icons";
import { sectionSurface } from "@/packages/ui/lib/surface";
import { Message, MessageAvatar, MessageContent } from "@/packages/ui/message";
import { Popover, PopoverContent, PopoverTrigger } from "@/packages/ui/popover";
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

function App() {
  // The field starts with a query, the way a search does when the reader comes back to it: the
  // matches are there, and clearing it brings back the hint.
  const query = signal("lo");
  const settled = signal("lo");
  const pending = signal(false);
  const amount = signal("");
  const message = signal("");
  const grown = signal(0);
  const note = signal("");
  const events = signal<string[]>([]);
  const log = (line: string) => events.set([line, ...events()].slice(0, 3));
  const say = (field: string, value: string) => log(\`\${field} “\${value}”\`);

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
                {\`search \${query() ? \`“\${query()}”\` : "—"}\`}
              </Text>
              <Text style={{ fontSize: 13, color: ui().text }}>
                {\`amount \${amount() ? \`\${amount()} USD\` : "—"}\`}
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
            <InputGroup>
              <InputGroupAddon align="inline-start">
                <InputGroupText>
                  <Icon icon={Search} size={16} tint={ui().muted} />
                </InputGroupText>
              </InputGroupAddon>
              <InputGroupInput
                value={query()}
                onChange={({ value }) => search(value)}
                placeholder="Search cities"
                accessibilityLabel="Search cities"
                returnKeyType="search"
                autoCapitalize="none"
              />
              <InputGroupAddon align="inline-end">
                {pending() ? <Spinner side={desktop ? 12 : 15} tint={ui().faint} /> : null}
                {query().length > 0 ? (
                  <InputGroupButton
                    size="icon-xs"
                    accessibilityLabel="Clear the search"
                    onPress={clearSearch}
                  >
                    <Icon icon={CircleX} {...buttonGlyph("ghost", { size: "sm" })} />
                  </InputGroupButton>
                ) : null}
              </InputGroupAddon>
            </InputGroup>

            {settled().trim() ? (
              <View style={{ ...sectionSurface(), overflow: "hidden" }}>
                {matches().length > 0 ? (
                  <Each of={matches()}>
                    {(city, i) => {
                      const [before, hit, after] = slice(city().name, settled().trim());
                      return (
                        <Pressable
                          accessibilityLabel={\`Search \${city().name}\`}
                          onPress={() => {
                            search(city().name);
                            log(\`picked \${city().name}\`);
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
                              <Text style={{ color: ui().faint }}>{\` · \${city().country}\`}</Text>
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
                    {\`No city or country matches “\${settled()}”.\`}
                  </Text>
                )}
              </View>
            ) : (
              <Text style={{ fontSize: 12, color: ui().faint }}>
                {\`Try “lon”, “tok” or “ber”.\`}
              </Text>
            )}
          </View>

          {/* A unit after the control, in the field's type. */}
          <InputGroup>
            <InputGroupInput
              value={amount()}
              onChange={({ value }) => {
                amount.set(value);
                say("amount", value);
              }}
              placeholder="0.00"
              keyboardType="numbers-and-punctuation"
              accessibilityLabel="Amount"
            />
            <InputGroupAddon align="inline-end">
              <InputGroupText>USD</InputGroupText>
            </InputGroupAddon>
          </InputGroup>

          {/* A composer: the group carries its radius and padding, the textarea grows with the
              message, the plus opens the attach menu (and turns to a cross while it is open), and
              the send button becomes stop while the reply streams. */}
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

            <InputGroup style={{ borderRadius: 22, padding: 6 }}>
              <InputGroupTextarea
                value={message()}
                onChange={({ value }) => {
                  message.set(value);
                  say("message", value);
                }}
                onContentSizeChange={({ size }) => grown.set(size.height)}
                style={grown() > 0 ? { height: grownFieldHeight(grown(), 5) } : undefined}
                placeholder="Ask anything"
                accessibilityLabel="Message"
                submitBehavior={desktop ? "submit" : "newline"}
                onSubmit={send}
              />
              <InputGroupAddon
                align="block-end"
                style={{ paddingHorizontal: 0, paddingBottom: 0, gap: 8 }}
              >
                <Popover open={attaching()} onOpenChange={({ open }) => attaching.set(open)}>
                  <PopoverTrigger>
                    <RoundButton
                      variant="secondary"
                      size="sm"
                      accessibilityLabel="Add an attachment"
                      style={{
                        transform: attaching() ? "rotate(45deg)" : undefined,
                        transitionProperty: "transform",
                        transitionDuration: 200,
                        transitionTimingFunction: "ease-out",
                      }}
                    >
                      <Icon icon={Plus} {...roundButtonGlyph("secondary", { size: "sm" })} />
                    </RoundButton>
                  </PopoverTrigger>
                  <PopoverContent placement="top" offset={10} width={200} compact>
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
                  </PopoverContent>
                </Popover>
                <View style={{ flex: 1 }} />
                <Text style={{ fontSize: 11, color: ui().faint }}>
                  {desktop
                    ? "Return sends · Shift-Return breaks the line"
                    : "Return breaks the line"}
                </Text>
                {replying() ? (
                  <RoundButton
                    size="sm"
                    accessibilityLabel="Stop the reply"
                    onPress={() => {
                      stop();
                      log("reply stopped");
                    }}
                  >
                    <Icon icon={Square} {...roundButtonGlyph("default", { size: "sm" })} />
                  </RoundButton>
                ) : (
                  <RoundButton
                    size="sm"
                    accessibilityLabel="Send"
                    disabled={message().trim().length === 0}
                    onPress={send}
                  >
                    <Icon icon={Send} {...roundButtonGlyph("default", { size: "sm" })} />
                  </RoundButton>
                )}
              </InputGroupAddon>
            </InputGroup>
          </View>

          {/* Addons over and under the control: a \`block-start\` addon takes a line of its own, and
              so does a \`block-end\` one. */}
          <InputGroup>
            <InputGroupAddon align="block-start">
              <Icon icon={Sparkles} size={14} tint={ui().muted} />
              <InputGroupText>Improve the wording</InputGroupText>
            </InputGroupAddon>
            <InputGroupTextarea
              value={note()}
              onChange={({ value }) => {
                note.set(value);
                say("note", value);
              }}
              placeholder="What changed?"
              accessibilityLabel="Release note"
            />
            <InputGroupAddon align="block-end">
              <InputGroupText>{\`\${note().length} / 200\`}</InputGroupText>
            </InputGroupAddon>
          </InputGroup>
        </View>
      </Split>

      <DemoCard>
        <DemoSection title="States">
          <InputGroup>
            <InputGroupAddon align="inline-start">
              <InputGroupText>@</InputGroupText>
            </InputGroupAddon>
            <InputGroupInput placeholder="Handle" accessibilityLabel="Handle" />
          </InputGroup>
          <InputGroup invalid>
            <InputGroupAddon align="inline-start">
              <InputGroupText>@</InputGroupText>
            </InputGroupAddon>
            <InputGroupInput value="ada@" accessibilityLabel="Handle, rejected" />
          </InputGroup>
          <InputGroup disabled>
            <InputGroupAddon align="inline-start">
              <InputGroupText>@</InputGroupText>
            </InputGroupAddon>
            <InputGroupInput value="ada" accessibilityLabel="Handle, disabled" />
          </InputGroup>
        </DemoSection>

        <DemoSection title="Button sizes">
          <InputGroup>
            <InputGroupInput placeholder="Filter the list" accessibilityLabel="Filter the list" />
            <InputGroupAddon align="inline-end">
              <InputGroupButton size="xs" accessibilityLabel="Apply the filter">
                <Icon icon={Search} {...buttonGlyph("ghost", { size: "sm" })} />
              </InputGroupButton>
              <InputGroupButton size="sm" accessibilityLabel="Clear the filter">
                <Icon icon={X} {...buttonGlyph("ghost", { size: "default" })} />
              </InputGroupButton>
              <InputGroupButton size="icon-xs" accessibilityLabel="Copy the filter">
                <Icon icon={CircleX} {...buttonGlyph("ghost", { size: "sm" })} />
              </InputGroupButton>
              <InputGroupButton size="icon-sm" accessibilityLabel="Save the filter">
                <Icon icon={Send} {...buttonGlyph("ghost", { size: "default" })} />
              </InputGroupButton>
            </InputGroupAddon>
          </InputGroup>
        </DemoSection>
      </DemoCard>
    </DemoPage>
  );
}

mount(App);
`;export{e as default};