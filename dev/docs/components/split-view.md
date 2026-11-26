# SplitView (/dev/docs/components/split-view)

## Installation [#installation]

```npm
npx shadcn-nsh@latest add split-view
```

## Usage [#usage]

```tsx
import { createNavStack, NavPage, NavStack } from "@/components/ui/nav-stack";
import {
  SplitView,
  SplitViewContent,
  SplitViewDetail,
  SplitViewSidebar,
  SplitViewTrigger,
} from "@/components/ui/split-view";
```

```tsx
const folders = createNavStack(["folders"]);
const notes = createNavStack(["notes"]);
const note = createNavStack(["note"]);

<SplitView
  style={{ flex: 1 }}
  columnVisibility={visibility()}
  onColumnVisibilityChange={({ columnVisibility }) => visibility.set(columnVisibility)}
  sidebar={
    <NavStack state={folders}>
      {() => <SplitViewSidebar title="Folders">{/* the folders */}</SplitViewSidebar>}
    </NavStack>
  }
  content={
    <NavStack state={notes}>
      {() => (
        <SplitViewContent
          title="Inbox"
          leading={
            <SplitViewTrigger
              columnVisibility={visibility()}
              onColumnVisibilityChange={({ columnVisibility }) => visibility.set(columnVisibility)}
            />
          }
        >
          {/* the notes */}
        </SplitViewContent>
      )}
    </NavStack>
  }
  detail={
    <NavStack state={note}>
      {() => <SplitViewDetail title="Design review">{/* the note */}</SplitViewDetail>}
    </NavStack>
  }
/>;
```

`sidebar`, `content` and `detail` stay props, and each one is a `NavStack`. The platform finds that stack in the slot, so these parts are the pages inside it, not wrappers around it. Leave `content` out for two columns.

## Composition [#composition]

Use the following composition to build a `SplitView`:

```text
SplitView
├── SplitViewSidebar
├── SplitViewContent
│   └── SplitViewTrigger
└── SplitViewDetail
```

## Examples [#examples]

The behavior — which columns show, the phone collapsing to one, the system's sidebar button on iOS — is NSH's [`SplitView`](https://nsh.dev/elements/split-view). This component is that view, plus the column's surface, the header a desktop draws, and the button that hides the sidebar.

The columns' widths are the platform's. Panes the user resizes are [`Resizable`](./resizable).

### Three columns [#three-columns]

Each column is a stack of its own, so pushing a page in the detail leaves the sidebar and the list where they are. `SplitViewSidebar` is the sidebar's fill (`colors.background`) with a hairline of `colors.line` after it. `SplitViewContent` is the page's fill with `colors.line` after it. `SplitViewDetail` has no hairline. iOS draws the columns' own edges, so the hairlines are left out there.

```tsx
<SplitViewSidebar title="Folders">{/* rows */}</SplitViewSidebar>
```

### The sidebar button [#the-sidebar-button]

`SplitViewTrigger` hides the sidebar (`"doubleColumn"`) or shows every column (`"all"`). It does not show or hide anything itself: the app sets `columnVisibility`, the same value the split takes. The glyph stays `colors.mutedForeground`; the button is selected while the sidebar is showing. iOS draws the system's sidebar button, so leave this one out there.

```tsx
<SplitViewContent
  title="Inbox"
  leading={
    <SplitViewTrigger
      columnVisibility={visibility()}
      onColumnVisibilityChange={({ columnVisibility }) => visibility.set(columnVisibility)}
    />
  }
>
  {/* the notes */}
</SplitViewContent>
```

`leading` and `trailing` are the header's items. On a desktop they sit in the bar; on iOS and Android they are the system header's leading and trailing buttons.

### On a phone [#on-a-phone]

Where the window is horizontally compact, one column shows: the first that `columnVisibility` includes. A choice that should bring the next column in front sets `"doubleColumn"`, then `"detailOnly"`. The way back is the page's — a button in `leading`, since a desktop has no system back between columns.

```tsx
const compact = () => horizontalSizeClass() === "compact";

<SplitViewDetail
  title={note()}
  leading={
    compact() ? (
      <BackButton title={folder()} onPress={() => visibility.set("doubleColumn")} />
    ) : undefined
  }
>
  {/* the note */}
</SplitViewDetail>;
```

### Controlled [#controlled]

`columnVisibility` is the app's. `"automatic"` (the view's own starting value, when the prop is left out) shows every column except where iPadOS decides, and the sidebar where the room is compact. `"all"`, `"doubleColumn"` and `"detailOnly"` are the other values. `onColumnVisibilityChange` reports what the user or the system shows instead — the sidebar button, a swipe from the edge, going back from a column's first page on a phone.

```tsx
const visibility = signal<ColumnVisibility>("all");

<SplitView
  columnVisibility={visibility()}
  onColumnVisibilityChange={({ columnVisibility }) => visibility.set(columnVisibility)}
  sidebar={sidebar}
  detail={detail}
/>;
```

## API [#api]

`SplitView` takes every prop of [`nsh/base`'s SplitView](https://nsh.dev/elements/split-view); `style` goes over the look's. A column page takes every prop of [`nsh/base`'s NavPage](https://nsh.dev/elements/nav-stack); `style` goes over the column's. `ColumnVisibility` is `nsh/base`'s, re-exported.

| Part               | Props                                                                | Description                                                     |
| ------------------ | -------------------------------------------------------------------- | --------------------------------------------------------------- |
| `SplitView`        | `sidebar`, `content`, `detail`, `columnVisibility`                   | The columns. `content` is optional: without it the view has two |
| `SplitViewSidebar` | `title`, `leading`, `trailing`, `header`                             | The sidebar's page: its fill, a hairline after it               |
| `SplitViewContent` | `title`, `leading`, `trailing`, `header`                             | The middle page: the page's fill, a hairline after it           |
| `SplitViewDetail`  | `title`, `leading`, `trailing`, `header`                             | The detail's page: the page's fill                              |
| `SplitViewHeader`  | `column`, `title`, `leading`, `trailing`                             | The bar a desktop draws. `header` on a column page replaces it  |
| `SplitViewTrigger` | `columnVisibility`, `onColumnVisibilityChange`, `accessibilityLabel` | The sidebar button. A press reports `"doubleColumn"` or `"all"` |

The looks — spread them on the views they name: `splitViewLook()` (`root`), `splitViewColumnLook(column)` (`page`), `splitViewHeaderLook(column)` (`bar`, `title`) and `splitViewTriggerLook()` (`style`, `hoverStyle`, `activeStyle`, `focusVisibleStyle`, `glyph`).