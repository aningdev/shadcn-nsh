import { alpha, colors, hovered } from "@shadcn-nsh/theme";
// Sheet: the official gallery's scene (`references/nsh/examples/gallery/demos/Sheets.tsx`).
// Filters, a profile form, comments at two heights, and a mailbox drawer. Edge panels on a wide
// window, bottom panels on a narrow one. The Comments sheet rests at detents: it drags by the
// grabber the shell's `SheetContent` gives the bottom sheet (`nsh/base`'s own handle, styled).
import {
  Archive,
  ArrowUp,
  FileText,
  Inbox,
  ListFilter,
  MessageCircle,
  PanelLeft,
  Send,
  Star,
  X,
  type IconNode,
} from "lucide";
import type { JSX } from "nsh";
import { safeArea, Scroll, signal, Text, token, View, windowSize } from "nsh";
import type { SheetDetent } from "nsh/base";

import { Avatar } from "@/packages/ui/avatar";
import { Badge } from "@/packages/ui/badge";
import { Button, IconButton } from "@/packages/ui/button";
import { Icon } from "@/packages/ui/lib/icons";
import {
  Sheet,
  SheetContent,
  type SheetOpenChangeReason,
  type SheetSide,
} from "@/packages/ui/sheet";
import { Switch } from "@/packages/ui/switch";

import { DemoCard, DemoPage } from "../kit";
import {
  Choices,
  createEvents,
  createToaster,
  Field,
  pointer,
  Rule,
  Trigger,
  wideWindow,
  type ToastContent,
} from "./overlays-shared";

type Side = "left" | "right" | "bottom";
type Price = "any" | "under50" | "mid" | "over200";
type Filters = {
  sort: "relevance" | "newest" | "price";
  price: Price;
  stock: boolean;
  shipping: boolean;
  sale: boolean;
};
type Mailbox = { id: string; icon: IconNode; label: string; count?: number };
type Comment = { name: string; time: string; text: string; likes: number };

const prices: { value: Price; label: string; share: number }[] = [
  { value: "any", label: "Any", share: 1 },
  { value: "under50", label: "Under $50", share: 0.35 },
  { value: "mid", label: "$50–200", share: 0.45 },
  { value: "over200", label: "Over $200", share: 0.2 },
];

const none: Filters = {
  sort: "relevance",
  price: "any",
  stock: false,
  shipping: false,
  sale: false,
};

const results = (filters: Filters) =>
  Math.max(
    1,
    Math.round(
      128 *
        prices.find((price) => price.value === filters.price)!.share *
        (filters.stock ? 0.8 : 1) *
        (filters.shipping ? 0.6 : 1) *
        (filters.sale ? 0.25 : 1),
    ),
  );

const active = (filters: Filters) =>
  [
    filters.price !== "any" ? prices.find((price) => price.value === filters.price)!.label : null,
    filters.stock ? "In stock" : null,
    filters.shipping ? "Free shipping" : null,
    filters.sale ? "On sale" : null,
  ].filter((label): label is string => label !== null);

const comments: Comment[] = [
  {
    name: "Mira Chen",
    time: "2m",
    text: "The new onboarding flow feels so much calmer. Love the spacing.",
    likes: 24,
  },
  {
    name: "Theo Park",
    time: "8m",
    text: "Could the summary card show last week's total too?",
    likes: 9,
  },
  {
    name: "Ana Souza",
    time: "15m",
    text: "Tried it on a small phone: everything fits without the header scrolling away.",
    likes: 17,
  },
  {
    name: "Jonas Weber",
    time: "32m",
    text: "The contrast of the chart labels in dark mode is just right now.",
    likes: 12,
  },
  {
    name: "Priya Nair",
    time: "1h",
    text: "Switching tabs stays smooth even with the long list open.",
    likes: 31,
  },
  {
    name: "Leo Martin",
    time: "2h",
    text: "Small thing: the empty state could use a shorter sentence.",
    likes: 5,
  },
  {
    name: "Hana Sato",
    time: "3h",
    text: "Shipped it to the beta group, and the first answers are great.",
    likes: 42,
  },
  {
    name: "Omar Haddad",
    time: "5h",
    text: "The grabber makes it obvious the panel can grow. Nice touch.",
    likes: 18,
  },
];

