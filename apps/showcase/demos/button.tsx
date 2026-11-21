// Button: the official gallery's scene (`references/nsh/examples/gallery/demos/ButtonDemo.tsx`)
// with this library's parts, card by card in its order — the kinds and a link that opens outside the
// app, a split button with a menu (busy, then done in the `up` tone), work that takes a while (a
// spinner, an upload's progress fill), icon buttons with tooltips and their shortcut, a hold to
// confirm, copy buttons, the sizes, a button disabled with its reason, and the last event.
// `nsh/base`'s Button owns the press, the disabled state, the focus and the role; the looks are
// `buttonLook` and `iconButtonLook`. `FillButton` is the scene's own: a raised button with a run
// of color filling it, not a library part. The upstream's sounds are not played.
import {
  alpha,
  animate,
  colors,
  finish,
  mono,
  motion,
  rounded,
  shape,
  terminal,
  tints,
} from "@shadcn-nsh/theme";
import {
  ArrowUp,
  Check,
  ChevronDown,
  Copy,
  Download,
  GitMerge,
  Link as LinkIcon,
  Lock,
  PanelLeft,
  Play,
  Plus,
  Search,
  Share,
  Star,
  Trash,
  type IconNode,
} from "lucide";
import {
  type AnimatedValue,
  type Signal,
  cleanup,
  Clipboard,
  createAnimatedValue,
  Easing,
  effect,
  keymap,
  LayoutAnimation,
  openUrl,
  platform,
  reduceMotion,
  signal,
  Text,
  View,
} from "nsh";

import { Badge } from "@/packages/ui/badge";
import {
  Button,
  buttonGlyph,
  buttonLabel,
  buttonLook,
  IconButton,
  iconButtonGlyph,
  SplitButton,
  SplitButtonDivider,
  SplitButtonSegment,
  type ButtonSize,
} from "@/packages/ui/button";
import { Icon } from "@/packages/ui/lib/icons";
import { Link } from "@/packages/ui/link";
import {
  Menu,
  MenuContent,
  MenuItem,
  menuItemLabel,
  menuItemNote,
  menuPopup,
  MenuTrigger,
} from "@/packages/ui/menu";
import { Spinner } from "@/packages/ui/spinner";
import { Switch } from "@/packages/ui/switch";
import { Tooltip, TooltipTrigger } from "@/packages/ui/tooltip";

import { DemoPage } from "../kit";
import { Card, LastEvent, Tip } from "./actions-shared";
import { CaptionRow, LabeledToggle } from "./navigation-shared";

const pointer = platform.desktop;

/** Waits `ms`, cancelled with the component that started it. */
function timers() {
  const pending = new Set<ReturnType<typeof setTimeout>>();
  cleanup(() => pending.forEach(clearTimeout));
  return (ms: number, then: () => void) => {
    const t = setTimeout(() => {
      pending.delete(t);
      then();
    }, ms);
    pending.add(t);
  };
}

/** The next commit's frames ease to their new sizes (a label growing or shrinking), unless motion is reduced. */
const resize = () => {
  if (!reduceMotion())
    LayoutAnimation.configureNext({
      duration: 220,
      update: { type: "spring", springDamping: 0.85 },
    });
};

/**
 * A scale at rest at 1 that bounces a little past it each time `key` changes, so what changed
 * pops; still with reduced motion.
 */
function popOn(key: () => unknown): AnimatedValue {
  const s = createAnimatedValue(1);
  let shown = key();
  effect(() => {
    const next = key();
    if (next === shown) return;
    shown = next;
    if (!reduceMotion()) void animate(s, 1, motion.move, { velocity: 4 });
  });
  return s;
}

/** 1 while `on()`, else 0, easing between the two (none with reduced motion). */
function fadeOn(on: () => boolean): AnimatedValue {
  const v = createAnimatedValue(on() ? 1 : 0);
  effect(() => {
    const to = on() ? 1 : 0;
    void animate(v, to, motion.control);
  });
  return v;
}

/**
 * An icon button with its name in a tooltip (and its shortcut with a pointer). `on` keeps it
 * chosen (a favorite), its icon popping as it turns on or off.
 */
