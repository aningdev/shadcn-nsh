import { alpha, colors, hovered } from "@shadcn-nsh/theme";
// Popover: the official gallery's scene (`references/nsh/examples/gallery/demos/Popovers.tsx`)
// with this library's parts. The trigger is one of the scene's own views, handed to
// `PopoverTrigger` as its element: `nsh/base` puts the press, focus and open state on it, so its
// look, name and hover stay as the scene draws them.
import {
  AlarmClock,
  BellRing,
  CalendarDays,
  Check,
  CircleX,
  Clock,
  FileText,
  Globe,
  Lock,
  MapPin,
  Plus,
  Share2,
  Sunrise,
  type IconNode,
} from "lucide";
import { signal, Text, View } from "nsh";

import { Avatar } from "@/packages/ui/avatar";
import { Badge } from "@/packages/ui/badge";
import { Button } from "@/packages/ui/button";
import { Icon } from "@/packages/ui/lib/icons";
import type { PopupSide } from "@/packages/ui/lib/popup";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
  type PopoverOpenChangeReason,
} from "@/packages/ui/popover";
import { Stat } from "@/packages/ui/stat";
import { Switch } from "@/packages/ui/switch";

import { Caption, DemoCard, DemoPage } from "../kit";
import {
  Choices,
  createEvents,
  createToaster,
  Field,
  placementWords,
  pointer,
  Rule,
  tap,
  Trigger,
  type ToastContent,
} from "./overlays-shared";

type Role = "Owner" | "Can edit" | "Can view";
type Person = { name: string; email: string; role: Role };

const reminders: { id: string; icon: IconNode; label: string; when: string }[] = [
  { id: "later", icon: Clock, label: "Later today", when: "18:00" },
  { id: "tomorrow", icon: Sunrise, label: "Tomorrow", when: "Thu 09:00" },
  { id: "week", icon: CalendarDays, label: "Next week", when: "Mon 09:00" },
];

function Head(props: { title: string; note?: string }) {
  return (
    <View style={{ gap: 2 }}>
      <Text style={{ fontSize: pointer ? 14 : 16, fontWeight: "600", color: colors.foreground }}>
        {props.title}
      </Text>
      <If when={props.note}>
        <Text style={{ fontSize: pointer ? 12 : 13, color: colors.mutedForeground }}>
          {props.note}
        </Text>
      </If>
    </View>
  );
}

export function PopoverDemo() {
  const { log, Events } = createEvents("Open a popover");
  const { toast, dismissToast, Toaster } = createToaster();
  const changed =
    (name: string) =>
    ({ open, reason }: { open: boolean; reason: PopoverOpenChangeReason }) =>
      log(`${name} ${open ? "opened" : "closed"} · ${reason}`);

  return (
    <DemoPage title="Popover">
      <Share log={log} toast={toast} changed={changed} />
      <Profile log={log} changed={changed} />
      <Reminder log={log} toast={toast} dismissToast={dismissToast} changed={changed} />
      <Placement changed={changed} />
      <Events />
      <Toaster />
    </DemoPage>
  );
}