const mailboxes: Mailbox[] = [
  { id: "inbox", icon: Inbox, label: "Inbox", count: 12 },
  { id: "starred", icon: Star, label: "Starred" },
  { id: "sent", icon: Send, label: "Sent" },
  { id: "drafts", icon: FileText, label: "Drafts", count: 2 },
  { id: "archive", icon: Archive, label: "Archive" },
];

const toggles = [
  ["stock", "In stock"],
  ["shipping", "Free shipping"],
  ["sale", "On sale"],
] as const;

function Head(props: { title: string; right?: JSX.Element; onClose: () => void }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
      <Text
        style={{
          flex: 1,
          fontSize: pointer ? 16 : 18,
          fontWeight: "600",
          color: colors.foreground,
        }}
      >
        {props.title}
      </Text>
      {props.right}
      <IconButton accessibilityLabel="Close" onPress={props.onClose} icon={X} />
    </View>
  );
}

function Group(props: { title: string; children: JSX.Element }) {
  return (
    <View style={{ gap: 8 }}>
      <Text style={{ fontSize: pointer ? 12 : 13, fontWeight: "600", color: colors.faint }}>
        {props.title}
      </Text>
      {props.children}
    </View>
  );
}

export function SheetDemo() {
  const { log, Events } = createEvents("Open a sheet");
  const { toast, Toaster } = createToaster();
  const wide = wideWindow();
  const changed =
    (name: string, set: (open: boolean) => void) =>
    ({ open, reason }: { open: boolean; reason: SheetOpenChangeReason }) => {
      set(open);
      log(`${name} ${open ? "opened" : "closed"} (${reason})`);
    };

  return (
    <DemoPage title="Sheet">
      <FilterSheet wide={wide} log={log} changed={changed} />
      <ProfileSheet wide={wide} log={log} toast={toast} changed={changed} />
      <CommentsSheet log={log} changed={changed} />
      <Drawer log={log} changed={changed} />
      <Events />
      <Toaster />
    </DemoPage>
  );
}

function FilterSheet(props: {
  wide: boolean;
  log: (line: string) => void;
  changed: (
    name: string,
    set: (open: boolean) => void,
  ) => (event: { open: boolean; reason: SheetOpenChangeReason }) => void;
}) {
  const { wide, log, changed } = props;
  const side: Side = wide ? "right" : "bottom";
  const open = signal(false);
  const applied = signal<Filters>(none);
  const draft = signal<Filters>(none);
  const edit = (change: Partial<Filters>) => draft.set({ ...draft(), ...change });
  const show = () => {
    draft.set(applied());
    open.set(true);
  };
  const apply = () => {
    applied.set(draft());
    open.set(false);
    log(`applied ${active(draft()).join(", ") || "no filters"}`);
  };
  return (
    <DemoCard
      title="Filter the results"
      subtitle="A draft: the footer applies it, closing discards"
    >
      <View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <Trigger label="Filters" icon={ListFilter} open={open()} onPress={show} />
          <Text
            style={{
              flex: 1,
              fontSize: pointer ? 13 : 15,
              color: colors.mutedForeground,
              fontVariant: ["tabular-nums"],
            }}
          >
            {`${results(applied())} results`}
          </Text>
        </View>
        <Sheet open={open()} onOpenChange={changed("filters", (value) => open.set(value))}>
          <SheetContent
            side={side as SheetSide}
            accessibilityLabel="Filters"
            closeOnSwipe={side === "bottom"}
          >
            <Head
              title="Filters"
              onClose={() => open.set(false)}
              right={
                <If when={active(draft()).length > 0}>
                  <Badge tone="accent">{`${active(draft()).length}`}</Badge>
                </If>
              }
            />
            <Group title="Sort by">
              <Choices
                label="Sort by"
                value={draft().sort}
                onChange={(sort) => edit({ sort: sort as Filters["sort"] })}
                options={[
                  { value: "relevance", label: "Relevance" },
                  { value: "newest", label: "Newest" },
                  { value: "price", label: "Price" },
                ]}
              />
            </Group>
            <Group title="Price">
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
                <Each of={prices}>
                  {(price) => (
                    <Button
                      size="sm"
                      variant="secondary"
                      selected={draft().price === price().value}
                      onPress={() => edit({ price: price().value })}
                    >
                      {price().label}
                    </Button>
                  )}
                </Each>
              </View>
            </Group>
            <Group title="Show only">
              <View style={{ gap: 4 }}>
                <Each of={toggles}>
                  {(row) => (
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        minHeight: pointer ? 32 : 44,
                      }}
                    >
                      <Text
                        style={{ flex: 1, fontSize: pointer ? 13 : 15, color: colors.foreground }}
                      >
                        {row()[1]}
                      </Text>
                      <Switch
                        accessibilityLabel={row()[1]}
                        checked={draft()[row()[0]]}
                        onChange={({ checked }) => edit({ [row()[0]]: checked })}
                      />
                    </View>
                  )}
                </Each>
              </View>
            </Group>
            <Rule />
            <View style={{ flexDirection: "row", gap: 8 }}>
              <Button
                variant="ghost"
                disabled={active(draft()).length === 0 && draft().sort === "relevance"}
                onPress={() => draft.set(none)}
              >
                Reset
              </Button>
              <Button style={{ flex: 1 }} onPress={apply}>
                {`Show ${results(draft())} results`}
              </Button>
            </View>
          </SheetContent>
        </Sheet>
      </View>
      <If when={active(applied()).length > 0}>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
          <Each of={active(applied())}>{(label) => <Badge tone="accent">{label()}</Badge>}</Each>
        </View>
      </If>
    </DemoCard>
  );
}

