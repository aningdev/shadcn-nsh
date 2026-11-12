---
layout: ../../../layouts/Docs.astro
title: Editor
description: Rich document typography and a code editor pass-through.
component: true
demo: editor
---

## Installation

```sh
npx shadcn-nsh@latest add editor
```

## Usage

```tsx
import { createRichEditor, StarterKit } from "nsh/base";

import { RichEditor, richEditorClasses, Editor } from "@/components/ui/editor";
```

```tsx
const session = createRichEditor({ extensions: [StarterKit], content: doc, format: "markdown" });

<RichEditor editor={session} style={{ height: 240 }} />;
```

`RichEditor` defaults `classes` to `richEditorClasses`. `Editor` forwards every prop to [`nsh/base` Editor](https://nsh.dev/elements/editor) unchanged.

## Examples

### Rich document

`RichEditor` wears `richEditorClasses`; the session comes from `createRichEditor`.

```tsx
const session = createRichEditor({ extensions: [StarterKit], content: doc, format: "markdown" });

<RichEditor editor={session} accessibilityLabel="Notes" style={{ height: 180 }} />;
```

### Code

`Editor` is `nsh/base`'s code editor unchanged.

```tsx
<Editor value={source()} language="ts" onChange={({ value }) => setSource(value)} />
```

## API

| Export              | Role                         |
| ------------------- | ---------------------------- |
| `richEditorClasses` | `RichEditor` document chrome |
| `RichEditor`        | Themed `nsh/base` RichEditor |
| `Editor`            | Pass-through code `Editor`   |
