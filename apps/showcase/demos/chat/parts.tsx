// The chat's parts: a spinner, the streaming caret, the row under a reply, a day's separator, a
// file, a photo, a tool call with its result, a source, an error and the assistant's avatar.
// Ported from the gallery's `demos/chat/parts.tsx`, in the theme's roles and this library's parts
// (a file is an `Attachment`, a state a `Badge`, a press a `Pressable`).
import {
  alpha,
  colors,
  finish,
  hovered,
  isDark,
  mono,
  radius,
  rounded,
  type Tone,
  toneColor,
  toneTint,
} from "@shadcn-nsh/theme";
import { Sparkles, X } from "lucide";
import { type JSX, Image, Text, View } from "nsh";

import {
  Attachment,
  AttachmentAction,
  AttachmentActions,
  AttachmentContent,
  AttachmentDescription,
  AttachmentMedia,
  AttachmentTitle,
} from "@/packages/ui/attachment";
import { Badge } from "@/packages/ui/badge";
import { buttonGlyph } from "@/packages/ui/button";
import { Icon } from "@/packages/ui/lib/icons";
import { Pressable } from "@/packages/ui/pressable";

import { Glyph, type GlyphName } from "./glyphs";
import type { FileRef, Source, Tool, ToolState } from "./scripts";

/** A ring that spins natively (the built-in `spin` keyframes). */
export function Spinner(props: { size?: number; tint?: string }) {
  const size = props.size ?? 14;
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        borderWidth: 2,
        borderColor: colors.border,
        borderTopColor: props.tint ?? colors.brand,
        animationName: "spin",
        animationDuration: 800,
        animationTimingFunction: "linear",
        animationIterationCount: "infinite",
      }}
    />
  );
}

/** The streaming caret: an inline block that pulses natively. */
export function Caret() {
  return (
    <View
      style={{
        width: 8,
        height: 16,
        marginLeft: 2,
        borderRadius: 2,
        backgroundColor: colors.brand,
        animationName: "pulse",
        animationDuration: 900,
        animationIterationCount: "infinite",
      }}
    />
  );
}

/** A small icon button under a reply: 36 points, tinted while it is on. */
export function ActionButton(props: {
  glyph: GlyphName;
  label: string;
  active?: boolean;
  tone?: Tone;
  onPress: () => void;
}) {
  const tone = () => props.tone ?? "accent";
  return (
    <Pressable
      onPress={props.onPress}
      accessibilityLabel={props.label}
      selected={props.active}
      style={{
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: props.active ? toneTint(tone()) : "transparent",
        transitionProperty: "colors",
        transitionDuration: 180,
      }}
      hoverStyle={{ opacity: 0.72 }}
    >
      <Glyph
        name={props.glyph}
        size={17}
        tint={props.active ? toneColor(tone()) : colors.mutedForeground}
      />
    </Pressable>
  );
}

/** A row between days. */
export function DateSeparator(props: { label: string }) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
      }}
    >
      <View style={{ flex: 1, height: 1, backgroundColor: colors.line }} />
      <Text style={{ fontSize: 12, fontWeight: "500", color: colors.faint }}>{props.label}</Text>
      <View style={{ flex: 1, height: 1, backgroundColor: colors.line }} />
    </View>
  );
}

/** A file as an attachment: a tile, the name and the size. */
export function FileChip(props: { file: FileRef; onRemove?: () => void }) {
  const kind = () => (props.file.name.split(".").pop() ?? "file").toUpperCase();
  return (
    <Attachment
      size="sm"
      style={{
        alignSelf: "flex-start",
        backgroundColor: colors.raised,
        ...finish.raised,
        borderWidth: 1,
        borderColor: colors.border,
      }}
    >
      <AttachmentMedia
        variant="icon"
        style={{ backgroundColor: toneTint("destructive"), borderColor: "transparent" }}
      >
        <Glyph name="file" size={16} tint={colors.destructive} />
      </AttachmentMedia>
      <AttachmentContent>
        <AttachmentTitle>{props.file.name}</AttachmentTitle>
        <AttachmentDescription>{`${kind()} · ${props.file.size}`}</AttachmentDescription>
      </AttachmentContent>
      <If when={props.onRemove}>
        <AttachmentActions>
          <AttachmentAction accessibilityLabel="Remove file" onPress={props.onRemove}>
            <Icon icon={X} {...buttonGlyph("ghost", { size: "sm" })} />
          </AttachmentAction>
        </AttachmentActions>
      </If>
    </Attachment>
  );
}