function ProfileSheet(props: {
  wide: boolean;
  log: (line: string) => void;
  toast: (content: ToastContent) => Promise<string | null>;
  changed: (
    name: string,
    set: (open: boolean) => void,
  ) => (event: { open: boolean; reason: SheetOpenChangeReason }) => void;
}) {
  const { wide, log, toast, changed } = props;
  const side: Side = wide ? "right" : "bottom";
  const open = signal(false);
  const saved = signal({
    name: "Mira Chen",
    username: "mira",
    bio: "Design lead. Motion, type and the space between.",
  });
  const name = signal("");
  const username = signal("");
  const bio = signal("");
  const show = () => {
    name.set(saved().name);
    username.set(saved().username);
    bio.set(saved().bio);
    open.set(true);
  };
  const dirty = () =>
    name() !== saved().name || username() !== saved().username || bio() !== saved().bio;
  const valid = () =>
    name().trim().length > 0 && /^[a-z0-9_.]{2,20}$/.test(username()) && bio().length <= 160;
  const save = () => {
    saved.set({ name: name().trim(), username: username(), bio: bio() });
    open.set(false);
    log(`saved @${username()}`);
    void toast({ kind: "success", title: "Profile saved", description: `@${username()}` });
  };
  return (
    <DemoCard title="A form" subtitle="Save waits for a change and valid fields">
      <View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <Avatar
            name={saved().name}
            style={{ width: pointer ? 36 : 44, height: pointer ? 36 : 44 }}
          />
          <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
            <Text
              style={{ fontSize: pointer ? 14 : 16, fontWeight: "600", color: colors.foreground }}
            >
              {saved().name}
            </Text>
            <Text
              style={{
                numberOfLines: 1,
                fontSize: pointer ? 12 : 13,
                color: colors.mutedForeground,
              }}
            >
              {`@${saved().username} · ${saved().bio}`}
            </Text>
          </View>
          <Button variant="secondary" selected={open()} onPress={show}>
            Edit profile
          </Button>
        </View>
        <Sheet open={open()} onOpenChange={changed("profile", (value) => open.set(value))}>
          <SheetContent
            side={side as SheetSide}
            accessibilityLabel="Edit profile"
            closeOnSwipe={side === "bottom"}
          >
            <Head title="Edit profile" onClose={() => open.set(false)} />
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
              <Avatar name={name() || "?"} style={{ width: 52, height: 52 }} />
              <Button variant="secondary" size="sm" onPress={() => log("change photo")}>
                Change photo
              </Button>
            </View>
            <Group title="Name">
              <Field
                value={name()}
                onChange={({ value }) => name.set(value)}
                placeholder="Your name"
                accessibilityLabel="Name"
                returnKeyType="next"
              />
            </Group>
            <Group title="Username">
              <Field
                prefix="@"
                value={username()}
                onChange={({ value }) => username.set(value.toLowerCase())}
                autoCapitalize="none"
                placeholder="name"
                accessibilityLabel="Username"
              />
              <If when={!/^[a-z0-9_.]{2,20}$/.test(username())}>
                <Text style={{ fontSize: 12, color: colors.destructive }}>
                  2 to 20 letters, digits, dots or underscores
                </Text>
              </If>
            </Group>
            <Group title="Bio">
              <Field
                multiline
                value={bio()}
                onChange={({ value }) => bio.set(value)}
                placeholder="A line about you"
                accessibilityLabel="Bio"
              />
              <Text
                style={{
                  alignSelf: "flex-end",
                  fontSize: 12,
                  color: bio().length > 160 ? colors.destructive : colors.faint,
                  fontVariant: ["tabular-nums"],
                }}
              >
                {`${bio().length} / 160`}
              </Text>
            </Group>
            <View style={{ flexDirection: "row", gap: 8 }}>
              <Button style={{ flex: 1 }} variant="secondary" onPress={() => open.set(false)}>
                Cancel
              </Button>
              <Button style={{ flex: 1 }} disabled={!dirty() || !valid()} onPress={save}>
                Save
              </Button>
            </View>
          </SheetContent>
        </Sheet>
      </View>
    </DemoCard>
  );
}

