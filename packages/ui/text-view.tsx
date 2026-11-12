// Text view: link classes and the `TextView` that wears them.
// The look is ported from NSH's examples/nsh-gallery-ui (Apache-2.0, © Longbridge; see NOTICE).
// Its region is filled by `bun run port:vendor`: change it upstream, or in `port-map.json`.
import { split } from "nsh";
import {
  TextView as BaseTextView,
  type TextViewClasses,
  type TextViewDocument,
  type TextViewProps as BaseTextViewProps,
} from "nsh/base";

// @port look/workspace.tsx
/** A `TextView`'s links (its `classes`): the brand color over a faint
 * underline of it. */
export const textViewLinkClasses = { link: "text-brand decoration-brand/40" };

/** A streaming `TextView`'s caret (a view of this class, its
 * `streamingCaret`): a brand-colored block a line high that pulses. */
export const textViewCaretClass = "ml-0.5 h-4 w-2 animate-pulse rounded-sm bg-brand";
// @port end

function mergeClasses(base: TextViewClasses, extra?: TextViewClasses | null): TextViewClasses {
  if (extra == null) return base;
  const merged = { ...base };
  for (const key of Object.keys(extra) as (keyof TextViewClasses)[]) {
    const next = extra[key];
    if (next === undefined) continue;
    if (next === null) {
      delete merged[key];
      continue;
    }
    const prior = merged[key];
    merged[key] = prior ? `${prior} ${next}` : next;
  }
  return merged;
}

/** Theme layer on `nsh/base` TextView. Parsing stays in base. */
export type TextViewProps = BaseTextViewProps;

function View(props: TextViewProps) {
  const [, rest] = split(props, ["classes", "class", "style"]);
  return (
    <BaseTextView
      {...rest}
      class={props.class}
      style={props.style}
      classes={mergeClasses(textViewLinkClasses, props.classes)}
    />
  );
}

/** A Markdown, HTML or block document. */
export const TextView = Object.assign(View, {
  parse: BaseTextView.parse,
  parseHtml: BaseTextView.parseHtml,
  plainText: BaseTextView.plainText,
});

export type { TextViewDocument };