function Tool(props: {
  icon: IconNode;
  label: string;
  shortcut?: string;
  on?: boolean;
  variant?: "ghost" | "secondary" | "destructive";
  onPress: () => void;
}) {
  const pop = popOn(() => props.on);
  const look = { selected: () => props.on, variant: props.variant };
  return (
    <Tooltip disabled={!pointer}>
      <TooltipTrigger>
        <IconButton
          accessibilityLabel={props.label}
          variant={props.variant}
          selected={props.on}
          onPress={props.onPress}
        >
          <View style={{ transform: [{ scale: pop }] }}>
            <Icon icon={props.icon} {...iconButtonGlyph(look)} />
          </View>
        </IconButton>
      </TooltipTrigger>
      <Tip label={props.label} shortcut={props.shortcut && pointer ? props.shortcut : undefined} />
    </Tooltip>
  );
}

/**
 * A raised button with a run of `tone` filling it from the leading edge as `fill` goes from 0 to 1
 * (an upload's progress, a held press): the button clips it, and the label stays on top.
 */
function FillButton(props: {
  label: string;
  icon?: IconNode;
  busy?: boolean;
  fill: AnimatedValue;
  tone: string;
  tint?: string;
  testID?: string;
  delayLongPress?: number;
  onPress?: () => void;
  onPressDown?: () => void;
  onPressUp?: () => void;
  onLongPress?: () => void;
}) {
  const glyph = fadeOn(() => !!(props.busy || props.icon));
  const look = buttonLook("secondary", { busy: () => props.busy });
  const tint = () => props.tint ?? colors.foreground;
  return (
    <View
      testID={props.testID}
      role="button"
      accessibilityLabel={props.label}
      onPress={props.onPress}
      onLongPress={props.onLongPress}
      delayLongPress={props.delayLongPress}
      onPressDown={props.onPressDown}
      onPressUp={props.onPressUp}
      {...look}
      style={[look.style, { alignSelf: "flex-start", overflow: "hidden" }]}
    >
      <View
        style={{
          pointerEvents: "none",
          position: "absolute",
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: props.tone,
          transformOrigin: "left",
          transform: [{ scaleX: props.fill }],
        }}
      />
      <If when={props.busy || props.icon}>
        <View style={{ opacity: glyph }}>
          <If
            when={props.busy}
            else={<Icon icon={props.icon!} {...buttonGlyph("secondary")} tint={tint()} />}
          >
            <Spinner {...buttonGlyph("secondary")} tint={tint()} />
          </If>
        </View>
      </If>
      <Text style={[buttonLabel("secondary"), { color: tint(), fontVariant: ["tabular-nums"] }]}>
        {props.label}
      </Text>
    </View>
  );
}

type Strategy = { value: "merge" | "squash" | "rebase"; label: string; note: string; done: string };

const strategies: Strategy[] = [
  {
    value: "merge",
    label: "Merge",
    note: "Every commit joins main with a merge commit",
    done: "Merged",
  },
  {
    value: "squash",
    label: "Squash and merge",
    note: "The 12 commits become one on main",
    done: "Squashed",
  },
  {
    value: "rebase",
    label: "Rebase and merge",
    note: "The commits are replayed on top of main",
    done: "Rebased",
  },
];

const wrap = { flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 8 } as const;
const small = pointer ? 13 : 15;

function Kinds(props: Ctx) {
  const { last } = props;
  return (
    <Card title="Kinds" subtitle="One main action; the others quieter">
      <View style={wrap}>
        <Button onPress={() => last.set("pressed Save")}>Save</Button>
        <Button variant="secondary" onPress={() => last.set("pressed Duplicate")}>
          Duplicate
        </Button>
        <Button variant="ghost" onPress={() => last.set("pressed Cancel")}>
          Cancel
        </Button>
        <Button variant="destructive" onPress={() => last.set("pressed Delete")}>
          Delete
        </Button>
      </View>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
        <Text style={{ fontSize: small, color: colors.mutedForeground }}>
          A link opens a resource outside the app:
        </Text>
        <Link
          href="https://nsh.dev/docs/design-guides"
          accessibilityLabel="Button guidelines"
          icon
          onOpen={({ href }: { href: string }) =>
            void openUrl(href).then(({ opened }) =>
              last.set(opened ? "opened the guidelines" : "No app opens links"),
            )
          }
        >
          Guidelines
        </Link>
      </View>
      <CaptionRow
        label={
          pointer
            ? "Hover, press and Tab to each: one focus ring for every control"
            : "Press each: it sinks under the finger"
        }
      />
    </Card>
  );
}

