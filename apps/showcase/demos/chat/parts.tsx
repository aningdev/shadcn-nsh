// The chat's parts: a spinner, the streaming caret, the row under a reply, a day's separator, a
// file, a photo, a tool call with its result, a source, an error and the assistant's avatar.
// Ported from the gallery's `demos/chat/parts.tsx`, in the theme's roles and this library's parts
// (a file is an `Attachment`, a tool call a `Trace` line, a press a `Pressable`).
import {
  alpha,
  colors,
  finish,
  focusRing,
  rounded,
  type Tone,
  toneColor,
  toneTint,
  shape,
} from "@shadcn-nsh/theme";
import { Globe, Sparkles, Sun, Terminal, X, type IconNode } from "lucide";
import { type JSX, Image, signal, Text, View, type ViewStyle } from "nsh";

import {
  Attachment,
  AttachmentActions,
  AttachmentContent,
  AttachmentDescription,
  AttachmentMedia,
  AttachmentTitle,
} from "@/packages/ui/attachment";
import { IconButton } from "@/packages/ui/button";
import { CodeBlock, CodeBlockContent, CodeBlockFooter } from "@/packages/ui/code-block";
import { ItemMedia } from "@/packages/ui/item";
import { Icon } from "@/packages/ui/lib/icons";
import { pressSink } from "@/packages/ui/lib/press";
import {
  Trace,
  TraceCollapsible,
  TraceCollapsibleContent,
  TraceCollapsibleTrigger,
  TraceDescription,
  TraceIcon,
  TraceLine,
  TraceTitle,
} from "@/packages/ui/trace";

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
    <View
      onPress={props.onPress}
      role="button"
      accessibilityLabel={props.label}
      accessibilityState={props.active === undefined ? undefined : { selected: props.active }}
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
      activeStyle={pressSink(0.85).activeStyle}
      focusVisibleStyle={focusRing()}
    >
      <Glyph
        name={props.glyph}
        size={17}
        tint={props.active ? toneColor(tone()) : colors.mutedForeground}
      />
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
          <IconButton
            variant="ghost"
            size="sm"
            accessibilityLabel="Remove file"
            onPress={props.onRemove}
            style={{ width: 28, height: 28 }}
            icon={X}
          />
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
        ...rounded(shape.control),
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

const stateNote: Record<ToolState, string> = {
  pending: "Queued",
  running: "Running",
  done: "",
  cancelled: "Stopped",
};

/**
 * A tool call: a `Trace` line with its state, opening onto its result once done (a `CodeBlock`
 * for code, a card of rows for a search or a weather lookup). It opens by itself when the call is
 * done, until it is pressed.
 */
export function ToolCard(props: { tool: Tool }) {
  const t = () => props.tool;
  const head = (): { icon: IconNode; title: string; detail: string } => {
    const tool = t();
    if (tool.kind === "search") return { icon: Globe, title: "Web search", detail: tool.query };
    if (tool.kind === "weather") return { icon: Sun, title: "Weather", detail: tool.city };
    return { icon: Terminal, title: "Run code", detail: `${tool.lang}, sandboxed` };
  };
  const status = () =>
    t().state === "pending" ? "pending" : t().state === "running" ? "running" : undefined;
  // The result is there once the call is done; the user's press overrides it from then on.
  const pressed = signal<boolean | null>(null);
  const ready = () => t().state === "done";
  return (
    <Trace>
      <TraceCollapsible
        open={ready() && (pressed() ?? true)}
        onOpenChange={(event) => pressed.set(event.open)}
      >
        <TraceCollapsibleTrigger disabled={!ready()}>
          <TraceLine status={status()}>
            <TraceIcon>
              <Icon icon={head().icon} size={16} tint={colors.mutedForeground} />
            </TraceIcon>
            <TraceTitle>{head().title}</TraceTitle>
            <TraceDescription>{stateNote[t().state] || head().detail}</TraceDescription>
          </TraceLine>
        </TraceCollapsibleTrigger>
        <TraceCollapsibleContent>
          <ToolBody tool={t()} />
        </TraceCollapsibleContent>
      </TraceCollapsible>
    </Trace>
  );
}

/** The card a search or a weather result sits in, under its trace line. */
const resultCard: ViewStyle = {
  backgroundColor: colors.card,
  ...rounded(shape.control),
  borderWidth: 1,
  borderColor: colors.border,
  overflow: "hidden",
};

function ToolBody(props: { tool: Tool }) {
  // The kind never changes for a card; its state and data do.
  const kind = props.tool.kind;
  const search = () => props.tool as Extract<Tool, { kind: "search" }>;
  const weather = () => props.tool as Extract<Tool, { kind: "weather" }>;
  const code = () => props.tool as Extract<Tool, { kind: "code" }>;
  if (kind === "search")
    return (
      <If when={search().state === "done"}>
        <View style={[resultCard, { paddingVertical: 4 }]}>
          <Each of={search().sources}>
            {(source, i) => <SourceRow source={source()} index={i()} />}
          </Each>
        </View>
      </If>
    );
  if (kind === "weather")
    return (
      <If when={weather().state === "done"}>
        <View style={[resultCard, { padding: 12, gap: 12 }]}>
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
    <CodeBlock size="sm">
      <CodeBlockContent wrap>{code().code}</CodeBlockContent>
      <If when={code().state === "done"}>
        <CodeBlockFooter style={{ minHeight: 44, columnGap: 10 }}>
          Output
          <Text
            style={{
              userSelect: "text",
              flex: 1,
              fontFamily: "monospace",
              fontSize: 14,
              color: colors.up,
            }}
          >
            {code().output}
          </Text>
          <Text style={{ fontSize: 12, color: colors.faint, fontVariant: ["tabular-nums"] }}>
            exit 0 · {code().ms} ms
          </Text>
        </CodeBlockFooter>
      </If>
    </CodeBlock>
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
      <ItemMedia
        variant="icon"
        style={{
          width: 24,
          height: 24,
          ...rounded(6),
          borderColor: "transparent",
          backgroundColor: toneTint(props.source.tone),
        }}
      >
        <Text style={{ fontSize: 12, fontWeight: "700", color: toneColor(props.source.tone) }}>
          {props.source.site[0].toUpperCase()}
        </Text>
      </ItemMedia>
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
        ...rounded(shape.control),
        backgroundColor: toneTint("destructive"),
        borderWidth: 1,
        borderColor: alpha(colors.destructive, 0.32),
      }}
    >
      <Glyph name="alert" size={18} tint={colors.destructive} />
      <Text style={{ flex: 1, fontSize: 14, lineHeight: 19, color: colors.foreground }}>
        {props.message}
      </Text>
      <View
        onPress={props.onRetry}
        role="button"
        accessibilityLabel="Retry"
        style={{
          height: 36,
          paddingHorizontal: 14,
          borderRadius: 18,
          flexDirection: "row",
          alignItems: "center",
          gap: 6,
          backgroundColor: colors.primary,
          ...finish.accent,
        }}
        hoverStyle={{ opacity: 0.86 }}
        activeStyle={pressSink().activeStyle}
        focusVisibleStyle={focusRing()}
      >
        <Glyph name="regenerate" size={14} tint={colors.primaryForeground} />
        <Text style={{ fontSize: 13, fontWeight: "600", color: colors.primaryForeground }}>
          Retry
        </Text>
      </View>
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