/** An attached image, rounded. */
export function Photo(props: {
  src: string;
  width: number;
  height: number;
  children?: JSX.Element;
}) {
  return (
    <View
      style={{
        width: props.width,
        height: props.height,
        ...rounded(radius.inset),
        overflow: "hidden",
        backgroundColor: colors.raised,
        borderWidth: 1,
        borderColor: colors.border,
      }}
    >
      <Image src={props.src} style={{ width: props.width, height: props.height }} />
      {props.children}
    </View>
  );
}

const stateLabel: Record<ToolState, string> = {
  pending: "Queued",
  running: "Running",
  done: "Done",
  cancelled: "Stopped",
};
const stateTone: Record<ToolState, Tone> = {
  pending: "neutral",
  running: "info",
  done: "up",
  cancelled: "warn",
};

/**
 * A tool call: a header with its state, then its result once done. (The library has no card for a
 * pending call with a body — `Item` is a row — so the demo draws it, on `finish.card`.)
 */
export function ToolCard(props: { tool: Tool }) {
  const t = () => props.tool;
  const head = (): { glyph: GlyphName; title: string; detail: string } => {
    const tool = t();
    if (tool.kind === "search") return { glyph: "globe", title: "Web search", detail: tool.query };
    if (tool.kind === "weather") return { glyph: "sun", title: "Weather", detail: tool.city };
    return { glyph: "terminal", title: "Run code", detail: `${tool.lang}, sandboxed` };
  };
  return (
    <View
      style={{
        backgroundColor: colors.card,
        ...finish.card,
        ...rounded(radius.inset),
        borderWidth: 1,
        borderColor:
          t().state === "running" ? alpha(colors.info, isDark() ? 0.55 : 0.4) : colors.border,
        transitionProperty: "colors",
        transitionDuration: 250,
        overflow: "hidden",
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12, padding: 12 }}>
        <View
          style={{
            width: 32,
            height: 32,
            ...rounded(9),
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: colors.raised,
            ...finish.raised,
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <Glyph name={head().glyph} size={16} tint={colors.foreground} />
        </View>
        <View style={{ flex: 1, gap: 1 }}>
          <Text style={{ fontSize: 14, fontWeight: "600", color: colors.foreground }}>
            {head().title}
          </Text>
          <Text style={{ numberOfLines: 1, fontSize: 13, color: colors.mutedForeground }}>
            {head().detail}
          </Text>
        </View>
        <If
          when={t().state === "running" || t().state === "pending"}
          else={<Badge tone={stateTone[t().state]}>{stateLabel[t().state]}</Badge>}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Spinner tint={t().state === "pending" ? colors.faint : colors.info} />
            <Text style={{ fontSize: 13, color: colors.mutedForeground }}>
              {stateLabel[t().state]}
            </Text>
          </View>
        </If>
      </View>
      <ToolBody tool={t()} />
    </View>
  );
}

function ToolBody(props: { tool: Tool }) {
  // The kind never changes for a card; its state and data do.
  const kind = props.tool.kind;
  const search = () => props.tool as Extract<Tool, { kind: "search" }>;
  const weather = () => props.tool as Extract<Tool, { kind: "weather" }>;
  const code = () => props.tool as Extract<Tool, { kind: "code" }>;
  if (kind === "search")
    return (
      <If when={search().state === "done"}>
        <View style={{ borderTopWidth: 1, borderTopColor: colors.line, paddingVertical: 4 }}>
          <Each of={search().sources}>
            {(source, i) => <SourceRow source={source()} index={i()} />}
          </Each>
        </View>
      </If>
    );
  if (kind === "weather")
    return (
      <If when={weather().state === "done"}>
        <View style={{ borderTopWidth: 1, borderTopColor: colors.line, padding: 12, gap: 12 }}>
          <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 12 }}>
            <Text
              style={{
                fontSize: 40,
                fontWeight: "600",
                color: colors.foreground,
                fontVariant: ["tabular-nums"],
                letterSpacing: -1,
              }}
            >
              {weather().temp}°
            </Text>
            <View style={{ flex: 1, paddingBottom: 7, gap: 2 }}>
              <Text style={{ fontSize: 15, color: colors.foreground }}>{weather().condition}</Text>
              <Text
                style={{
                  fontSize: 13,
                  color: colors.mutedForeground,
                  fontVariant: ["tabular-nums"],
                }}
              >
                H {weather().high}° L {weather().low}°
              </Text>
            </View>
          </View>
          <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 6, height: 44 }}>
            <Each of={weather().hours}>
              {(temp, i) => (
                <View style={{ flex: 1, alignItems: "center", gap: 4 }}>
                  <View
                    style={{
                      width: "100%",
                      height: 6 + (temp() - weather().low) * 3,
                      borderRadius: 3,
                      backgroundColor: i() === 0 ? colors.warn : colors.raised,
                    }}
                  />
                  <Text
                    style={{
                      fontSize: 11,
                      color: colors.faint,
                      fontVariant: ["tabular-nums"],
                    }}
                  >
                    {(17 + i()) % 24}h
                  </Text>
                </View>
              )}
            </Each>
          </View>
        </View>
      </If>
    );
  return (
    <View style={{ borderTopWidth: 1, borderTopColor: colors.line }}>
      <View style={{ padding: 12, backgroundColor: colors.inset }}>
        <Text
          style={{
            userSelect: "text",
            fontFamily: mono(),
            fontSize: 12,
            lineHeight: 18,
            color: colors.code,
          }}
        >
          {code().code}
        </Text>
      </View>
      <If when={code().state === "done"}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
            paddingHorizontal: 12,
            height: 44,
            borderTopWidth: 1,
            borderTopColor: colors.line,
          }}
        >
          <Text style={{ fontSize: 13, color: colors.mutedForeground }}>Output</Text>
          <Text
            style={{
              userSelect: "text",
              flex: 1,
              fontFamily: mono(),
              fontSize: 14,
              color: colors.up,
            }}
          >
            {code().output}
          </Text>
          <Text style={{ fontSize: 12, color: colors.faint, fontVariant: ["tabular-nums"] }}>
            exit 0 · {code().ms} ms
          </Text>
        </View>
      </If>
    </View>
  );
}

