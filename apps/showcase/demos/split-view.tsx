import { alpha, colors, focusRing, hovered, radius, rounded } from "@shadcn-nsh/theme";
// SplitView: the official gallery's mail scene
// (`references/nsh/examples/gallery/demos/SplitViewDemo.tsx`) in three columns — the mailboxes, a
// mailbox's messages, the message, which pushes a reply — each a stack of its own. The columns,
// their headers and the sidebar button are this library's `SplitView`; the rows, the reply and
// which column is in front stay this scene's.
import { Archive, ArrowLeft, FileText, Inbox, Send, Star, Undo2 } from "lucide";
import { effect, platform, Scroll, signal, Text, untracked, View } from "nsh";
import { horizontalSizeClass } from "nsh";
import { BackHandler } from "nsh/mobile";

import { IconButton } from "@/packages/ui/button";
import { Input } from "@/packages/ui/input";
import { Icon } from "@/packages/ui/lib/icons";
import { density } from "@/packages/ui/lib/surface";
import { createNavStack, NavStack } from "@/packages/ui/nav-stack";
import {
  SplitView,
  SplitViewContent,
  SplitViewDetail,
  SplitViewSidebar,
  SplitViewTrigger,
  type ColumnVisibility,
} from "@/packages/ui/split-view";

type Mailbox = { id: string; title: string; icon: typeof Inbox };

const MAILBOXES: Mailbox[] = [
  { id: "inbox", title: "Inbox", icon: Inbox },
  { id: "starred", title: "Starred", icon: Star },
  { id: "drafts", title: "Drafts", icon: FileText },
  { id: "sent", title: "Sent", icon: Send },
  { id: "archive", title: "Archive", icon: Archive },
];

type Message = {
  id: number;
  mailbox: string;
  from: string;
  subject: string;
  time: string;
  unread?: boolean;
  body: string[];
};

const MESSAGES: Message[] = [
  {
    id: 1,
    mailbox: "inbox",
    from: "Maya Chen",
    subject: "Design review on Thursday",
    time: "9:41",
    unread: true,
    body: [
      "Hi, the review moved to Thursday at 10. I attached the latest flows for the onboarding screens.",
      "Could you look at the empty states before then? The sidebar collapses differently on phones now.",
    ],
  },
  {
    id: 2,
    mailbox: "inbox",
    from: "Lucas Moreau",
    subject: "Release notes for 0.6",
    time: "8:15",
    unread: true,
    body: [
      "The draft notes are in the shared folder.",
      "Split views, size classes and the new gallery demos are in; the rest is fixes.",
    ],
  },
  {
    id: 3,
    mailbox: "inbox",
    from: "Aiko Tanaka",
    subject: "Lunch next week?",
    time: "Yesterday",
    body: ["I'll be in town from Tuesday. Wednesday works best for me, anywhere near the office."],
  },
  {
    id: 4,
    mailbox: "starred",
    from: "Maya Chen",
    subject: "Brand colors, final",
    time: "Mon",
    body: [
      "Attached are the final brand colors, with the dark theme's tones checked for contrast.",
    ],
  },
  {
    id: 5,
    mailbox: "drafts",
    from: "Me",
    subject: "Quarterly update",
    time: "Sun",
    body: ["Shipped this quarter: the new navigation, faster lists and the first desktop release."],
  },
  {
    id: 6,
    mailbox: "sent",
    from: "Me",
    subject: "Re: Release notes for 0.6",
    time: "Sat",
    body: ["Looks good. I'd lead with split views and keep the fixes short."],
  },
  {
    id: 7,
    mailbox: "archive",
    from: "Jonas Berg",
    subject: "Conference badges",
    time: "Mar 2",
    body: ["Your badge is at the front desk. The talks start at nine in hall B."],
  },
];

const messagesIn = (mailbox: string) => MESSAGES.filter((m) => m.mailbox === mailbox);

/** iOS shows the system's headers and buttons; elsewhere the app's bar does, with the way back
 * where one column shows. */