function Split(props: Ctx) {
  const { last, after } = props;
  const strategy = signal<Strategy>(strategies[1]);
  const state = signal<"idle" | "busy" | "done">("idle");
  const open = signal(false);
  const pop = popOn(() => state() === "done");
  const merge = () => {
    if (state() !== "idle") return;
    resize();
    state.set("busy");
    last.set(`${strategy().label}: started`);
    after(1200, () => {
      resize();
      state.set("done");
      last.set(`${strategy().label}: done`);
    });
  };
  const label = () =>
    state() === "busy" ? "Merging…" : state() === "done" ? strategy().done : strategy().label;
  const done = () => state() === "done";
  // Done, the pair turns the `up` tone: its tint under the word and the hairline.
  const ink = () => (done() ? colors.up : colors.onBrand);
  const doneFrame = () =>
    done()
      ? {
          backgroundColor: tints.up,
          backgroundImage: "none" as const,
          borderColor: alpha(colors.up, 0.4),
          boxShadow: "none" as const,
        }
      : undefined;
  return (
    <Card
      title="Split button"
      subtitle="The main action, its variants in a menu"
      right={<Badge tone={done() ? "up" : "neutral"}>{done() ? "Merged" : "Open"}</Badge>}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
        <SplitButton style={doneFrame()}>
          <SplitButtonSegment
            onPress={merge}
            disabled={state() !== "idle"}
            accessibilityLabel={label()}
          >
            <View style={{ transform: [{ scale: pop }] }}>
              <If
                when={state() === "busy"}
                else={
                  <Icon icon={done() ? Check : GitMerge} {...buttonGlyph("default")} tint={ink()} />
                }
              >
                <Spinner {...buttonGlyph("default")} tint={colors.onBrand} />
              </If>
            </View>
            <Text style={[buttonLabel("default"), { color: ink() }]}>{label()}</Text>
          </SplitButtonSegment>
          <SplitButtonDivider
            style={done() ? { backgroundColor: alpha(colors.up, 0.3) } : undefined}
          />
          <Menu open={open()} onOpenChange={({ open: o }) => open.set(o)}>
            <MenuTrigger>
              <SplitButtonSegment
                accessibilityLabel="Merge options"
                selected={open()}
                disabled={state() !== "idle"}
                style={terminal ? undefined : { width: pointer ? 26 : 40, paddingHorizontal: 0 }}
              >
                <View
                  style={{
                    alignSelf: "stretch",
                    flexGrow: 1,
                    alignItems: "center",
                    justifyContent: "center",
                    transform: [{ rotate: open() ? "180deg" : "0deg" }],
                    transitionProperty: "transform",
                    transitionDuration: reduceMotion() ? 0 : 180,
                  }}
                >
                  <Icon
                    icon={ChevronDown}
                    {...buttonGlyph("default")}
                    size={pointer ? 12 : 14}
                    tint={ink()}
                    weight={2}
                  />
                </View>
              </SplitButtonSegment>
            </MenuTrigger>
            <MenuContent align="end" offset={6} margin={8} {...menuPopup({ minWidth: 260 })}>
              <Each of={strategies}>
                {(s) => (
                  <MenuItem
                    onSelect={() => {
                      resize();
                      strategy.set(s());
                      last.set(`chose ${s().label}`);
                    }}
                  >
                    <View style={{ flexGrow: 1, flexShrink: 1, gap: 2 }}>
                      <Text style={menuItemLabel()}>{s().label}</Text>
                      <Text style={menuItemNote()}>{s().note}</Text>
                    </View>
                    {/* The check at the trailing edge, as every menu's. */}
                    <View style={{ width: 16, alignItems: "center" }}>
                      <If when={strategy().value === s().value}>
                        <Icon icon={Check} size={14} tint={colors.brand} weight={2} />
                      </If>
                    </View>
                  </MenuItem>
                )}
              </Each>
            </MenuContent>
          </Menu>
        </SplitButton>
        <If when={state() === "done"}>
          <Button
            variant="ghost"
            onPress={() => {
              resize();
              state.set("idle");
              last.set("reopened");
            }}
          >
            Reopen
          </Button>
        </If>
      </View>
      <CaptionRow label={strategy().note} />
    </Card>
  );
}

