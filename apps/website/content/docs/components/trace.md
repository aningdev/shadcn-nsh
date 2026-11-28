---
title: Trace
description: An agent's steps, one line each — reasoning, a tool call, a source, a failed step — where a line can open onto what it did.
component: true
demo: trace
---

## Installation

```npm
npx shadcn-nsh@latest add trace
```

As a TSX module, added once per app — nothing is copied into it:

```sh
nsh add github:aningdev/shadcn-nsh
```

```tsx
import { Trace } from "shadcn-nsh/trace";
```

## Usage

```tsx
import {
  Trace,
  TraceCollapsible,
  TraceCollapsibleContent,
  TraceCollapsibleTrigger,
  TraceDescription,
  TraceIcon,
  TraceLine,
  TraceTitle,
} from "@/components/ui/trace";
```

```tsx
<Trace>
  <TraceLine status="running">
    <TraceIcon>
      <Icon icon={Globe} size={16} tint={colors.mutedForeground} />
    </TraceIcon>
    <TraceTitle>Searching the web</TraceTitle>
  </TraceLine>
</Trace>
```

## Composition

Use the following composition to build a `Trace`:

```text
Trace
├── TraceLine
│   ├── TraceIcon
│   ├── TraceTitle
│   └── TraceDescription
└── TraceCollapsible
    ├── TraceCollapsibleTrigger
    │   └── TraceLine
    └── TraceCollapsibleContent
```

## Examples

### Reasoning

A reasoning line counts while the model thinks (`status="running"`: a `Spinner` in the icon slot, the title pulsing) and then reads what it took. The pulse stands still when the user asks for less motion. It opens onto the text. `open` with `onOpenChange` lets the app open it when the thought is done.

```tsx
<Trace>
  <TraceCollapsible open={open()} onOpenChange={(event) => open.set(event.open)}>
    <TraceCollapsibleTrigger>
      <TraceLine status={thinking() ? "running" : undefined}>
        <TraceIcon>
          <Icon icon={Brain} size={16} tint={colors.mutedForeground} />
        </TraceIcon>
        <TraceTitle>{thinking() ? "Thinking…" : "Thought for"}</TraceTitle>
        <TraceDescription>{seconds()} s</TraceDescription>
      </TraceLine>
    </TraceCollapsibleTrigger>
    <TraceCollapsibleContent>{thought}</TraceCollapsibleContent>
  </TraceCollapsible>
</Trace>
```

### A tool call

A call goes `pending` (dimmed), `running`, then done (no status), and opens onto what it did. The result is a [`CodeBlock`](./code-block): a search, a weather lookup and a code run are the same `Trace` with a different body — a list of [`Item`](./item)s, a card, a `CodeBlock` — not a card of their own. Disable the trigger until there is something to show.

```tsx
<TraceCollapsible open={open()} onOpenChange={(event) => open.set(event.open)}>
  <TraceCollapsibleTrigger disabled={call.state !== "done"}>
    <TraceLine
      status={
        call.state === "queued" ? "pending" : call.state === "running" ? "running" : undefined
      }
    >
      <TraceIcon>
        <Icon icon={Terminal} size={16} tint={colors.mutedForeground} />
      </TraceIcon>
      <TraceTitle>Run code</TraceTitle>
      <TraceDescription>{call.note}</TraceDescription>
    </TraceLine>
  </TraceCollapsibleTrigger>
  <TraceCollapsibleContent>
    <CodeBlock size="sm">
      <CodeBlockContent>{call.code}</CodeBlockContent>
    </CodeBlock>
  </TraceCollapsibleContent>
</TraceCollapsible>
```

### Sources

A `TraceLine` with `onPress` is a pressable: it takes the text color under the pointer and the focus ring with the keyboard on it. Use it for a source that opens a page.

```tsx
<Trace>
  <TraceLine onPress={() => openUrl(source.url)}>
    <TraceIcon>
      <Icon icon={FileText} size={16} tint={colors.mutedForeground} />
    </TraceIcon>
    <TraceTitle>{source.title}</TraceTitle>
    <TraceDescription>{source.site}</TraceDescription>
  </TraceLine>
</Trace>
```

### A failed step

`status="error"` takes the destructive role for the title and the chevron; tint the icon with `colors.destructive` yourself, since an `Icon` draws in the tint it is given. A failed call opens onto its log in a destructive `CodeBlock`.

```tsx
<TraceCollapsible defaultOpen>
  <TraceCollapsibleTrigger>
    <TraceLine status="error">
      <TraceIcon>
        <Icon icon={CircleAlert} size={16} tint={colors.destructive} />
      </TraceIcon>
      <TraceTitle>Run code failed</TraceTitle>
      <TraceDescription>exit 1</TraceDescription>
    </TraceLine>
  </TraceCollapsibleTrigger>
  <TraceCollapsibleContent>
    <CodeBlock size="sm" variant="destructive">
      <CodeBlockContent wrap>{log}</CodeBlockContent>
    </CodeBlock>
  </TraceCollapsibleContent>
</TraceCollapsible>
```

## API

Every prop of [`nsh` View](https://nsh.dev/elements/view) passes through on every part but `TraceTitle` and `TraceDescription` (a [`nsh` Text](https://nsh.dev/elements/text)), `TraceCollapsible` (the props below) and `TraceCollapsibleContent` (`nsh/base`'s Collapsible); `style` goes over the look's.

| Part                      | Props                                                                                              | Description                                                                                                     |
| ------------------------- | -------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `Trace`                   | —                                                                                                  | The column of steps.                                                                                            |
| `TraceLine`               | `status`: `"running" \| "pending" \| "error"` (default none: done); `onPress`: `() => void`        | One step. With `onPress` it is a pressable. `running` pulses the title, `pending` dims, `error` is destructive. |
| `TraceIcon`               | —                                                                                                  | The icon slot, the theme's middle icon square; a `Spinner` while the line is `running`.                         |
| `TraceTitle`              | —                                                                                                  | What the step is doing or did: one line, cut with an ellipsis.                                                  |
| `TraceDescription`        | —                                                                                                  | A quieter note: a duration, a count; digits do not jump.                                                        |
| `TraceCollapsible`        | `open`: `boolean`; `defaultOpen`: `boolean`; `onOpenChange`: `(event: { open, reason }) => void`   | A line and what it opens onto; owns whether it is open.                                                         |
| `TraceCollapsibleTrigger` | `disabled`: `boolean`; `accessibilityLabel`; `style`, `hoverStyle`, `focusVisibleStyle`            | The pressable row: a `TraceLine` and a chevron that turns a quarter as it opens.                                |
| `TraceCollapsibleContent` | `children`: `string \| JSX.Element` (a string is muted text); `reveal`: `boolean` (default `true`) | The panel under the line.                                                                                       |