const ios = platform.os === "ios";
/** A header button: an icon, and a label where it says where it goes. */
function HeaderButton(props: {
  icon: typeof ArrowLeft;
  label: string;
  title?: string;
  onPress: () => void;
}) {
  return (
    <View
      onPress={props.onPress}
      role="button"
      accessibilityLabel={props.label}
      hitSlop={6}
      hoverStyle={hovered()}
      focusVisibleStyle={focusRing()}
      style={{
        height: 28,
        flexDirection: "row",
        alignItems: "center",
        gap: 2,
        paddingStart: 4,
        paddingEnd: props.title ? 8 : 4,
        ...rounded(radius.control),
      }}
    >
      <Icon icon={props.icon} size={18} tint={colors.foreground} />
      {(props.title || platform.desktop === false) && (
        <Text style={{ fontSize: 13, fontWeight: "500", color: colors.foreground }}>
          {props.title ?? props.label}
        </Text>
      )}
    </View>
  );
}

/** A mailbox of the sidebar: its icon, its title and its unread count. */
function MailboxRow(props: { mailbox: Mailbox; selected: boolean; onPress: () => void }) {
  const unread = () => messagesIn(props.mailbox.id).filter((m) => m.unread).length;
  return (
    <View
      onPress={props.onPress}
      role="button"
      accessibilityLabel={props.mailbox.title}
      accessibilityState={{ selected: props.selected }}
      hoverStyle={props.selected ? undefined : hovered()}
      focusVisibleStyle={focusRing()}
      style={{
        height: density.row - (platform.desktop ? 6 : 0),
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        paddingHorizontal: 10,
        ...rounded(radius.control),
        backgroundColor: props.selected ? colors.sidebarAccent : "transparent",
      }}
    >
      <Icon
        icon={props.mailbox.icon}
        size={16}
        tint={props.selected ? colors.brand : colors.mutedForeground}
      />
      <Text
        style={{
          flex: 1,
          numberOfLines: 1,
          fontSize: density.body,
          fontWeight: props.selected ? "600" : "500",
          color: colors.foreground,
        }}
      >
        {props.mailbox.title}
      </Text>
      {unread() > 0 && (
        <Text
          style={{
            fontSize: density.note,
            fontVariant: ["tabular-nums"],
            color: colors.mutedForeground,
          }}
        >
          {String(unread())}
        </Text>
      )}
    </View>
  );
}

/** A message of a mailbox: who sent it and when, its subject, the start of its text; a dot while
 * unread. */
function MessageRow(props: {
  message: Message;
  selected: boolean;
  first: boolean;
  onPress: () => void;
}) {
  const m = props.message;
  return (
    <View
      onPress={props.onPress}
      role="button"
      accessibilityLabel={`${m.from}, ${m.subject}`}
      accessibilityState={{ selected: props.selected }}
      hoverStyle={props.selected ? undefined : hovered()}
      focusVisibleStyle={focusRing()}
      style={{
        flexDirection: "row",
        gap: 10,
        paddingVertical: 12,
        paddingEnd: 16,
        paddingStart: 10,
        borderTopWidth: props.first ? 0 : 1,
        borderTopColor: colors.line,
        backgroundColor: props.selected ? alpha(colors.brand, 0.12) : "transparent",
      }}
    >
      <View style={{ width: 8, paddingTop: 6, alignItems: "center" }}>
        {m.unread && (
          <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: colors.brand }} />
        )}
      </View>
      <View style={{ flex: 1, gap: 3 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Text
            style={{
              flex: 1,
              numberOfLines: 1,
              fontSize: density.body,
              fontWeight: m.unread ? "600" : "500",
              color: colors.foreground,
            }}
          >
            {m.from}
          </Text>
          <Text
            style={{ fontSize: density.note, fontVariant: ["tabular-nums"], color: colors.faint }}
          >
            {m.time}
          </Text>
        </View>
        <Text style={{ numberOfLines: 1, fontSize: density.note + 1, color: colors.foreground }}>
          {m.subject}
        </Text>
        <Text
          style={{
            numberOfLines: 2,
            fontSize: density.note,
            lineHeight: density.note + 5,
            color: colors.mutedForeground,
          }}
        >
          {m.body[0]}
        </Text>
      </View>
    </View>
  );
}

/**
 * The mail in three columns, each a stack of its own: the mailboxes, a mailbox's messages and
 * the message, which pushes a reply. Where the window is compact one column shows: a selection
 * brings the next one in front, and back returns to the one before.
 */
