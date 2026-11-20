import {
  alpha,
  colors,
  finish,
  mono,
  radius,
  rounded,
  toneColor,
  type Tone,
} from "@shadcn-nsh/theme";
// Helpers the overlay demos share: a trigger, a field, the event log, and the toast host.
// The library's `Toast` is one banner; the gallery's `toast()` / `updateToast` / `dismissToast`
// (a manager, a stack, a promise per toast) is not a part here, so this host is `nsh/base`'s
// `ToastManager` and `ToastStack` wearing the library's toast look. Sounds stay out.
import { CircleCheck, CircleX, Info, Loader, TriangleAlert, type IconNode, X } from "lucide";
import type { JSX, ViewStyle } from "nsh";
import { Overlay, platform, safeArea, signal, Text, token, View, windowSize } from "nsh";
import { ToastManager, ToastStack, type ToastEntry } from "nsh/base";

import {
  Button,
  buttonGlyph,
  buttonLabel,
  buttonLook,
  type ButtonVariant,
} from "@/packages/ui/button";
import { Input, type InputProps } from "@/packages/ui/input";
import { Icon } from "@/packages/ui/lib/icons";
import { density, sectionSurface } from "@/packages/ui/lib/surface";
import { Progress } from "@/packages/ui/progress";
import { Segmented, SegmentedItem, SegmentedList } from "@/packages/ui/segmented";
import { Separator } from "@/packages/ui/separator";
import { Spinner } from "@/packages/ui/spinner";
import {
  Toast,
  toastActionLabel,
  toastActionLook,
  toastCloseLook,
  toastText,
  toastTitle,
} from "@/packages/ui/toast";

import { Caption, DemoCard } from "../kit";

/** A pointer and a keyboard: desktop density. */
export const pointer = platform.desktop;

/** A tap or a click, as the device says it. */
export const tap = pointer ? "Click" : "Tap";

/** The device's input: `touch` on phones and tablets, `pointer` on desktops. */
export const hint = (touch: string, pointerText: string) => (pointer ? pointerText : touch);

/**
 * A wide window, as the gallery's sheets decide an edge panel from a bottom one: 700 points on a
 * desktop, 900 on a phone. Read where it is drawn.
 */
export const wideWindow = () => windowSize().width >= (pointer ? 700 : 900);

/** Where a popup goes, in words for its trigger: "Bottom, centered", "Top, at the end". */
export function placementWords(side: string, align: "start" | "center" | "end"): string {
  return `${side[0]!.toUpperCase()}${side.slice(1)}, ${align === "center" ? "centered" : `at the ${align}`}`;
}

/** The events a demo reports, newest first. `Events` is the card that lists them. */
export function createEvents(empty: string) {
  const events = signal<string[]>([]);
  const log = (what: string) => events.set([what, ...events()].slice(0, 6));
  function Events() {
    return (
      <DemoCard title="Events" subtitle="onOpenChange with its reason, and what was done">
        <If when={events().length > 0} else={<Caption>{empty}</Caption>}>
          <View style={{ gap: 4 }}>
            <Each of={events()}>
              {(line, i) => (
                <Text
                  style={{
                    fontSize: 12,
                    fontFamily: mono(),
                    color: i() === 0 ? colors.foreground : colors.faint,
                  }}
                >
                  {line()}
                </Text>
              )}
            </Each>
          </View>
        </If>
      </DemoCard>
    );
  }
  return { log, events, Events };
}

/**
 * What opens a popup, in the library's button look. A popup's trigger slot takes its presses, so
 * `onPress` is set only when the view is a button of its own (a toolbar's, a sheet's opener).
 * `open` shows it selected. `inline`: a word in a line of text.
 */
