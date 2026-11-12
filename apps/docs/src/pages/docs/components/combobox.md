---
title: Combobox
description: A searchable field with a list of choices, on the shared listbox look.
component: true
demo: combobox
---

## Installation

```sh
npx shadcn-nsh@latest add combobox
```

## Usage

```tsx
import { Combobox, ComboToggle } from "@/components/ui/combobox";
```

```tsx
<Combobox
  items={items}
  value={value}
  onChange={({ value }) => setValue(value)}
  triggerButton={<ComboToggle open={open} />}
/>
```

## API

Defaults from `comboboxLook` and `listboxProps`. Every prop of [`nsh/base` Combobox](https://nsh.dev/elements/combobox) passes through.
