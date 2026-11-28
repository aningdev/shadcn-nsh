# Avatar (/docs/components/avatar)

## Installation [#installation]

```npm
npx shadcn-nsh@latest add avatar
```

As a TSX module, added once per app — nothing is copied into it:

```sh
nsh add github:aningdev/shadcn-nsh
```

```tsx
import { Avatar } from "shadcn-nsh/avatar";
```

## Usage [#usage]

```tsx
import { Avatar, AvatarBadge, AvatarGroup, AvatarGroupCount } from "@/components/ui/avatar";
```

```tsx
<Avatar name="Ada Lovelace" style={{ width: 36, height: 36 }} />
```

## Composition [#composition]

Use the following composition to build an `Avatar`:

```text
Avatar
└── AvatarBadge

AvatarGroup
├── Avatar
└── AvatarGroupCount
```

## Examples [#examples]

### Initials [#initials]

`name` picks a stable hue via `avatarIdentity`.

```tsx
<Avatar name="Alan Turing" style={{ width: 40, height: 40 }} />
```

### Picture [#picture]

`src` is the picture; `name`'s initials cover it while it loads, and stay if it never arrives.

```tsx
const portraits = { ada: "https://example.com/ada.png" };

<Avatar name="Ada Lovelace" src={portraits.ada} style={{ width: 40, height: 40 }} />;
```

### Broken image [#broken-image]

A picture that fails to load leaves the initials on the ring, as a gone picture should.

```tsx
<Avatar name="Ada Lovelace" src="/missing.png" />
```

### Group [#group]

`AvatarGroup` shows the first `limit` and overlaps them (`-space-x-2`). `AvatarGroupCount` is the overflow circle's text. Size each `Avatar` the same, and size the overflow with `overflowStyle`.

```tsx
<AvatarGroup
  limit={3}
  overflowAccessibilityLabel="5 more people"
  overflow={<AvatarGroupCount>+5</AvatarGroupCount>}
>
  <Avatar name="Ada Lovelace" style={{ width: 36, height: 36 }} />
  <Avatar name="Grace Hopper" style={{ width: 36, height: 36 }} />
</AvatarGroup>
```

### Presence [#presence]

`AvatarBadge` sits on the avatar's end-bottom corner. Pass its color; say the presence in `accessibilityLabel`. The avatar does not clip it.

```tsx
<Avatar
  name="Ada Lovelace"
  accessibilityLabel="Ada Lovelace, online"
  style={{ width: 36, height: 36 }}
>
  <AvatarBadge style={{ backgroundColor: colors.success }} />
</Avatar>
```

## API [#api]

Uses `avatarIdentity` for a named fallback's colors. Every prop of [`nsh/base` Avatar](https://nsh.dev/elements/avatar) passes through on `Avatar`, and every prop of [`nsh/base` AvatarGroup](https://nsh.dev/elements/avatar) on `AvatarGroup` (`limit`, `total`, `overflow`, `overflowAccessibilityLabel`).

| Part               | Props                        | Description                                                                |
| ------------------ | ---------------------------- | -------------------------------------------------------------------------- |
| `Avatar`           | `name`, `src`                | A round picture or name-colored initials on the identity ring.             |
| `AvatarGroup`      | `limit`, `total`, `overflow` | The first few avatars, overlapped; the rest are `overflow`.                |
| `AvatarGroupCount` | —                            | The overflow's count, tabular and muted.                                   |
| `AvatarBadge`      | —                            | A presence circle at the end-bottom corner, ringed in the page background. |