export function Trigger(props: {
  label?: string;
  icon?: IconNode;
  open?: boolean;
  on?: boolean;
  variant?: ButtonVariant;
  /** The icon's and the label's color, over the variant's. */
  ink?: string;
  accessibilityLabel?: string;
  disabled?: boolean;
  inline?: boolean;
  onPress?: () => void;
}) {
  const variant = () => props.variant ?? "secondary";
  const look = buttonLook(variant, {
    selected: () => !!(props.open || props.on),
    disabled: () => props.disabled,
    style: props.inline ? { paddingHorizontal: pointer ? 4 : 0, height: undefined } : undefined,
  });
  const glyph = buttonGlyph(variant, { disabled: () => props.disabled });
  const labelStyle = buttonLabel(variant, { disabled: () => props.disabled });
  return (
    <View
      role={props.onPress ? "button" : undefined}
      onPress={props.onPress}
      disabled={props.disabled}
      accessibilityLabel={props.accessibilityLabel ?? props.label}
      accessibilityState={
        props.onPress && (props.open ?? props.on) !== undefined
          ? { selected: !!(props.open || props.on) }
          : undefined
      }
      hoverStyle={look.hoverStyle}
      activeStyle={look.activeStyle}
      focusVisibleStyle={look.focusVisibleStyle}
      disabledStyle={look.disabledStyle}
      hitSlop={props.inline && !pointer ? { left: 8, right: 8, top: 2, bottom: 2 } : look.hitSlop}
      style={[
        look.style,
        props.inline ? { alignSelf: "flex-start", marginHorizontal: pointer ? -4 : 0 } : null,
      ]}
    >
      <If when={props.icon}>
        <Icon icon={props.icon!} size={glyph.size} tint={props.ink ?? glyph.tint} />
      </If>
      <If when={props.label}>
        <Text style={[labelStyle, props.ink ? { color: props.ink } : null]}>{props.label}</Text>
      </If>
    </View>
  );
}

/** A one-line field (or a multiline one) in the library's input, `prefix` inside the well. */
export function Field(props: InputProps & { prefix?: string }) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: props.multiline ? "flex-start" : "center",
        flex: 1,
        ...rounded(radius.control),
        backgroundColor: colors.field,
        ...finish.field,
      }}
    >
      <If when={props.prefix}>
        <Text
          style={{
            paddingLeft: pointer ? 10 : 14,
            fontSize: pointer ? 13 : 15,
            color: colors.faint,
          }}
        >
          {props.prefix}
        </Text>
      </If>
      <Input
        value={props.value}
        placeholder={props.placeholder}
        keyboardType={props.keyboardType}
        autoCapitalize={props.autoCapitalize}
        returnKeyType={props.returnKeyType}
        accessibilityLabel={props.accessibilityLabel}
        multiline={props.multiline}
        onChange={props.onChange}
        onSubmit={props.onSubmit}
        variant="ghost"
        style={{ flex: 1 }}
      />
    </View>
  );
}

/**
 * A demo card with a title row that can hold a badge or a key on the right. `DemoCard` has no
 * such slot; the gallery's cards do.
 */
export function SceneCard(props: {
  title: string;
  subtitle?: string;
  right?: JSX.Element;
  children: JSX.Element;
}) {
  return (
    <View style={[sectionSurface({ padded: true }), { gap: density.gap + 4 }]}>
      <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 12 }}>
        <View style={{ flex: 1, gap: 2 }}>
          <Text style={{ fontSize: 15, fontWeight: "600", color: colors.foreground }}>
            {props.title}
          </Text>
          <If when={props.subtitle}>
            <Text style={{ fontSize: 13, color: colors.mutedForeground }}>{props.subtitle}</Text>
          </If>
        </View>
        {props.right}
      </View>
      {props.children}
    </View>
  );
}

/** A thin rule across a popup or a sheet. */
export function Rule() {
  return <Separator style={{ marginHorizontal: -4 }} />;
}

/** A small segmented control: one option's `value`, its label the child. */
export function Choices(props: {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  label: string;
}) {
  return (
    <Segmented value={props.value} onValueChange={props.onChange}>
      <SegmentedList size="sm" accessibilityLabel={props.label}>
        <Each of={props.options}>
          {(option) => <SegmentedItem value={option().value}>{option().label}</SegmentedItem>}
        </Each>
      </SegmentedList>
    </Segmented>
  );
}

/** What a toast is about: the icon and the tone it shows. */
export type ToastKind = "success" | "error" | "warning" | "info" | "loading";

/** What a toast shows. */
export interface ToastContent {
  id?: string;
  title: string;
  description?: string;
  kind?: ToastKind;
  /** A bar under the text, 0 to 1. */
  progress?: number;
  /** A button that closes it; `toast` resolves with this label. */
  action?: string;
  /** The accessible label of a close button (the button shows a cross). */
  close?: string;
  /** Milliseconds it stays (5000); `Infinity` until dismissed. */
  duration?: number;
}

