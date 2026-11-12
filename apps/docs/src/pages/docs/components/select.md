---
title: Select
description: A list of choices from a field trigger, on the shared listbox look.
component: true
demo: select
---

## Installation

```sh
npx shadcn-nsh@latest add select
```

## Usage

```tsx
import { OptionRow, Picker, Select } from "@/components/ui/select";
```

```tsx
<Select
  items={items}
  value={value}
  onChange={({ value }) => setValue(value)}
  trigger={<Picker title={title} open={open} />}
  renderItem={(item) => <OptionRow item={item} />}
/>
```

## API

Defaults from `listboxProps` and `OptionRow`. Pass a `Picker` (or any view) as `trigger`. Every prop of [`nsh/base` Select](https://nsh.dev/elements/select) passes through.