function SourceRow(props: { source: Source; index: number }) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        height: 48,
        paddingHorizontal: 12,
      }}
    >
      <View
        style={{
          width: 24,
          height: 24,
          ...rounded(6),
          backgroundColor: toneTint(props.source.tone),
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text style={{ fontSize: 12, fontWeight: "700", color: toneColor(props.source.tone) }}>
          {props.source.site[0].toUpperCase()}
        </Text>
      </View>
      <View style={{ flex: 1, gap: 1 }}>
        <Text style={{ numberOfLines: 1, fontSize: 14, color: colors.foreground }}>
          {props.source.title}
        </Text>
        <Text style={{ fontSize: 12, color: colors.faint }}>{props.source.site}</Text>
      </View>
      <Text style={{ fontSize: 12, color: colors.faint, fontVariant: ["tabular-nums"] }}>
        {props.index + 1}
      </Text>
    </View>
  );
}

/** The reply's error: what went wrong and a Retry button. */
export function ErrorRow(props: { message: string; onRetry: () => void }) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        padding: 12,
        ...rounded(radius.inset),
        backgroundColor: toneTint("destructive"),
        borderWidth: 1,
        borderColor: alpha(colors.destructive, 0.32),
      }}
    >
      <Glyph name="alert" size={18} tint={colors.destructive} />
      <Text style={{ flex: 1, fontSize: 14, lineHeight: 19, color: colors.foreground }}>
        {props.message}
      </Text>
      <Pressable
        onPress={props.onRetry}
        accessibilityLabel="Retry"
        style={{
          height: 36,
          paddingHorizontal: 14,
          borderRadius: 18,
          flexDirection: "row",
          alignItems: "center",
          gap: 6,
          backgroundColor: colors.primary,
          ...finish.light,
        }}
        hoverStyle={hovered()}
      >
        <Glyph name="regenerate" size={14} tint={colors.primaryForeground} />
        <Text style={{ fontSize: 13, fontWeight: "600", color: colors.primaryForeground }}>
          Retry
        </Text>
      </Pressable>
    </View>
  );
}

/** The assistant's avatar: a small tile with the spark. */
export function Avatar() {
  return (
    <View
      style={{
        width: 26,
        height: 26,
        ...rounded(8),
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: colors.raised,
        ...finish.raised,
        borderWidth: 1,
        borderColor: colors.border,
      }}
    >
      <Icon icon={Sparkles} size={14} tint={colors.brand} />
    </View>
  );
}