function Loading(props: Ctx) {
  const { last, after } = props;
  const save = signal<"idle" | "busy" | "done">("idle");
  const progress = signal<number | null>(null);
  const fill = createAnimatedValue(0);
  const doneUpload = signal(false);
  effect(() => {
    const p = progress();
    if (p === null) return;
    if (reduceMotion()) fill.set(p);
    else void fill.timing(p, { duration: 180, easing: Easing.out(Easing.cubic) });
  });
  const runSave = () => {
    if (save() !== "idle") return;
    save.set("busy");
    last.set("Save: started");
    after(1200, () => {
      save.set("done");
      last.set("Save: done");
      after(1800, () => save.set("idle"));
    });
  };
  const runUpload = () => {
    if (progress() !== null) return;
    resize();
    doneUpload.set(false);
    progress.set(0);
    last.set("Upload: started");
    const step = () => {
      const next = Math.min(1, (progress() ?? 0) + 0.12 + (((progress() ?? 0) * 7919) % 0.08));
      progress.set(next);
      if (next < 1) after(160, step);
      else
        after(300, () => {
          resize();
          progress.set(null);
          fill.set(0);
          doneUpload.set(true);
          last.set("Upload: done");
        });
    };
    after(160, step);
  };
  return (
    <Card
      title="Work that takes a while"
      subtitle="One press while it runs; the result on the button"
    >
      <View style={wrap}>
        <Button
          icon={save() === "done" ? Check : undefined}
          busy={save() === "busy"}
          onPress={runSave}
        >
          {save() === "busy" ? "Saving…" : save() === "done" ? "Saved" : "Save changes"}
        </Button>
        <FillButton
          testID="upload"
          label={
            progress() !== null
              ? `Uploading ${Math.round((progress() ?? 0) * 100)}%`
              : doneUpload()
                ? "Uploaded"
                : "Upload photos"
          }
          icon={doneUpload() ? Check : ArrowUp}
          busy={progress() !== null}
          fill={fill}
          tone={tints.brand}
          tint={doneUpload() ? colors.up : undefined}
          onPress={runUpload}
        />
      </View>
      <CaptionRow
        label="A spinner while waiting, a progress fill when the amount is known"
        note={save() === "busy" || progress() !== null ? "Working…" : "Ready"}
      />
    </Card>
  );
}

function Icons(props: Ctx) {
  const { last } = props;
  const starred = signal(false);
  const pinned = signal(true);
  const star = () => {
    starred.set(!starred());
    last.set(starred() ? "added to favorites" : "removed from favorites");
  };
  // The shortcut the tooltip shows works too.
  keymap.bind("mod+alt+f", star);
  const key = pointer ? keymap.label("mod+alt+f") : undefined;
  return (
    <Card
      title="Icon buttons"
      subtitle={
        pointer
          ? "Rest the pointer on one for its name and shortcut"
          : "Each has a name for screen readers"
      }
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
        <View style={{ flex: 1, gap: 2 }}>
          <Text
            style={{ fontSize: pointer ? 14 : 16, fontWeight: "600", color: colors.foreground }}
          >
            Harbor at dawn.jpg
          </Text>
          <Text
            style={{
              fontSize: pointer ? 12 : 13,
              color: colors.faint,
              fontVariant: ["tabular-nums"],
            }}
          >
            4032 × 3024 · 3.2 MB
          </Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: pointer ? 2 : 4 }}>
          <Tool
            icon={Star}
            label={starred() ? "Remove from favorites" : "Add to favorites"}
            shortcut={key}
            on={starred()}
            onPress={star}
          />
          <Tool icon={Share} label="Share…" onPress={() => last.set("pressed Share")} />
          <Tool icon={Download} label="Download" onPress={() => last.set("pressed Download")} />
          <Tool
            icon={Trash}
            label="Move to the trash"
            variant="destructive"
            onPress={() => last.set("pressed Move to the trash")}
          />
        </View>
      </View>
      <View style={wrap}>
        <Tool
          icon={Plus}
          label="New file"
          variant="secondary"
          onPress={() => last.set("pressed New file")}
        />
        <Tool
          icon={Search}
          label="Search"
          variant="secondary"
          onPress={() => last.set("pressed Search")}
        />
        <Tool
          icon={PanelLeft}
          label={pinned() ? "Hide the sidebar" : "Show the sidebar"}
          variant="secondary"
          on={pinned()}
          onPress={() => pinned.set(!pinned())}
        />
        <View style={{ flex: 1 }} />
        <Button variant="secondary" icon={Play} onPress={() => last.set("pressed Play")}>
          Play
        </Button>
      </View>
    </Card>
  );
}

