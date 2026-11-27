---
title: Toast
description: A raised banner with a title, optional description, action and close.
component: true
demo: toast
---

## Installation

```npm
npx shadcn-nsh@latest add toast
```

## Usage

```tsx
import { toast, Toaster } from "@/components/ui/toast";
```

```tsx
toast("Copied", { description: "The link is on the clipboard." });

// Once, at the root.
<Toaster />;
```

## Examples

### Action

```tsx
toast("Deleted", {
  description: "Undo to restore.",
  action: { label: "Undo", onClick: () => {} },
});
```

### From code

`toast` follows sonner. It returns an id. The same id replaces the toast that held it. `update` changes one where it is, which is how a loading note becomes its result — sonner does that by calling `toast` again with the same id, and this queue also has `toast.update` so the entrance does not restart. `progress` (0 to 1) is the bar under the text; sonner has none.

```tsx
const id = toast.loading("Uploading 3 photos", {
  description: "0 of 3",
  progress: 0,
  duration: Infinity,
});
toast.update(id, { progress: 1, type: "success", title: "3 photos uploaded", duration: 4000 });
toast.dismiss(id);
```

An action's `onClick` runs when it is pressed, and `onDismiss` hears that action's label — or `null` when the toast leaves any other way.

## API

Every prop of [`nsh/base` Toast](https://nsh.dev/elements/toast) passes through. `style` goes over the banner's own look.

| Part            | Props                                                                                     | Description                                                                            |
| --------------- | ----------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| `Toast`         | `title`, `description`, `children`, and every `nsh/base` Toast prop                       | A raised banner; without children it draws `title` and `description`                   |
| `toast`         | `(title, options?)` → `string`                                                            | Shows one. `success`, `error`, `warning`, `info`, `loading` set `type`                 |
| `options`       | `id`, `description`, `duration`, `type`, `action`, `closeButton`, `progress`, `onDismiss` | `duration` defaults to 4000; `Infinity` stays. `closeButton: true` is labelled "Close" |
| `toast.update`  | `(id, change) → boolean`                                                                  | Changes a toast in place. `null` clears `description`, `action` or `progress`          |
| `toast.dismiss` | `(id?)`                                                                                   | Closes one toast, or every toast when `id` is omitted                                  |
| `Toaster`       |                                                                                           | The stack at the foot of the window. Mount it once                                     |

Without `children`, `Toast` draws `title` and `description`. An action and a close button are `toast`'s `action` and `closeButton`.
