// A code block: a titled block of code or output, a copy button that flips to a check, line numbers
// and a footer.

import {
  alpha,
  colors,
  font,
  rounded,
  shape,
  stroke,
  surface,
  type TypeRole,
} from "@shadcn-nsh/theme";
import { Check, Copy } from "lucide";
import type { JSX, ScrollProps, TextProps, TextStyle, ViewProps, ViewStyle } from "nsh";
import { Clipboard, context, Scroll, split, Text, View } from "nsh";

import { IconButton, iconButtonGlyph, type IconButtonProps } from "./button";
import { IconLabel } from "./lib/icons";
import { useCopied } from "./lib/state";
import { density } from "./lib/surface";
import { AsText } from "./lib/utils";

/** A code block's variants: `default`, an inset well; `destructive`, the danger tone's, for an error log. */
export type CodeBlockVariant = "default" | "destructive";

/** A code block's sizes: `default`, and `sm` for a tool's output, tighter and a step smaller. */
export type CodeBlockSize = "default" | "sm";

/** A line's states: `default`; `highlighted`, called out; `added` and `removed`, a diff's, each with its marker. */
export type CodeBlockLineVariant = "default" | "highlighted" | "added" | "removed";

/** A code block's parts as the styles they wear: spread each one. */
export interface CodeBlockLook {
  /** The surface: an inset well with a hairline edge, clipping what it holds to its corners. */
  root(variant: CodeBlockVariant): ViewStyle;
  /** The header's row: a title at the start, the actions at the end, a hairline under it. */
  header(variant: CodeBlockVariant, size: CodeBlockSize): ViewStyle;
  /** The title's type: a filename or a label, one line. */
  title(variant: CodeBlockVariant): TextStyle;
  /** The actions' row, pushed to the end of the header. */
  actions(): ViewStyle;
  /** The padding round the code. */
  content(size: CodeBlockSize): ViewStyle;
  /** The type of the code: the theme's monospaced family, a step smaller in `sm`. */
  code(variant: CodeBlockVariant, size: CodeBlockSize): TextStyle;
  /** A line's row (its gutter beside its text), tinted by its state. */
  line(variant: CodeBlockLineVariant, size: CodeBlockSize): ViewStyle;
  /** A line's number, right-aligned in its gutter. */
  gutter(variant: CodeBlockVariant, size: CodeBlockSize, digits: number): TextStyle;
  /** A line's marker (`+` or `−`) at the start of its text. */
  marker(variant: CodeBlockLineVariant, size: CodeBlockSize): TextStyle;
  /** The footer's row: a hairline above it, then its notes. */
  footer(variant: CodeBlockVariant, size: CodeBlockSize): ViewStyle;
  /** The type of a footer's text. */
  footerText(variant: CodeBlockVariant): TextStyle;
}

/** The width of a monospaced digit, as a fraction of the type's size. */
const DIGIT = 0.62;

/** The theme's type role for code: `detail`, and `caption` a step smaller for `sm`. */
const codeRole = (size: CodeBlockSize): TypeRole => (size === "sm" ? "caption" : "detail");

/** The hairline inside a block: `line`, and the danger tone's thin tint in `destructive`. */
const rule = (variant: CodeBlockVariant) =>
  variant === "destructive" ? alpha(colors.destructive, 0.2) : colors.line;

/**
 * A code block's look: an inset well (the danger tone's tint for `destructive`) with a hairline
 * edge and the theme's inset corners; a header of 36 points (32 in `sm`) under a hairline; code
 * in the theme's monospaced family at its `detail` role (`caption` in `sm`); a footer under a
 * hairline. Every size is a type role or `density`, every color a role.
 */
