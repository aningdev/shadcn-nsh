---
layout: ../../../layouts/Docs.astro
title: Input
description: A sunk text field — single-line, multiline, masked, or invalid.
component: true
demo: input
---

## Installation

```sh
npx shadcn-nsh@latest add input
```

## Usage

```tsx
import { Input } from "@/components/ui/input";
```

```tsx
<Input value={name()} onChange={({ value }) => name.set(value)} placeholder="Ada Lovelace" />
```

## Examples

### Multiline

```tsx
<Input multiline value={notes()} onChange={({ value }) => notes.set(value)} />
```

### Invalid

```tsx
<Input invalid value={email()} />
```

### Read-only and disabled

```tsx
<Input value="Ada" readonly />
<Input value="Ada" disabled />
```

### The look alone

```tsx
<Input {...inputLook({ invalid: true })} />
```

## API

Every prop of [`nsh/base` Input](https://nsh.dev/elements/input) passes through. `class`, `style` and `disabledStyle` go over the look's. Focus and hover edges are classes on the look.

| Prop      | Type      | Default |
| --------- | --------- | ------- |
| `invalid` | `boolean` |         |