function Share(props: {
  log: (line: string) => void;
  toast: (content: ToastContent) => Promise<string | null>;
  changed: (name: string) => (event: { open: boolean; reason: PopoverOpenChangeReason }) => void;
}) {
  const { log, toast, changed } = props;
  const open = signal(false);
  const people = signal<Person[]>([
    { name: "Floyd Wang", email: "floyd@acme.dev", role: "Owner" },
    { name: "Mira Chen", email: "mira@acme.dev", role: "Can edit" },
    { name: "Ravi Patel", email: "ravi@acme.dev", role: "Can view" },
  ]);
  const invite = signal("");
  const anyone = signal(false);
  const copied = signal(false);
  const reset = signal<ReturnType<typeof setTimeout> | undefined>(undefined);
  const valid = () => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(invite().trim());
  const add = () => {
    if (!valid()) return;
    const email = invite().trim();
    const name = email
      .split("@")[0]!
      .replace(/[._-]+/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
    people.set([...people(), { name, email, role: "Can view" }]);
    invite.set("");
    log(`invited ${email}`);
  };
  const toggleRole = (email: string) =>
    people.set(
      people().map((person) =>
        person.email === email && person.role !== "Owner"
          ? { ...person, role: person.role === "Can view" ? "Can edit" : "Can view" }
          : person,
      ),
    );
  const copy = () => {
    copied.set(true);
    clearTimeout(reset());
    reset.set(setTimeout(() => copied.set(false), 1600));
    void toast({
      id: "share-link",
      kind: "success",
      title: "Link copied",
      description: anyone() ? "Anyone with it can view" : "Only people with access can open it",
    });
  };
  return (
    <DemoCard
      title="Share a document"
      subtitle="A field, a list and a switch, anchored to its button"
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
        <Icon icon={FileText} size={pointer ? 18 : 22} tint={colors.mutedForeground} />
        <View style={{ flex: 1, gap: 1, minWidth: 0 }}>
          <Text
            style={{ fontSize: pointer ? 13 : 15, fontWeight: "500", color: colors.foreground }}
          >
            Q3 roadmap.md
          </Text>
          <Text style={{ fontSize: pointer ? 12 : 13, color: colors.faint }}>
            {`${people().length} people · ${anyone() ? "anyone with the link" : "restricted"}`}
          </Text>
        </View>
        <Popover
          open={open()}
          onOpenChange={(event) => {
            open.set(event.open);
            changed("share")(event);
          }}
        >
          <PopoverTrigger>
            <Trigger label="Share" icon={Share2} open={open()} variant="default" />
          </PopoverTrigger>
          <PopoverContent
            placement="bottom"
            align="end"
            offset={6}
            margin={8}
            width={pointer ? 320 : 330}
          >
            <Head title="Share “Q3 roadmap”" note={`${people().length} people have access`} />
            <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
              <Field
                value={invite()}
                onChange={({ value }) => invite.set(value)}
                onSubmit={add}
                placeholder="Add people by email"
                keyboardType="email-address"
                autoCapitalize="none"
                returnKeyType="done"
                accessibilityLabel="Email to invite"
              />
              <Button variant="secondary" size="sm" disabled={!valid()} onPress={add}>
                Invite
              </Button>
            </View>
            <View style={{ gap: pointer ? 6 : 8 }}>
              <Each of={people()} key={(person) => person.email}>
                {(person) => (
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                    <Avatar
                      name={person().name}
                      style={{ width: pointer ? 28 : 36, height: pointer ? 28 : 36 }}
                    />
                    <View style={{ flex: 1, minWidth: 0 }}>
                      <Text
                        style={{
                          numberOfLines: 1,
                          fontSize: pointer ? 13 : 14,
                          color: colors.foreground,
                        }}
                      >
                        {person().name}
                      </Text>
                      <Text
                        style={{
                          numberOfLines: 1,
                          fontSize: pointer ? 11.5 : 12,
                          color: colors.faint,
                        }}
                      >
                        {person().email}
                      </Text>
                    </View>
                    <View
                      role="button"
                      accessibilityLabel={`${person().name}: ${person().role}`}
                      disabled={person().role === "Owner"}
                      onPress={() => toggleRole(person().email)}
                      hoverStyle={hovered()}
                      activeStyle={{
                        backgroundColor: alpha(colors.foreground, 0.09),
                        transform: [{ scale: 0.96 }],
                      }}
                      style={{
                        paddingHorizontal: 8,
                        height: pointer ? 24 : 32,
                        justifyContent: "center",
                        borderRadius: 6,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: pointer ? 12 : 13,
                          color: person().role === "Owner" ? colors.faint : colors.mutedForeground,
                        }}
                      >
                        {person().role}
                      </Text>
                    </View>
                  </View>
                )}
              </Each>
            </View>
            <Rule />
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
              <Icon
                icon={anyone() ? Globe : Lock}
                size={pointer ? 16 : 18}
                tint={anyone() ? colors.brand : colors.mutedForeground}
              />
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: pointer ? 13 : 14, color: colors.foreground }}>
                  Anyone with the link
                </Text>
                <Text style={{ fontSize: pointer ? 11.5 : 12, color: colors.faint }}>
                  {anyone() ? "Can view, no sign-in" : "Only the people above"}
                </Text>
              </View>
              <Switch
                accessibilityLabel="Anyone with the link"
                checked={anyone()}
                onChange={({ checked }) => anyone.set(checked)}
              />
            </View>
            <Button variant="secondary" selected={copied()} onPress={copy}>
              <>
                <If when={copied()}>
                  <Icon icon={Check} size={pointer ? 14 : 16} tint={colors.foreground} />
                </If>
                <Text>{copied() ? "Copied" : "Copy link"}</Text>
              </>
            </Button>
          </PopoverContent>
        </Popover>
      </View>
    </DemoCard>
  );
}

