---
title: Command
description: A search palette with sectioned, virtualized rows.
component: true
demo: command
---

## Installation

```sh
npx shadcn-nsh@latest add command
```

## Usage

```tsx
import { Command } from "@/components/ui/command";
```

```tsx
<Command items={items} onSelect={({ id }) => {}} />
```

## API

Uses `commandClasses`, `CommandRow`, `CommandHeading`, and `CommandEmpty` by default. Every prop of [`nsh/base` Command](https://nsh.dev/elements/command) passes through.
