---
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

## API

| Export              | Role                         |
| ------------------- | ---------------------------- |
| `richEditorClasses` | `RichEditor` document chrome |
| `RichEditor`        | Themed `nsh/base` RichEditor |
| `Editor`            | Pass-through code `Editor`   |
