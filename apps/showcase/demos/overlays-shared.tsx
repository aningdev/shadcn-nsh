import { feedback, surface, alpha, colors, rounded, toneColor, shape } from "@shadcn-nsh/theme";
// Helpers the overlay demos share: a trigger, a field, the event log, and a toast host that
// delegates to the library's `toast` / `Toaster`. Menu, popover and sheet still call
// `createToaster` and resolve with the action label. Sounds stay out.
import { type IconNode } from "lucide";
import type { JSX } from "nsh";
import { platform, signal, Text, token, View, windowSize } from "nsh";

import {
  Button,
  buttonGlyph,
  buttonLabel,
  buttonLook,
  type ButtonVariant,
} from "@/packages/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/packages/ui/card";
import { Input, type InputProps } from "@/packages/ui/input";
import { Icon } from "@/packages/ui/lib/icons";
import { Segmented, SegmentedItem, SegmentedList } from "@/packages/ui/segmented";
import { Separator } from "@/packages/ui/separator";
import { toast as raiseToast, Toaster as ToastHost } from "@/packages/ui/toast";

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
                    fontFamily: "monospace",
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
        ...rounded(shape.control),
        backgroundColor: colors.card,
        ...surface("inset").style,
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
    <Card>
      <CardHeader>
        <CardTitle>{props.title}</CardTitle>
        <If when={props.subtitle}>
          <CardDescription>{props.subtitle}</CardDescription>
        </If>
        <If when={props.right}>
          <CardAction>{props.right}</CardAction>
        </If>
      </CardHeader>
      <CardContent>{props.children}</CardContent>
    </Card>
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

/**
 * The gallery's promise-shaped host, on the library's one queue. `toast` resolves with the action
 * that closed it, `updateToast` changes it in place, `dismissToast` closes one or all, `Toaster`
 * is the library's stack. Menu, popover and sheet keep this shape; the toast scene calls the
 * library itself.
 */
export function createToaster() {
  function toast(content: ToastContent): Promise<string | null> {
    return new Promise((resolve) => {
      raiseToast(content.title, {
        id: content.id,
        description: content.description,
        type: content.kind,
        duration: content.duration ?? 5000,
        progress: content.progress,
        closeButton: content.close,
        action: content.action ? { label: content.action } : undefined,
        onDismiss: resolve,
      });
    });
  }

  function updateToast(id: string, change: Partial<ToastContent>): boolean {
    return raiseToast.update(id, {
      ...(change.title !== undefined ? { title: change.title } : {}),
      ...("description" in change ? { description: change.description ?? null } : {}),
      ...(change.kind !== undefined ? { type: change.kind } : {}),
      ...("action" in change ? { action: change.action ? { label: change.action } : null } : {}),
      ...(change.close !== undefined ? { closeButton: change.close } : {}),
      ...("progress" in change ? { progress: change.progress ?? null } : {}),
      ...(change.duration !== undefined ? { duration: change.duration } : {}),
    });
  }

  function dismissToast(id?: string) {
    raiseToast.dismiss(id);
  }

  function Toaster() {
    return <ToastHost />;
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
            : { ...feedback.hoverSurface() }
      }
      activeStyle={
        props.bar
          ? { backgroundColor: alpha(colors.foreground, 0.1) }
          : { ...feedback.press().activeStyle }
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
        borderColor: props.bar ? "transparent" : surface("raised").style.borderColor,
        backgroundColor: props.bar
          ? props.open
            ? token("accent")
            : "transparent"
          : colors.surface,
        ...(props.bar ? null : props.open ? feedback.press().activeStyle : surface("raised").style),
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