export function codeBlockLook(): CodeBlockLook {
  return {
    root: (variant) => ({
      flexDirection: "column",
      minWidth: 0,
      overflow: "hidden",
      borderWidth: stroke.hairline,
      borderColor: variant === "destructive" ? alpha(colors.destructive, 0.4) : colors.border,
      ...rounded(shape.control),
      backgroundColor:
        variant === "destructive"
          ? alpha(colors.destructive, 0.06)
          : surface("inset").style.backgroundColor,
    }),
    header: (variant, size) => ({
      flexDirection: "row",
      alignItems: "center",
      columnGap: 8,
      minHeight: size === "sm" ? 32 : 36,
      paddingStart: size === "sm" ? 10 : 12,
      paddingEnd: size === "sm" ? 4 : 6,
      borderBottomWidth: stroke.hairline,
      borderBottomColor: rule(variant),
    }),
    title: (variant) => ({
      flexShrink: 1,
      minWidth: 0,
      fontSize: density.note,
      fontWeight: font.weight("label"),
      color: variant === "destructive" ? colors.destructive : colors.mutedForeground,
      numberOfLines: 1,
    }),
    actions: () => ({
      flexDirection: "row",
      alignItems: "center",
      flexShrink: 0,
      columnGap: 2,
      marginStart: "auto",
    }),
    content: (size) => ({
      paddingHorizontal: size === "sm" ? 10 : 12,
      paddingVertical: size === "sm" ? 8 : 10,
    }),
    code: (variant, size) => ({
      userSelect: "text",
      fontFamily: "monospace",
      fontSize: font.size(codeRole(size)),
      lineHeight: font.lineHeight(codeRole(size)),
      color: variant === "destructive" ? colors.destructive : colors.foreground,
    }),
    line: (variant, size) => ({
      flexDirection: "row",
      alignSelf: "stretch",
      minHeight: font.lineHeight(codeRole(size)),
      // A line's tint reaches the block's edges: the content's padding is taken back.
      marginHorizontal: size === "sm" ? -10 : -12,
      paddingHorizontal: size === "sm" ? 10 : 12,
      backgroundColor:
        variant === "highlighted"
          ? alpha(colors.foreground, 0.08)
          : variant === "added"
            ? alpha(colors.success, 0.14)
            : variant === "removed"
              ? alpha(colors.destructive, 0.14)
              : "transparent",
    }),
    gutter: (variant, size, digits) => ({
      userSelect: "none",
      fontFamily: "monospace",
      fontSize: font.size(codeRole(size)),
      lineHeight: font.lineHeight(codeRole(size)),
      width: Math.ceil(digits * font.size(codeRole(size)) * DIGIT),
      marginEnd: 12,
      textAlign: "right",
      color: variant === "destructive" ? alpha(colors.destructive, 0.6) : colors.faint,
      fontVariant: ["tabular-nums"],
    }),
    marker: (variant, size) => ({
      userSelect: "none",
      fontFamily: "monospace",
      fontSize: font.size(codeRole(size)),
      lineHeight: font.lineHeight(codeRole(size)),
      width: Math.ceil(font.size(codeRole(size)) * DIGIT * 2),
      color:
        variant === "added"
          ? colors.success
          : variant === "removed"
            ? colors.destructive
            : "transparent",
    }),
    footer: (variant, size) => ({
      flexDirection: "row",
      alignItems: "center",
      columnGap: 10,
      minHeight: size === "sm" ? 32 : 40,
      paddingHorizontal: size === "sm" ? 10 : 12,
      borderTopWidth: stroke.hairline,
      borderTopColor: rule(variant),
    }),
    footerText: (variant) => ({
      fontSize: density.note,
      color: variant === "destructive" ? colors.destructive : colors.mutedForeground,
    }),
  };
}

/** What a part under a `CodeBlock` reads from it: shadcn hands these down as data attributes. */
interface CodeBlockState {
  readonly variant: CodeBlockVariant;
  readonly size: CodeBlockSize;
}

const CodeBlockContext = context<CodeBlockState>({ variant: "default", size: "default" });

/** What a part under a `CodeBlockContent` reads from it: whether it numbers its lines, and how wide the gutter is (in digits; `0` for lines of your own, which fit their own number, two digits at least). */
interface CodeBlockLines {
  readonly numbered: boolean;
  readonly digits: number;
  readonly wrap: boolean;
  /** The next line's number: lines take theirs in the order they are drawn. */
  next(): number;
}

const CodeBlockLinesContext = context<CodeBlockLines | null>(null);

/** A code block: the surface, with the header, the code and the footer inside it. */
export type CodeBlockProps = ViewProps & {
  /** Default `default`; `destructive` for errors and failed output. */
  variant?: CodeBlockVariant;
  /** Default `default`; `sm` has tighter padding and smaller code, for a tool's output. */
  size?: CodeBlockSize;
};

/**
 * Code, a command's output or a log in a block, after shadcn/ui's `CodeBlock`: write a
 * `CodeBlockHeader` (a `CodeBlockTitle`, `CodeBlockActions` with a `CodeBlockCopyButton`), a
 * `CodeBlockContent` and, if there is something to say below, a `CodeBlockFooter`. There is no
 * syntax highlighting: the code is one color, in the theme's monospaced family.
 */