function Hold(props: Ctx) {
  const { last, after } = props;
  const HOLD = 1200;
  const fill = createAnimatedValue(0);
  const state = signal<"idle" | "holding" | "done">("idle");
  const nudge = signal(false);
  const pop = popOn(() => state() === "done");
  return (
    <Card title="Hold to confirm" subtitle="A destructive action that cannot be undone">
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
        <View style={{ flex: 1, gap: 2 }}>
          <Text
            style={{ fontSize: pointer ? 14 : 16, fontWeight: "600", color: colors.foreground }}
          >
            Delete “Q3 roadmap”
          </Text>
          <Text style={{ fontSize: pointer ? 12 : 13, color: colors.mutedForeground }}>
            Its 48 cards and their comments go with it.
          </Text>
        </View>
        <If
          when={state() !== "done"}
          else={
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
                transform: [{ scale: pop }],
              }}
            >
              <Icon icon={Check} {...buttonGlyph("default")} tint={colors.destructive} />
              <Text style={{ fontSize: small, fontWeight: "500", color: colors.destructive }}>
                Deleted
              </Text>
              <Button
                variant="ghost"
                size="sm"
                onPress={() => {
                  resize();
                  state.set("idle");
                  last.set("restored Q3 roadmap");
                }}
              >
                Restore
              </Button>
            </View>
          }
        >
          <FillButton
            testID="hold"
            label={state() === "holding" ? "Keep holding" : "Hold to delete"}
            icon={Trash}
            fill={fill}
            tone={alpha(colors.destructive, 0.28)}
            tint={colors.destructive}
            delayLongPress={HOLD}
            onPress={() => {
              // Let go early: say how it works.
              resize();
              nudge.set(true);
              after(2400, () => nudge.set(false));
            }}
            onPressDown={() => {
              state.set("holding");
              void fill.timing(1, { duration: HOLD, easing: Easing.linear });
            }}
            onPressUp={() => {
              if (state() === "done") return;
              state.set("idle");
              void animate(fill, 0, motion.control);
            }}
            onLongPress={() => {
              resize();
              state.set("done");
              fill.set(0);
              nudge.set(false);
              last.set("deleted Q3 roadmap");
            }}
          />
        </If>
      </View>
      <If when={nudge()}>
        <Text style={{ fontSize: pointer ? 12 : 13, color: colors.destructive }}>
          Hold the button for a second to delete.
        </Text>
      </If>
    </Card>
  );
}

function CopyCard(props: Ctx) {
  const { last, after } = props;
  const copied = signal<string | null>(null);
  const copy = (what: string, text: string) => {
    void Clipboard.writeText(text);
    copied.set(what);
    last.set(`copied ${what}`);
    after(1600, () => copied() === what && copied.set(null));
  };
  const line = (props: { what: string; text: string }) => (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        paddingLeft: 12,
        paddingRight: 4,
        height: pointer ? 36 : 48,
        ...rounded(shape.control),
        borderWidth: 1,
        backgroundColor: colors.field,
        ...finish.field,
        borderColor: colors.input,
      }}
    >
      <Text
        style={{
          flex: 1,
          numberOfLines: 1,
          fontSize: pointer ? 12 : 14,
          color: colors.foreground,
          fontFamily: mono(),
        }}
      >
        {props.text}
      </Text>
      <IconButton
        accessibilityLabel={copied() === props.what ? "Copied" : `Copy the ${props.what}`}
        selected={copied() === props.what}
        icon={copied() === props.what ? Check : Copy}
        onPress={() => copy(props.what, props.text)}
      />
    </View>
  );
  return (
    <Card title="Copy" subtitle="The icon turns into a check for a moment">
      {line({ what: "command", text: "nsh init my-app --template ts" })}
      {line({ what: "key", text: "pk_live_51Hx…9fQ2" })}
      <Button
        variant="secondary"
        icon={copied() === "link" ? Check : LinkIcon}
        onPress={() => copy("link", "https://nsh.dev/join/7f3a")}
      >
        {copied() === "link" ? "Copied" : "Copy invite link"}
      </Button>
    </Card>
  );
}