export function SplitViewDemo() {
  const visibility = signal<ColumnVisibility>("automatic");
  // The room the view itself has, which the window's size class knows nothing
  // of: the shell can leave a regular window's view too little for the
  // columns. (`narrow`, below, reads it.)
  const room = signal(0);
  const mailbox = signal("inbox");
  const selected = signal<number>(MESSAGES[0]!.id);
  const draft = signal("");
  const sidebarNav = createNavStack(["mailboxes"]);
  const listNav = createNavStack(["messages"]);
  const messageNav = createNavStack<"message" | "reply">(["message"]);
  // One column shows where the window is compact: a selection brings the
  // next column in front, back returns to the one before.
  const compact = () => horizontalSizeClass() === "compact";
  // Narrow is the room, past the size class: where the window is regular but
  // the room the shell leaves fits no three 320-point columns, the view
  // starts at two of them instead of clipping the detail to a sliver.
  const narrow = () => !compact() && room() > 0 && room() < 960;
  effect(() => {
    if (narrow() && visibility() === "automatic") visibility.set("doubleColumn");
  });
  const sidebarShown = () => ["automatic", "all"].includes(visibility());
  const openMailbox = (id: string) => {
    mailbox.set(id);
    selected.set(messagesIn(id)[0]?.id ?? -1);
    messageNav.popToRoot();
    if (compact()) visibility.set("doubleColumn");
  };
  const openMessage = (id: number) => {
    selected.set(id);
    messageNav.popToRoot();
    if (compact()) visibility.set("detailOnly");
  };
  const message = () => MESSAGES.find((m) => m.id === selected());
  const box = () => MAILBOXES.find((b) => b.id === mailbox()) ?? MAILBOXES[0]!;
  // Android's back button steps back a column where one shows, once the
  // column's own stack has nothing to pop.
  BackHandler.on("press", () => {
    if (!compact()) return false;
    const shown = untracked(visibility);
    if (shown === "detailOnly" && untracked(messageNav.routes).length === 1) {
      visibility.set("doubleColumn");
      return true;
    }
    if (shown === "doubleColumn") {
      visibility.set("all");
      return true;
    }
    return false;
  });
  // The way back where one column shows (iOS has the system's), and the
  // sidebar's button where the columns stand side by side.
  const back = (title: string, to: ColumnVisibility) =>
    !ios && compact() ? (
      <HeaderButton
        icon={ArrowLeft}
        label={`Back to ${title}`}
        title={title}
        onPress={() => visibility.set(to)}
      />
    ) : undefined;
  const sidebarToggle = () =>
    !ios && !compact() ? (
      <SplitViewTrigger
        columnVisibility={visibility()}
        onColumnVisibilityChange={({ columnVisibility }) => visibility.set(columnVisibility)}
        accessibilityLabel={sidebarShown() ? "Hide the mailboxes" : "Show the mailboxes"}
      />
    ) : undefined;
  return (
    <View style={{ flex: 1 }} onLayout={({ bounds }) => room.set(bounds.size.width)}>
      <SplitView
        style={{ flex: 1, backgroundColor: colors.background }}
        columnVisibility={visibility()}
        onColumnVisibilityChange={({ columnVisibility }) => visibility.set(columnVisibility)}
        sidebar={
          <NavStack state={sidebarNav}>
            {() => (
              <SplitViewSidebar title="Mailboxes">
                <Scroll style={{ flex: 1 }}>
                  <View style={{ padding: 8, gap: 2 }}>
                    <Each of={MAILBOXES}>
                      {(b) => (
                        <MailboxRow
                          mailbox={b()}
                          selected={!compact() && mailbox() === b().id}
                          onPress={() => openMailbox(b().id)}
                        />
                      )}
                    </Each>
                  </View>
                </Scroll>
              </SplitViewSidebar>
            )}
          </NavStack>
        }
        content={
          <NavStack state={listNav}>
            {() => (
              <SplitViewContent
                title={box().title}
                leading={back("Mailboxes", "all") ?? sidebarToggle()}
              >
                <Scroll style={{ flex: 1 }}>
                  <Each of={messagesIn(mailbox())}>
                    {(m, i) => (
                      <MessageRow
                        message={m()}
                        first={i() === 0}
                        selected={!compact() && selected() === m().id}
                        onPress={() => openMessage(m().id)}
                      />
                    )}
                  </Each>
                  <If when={messagesIn(mailbox()).length === 0}>
                    <Text
                      style={{
                        padding: 24,
                        textAlign: "center",
                        fontSize: density.body,
                        color: colors.mutedForeground,
                      }}
                    >
                      No messages
                    </Text>
                  </If>
                </Scroll>
              </SplitViewContent>
            )}
          </NavStack>
        }
        detail={
          <NavStack state={messageNav}>
            {(route) =>
              route === "message" ? (
                <SplitViewDetail
                  title={message()?.subject ?? "Message"}
                  leading={back(box().title, "doubleColumn")}
                  trailing={
                    message() ? (
                      <IconButton
                        accessibilityLabel="Reply"
                        onPress={() => messageNav.push("reply")}
                      >
                        <Icon icon={Undo2} size={17} tint={colors.mutedForeground} />
                      </IconButton>
                    ) : undefined
                  }
                >
                  <If
                    when={message()}
                    else={
                      <Text
                        style={{
                          margin: 24,
                          textAlign: "center",
                          fontSize: density.body,
                          color: colors.mutedForeground,
                        }}
                      >
                        No message selected
                      </Text>
                    }
                  >
                    {(m) => (
                      <Scroll style={{ flex: 1 }}>
                        <View
                          style={{
                            paddingHorizontal: platform.desktop ? 28 : 18,
                            paddingVertical: 20,
                            gap: 18,
                            maxWidth: 720,
                          }}
                        >
                          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                            <View
                              style={{
                                width: 40,
                                height: 40,
                                borderRadius: 20,
                                alignItems: "center",
                                justifyContent: "center",
                                backgroundColor: alpha(colors.brand, 0.16),
                              }}
                            >
                              <Text
                                style={{ fontSize: 15, fontWeight: "600", color: colors.brand }}
                              >
                                {m()
                                  .from.split(" ")
                                  .map((w) => w[0])
                                  .join("")
                                  .slice(0, 2)}
                              </Text>
                            </View>
                            <View style={{ flex: 1, gap: 2 }}>
                              <Text
                                style={{
                                  fontSize: density.body,
                                  fontWeight: "600",
                                  color: colors.foreground,
                                }}
                              >
                                {m().from}
                              </Text>
                              <Text
                                style={{ fontSize: density.note, color: colors.mutedForeground }}
                              >
                                {`To me · ${m().time}`}
                              </Text>
                            </View>
                          </View>
                          <Text
                            style={{
                              fontSize: 20,
                              lineHeight: 26,
                              fontWeight: "600",
                              color: colors.foreground,
                            }}
                          >
                            {m().subject}
                          </Text>
                          <View style={{ gap: 12 }}>
                            <Each of={m().body}>
                              {(p) => (
                                <Text
                                  style={{
                                    fontSize: platform.desktop ? 14 : 16,
                                    lineHeight: platform.desktop ? 21 : 24,
                                    color: colors.foreground,
                                  }}
                                >
                                  {p()}
                                </Text>
                              )}
                            </Each>
                          </View>
                        </View>
                      </Scroll>
                    )}
                  </If>
                </SplitViewDetail>
              ) : (
                <SplitViewDetail
                  title="Reply"
                  leading={
                    <HeaderButton
                      icon={ArrowLeft}
                      label="Back to the message"
                      title="Message"
                      onPress={() => messageNav.pop()}
                    />
                  }
                >
                  <View style={{ flex: 1, padding: platform.desktop ? 20 : 16, gap: 10 }}>
                    <Text style={{ fontSize: density.note, color: colors.mutedForeground }}>
                      {`To ${message()?.from ?? ""}`}
                    </Text>
                    {/* What is typed stays as the window narrows and widens: the column keeps its page. */}
                    <Input
                      multiline
                      value={draft()}
                      onChange={({ value }) => draft.set(value)}
                      placeholder="Write a reply"
                      accessibilityLabel="Reply text"
                      style={{ flex: 1, minHeight: 120, padding: 12, fontSize: density.body }}
                    />
                  </View>
                </SplitViewDetail>
              )
            }
          </NavStack>
        }
      />
    </View>
  );
}