export function CodeBlock(props: CodeBlockProps) {
  const [, rest] = split(props, ["variant", "size", "style"]);
  const state: CodeBlockState = {
    get variant() {
      return props.variant ?? "default";
    },
    get size() {
      return props.size ?? "default";
    },
  };
  return (
    <CodeBlockContext.Provider value={state}>
      <View {...rest} style={[codeBlockLook().root(state.variant), props.style ?? null]}>
        {props.children}
      </View>
    </CodeBlockContext.Provider>
  );
}

/** A row above the code for a title and its actions. */
export type CodeBlockHeaderProps = ViewProps;

/** A row above the code: a `CodeBlockTitle` at the start, `CodeBlockActions` at the end. */
export function CodeBlockHeader(props: CodeBlockHeaderProps) {
  const [, rest] = split(props, ["style"]);
  const block = CodeBlockContext();
  return (
    <View
      {...rest}
      style={[codeBlockLook().header(block.variant, block.size), props.style ?? null]}
    >
      {props.children}
    </View>
  );
}

/** A filename or a label. */
export type CodeBlockTitleProps = TextProps;

/** A filename or a label: one line, cut with an ellipsis when the header is narrower. */
export function CodeBlockTitle(props: CodeBlockTitleProps) {
  const [, rest] = split(props, ["style"]);
  const block = CodeBlockContext();
  return (
    <Text {...rest} style={[codeBlockLook().title(block.variant), props.style ?? null]}>
      {props.children}
    </Text>
  );
}

/** Buttons at the end of the header. */
export type CodeBlockActionsProps = ViewProps;

/** Buttons at the end of the header, a hairline apart: a wrap toggle, a `CodeBlockCopyButton`. */
export function CodeBlockActions(props: CodeBlockActionsProps) {
  const [, rest] = split(props, ["style"]);
  return (
    <View {...rest} style={[codeBlockLook().actions(), props.style ?? null]}>
      {props.children}
    </View>
  );
}

/** A copy button's props: an `IconButton`'s, without its icon and its label, which the part owns. */
export type CodeBlockCopyButtonProps = Omit<
  IconButtonProps,
  "accessibilityLabel" | "children" | "variant" | "size"
> & {
  /** The text to copy. */
  value: string;
  /** Default `sm` (24 points with a pointer); the `IconButton` scale. */
  size?: IconButtonProps["size"];
};

/**
 * A ghost icon button that copies `value` to the system clipboard and shows a check for two
 * seconds, its `accessibilityLabel` reading "Copy" and then "Copied". The press is also passed to
 * `onPress`, before the copy.
 */
export function CodeBlockCopyButton(props: CodeBlockCopyButtonProps) {
  const [, rest] = split(props, ["value", "size", "onPress"]);
  const block = CodeBlockContext();
  const { copied, mark } = useCopied();
  const glyph = iconButtonGlyph({ size: () => props.size ?? "sm" });
  return (
    <IconButton
      {...rest}
      variant="ghost"
      size={props.size ?? "sm"}
      accessibilityLabel={copied() ? "Copied" : "Copy"}
      onPress={() => {
        props.onPress?.();
        Clipboard.writeText(props.value).then(
          () => mark(),
          () => {},
        );
      }}
    >
      <IconLabel
        label={copied() ? "✓" : "Copy"}
        icon={copied() ? Check : Copy}
        size={glyph.size}
        tint={
          copied()
            ? colors.brand
            : block.variant === "destructive"
              ? colors.destructive
              : glyph.tint
        }
      />
    </IconButton>
  );
}

/** The code: a string, or a list of `CodeBlockLine`. */
export type CodeBlockContentProps = Omit<
  ScrollProps,
  "children" | "horizontal" | "scrollbar" | "contentStyle"
> & {
  /**
   * The code as a string, split into lines at its newlines (one trailing newline is ignored), or
   * `CodeBlockLine`s of your own for lines that are called out or highlighted by another tool.
   */
  children?: string | JSX.Element;
  /** Number each line. Default `false`. */
  lineNumbers?: boolean;
  /** The number of the first line, with `lineNumbers`: a snippet from the middle of a file. Default `1`. */
  startLine?: number;
  /** Wrap long lines instead of scrolling them sideways. Default `false`. */
  wrap?: boolean;
};

/** The lines of a string: split at newlines, one trailing newline dropped. */
const linesOf = (code: string) => code.replace(/\n$/, "").split("\n");

