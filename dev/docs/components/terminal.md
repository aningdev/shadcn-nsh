# Terminal (/dev/docs/components/terminal)

## Installation [#installation]

```npm
npx shadcn-nsh@latest add terminal
```

As a TSX module, added once per app — nothing is copied into it:

```sh
nsh add github:aningdev/shadcn-nsh
```

```tsx
import { Terminal } from "shadcn-nsh/terminal";
```

## Usage [#usage]

```tsx
import { Terminal, type TerminalRef } from "@/components/ui/terminal";
```

```tsx
let term: TerminalRef | undefined;

<Terminal
  ref={(r) => (term = r)}
  accessibilityLabel="Shell"
  onData={({ data }) => program.write(data)}
  onResize={({ cols, rows }) => program.resize(cols, rows)}
/>;
```

The terminal starts nothing: `term.write(bytes)` shows what the program printed, `onData` carries what the user typed or pasted (keys the program expects, the emulator's answers included), and `onResize` reports the size in cells. `term.reset()` clears the screen and the scrollback, `term.text()` gives every line, `term.focus()` takes the keyboard.

## Examples [#examples]

### A terminal in the page [#a-terminal-in-the-page]

The default: a well of the field's fill and edge, the theme's inner corners and a padding, so a
terminal sits beside the other controls.

```tsx
<Terminal ref={(r) => (term = r)} accessibilityLabel="Shell" style={{ height: 320 }} />
```

### An app whose window is the terminal [#an-app-whose-window-is-the-terminal]

`variant="ghost"` draws no fill, no edge, no padding and no corners: the app's own surface is the
frame, and the terminal covers it.

```tsx
<View class="bg-background flex-1">
  <Terminal variant="ghost" ref={(r) => (term = r)} accessibilityLabel="Shell" class="flex-1" />
</View>
```

### A real program [#a-real-program]

A terminal is a stream of bytes in and out; the app owns both ends.

- **On the desktop**, a pseudo-terminal: the app spawns the shell in a pty (`portable-pty` in Rust,
  a native pty module in TypeScript), reads the master side into `term.write(chunk)` and sends
  `onData`'s payload back to it. The size `onResize` reports is the pty's window size.
- **On the web**, a WebSocket to a shell service: `socket.onmessage` writes the socket's bytes,
  `onData` and `onResize` send them the other way.
- **A remote session** (`ssh`, a container's exec stream) fills the same two directions.

Nothing of that is the terminal's: it interprets the escape sequences it is given and draws them
with the platform's text engine. NSH's [Terminal](https://nsh.dev/elements/terminal) documents the
escape sequences it understands and how a Rust app replaces the emulator (`TerminalEmulatorFactory`).

## API [#api]

Every prop of [`nsh/base` Terminal](https://nsh.dev/elements/terminal) passes through, and so does
its ref (`TerminalRef`): `write`, `reset`, `text`, `focus`. `class`, `style`, `cursorClass` and
`cursorStyle` go over the look's, so an app gives the cursor its shape (`w-0.5`) and moves the
padding where it needs another.

The 16 ANSI colors are NSH's own palette; text a program leaves uncolored is the theme's
`foreground`, and cells it leaves without a background show the terminal's own surface.

| Part       | Props                                                                                                      | Description                                                                                |
| ---------- | ---------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| `Terminal` | `variant`, and every `nsh/base` Terminal prop (`onData`, `onResize`, `style`, …); the ref is `TerminalRef` | A program's output on the theme's field surface; `variant="ghost"` draws no surface at all |