const kinds: Record<ToastKind, { icon: IconNode; tint: () => string }> = {
  success: { icon: CircleCheck, tint: () => colors.up },
  error: { icon: CircleX, tint: () => colors.destructive },
  warning: { icon: TriangleAlert, tint: () => colors.warn },
  info: { icon: Info, tint: () => colors.info },
  loading: { icon: Loader, tint: () => colors.mutedForeground },
};

const progressTone = (kind: ToastKind | undefined): Tone => (kind === "success" ? "up" : "accent");

/**
 * The gallery's toast host for one demo: `toast` shows one and resolves with the action that
 * closed it, `updateToast` changes it in place, `dismissToast` closes one or all, `Toaster` is
 * the stack at the bottom of the window.
 */
export function createToaster() {
  const manager = new ToastManager();
  const shown = signal<ToastEntry[]>([]);
  const expanded = signal(false);
  const contents = signal<Record<string, ToastContent>>({});
  const answers = new Map<string, (answer: string | null) => void>();
  const chosen = new Map<string, string>();
  const lingering = new Map<string, number>();
  let ticking: ReturnType<typeof setInterval> | undefined;
  let count = 0;
  const limit = 3;
  const tickMs = 50;

  function sync() {
    shown.set(manager.visible(limit));
  }

  function tick() {
    if (!expanded()) {
      for (const [id, left] of lingering) {
        if (left - tickMs > 0) lingering.set(id, left - tickMs);
        else {
          lingering.delete(id);
          manager.dismiss(id);
        }
      }
    }
    const advanced = manager.advance(expanded());
    for (const gone of advanced.removed) {
      answers.get(gone.id)?.(chosen.get(gone.id) ?? null);
      answers.delete(gone.id);
      chosen.delete(gone.id);
      lingering.delete(gone.id);
      const { [gone.id]: _dropped, ...rest } = contents();
      contents.set(rest);
    }
    if (advanced.changed) sync();
    if (manager.isEmpty() && ticking !== undefined) {
      clearInterval(ticking);
      ticking = undefined;
    }
  }

  function run() {
    sync();
    ticking ??= setInterval(tick, tickMs);
  }

  function toast(content: ToastContent): Promise<string | null> {
    const id = content.id ?? `toast-${++count}`;
    answers.get(id)?.(null);
    lingering.delete(id);
    contents.set({ ...contents(), [id]: { ...content, id } });
    manager.push(id, id, { timeout: content.duration ?? 5000 });
    run();
    return new Promise((resolve) => answers.set(id, resolve));
  }

  function updateToast(id: string, change: Partial<ToastContent>): boolean {
    const content = contents()[id];
    if (!content) return false;
    contents.set({ ...contents(), [id]: { ...content, ...change } });
    if (change.duration !== undefined) {
      if (Number.isFinite(change.duration)) lingering.set(id, change.duration);
      else lingering.delete(id);
    }
    return true;
  }

  function dismissToast(id?: string) {
    if (id === undefined) manager.dismissAll();
    else manager.dismiss(id);
    run();
  }

  function choose(id: string, action: string) {
    chosen.set(id, action);
    dismissToast(id);
  }

  function KindIcon(props: { kind: ToastKind }) {
    const spec = () => kinds[props.kind];
    return (
      <If
        when={props.kind === "loading"}
        else={<Icon icon={spec().icon} size={18} tint={spec().tint()} />}
      >
        <Spinner size={18} tint={colors.mutedForeground} />
      </If>
    );
  }

  function Item(props: { entry: ToastEntry }) {
    const content = () => contents()[props.entry.id] ?? { title: "" };
    const kind = () => content().kind;
    return (
      <Toast
        transitionStatus={props.entry.status}
        accessibilityLabel={[content().title, content().description].filter(Boolean).join(". ")}
        onDismissRequest={() => dismissToast(props.entry.id)}
        class="transition-all duration-200 ease-out"
        startingClass="opacity-0 translate-y-4"
        endingClass="opacity-0 scale-95"
        swipingClass="transition-none"
      >
        <If when={kind()}>
          <KindIcon kind={kind()!} />
        </If>
        <View style={{ flex: 1, gap: 2, minWidth: 0 }}>
          <Text style={toastTitle()}>{content().title}</Text>
          <If when={content().description}>
            <Text style={toastText()}>{content().description}</Text>
          </If>
          <If when={content().progress !== undefined}>
            <Progress
              value={(content().progress ?? 0) * 100}
              height={4}
              tone={progressTone(kind())}
              accessibilityLabel="Progress"
            />
          </If>
        </View>
        <If when={content().action}>
          <View
            role="button"
            accessibilityLabel={content().action}
            onPress={() => choose(props.entry.id, content().action!)}
            {...toastActionLook()}
          >
            <Text style={toastActionLabel()}>{content().action}</Text>
          </View>
        </If>
        <If when={content().close}>
          <View
            role="button"
            accessibilityLabel={content().close}
            onPress={() => dismissToast(props.entry.id)}
            {...toastCloseLook()}
          >
            <Icon icon={X} size={14} tint={colors.mutedForeground} />
          </View>
        </If>
      </Toast>
    );
  }

  function Toaster() {
    const place = (): ViewStyle =>
      wideWindow() ? { alignItems: "flex-end" } : { alignItems: "center" };
    return (
      <Overlay
        style={{
          pointerEvents: "box-none",
          left: 0,
          right: 0,
          bottom: 0,
          paddingHorizontal: 16,
          paddingTop: 16,
          paddingBottom: safeArea().bottom + 16,
          ...place(),
        }}
      >
        <ToastStack
          placement={wideWindow() ? "bottomRight" : "bottomCenter"}
          style={{ width: 340, maxWidth: "100%" }}
          onExpandedChange={({ expanded: open }) => expanded.set(open)}
          onCancel={() => {
            const newest = shown()
              .filter((entry) => entry.status !== "ending")
              .at(-1);
            if (newest) dismissToast(newest.id);
          }}
        >
          <Each of={shown()} key={(entry) => entry.id}>
            {(entry) => <Item entry={entry()} />}
          </Each>
        </ToastStack>
      </Overlay>
    );
  }

  return { toast, updateToast, dismissToast, Toaster };
}