/**
 * The code, in the theme's monospaced family and selectable. Long lines scroll sideways without a
 * scrollbar (`wrap` wraps them instead); `maxHeight` in `style` caps the block and the code
 * scrolls inside it.
 */
export function CodeBlockContent(props: CodeBlockContentProps) {
  const [, rest] = split(props, ["children", "lineNumbers", "startLine", "wrap", "style"]);
  const block = CodeBlockContext();
  const wrap = () => props.wrap ?? false;
  const column = (): ViewStyle => ({
    flexDirection: "column",
    ...(wrap() ? { alignSelf: "stretch" } : { minWidth: "100%" }),
  });
  // Lines of your own take their numbers in the order they are drawn: the counter starts over
  // each time the children are read.
  const run = { drawn: 0, first: 1 };
  const body = (
    <CodeBlockLinesContext.Provider
      value={{
        get numbered() {
          return props.lineNumbers ?? false;
        },
        digits: 0,
        get wrap() {
          return wrap();
        },
        next: () => run.first + run.drawn++,
      }}
    >
      {(() => {
        run.drawn = 0;
        run.first = props.startLine ?? 1;
        const code = props.children;
        if (typeof code !== "string") return code;
        const lines = linesOf(code);
        if (!(props.lineNumbers ?? false)) {
          return (
            <Text style={codeBlockLook().code(block.variant, block.size)}>{lines.join("\n")}</Text>
          );
        }
        const digits = String(run.first + lines.length - 1).length;
        return (
          <CodeBlockLinesContext.Provider
            value={{ numbered: true, digits, wrap: wrap(), next: counter(run.first) }}
          >
            <Each of={lines}>{(line) => <CodeBlockLine>{line()}</CodeBlockLine>}</Each>
          </CodeBlockLinesContext.Provider>
        );
      })()}
    </CodeBlockLinesContext.Provider>
  );
  return (
    <Scroll
      {...rest}
      horizontal={!wrap()}
      scrollbar={false}
      style={[props.style ?? null]}
      contentStyle={[codeBlockLook().content(block.size), column()]}
    >
      {body}
    </Scroll>
  );
}

/** A counter of line numbers from `start`. */
const counter = (start: number) => {
  let n = start - 1;
  return () => ++n;
};

/** One line of code. */
export type CodeBlockLineProps = ViewProps & {
  /** Default `default`; `highlighted` calls the line out, `added` and `removed` mark a diff with a `+` or `−`. */
  variant?: CodeBlockLineVariant;
  /** The number in the gutter, when the block numbers its lines: a line of your own says which. */
  lineNumber?: number;
  children?: string | JSX.Element;
};

/**
 * One line of code, for the lines you draw yourself (a line called out, a diff's). Its text is
 * selectable; a gutter number and a diff's marker are not.
 */
export function CodeBlockLine(props: CodeBlockLineProps) {
  const [, rest] = split(props, ["variant", "lineNumber", "children", "style"]);
  const block = CodeBlockContext();
  const lines = CodeBlockLinesContext();
  const number = lines?.next();
  const variant = () => props.variant ?? "default";
  const marked = () => variant() === "added" || variant() === "removed";
  return (
    <View {...rest} style={[codeBlockLook().line(variant(), block.size), props.style ?? null]}>
      {lines?.numbered ? (
        <Text
          style={codeBlockLook().gutter(
            block.variant,
            block.size,
            lines.digits || Math.max(2, String(props.lineNumber ?? number).length),
          )}
        >
          {props.lineNumber ?? number}
        </Text>
      ) : null}
      {marked() ? (
        <Text style={codeBlockLook().marker(variant(), block.size)}>
          {variant() === "added" ? "+" : "−"}
        </Text>
      ) : null}
      <AsText style={codeBlockLook().code(block.variant, block.size)}>{props.children}</AsText>
    </View>
  );
}

/** A row below the code. */
export type CodeBlockFooterProps = ViewProps;

/**
 * A row below the code under a hairline: a tool's result and how long it took, a "Show more"
 * button. A string child is drawn as a note in the muted ink.
 */
export function CodeBlockFooter(props: CodeBlockFooterProps) {
  const [, rest] = split(props, ["style", "children"]);
  const block = CodeBlockContext();
  return (
    <View
      {...rest}
      style={[codeBlockLook().footer(block.variant, block.size), props.style ?? null]}
    >
      <AsText style={codeBlockLook().footerText(block.variant)}>{props.children}</AsText>
    </View>
  );
}