function Sizes(props: Ctx) {
  const { last } = props;
  const sizes: { size: ButtonSize; label: string }[] = [
    { size: "sm", label: "Small" },
    { size: "default", label: "Regular" },
    { size: "lg", label: "Large" },
  ];
  return (
    <Card
      title="Sizes"
      subtitle={pointer ? "24, 28 and 34 points tall" : "36, 40 and 48 points tall"}
    >
      <Each of={sizes}>
        {(s) => (
          <View style={wrap}>
            <Text style={{ width: 64, fontSize: pointer ? 12 : 13, color: colors.mutedForeground }}>
              {s().label}
            </Text>
            <Button size={s().size} onPress={() => last.set(`pressed ${s().label} Continue`)}>
              Continue
            </Button>
            <Button
              size={s().size}
              variant="secondary"
              icon={Plus}
              onPress={() => last.set(`pressed ${s().label} Add`)}
            >
              Add
            </Button>
            <Button
              size={s().size}
              variant="ghost"
              onPress={() => last.set(`pressed ${s().label} Skip`)}
            >
              Skip
            </Button>
          </View>
        )}
      </Each>
    </Card>
  );
}

function Disabled(props: Ctx) {
  const { last, after } = props;
  const title = signal(false);
  const terms = signal(false);
  const off = signal(false);
  const reason = () =>
    !title() ? "Add a title first" : !terms() ? "Accept the terms to publish" : null;
  const published = signal(false);
  const row = (text: string, value: () => boolean, set: (v: boolean) => void) => (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        minHeight: pointer ? 32 : 44,
      }}
    >
      <Text style={{ flex: 1, fontSize: small, color: colors.foreground }}>{text}</Text>
      <Switch
        accessibilityLabel={text}
        checked={value()}
        onChange={({ checked }) => {
          resize();
          set(checked);
        }}
      />
    </View>
  );
  return (
    <Card
      title="Disabled, with its reason"
      subtitle="Say what to do, next to the button"
      right={<LabeledToggle label="Disable all" value={off()} onChange={(v) => off.set(v)} />}
    >
      <View style={{ gap: 2 }}>
        {row("The post has a title", title, (v) => title.set(v))}
        {row("I accept the terms", terms, (v) => terms.set(v))}
      </View>
      <View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 10 }}>
        <Button
          icon={published() ? Check : undefined}
          disabled={off() || !!reason() || published()}
          onPress={() => {
            published.set(true);
            last.set("published");
            after(2000, () => published.set(false));
          }}
        >
          {published() ? "Published" : "Publish"}
        </Button>
        <Button variant="secondary" disabled={off()} onPress={() => last.set("pressed Archive")}>
          Archive
        </Button>
        <If when={reason()}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <Icon icon={Lock} size={pointer ? 12 : 14} tint={colors.faint} />
            <Text style={{ fontSize: pointer ? 12 : 13, color: colors.mutedForeground }}>
              {reason()}
            </Text>
          </View>
        </If>
      </View>
      <CaptionRow label="A disabled button takes no press, no hover and no focus" />
    </Card>
  );
}

type Ctx = { last: Signal<string>; after: ReturnType<typeof timers> };

/**
 * Button: the kinds a decision area uses and their sizes, icon buttons with tooltips, a split
 * button with a menu, work that takes a while (a spinner, a progress fill, a check when done), a
 * copy button, a destructive action held to confirm, and a button disabled with its reason shown.
 */
export function ButtonDemo() {
  const ctx: Ctx = { last: signal("—"), after: timers() };
  return (
    <DemoPage title="Button">
      <Kinds {...ctx} />
      <Split {...ctx} />
      <Loading {...ctx} />
      <Icons {...ctx} />
      <Hold {...ctx} />
      <CopyCard {...ctx} />
      <If when={!terminal}>
        <Sizes {...ctx} />
      </If>
      <Disabled {...ctx} />
      <Card title="Last event">
        <LastEvent value={ctx.last()} hint="Press a button" />
      </Card>
    </DemoPage>
  );
}