function Profile(props: {
  log: (line: string) => void;
  changed: (name: string) => (event: { open: boolean; reason: PopoverOpenChangeReason }) => void;
}) {
  const { log, changed } = props;
  const open = signal(false);
  const following = signal(false);
  return (
    <DemoCard title="A person's card" subtitle={`${tap} a mention: who it is, and what to do next`}>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <View style={{ marginRight: 10 }}>
          <Avatar
            name="Mira Chen"
            style={{ width: pointer ? 24 : 30, height: pointer ? 24 : 30 }}
          />
        </View>
        <Popover
          open={open()}
          onOpenChange={(event) => {
            open.set(event.open);
            changed("profile")(event);
          }}
        >
          <PopoverTrigger>
            <Trigger label="@Mira Chen" open={open()} variant="ghost" inline ink={colors.brand} />
          </PopoverTrigger>
          <PopoverContent
            placement="top"
            align="start"
            offset={6}
            margin={8}
            width={pointer ? 280 : 300}
          >
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
              <Avatar name="Mira Chen" style={{ width: 44, height: 44 }} />
              <View style={{ flex: 1, gap: 2 }}>
                <Text
                  style={{
                    fontSize: pointer ? 15 : 17,
                    fontWeight: "600",
                    color: colors.foreground,
                  }}
                >
                  Mira Chen
                </Text>
                <Text style={{ fontSize: pointer ? 12 : 13, color: colors.mutedForeground }}>
                  Design lead · Platform
                </Text>
              </View>
              <If when={following()}>
                <Badge tone="accent">Following</Badge>
              </If>
            </View>
            <Text
              style={{
                fontSize: pointer ? 13 : 14,
                lineHeight: pointer ? 18 : 20,
                color: colors.foreground,
              }}
            >
              Shapes the components teams build on. Ask about motion and type.
            </Text>
            <View style={{ flexDirection: "row", gap: 14 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
                <Icon icon={MapPin} size={13} tint={colors.faint} />
                <Text style={{ fontSize: 12, color: colors.mutedForeground }}>Shanghai</Text>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
                <Icon icon={Clock} size={13} tint={colors.faint} />
                <Text style={{ fontSize: 12, color: colors.mutedForeground }}>
                  16:42 local time
                </Text>
              </View>
            </View>
            <View style={{ flexDirection: "row" }}>
              <Stat label="Projects" value="12" width="33%" />
              <Stat label="Reviews" value="248" width="33%" />
              <Stat label="Followers" value={following() ? "1,205" : "1,204"} width="33%" />
            </View>
            <View style={{ flexDirection: "row", gap: 8 }}>
              <Button
                style={{ flex: 1 }}
                variant={following() ? "secondary" : "default"}
                onPress={() => {
                  following.set(!following());
                  log(following() ? "followed Mira Chen" : "unfollowed Mira Chen");
                }}
              >
                <>
                  <Icon
                    icon={following() ? Check : Plus}
                    size={pointer ? 14 : 16}
                    tint={following() ? colors.foreground : colors.primaryForeground}
                  />
                  <Text>{following() ? "Following" : "Follow"}</Text>
                </>
              </Button>
              <Button
                style={{ flex: 1 }}
                variant="secondary"
                onPress={() => {
                  open.set(false);
                  log("message to Mira Chen");
                }}
              >
                Message
              </Button>
            </View>
          </PopoverContent>
        </Popover>
        <Text
          style={{
            flex: 1,
            marginLeft: 4,
            fontSize: pointer ? 13 : 15,
            color: colors.mutedForeground,
          }}
        >
          mentioned you in Q3 roadmap
        </Text>
      </View>
    </DemoCard>
  );
}

function Reminder(props: {
  log: (line: string) => void;
  toast: (content: ToastContent) => Promise<string | null>;
  dismissToast: (id?: string) => void;
  changed: (name: string) => (event: { open: boolean; reason: PopoverOpenChangeReason }) => void;
}) {
  const { log, toast, dismissToast, changed } = props;
  const open = signal(false);
  const chosen = signal<string | null>(null);
  const current = () => reminders.find((item) => item.id === chosen());
  const choose = (id: string | null) => {
    chosen.set(id);
    open.set(false);
    const item = current();
    log(id && item ? `reminder ${item.label} · ${item.when}` : "reminder cleared");
    dismissToast("reminder");
    if (id && item)
      void toast({
        id: "reminder",
        kind: "info",
        title: `Reminder set for ${item.when}`,
        description: "Review the Q3 roadmap",
      });
  };
  return (
    <DemoCard
      title="Chosen from a list"
      subtitle="Choosing closes it; the trigger shows the choice"
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
        <Popover
          open={open()}
          onOpenChange={(event) => {
            open.set(event.open);
            changed("reminder")(event);
          }}
        >
          <PopoverTrigger>
            <Trigger
              label={current() ? `${current()!.label} · ${current()!.when}` : "Remind me"}
              icon={current() ? BellRing : AlarmClock}
              open={open()}
            />
          </PopoverTrigger>
          <PopoverContent align="start" offset={6} margin={8} compact width={pointer ? 240 : 280}>
            <Text
              style={{
                fontSize: pointer ? 11 : 13,
                fontWeight: "600",
                color: colors.faint,
                paddingHorizontal: 8,
                paddingTop: 6,
                paddingBottom: 4,
              }}
            >
              Remind me
            </Text>
            <Each of={reminders}>
              {(item) => (
                <View
                  role="button"
                  accessibilityLabel={item().label}
                  accessibilityState={{ selected: chosen() === item().id }}
                  onPress={() => choose(item().id)}
                  hoverStyle={hovered()}
                  activeStyle={{ backgroundColor: alpha(colors.foreground, 0.1) }}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 10,
                    height: pointer ? 28 : 46,
                    paddingHorizontal: 8,
                    borderRadius: pointer ? 6 : 10,
                  }}
                >
                  <Icon icon={item().icon} size={pointer ? 14 : 18} tint={colors.mutedForeground} />
                  <Text style={{ flex: 1, fontSize: pointer ? 13 : 16, color: colors.foreground }}>
                    {item().label}
                  </Text>
                  <Text
                    style={{
                      fontSize: pointer ? 11.5 : 14,
                      color: chosen() === item().id ? colors.brand : colors.faint,
                    }}
                  >
                    {item().when}
                  </Text>
                </View>
              )}
            </Each>
            <If when={chosen()}>
              <View
                style={{
                  height: 1,
                  marginVertical: 4,
                  marginHorizontal: 4,
                  backgroundColor: colors.line,
                }}
              />
              <View
                role="button"
                accessibilityLabel="Clear reminder"
                onPress={() => choose(null)}
                hoverStyle={hovered()}
                activeStyle={{ backgroundColor: alpha(colors.foreground, 0.1) }}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 10,
                  height: pointer ? 28 : 46,
                  paddingHorizontal: 8,
                  borderRadius: pointer ? 6 : 10,
                }}
              >
                <Icon icon={CircleX} size={pointer ? 14 : 18} tint={colors.destructive} />
                <Text style={{ fontSize: pointer ? 13 : 16, color: colors.destructive }}>
                  Clear reminder
                </Text>
              </View>
            </If>
          </PopoverContent>
        </Popover>
      </View>
    </DemoCard>
  );
}