/** A quiet menu-bar title or a raised opener. `bar` is the title; otherwise a raised button. */
export function Chip(props: {
  label: string;
  icon?: IconNode;
  bar?: boolean;
  open?: boolean;
  accessibilityLabel?: string;
}) {
  return (
    <View
      accessibilityLabel={props.accessibilityLabel ?? props.label}
      hoverStyle={
        props.open
          ? undefined
          : props.bar
            ? { backgroundColor: alpha(colors.foreground, 0.06) }
            : { ...finish.hover }
      }
      activeStyle={
        props.bar ? { backgroundColor: alpha(colors.foreground, 0.1) } : { ...finish.pressed }
      }
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        alignSelf: "flex-start",
        height: pointer ? 28 : 36,
        paddingHorizontal: props.bar ? 10 : pointer ? 10 : 14,
        ...rounded(pointer ? 7 : 10),
        borderWidth: 1,
        borderColor: props.bar ? "transparent" : finish.raised.borderColor,
        backgroundColor: props.bar ? (props.open ? token("accent") : "transparent") : colors.raised,
        ...(props.bar ? null : props.open ? finish.pressed : finish.raised),
      }}
    >
      <If when={props.icon}>
        <Icon icon={props.icon!} size={pointer ? 13 : 14} tint={colors.mutedForeground} />
      </If>
      <Text style={{ fontSize: pointer ? 13 : 15, fontWeight: "500", color: colors.foreground }}>
        {props.label}
      </Text>
    </View>
  );
}

/** A secondary action that fills a phone's row and sizes itself on a desktop. */
export function ActionButton(props: {
  label: string;
  variant?: ButtonVariant;
  disabled?: boolean;
  onPress?: () => void;
  accessibilityLabel?: string;
}) {
  return (
    <Button
      variant={props.variant ?? "default"}
      size="sm"
      disabled={props.disabled}
      accessibilityLabel={props.accessibilityLabel ?? props.label}
      onPress={props.onPress}
      style={pointer ? undefined : { flex: 1 }}
    >
      {props.label}
    </Button>
  );
}

/** A tone's color, read where it is drawn. */
export const tone = toneColor;