function CommentsSheet(props: {
  log: (line: string) => void;
  changed: (
    name: string,
    set: (open: boolean) => void,
  ) => (event: { open: boolean; reason: SheetOpenChangeReason }) => void;
}) {
  const { log, changed } = props;
  const open = signal(false);
  const detent = signal<SheetDetent>("medium");
  const thread = signal<Comment[]>(comments);
  const draft = signal("");
  const named = (value: SheetDetent) => (typeof value === "string" ? value : "custom");
  const send = () => {
    const text = draft().trim();
    if (!text) return;
    thread.set([{ name: "You", time: "now", text, likes: 0 }, ...thread()]);
    draft.set("");
    log("comment sent");
  };
  return (
    <DemoCard
      title="Resting heights"
      subtitle="Half the screen or all of it: drag, flick or press the grabber"
    >
      <View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <Trigger
            label="Comments"
            icon={MessageCircle}
            open={open()}
            onPress={() => {
              detent.set("medium");
              open.set(true);
            }}
          />
          <Text style={{ fontSize: 13, color: colors.mutedForeground }}>
            {`${thread().length} comments${open() ? (named(detent()) === "large" ? " · Full height" : " · Half height") : ""}`}
          </Text>
        </View>
        <Sheet open={open()} onOpenChange={changed("comments", (value) => open.set(value))}>
          <SheetContent
            accessibilityLabel="Comments"
            closeOnSwipe
            detents={["medium", "large"]}
            detent={detent()}
            onDetentChange={({ detent: next }) => {
              detent.set(next);
              log(`comments at ${named(next)}`);
            }}
            grabberAccessibilityLabel="Resize comments"
            footer={
              <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                <Avatar
                  name="You"
                  style={{ width: pointer ? 28 : 34, height: pointer ? 28 : 34 }}
                />
                <Field
                  value={draft()}
                  onChange={({ value }) => draft.set(value)}
                  placeholder="Add a comment"
                  accessibilityLabel="Comment"
                  returnKeyType="send"
                  onSubmit={send}
                />
                <Trigger
                  icon={ArrowUp}
                  variant="default"
                  accessibilityLabel="Send"
                  disabled={!draft().trim()}
                  onPress={send}
                />
              </View>
            }
            footerStyle={{
              marginHorizontal: -16,
              marginBottom: -(safeArea().bottom + 16),
              paddingHorizontal: 16,
              paddingTop: 10,
              paddingBottom: safeArea().bottom + 10,
              borderTopWidth: 1,
              borderColor: colors.border,
              backgroundColor: colors.card,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <Text
                style={{
                  flex: 1,
                  fontSize: pointer ? 16 : 18,
                  fontWeight: "600",
                  color: colors.foreground,
                }}
              >
                Comments
              </Text>
              <Trigger
                icon={X}
                variant="ghost"
                accessibilityLabel="Close"
                onPress={() => open.set(false)}
              />
            </View>
            <Scroll
              style={{ flex: 1, marginHorizontal: -16 }}
              contentStyle={{ paddingHorizontal: 16, gap: 16, paddingBottom: 8 }}
            >
              <Each of={thread()}>
                {(comment) => (
                  <View style={{ flexDirection: "row", gap: 12 }}>
                    <Avatar
                      name={comment().name}
                      style={{ width: pointer ? 32 : 38, height: pointer ? 32 : 38 }}
                    />
                    <View style={{ flex: 1, gap: 3 }}>
                      <View style={{ flexDirection: "row", alignItems: "baseline", gap: 6 }}>
                        <Text
                          style={{
                            fontSize: pointer ? 13 : 15,
                            fontWeight: "600",
                            color: colors.foreground,
                          }}
                        >
                          {comment().name}
                        </Text>
                        <Text style={{ fontSize: pointer ? 12 : 13, color: colors.faint }}>
                          {comment().time}
                        </Text>
                      </View>
                      <Text
                        style={{
                          fontSize: pointer ? 13 : 15,
                          lineHeight: pointer ? 19 : 21,
                          color: colors.mutedForeground,
                        }}
                      >
                        {comment().text}
                      </Text>
                      <Text
                        style={{
                          fontSize: pointer ? 12 : 13,
                          color: colors.faint,
                          fontVariant: ["tabular-nums"],
                        }}
                      >
                        {`${comment().likes} likes`}
                      </Text>
                    </View>
                  </View>
                )}
              </Each>
            </Scroll>
          </SheetContent>
        </Sheet>
      </View>
    </DemoCard>
  );
}

function Drawer(props: {
  log: (line: string) => void;
  changed: (
    name: string,
    set: (open: boolean) => void,
  ) => (event: { open: boolean; reason: SheetOpenChangeReason }) => void;
}) {
  const { log, changed } = props;
  const open = signal(false);
  const box = signal("inbox");
  const current = () => mailboxes.find((mailbox) => mailbox.id === box())!;
  return (
    <DemoCard title="A drawer" subtitle="Navigation from the leading edge; choosing closes it">
      <View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <Trigger
            label={current().label}
            icon={PanelLeft}
            open={open()}
            onPress={() => open.set(true)}
          />
          <Text style={{ fontSize: 13, color: colors.mutedForeground }}>
            {current().count ? `${current().count} unread` : "All read"}
          </Text>
        </View>
        <Sheet open={open()} onOpenChange={changed("drawer", (value) => open.set(value))}>
          <SheetContent
            side="left"
            accessibilityLabel="Mailboxes"
            popupStyle={{
              width: Math.min(280, windowSize().width - 64),
              paddingHorizontal: 10,
              gap: 2,
            }}
          >
            <Text
              style={{
                fontSize: pointer ? 12 : 13,
                fontWeight: "600",
                color: colors.faint,
                paddingHorizontal: 10,
                paddingBottom: 6,
              }}
            >
              Mailboxes
            </Text>
            <Each of={mailboxes}>
              {(mailbox) => (
                <View
                  role="button"
                  accessibilityLabel={mailbox().label}
                  accessibilityState={{ selected: box() === mailbox().id }}
                  onPress={() => {
                    box.set(mailbox().id);
                    open.set(false);
                    log(`mailbox ${mailbox().label}`);
                  }}
                  hoverStyle={box() === mailbox().id ? undefined : hovered()}
                  activeStyle={{ backgroundColor: alpha(colors.foreground, 0.1) }}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 12,
                    height: pointer ? 32 : 46,
                    paddingHorizontal: 10,
                    borderRadius: pointer ? 7 : 10,
                    backgroundColor: box() === mailbox().id ? token("accent") : "transparent",
                  }}
                >
                  <Icon
                    icon={mailbox().icon}
                    size={pointer ? 15 : 19}
                    tint={box() === mailbox().id ? colors.foreground : colors.mutedForeground}
                  />
                  <Text
                    style={{
                      flex: 1,
                      fontSize: pointer ? 13 : 16,
                      fontWeight: box() === mailbox().id ? "600" : "400",
                      color: colors.foreground,
                    }}
                  >
                    {mailbox().label}
                  </Text>
                  <If when={mailbox().count}>
                    <Text
                      style={{
                        fontSize: pointer ? 12 : 14,
                        color: colors.faint,
                        fontVariant: ["tabular-nums"],
                      }}
                    >
                      {mailbox().count}
                    </Text>
                  </If>
                </View>
              )}
            </Each>
          </SheetContent>
        </Sheet>
      </View>
    </DemoCard>
  );
}