function Placement(props: {
  changed: (name: string) => (event: { open: boolean; reason: PopoverOpenChangeReason }) => void;
}) {
  const { changed } = props;
  const side = signal<PopupSide>("bottom");
  const align = signal<"start" | "center" | "end">("center");
  return (
    <DemoCard title="Where it goes" subtitle="A side and an alignment; it flips without room">
      <Choices
        label="Side"
        value={side()}
        onChange={(value) => side.set(value as PopupSide)}
        options={[
          { value: "top", label: "Top" },
          { value: "bottom", label: "Bottom" },
          { value: "left", label: "Left" },
          { value: "right", label: "Right" },
        ]}
      />
      <Choices
        label="Alignment"
        value={align()}
        onChange={(value) => align.set(value as "start" | "center" | "end")}
        options={[
          { value: "start", label: "Start" },
          { value: "center", label: "Center" },
          { value: "end", label: "End" },
        ]}
      />
      <View style={{ alignItems: "center", paddingVertical: pointer ? 40 : 28 }}>
        <Popover onOpenChange={changed("placed")}>
          <PopoverTrigger>
            <Trigger label={placementWords(side(), align())} icon={MapPin} />
          </PopoverTrigger>
          <PopoverContent
            placement={side()}
            align={align()}
            offset={8}
            margin={8}
            compact
            width={220}
          >
            <Text style={{ fontSize: 13, fontWeight: "600", color: colors.foreground }}>
              {placementWords(side(), align())}
            </Text>
            <Text style={{ fontSize: 12, color: colors.mutedForeground }}>
              It grows out of the edge that faces its trigger.
            </Text>
          </PopoverContent>
        </Popover>
      </View>
      <Caption>
        {pointer ? "Scroll the page: it follows its trigger" : "A tap outside only closes it"}
      </Caption>
    </DemoCard>
  );
}
